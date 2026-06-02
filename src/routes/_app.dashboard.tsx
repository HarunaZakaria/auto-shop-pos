import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Package, ShoppingBag, AlertTriangle, TrendingUp } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_app/dashboard")({
  component: Dashboard,
});

const fmt = (n: number) => `GH₵${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

function Dashboard() {
  const { sales, products } = useStore();

  const now = Date.now();
  const today = new Date().toDateString();
  const todaySales = sales.filter((s) => new Date(s.createdAt).toDateString() === today);
  const weekSales = sales.filter((s) => now - new Date(s.createdAt).getTime() < 7 * 86400000);
  const monthSales = sales.filter((s) => now - new Date(s.createdAt).getTime() < 30 * 86400000);

  const todayTotal = todaySales.reduce((s, x) => s + x.total, 0);
  const weekTotal = weekSales.reduce((s, x) => s + x.total, 0);
  const monthTotal = monthSales.reduce((s, x) => s + x.total, 0);

  const totalStock = products.reduce((s, p) => s + p.stock, 0);
  const lowStock = products.filter((p) => p.stock <= p.reorderLevel);

  // Last 7 days chart
  const chart = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(now - (6 - i) * 86400000);
    const day = d.toDateString();
    const total = sales
      .filter((s) => new Date(s.createdAt).toDateString() === day)
      .reduce((s, x) => s + x.total, 0);
    return { day: d.toLocaleDateString(undefined, { weekday: "short" }), total };
  });

  // Top selling products
  const sold: Record<string, number> = {};
  monthSales.forEach((s) => s.items.forEach((it) => (sold[it.name] = (sold[it.name] || 0) + it.qty)));
  const top = Object.entries(sold)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, qty]) => ({ name: name.length > 18 ? name.slice(0, 16) + "…" : name, qty }));

  const recent = [...sales].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)).slice(0, 6);

  const stats = [
    { label: "Today's Sales", value: fmt(todayTotal), icon: DollarSign, sub: `${todaySales.length} transactions` },
    { label: "This Week", value: fmt(weekTotal), icon: TrendingUp, sub: `${weekSales.length} transactions` },
    { label: "Monthly Revenue", value: fmt(monthTotal), icon: ShoppingBag, sub: `${monthSales.length} transactions` },
    { label: "Items in Stock", value: totalStock.toLocaleString(), icon: Package, sub: `${products.length} SKUs` },
  ];

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview of your store performance</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">{s.label}</p>
                  <p className="mt-1 text-2xl font-bold">{s.value}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{s.sub}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <s.icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Sales — last 7 days</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chart}>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="total" stroke="oklch(0.55 0.21 270)" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top sellers (30d)</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={top} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={110} />
                <Tooltip />
                <Bar dataKey="qty" fill="oklch(0.6 0.22 270)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Low stock alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            {lowStock.length === 0 ? (
              <p className="text-sm text-muted-foreground">All products are well stocked.</p>
            ) : (
              <ul className="space-y-2">
                {lowStock.slice(0, 6).map((p) => (
                  <li key={p.id} className="flex items-center justify-between rounded-md border p-2">
                    <div>
                      <p className="text-sm font-medium">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.sku} · {p.category}</p>
                    </div>
                    <Badge variant={p.stock === 0 ? "destructive" : "secondary"}>
                      {p.stock} left
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {recent.map((s) => (
                <li key={s.id} className="flex items-center justify-between rounded-md border p-2 text-sm">
                  <div>
                    <p className="font-medium">{s.items.length} item(s) · {s.cashier}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(s.createdAt).toLocaleString()} · {s.payment}
                    </p>
                  </div>
                  <span className="font-semibold">{fmt(s.total)}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
