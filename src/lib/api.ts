// src/lib/api.ts
import axios, { AxiosError } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor untuk menambahkan token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor untuk handle errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message: string; code?: string }>) => {
    if (error.response?.status === 401) {
      const errorCode = error.response.data?.code;

      // Clear auth data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('loginAt');

      // Set logout reason for login page to show appropriate message
      if (errorCode === 'TOKEN_EXPIRED') {
        sessionStorage.setItem('logoutReason', 'expired');
      }

      // Redirect to login
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// API Services
export const authAPI = {
  register: (data: { name: string; email: string; password: string; phone?: string }) =>
    api.post('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),

  googleLogin: (data: { access_token: string }) =>
    api.post('/auth/google', data),

  getProfile: () =>
    api.get('/auth/profile'),

  sendOTP: (data: { email: string }) =>
    api.post('/otp/send', data),

  verifyOTP: (data: { email: string; otp: string }) =>
    api.post('/otp/verify', data),

  forgotPassword: (data: { email: string }) =>
    api.post('/auth/forgot-password', data),

  resetPassword: (data: { email: string; otp: string; newPassword: string }) =>
    api.post('/auth/reset-password', data),
};

export const productsAPI = {
  getAll: (params?: {
    category?: string;
    search?: string;
    sortBy?: string;
    order?: string;
    page?: number;
    limit?: number;
    featured?: boolean;
  }) => api.get('/products', { params }),

  getBySlug: (slug: string) =>
    api.get(`/products/${slug}`),

  getRelated: (slug: string) =>
    api.get(`/products/${slug}/related`),

  getById: (id: number) =>
    api.get(`/products/id/${id}`),

  getCategories: () =>
    api.get('/products/categories'),

  // Admin
  adminGetAll: (params?: {
    category?: string;
    search?: string;
    is_available?: string;
    sortBy?: string;
    order?: string;
    page?: number;
    limit?: number;
  }) => api.get('/products/admin/all', { params }),

  create: (data: any) =>
    api.post('/products', data),

  update: (id: number, data: any) =>
    api.put(`/products/${id}`, data),

  delete: (id: number) =>
    api.delete(`/products/${id}`),
};

export const categoriesAPI = {
  getAll: (params?: {
    search?: string;
    page?: number;
    limit?: number;
  }) => api.get('/categories', { params }),

  getById: (id: number) =>
    api.get(`/categories/${id}`),

  // Admin
  create: (data: { name: string; slug: string; description?: string; image_url?: string }) =>
    api.post('/categories', data),

  update: (id: number, data: { name?: string; slug?: string; description?: string; image_url?: string }) =>
    api.put(`/categories/${id}`, data),

  delete: (id: number) =>
    api.delete(`/categories/${id}`),
};

export const cartAPI = {
  get: () =>
    api.get('/cart'),

  addItem: (data: { product_id: number; variant_id?: number | null; quantity: number; notes?: string }) =>
    api.post('/cart/items', data),

  updateItem: (id: number, data: { quantity?: number; notes?: string }) =>
    api.put(`/cart/items/${id}`, data),

  removeItem: (id: number) =>
    api.delete(`/cart/items/${id}`),

  clear: () =>
    api.delete('/cart/clear'),
};

export const uploadAPI = {
  uploadProductImage: (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/upload/product', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  uploadPaymentProof: (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/upload/payment-proof', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  deleteProductImage: (filename: string) =>
    api.delete(`/upload/product/${filename}`),

};

export const ordersAPI = {
  create: (data: {
    recipient_name: string;
    phone: string;
    shipping_address: string;
    shipping_cost?: number;
    customer_notes?: string;
    whatsapp_number?: string;
  }) => api.post('/orders', data),
  
  getUserOrders: (params?: { status?: string }) =>
    api.get('/orders/my-orders', { params }),
  
  getDetail: (id: number) =>
    api.get(`/orders/${id}`),
  
  cancel: (id: number) =>
    api.post(`/orders/${id}/cancel`),

  confirmReceived: (id: number) =>
    api.post(`/orders/${id}/received`),

  uploadPaymentProof: (id: number, data: { payment_proof_url: string }) =>
    api.post(`/orders/${id}/payment-proof`, data),

  // Admin
  adminGetAll: (params?: {
    status?: string;
    payment_status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => api.get('/orders/admin/all', { params }),

  adminGetDetail: (id: number) =>
    api.get(`/orders/admin/${id}`),

  adminUpdateStatus: (id: number, data: {
    status?: string;
    payment_status?: string;
    admin_notes?: string;
    tracking_number?: string;
    tracking_url?: string;
  }) => api.put(`/orders/admin/${id}/status`, data),
};

export const usersAPI = {
  // Admin only
  getAll: (params?: {
    role?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => api.get('/users', { params }),

  getById: (id: number) =>
    api.get(`/users/${id}`),

  getStats: () =>
    api.get('/users/stats'),
};

export const dashboardAPI = {
  // Admin only
  getStats: () =>
    api.get('/dashboard/stats'),

  getRecentOrders: (limit?: number) =>
    api.get('/dashboard/recent-orders', { params: { limit } }),

  getTopProducts: (limit?: number) =>
    api.get('/dashboard/top-products', { params: { limit } }),

  getLowStockProducts: (limit?: number, threshold?: number) =>
    api.get('/dashboard/low-stock', { params: { limit, threshold } }),

  getSalesChart: () =>
    api.get('/dashboard/sales-chart'),
};

export const settingsAPI = {
  // Public — get QRIS image for payment
  getPayment: () =>
    api.get('/settings/payment'),

  // Admin — update QRIS image
  updatePayment: (data: { qris_image_url: string }) =>
    api.put('/settings/payment', data),
};

export const refundsAPI = {
  // Customer
  create: (data: {
    order_id: number;
    reason: string;
    ewallet_phone: string;
  }) => api.post('/refunds', data),

  getUserRefunds: () =>
    api.get('/refunds/my-refunds'),

  getDetail: (id: number) =>
    api.get(`/refunds/${id}`),

  // Admin
  adminGetAll: (params?: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => api.get('/refunds/admin/all', { params }),

  adminGetDetail: (id: number) =>
    api.get(`/refunds/admin/${id}`),

  adminApprove: (id: number, data: { admin_notes?: string }) =>
    api.post(`/refunds/admin/${id}/approve`, data),

  adminReject: (id: number, data: { admin_notes: string }) =>
    api.post(`/refunds/admin/${id}/reject`, data),

  adminComplete: (id: number, data: { transfer_proof_url?: string }) =>
    api.post(`/refunds/admin/${id}/complete`, data),
};

export const bannersAPI = {
  // Public
  getActive: () =>
    api.get('/banners'),

  // Admin
  adminGetAll: (params?: {
    is_active?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => api.get('/banners/admin/all', { params }),

  adminGetById: (id: number) =>
    api.get(`/banners/admin/${id}`),

  create: (data: {
    title: string;
    description?: string;
    image_url: string;
    link_url?: string;
    is_active?: boolean;
    display_order?: number;
    start_date?: string;
    end_date?: string;
  }) => api.post('/banners', data),

  update: (id: number, data: {
    title?: string;
    description?: string;
    image_url?: string;
    link_url?: string;
    is_active?: boolean;
    display_order?: number;
    start_date?: string | null;
    end_date?: string | null;
  }) => api.put(`/banners/${id}`, data),

  toggleStatus: (id: number) =>
    api.patch(`/banners/${id}/toggle`),

  delete: (id: number) =>
    api.delete(`/banners/${id}`),
};

export const feedbackAPI = {
  submit: (data: {
    name: string;
    email?: string;
    rating?: number;
    category?: string;
    message: string;
  }) => api.post('/feedback', data),

  // Admin
  adminGetAll: (params?: {
    rating?: number;
    category?: string;
    is_read?: string;
    page?: number;
    limit?: number;
  }) => api.get('/feedback/admin/all', { params }),

  adminGetUnreadCount: () =>
    api.get('/feedback/admin/unread-count'),

  adminMarkAsRead: (id: number) =>
    api.patch(`/feedback/admin/${id}/read`),

  adminMarkAllAsRead: () =>
    api.patch('/feedback/admin/mark-all-read'),

  adminDelete: (id: number) =>
    api.delete(`/feedback/admin/${id}`),
};

export const notificationsAPI = {
  getAll: (params?: { page?: number; limit?: number; is_read?: string }) =>
    api.get('/notifications', { params }),

  getUnreadCount: () =>
    api.get('/notifications/unread-count'),

  markAsRead: (id: number) =>
    api.put(`/notifications/${id}/read`),

  markAllAsRead: () =>
    api.put('/notifications/read-all'),

  delete: (id: number) =>
    api.delete(`/notifications/${id}`),
};

export default api;