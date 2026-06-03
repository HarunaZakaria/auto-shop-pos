const asyncHandler = require("express-async-handler");
const Sale = require("../models/Sale");
const Product = require("../models/Product");

// GET /api/reports/dashboard
exports.dashboard = asyncHandler(async (_req, res) => {
  const since = new Date(Date.now() - 30 * 86400000);

  const [totals, byDay, topProducts, lowStock, productCount] = await Promise.all([
    Sale.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: null,
          revenue: { $sum: "$total" },
          orders: { $sum: 1 },
          units: { $sum: { $sum: "$items.qty" } },
        },
      },
    ]),
    Sale.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$total" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Sale.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          name: { $first: "$items.name" },
          qty: { $sum: "$items.qty" },
          revenue: { $sum: { $multiply: ["$items.qty", "$items.price"] } },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 10 },
    ]),
    Product.find({ $expr: { $lte: ["$stock", "$reorderLevel"] } })
      .sort({ stock: 1 })
      .limit(20),
    Product.countDocuments(),
  ]);

  res.json({
    totals: totals[0] || { revenue: 0, orders: 0, units: 0 },
    byDay,
    topProducts,
    lowStock,
    productCount,
  });
});
