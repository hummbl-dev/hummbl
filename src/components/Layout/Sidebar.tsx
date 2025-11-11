import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Workflow,
  Bot,
  FileText,
  Activity,
  Brain,
  Settings as SettingsIcon,
  Users
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Mental Models', href: '/mental-models', icon: Brain },
  { name: 'Workflows', href: '/workflows', icon: Workflow },
  { name: 'Agents', href: '/agents', icon: Bot },
  { name: 'Templates', href: '/templates', icon: FileText },
  { name: 'Team Members', href: '/team', icon: Users },
  { name: 'Settings', href: '/settings', icon: SettingsIcon },
];

export default function Sidebar() {
  return (
    <div className="w-64 bg-gray-900 text-white">
      <div className="p-4 border-b border-gray-800" role="complementary" aria-label="Application branding">
        <div className="flex items-center space-x-2">
          <Activity className="h-8 w-8 text-primary-400" />
          <div>
            <h1 className="text-xl font-bold">HUMMBL</h1>
            <p className="text-xs text-gray-400">Workflow Dashboard</p>
          </div>
        </div>
      </div>
      <nav className="p-4 space-y-2" role="navigation" aria-label="Main navigation">
        {navigation.map((item) => (
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
