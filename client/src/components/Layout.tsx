import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNav from './TopNav';

export default function Layout() {
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
