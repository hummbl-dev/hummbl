import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Settings, User, LogOut, Moon, Sun, Menu } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useTheme } from '../../contexts/ThemeContext';
import GlobalSearch from './GlobalSearch';

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="bg-white/80 dark:bg-primary-900/80 backdrop-blur-md border-b border-primary-100 dark:border-primary-800 px-4 md:px-6 py-3 md:py-4 shadow-soft transition-colors sticky top-0 z-40" role="banner">
      <div className="flex items-center justify-between gap-2">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-primary-700 dark:text-primary-200 hover:bg-primary-100 dark:hover:bg-primary-800 rounded-lg transition-all hover:scale-105"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <GlobalSearch />
        <div className="flex items-center space-x-2 md:space-x-3 ml-2 md:ml-4">
          <button
            onClick={toggleTheme}
            className="p-2 text-primary-600 dark:text-primary-300 hover:bg-accent-50 dark:hover:bg-primary-800 rounded-lg transition-all hover:scale-105 hover:text-accent-600 dark:hover:text-accent-400"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
          </button>
          <button
            onClick={() => navigate('/notifications')}
            className="p-2 text-primary-600 dark:text-primary-300 hover:bg-accent-50 dark:hover:bg-primary-800 rounded-lg transition-all hover:scale-105 hover:text-accent-600 dark:hover:text-accent-400 relative"
            title="Notifications"
          >
            <Bell className="h-5 w-5" />
            {/* Note: Notification badge removed - will show when notifications exist */}
          </button>
          <button
            onClick={() => navigate('/settings')}
            className="p-2 text-primary-600 dark:text-primary-300 hover:bg-accent-50 dark:hover:bg-primary-800 rounded-lg transition-all hover:scale-105 hover:text-accent-600 dark:hover:text-accent-400"
            title="Settings"
          >
            <Settings className="h-5 w-5" />
          </button>
          <div className="relative">
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="h-9 w-9 bg-gradient-to-br from-accent-500 to-accent-600 rounded-full flex items-center justify-center text-white font-semibold hover:from-accent-600 hover:to-accent-700 transition-all hover:scale-105 shadow-soft"
                  title="User menu"
                >
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </button>
                {showUserMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowUserMenu(false)}
                    ></div>
                    <div className="absolute right-0 mt-2 w-56 bg-white/95 dark:bg-primary-800/95 backdrop-blur-sm rounded-xl shadow-card-hover border border-primary-100 dark:border-primary-700 py-1 z-20">
                      <div className="px-4 py-3 border-b border-primary-100 dark:border-primary-700">
                        <p className="text-sm font-semibold text-primary-900 dark:text-primary-50">{user?.name}</p>
                        <p className="text-xs text-primary-600 dark:text-primary-300 truncate">{user?.email}</p>
                      </div>
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          navigate('/team');
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm text-primary-700 dark:text-primary-200 hover:bg-accent-50 dark:hover:bg-primary-700 flex items-center space-x-3 transition-colors rounded-lg mx-1"
                      >
                        <User className="h-4 w-4 text-accent-600 dark:text-accent-400" />
                        <span>Profile & Team</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          navigate('/settings');
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm text-primary-700 dark:text-primary-200 hover:bg-accent-50 dark:hover:bg-primary-700 flex items-center space-x-3 transition-colors rounded-lg mx-1"
                      >
                        <Settings className="h-4 w-4 text-accent-600 dark:text-accent-400" />
                        <span>Settings</span>
                      </button>
                      <hr className="my-1 border-primary-100 dark:border-primary-700" />
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          logout();
                          navigate('/login');
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm text-danger-600 dark:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-900/20 flex items-center space-x-3 transition-colors rounded-lg mx-1"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </>
                )}
              </>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
