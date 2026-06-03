const router = require("express").Router();
const { protect, authorize } = require("../middleware/auth");
const ctrl = require("../controllers/report.controller");

router.use(protect, authorize("admin", "manager"));
router.get("/dashboard", ctrl.dashboard);

module.exports = router;
