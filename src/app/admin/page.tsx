// src/app/admin/page.tsx
'use client';

import Card, { CardBody, CardHeader } from '@/components/common/Card';
import Loader from '@/components/common/Loader';
import { motion } from 'framer-motion';
import { dashboardAPI } from '@/lib/api';
import { formatCurrency, getOrderStatusColor, getOrderStatusText } from '@/lib/utils';
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Package,
  Plus,
  ShoppingBag,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface DashboardStats {
  total_products: number;
  total_categories: number;
  total_customers: number;
  total_orders: number;
  pending_orders: number;
  confirmed_orders: number;
  processing_orders: number;
  shipped_orders: number;
  delivered_orders: number;
  cancelled_orders: number;
  total_revenue: number;
  revenue_30d: number;
  revenue_7d: number;
  revenue_today: number;
  orders_today: number;
  orders_7d: number;
}

interface RecentOrder {
  id: number;
  order_number: string;
  customer_name: string;
  customer_email: string;
  total: number;
  status: string;
  created_at: string;
}

interface TopProduct {
  id: number;
  name: string;
  slug: string;
  price: number;
  image_url: string;
  total_sold: number;
  total_revenue: number;
}

interface LowStockProduct {
  id: number;
  name: string;
  slug: string;
  stock: number;
  unit: string;
  image_url: string;
}

interface SalesChartData {
  date: string;
  order_count: number;
  total_sales: number;
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
};

