import { NavLink } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  Workflow,
  Bot,
  FileText,
  Brain,
  Settings as SettingsIcon,
  Users
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

interface NavigationItem {
  name: string;
  href: string;
  icon: LucideIcon;
  adminOnly?: boolean;
}

const navigation: NavigationItem[] = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Mental Models', href: '/mental-models', icon: Brain },
  { name: 'Workflows', href: '/workflows', icon: Workflow },
  { name: 'Agents', href: '/agents', icon: Bot },
  { name: 'Templates', href: '/templates', icon: FileText },
  { name: 'Team Members', href: '/team', icon: Users, adminOnly: true },
  { name: 'Settings', href: '/settings', icon: SettingsIcon },
];

export default function Sidebar() {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === 'admin' || user?.role === 'owner';

  // Filter navigation based on role
  const visibleNavigation = navigation.filter(
    (item) => !item.adminOnly || isAdmin
  );
  return (
    <div className="w-64 bg-gray-900 text-white">
      <div className="p-4 border-b border-gray-800" role="complementary" aria-label="Application branding">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">HUMMBL</h1>
            <p className="text-xs text-gray-400 font-medium">Base120 Framework</p>
          </div>
        </div>
      </div>
      <nav className="p-4 space-y-2" role="navigation" aria-label="Main navigation">
        {visibleNavigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <item.icon className="h-5 w-5" />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
