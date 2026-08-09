const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    StudentID: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    year: { type: String, required: true },
    phone: { type: String, required: true },
    department: { type: String, required: true },
    course: { type: String, required: true },
    isActive: { type: Boolean, default: true }
});

module.exports = mongoose.model("User", userSchema);
