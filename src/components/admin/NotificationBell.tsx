'use client';

import { notificationsAPI } from '@/lib/api';
import { Bell, ShoppingBag, UserCheck, MessageSquare, RotateCcw, X, CheckCheck, BellOff } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  data: any;
  is_read: boolean;
  created_at: string;
}

const TYPE_CONFIG: Record<string, { icon: React.ReactNode; bg: string; ring: string; dot: string }> = {
  new_order: {
    icon: <ShoppingBag className="w-4 h-4 text-blue-600" />,
    bg: 'bg-blue-100',
    ring: 'ring-blue-200',
    dot: 'bg-blue-500',
  },
  new_user: {
    icon: <UserCheck className="w-4 h-4 text-emerald-600" />,
    bg: 'bg-emerald-100',
    ring: 'ring-emerald-200',
    dot: 'bg-emerald-500',
  },
  new_feedback: {
    icon: <MessageSquare className="w-4 h-4 text-violet-600" />,
    bg: 'bg-violet-100',
    ring: 'ring-violet-200',
    dot: 'bg-violet-500',
  },
  new_refund: {
    icon: <RotateCcw className="w-4 h-4 text-rose-600" />,
    bg: 'bg-rose-100',
    ring: 'ring-rose-200',
    dot: 'bg-rose-500',
  },
};

const DEFAULT_CONFIG = {
  icon: <Bell className="w-4 h-4 text-gray-500" />,
  bg: 'bg-gray-100',
  ring: 'ring-gray-200',
  dot: 'bg-gray-400',
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Baru saja';
  if (mins < 60) return `${mins} mnt lalu`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} jam lalu`;
  return `${Math.floor(hours / 24)} hari lalu`;
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [panelPos, setPanelPos] = useState({ top: 0, left: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await notificationsAPI.getUnreadCount();
        setUnreadCount(res.data.count);
      } catch (err) {
        console.error('[NotificationBell] Failed to fetch unread count:', err);
      }
    };
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      const insidePanel = dropdownRef.current?.contains(target);
      const insideButton = buttonRef.current?.contains(target);
      if (!insidePanel && !insideButton) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await notificationsAPI.getAll({ limit: 20 });
      setNotifications(res.data.data);
    } catch (err) {
      console.error('[NotificationBell] Failed to fetch notifications:', err);
    }
    setLoading(false);
  };

  const handleOpen = () => {
    if (!open) {
      fetchNotifications();
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setPanelPos({ top: rect.bottom + 8, left: rect.right - 384 });
      }
    }
    setOpen((v) => !v);
  };

  const handleMarkAsRead = async (id: number) => {
    await notificationsAPI.markAsRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const handleMarkAll = async () => {
    await notificationsAPI.markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  const handleDelete = async (e: React.MouseEvent, id: number, wasRead: boolean) => {
    e.stopPropagation();
    await notificationsAPI.delete(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    if (!wasRead) setUnreadCount((c) => Math.max(0, c - 1));
  };

  const unread = notifications.filter((n) => !n.is_read);
  const read = notifications.filter((n) => n.is_read);

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        ref={buttonRef}
        onClick={handleOpen}
        className={`relative p-2 rounded-xl transition-all duration-200 ${
          open
            ? 'bg-pink-50 text-pink-600 shadow-inner'
            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
        }`}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-pink-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Panel — fixed so it escapes any overflow:hidden parent */}
      {open && (
        <div
          className="fixed w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-[9999] overflow-hidden flex flex-col"
          style={{ top: panelPos.top, left: Math.max(8, panelPos.left), maxHeight: '520px' }}
          ref={dropdownRef}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50/60">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-pink-100 flex items-center justify-center">
                <Bell className="w-4 h-4 text-pink-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">Notifikasi</p>
                {unreadCount > 0 && (
                  <p className="text-[11px] text-gray-400">{unreadCount} belum dibaca</p>
                )}
              </div>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAll}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-pink-600 hover:bg-pink-50 transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Baca semua
              </button>
            )}
          </div>

          {/* Content */}
          <div className="overflow-y-auto flex-1">
            {loading && (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <div className="w-8 h-8 border-2 border-pink-200 border-t-pink-500 rounded-full animate-spin" />
                <p className="text-xs text-gray-400">Memuat notifikasi...</p>
              </div>
            )}

            {!loading && notifications.length === 0 && (
              <div className="flex flex-col items-center justify-center py-14 gap-3">
                <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
                  <BellOff className="w-6 h-6 text-gray-400" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-500">Tidak ada notifikasi</p>
                  <p className="text-xs text-gray-400 mt-1">Semua aktivitas akan muncul di sini</p>
                </div>
              </div>
            )}

            {!loading && unread.length > 0 && (
              <div>
                <p className="px-5 pt-3 pb-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                  Baru
                </p>
                {unread.map((notif) => (
                  <NotifItem
                    key={notif.id}
                    notif={notif}
                    onMarkRead={handleMarkAsRead}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}

            {!loading && read.length > 0 && (
              <div>
                <p className="px-5 pt-3 pb-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                  Sebelumnya
                </p>
                {read.map((notif) => (
                  <NotifItem
                    key={notif.id}
                    notif={notif}
                    onMarkRead={handleMarkAsRead}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function NotifItem({
  notif,
  onMarkRead,
  onDelete,
}: {
  notif: Notification;
  onMarkRead: (id: number) => void;
  onDelete: (e: React.MouseEvent, id: number, wasRead: boolean) => void;
}) {
  const config = TYPE_CONFIG[notif.type] ?? DEFAULT_CONFIG;

  return (
    <div
      onClick={() => !notif.is_read && onMarkRead(notif.id)}
      className={`group relative flex items-start gap-3 px-5 py-3.5 transition-colors cursor-pointer border-b border-gray-50 last:border-0 ${
        !notif.is_read ? 'bg-pink-50/50 hover:bg-pink-50' : 'hover:bg-gray-50/70'
      }`}
    >
      {/* Unread bar */}
      {!notif.is_read && (
        <span className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full bg-pink-400" />
      )}

      {/* Icon */}
      <div className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center ring-1 ${config.bg} ${config.ring}`}>
        {config.icon}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0 pr-6">
        <div className="flex items-center gap-2">
          <p className={`text-xs font-semibold ${notif.is_read ? 'text-gray-600' : 'text-gray-800'}`}>
            {notif.title}
          </p>
          {!notif.is_read && (
            <span className={`flex-shrink-0 w-1.5 h-1.5 rounded-full ${config.dot}`} />
          )}
        </div>
        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">
          {notif.message}
        </p>
        <p className="text-[10px] text-gray-400 mt-1.5 font-medium">{timeAgo(notif.created_at)}</p>
      </div>

      {/* Delete button */}
      <button
        onClick={(e) => onDelete(e, notif.id, notif.is_read)}
        className="absolute right-4 top-3.5 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded-md hover:bg-gray-200 text-gray-400 hover:text-gray-600"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
