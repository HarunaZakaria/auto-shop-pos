import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useStore, type Product, type SaleItem } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Plus, Minus, Trash2, Printer, CreditCard, Banknote, Smartphone } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/_app/pos")({
  component: POS,
});

const TAX_RATE = 0.16;

function POS() {
  const { products, recordSale } = useStore();
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [payment, setPayment] = useState<"cash" | "card" | "mobile">("cash");
  const [receipt, setReceipt] = useState<null | ReturnType<typeof recordSale>>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return products.filter(
      (p) => p.stock > 0 && (!q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)),
    ).slice(0, 24);
  }, [products, search]);

  const addToCart = (p: Product) => {
    setCart((c) => {
      const existing = c.find((i) => i.productId === p.id);
      if (existing) {
        if (existing.qty >= p.stock) { toast.error("Not enough stock"); return c; }
        return c.map((i) => i.productId === p.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...c, { productId: p.id, name: p.name, qty: 1, price: p.price }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart((c) => c
      .map((i) => i.productId === id ? { ...i, qty: i.qty + delta } : i)
      .filter((i) => i.qty > 0));
  };

  const removeItem = (id: string) => setCart((c) => c.filter((i) => i.productId !== id));

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const tax = Math.round((subtotal - discount) * TAX_RATE);
  const total = Math.max(0, subtotal - discount + tax);

  const checkout = () => {
    if (cart.length === 0) { toast.error("Cart is empty"); return; }
    const sale = recordSale({ items: cart, subtotal, discount, tax, total, payment });
    setReceipt(sale);
    setCart([]);
    setDiscount(0);
    toast.success("Sale completed");
  };

  return (
    <div className="grid h-[calc(100vh-3.5rem)] grid-cols-1 lg:grid-cols-[1fr_400px]">
      {/* Products */}
      <div className="flex flex-col overflow-hidden p-4">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input autoFocus placeholder="Scan barcode or search products…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-11" />
        </div>
        <ScrollArea className="flex-1">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {filtered.map((p) => (
              <button
                key={p.id}
                onClick={() => addToCart(p)}
                className="group flex flex-col rounded-lg border bg-card p-3 text-left transition hover:border-primary hover:shadow-md"
              >
                <div className="flex h-20 items-center justify-center rounded-md bg-secondary text-2xl font-bold text-muted-foreground">
                  {p.name.charAt(0)}
                </div>
                <p className="mt-2 line-clamp-2 text-sm font-medium">{p.name}</p>
                <p className="text-xs text-muted-foreground">{p.sku}</p>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-sm font-bold text-primary">${p.price}</span>
                  <Badge variant="outline" className="text-xs">{p.stock} in stock</Badge>
                </div>
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="col-span-full py-10 text-center text-sm text-muted-foreground">No products match.</p>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Cart */}
      <Card className="m-4 flex flex-col overflow-hidden lg:ml-0 p-0">
        <div className="border-b p-4">
          <h2 className="font-semibold">Current sale</h2>
          <p className="text-xs text-muted-foreground">{cart.length} item(s)</p>
        </div>
        <ScrollArea className="flex-1">
          <div className="space-y-2 p-4">
            {cart.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">Cart is empty</p>}
            {cart.map((i) => (
              <div key={i.productId} className="flex items-center gap-2 rounded-md border p-2">
                <div className="flex-1">
                  <p className="text-sm font-medium">{i.name}</p>
                  <p className="text-xs text-muted-foreground">${i.price} × {i.qty}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => updateQty(i.productId, -1)}><Minus className="h-3 w-3" /></Button>
                  <span className="w-6 text-center text-sm font-medium">{i.qty}</span>
                  <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => updateQty(i.productId, 1)}><Plus className="h-3 w-3" /></Button>
                </div>
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => removeItem(i.productId)}><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="border-t bg-muted/30 p-4 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span><span>${subtotal.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <Label className="text-sm text-muted-foreground">Discount</Label>
            <Input type="number" value={discount} onChange={(e) => setDiscount(Number(e.target.value) || 0)} className="h-8 w-24 text-right" />
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Tax (16%)</span><span>${tax.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between border-t pt-3 text-lg font-bold">
            <span>Total</span><span>${total.toLocaleString()}</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {([["cash", Banknote], ["card", CreditCard], ["mobile", Smartphone]] as const).map(([m, Icon]) => (
              <Button key={m} variant={payment === m ? "default" : "outline"} size="sm" onClick={() => setPayment(m)} className="capitalize">
                <Icon className="mr-1 h-3.5 w-3.5" />{m}
              </Button>
            ))}
          </div>

          <Button className="w-full h-11" onClick={checkout} disabled={cart.length === 0}>
            Complete sale · ${total.toLocaleString()}
          </Button>
        </div>
      </Card>

      {/* Receipt dialog */}
      <Dialog open={!!receipt} onOpenChange={(o) => !o && setReceipt(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Receipt</DialogTitle></DialogHeader>
          {receipt && (
            <div id="receipt" className="font-mono text-sm">
              <div className="text-center">
                <p className="text-base font-bold">SparePOS</p>
                <p className="text-xs text-muted-foreground">Spare Parts Store</p>
                <p className="text-xs text-muted-foreground">{new Date(receipt.createdAt).toLocaleString()}</p>
              </div>
              <div className="my-3 border-y py-2">
                {receipt.items.map((i) => (
                  <div key={i.productId} className="flex justify-between">
                    <span>{i.qty}× {i.name}</span><span>${(i.qty * i.price).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-1">
                <div className="flex justify-between"><span>Subtotal</span><span>${receipt.subtotal}</span></div>
                <div className="flex justify-between"><span>Tax</span><span>${receipt.tax}</span></div>
                <div className="flex justify-between font-bold"><span>Total</span><span>${receipt.total}</span></div>
                <div className="flex justify-between text-xs text-muted-foreground"><span>Payment</span><span className="capitalize">{receipt.payment}</span></div>
                <div className="flex justify-between text-xs text-muted-foreground"><span>Cashier</span><span>{receipt.cashier}</span></div>
              </div>
              <p className="mt-4 text-center text-xs text-muted-foreground">Thank you!</p>
            </div>
          )}
          <Button onClick={() => window.print()} variant="outline" className="w-full"><Printer className="mr-2 h-4 w-4" /> Print receipt</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
