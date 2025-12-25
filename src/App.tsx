import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { RouteErrorBoundary } from "@/components/ui/RouteErrorBoundary";
import Index from "./pages/Index";
import Pricing from "./pages/Pricing";
import About from "./pages/About";
import FeaturesPage from "./pages/FeaturesPage";
import HelpCenter from "./pages/HelpCenter";
import CourtRecordsPage from "./pages/CourtRecordsPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import CalendarPage from "./pages/CalendarPage";
import ChildrenPage from "./pages/ChildrenPage";
import MessagesPage from "./pages/MessagesPage";
import DocumentsPage from "./pages/DocumentsPage";
import SettingsPage from "./pages/SettingsPage";
import AcceptInvite from "./pages/AcceptInvite";
import AdminDashboard from "./pages/AdminDashboard";
import NotificationsPage from "./pages/NotificationsPage";
import BlogPage from "./pages/BlogPage";
import BlogPostPage from "./pages/BlogPostPage";
import LawLibraryPage from "./pages/LawLibraryPage";
import JournalPage from "./pages/JournalPage";
import ExpensesPage from "./pages/ExpensesPage";
import NotFound from "./pages/NotFound";
import PaymentSuccess from "./pages/PaymentSuccess";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<RouteErrorBoundary routeName="Home"><Index /></RouteErrorBoundary>} />
              <Route path="/pricing" element={<RouteErrorBoundary routeName="Pricing"><Pricing /></RouteErrorBoundary>} />
              <Route path="/about" element={<RouteErrorBoundary routeName="About"><About /></RouteErrorBoundary>} />
              <Route path="/features" element={<RouteErrorBoundary routeName="Features"><FeaturesPage /></RouteErrorBoundary>} />
              <Route path="/help" element={<RouteErrorBoundary routeName="Help"><HelpCenter /></RouteErrorBoundary>} />
              <Route path="/court-records" element={<RouteErrorBoundary routeName="Court Records"><CourtRecordsPage /></RouteErrorBoundary>} />
              <Route path="/blog" element={<RouteErrorBoundary routeName="Blog"><BlogPage /></RouteErrorBoundary>} />
              <Route path="/blog/:slug" element={<RouteErrorBoundary routeName="Blog Post"><BlogPostPage /></RouteErrorBoundary>} />
              
              {/* Auth Routes */}
              <Route path="/login" element={<RouteErrorBoundary routeName="Login"><Login /></RouteErrorBoundary>} />
              <Route path="/signup" element={<RouteErrorBoundary routeName="Signup"><Signup /></RouteErrorBoundary>} />
              <Route path="/forgot-password" element={<RouteErrorBoundary routeName="Forgot Password"><ForgotPassword /></RouteErrorBoundary>} />
              <Route path="/reset-password" element={<RouteErrorBoundary routeName="Reset Password"><ResetPassword /></RouteErrorBoundary>} />
              <Route path="/payment-success" element={<RouteErrorBoundary routeName="Payment Success"><PaymentSuccess /></RouteErrorBoundary>} />
              <Route path="/accept-invite" element={<RouteErrorBoundary routeName="Accept Invite"><AcceptInvite /></RouteErrorBoundary>} />
              
              {/* Protected Routes */}
              <Route path="/onboarding" element={<ProtectedRoute><RouteErrorBoundary routeName="Onboarding"><Onboarding /></RouteErrorBoundary></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><RouteErrorBoundary routeName="Dashboard"><Dashboard /></RouteErrorBoundary></ProtectedRoute>} />
              <Route path="/dashboard/calendar" element={<ProtectedRoute><RouteErrorBoundary routeName="Calendar"><CalendarPage /></RouteErrorBoundary></ProtectedRoute>} />
              <Route path="/dashboard/children" element={<ProtectedRoute><RouteErrorBoundary routeName="Children"><ChildrenPage /></RouteErrorBoundary></ProtectedRoute>} />
              <Route path="/dashboard/messages" element={<ProtectedRoute><RouteErrorBoundary routeName="Messages"><MessagesPage /></RouteErrorBoundary></ProtectedRoute>} />
              <Route path="/dashboard/documents" element={<ProtectedRoute><RouteErrorBoundary routeName="Documents"><DocumentsPage /></RouteErrorBoundary></ProtectedRoute>} />
              <Route path="/dashboard/settings" element={<ProtectedRoute><RouteErrorBoundary routeName="Settings"><SettingsPage /></RouteErrorBoundary></ProtectedRoute>} />
              <Route path="/dashboard/notifications" element={<ProtectedRoute><RouteErrorBoundary routeName="Notifications"><NotificationsPage /></RouteErrorBoundary></ProtectedRoute>} />
              <Route path="/dashboard/law-library" element={<ProtectedRoute><RouteErrorBoundary routeName="Law Library"><LawLibraryPage /></RouteErrorBoundary></ProtectedRoute>} />
              <Route path="/dashboard/journal" element={<ProtectedRoute><RouteErrorBoundary routeName="Journal"><JournalPage /></RouteErrorBoundary></ProtectedRoute>} />
              <Route path="/dashboard/expenses" element={<ProtectedRoute><RouteErrorBoundary routeName="Expenses"><ExpensesPage /></RouteErrorBoundary></ProtectedRoute>} />
              <Route path="/dashboard/blog" element={<ProtectedRoute><RouteErrorBoundary routeName="Blog"><BlogPage /></RouteErrorBoundary></ProtectedRoute>} />
              <Route path="/dashboard/blog/:slug" element={<ProtectedRoute><RouteErrorBoundary routeName="Blog Post"><BlogPostPage /></RouteErrorBoundary></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute><RouteErrorBoundary routeName="Admin"><AdminDashboard /></RouteErrorBoundary></ProtectedRoute>} />
              
              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
