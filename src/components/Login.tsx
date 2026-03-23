import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'motion/react';
import { LogIn, UserPlus, ShieldCheck, Loader2, Chrome, Sun, Moon } from 'lucide-react';

export const Login: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'Manager' | 'Store Keeper'>('Store Keeper');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if profile exists
      const profileRef = doc(db, 'users', user.uid);
      const profileSnap = await getDoc(profileRef);

      if (!profileSnap.exists()) {
        // Create default profile for Google users
        await setDoc(profileRef, {
          uid: user.uid,
          email: user.email,
          role: 'Store Keeper', // Default role
          displayName: user.displayName || user.email?.split('@')[0] || 'User'
        });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Create user profile in Firestore
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          role: role,
          displayName: email.split('@')[0]
        });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-100 dark:bg-stone-950 p-4 transition-colors duration-300 relative">
      <div className="absolute top-6 right-6">
        <button
          onClick={toggleTheme}
          className="p-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-sm text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800 transition-all"
        >
          {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white dark:bg-stone-900 rounded-2xl shadow-xl p-8 border border-stone-200 dark:border-stone-800"
      >
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
            <ShieldCheck className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-center text-stone-900 dark:text-white mb-2">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p className="text-stone-500 dark:text-stone-400 text-center mb-8">
          {isLogin ? 'Sign in to manage your commodities' : 'Register as a Manager or Store Keeper'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              placeholder="name@company.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full px-4 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              >
                <option value="Store Keeper">Store Keeper</option>
                <option value="Manager">Manager</option>
              </select>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : isLogin ? (
              <>
                <LogIn className="w-5 h-5" />
                Sign In
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5" />
                Register
              </>
            )}
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-stone-200 dark:border-stone-800"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-stone-900 px-2 text-stone-500">Or continue with</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-3 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 font-semibold rounded-lg shadow-sm hover:bg-stone-50 dark:hover:bg-stone-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Chrome className="w-5 h-5" />
            Sign in with Google
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-emerald-600 dark:text-emerald-400 text-sm font-medium hover:underline"
          >
            {isLogin ? "Don't have an account? Register" : "Already have an account? Sign In"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
