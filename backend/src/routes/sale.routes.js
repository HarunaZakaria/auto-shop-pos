const router = require("express").Router();
const { z } = require("zod");
const validate = require("../middleware/validate");
const { protect, authorize } = require("../middleware/auth");
const ctrl = require("../controllers/sale.controller");

const saleSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        qty: z.number().int().min(1),
      }),
    )
    .min(1),
  discount: z.number().min(0).optional(),
  tax: z.number().min(0).optional(),
  payment: z.enum(["cash", "card", "mobile"]),
});

router.use(protect);
router.post("/", authorize("admin", "cashier", "manager"), validate(saleSchema), ctrl.create);
router.get("/", ctrl.list);
router.get("/:id", ctrl.get);

module.exports = router;
