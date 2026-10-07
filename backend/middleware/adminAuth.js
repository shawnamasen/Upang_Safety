const adminAuth = (req, res, next) => {
  // For testing, you can pass admin token in header
  // In production, verify JWT tokens
  const adminToken = req.headers["authorization"];
  
  if (adminToken === "Bearer admin-token-12345") {
    next();
  } else {
    res.status(403).json({ message: "Admin access required" });
  }
};

module.exports = { adminAuth };