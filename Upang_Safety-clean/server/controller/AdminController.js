const Admin = require("../model/AdminModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


const SECRET_KEY  = "mysecretkey";

// Get admin profile
exports.getProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id).select('-password');
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    res.json(admin);
  } catch (err) {
    console.error('Error fetching admin profile:', err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update admin profile
exports.updateProfile = async (req, res) => {
  try {
    const { fullName } = req.body;
    if (!fullName) {
      return res.status(400).json({ message: "Full name is required" });
    }

    const admin = await Admin.findById(req.user.id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    admin.fullName = fullName;
    await admin.save();

    res.json({ message: "Profile updated successfully", admin: { email: admin.email, fullName: admin.fullName } });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ message: "Server error" });
  }
};

const validatePassword = (password) => {
  const minLength = 8;
  const maxLength = 16;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  if (password.length < minLength || password.length > maxLength) {
      return 'Password must be between 8 and 16 characters long';
  }
  if (!hasUpperCase) {
      return 'Password must contain at least one uppercase letter';
  }
  if (!hasNumber) {
      return 'Password must contain at least one number';
  }
  if (!hasSpecialChar) {
      return 'Password must contain at least one special character';
  }
  return null;
};

// Create admin account
exports.createAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Validate email domain
    if (!email.endsWith('@phinmaed.com')) {
      return res.status(400).json({ message: "Only @phinmaed.com email addresses are allowed" });
    }

    // Validate password
    const passwordError = validatePassword(password);
    if (passwordError) {
      return res.status(400).json({ message: passwordError });
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin account already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new admin
    const newAdmin = new Admin({
      email,
      password: hashedPassword
    });

    await newAdmin.save();

    res.status(201).json({ message: "Admin account created successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
//Admin login
exports.loginAdmin = async (req, res) => {
  try {
    const admin = await Admin.findOne({ email: req.body.email });
    if (!admin) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(req.body.password, admin.password);
    if (!isMatch) return res.status(400).json({ message: "Username or Password is incorrect" });

    const token = jwt.sign(
      { id: admin._id, Email: admin.email },
      SECRET_KEY || "mysecretkey",
      { expiresIn: "1h" }
    );

    res.status(200).json({ message: "Login successful", token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

//update admin password
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Validate new password
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      return res.status(400).json({ message: passwordError });
    }

    // Use the admin ID from the auth token
    const admin = await Admin.findById(req.user.id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({ message: "You are already using this password. Use a different password" });
    }

    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash(newPassword, salt);

    await admin.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    console.error('Password update error:', err);
    res.status(500).json({ message: err.message || "Server error" });
  }
};

// ✅ Logout user
exports.logoutAdmin = async (_req, res) => {
  try {
    res.status(200).json({ message: "Logout successful."});
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};