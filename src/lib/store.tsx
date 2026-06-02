import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Role = "admin" | "cashier" | "manager";

export interface User {
  id: string;
  username: string;
  name: string;
  role: Role;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  brand: string;
  vehicle: string;
  costPrice: number;
  price: number;
  stock: number;
  reorderLevel: number;
  supplier: string;
  createdAt: string;
}

export interface SaleItem {
  productId: string;
  name: string;
  qty: number;
  price: number;
}

export interface Sale {
  id: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  payment: "cash" | "card" | "mobile";
  cashier: string;
  createdAt: string;
}

const MOCK_USERS: Array<User & { password: string }> = [
  { id: "u1", username: "admin", password: "admin123", name: "Alex Admin", role: "admin" },
  { id: "u2", username: "cashier", password: "cashier123", name: "Carla Cashier", role: "cashier" },
  { id: "u3", username: "manager", password: "manager123", name: "Mark Manager", role: "manager" },
];

import { SEED_ITEMS } from "./seedItems";

const inferCategory = (name: string): string => {
  const n = name.toLowerCase();
  if (n.includes("bearing")) return "Bearings";
  if (n.includes("belt")) return "Belts";
  if (n.includes("filter")) return "Filters";
  if (n.includes("gear")) return "Gears";
  if (n.includes("clutch")) return "Clutch";
  if (n.includes("break") || n.includes("brake")) return "Brakes";
  if (n.includes("piston") || n.includes("ring") || n.includes("lining") || n.includes("crank") || n.includes("valve") || n.includes("gasket")) return "Engine";
  if (n.includes("absorber") || n.includes("spring") || n.includes("shaft")) return "Suspension";
  if (n.includes("oil") || n.includes("pump")) return "Pumps";
  return "General";
};

const inferVehicle = (name: string): string => {
  const n = name.toLowerCase();
  if (n.includes("18hp")) return "18HP Tractor";
  if (n.includes("22hp")) return "22HP Tractor";
  if (n.includes("28hp")) return "28HP Tractor";
  return "Universal";
};

const seedProducts = (): Product[] =>
  SEED_ITEMS.map((it, i) => ({
    id: `p${i + 1}`,
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
    createdAt: new Date(Date.now() - i * 3600000).toISOString(),
  }));

const seedSales = (products: Product[]): Sale[] => {
  const sales: Sale[] = [];
  const cashiers = ["Carla Cashier", "Alex Admin"];
  const payments: Sale["payment"][] = ["cash", "card", "mobile"];
  for (let d = 0; d < 30; d++) {
    const count = 2 + Math.floor(Math.random() * 5);
    for (let i = 0; i < count; i++) {
      const items: SaleItem[] = [];
      const itemCount = 1 + Math.floor(Math.random() * 3);
      for (let k = 0; k < itemCount; k++) {
        const p = products[Math.floor(Math.random() * products.length)];
        const qty = 1 + Math.floor(Math.random() * 3);
        items.push({ productId: p.id, name: p.name, qty, price: p.price });
      }
      const subtotal = items.reduce((s, it) => s + it.price * it.qty, 0);
      const tax = Math.round(subtotal * 0.16);
      sales.push({
        id: `s-${d}-${i}-${Math.random().toString(36).slice(2, 7)}`,
        items,
        subtotal,
        discount: 0,
        tax,
        total: subtotal + tax,
        payment: payments[Math.floor(Math.random() * 3)],
        cashier: cashiers[Math.floor(Math.random() * cashiers.length)],
        createdAt: new Date(Date.now() - d * 86400000 - i * 3600000).toISOString(),
      });
    }
  }
  return sales;
};

interface StoreState {
  user: User | null;
  products: Product[];
  sales: Sale[];
  login: (u: string, p: string) => boolean;
  logout: () => void;
  addProduct: (p: Omit<Product, "id" | "createdAt">) => void;
  updateProduct: (id: string, p: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  recordSale: (sale: Omit<Sale, "id" | "createdAt" | "cashier">) => Sale;
}

const StoreCtx = createContext<StoreState | null>(null);

const LS_KEY = "pos_store_v2";

export function StoreProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const raw = typeof window !== "undefined" ? localStorage.getItem(LS_KEY) : null;
    if (raw) {
      const data = JSON.parse(raw);
      setProducts(data.products || []);
      setSales(data.sales || []);
      setUser(data.user || null);
    } else {
      const p = seedProducts();
      const s = seedSales(p);
      setProducts(p);
      setSales(s);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(LS_KEY, JSON.stringify({ user, products, sales }));
  }, [user, products, sales, hydrated]);

  const login = (username: string, password: string) => {
    const u = MOCK_USERS.find((x) => x.username === username && x.password === password);
    if (!u) return false;
    const { password: _pw, ...rest } = u;
    setUser(rest);
    return true;
  };

  const logout = () => setUser(null);

  const addProduct: StoreState["addProduct"] = (p) => {
    setProducts((arr) => [
      { ...p, id: `p${Date.now()}`, createdAt: new Date().toISOString() },
      ...arr,
    ]);
  };

  const updateProduct: StoreState["updateProduct"] = (id, patch) => {
    setProducts((arr) => arr.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  };

  const deleteProduct = (id: string) => setProducts((arr) => arr.filter((p) => p.id !== id));

  const recordSale: StoreState["recordSale"] = (sale) => {
    const full: Sale = {
      ...sale,
      id: `s-${Date.now()}`,
      cashier: user?.name || "Unknown",
      createdAt: new Date().toISOString(),
    };
    setSales((arr) => [full, ...arr]);
    setProducts((arr) =>
      arr.map((p) => {
        const it = sale.items.find((i) => i.productId === p.id);
        return it ? { ...p, stock: Math.max(0, p.stock - it.qty) } : p;
      }),
    );
    return full;
  };

  return (
    <StoreCtx.Provider
      value={{ user, products, sales, login, logout, addProduct, updateProduct, deleteProduct, recordSale }}
    >
      {children}
    </StoreCtx.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error("useStore must be inside StoreProvider");
  return ctx;
}
