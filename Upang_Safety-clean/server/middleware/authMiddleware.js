const jwt = require('jsonwebtoken');
const User = require('../model/Usermodel');
const Prof = require('../model/ProfModel');

// Middleware to verify JWT token
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    // Verify token
    const decoded = jwt.verify(token, 'mysecretkey');
    
    // Check if user exists in database based on userType
    let user;
    if (decoded.userType === 'professor') {
      user = await Prof.findOne({ _id: decoded.id }).select('-password');
      if (!user) {
        return res.status(401).json({ message: 'Professor not found.' });
      }
    } else {
      user = await User.findOne({ _id: decoded.id }).select('-password');
      if (!user) {
        return res.status(401).json({ message: 'User not found.' });
      }
    }

    // Add user info to request
    req.user = {
      ...decoded,
      userType: decoded.userType || 'student',
      isProfessor: decoded.userType === 'professor',
      user: user
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = authMiddleware;
