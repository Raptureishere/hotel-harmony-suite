import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import MobileSidebar from './MobileSidebar';
import { useAppSelector } from '@/hooks/useAppStore';
import { useEffect } from 'react';

const MainLayout = () => {
  const { darkMode } = useAppSelector((state) => state.ui);

  // Apply dark mode on mount and when it changes
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div className="flex h-screen w-full overflow-hidden relative">
      {/* Decorative background orbs */}
      <div className="bg-orb w-[600px] h-[600px] top-[-200px] left-[-100px] opacity-20"
        style={{ background: 'radial-gradient(circle, hsl(38,92%,50%) 0%, transparent 70%)' }} />
      <div className="bg-orb w-[500px] h-[500px] bottom-[-150px] right-[10%] opacity-15"
        style={{ background: 'radial-gradient(circle, hsl(217,91%,60%) 0%, transparent 70%)' }} />
      <div className="bg-orb w-[400px] h-[400px] top-[40%] right-[30%] opacity-10"
        style={{ background: 'radial-gradient(circle, hsl(152,69%,42%) 0%, transparent 70%)' }} />

      {/* Desktop Sidebar */}
      <div className="hidden lg:block relative z-10">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      <MobileSidebar />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
