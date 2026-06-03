const router = require("express").Router();
const { z } = require("zod");
const validate = require("../middleware/validate");
const { protect, authorize } = require("../middleware/auth");
const ctrl = require("../controllers/product.controller");

const productSchema = z.object({
  name: z.string().min(1).max(200),
  sku: z.string().min(1).max(80),
  category: z.string().max(80).optional(),
  brand: z.string().max(80).optional(),
  vehicle: z.string().max(120).optional(),
  costPrice: z.number().min(0),
  price: z.number().min(0),
  stock: z.number().int().min(0),
  reorderLevel: z.number().int().min(0).optional(),
  supplier: z.string().max(120).optional(),
});

const adjustSchema = z.object({
  delta: z.number().int(),
  reason: z.string().max(200).optional(),
});

router.use(protect);
router.get("/", ctrl.list);
router.get("/:id", ctrl.get);
router.post("/", authorize("admin", "manager"), validate(productSchema), ctrl.create);
router.put("/:id", authorize("admin", "manager"), validate(productSchema.partial()), ctrl.update);
router.delete("/:id", authorize("admin"), ctrl.remove);
router.post("/:id/adjust-stock", authorize("admin", "manager"), validate(adjustSchema), ctrl.adjustStock);

module.exports = router;
