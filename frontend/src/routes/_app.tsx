import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { StoreProvider, useStore } from "@/lib/store";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/_app")({
  component: () => (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  ),
});

function Shell() {
  const { user } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    // Wait a tick for hydration of localStorage
    const t = setTimeout(() => {
      const raw = localStorage.getItem("pos_store_v1");
      const hasUser = raw && JSON.parse(raw).user;
      if (!hasUser && !user) navigate({ to: "/login" });
    }, 50);
    return () => clearTimeout(t);
  }, [user, navigate]);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <header className="flex h-14 items-center gap-3 border-b bg-card px-4">
            <SidebarTrigger />
            <div className="text-sm font-medium text-muted-foreground">
              Welcome back{user ? `, ${user.name.split(" ")[0]}` : ""}
            </div>
          </header>
          <main className="flex-1 overflow-auto">
            <Outlet />
          </main>
        </div>
        <Toaster />
      </div>
    </SidebarProvider>
  );
}
