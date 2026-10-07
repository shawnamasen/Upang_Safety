const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const ProfController = require("../controller/ProfController");

// Login route
router.post("/login", ProfController.loginProf);
router.post("/signup", ProfController.signupProf);
router.get("/profile", authMiddleware, ProfController.getProfProfile);
router.get("/allprofs", ProfController.getAllProf);
router.post("/logout", ProfController.logoutProf);
router.put("/profile/update-password", authMiddleware, ProfController.updatePassword);
module.exports = router;