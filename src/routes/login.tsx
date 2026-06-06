import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { StoreProvider, useStore } from "@/lib/store";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  component: () => (
    <StoreProvider>
      <LoginPage />
      <Toaster />
    </StoreProvider>
  ),
});

const demos = [
  { role: "Admin", username: "admin", password: "admin123" },
  { role: "Cashier", username: "cashier", password: "cashier123" },
  { role: "Manager", username: "manager", password: "manager123" },
];

function LoginPage() {
  const { login } = useStore();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (u: string, p: string) => {
    setLoading(true);
    try {
      const ok = await login(u, p);
      if (ok) {
        toast.success(`Welcome, ${u}!`);
        navigate({ to: "/dashboard" });
      } else {
        toast.error("Invalid credentials");
      }
    } catch (err: any) {
      toast.error(err?.message || "Sign in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-accent/30 p-4">
      <Card className="w-full max-w-md p-8">
        <div className="mb-6 flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Wrench className="h-6 w-6" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold">SparePOS</h1>
            <p className="text-sm text-muted-foreground">Spare Parts POS & Inventory</p>
          </div>
        </div>

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin(username, password);
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="u">Username</Label>
            <Input id="u" value={username} onChange={(e) => setUsername(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="p">Password</Label>
            <Input id="p" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link to="/signup" className="font-medium text-primary hover:underline">
            Create one
          </Link>
        </p>

        <div className="mt-6 border-t pt-4">
          <p className="mb-2 text-xs font-medium text-muted-foreground">Demo accounts — click to sign in</p>
          <div className="grid gap-2">
            {demos.map((d) => (
              <button
                key={d.username}
                onClick={() => handleLogin(d.username, d.password)}
                disabled={loading}
                className="flex items-center justify-between rounded-md border bg-secondary/50 px-3 py-2 text-left text-sm transition hover:bg-secondary disabled:opacity-50"
              >
                <span className="font-medium">{d.role}</span>
                <span className="text-xs text-muted-foreground">{d.username} / {d.password}</span>
              </button>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
