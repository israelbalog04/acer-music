'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import Image from 'next/image';
import { useUserData } from '@/hooks/useUserData';
import { useNotifications } from '@/hooks/useNotifications';
import { getNavigationForRole } from '@/lib/permissions';
import NotificationBadge from '@/components/ui/notification-badge';
import {
  HomeIcon,
  MusicalNoteIcon,
  CalendarIcon,
  UserIcon,
  CloudArrowUpIcon,
  UsersIcon,
  UserGroupIcon,
  BellIcon,
  Cog6ToothIcon,
  Bars3Icon,
  XMarkIcon,
  RectangleStackIcon,
  ChartBarIcon,
  PlusIcon,
  ClockIcon,
  StarIcon,
  MicrophoneIcon,
  PhotoIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';

// Mapping des icônes
const iconMap: Record<string, any> = {
  HomeIcon,
  MusicalNoteIcon,
  CalendarIcon,
  UserIcon,
  CloudArrowUpIcon,
  UsersIcon,
  UserGroupIcon,
  BellIcon,
  Cog6ToothIcon,
  RectangleStackIcon,
  ChartBarIcon,
  PlusIcon,
  ClockIcon,
  StarIcon,
  MicrophoneIcon,
  PhotoIcon,
  BuildingOfficeIcon
};

const sections: Record<string, { name: string; color: string }> = {
  main: { name: 'Principal', color: 'text-gray-700' },
  admin: { name: 'Administration', color: 'text-[#3244c7]' },
  music: { name: 'Musique', color: 'text-[#3244c7]' },
  planning: { name: 'Planning', color: 'text-[#3244c7]' },
  team: { name: 'Équipe', color: 'text-[#3244c7]' },
  account: { name: 'Mon Compte', color: 'text-[#3244c7]' },
  'super-admin': { name: 'Super Administration', color: 'text-[#3244c7]' }
};

export default function Sidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { userName, initials, primaryInstrument, userRole, churchName, churchCity, userAvatar } = useUserData();
  const { unreadCount, refetch } = useNotifications();

  // Navigation dynamique basée sur le rôle
  const navigation = userRole ? getNavigationForRole(userRole).map(item => ({
    ...item,
    icon: iconMap[item.icon] || HomeIcon
  })) : [];

  return (
    <>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 modal-overlay z-40 lg:hidden animate-fadeInUp"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(true)}
          className="bg-white p-2 rounded-lg shadow-lg border border-gray-200 hover-scale active:scale-95 transition-transform duration-100"
        >
          <Bars3Icon className="h-6 w-6 text-gray-600" />
        </button>
      </div>

      {/* Sidebar */}
      <div 
        className={`
          fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl
          transform transition-all duration-300 ease-in-out flex flex-col
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:inset-0
        `}
        style={{
          boxShadow: '2px 0 24px -12px rgba(50, 68, 199, 0.15)'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-20 px-6 bg-gradient-to-r from-white to-gray-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
              <Image 
                src="/acer-music-logo.svg" 
                alt="ACER Music" 
                width={40}
                height={40}
                className="w-full h-full object-cover" 
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">ACER Music</h1>
              <p className="text-sm text-gray-600 font-medium">{churchName || 'ACER Paris'}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Notification Badge */}
            <NotificationBadge onNotificationUpdate={refetch} />
            
            {/* Close button for mobile */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded-md hover:bg-gray-100"
            >
              <XMarkIcon className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* User info */}
        <div className="flex-shrink-0 p-6 bg-gradient-to-r from-gray-50/50 to-white">
          <div className="flex items-center space-x-3">
            {userAvatar ? (
              <Image
                src={userAvatar}
                alt={userName || 'Utilisateur'}
                width={40}
                height={40}
                className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
              />
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-[#3244c7] to-[#2938a8] rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-base">
                  {initials}
                </span>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-gray-900">
                {userName || 'Utilisateur'}
              </p>
              <p className="text-xs text-gray-500">
                {primaryInstrument} • {churchName || 'Acer Paris'}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-6">
          {Object.entries(sections).map(([sectionKey, section]) => {
            const sectionItems = navigation.filter(item => item.section === sectionKey);
            if (sectionItems.length === 0) return null;
            
            return (
              <div key={sectionKey} className="mb-6">
                <h3 className={`px-3 mb-2 text-xs font-semibold tracking-wider uppercase ${section.color}`}>
                  {section.name}
                </h3>
                <div className="space-y-1">
                  {sectionItems.map((item, index) => {
                    const isActive = pathname === item.href;
                    return (
                      <div
                        key={item.name}
                        className="mb-1"
                      >
                        <Link
                          href={item.href}
                          className={`
                            flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors duration-150
                            ${isActive
                              ? 'bg-[#3244c7] text-white'
                              : 'text-gray-700 hover:bg-gray-100 hover:text-[#3244c7]'
                            }
                          `}
                          onClick={() => setSidebarOpen(false)}
                        >
                          <item.icon 
                            className={`
                              mr-3 h-5 w-5 flex-shrink-0
                              ${isActive ? 'text-white' : 'text-gray-500'}
                            `} 
                          />
                          <span>{item.name}</span>
                          {item.name === 'Notifications' && unreadCount > 0 && (
                            <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5 animate-pulse-custom">
                              {unreadCount}
                            </span>
                          )}
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="flex-shrink-0 p-4 bg-gradient-to-r from-gray-50/50 to-white">
          <button 
            onClick={() => signOut({ callbackUrl: '/' })}
            className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 rounded-xl transition-all duration-200 hover:shadow-sm"
          >
            <svg className="mr-3 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Se déconnecter
          </button>
        </div>
      </div>
    </>
  );
}