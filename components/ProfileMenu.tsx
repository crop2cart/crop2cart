'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';
import { ChevronDown, LogOut, History } from 'lucide-react';

export function ProfileMenu() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) {
    return null;
  }

  const userInitial = user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U';

  return (
    <div className="relative">
      {/* Profile Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white text-sm font-semibold">
          {userInitial}
        </div>
        <ChevronDown size={16} className="text-gray-600 dark:text-gray-400" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{user.name}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">{user.email}</p>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <Link
              href="/orders"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <History size={16} />
              My Orders
            </Link>

            <button
              onClick={() => {
                setIsOpen(false);
                logout();
              }}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      )}

      {/* Close menu when clicking outside */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
