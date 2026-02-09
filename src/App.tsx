import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Suspense, lazy, type ReactNode } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { FamilyProvider } from "@/contexts/FamilyContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { RouteErrorBoundary } from "@/components/ui/RouteErrorBoundary";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { OfflineIndicator } from "@/components/pwa/OfflineIndicator";
import { PWAInstallPrompt } from "@/components/pwa/PWAInstallPrompt";
import { PWAUpdatePrompt } from "@/components/pwa/PWAUpdatePrompt";
import { BetaBanner } from "@/components/BetaBanner";
import { CookieConsentBanner } from "@/components/legal/CookieConsentBanner";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const Pricing = lazy(() => import("./pages/Pricing"));
const About = lazy(() => import("./pages/About"));
const FeaturesPage = lazy(() => import("./pages/FeaturesPage"));
const HelpCenter = lazy(() => import("./pages/HelpCenter"));
const HelpGettingStarted = lazy(() => import("./pages/help/HelpGettingStarted"));
const HelpScheduling = lazy(() => import("./pages/help/HelpScheduling"));
const HelpMessaging = lazy(() => import("./pages/help/HelpMessaging"));
const HelpDocuments = lazy(() => import("./pages/help/HelpDocuments"));
const HelpExpenses = lazy(() => import("./pages/help/HelpExpenses"));
const HelpAccount = lazy(() => import("./pages/help/HelpAccount"));
const HelpPrivacy = lazy(() => import("./pages/help/HelpPrivacy"));
const HelpTrialEnding = lazy(() => import("./pages/help/HelpTrialEnding"));
const HelpScheduleChangeRequests = lazy(() => import("./pages/help/HelpScheduleChangeRequests"));
const HelpInvitations = lazy(() => import("./pages/help/HelpInvitations"));
const HelpDocumentExports = lazy(() => import("./pages/help/HelpDocumentExports"));
const HelpSchedulePatterns = lazy(() => import("./pages/help/HelpSchedulePatterns"));
const HelpContact = lazy(() => import("./pages/help/HelpContact"));
const HelpSecurity = lazy(() => import("./pages/help/HelpSecurity"));
const CourtRecordsPage = lazy(() => import("./pages/CourtRecordsPage"));
const TermsPage = lazy(() => import("./pages/TermsPage"));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const CalendarPage = lazy(() => import("./pages/CalendarPage"));
const ChildrenPage = lazy(() => import("./pages/ChildrenPage"));
const MessagesPage = lazy(() => import("./pages/MessagesPage"));
const MessagingHubPage = lazy(() => import("./pages/MessagingHubPage"));
const DocumentsPage = lazy(() => import("./pages/DocumentsPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const AcceptInvite = lazy(() => import("./pages/AcceptInvite"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage"));
const BlogPage = lazy(() => import("./pages/BlogPage"));
const BlogPostPage = lazy(() => import("./pages/BlogPostPage"));
const UnifiedLawLibraryPage = lazy(() => import("./pages/UnifiedLawLibraryPage"));
const LawArticleDetailPage = lazy(() => import("./pages/LawArticleDetailPage"));
const JournalPage = lazy(() => import("./pages/JournalPage"));
const ExpensesPage = lazy(() => import("./pages/ExpensesPage"));
const SportsPage = lazy(() => import("./pages/SportsPage"));
const GiftsPage = lazy(() => import("./pages/GiftsPage"));
const AuditLogPage = lazy(() => import("./pages/AuditLogPage"));
const KidsDashboard = lazy(() => import("./pages/KidsDashboard"));
const KidCenterPage = lazy(() => import("./pages/KidCenterPage"));
const KidsHubPage = lazy(() => import("./pages/KidsHubPage"));
const NurseNancyPage = lazy(() => import("./pages/NurseNancyPage"));
const ColoringPagesPage = lazy(() => import("./pages/ColoringPagesPage"));
const ChoreChartPage = lazy(() => import("./pages/ChoreChartPage"));
const ActivitiesPage = lazy(() => import("./pages/ActivitiesPage"));
const CreationsLibraryPage = lazy(() => import("./pages/CreationsLibraryPage"));
const LawOfficeLogin = lazy(() => import("./pages/LawOfficeLogin"));
const LawOfficeSignup = lazy(() => import("./pages/LawOfficeSignup"));
const OfflinePage = lazy(() => import("./pages/OfflinePage"));
const PWADiagnosticsPage = lazy(() => import("./pages/PWADiagnosticsPage"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));

const queryClient = new QueryClient();

