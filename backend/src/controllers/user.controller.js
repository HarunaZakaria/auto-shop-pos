const asyncHandler = require("express-async-handler");
const User = require("../models/User");

exports.list = asyncHandler(async (_req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.json(users.map((u) => u.toSafeJSON()));
});

exports.update = asyncHandler(async (req, res) => {
  const { name, email, role, active, password } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  if (name !== undefined) user.name = name;
  if (email !== undefined) user.email = email;
  if (role !== undefined) user.role = role;
  if (active !== undefined) user.active = active;
  if (password) await user.setPassword(password);
  await user.save();
  res.json(user.toSafeJSON());
});

exports.remove = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  res.json({ ok: true });
});
