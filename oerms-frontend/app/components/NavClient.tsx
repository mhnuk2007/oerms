"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useState, useEffect } from "react";
import { getCurrentUser, clearToken, mapPayloadToUser } from "../../lib/auth";
import { useAuth } from "./AuthProvider";

type AuthUser = { id: string; email: string; roles?: string[]; name?: string } | null;

export default function NavClient() {
  const path = usePathname() || "/";
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const signOut = useCallback(async () => {
    await logout();
    window.location.href = '/login';
  }, [logout]);

  const toggleMenu = useCallback(() => {
    setIsMenuOpen(prev => !prev);
  }, []);

  const getRoleDisplayName = (role: string) => {
    const roleMap: Record<string, string> = {
      'ADMIN': 'Administrator',
      'TEACHER': 'Teacher',
      'STUDENT': 'Student'
    };
    return roleMap[role] || role;
  };

  const getRoleColor = (role: string) => {
    const colorMap: Record<string, string> = {
      'ADMIN': 'text-red-600 bg-red-50',
      'TEACHER': 'text-blue-600 bg-blue-50',
      'STUDENT': 'text-green-600 bg-green-50'
    };
    return colorMap[role] || 'text-gray-600 bg-gray-50';
  };

  return (
    <nav className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 sticky top-0 z-50">
      <div className="container">
        <div className="flex justify-between h-16 items-center">
          {/* Logo and Brand */}
          <div className="flex items-center gap-6">
            <Link 
              href="/" 
              className="flex items-center gap-2 font-bold text-xl text-neutral-900 dark:text-white hover:text-primary-600 transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">O</span>
              </div>
              OERMS
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {user?.roles?.includes('ADMIN') && (
                <Link 
                  href="/admin/dashboard" 
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    path.startsWith('/admin') 
                      ? 'text-primary-600 bg-primary-50' 
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                  }`}
                >
                  Admin
                </Link>
              )}
              {user?.roles?.includes('TEACHER') && (
                <Link 
                  href="/teacher/dashboard" 
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    path.startsWith('/teacher') 
                      ? 'text-primary-600 bg-primary-50' 
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                  }`}
                >
                  Teacher
                </Link>
              )}
              {user?.roles?.includes('STUDENT') && (
                <Link 
                  href="/student/dashboard" 
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    path.startsWith('/student') 
                      ? 'text-primary-600 bg-primary-50' 
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                  }`}
                >
                  Student
                </Link>
              )}
            </div>
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                {/* User Info - Desktop */}
                <div className="hidden sm:flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm font-medium text-neutral-900 dark:text-white">
                      {user.name || user.email}
                    </div>
                    <div className="flex gap-1">
                      {user.roles?.map((role) => (
                        <span 
                          key={role}
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(role)}`}
                        >
                          {getRoleDisplayName(role)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* User Avatar and Dropdown */}
                <div className="relative">
                  <button
                    onClick={toggleMenu}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    aria-label="User menu"
                  >
                    <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                      <span className="text-primary-600 dark:text-primary-400 font-semibold text-sm">
                        {(user.name || user.email).charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <svg 
                      className={`w-4 h-4 text-neutral-500 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700 py-1 z-50">
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Profile Settings
                      </Link>
                      <button
                        onClick={signOut}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link 
                  href="/login" 
                  className="btn btn-outline btn-sm"
                >
                  Sign In
                </Link>
                <Link 
                  href="/register" 
                  className="btn btn-primary btn-sm"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              className="md:hidden p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              aria-label="Toggle menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-neutral-200 dark:border-neutral-800 py-4">
            <div className="space-y-2">
              {user?.roles?.includes('ADMIN') && (
                <Link 
                  href="/admin/dashboard" 
                  className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    path.startsWith('/admin') 
                      ? 'text-primary-600 bg-primary-50' 
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Admin Dashboard
                </Link>
              )}
              {user?.roles?.includes('TEACHER') && (
                <Link 
                  href="/teacher/dashboard" 
                  className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    path.startsWith('/teacher') 
                      ? 'text-primary-600 bg-primary-50' 
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Teacher Dashboard
                </Link>
              )}
              {user?.roles?.includes('STUDENT') && (
                <Link 
                  href="/student/dashboard" 
                  className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    path.startsWith('/student') 
                      ? 'text-primary-600 bg-primary-50' 
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Student Dashboard
                </Link>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close menu */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </nav>
  );
}
