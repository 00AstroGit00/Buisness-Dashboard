import { AuthProvider, useAuth } from '@/context/AuthContext';
import { PrivacyModeProvider } from '@/context/PrivacyModeContext';
import Dashboard from '@/components/Dashboard';
import Login from '@/components/Login_Enhanced'; // Uses the enhanced login with fingerprint & PIN
import LoadingSpinner from '@/components/LoadingSpinner';

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
  return <Dashboard />;
}

export default function App() {
  // Ensure the entire app is wrapped in AuthProvider
  return (
    <AuthProvider>
      <PrivacyModeProvider>
        <AppContent />
      </PrivacyModeProvider>
    </AuthProvider>
  );
}
