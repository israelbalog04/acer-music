'use client';

import React from 'react';
import { 
  UserGroupIcon, 
  CloudArrowUpIcon, 
  CalendarDaysIcon,
  MusicalNoteIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowUpIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

interface UsageMetric {
  id: string;
  title: string;
  current: number;
  limit: number;
  unit: string;
  icon: React.ReactNode;
  status: 'good' | 'warning' | 'critical';
  trend?: {
    value: number;
    direction: 'up' | 'down';
    period: string;
  };
}

interface FeatureStatus {
  id: string;
  name: string;
  enabled: boolean;
  planRequired?: string;
}

export function UsageDashboard() {
  // Données simulées - à remplacer par des vraies données
  const usageMetrics: UsageMetric[] = [
    {
      id: 'members',
      title: 'Membres actifs',
      current: 18,
      limit: 25,
      unit: 'membres',
      icon: <UserGroupIcon className="w-6 h-6" />,
      status: 'good',
      trend: { value: 12, direction: 'up', period: 'ce mois' }
    },
    {
      id: 'storage',
      title: 'Stockage utilisé',
      current: 3.2,
      limit: 5,
      unit: 'GB',
      icon: <CloudArrowUpIcon className="w-6 h-6" />,
      status: 'warning',
      trend: { value: 8, direction: 'up', period: 'ce mois' }
    },
    {
      id: 'events',
      title: 'Événements ce mois',
      current: 12,
      limit: 50,
      unit: 'événements',
      icon: <CalendarDaysIcon className="w-6 h-6" />,
      status: 'good'
    },
    {
      id: 'songs',
      title: 'Chansons au répertoire',
      current: 156,
      limit: 1000,
      unit: 'chansons',
      icon: <MusicalNoteIcon className="w-6 h-6" />,
      status: 'good'
    }
  ];

  const features: FeatureStatus[] = [
    { id: 'recordings', name: 'Enregistrements', enabled: true },
    { id: 'streaming', name: 'Diffusion Live', enabled: false, planRequired: 'PROFESSIONAL' },
    { id: 'analytics', name: 'Analyses Avancées', enabled: false, planRequired: 'PROFESSIONAL' },
    { id: 'api', name: 'Accès API', enabled: false, planRequired: 'ENTERPRISE' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-50 border-green-200';
      case 'warning': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'good': return 'bg-green-500';
      case 'warning': return 'bg-orange-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getUsagePercentage = (current: number, limit: number) => {
    return Math.min((current / limit) * 100, 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Utilisation & Quotas</h2>
          <p className="text-gray-600 mt-1">
            Suivez votre utilisation et optimisez votre abonnement
          </p>
        </div>
        <div className="flex space-x-3">
          <button className="px-4 py-2 text-primary border border-primary rounded-lg hover:bg-primary/5 font-medium">
            Voir les détails
          </button>
          <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 font-medium">
            Améliorer le plan
          </button>
        </div>
      </div>

      {/* Métriques d'usage */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {usageMetrics.map((metric) => {
          const percentage = getUsagePercentage(metric.current, metric.limit);
          
          return (
            <div key={metric.id} className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg ${getStatusColor(metric.status)}`}>
                  {metric.icon}
                </div>
                {metric.status === 'warning' && (
                  <ExclamationTriangleIcon className="w-5 h-5 text-orange-500" />
                )}
                {metric.status === 'critical' && (
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
                )}
                {metric.status === 'good' && (
                  <CheckCircleIcon className="w-5 h-5 text-green-500" />
                )}
              </div>
              
              <h3 className="font-semibold text-gray-900 mb-2">{metric.title}</h3>
              
              <div className="space-y-3">
                <div className="flex items-end justify-between">
                  <span className="text-2xl font-bold text-gray-900">
                    {metric.current}
                  </span>
                  <span className="text-sm text-gray-500">
                    / {metric.limit} {metric.unit}
                  </span>
                </div>
                
                {/* Barre de progression */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(metric.status)}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                
                {/* Tendance */}
                {metric.trend && (
                  <div className="flex items-center text-xs text-gray-500">
                    <ArrowUpIcon className={`w-3 h-3 mr-1 ${
                      metric.trend.direction === 'up' ? 'text-green-500' : 'text-red-500'
                    }`} />
                    <span className={metric.trend.direction === 'up' ? 'text-green-600' : 'text-red-600'}>
                      +{metric.trend.value}%
                    </span>
                    <span className="ml-1">{metric.trend.period}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* État des fonctionnalités */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Fonctionnalités Disponibles</h3>
            <p className="text-gray-600 text-sm mt-1">
              Gérez les fonctionnalités incluses dans votre plan
            </p>
          </div>
          <SparklesIcon className="w-6 h-6 text-primary" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature) => (
            <div 
              key={feature.id} 
              className={`p-4 rounded-lg border-2 ${
                feature.enabled 
                  ? 'border-green-200 bg-green-50' 
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{feature.name}</h4>
                {feature.enabled ? (
                  <CheckCircleIcon className="w-5 h-5 text-green-500" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                )}
              </div>
              
              {feature.enabled ? (
                <span className="text-xs text-green-600 font-medium">Activé</span>
              ) : (
                <div className="space-y-1">
                  <span className="text-xs text-gray-500">Disponible avec</span>
                  <div className="text-xs bg-primary/10 text-primary px-2 py-1 rounded font-medium">
                    {feature.planRequired}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Recommandations */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <SparklesIcon className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-2">
              Optimisez votre utilisation
            </h3>
            <p className="text-gray-600 mb-4">
              Vous utilisez 64% de votre stockage. Pensez à archiver les anciens enregistrements ou à passer au plan PROFESSIONAL pour plus d'espace.
            </p>
            <div className="flex space-x-3">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                Voir les recommandations
              </button>
              <button className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg text-sm font-medium hover:bg-blue-50">
                Améliorer le plan
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}