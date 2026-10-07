const User = require("../model/ProfModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const SECRET_KEY = "mysecretkey";

//signup user
exports.signupProf = async (req, res) => {
  try {
    const { professorId, email, password, name, phone, department } = req.body;
    
    // Check for existing professor with same email or professorId
    const existingProf = await User.findOne({ 
      $or: [{ email }, { professorId }]
    });

    if (existingProf) {
      return res.status(400).json({ 
        message: existingProf.email === email 
          ? "Email already registered" 
          : "Professor ID already exists"
      });
    }

    // Password validation
    if (password.length < 8 || password.length > 16) {
      return res.status(400).json({ message: "Password must be between 8 and 16 characters" });
    }
    if (!/[A-Z]/.test(password)) {
      return res.status(400).json({ message: "Password must contain at least one uppercase letter" });
    }
    if (!/[0-9]/.test(password)) {
      return res.status(400).json({ message: "Password must contain at least one number" });
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return res.status(400).json({ message: "Password must contain at least one special character" });
    }

    // Email validation
    if (!email.endsWith('@phinmaed.com')) {
      return res.status(400).json({ message: "Email must be a @phinmaed.com address" });
    }

    const newUser = new User({
      professorId,
      email,
      password,
      name,
      phone,
      department
    });

    await newUser.save();
    res.status(201).json({ 
      message: "Professor account created successfully",
      user: {
        professorId: newUser.professorId,
        email: newUser.email,
        name: newUser.name,
        department: newUser.department
      }
    });
  } catch (err) {
    console.error('Error in signupProf:', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: "Missing required fields" });
    }
    res.status(500).json({ message: "Server error" });
  }
};
////
// Login professor
exports.loginProf = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Username or Password is incorrect" });

    const token = jwt.sign(
      { 
        id: user._id, 
        email: user.email,        // ✅ lowercase 'email'
        userType: 'professor'     // ✅ add role info
      },
      SECRET_KEY || "mysecretkey",
      { expiresIn: "24h" }
    );

    // ✅ SEND USER INFO IN RESPONSE
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        userType: 'professor',
        department: user.department,
        professorId: user.professorId
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

//get all Teachers
exports.getAllProf = async (req, res) => {
  try {
    const users = await User.find().select("-password") || [];
    res.json(users);

  } catch (err) {
    console.error('Error in getAllProf:', err);
    res.status(500).json({ error: err.message });
  }
};

//get Teachers profile
exports.getProfProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update password
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Find professor and include password
    const professor = await User.findById(req.user.id);
    if (!professor) {
      return res.status(404).json({ message: "Professor not found" });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, professor.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Validate new password
    if (newPassword.length < 8 || newPassword.length > 16) {
      return res.status(400).json({ message: "Password must be between 8 and 16 characters" });
    }
    if (!/[A-Z]/.test(newPassword)) {
      return res.status(400).json({ message: "Password must contain at least one uppercase letter" });
    }
    if (!/[0-9]/.test(newPassword)) {
      return res.status(400).json({ message: "Password must contain at least one number" });
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
      return res.status(400).json({ message: "Password must contain at least one special character" });
    }

    // Hash new password and update
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    professor.password = hashedPassword;
    await professor.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    console.error('Error updating password:', err);
    res.status(500).json({ message: "Failed to update password" });
  }
};

//update user profile
exports.updateProfProfile = async (req, res) => {
  try {
    const updates = req.body;
    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Logout user
exports.logoutProf = async (_req, res) => {
  try {
    res.status(200).json({ message: "Logout successful."});
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};