const cardHover = {
  y: -4,
  boxShadow: '0 12px 24px -8px rgba(0, 0, 0, 0.12)',
  transition: { duration: 0.2 },
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([]);
  const [salesChart, setSalesChart] = useState<SalesChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, ordersRes, topRes, lowStockRes, chartRes] = await Promise.all([
        dashboardAPI.getStats(),
        dashboardAPI.getRecentOrders(5),
        dashboardAPI.getTopProducts(5),
        dashboardAPI.getLowStockProducts(5, 10),
        dashboardAPI.getSalesChart(),
      ]);

      setStats(statsRes.data.data);
      setRecentOrders(ordersRes.data.data || []);
      setTopProducts(topRes.data.data || []);
      setLowStockProducts(lowStockRes.data.data || []);
      setSalesChart(chartRes.data.data || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Produk',
      value: stats?.total_products || 0,
      icon: Package,
      href: '/admin/products',
      color: 'bg-blue-50 text-blue-600',
    },
    {
      title: 'Total Kategori',
      value: stats?.total_categories || 0,
      icon: BarChart3,
      href: '/admin/categories',
      color: 'bg-purple-50 text-purple-600',
    },
    {
      title: 'Total Pelanggan',
      value: stats?.total_customers || 0,
      icon: Users,
      href: '/admin/users',
      color: 'bg-pink-50 text-pink-600',
    },
    {
      title: 'Total Pesanan',
      value: stats?.total_orders || 0,
      icon: ShoppingBag,
      href: '/admin/orders',
      color: 'bg-orange-50 text-orange-600',
    },
  ];

  const revenueCards = [
    {
      title: 'Total Pendapatan',
      value: formatCurrency(Number(stats?.total_revenue) || 0),
      subtitle: 'Dari pesanan selesai',
      icon: Wallet,
      color: 'bg-pink-50 text-pink-600',
    },
    {
      title: 'Pendapatan 30 Hari',
      value: formatCurrency(Number(stats?.revenue_30d) || 0),
      subtitle: '30 hari terakhir',
      icon: TrendingUp,
      color: 'bg-pink-50 text-pink-600',
    },
    {
      title: 'Pendapatan 7 Hari',
      value: formatCurrency(Number(stats?.revenue_7d) || 0),
      subtitle: '7 hari terakhir',
      icon: TrendingUp,
      color: 'bg-cyan-50 text-cyan-600',
    },
    {
      title: 'Pendapatan Hari Ini',
      value: formatCurrency(Number(stats?.revenue_today) || 0),
      subtitle: `${stats?.orders_today || 0} pesanan hari ini`,
      icon: TrendingUp,
      color: 'bg-amber-50 text-amber-600',
    },
  ];

  const orderStatusCards = [
    { label: 'Pending', value: stats?.pending_orders || 0, color: 'bg-yellow-100 text-yellow-700' },
    { label: 'Dikonfirmasi', value: stats?.confirmed_orders || 0, color: 'bg-blue-100 text-blue-700' },
    { label: 'Diproses', value: stats?.processing_orders || 0, color: 'bg-indigo-100 text-indigo-700' },
    { label: 'Dikirim', value: stats?.shipped_orders || 0, color: 'bg-purple-100 text-purple-700' },
    { label: 'Selesai', value: stats?.delivered_orders || 0, color: 'bg-pink-100 text-pink-700' },
    { label: 'Dibatalkan', value: stats?.cancelled_orders || 0, color: 'bg-red-100 text-red-700' },
  ];

  // Calculate max value for chart scaling
  const maxSales = Math.max(...salesChart.map(d => Number(d.total_sales)), 1);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Selamat datang di Admin Panel FirstMate Beauty</p>
        </div>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-pink-600 text-white text-sm font-medium rounded-lg hover:bg-pink-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Tambah Produk
          </Link>
        </motion.div>
      </motion.div>

      {/* Main Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <Link key={index} href={stat.href}>
            <motion.div
              whileHover={cardHover}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
            >
              <Card hover className="h-full">
                <CardBody>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">{stat.title}</p>
                      <motion.p
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 + index * 0.1, type: 'spring' }}
                        className="text-2xl font-bold text-gray-900"
                      >
                        {stat.value}
                      </motion.p>
                    </div>
                    <motion.div
                      whileHover={{ rotate: 10, scale: 1.1 }}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}
                    >
                      <stat.icon className="w-5 h-5" />
                    </motion.div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          </Link>
        ))}
      </motion.div>

      {/* Revenue Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {revenueCards.map((card, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + index * 0.1, duration: 0.3 }}
          >
            <Card>
              <CardBody>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">{card.title}</p>
                    <p className="text-lg font-bold text-gray-900">{card.value}</p>
                    <p className="text-xs text-gray-400 mt-1">{card.subtitle}</p>
                  </div>
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${card.color}`}>
                    <card.icon className="w-4 h-4" />
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Order Status Overview */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900">Status Pesanan</h2>
              <Link
                href="/admin/orders"
                className="text-pink-600 hover:text-pink-700 text-sm font-medium flex items-center gap-1"
              >
                Lihat Semua
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {orderStatusCards.map((status, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.05, type: 'spring' }}
                  whileHover={{ scale: 1.05 }}
                  className={`rounded-lg p-3 text-center ${status.color}`}
                >
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 + index * 0.05 }}
                    className="text-2xl font-bold"
                  >
                    {status.value}
                  </motion.p>
                  <p className="text-xs mt-1">{status.label}</p>
                </motion.div>
              ))}
            </div>
          </CardBody>
        </Card>
      </motion.div>

      {/* Sales Chart */}
      {salesChart.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <h2 className="text-sm font-semibold text-gray-900">Penjualan 7 Hari Terakhir</h2>
            </CardHeader>
            <CardBody>
              <div className="flex items-end justify-between gap-2 h-40">
                {salesChart.map((day, index) => {
                  const height = (Number(day.total_sales) / maxSales) * 100;
                  const date = new Date(day.date);
                  const dayName = date.toLocaleDateString('id-ID', { weekday: 'short' });
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full flex items-end justify-center" style={{ height: '120px' }}>
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${Math.max(height, 4)}%` }}
                          transition={{ delay: 0.8 + index * 0.1, duration: 0.5, ease: 'easeOut' }}
                          whileHover={{ backgroundColor: '#be185d' }}
                          className="w-full max-w-[40px] bg-pink-500 rounded-t-md cursor-pointer"
                          title={`${formatCurrency(Number(day.total_sales))} (${day.order_count} pesanan)`}
                        />
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-medium text-gray-600">{dayName}</p>
                        <p className="text-xs text-gray-400">{day.order_count} order</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardBody>
          </Card>
        </motion.div>
      )}

      {/* Two Column Layout */}
      <motion.div variants={itemVariants} className="grid lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900">Pesanan Terbaru</h2>
              <Link
                href="/admin/orders"
                className="text-pink-600 hover:text-pink-700 text-sm font-medium flex items-center gap-1"
              >
                Lihat Semua
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </CardHeader>
          <CardBody className="p-0">
            {recentOrders.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {recentOrders.map((order, index) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                  >
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          #{order.order_number}
                        </p>
                        <p className="text-xs text-gray-500">{order.customer_name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {formatCurrency(order.total)}
                        </p>
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${getOrderStatusColor(order.status)}`}>
                          {getOrderStatusText(order.status)}
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <ShoppingBag className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Belum ada pesanan</p>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900">Produk Terlaris</h2>
              <Link
                href="/admin/products"
                className="text-pink-600 hover:text-pink-700 text-sm font-medium flex items-center gap-1"
              >
                Lihat Semua
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </CardHeader>
          <CardBody className="p-0">
            {topProducts.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {topProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                  >
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-sm font-medium text-gray-400 w-5">{index + 1}</span>
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0"
                      >
                        {product.image_url ? (
                          <Image
                            src={product.image_url}
                            alt={product.name}
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                        <p className="text-xs text-gray-500">{product.total_sold} terjual</p>
                      </div>
                      <p className="text-sm font-medium text-gray-900">
                        {formatCurrency(Number(product.total_revenue))}
                      </p>
                    </Link>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <TrendingUp className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Belum ada data penjualan</p>
              </div>
            )}
          </CardBody>
        </Card>
      </motion.div>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <motion.div
          variants={itemVariants}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <Card className="border-amber-200 bg-amber-50/50">
            <CardHeader>
              <motion.div
                animate={{ x: [0, -2, 2, -2, 0] }}
                transition={{ repeat: Infinity, duration: 2, repeatDelay: 3 }}
                className="flex items-center gap-2"
              >
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <h2 className="text-sm font-semibold text-amber-800">Peringatan Stok Rendah</h2>
              </motion.div>
            </CardHeader>
            <CardBody className="p-0">
              <div className="divide-y divide-amber-100">
                {lowStockProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.1 + index * 0.1 }}
                  >
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="flex items-center gap-3 p-4 hover:bg-amber-100/50 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-lg bg-white overflow-hidden flex-shrink-0">
                        {product.image_url ? (
                          <Image
                            src={product.image_url}
                            alt={product.name}
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100">
                            <Package className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                      </div>
                      <div className="text-right">
                        <motion.span
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                          className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700"
                        >
                          Stok: {product.stock} {product.unit}
                        </motion.span>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </CardBody>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
