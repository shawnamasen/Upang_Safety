const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const ProfSchema = new mongoose.Schema({
    professorId: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    department: { type: String, required: true }
});

// ✅ Hash password before saving
ProfSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  console.log("⏳ Hashing password for:", this.email);
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// ✅ Add password comparison method
ProfSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("Prof", ProfSchema);