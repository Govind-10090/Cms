import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Product, OperationType } from '../types';
import { handleFirestoreError } from '../utils';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  Filter, 
  MoreVertical,
  X,
  Save,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';

export const ProductManagement: React.FC = () => {
  const { profile, user, isAuthReady } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: 0,
    quantity: 0
  });

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

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        category: product.category,
        price: product.price,
        quantity: product.quantity
      });
    } else {
      setEditingProduct(null);
      setFormData({ name: '', category: '', price: 0, quantity: 0 });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const productData = {
        ...formData,
        lastUpdated: new Date().toISOString(),
        updatedBy: auth.currentUser?.uid || 'unknown'
      };

      if (editingProduct) {
        await updateDoc(doc(db, 'products', editingProduct.id), productData);
      } else {
        await addDoc(collection(db, 'products'), productData);
      }
      setIsModalOpen(false);
    } catch (err) {
      handleFirestoreError(err, editingProduct ? OperationType.UPDATE : OperationType.CREATE, 'products');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteDoc(doc(db, 'products', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `products/${id}`);
      }
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Product Inventory</h2>
          <p className="text-stone-500 dark:text-stone-400">Manage and track your commodities</p>
        </div>
        
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition-all"
        >
          <Plus className="w-5 h-5" />
          Add Product
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
          <input
            type="text"
            placeholder="Search products by name or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800 transition-all">
          <Filter className="w-5 h-5" />
          Filters
        </button>
      </div>

      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-stone-50 dark:bg-stone-800/50 border-b border-stone-200 dark:border-stone-800">
              <tr>
                <th className="px-6 py-4 text-sm font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">Product</th>
                <th className="px-6 py-4 text-sm font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-sm font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">Price</th>
                <th className="px-6 py-4 text-sm font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-4 text-sm font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold">{product.name}</div>
                    <div className="text-xs text-stone-500 dark:text-stone-400">Updated: {new Date(product.lastUpdated).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-stone-100 dark:bg-stone-800 rounded-full text-xs font-medium">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium">${product.price.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${product.quantity < 10 ? 'bg-red-500' : 'bg-emerald-500'}`} />
                      <span className={product.quantity < 10 ? 'text-red-600 font-bold' : ''}>
                        {product.quantity} units
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleOpenModal(product)}
                        className="p-2 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-lg transition-all text-stone-600 dark:text-stone-400"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {profile?.role === 'Manager' && (
                        <button 
                          onClick={() => handleDelete(product.id)}
                          className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-stone-950/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-stone-900 rounded-2xl shadow-2xl overflow-hidden border border-stone-200 dark:border-stone-800"
            >
              <div className="p-6 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
                <h3 className="text-xl font-bold">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Product Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Price ($)</label>
                    <input
                      type="number"
                      required
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                      className="w-full px-4 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Quantity</label>
                    <input
                      type="number"
                      required
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3 border border-stone-300 dark:border-stone-700 rounded-xl font-bold hover:bg-stone-50 dark:hover:bg-stone-800 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
                  >
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> {editingProduct ? 'Update' : 'Create'}</>}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
