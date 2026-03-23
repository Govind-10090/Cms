import React, { useState, Component, ErrorInfo, ReactNode } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Login } from './components/Login';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { ProductManagement } from './components/ProductManagement';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean, error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      let errorMessage = "An unexpected error occurred.";
      try {
        const parsed = JSON.parse(this.state.error?.message || "");
        if (parsed.error) errorMessage = parsed.error;
      } catch (e) {
        errorMessage = this.state.error?.message || errorMessage;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-950 p-6">
          <div className="max-w-md w-full bg-white dark:bg-stone-900 rounded-2xl shadow-xl p-8 border border-red-100 dark:border-red-900/30 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-xl">
                <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
            <p className="text-stone-500 dark:text-stone-400 mb-6 text-sm">
              {errorMessage}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 bg-stone-900 dark:bg-white text-white dark:text-stone-900 font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const AppContent: React.FC = () => {
  const { user, profile, loading } = useAuth();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products'>('products');

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-950 ${theme === 'dark' ? 'dark' : ''}`}>
        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className={theme === 'dark' ? 'dark' : ''}>
        <Login />
      </div>
    );
  }

  // Role-based access control for dashboard
  const canAccessDashboard = profile.role === 'Manager';
  const currentTab = !canAccessDashboard && activeTab === 'dashboard' ? 'products' : activeTab;

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark' : ''}`}>
      <Layout activeTab={currentTab} setActiveTab={setActiveTab}>
        {currentTab === 'dashboard' && canAccessDashboard ? (
          <Dashboard />
        ) : (
          <ProductManagement />
        )}
      </Layout>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ErrorBoundary>
          <AppContent />
        </ErrorBoundary>
      </ThemeProvider>
    </AuthProvider>
  );
}
