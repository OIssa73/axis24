import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/context/LanguageContext";
import { ThemeProvider } from "@/components/theme-provider";
import Index from "./pages/Index.tsx";
import Radio from "./pages/Radio.tsx";
import Television from "./pages/Television.tsx";
import Actualites from "./pages/Actualites.tsx";
import InfoImages from "./pages/InfoImages.tsx";
import Contact from "./pages/Contact.tsx";
import AdminLogin from "./pages/AdminLogin.tsx";
import AdminDashboard from "./pages/AdminDashboard.tsx";
import AdminSetup from "./pages/AdminSetup.tsx";
import ContentDetail from "./pages/ContentDetail.tsx";
import NotFound from "./pages/NotFound.tsx";
import Sports from "./pages/Sports.tsx";
import Jobs from "./pages/Jobs.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <ThemeProvider defaultTheme="dark" storageKey="axis-theme">
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/radio" element={<Radio />} />
              <Route path="/television" element={<Television />} />
              <Route path="/actualites" element={<Actualites />} />
              <Route path="/infos-en-images" element={<InfoImages />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/content/:id" element={<ContentDetail />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/setup" element={<AdminSetup />} />
              <Route path="/admin" element={<AdminDashboard />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="/sports" element={<Sports />} />
              <Route path="/jobs" element={<Jobs />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
