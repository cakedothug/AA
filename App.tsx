import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import { SiteLayout } from "@/components/layout/site-layout";
import { ReactNode } from "react";

// Páginas
import Home from "@/pages/home";
import NotFound from "@/pages/not-found";
import NewsIndex from "@/pages/news/index";
import NewsArticle from "@/pages/news/article";
import Application from "@/pages/application";
import LoginPage from "@/pages/login";
import TermsOfService from "@/pages/terms";
import PrivacyPolicy from "@/pages/privacy";
import TeamPage from "@/pages/team";
import SupportPage from "@/pages/support";
import SupportTicketView from "@/pages/support/view";
import GuidelinesIndex from "@/pages/guidelines/index";
import GuidelineDetail from "@/pages/guidelines/detail";

// Páginas de Usuário
import UserProfile from "@/pages/profile";
import UserSettings from "@/pages/profile/settings";

// Páginas Admin
import AdminDashboard from "@/pages/admin/dashboard";
import AdminNewsIndex from "@/pages/admin/news/index";
import AdminNewsEditor from "@/pages/admin/news/editor";
import AdminApplicationsIndex from "@/pages/admin/applications/index";
import AdminApplicationView from "@/pages/admin/applications/view";
import AdminSettings from "@/pages/admin/settings";
import AdminStaffManager from "@/pages/admin/staff/index";
import AdminMediaManager from "@/pages/admin/media/index";
import AdminGuidelinesIndex from "@/pages/admin/guidelines/index";
import AdminGuidelinesEditor from "@/pages/admin/guidelines/editor";
import AdminTicketsIndex from "@/pages/admin/tickets/index";
import AdminTicketView from "@/pages/admin/tickets/view";

// Componente wrapper para aplicar o layout
const LayoutRoute = ({ 
  component: Component, 
  withLayout = true
}: { 
  component: React.ComponentType<any>,
  withLayout?: boolean 
}) => {
  return withLayout ? (
    <SiteLayout>
      <Component />
    </SiteLayout>
  ) : (
    <Component />
  );
};

// Componente wrapper para rotas protegidas com layout
const ProtectedLayoutRoute = ({
  path,
  component: Component,
  withLayout = true,
  requireAdmin = false
}: {
  path: string,
  component: React.ComponentType<any>,
  withLayout?: boolean,
  requireAdmin?: boolean
}) => {
  const WrappedComponent = () => (
    withLayout ? (
      <SiteLayout>
        <Component />
      </SiteLayout>
    ) : (
      <Component />
    )
  );
  
  return <ProtectedRoute path={path} component={WrappedComponent} requireAdmin={requireAdmin} />;
};

function Router() {
  return (
    <Switch>
      {/* Páginas Públicas */}
      <Route path="/" 
        component={() => <LayoutRoute component={Home} />} 
      />
      <Route path="/news" 
        component={() => <LayoutRoute component={NewsIndex} />} 
      />
      <Route path="/news/:slug" 
        component={() => <LayoutRoute component={NewsArticle} />} 
      />
      <Route path="/login" 
        component={() => <LayoutRoute component={LoginPage} />} 
      />
      <Route path="/terms" 
        component={() => <LayoutRoute component={TermsOfService} />} 
      />
      <Route path="/privacy" 
        component={() => <LayoutRoute component={PrivacyPolicy} />} 
      />
      <Route path="/team" 
        component={() => <LayoutRoute component={TeamPage} />} 
      />
      
      {/* Páginas que não exigem autenticação */}
      <Route path="/application" 
        component={() => <LayoutRoute component={Application} />} 
      />

      {/* Página de Suporte */}
      <Route path="/support" 
        component={() => <LayoutRoute component={SupportPage} />} 
      />
      <ProtectedLayoutRoute path="/support/ticket/:id" component={SupportTicketView} />
      
      {/* Páginas de Diretrizes */}
      <Route path="/guidelines" 
        component={() => <LayoutRoute component={GuidelinesIndex} />}
      />
      <Route path="/guidelines/:slug" 
        component={() => <LayoutRoute component={GuidelineDetail} />}
      />
      {/* Páginas de Usuário - Protegidas */}
      <ProtectedLayoutRoute path="/profile" component={UserProfile} />
      <ProtectedLayoutRoute path="/profile/settings" component={UserSettings} />
      
      {/* Páginas Admin - Protegidas com requisito de admin */}
      <ProtectedLayoutRoute path="/admin/dashboard" component={AdminDashboard} requireAdmin={true} />
      <ProtectedLayoutRoute path="/admin/news" component={AdminNewsIndex} requireAdmin={true} />
      <ProtectedLayoutRoute path="/admin/news/new" component={AdminNewsEditor} requireAdmin={true} />
      <ProtectedLayoutRoute path="/admin/news/edit/:id" component={AdminNewsEditor} requireAdmin={true} />
      <ProtectedLayoutRoute path="/admin/applications" component={AdminApplicationsIndex} requireAdmin={true} />
      <ProtectedLayoutRoute path="/admin/applications/:id" component={AdminApplicationView} requireAdmin={true} />
      <ProtectedLayoutRoute path="/admin/settings" component={AdminSettings} requireAdmin={true} />
      <ProtectedLayoutRoute path="/admin/staff" component={AdminStaffManager} requireAdmin={true} />
      <ProtectedLayoutRoute path="/admin/media" component={AdminMediaManager} requireAdmin={true} />
      <ProtectedLayoutRoute path="/admin/guidelines" component={AdminGuidelinesIndex} requireAdmin={true} />
      <ProtectedLayoutRoute path="/admin/guidelines/new" component={AdminGuidelinesEditor} requireAdmin={true} />
      <ProtectedLayoutRoute path="/admin/guidelines/edit/:id" component={AdminGuidelinesEditor} requireAdmin={true} />
      <ProtectedLayoutRoute path="/admin/tickets" component={AdminTicketsIndex} requireAdmin={true} />
      <ProtectedLayoutRoute path="/admin/tickets/:id" component={AdminTicketView} requireAdmin={true} />

      {/* Fallback para 404 */}
      <Route path="/:rest*" 
        component={() => <LayoutRoute component={NotFound} />} 
      />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
