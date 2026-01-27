
import React from 'react';
// Fixed react-router-dom imports by removing aliases and ensuring standard v6 members are used
import { HashRouter, Routes, Route, Outlet, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { VoiceProvider, useVoice } from './context/VoiceContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { ToastProvider } from './context/ToastContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import Dashboard from './pages/Dashboard';
import Tickets from './pages/Tickets';
import CreateTicket from './pages/CreateTicket';
import TicketDetail from './pages/TicketDetail';
import EditTicket from './pages/EditTicket';
import Users from './pages/Users';
import CreateUser from './pages/CreateUser';
import EditUser from './pages/EditUser';
import Settings from './pages/Settings';
import EditTicketType from './pages/EditTicketType';
import MyAccount from './pages/MyAccount';
import Notifications from './pages/Notifications';
import AdminNotifications from './pages/AdminNotifications';
import EmailManagement from './pages/EmailManagement';
import Analytics from './pages/Analytics';
import BottomNav from './components/BottomNav';
import Sidebar from './components/Sidebar';
import TopNav from './components/TopNav';
import OmniVoiceOverlay from './components/OmniVoiceOverlay';

const ProtectedRoute: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-background-dark flex items-center justify-center">
            <span className="size-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></span>
        </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const AdminRoute: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return null;
    if (!user || user.role !== 'Admin') return <Navigate to="/" replace />;
    return <>{children}</>;
};

const AppLayout = () => {
  const location = useLocation();
  const { isRTL } = useLanguage();
  const { isOpen, openVoice, closeVoice, ticketData } = useVoice();
  
  const isMainTab = ['/', '/tickets', '/users', '/settings', '/notifications', '/analytics'].includes(location.pathname);

  return (
    <div className={`flex min-h-screen bg-slate-50 dark:bg-background-dark text-slate-900 dark:text-white transition-colors duration-300 ${isRTL ? 'font-arabic' : 'font-sans'}`}>
      <Sidebar />
      <div className={`flex-1 relative min-h-screen flex flex-col w-full transition-all duration-300 ${isRTL ? 'md:mr-64' : 'md:ml-64'}`}>
        <TopNav />
        <div className="flex-1 overflow-y-auto">
             <Outlet />
        </div>
      </div>
      {isMainTab && <BottomNav />}

      <button 
        onClick={openVoice}
        className={`fixed z-40 bg-white dark:bg-background-dark border-2 border-primary text-primary rounded-full shadow-[0_0_20px_rgba(34,197,94,0.4)] flex items-center justify-center hover:scale-110 hover:shadow-primary/60 transition-all active:scale-95 group bottom-24 md:bottom-8 w-14 h-14 md:w-16 md:h-16 ${isRTL ? 'left-5 md:left-8' : 'right-5 md:right-8'}`}
      >
        <span className="material-symbols-outlined text-[28px] md:text-[32px] group-hover:animate-pulse">graphic_eq</span>
        <span className={`absolute -top-1 flex h-3 w-3 ${isRTL ? '-left-1' : '-right-1'}`}>
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
        </span>
      </button>

      <OmniVoiceOverlay 
        isOpen={isOpen} 
        onClose={closeVoice} 
        ticketData={ticketData}
      />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AuthProvider>
        <VoiceProvider>
          <ToastProvider>
              <HashRouter>
                  <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/verify-email" element={<VerifyEmail />} />
                  
                  <Route element={
                      <ProtectedRoute>
                      <AppLayout />
                      </ProtectedRoute>
                  }>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/tickets" element={<Tickets />} />
                      <Route path="/tickets/new" element={<CreateTicket />} />
                      <Route path="/ticket/:id" element={<TicketDetail />} />
                      <Route path="/ticket/:id/edit" element={<EditTicket />} />
                      <Route path="/users" element={<Users />} />
                      <Route path="/users/new" element={<CreateUser />} />
                      <Route path="/user/:id/edit" element={<EditUser />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/settings/ticket-type/:id/edit" element={<EditTicketType />} />
                      <Route path="/account" element={<MyAccount />} />
                      <Route path="/notifications" element={<Notifications />} />
                      <Route path="/analytics" element={<Analytics />} />
                      <Route path="/admin/notifications" element={
                          <AdminRoute>
                              <AdminNotifications />
                          </AdminRoute>
                      } />
                      <Route path="/admin/email" element={
                          <AdminRoute>
                              <EmailManagement />
                          </AdminRoute>
                      } />
                  </Route>
                  <Route path="*" element={<Navigate to="/login" replace />} />
                  </Routes>
              </HashRouter>
          </ToastProvider>
        </VoiceProvider>
      </AuthProvider>
    </LanguageProvider>
  );
};

export default App;
