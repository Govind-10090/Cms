import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '../firebase';
import { Product, OperationType } from '../types';
import { handleFirestoreError } from '../utils';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  Package, 
  AlertTriangle, 
  DollarSign,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';

export const Dashboard: React.FC = () => {
  const { user, isAuthReady } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !isAuthReady) return;

    const q = query(collection(db, 'products'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      setProducts(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'products');
    });
    return () => unsubscribe();
  }, [user, isAuthReady]);

  const totalValue = products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
  const totalItems = products.reduce((sum, p) => sum + p.quantity, 0);
  const lowStock = products.filter(p => p.quantity < 10).length;
  const categoriesCount = Array.from(new Set(products.map(p => p.category))).length;

  const categoryData = products.reduce((acc: any[], p) => {
    const existing = acc.find(a => a.name === p.category);
    if (existing) {
      existing.value += p.quantity;
    } else {
      acc.push({ name: p.category, value: p.quantity });
    }
    return acc;
  }, []);

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

  const stats = [
    { label: 'Total Inventory Value', value: `$${totalValue.toLocaleString()}`, icon: DollarSign, color: 'bg-emerald-500', trend: '+12.5%', isUp: true },
    { label: 'Total Items in Stock', value: totalItems.toLocaleString(), icon: Package, color: 'bg-blue-500', trend: '+3.2%', isUp: true },
    { label: 'Low Stock Alerts', value: lowStock, icon: AlertTriangle, color: 'bg-amber-500', trend: '-2.4%', isUp: false },
    { label: 'Active Categories', value: categoriesCount, icon: TrendingUp, color: 'bg-purple-500', trend: '+1', isUp: true },
  ];

  if (loading) return <div className="flex items-center justify-center h-full">Loading...</div>;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.color} text-white`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium ${stat.isUp ? 'text-emerald-600' : 'text-red-600'}`}>
                {stat.trend}
                {stat.isUp ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              </div>
            </div>
            <p className="text-stone-500 dark:text-stone-400 text-sm font-medium">{stat.label}</p>
            <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm"
        >
          <h3 className="text-lg font-bold mb-6">Inventory by Category</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1c1917', border: 'none', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm"
        >
          <h3 className="text-lg font-bold mb-6">Stock Distribution</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
