import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { store } from "@/lib/store";
import type { User } from "@supabase/supabase-js";
import DashboardLayout from "@/components/DashboardLayout";
import DashboardPage from "@/pages/DashboardPage";
import GuestListPage from "@/pages/GuestListPage";
import SettlementPage from "@/pages/SettlementPage";
import ThankYouPage from "@/pages/ThankYouPage";
import PreGuestPage from "@/pages/PreGuestPage";
import AuthPage from "@/pages/AuthPage";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

function AppContent() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const newUser = session?.user ?? null;
      setUser(newUser);
      if (!newUser) {
        store.reset();
        setReady(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      store.init().then(() => setReady(true));
    }
  }, [user]);

  // 로딩 중
  if (user === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F0F2F5]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // 비로그인
  if (!user) return <AuthPage />;

  // 데이터 로딩 중
  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F0F2F5]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-muted-foreground">데이터 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardLayout><DashboardPage /></DashboardLayout>} />
        <Route path="/guests" element={<DashboardLayout><GuestListPage /></DashboardLayout>} />
        <Route path="/settlement" element={<DashboardLayout><SettlementPage /></DashboardLayout>} />
        <Route path="/thankyou" element={<DashboardLayout><ThankYouPage /></DashboardLayout>} />
        <Route path="/preguests" element={<DashboardLayout><PreGuestPage /></DashboardLayout>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppContent />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
