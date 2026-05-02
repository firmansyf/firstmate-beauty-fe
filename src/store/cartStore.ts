import { create } from 'zustand';
import { cartAPI } from '@/lib/api';
import toast from 'react-hot-toast';

interface CartItem {
  id: number;
  product_id: number;
  variant_id?: number | null;
  variant_name?: string | null;
  name: string;
  price: number;
  discount_price?: number;
  quantity: number;
  image_url?: string;
  notes?: string;
  stock: number;
}

interface CartState {
  items: CartItem[];
  subtotal: number;
  totalItems: number;
  totalQuantity: number;
  isLoading: boolean;

  fetchCart: () => Promise<void>;
  addToCart: (productId: number, quantity: number, options?: { variantId?: number | null; notes?: string }) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  subtotal: 0,
  totalItems: 0,
  totalQuantity: 0,
  isLoading: false,

  fetchCart: async () => {
    try {
      const response = await cartAPI.get();
      const { items, summary } = response.data.data;
      
      set({
        items,
        subtotal: summary.subtotal,
        totalItems: summary.totalItems,
        totalQuantity: summary.totalQuantity,
      });
    } catch (error: any) {
      if (error.response?.status !== 401) {
        console.error('Fetch cart error:', error);
      }
    }
  },

  addToCart: async (productId, quantity, options) => {
    set({ isLoading: true });
    try {
      await cartAPI.addItem({
        product_id: productId,
        variant_id: options?.variantId ?? null,
        quantity,
        notes: options?.notes,
      });
      await get().fetchCart();
      toast.success('Produk berhasil ditambahkan ke keranjang');
    } catch (error: any) {
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateQuantity: async (itemId: number, quantity: number) => {
    try {
      await cartAPI.updateItem(itemId, { quantity });
      await get().fetchCart();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal update quantity');
      throw error;
    }
  },

  removeItem: async (itemId: number) => {
    try {
      await cartAPI.removeItem(itemId);
      await get().fetchCart();
      toast.success('Item berhasil dihapus');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal menghapus item');
      throw error;
    }
  },

  clearCart: async () => {
    try {
      await cartAPI.clear();
      set({
        items: [],
        subtotal: 0,
        totalItems: 0,
        totalQuantity: 0,
      });
      console.log('Keranjang berhasil dikosongkan');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal mengosongkan keranjang');
      throw error;
    }
  },
}));