'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function UsersNavItem() {
  const pathname = usePathname();
  const isActive = pathname === '/users';

  return (
    <Link
      href="/users"
      className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
        isActive
          ? 'bg-blue-100 text-blue-900'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      }`}
    >
      <svg
        className={`mr-3 h-5 w-5 transition-colors duration-200 ${
          isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
        }`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
        />
      </svg>
      Usuarios
    </Link>
  );
}
