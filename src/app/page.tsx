'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-[#3244c7]/5 rounded-full blur-xl animate-float"></div>
        <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-purple-400/5 rounded-full blur-xl animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-1/4 left-1/3 w-40 h-40 bg-blue-300/5 rounded-full blur-xl animate-float" style={{animationDelay: '4s'}}></div>
      </div>

      {/* Main Content */}
      <div className="text-center px-4 relative z-10">
        {/* Logo */}
        <div className="inline-flex items-center justify-center w-24 h-24 bg-[#3244c7] rounded-3xl shadow-2xl shadow-[#3244c7]/30 mb-8 animate-bounceIn hover-scale">
          <svg 
            className="w-12 h-12 text-white animate-float" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
        </div>

        {/* Title */}
        <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-4 animate-fadeInUp animate-delay-200">
          Acer Music
        </h1>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-md mx-auto animate-fadeInUp animate-delay-400">
          Système de gestion musicale
          <br />
          <span className="text-[#3244c7] font-semibold">Église Acer Paris</span>
        </p>

        {/* Auth Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center animate-fadeInUp animate-delay-600">
          <Link href="/auth/login">
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full sm:w-auto px-12 py-4 text-xl font-semibold border-2 border-[#3244c7] text-[#3244c7] hover:bg-[#3244c7] hover:text-white transition-all duration-300 hover-lift rounded-2xl"
            >
              Se connecter
            </Button>
          </Link>
          <Link href="/auth/register">
            <Button 
              size="lg" 
              className="w-full sm:w-auto px-12 py-4 text-xl font-semibold bg-[#3244c7] hover:bg-[#2938b3] transition-all duration-300 hover-lift shadow-2xl shadow-[#3244c7]/30 rounded-2xl"
            >
              Créer un compte
            </Button>
          </Link>
        </div>

        {/* Subtle tagline */}
        <p className="text-sm text-gray-400 mt-12 animate-fadeInUp animate-delay-700">
          Connectez-vous pour accéder à votre espace musical
        </p>
      </div>

      {/* Footer minimal */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-gray-400">
        &copy; 2024 Acer Paris
      </div>
    </div>
  );
}
