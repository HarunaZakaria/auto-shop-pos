import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useStore, type Product } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/inventory")({
  component: Inventory,
});

const empty: Omit<Product, "id" | "createdAt"> = {
  name: "", sku: "", category: "", brand: "", vehicle: "",
  costPrice: 0, price: 0, stock: 0, reorderLevel: 5, supplier: "",
};

function Inventory() {
  const { products, addProduct, updateProduct, deleteProduct } = useStore();
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Product | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);

  const filtered = products.filter((p) => {
    const q = search.toLowerCase();
    return !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) ||
      p.vehicle.toLowerCase().includes(q);
  });

  const openNew = () => { setEditing(null); setForm(empty); setOpen(true); };
  const openEdit = (p: Product) => {
    setEditing(p);
    const { id, createdAt, ...rest } = p;
    setForm(rest);
    setOpen(true);
  };

  const save = () => {
    if (!form.name || !form.sku) { toast.error("Name and SKU are required"); return; }
    if (editing) {
      updateProduct(editing.id, form);
      toast.success("Product updated");
    } else {
      addProduct(form);
      toast.success("Product added");
    }
    setOpen(false);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Inventory</h1>
          <p className="text-sm text-muted-foreground">{products.length} products in catalog</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew}><Plus className="mr-1 h-4 w-4" /> Add product</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit product" : "New product"}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3">
              {([
                ["name", "Name"], ["sku", "SKU/Barcode"], ["category", "Category"],
                ["brand", "Brand"], ["vehicle", "Vehicle compatibility"], ["supplier", "Supplier"],
              ] as const).map(([k, l]) => (
                <div key={k} className="space-y-1.5">
                  <Label>{l}</Label>
                  <Input value={form[k] as string} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />
                </div>
              ))}
              {([["costPrice", "Cost price"], ["price", "Selling price"], ["stock", "Quantity"], ["reorderLevel", "Reorder level"]] as const).map(([k, l]) => (
                <div key={k} className="space-y-1.5">
                  <Label>{l}</Label>
                  <Input type="number" value={form[k] as number}
                    onChange={(e) => setForm({ ...form, [k]: Number(e.target.value) })} />
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={save}>{editing ? "Save changes" : "Create"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-4">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by name, SKU, brand, vehicle…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead className="text-right">Cost</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead className="w-24"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{p.vehicle}</div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{p.sku}</TableCell>
                  <TableCell>{p.category}</TableCell>
                  <TableCell>{p.brand}</TableCell>
                  <TableCell className="text-right">GH₵{p.costPrice}</TableCell>
                  <TableCell className="text-right font-medium">GH₵{p.price}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant={p.stock === 0 ? "destructive" : p.stock <= p.reorderLevel ? "secondary" : "outline"}>
                      {p.stock}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(p)}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => { deleteProduct(p.id); toast.success("Deleted"); }}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={8} className="py-10 text-center text-sm text-muted-foreground">No products found.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
