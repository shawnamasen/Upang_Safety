const express = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const User = require("../model/Usermodel.js");

const router = express.Router();
const resetTokens = {}; // temporary store

// === FORGOT PASSWORD ===
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "Email not registered." });

    const token = crypto.randomBytes(32).toString("hex");
    resetTokens[token] = { email, expires: Date.now() + 2 * 60 * 1000 };

    const resetLink = `${process.env.CLIENT_URL}/reset-password/${token}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // ✅ Green PHINMA-themed email design
    const mailOptions = {
      from: `"PHINMA Report System" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Reset your PHINMA account password",
      html: `
        <div style="font-family: 'Poppins', Arial, sans-serif; background: linear-gradient(135deg, #e6f4ea, #f9fafb); padding: 40px 0;">
          <div style="max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 14px; box-shadow: 0 4px 14px rgba(0,0,0,0.08); overflow: hidden;">
            
            <!-- Header -->
            <div style="background-color: #16a34a; text-align: center; padding: 25px 15px;">
              <h1 style="margin: 0; color: #ffffff; font-size: 22px; letter-spacing: 0.5px;">
                PHINMA Safety & Report System
              </h1>
              <p style="margin: 4px 0 0; color: #d1fae5; font-size: 14px; letter-spacing: 0.5px;">
                Forgot Password Notification
              </p>
            </div>

            <!-- Body -->
            <div style="padding: 35px 45px; color: #333;">
              <p style="font-size: 16px; margin-bottom: 10px;">Hello, <strong>${user.name}</strong>,</p>
              <p style="font-size: 15px; line-height: 1.6; margin-bottom: 28px;">
                We received a request to reset your PHINMA account password. Please click the button below to securely create a new one.
              </p>

              <div style="text-align: center; margin-bottom: 30px;">
                <a href="${resetLink}" 
                  style="display: inline-block; background-color: #16a34a; color: #ffffff; padding: 14px 36px;
                        border-radius: 10px; font-weight: 600; text-decoration: none; font-size: 15px;
                        box-shadow: 0 4px 10px rgba(22,163,74,0.3); transition: background 0.3s;">
                  Reset My Password
                </a>
              </div>

              <p style="font-size: 14px; color: #555; line-height: 1.5;">
                ⚠️ This link will expire in <b>2 minutes</b> for security reasons.
                <br>If you didn’t request a password reset, you can safely ignore this email.
              </p>
            </div>

            <!-- Divider -->
            <div style="border-top: 1px solid #e5e7eb; margin: 0 40px;"></div>

            <!-- Footer -->
            <div style="background-color: #f9fafb; text-align: center; padding: 20px 15px; color: #888; font-size: 12px; line-height: 1.5;">
              <p style="margin: 0;">
                © ${new Date().getFullYear()} PHINMA University • Safety & Report System<br/>
                <a href="#" style="color: #16a34a; text-decoration: none;">Contact Support</a> |
                <a href="#" style="color: #16a34a; text-decoration: none;">Privacy Policy</a>
              </p>
            </div>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log(`✅ Email sent: ${info.response}`); // log the Gmail response

    res.json({ message: "Reset link sent! Check your PHINMA email inbox." });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

// === RESET PASSWORD ===
router.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;
    const data = resetTokens[token];

    if (!data || Date.now() > data.expires) {
      return res.status(400).json({ message: "Reset link expired or invalid." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.updateOne({ email: data.email }, { password: hashedPassword });
    delete resetTokens[token];

    res.json({ message: "Password reset successful!" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

module.exports = router;
