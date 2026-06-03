const router = require("express").Router();
const { z } = require("zod");
const validate = require("../middleware/validate");
const { protect, authorize } = require("../middleware/auth");
const ctrl = require("../controllers/auth.controller");

const loginSchema = z.object({
  username: z.string().min(1).max(60),
  password: z.string().min(1).max(200),
});

const registerSchema = z.object({
  username: z.string().min(3).max(60).regex(/^[a-zA-Z0-9_.-]+$/),
  name: z.string().min(1).max(120),
  email: z.string().email().max(200).optional(),
  password: z.string().min(6).max(200),
  role: z.enum(["admin", "cashier", "manager"]),
});

router.post("/login", validate(loginSchema), ctrl.login);
router.post("/register", protect, authorize("admin"), validate(registerSchema), ctrl.register);
router.get("/me", protect, ctrl.me);

module.exports = router;
