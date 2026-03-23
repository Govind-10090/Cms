import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { auth } from '../firebase';
import { 
  LayoutDashboard, 
  Package, 
  LogOut, 
  Sun, 
  Moon, 
  Menu, 
  X, 
  ChevronRight,
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: 'dashboard' | 'products';
  setActiveTab: (tab: 'dashboard' | 'products') => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const { profile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['Manager'] },
    { id: 'products', label: 'Inventory', icon: Package, roles: ['Manager', 'Store Keeper'] },
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(profile?.role || ''));

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors duration-300 flex">
      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className="fixed lg:relative z-50 w-64 h-screen bg-white dark:bg-stone-900 border-r border-stone-200 dark:border-stone-800 flex flex-col shadow-xl lg:shadow-none"
          >
            <div className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                  C
                </div>
                <span className="font-bold text-xl tracking-tight">CMS</span>
              </div>
              <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-stone-500">
                <X className="w-6 h-6" />
              </button>
            </div>

            <nav className="flex-1 px-4 space-y-2 mt-4">
              {filteredMenu.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeTab === item.id
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                      : 'hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-400'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                  {activeTab === item.id && <ChevronRight className="w-4 h-4 ml-auto" />}
                </button>
              ))}
            </nav>

            <div className="p-4 border-t border-stone-200 dark:border-stone-800">
              <div className="flex items-center gap-3 p-3 bg-stone-50 dark:bg-stone-800/50 rounded-xl mb-4">
                <div className="w-10 h-10 bg-stone-200 dark:bg-stone-700 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-stone-500 dark:text-stone-400" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-bold truncate">{profile?.displayName || 'User'}</p>
                  <p className="text-xs text-stone-500 dark:text-stone-400 truncate">{profile?.role}</p>
                </div>
              </div>
              
              <button
                onClick={() => auth.signOut()}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all font-medium"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between px-6 shrink-0">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className={`p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-all ${isSidebarOpen ? 'lg:hidden' : ''}`}
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-all text-stone-600 dark:text-stone-400"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 lg:p-10">
          {children}
        </main>
      </div>
    </div>
  );
};
