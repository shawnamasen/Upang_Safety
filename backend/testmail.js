require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmail() {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: `"PHINMA Report System" <${process.env.EMAIL_USER}>`,
      to: 'sham.figueroa.up@phinmaed.com', // 👈 change this to your actual PHINMA email
      subject: 'Test Email',
      text: 'This is a test from NodeMailer!',
    });

    console.log('✅ Test email sent:', info.response);
  } catch (err) {
    console.error('❌ Test email failed:', err);
  }
}

testEmail();
