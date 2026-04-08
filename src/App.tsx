import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { WalletProvider } from "@/contexts/WalletContext";
import Landing from "./pages/Landing";
import AppDashboard from "./pages/AppDashboard";
import VaultsList from "./pages/VaultsList";
import CreateVault from "./pages/CreateVault";
import VaultDetail from "./pages/VaultDetail";
import ProposalsList from "./pages/ProposalsList";
import ProposalDetail from "./pages/ProposalDetail";
import SettingsPage from "./pages/SettingsPage";
import AdminPage from "./pages/AdminPage";
import DocsPage from "./pages/DocsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <WalletProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/app" element={<AppDashboard />} />
            <Route path="/vaults" element={<VaultsList />} />
            <Route path="/vaults/new" element={<CreateVault />} />
            <Route path="/vaults/:id" element={<VaultDetail />} />
            <Route path="/proposals" element={<ProposalsList />} />
            <Route path="/proposals/:id" element={<ProposalDetail />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/docs" element={<DocsPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </WalletProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
