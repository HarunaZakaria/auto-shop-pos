const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const ROLES = ["admin", "cashier", "manager"];

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true, lowercase: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true, unique: true, sparse: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ROLES, default: "cashier", required: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

userSchema.methods.setPassword = async function (password) {
  this.passwordHash = await bcrypt.hash(password, 10);
};

userSchema.methods.verifyPassword = function (password) {
  return bcrypt.compare(password, this.passwordHash);
};

userSchema.methods.toSafeJSON = function () {
  return {
    id: this._id,
    username: this.username,
    name: this.name,
    email: this.email,
    role: this.role,
    active: this.active,
    createdAt: this.createdAt,
  };
};

userSchema.statics.ROLES = ROLES;

module.exports = mongoose.model("User", userSchema);
