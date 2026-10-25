import { Outlet } from 'react-router-dom';
import { AppHeader } from './AppHeader';
import { AppSidebar } from './AppSidebar';
import { BottomNav } from './BottomNav';

export function MainLayout() {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <AppSidebar />
      <div className="flex flex-1 flex-col">
        <AppHeader />
        <main className="flex-1 p-4 pb-20 sm:p-6 md:pb-6">
          <Outlet />
        </main>
        <BottomNav />
      </div>
    </div>
  );
}

