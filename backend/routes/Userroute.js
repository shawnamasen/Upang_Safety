const express = require("express");
const router = express.Router();
const UserController = require("../controller/Usercontroller");
const authMiddleware = require("../middleware/authMiddleware");

// Public routes
router.post("/signup", UserController.signupUser);
router.post("/login", UserController.loginUser);
router.post("/logout", UserController.logoutUser);
router.post("/signup-professor", UserController.signupProfessor);

// Protected routes (require auth)
router.get("/profile", authMiddleware, UserController.getUserProfile);
router.put("/profile/update-password", authMiddleware, UserController.updatePassword);

// Admin routes (no auth middleware)
router.get("/allusers", UserController.getAllUsers);
router.put("/:id", UserController.adminUpdateUser);
router.delete("/:id", UserController.deactivateUser);
router.post("/admin/:id/activate", UserController.activateUser);

module.exports = router;