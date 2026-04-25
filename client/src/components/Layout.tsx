import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import { useInactivityLogout } from '../hooks/useInactivityLogout';

export default function Layout() {
  useInactivityLogout();
  return (
    <div className="min-h-screen bg-bg">
      <Sidebar />
      <TopNav />
      <main
        className="min-h-screen"
        style={{ paddingLeft: '256px', paddingTop: '64px' }}
      >
        <div className="p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
