const asyncHandler = require("express-async-handler");
const Product = require("../models/Product");

// GET /api/products?search=&category=&lowStock=true&page=1&limit=50
exports.list = asyncHandler(async (req, res) => {
  const { search, category, lowStock, page = 1, limit = 50 } = req.query;
  const q = {};
  if (search) {
    q.$or = [
      { name: new RegExp(search, "i") },
      { sku: new RegExp(search, "i") },
      { brand: new RegExp(search, "i") },
      { vehicle: new RegExp(search, "i") },
    ];
  }
  if (category) q.category = category;

  let query = Product.find(q).sort({ createdAt: -1 });
  if (lowStock === "true") {
    query = Product.find({ ...q, $expr: { $lte: ["$stock", "$reorderLevel"] } }).sort({ stock: 1 });
  }
  const pageNum = Math.max(1, Number(page));
  const lim = Math.min(200, Math.max(1, Number(limit)));
  const [items, total] = await Promise.all([
    query.skip((pageNum - 1) * lim).limit(lim),
    Product.countDocuments(q),
  ]);
  res.json({ items, total, page: pageNum, limit: lim });
});

exports.get = asyncHandler(async (req, res) => {
  const p = await Product.findById(req.params.id);
  if (!p) {
    res.status(404);
    throw new Error("Product not found");
  }
  res.json(p);
});

exports.create = asyncHandler(async (req, res) => {
  const p = await Product.create(req.body);
  res.status(201).json(p);
});

exports.update = asyncHandler(async (req, res) => {
  const p = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!p) {
    res.status(404);
    throw new Error("Product not found");
  }
  res.json(p);
});

exports.remove = asyncHandler(async (req, res) => {
  const p = await Product.findByIdAndDelete(req.params.id);
  if (!p) {
    res.status(404);
    throw new Error("Product not found");
  }
  res.json({ ok: true });
});

// POST /api/products/:id/adjust-stock { delta, reason }
exports.adjustStock = asyncHandler(async (req, res) => {
  const { delta } = req.body;
  const p = await Product.findById(req.params.id);
  if (!p) {
    res.status(404);
    throw new Error("Product not found");
  }
  p.stock = Math.max(0, p.stock + Number(delta));
  await p.save();
  res.json(p);
});
