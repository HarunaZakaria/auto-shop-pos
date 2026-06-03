require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");
const Product = require("../models/Product");

const inferCategory = (name) => {
  const n = name.toLowerCase();
  if (n.includes("bearing")) return "Bearings";
  if (n.includes("belt")) return "Belts";
  if (n.includes("filter")) return "Filters";
  if (n.includes("gear")) return "Gears";
  if (n.includes("clutch")) return "Clutch";
  if (n.includes("brake") || n.includes("break")) return "Brakes";
  if (/piston|ring|lining|crank|valve|gasket/.test(n)) return "Engine";
  if (/absorber|spring|shaft/.test(n)) return "Suspension";
  if (/oil|pump/.test(n)) return "Pumps";
  return "General";
};

const inferVehicle = (name) => {
  const n = name.toLowerCase();
  if (n.includes("18hp")) return "18HP Tractor";
  if (n.includes("22hp")) return "22HP Tractor";
  if (n.includes("28hp")) return "28HP Tractor";
  return "Universal";
};

// Minimal demo catalog. Replace with your own import script if needed.
const DEMO_PRODUCTS = [
  { name: "Oil Filter 18HP", price: 45, stock: 30 },
  { name: "Front Wheel Bearing 22HP", price: 120, stock: 12 },
  { name: "Clutch Plate 28HP", price: 380, stock: 6 },
  { name: "Drive Belt B-78", price: 65, stock: 25 },
  { name: "Brake Lining Set", price: 95, stock: 18 },
  { name: "Piston Ring 22HP", price: 150, stock: 9 },
  { name: "Shock Absorber Rear", price: 240, stock: 4 },
  { name: "Fuel Pump Universal", price: 310, stock: 7 },
];

async function run() {
  await connectDB();

  console.log("⏳ Clearing existing users & products…");
  await Promise.all([User.deleteMany({}), Product.deleteMany({})]);

  console.log("👤 Seeding users…");
  const seedUsers = [
    { username: "admin", name: "Alex Admin", role: "admin", password: "admin123" },
    { username: "cashier", name: "Carla Cashier", role: "cashier", password: "cashier123" },
    { username: "manager", name: "Mark Manager", role: "manager", password: "manager123" },
  ];
  for (const u of seedUsers) {
    const user = new User({ username: u.username, name: u.name, role: u.role });
    await user.setPassword(u.password);
    await user.save();
  }

  console.log("📦 Seeding products…");
  const docs = DEMO_PRODUCTS.map((it, i) => ({
    name: it.name,
    sku: `SKU-${String(1000 + i).padStart(5, "0")}`,
    category: inferCategory(it.name),
    brand: "MK",
    vehicle: inferVehicle(it.name),
    costPrice: Math.round(it.price * 0.75),
    price: it.price,
    stock: it.stock,
    reorderLevel: 5,
    supplier: "MK-TAMALE",
  }));
  await Product.insertMany(docs);

  console.log("✅ Seed complete.");
  await mongoose.disconnect();
}

run().catch(async (e) => {
  console.error("❌ Seed failed:", e);
  await mongoose.disconnect();
  process.exit(1);
});
