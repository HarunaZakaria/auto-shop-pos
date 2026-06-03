const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const Sale = require("../models/Sale");
const Product = require("../models/Product");

// POST /api/sales
// body: { items:[{productId,qty}], discount, tax, payment }
exports.create = asyncHandler(async (req, res) => {
  const { items, discount = 0, tax = 0, payment } = req.body;

  const productIds = items.map((i) => i.productId);
  const products = await Product.find({ _id: { $in: productIds } });
  const map = new Map(products.map((p) => [String(p._id), p]));

  const lineItems = [];
  let subtotal = 0;
  for (const it of items) {
    const p = map.get(String(it.productId));
    if (!p) {
      res.status(400);
      throw new Error(`Product ${it.productId} not found`);
    }
    if (p.stock < it.qty) {
      res.status(400);
      throw new Error(`Insufficient stock for ${p.name}`);
    }
    lineItems.push({ product: p._id, name: p.name, qty: it.qty, price: p.price });
    subtotal += p.price * it.qty;
  }

  const total = Math.max(0, subtotal - discount + tax);

  // Decrement stock and persist sale (best-effort sequential; use transaction if on replica set)
  for (const it of items) {
    await Product.updateOne({ _id: it.productId }, { $inc: { stock: -it.qty } });
  }

  const sale = await Sale.create({
    items: lineItems,
    subtotal,
    discount,
    tax,
    total,
    payment,
    cashier: req.user._id,
    cashierName: req.user.name,
  });

  res.status(201).json(sale);
});

// GET /api/sales?from=&to=&cashier=&page=&limit=
exports.list = asyncHandler(async (req, res) => {
  const { from, to, cashier, page = 1, limit = 50 } = req.query;
  const q = {};
  if (from || to) {
    q.createdAt = {};
    if (from) q.createdAt.$gte = new Date(from);
    if (to) q.createdAt.$lte = new Date(to);
  }
  if (cashier && mongoose.isValidObjectId(cashier)) q.cashier = cashier;

  const pageNum = Math.max(1, Number(page));
  const lim = Math.min(200, Math.max(1, Number(limit)));
  const [items, total] = await Promise.all([
    Sale.find(q).sort({ createdAt: -1 }).skip((pageNum - 1) * lim).limit(lim),
    Sale.countDocuments(q),
  ]);
  res.json({ items, total, page: pageNum, limit: lim });
});

exports.get = asyncHandler(async (req, res) => {
  const s = await Sale.findById(req.params.id);
  if (!s) {
    res.status(404);
    throw new Error("Sale not found");
  }
  res.json(s);
});
