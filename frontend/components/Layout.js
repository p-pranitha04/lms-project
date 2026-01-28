'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getUser, clearAuth, hasRole } from '../utils/auth';
import Link from 'next/link';
import { FiHome, FiBook, FiFileText, FiCalendar, FiBell, FiLogOut, FiUser, FiMenu, FiX } from 'react-icons/fi';

export default function Layout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const currentUser = getUser();
    if (!currentUser) {
      router.push('/login');
    } else {
      setUser(currentUser);
    }
  }, [router]);

  const handleLogout = () => {
    clearAuth();
    router.push('/login');
  };

  if (!user) {
    return null;
  }

  const isStudent = hasRole('student');
  const isInstructor = hasRole('instructor') || hasRole('admin');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
              </button>
              <Link href="/dashboard" className="ml-4 lg:ml-0 flex items-center">
                <h1 className="text-xl font-bold text-primary-700">LMS Platform</h1>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-700">
                <FiUser className="text-gray-500" />
                <span>{user.firstName} {user.lastName}</span>
                <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs">
                  {user.role}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiLogOut />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:transition-none`}
        >
          <div className="h-full pt-16 lg:pt-0 overflow-y-auto">
            <nav className="px-4 py-6 space-y-2">
              <Link
                href="/dashboard"
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  pathname === '/dashboard'
                    ? 'bg-primary-100 text-primary-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <FiHome />
                <span>Dashboard</span>
              </Link>

              <Link
                href="/courses"
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  pathname.startsWith('/courses')
                    ? 'bg-primary-100 text-primary-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <FiBook />
                <span>Courses</span>
              </Link>

              {isInstructor && (
                <>
                  <Link
                    href="/assignments/create"
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      pathname.startsWith('/assignments')
                        ? 'bg-primary-100 text-primary-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <FiFileText />
                    <span>Create Assignment</span>
                  </Link>
                </>
              )}

              <Link
                href="/calendar"
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  pathname === '/calendar'
                    ? 'bg-primary-100 text-primary-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <FiCalendar />
                <span>Calendar</span>
              </Link>
            </nav>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 lg:ml-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