const withRouteSuspense = (node: ReactNode) => (
  <Suspense
    fallback={
      <div className="min-h-[40vh] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    }
  >
    {node}
  </Suspense>
);

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <TooltipProvider>
          <AuthProvider>
            <FamilyProvider>
            <Toaster />
            <Sonner />
            <OfflineIndicator />
            <PWAInstallPrompt />
            <PWAUpdatePrompt />
            <BrowserRouter>
            <BetaBanner />
            <CookieConsentBanner />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<RouteErrorBoundary routeName="Home">{withRouteSuspense(<Index />)}</RouteErrorBoundary>} />
              <Route path="/pricing" element={<RouteErrorBoundary routeName="Pricing">{withRouteSuspense(<Pricing />)}</RouteErrorBoundary>} />
              <Route path="/about" element={<RouteErrorBoundary routeName="About">{withRouteSuspense(<About />)}</RouteErrorBoundary>} />
              <Route path="/features" element={<RouteErrorBoundary routeName="Features">{withRouteSuspense(<FeaturesPage />)}</RouteErrorBoundary>} />
              <Route path="/help" element={<RouteErrorBoundary routeName="Help">{withRouteSuspense(<HelpCenter />)}</RouteErrorBoundary>} />
              <Route path="/help/getting-started" element={<RouteErrorBoundary routeName="Help - Getting Started">{withRouteSuspense(<HelpGettingStarted />)}</RouteErrorBoundary>} />
              <Route path="/help/getting-started/invitations" element={<RouteErrorBoundary routeName="Help - Invitations">{withRouteSuspense(<HelpInvitations />)}</RouteErrorBoundary>} />
              <Route path="/help/scheduling" element={<RouteErrorBoundary routeName="Help - Scheduling">{withRouteSuspense(<HelpScheduling />)}</RouteErrorBoundary>} />
              <Route path="/help/scheduling/change-requests" element={<RouteErrorBoundary routeName="Help - Change Requests">{withRouteSuspense(<HelpScheduleChangeRequests />)}</RouteErrorBoundary>} />
              <Route path="/help/scheduling/patterns" element={<RouteErrorBoundary routeName="Help - Patterns">{withRouteSuspense(<HelpSchedulePatterns />)}</RouteErrorBoundary>} />
              <Route path="/help/messaging" element={<RouteErrorBoundary routeName="Help - Messaging">{withRouteSuspense(<HelpMessaging />)}</RouteErrorBoundary>} />
              <Route path="/help/documents" element={<RouteErrorBoundary routeName="Help - Documents">{withRouteSuspense(<HelpDocuments />)}</RouteErrorBoundary>} />
              <Route path="/help/documents/exports" element={<RouteErrorBoundary routeName="Help - Exports">{withRouteSuspense(<HelpDocumentExports />)}</RouteErrorBoundary>} />
              <Route path="/help/expenses" element={<RouteErrorBoundary routeName="Help - Expenses">{withRouteSuspense(<HelpExpenses />)}</RouteErrorBoundary>} />
              <Route path="/help/account" element={<RouteErrorBoundary routeName="Help - Account">{withRouteSuspense(<HelpAccount />)}</RouteErrorBoundary>} />
              <Route path="/help/account/trial-ending" element={<RouteErrorBoundary routeName="Help - Trial Ending">{withRouteSuspense(<HelpTrialEnding />)}</RouteErrorBoundary>} />
              <Route path="/help/privacy" element={<RouteErrorBoundary routeName="Help - Privacy">{withRouteSuspense(<HelpPrivacy />)}</RouteErrorBoundary>} />
              <Route path="/help/security" element={<RouteErrorBoundary routeName="Help - Security">{withRouteSuspense(<HelpSecurity />)}</RouteErrorBoundary>} />
              <Route path="/help/contact" element={<RouteErrorBoundary routeName="Help - Contact">{withRouteSuspense(<HelpContact />)}</RouteErrorBoundary>} />
              <Route path="/court-records" element={<RouteErrorBoundary routeName="Court Records">{withRouteSuspense(<CourtRecordsPage />)}</RouteErrorBoundary>} />
              <Route path="/terms" element={<RouteErrorBoundary routeName="Terms">{withRouteSuspense(<TermsPage />)}</RouteErrorBoundary>} />
              <Route path="/privacy" element={<RouteErrorBoundary routeName="Privacy">{withRouteSuspense(<PrivacyPage />)}</RouteErrorBoundary>} />
              <Route path="/blog" element={<RouteErrorBoundary routeName="Blog">{withRouteSuspense(<BlogPage />)}</RouteErrorBoundary>} />
              <Route path="/blog/:slug" element={<RouteErrorBoundary routeName="Blog Post">{withRouteSuspense(<BlogPostPage />)}</RouteErrorBoundary>} />
              
              {/* Auth Routes */}
              <Route path="/login" element={<RouteErrorBoundary routeName="Login">{withRouteSuspense(<Login />)}</RouteErrorBoundary>} />
              <Route path="/signup" element={<RouteErrorBoundary routeName="Signup">{withRouteSuspense(<Signup />)}</RouteErrorBoundary>} />
              <Route path="/forgot-password" element={<RouteErrorBoundary routeName="Forgot Password">{withRouteSuspense(<ForgotPassword />)}</RouteErrorBoundary>} />
              <Route path="/reset-password" element={<RouteErrorBoundary routeName="Reset Password">{withRouteSuspense(<ResetPassword />)}</RouteErrorBoundary>} />
              <Route path="/payment-success" element={<RouteErrorBoundary routeName="Payment Success">{withRouteSuspense(<PaymentSuccess />)}</RouteErrorBoundary>} />
              <Route path="/accept-invite" element={<RouteErrorBoundary routeName="Accept Invite">{withRouteSuspense(<AcceptInvite />)}</RouteErrorBoundary>} />
              
              {/* Law Office Portal Routes */}
              <Route path="/law-office/login" element={<RouteErrorBoundary routeName="Law Office Login">{withRouteSuspense(<LawOfficeLogin />)}</RouteErrorBoundary>} />
              <Route path="/law-office/signup" element={<RouteErrorBoundary routeName="Law Office Signup">{withRouteSuspense(<LawOfficeSignup />)}</RouteErrorBoundary>} />
              
              {/* Child Account Dashboard (Kids only) */}
              <Route path="/kids" element={<ProtectedRoute><RouteErrorBoundary routeName="Kids Dashboard">{withRouteSuspense(<KidsDashboard />)}</RouteErrorBoundary></ProtectedRoute>} />
              
              {/* Protected Routes (Parent/Guardian) */}
              <Route path="/onboarding" element={<ProtectedRoute><RouteErrorBoundary routeName="Onboarding">{withRouteSuspense(<Onboarding />)}</RouteErrorBoundary></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><RouteErrorBoundary routeName="Dashboard">{withRouteSuspense(<Dashboard />)}</RouteErrorBoundary></ProtectedRoute>} />
              <Route path="/dashboard/calendar" element={<ProtectedRoute><RouteErrorBoundary routeName="Calendar">{withRouteSuspense(<CalendarPage />)}</RouteErrorBoundary></ProtectedRoute>} />
              <Route path="/dashboard/children" element={<ProtectedRoute requireParent><RouteErrorBoundary routeName="Children">{withRouteSuspense(<ChildrenPage />)}</RouteErrorBoundary></ProtectedRoute>} />
              <Route path="/dashboard/messages" element={<ProtectedRoute><RouteErrorBoundary routeName="Messages">{withRouteSuspense(<MessagingHubPage />)}</RouteErrorBoundary></ProtectedRoute>} />
              <Route path="/dashboard/messages-legacy" element={<ProtectedRoute><RouteErrorBoundary routeName="Messages Legacy">{withRouteSuspense(<MessagesPage />)}</RouteErrorBoundary></ProtectedRoute>} />
              <Route path="/dashboard/documents" element={<ProtectedRoute requireParent><RouteErrorBoundary routeName="Documents">{withRouteSuspense(<DocumentsPage />)}</RouteErrorBoundary></ProtectedRoute>} />
              <Route path="/dashboard/settings" element={<ProtectedRoute requireParent><RouteErrorBoundary routeName="Settings">{withRouteSuspense(<SettingsPage />)}</RouteErrorBoundary></ProtectedRoute>} />
              <Route path="/dashboard/notifications" element={<ProtectedRoute><RouteErrorBoundary routeName="Notifications">{withRouteSuspense(<NotificationsPage />)}</RouteErrorBoundary></ProtectedRoute>} />
              <Route path="/dashboard/law-library" element={<ProtectedRoute requireParent><RouteErrorBoundary routeName="Law Library">{withRouteSuspense(<UnifiedLawLibraryPage />)}</RouteErrorBoundary></ProtectedRoute>} />
              <Route path="/dashboard/law-library/resources" element={<ProtectedRoute requireParent><RouteErrorBoundary routeName="Law Library">{withRouteSuspense(<UnifiedLawLibraryPage />)}</RouteErrorBoundary></ProtectedRoute>} />
              <Route path="/dashboard/law-library/:slug" element={<ProtectedRoute requireParent><RouteErrorBoundary routeName="Law Article">{withRouteSuspense(<LawArticleDetailPage />)}</RouteErrorBoundary></ProtectedRoute>} />
              <Route path="/dashboard/journal" element={<ProtectedRoute><RouteErrorBoundary routeName="Journal">{withRouteSuspense(<JournalPage />)}</RouteErrorBoundary></ProtectedRoute>} />
              <Route path="/dashboard/expenses" element={<ProtectedRoute requireParent><RouteErrorBoundary routeName="Expenses">{withRouteSuspense(<ExpensesPage />)}</RouteErrorBoundary></ProtectedRoute>} />
              <Route path="/dashboard/sports" element={<ProtectedRoute><RouteErrorBoundary routeName="Sports">{withRouteSuspense(<SportsPage />)}</RouteErrorBoundary></ProtectedRoute>} />
              <Route path="/dashboard/gifts" element={<ProtectedRoute><RouteErrorBoundary routeName="Gifts">{withRouteSuspense(<GiftsPage />)}</RouteErrorBoundary></ProtectedRoute>} />
              <Route path="/dashboard/kid-center" element={<ProtectedRoute><RouteErrorBoundary routeName="Kid Center">{withRouteSuspense(<KidCenterPage />)}</RouteErrorBoundary></ProtectedRoute>} />
              <Route path="/dashboard/kids-hub" element={<ProtectedRoute><RouteErrorBoundary routeName="Kids Hub">{withRouteSuspense(<KidsHubPage />)}</RouteErrorBoundary></ProtectedRoute>} />
              <Route path="/dashboard/kids-hub/nurse-nancy" element={<ProtectedRoute><RouteErrorBoundary routeName="Nurse Nancy">{withRouteSuspense(<NurseNancyPage />)}</RouteErrorBoundary></ProtectedRoute>} />
              <Route path="/dashboard/kids-hub/coloring-pages" element={<ProtectedRoute><RouteErrorBoundary routeName="Coloring Pages">{withRouteSuspense(<ColoringPagesPage />)}</RouteErrorBoundary></ProtectedRoute>} />
              <Route path="/dashboard/kids-hub/chore-chart" element={<ProtectedRoute><RouteErrorBoundary routeName="Chore Chart">{withRouteSuspense(<ChoreChartPage />)}</RouteErrorBoundary></ProtectedRoute>} />
              <Route path="/dashboard/kids-hub/activities" element={<ProtectedRoute><RouteErrorBoundary routeName="Activities">{withRouteSuspense(<ActivitiesPage />)}</RouteErrorBoundary></ProtectedRoute>} />
              <Route path="/dashboard/kids-hub/creations" element={<ProtectedRoute><RouteErrorBoundary routeName="Creations Library">{withRouteSuspense(<CreationsLibraryPage />)}</RouteErrorBoundary></ProtectedRoute>} />
              <Route path="/dashboard/kids-hub/*" element={<ProtectedRoute><RouteErrorBoundary routeName="Kids Hub">{withRouteSuspense(<KidsHubPage />)}</RouteErrorBoundary></ProtectedRoute>} />
              <Route path="/dashboard/audit" element={<ProtectedRoute requireParent><RouteErrorBoundary routeName="Audit Log">{withRouteSuspense(<AuditLogPage />)}</RouteErrorBoundary></ProtectedRoute>} />
              <Route path="/dashboard/blog" element={<ProtectedRoute><RouteErrorBoundary routeName="Blog">{withRouteSuspense(<BlogPage />)}</RouteErrorBoundary></ProtectedRoute>} />
              <Route path="/dashboard/blog/:slug" element={<ProtectedRoute><RouteErrorBoundary routeName="Blog Post">{withRouteSuspense(<BlogPostPage />)}</RouteErrorBoundary></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute requireParent><RouteErrorBoundary routeName="Admin">{withRouteSuspense(<AdminDashboard />)}</RouteErrorBoundary></ProtectedRoute>} />
              {/* Offline Route */}
              <Route path="/offline" element={<RouteErrorBoundary routeName="Offline">{withRouteSuspense(<OfflinePage />)}</RouteErrorBoundary>} />
              
              {/* PWA Diagnostics (Internal QA) */}
              <Route path="/pwa-diagnostics" element={<RouteErrorBoundary routeName="PWA Diagnostics">{withRouteSuspense(<PWADiagnosticsPage />)}</RouteErrorBoundary>} />
              
              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            </BrowserRouter>
            </FamilyProvider>
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
