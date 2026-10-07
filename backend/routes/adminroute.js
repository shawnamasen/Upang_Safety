const express = require("express");
const router = express.Router();
const AdminController = require("../controller/AdminController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/signup", AdminController.createAdmin);
router.post("/login", AdminController.loginAdmin);
router.get("/profile", authMiddleware, AdminController.getProfile);
router.patch("/profile", authMiddleware, AdminController.updateProfile);
router.patch("/update-password", authMiddleware, AdminController.updatePassword);
router.post("/logout", AdminController.logoutAdmin);

module.exports = router;