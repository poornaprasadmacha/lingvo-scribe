
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { ThemeProvider } from "@/hooks/use-theme";
import TextTranslation from "./pages/TextTranslation";
import PdfTranslation from "./pages/PdfTranslation";
import ChatTranslation from "./pages/ChatTranslation";
import AboutUs from "./pages/AboutUs";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    {/* Changed defaultTheme to 'light' to set daylight theme by default */}
    <ThemeProvider defaultTheme="light" storageKey="translo-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<TextTranslation />} />
              <Route path="/pdf" element={<PdfTranslation />} />
              <Route path="/chat" element={<ChatTranslation />} />
              <Route path="/about" element={<AboutUs />} />
              {/* Removed WebpageTranslation route */}
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AnimatePresence>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

