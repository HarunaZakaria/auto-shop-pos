const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, index: "text" },
    sku: { type: String, required: true, unique: true, trim: true, index: true },
    category: { type: String, default: "General", index: true },
    brand: { type: String, default: "MK" },
    vehicle: { type: String, default: "Universal" },
    costPrice: { type: Number, required: true, min: 0 },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    reorderLevel: { type: Number, default: 5, min: 0 },
    supplier: { type: String, default: "MK-TAMALE" },
  },
  { timestamps: true },
);

productSchema.index({ name: "text", sku: "text", brand: "text", vehicle: "text" });

module.exports = mongoose.model("Product", productSchema);
