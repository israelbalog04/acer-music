'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  MusicalNoteIcon,
  CalendarIcon,
  UserIcon,
  CloudArrowUpIcon,
  UsersIcon,
  BellIcon,
  Cog6ToothIcon,
  Bars3Icon,
  XMarkIcon,
  RectangleStackIcon
} from '@heroicons/react/24/outline';

const navigation = [
  { 
    name: 'Dashboard', 
    href: '/app', 
    icon: HomeIcon,
    section: 'main'
  },
  { 
    name: 'Répertoire', 
    href: '/app/music/repertoire', 
    icon: MusicalNoteIcon,
    section: 'music'
  },
  { 
    name: 'Upload', 
    href: '/app/music/upload', 
    icon: CloudArrowUpIcon,
    section: 'music'
  },
  { 
    name: 'Mes Enregistrements', 
    href: '/app/music/my-recordings', 
    icon: RectangleStackIcon,
    section: 'music'
  },
  { 
    name: 'Planning', 
    href: '/app/team/planning', 
    icon: CalendarIcon,
    section: 'team'
  },
  { 
    name: 'Équipe', 
    href: '/app/team/members', 
    icon: UsersIcon,
    section: 'team'
  },
  { 
    name: 'Mon Profil', 
    href: '/app/account/profile', 
    icon: UserIcon,
    section: 'account'
  },
  { 
    name: 'Notifications', 
    href: '/app/account/notifications', 
    icon: BellIcon,
    section: 'account'
  },
  { 
    name: 'Paramètres', 
    href: '/app/account/settings', 
    icon: Cog6ToothIcon,
    section: 'account'
  },
];

const sections = {
  main: { name: 'Principal', color: 'text-gray-600' },
  music: { name: 'Musique', color: 'text-blue-600' },
  team: { name: 'Équipe', color: 'text-green-600' },
  account: { name: 'Mon Compte', color: 'text-purple-600' }
};

export default function Sidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden animate-fadeInUp"
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
          fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl border-r border-gray-200 
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:inset-0
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-[#3244c7] rounded-lg flex items-center justify-center">
              <MusicalNoteIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Acer Music</h1>
              <p className="text-xs text-gray-500">Église Acer Paris</p>
            </div>
          </div>
          
          {/* Close button for mobile */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md hover:bg-gray-100"
          >
            <XMarkIcon className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* User info */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#3244c7] rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-sm">JD</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">John Doe</p>
              <p className="text-xs text-gray-500">Guitariste • Acer Paris</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6">
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
                        className={`animate-slideInLeft animate-delay-${index * 100}`}
                      >
                        <Link
                          href={item.href}
                          className={`
                            group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 hover-lift
                            ${isActive
                              ? 'bg-[#3244c7] text-white shadow-lg shadow-[#3244c7]/25'
                              : 'text-gray-700 hover:bg-gray-50 hover:text-[#3244c7]'
                            }
                          `}
                          onClick={() => setSidebarOpen(false)}
                        >
                          <div className="transition-transform duration-200 hover:scale-110 hover:rotate-6">
                            <item.icon 
                              className={`
                                mr-3 h-5 w-5 flex-shrink-0
                                ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-[#3244c7]'}
                              `} 
                            />
                          </div>
                          {item.name}
                          {item.name === 'Notifications' && (
                            <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5 animate-pulse-custom">
                              3
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
        <div className="p-4 border-t border-gray-200">
          <button className="w-full flex items-center px-3 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors">
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