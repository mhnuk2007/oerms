import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  role?: string;
  isOpen: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ role = 'ROLE_STUDENT', isOpen, onClose }) => {
  const pathname = usePathname();

  const getNavItems = (userRole: string) => {
    const commonItems = [
      { name: 'Dashboard', href: '/dashboard', icon: '📊' },
      { name: 'Profile', href: '/profile', icon: '👤' },
    ];

    switch (userRole) {
      case 'ROLE_ADMIN':
        return [
          ...commonItems,
          { name: 'User Management', href: '/admin/users', icon: '👥' },
          { name: 'Exam Management', href: '/admin/exams', icon: '📝' },
          { name: 'Results & Grading', href: '/admin/results', icon: '🎓' },
          { name: 'System Health', href: '/admin/health', icon: '🏥' },
          { name: 'Analytics', href: '/admin/analytics', icon: '📈' },
          { name: 'Proctoring Logs', href: '/admin/proctoring', icon: '👁️' },
        ];
      case 'ROLE_TEACHER':
        return [
          ...commonItems,
          { name: 'My Exams', href: '/teacher/exams', icon: '📝' },
          { name: 'Question Bank', href: '/teacher/questions', icon: '📚' },
          { name: 'Grading Queue', href: '/teacher/grading', icon: '✍️' },
          { name: 'Student Reports', href: '/teacher/reports', icon: '📉' },
        ];
      case 'ROLE_STUDENT':
      default:
        return [
          ...commonItems,
          { name: 'Available Exams', href: '/student/exams', icon: '📝' },
          { name: 'My Attempts', href: '/student/attempts', icon: '🕒' },
          { name: 'Results', href: '/student/results', icon: '🏆' },
          { name: 'Performance', href: '/student/analytics', icon: '📈' },
        ];
    }
  };

  const navItems = getNavItems(role);

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 z-30 h-screen w-64 bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-center h-16 border-b border-gray-200">
          <Link href="/" className="text-2xl font-bold text-indigo-600">
            OERMS
          </Link>
        </div>

        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-4rem)]">
          <div className="mb-4 px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Menu
          </div>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                {item.name}
              </Link>
            );
          })}

          <div className="mt-8 mb-4 px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Settings
          </div>
          <Link
            href="/settings"
            className="flex items-center px-4 py-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 hover:text-gray-900"
          >
            <span className="mr-3 text-lg">⚙️</span>
            Settings
          </Link>
          <Link
            href="/help"
            className="flex items-center px-4 py-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 hover:text-gray-900"
          >
            <span className="mr-3 text-lg">❓</span>
            Help & Support
          </Link>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;