/**
 * Notification Center - Alerts & Updates
 * 
 * T4 (Observation) + T2 (Composition): Real-time notifications & user engagement
 * Eighth page of 8-page pilot - FINAL PAGE! (Week 1, Day 7)
 * 
 * @module pages/Notifications
 * @version 1.0.0
 */

import { useState, useEffect } from 'react';
import { telemetry } from '../services/telemetry-enhanced';
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Info,
  XCircle,
  Settings,
  Filter,
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  category: 'workflow' | 'system' | 'team' | 'billing';
}

type FilterType = 'all' | 'unread' | 'workflow' | 'system' | 'team' | 'billing';

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');

  // Track page view
  useEffect(() => {
    telemetry.pageView('notifications', { filter });
  }, [filter]);

  // Load notifications
  useEffect(() => {
    const loadNotifications = () => {
      setLoading(true);
      try {
        // Mock data for now - will be real-time with WebSockets in production
        const mockNotifications: Notification[] = [
          {
            id: 'notif-001',
            type: 'success',
            title: 'Workflow completed successfully',
            message: 'Content Generation Pipeline finished in 2m 15s',
            timestamp: Date.now() - 300000, // 5 min ago
            read: false,
            category: 'workflow',
            actionUrl: '/workflows/wf-001',
            actionLabel: 'View Results',
          },
          {
            id: 'notif-002',
            type: 'error',
            title: 'Workflow execution failed',
            message: 'Data Processing workflow failed: API rate limit exceeded',
            timestamp: Date.now() - 900000, // 15 min ago
            read: false,
            category: 'workflow',
            actionUrl: '/logs/errors',
            actionLabel: 'View Error',
          },
          {
            id: 'notif-003',
            type: 'warning',
            title: 'Token usage approaching limit',
            message: 'You have used 85% of your monthly token allocation',
            timestamp: Date.now() - 3600000, // 1 hour ago
            read: false,
            category: 'billing',
            actionUrl: '/analytics/tokens',
            actionLabel: 'View Usage',
          },
          {
            id: 'notif-004',
            type: 'info',
            title: 'New team member joined',
            message: 'Casey Morgan accepted your invitation and joined the team',
            timestamp: Date.now() - 7200000, // 2 hours ago
            read: true,
            category: 'team',
            actionUrl: '/team',
            actionLabel: 'View Team',
          },
          {
            id: 'notif-005',
            type: 'success',
            title: 'API key created',
            message: 'New Anthropic Claude API key successfully added',
            timestamp: Date.now() - 10800000, // 3 hours ago
            read: true,
            category: 'system',
            actionUrl: '/settings/api-keys',
            actionLabel: 'Manage Keys',
          },
          {
            id: 'notif-006',
            type: 'info',
            title: 'System update completed',
            message: 'HUMMBL v1.2.0 deployed with performance improvements',
            timestamp: Date.now() - 86400000, // 1 day ago
            read: true,
            category: 'system',
          },
          {
            id: 'notif-007',
            type: 'warning',
            title: 'Execution monitor alert',
            message: '3 workflows pending for more than 10 minutes',
            timestamp: Date.now() - 172800000, // 2 days ago
            read: true,
            category: 'workflow',
            actionUrl: '/monitor',
            actionLabel: 'View Monitor',
          },
        ];

        setNotifications(mockNotifications);
      } catch (error) {
        console.error('Failed to load notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, []);

  // Filter notifications
  const filteredNotifications = notifications.filter((notif) => {
    if (filter === 'unread') return !notif.read;
    if (filter === 'all') return true;
    return notif.category === filter;
  });

  // Mark as read
  const handleMarkAsRead = (id: string) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    telemetry.track({
      component: 'notifications',
      action: 'mark_as_read',
      properties: { notificationId: id },
    });
  };

  // Mark all as read
  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
    telemetry.track({
      component: 'notifications',
      action: 'mark_all_as_read',
    });
  };

  // Delete notification
  const handleDelete = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id));
    telemetry.track({
      component: 'notifications',
      action: 'delete_notification',
      properties: { notificationId: id },
    });
  };

  // Clear all read
  const handleClearRead = () => {
    setNotifications(notifications.filter((n) => !n.read));
    telemetry.track({
      component: 'notifications',
      action: 'clear_read',
    });
  };

  // Calculate stats
  const stats = {
    total: notifications.length,
    unread: notifications.filter((n) => !n.read).length,
    workflow: notifications.filter((n) => n.category === 'workflow').length,
    system: notifications.filter((n) => n.category === 'system').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Bell className="h-8 w-8 animate-pulse text-primary-600 mx-auto mb-2" />
          <p className="text-gray-600">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-1">Stay updated with alerts and system events</p>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          {stats.unread > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="btn-secondary flex items-center space-x-2"
            >
              <CheckCheck className="h-4 w-4" />
              <span>Mark All Read</span>
            </button>
          )}
          <button
            onClick={handleClearRead}
            className="btn-secondary flex items-center space-x-2"
          >
            <Trash2 className="h-4 w-4" />
            <span>Clear Read</span>
          </button>
          <button
            onClick={() => {
              telemetry.track({ component: 'notifications', action: 'click_settings' });
              alert('Notification settings - Coming soon!');
            }}
            className="p-2 hover:bg-gray-100 rounded-lg"
            title="Settings"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total"
          value={stats.total}
          icon={<Bell className="h-5 w-5" />}
        />
        <StatCard
          label="Unread"
          value={stats.unread}
          icon={<AlertCircle className="h-5 w-5" />}
          color="text-red-600"
        />
        <StatCard
          label="Workflow"
          value={stats.workflow}
          icon={<Settings className="h-5 w-5" />}
          color="text-blue-600"
        />
        <StatCard
          label="System"
          value={stats.system}
          icon={<Info className="h-5 w-5" />}
          color="text-purple-600"
        />
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex items-center space-x-2 overflow-x-auto">
          <Filter className="h-4 w-4 text-gray-500 flex-shrink-0" />
          {(['all', 'unread', 'workflow', 'system', 'team', 'billing'] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                filter === f
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="card text-center py-12">
            <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">No notifications</p>
            <p className="text-sm text-gray-500 mt-1">
              {filter === 'unread'
                ? 'All caught up! You have no unread notifications.'
                : 'No notifications in this category.'}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onMarkAsRead={() => handleMarkAsRead(notification.id)}
              onDelete={() => handleDelete(notification.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({
  label,
  value,
  icon,
  color = 'text-gray-700',
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color?: string;
}) {
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
        </div>
        <div className={`p-2 bg-gray-50 rounded-lg ${color}`}>{icon}</div>
      </div>
    </div>
  );
}

// Notification Card Component
function NotificationCard({
  notification,
  onMarkAsRead,
  onDelete,
}: {
  notification: Notification;
  onMarkAsRead: () => void;
  onDelete: () => void;
}) {
  const typeConfig = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: <CheckCircle2 className="h-5 w-5 text-green-600" />,
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: <XCircle className="h-5 w-5 text-red-600" />,
    },
    warning: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      icon: <AlertCircle className="h-5 w-5 text-amber-600" />,
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: <Info className="h-5 w-5 text-blue-600" />,
    },
  };

  const categoryColors = {
    workflow: 'bg-blue-100 text-blue-700',
    system: 'bg-purple-100 text-purple-700',
    team: 'bg-green-100 text-green-700',
    billing: 'bg-amber-100 text-amber-700',
  };

  const config = typeConfig[notification.type];
  const categoryColor = categoryColors[notification.category];

  return (
    <div
      className={`card border-l-4 ${config.border} ${config.bg} ${
        notification.read ? 'opacity-60' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start space-x-3 flex-1">
          {config.icon}
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="font-medium text-gray-900">{notification.title}</h3>
              {!notification.read && (
                <span className="w-2 h-2 bg-primary-600 rounded-full"></span>
              )}
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${categoryColor}`}>
                {notification.category}
              </span>
            </div>
            <p className="text-sm text-gray-700">{notification.message}</p>
            <p className="text-xs text-gray-500 mt-1">{formatTimestamp(notification.timestamp)}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 ml-4">
          {!notification.read && (
            <button
              onClick={onMarkAsRead}
              className="p-2 hover:bg-white rounded transition-colors"
              title="Mark as read"
            >
              <Check className="h-4 w-4 text-gray-600" />
            </button>
          )}
          <button
            onClick={onDelete}
            className="p-2 hover:bg-white rounded transition-colors"
            title="Delete"
          >
            <Trash2 className="h-4 w-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Action Button */}
      {notification.actionUrl && notification.actionLabel && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <a
            href={notification.actionUrl}
            className="text-sm font-medium text-primary-600 hover:text-primary-700"
            onClick={() =>
              telemetry.track({
                component: 'notifications',
                action: 'click_action',
                properties: { notificationId: notification.id, url: notification.actionUrl },
              })
            }
          >
            {notification.actionLabel} →
          </a>
        </div>
      )}
    </div>
  );
}

// Format timestamp helper
function formatTimestamp(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}
