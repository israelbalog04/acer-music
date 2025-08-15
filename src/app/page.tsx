'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  MusicalNoteIcon,
  MicrophoneIcon,
  CalendarIcon,
  UsersIcon,
  CloudArrowUpIcon,
  ChartBarIcon,
  SparklesIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

export default function Home() {
  const features = [
    {
      icon: <MicrophoneIcon className="h-8 w-8" />,
      title: "Enregistrements",
      description: "Uploadez et partagez vos versions instrumentales avec l'équipe"
    },
    {
      icon: <MusicalNoteIcon className="h-8 w-8" />,
      title: "Répertoire",
      description: "Accédez aux chants, séquences et versions de référence"
    },
    {
      icon: <CalendarIcon className="h-8 w-8" />,
      title: "Planning",
      description: "Gérez vos services, répétitions et disponibilités"
    },
    {
      icon: <UsersIcon className="h-8 w-8" />,
      title: "Équipe",
      description: "Coordinication et communication entre tous les musiciens"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%233244c7%22%20fill-opacity%3D%220.03%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
      
      {/* Floating elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-br from-[#3244c7]/10 to-transparent rounded-full blur-sm animate-float"></div>
        <div className="absolute top-1/3 right-20 w-16 h-16 bg-gradient-to-br from-[#a3fffb]/20 to-transparent rounded-full blur-sm animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-1/4 left-1/4 w-24 h-24 bg-gradient-to-br from-[#ffa3a3]/10 to-transparent rounded-full blur-sm animate-float" style={{animationDelay: '4s'}}></div>
      </div>

      <div className="relative z-10">
        {/* Header Section */}
        <div className="pt-16 pb-12 text-center px-4">
          {/* Logo ACER PARIS */}
          <div className="inline-flex items-center justify-center mb-8 animate-bounceIn">
            <div className="relative">
              <Image 
                src="/acer-music-logo-white.svg" 
                alt="ACER Music" 
                width={140}
                height={140}
                className="h-35 w-auto drop-shadow-xl hover:scale-105 transition-transform duration-300" 
                priority
              />
              <div className="absolute -inset-6 bg-gradient-to-r from-[#3244c7]/5 to-transparent rounded-full blur-xl -z-10"></div>
            </div>
          </div>

          {/* Main Title */}
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 animate-fadeInUp animate-delay-200">
              ACER <span className="text-[#3244c7]">Music</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-4 animate-fadeInUp animate-delay-400 font-light">
              Plateforme musicale collaborative
            </p>
            
            <p className="text-lg text-gray-500 mb-12 max-w-2xl mx-auto animate-fadeInUp animate-delay-500 leading-relaxed">
              Gérez vos enregistrements, partagez vos séquences, planifiez vos répétitions 
              et coordonnez votre équipe musicale en un seul endroit.
            </p>
          </div>

          {/* Auth Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-fadeInUp animate-delay-600">
            <Link href="/auth/login">
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full sm:w-auto"
              >
                Se connecter
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button 
                variant="primary"
                size="lg" 
                className="w-full sm:w-auto"
              >
                Créer un compte
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="max-w-6xl mx-auto px-4 pb-16">
          <div className="text-center mb-12 animate-fadeInUp animate-delay-700">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Tout ce dont votre équipe a besoin
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Des outils puissants et intuitifs pour une collaboration musicale efficace
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className={`bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-100 animate-slideInUp animate-delay-${(index + 8) * 100}`}
              >
                <div className="text-[#3244c7] mb-4 flex justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-center leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="bg-gradient-to-r from-[#3244c7]/5 via-white/50 to-[#3244c7]/5 backdrop-blur-sm py-16">
          <div className="max-w-4xl mx-auto px-4 text-center animate-fadeInUp animate-delay-1000">
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-8">
              <div className="flex items-center gap-2 text-lg font-medium text-gray-700">
                <CheckCircleIcon className="h-6 w-6 text-green-500" />
                Sécurisé & Fiable
              </div>
              <div className="flex items-center gap-2 text-lg font-medium text-gray-700">
                <SparklesIcon className="h-6 w-6 text-[#3244c7]" />
                Interface Moderne
              </div>
              <div className="flex items-center gap-2 text-lg font-medium text-gray-700">
                <CloudArrowUpIcon className="h-6 w-6 text-blue-500" />
                Cloud & Mobile
              </div>
            </div>
            <p className="text-gray-500 text-sm">
              Rejoint par des équipes musicales dans toute la France
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-8 px-4">
          <div className="max-w-2xl mx-auto">
            <p className="text-gray-400 text-sm mb-4">
              Développé avec ❤️ pour la communauté ACER Paris
            </p>
            <p className="text-gray-300 text-xs">
              &copy; 2024 ACER Paris. Tous droits réservés.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
