import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Landing from "./pages/Landing";
import Conversations from "./pages/ConversationsNew";
import Pricing from "./pages/Pricing";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import BuyNumbers from "./pages/BuyNumbers";
import { useState, useEffect } from "react";
import ApiService from "./services/api";

const queryClient = new QueryClient();

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      if (ApiService.isAuthenticated()) {
        try {
          const profile = await ApiService.getProfile();
          console.log("User profile loaded:", profile);
          setIsAuthenticated(true);
        } catch (error) {
          console.error("Auth check failed:", error);
          ApiService.logout();
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  // Show loading while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route
              path="/"
              element={
                isAuthenticated ? (
                  <Home />
                ) : (
                  <Landing onLoginSuccess={() => setIsAuthenticated(true)} />
                )
              }
            />
            <Route
              path="/conversations"
              element={
                isAuthenticated ? (
                  <Conversations />
                ) : (
                  <Landing onLoginSuccess={() => setIsAuthenticated(true)} />
                )
              }
            />
            <Route
              path="/buy-numbers"
              element={
                isAuthenticated ? (
                  <BuyNumbers />
                ) : (
                  <Landing onLoginSuccess={() => setIsAuthenticated(true)} />
                )
              }
            />
            <Route path="/pricing" element={<Pricing />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

createRoot(document.getElementById("root")!).render(<App />);
