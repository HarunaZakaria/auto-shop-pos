const router = require("express").Router();
const { z } = require("zod");
const validate = require("../middleware/validate");
const { protect, authorize } = require("../middleware/auth");
const ctrl = require("../controllers/user.controller");

const updateSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  email: z.string().email().max(200).optional(),
  role: z.enum(["admin", "cashier", "manager"]).optional(),
  active: z.boolean().optional(),
  password: z.string().min(6).max(200).optional(),
});

router.use(protect, authorize("admin"));
router.get("/", ctrl.list);
router.put("/:id", validate(updateSchema), ctrl.update);
router.delete("/:id", ctrl.remove);

module.exports = router;
