import { ReactNode, useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import EmailVerificationBanner from '../EmailVerificationBanner';
import PreviewBanner from '../PreviewBanner';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <PreviewBanner />
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <EmailVerificationBanner />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
