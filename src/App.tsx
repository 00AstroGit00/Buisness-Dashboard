import { AuthProvider, useAuth } from './context/AuthContext';
import { PrivacyModeProvider } from './context/PrivacyModeContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './components/NotificationProvider';
import Dashboard from './components/Dashboard';
import Login from './components/Login_Enhanced'; // Uses the enhanced login with fingerprint & PIN
import LoadingSpinner from './components/LoadingSpinner';
import { Toaster } from 'sonner';

function AppContent() {
  const { isAuthenticated, isInitialized } = useAuth();

  // Show loading spinner while auth context initializes (prevents blank screen)
  if (!isInitialized) {
    return <LoadingSpinner />;
  }

  // If the user is not logged in, show a simple, gold-themed login screen (PIN 1234)
  if (!isAuthenticated) {
    return <Login />;
  }

  // If logged in, return the <Dashboard /> component
  return (
    <>
      <Dashboard />
      <Toaster position="top-right" expand={false} richColors theme="dark" />
    </>
  );
}

export default function App() {
  // Ensure the entire app is wrapped in AuthProvider and NotificationProvider
  return (
    <AuthProvider>
      <ThemeProvider>
        <PrivacyModeProvider>
          <NotificationProvider>
            <AppContent />
          </NotificationProvider>
        </PrivacyModeProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
