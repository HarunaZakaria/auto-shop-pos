const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const { signToken } = require("../utils/token");

// POST /api/auth/login
exports.login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username: username.toLowerCase() });
  if (!user || !user.active || !(await user.verifyPassword(password))) {
    res.status(401);
    throw new Error("Invalid username or password");
  }
  res.json({ token: signToken(user), user: user.toSafeJSON() });
});

// POST /api/auth/register   (admin-only, route enforces)
exports.register = asyncHandler(async (req, res) => {
  const { username, name, email, password, role } = req.body;
  const exists = await User.findOne({ username: username.toLowerCase() });
  if (exists) {
    res.status(409);
    throw new Error("Username already taken");
  }
  const user = new User({ username, name, email, role });
  await user.setPassword(password);
  await user.save();
  res.status(201).json(user.toSafeJSON());
});

// GET /api/auth/me
exports.me = asyncHandler(async (req, res) => {
  res.json(req.user.toSafeJSON());
});
