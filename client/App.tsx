import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import LoginUniversity from "./pages/LoginUniversity";
import LoginStudent from "./pages/LoginStudent";
import LoginEmployer from "./pages/LoginEmployer";
import FeaturesPage from "./pages/FeaturesPage";
import HowPage from "./pages/HowPage";
import Team from "./pages/Team";
import Verify from "./pages/Verify";
import DashboardRedirect from "./pages/DashboardRedirect";
import UniversityDashboard from "./pages/dashboard/University";
import StudentDashboard from "./pages/dashboard/Student";
import EmployerDashboard from "./pages/dashboard/Employer";
import { AuthProvider } from "@/lib/auth";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <div className="flex min-h-svh flex-col">
            <Header />
            <div className="flex-1">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/login/university" element={<LoginUniversity />} />
                <Route path="/login/student" element={<LoginStudent />} />
                <Route path="/login/employer" element={<LoginEmployer />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/features" element={<FeaturesPage />} />
                <Route path="/how" element={<HowPage />} />
                <Route path="/team" element={<Team />} />
                <Route path="/verify" element={<Verify />} />
                <Route path="/dashboard" element={<DashboardRedirect />} />
                <Route
                  path="/dashboard/university"
                  element={<UniversityDashboard />}
                />
                <Route
                  path="/dashboard/student"
                  element={<StudentDashboard />}
                />
                <Route
                  path="/dashboard/employer"
                  element={<EmployerDashboard />}
                />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
            <Footer />
          </div>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
