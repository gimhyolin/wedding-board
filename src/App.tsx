import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import DashboardLayout from "@/components/DashboardLayout";
import DashboardPage from "@/pages/DashboardPage";
import GuestListPage from "@/pages/GuestListPage";
import SettlementPage from "@/pages/SettlementPage";
import ThankYouPage from "@/pages/ThankYouPage";
import NotFound from "./pages/NotFound.tsx";
import { useInitStore } from "@/lib/useStore";

const queryClient = new QueryClient();

function AppContent() {
  const ready = useInitStore();
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
