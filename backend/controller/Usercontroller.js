const User = require("../model/Usermodel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Prof = require("../model/ProfModel");

const SECRET_KEY = "mysecretkey";

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

// Signup user (student)
exports.signupUser = async (req, res) => {
  try {
    const { StudentID, email, password, name, year, phone, department, course } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) return res.status(400).json({ message: "User already exists" });
    
    const passwordError = validatePassword(password);
    if (passwordError) {
      return res.status(400).json({ message: passwordError });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ StudentID, email, password: hashedPassword, name, year, phone, department, course });
    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Login user (handles both student and professor)
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // First check if it's a professor
    const professor = await Prof.findOne({ email });
    console.log("🔍 Professor found in DB:", professor ? "YES" : "NO", professor?.email);

    if (professor) {
      console.log("📧 Email:", professor.email);
      console.log("🔑 Password hash length:", professor.password.length);
      const isMatch = await professor.comparePassword(password);
      console.log("✅ Password match:", isMatch);

      if (!isMatch) {
        return res.status(400).json({ message: "Username or Password is incorrect" });
      }

      const token = jwt.sign(
        { 
          id: professor._id, 
          email: professor.email,
          userType: 'professor',
          department: professor.department,
          isProfessor: true,
          professorId: professor.professorId
        },
        SECRET_KEY || "mysecretkey",
        { expiresIn: "24h" }
      );

      return res.status(200).json({
        message: "Login successful",
        token,
        user: {
          email: professor.email,
          id: professor._id,
          name: professor.name,
          userType: 'professor',
          department: professor.department,
          isProfessor: true,
          professorId: professor.professorId
        }
      });
    }

    // If not a professor, check if it's a regular user (student)
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Username or Password is incorrect" });
    }

    const token = jwt.sign(
      { 
        id: user._id, 
        email: user.email,
        userType: 'student',
        isProfessor: false
      },
      SECRET_KEY || "mysecretkey",
      { expiresIn: "24h" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        email: user.email,
        id: user._id,
        name: user.name,
        userType: 'student',
        isProfessor: false
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all users (students only) — with reportsCount placeholder
exports.getAllUsers = async (req, res) => {
  try {
    console.log(`UserController.getAllUsers invoked - requested by ${req.ip} origin=${req.headers.origin}`);
    // Only get active users (where isActive is true or not set)
    const users = await User.find({ 
      $or: [
        { isActive: true },
        { isActive: { $exists: false } }
      ]
    }).select("-password");
    
    const usersWithReports = users.map(user => ({
      ...user.toObject(),
      reportsCount: 0 // 🔁 TEMP placeholder
    }));
    res.json(usersWithReports);
  } catch (err) {
    console.error('Error in getAllUsers:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get user profile (student or professor)
exports.getUserProfile = async (req, res) => {
  try {
    console.log('Getting profile for:', req.user);
    
    let user;
    if (req.user.userType === 'professor') {
      user = await Prof.findById(req.user.id).select('-password');
      if (!user) {
        return res.status(404).json({ message: "Professor not found" });
      }
      user = user.toObject();
      user.userType = 'professor';
      user.isProfessor = true;
    } else {
      user = await User.findById(req.user.id).select('-password');
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      user = user.toObject();
      user.userType = 'student';
      user.isProfessor = false;
    }

    res.status(200).json(user);
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update password
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      return res.status(400).json({ message: passwordError });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    console.error('Error updating password:', err);
    res.status(500).json({ message: "Failed to update password" });
  }
};

// Update user profile (for self-edit)
exports.updateUserProfile = async (req, res) => {
  try {
    const updates = req.body;
    
    if (updates.password) {
      const passwordError = validatePassword(updates.password);
      if (passwordError) {
        return res.status(400).json({ message: passwordError });
      }
      updates.password = await bcrypt.hash(updates.password, 10);
    }
    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ NEW: Admin update user (by ID)
exports.adminUpdateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (updates.password) {
      const passwordError = validatePassword(updates.password);
      if (passwordError) {
        return res.status(400).json({ message: passwordError });
      }
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    const user = await User.findByIdAndUpdate(id, updates, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ NEW: Admin deactivate user (soft delete)
exports.deactivateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndUpdate(
      id, 
      { isActive: false }, 
      { new: true }
    ).select('-password');
    
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ NEW: Admin activate user
exports.activateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndUpdate(
      id, 
      { isActive: true }, 
      { new: true }
    ).select('-password');
    
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Logout user
exports.logoutUser = async (_req, res) => {
  try {
    res.status(200).json({ message: "Logout successful." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Professor signup (kept for reference)
exports.signupProfessor = async (req, res) => {
  try {
    const { professorId, email, password, name, phone, department } = req.body;

    const existingProf = await Prof.findOne({ 
      $or: [{ email }, { professorId }]
    });

    if (existingProf) {
      return res.status(400).json({ 
        message: "Professor already exists with this email or ID" 
      });
    }
    
    const passwordError = validatePassword(password);
    if (passwordError) {
      return res.status(400).json({ message: passwordError });
    }

    const newProf = new Prof({
      professorId,
      email,
      password,
      name,
      phone,
      department
    });

    await newProf.save();
    res.status(201).json({ message: "Professor registered successfully" });
  } catch (err) {
    console.error('Error in signupProfessor:', err);
    res.status(500).json({ 
      message: "Server error", 
      error: err.message 
    });
  }
};