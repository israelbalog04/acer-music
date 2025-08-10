'use client';

import { ReactNode } from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export default function StatsCard({
  title,
  value,
  icon,
  color = 'blue',
  trend,
  className = ''
}: StatsCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-600',
    green: 'bg-green-50 border-green-200 text-green-600',
    purple: 'bg-purple-50 border-purple-200 text-purple-600',
    orange: 'bg-orange-50 border-orange-200 text-orange-600',
    red: 'bg-red-50 border-red-200 text-red-600'
  };

  const valueColorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    orange: 'text-orange-600',
    red: 'text-red-600'
  };

  return (
    <div className={`bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <div className="flex items-baseline space-x-2">
            <span className={`text-2xl font-bold ${valueColorClasses[color]}`}>
              {value}
            </span>
            {trend && (
              <span className={`text-sm font-medium flex items-center space-x-1 ${
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              }`}>
                <span>{trend.isPositive ? '↗' : '↘'}</span>
                <span>{Math.abs(trend.value)}%</span>
              </span>
            )}
          </div>
        </div>
        {icon && (
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

// Composant pour les cartes de statistiques avec gradient
interface GradientStatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  gradient: 'blue' | 'green' | 'purple' | 'orange' | 'red';
  icon?: ReactNode;
  className?: string;
}

export function GradientStatsCard({
  title,
  value,
  subtitle,
  gradient,
  icon,
  className = ''
}: GradientStatsCardProps) {
  const gradientClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
    red: 'from-red-500 to-red-600'
  };

  return (
    <div className={`bg-gradient-to-br ${gradientClasses[gradient]} rounded-xl p-6 text-white shadow-lg ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-white/80 mb-1">{title}</p>
          <p className="text-3xl font-bold mb-1">{value}</p>
          {subtitle && (
            <p className="text-sm text-white/70">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

// Composant pour les cartes de statistiques simples
interface SimpleStatsCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  className?: string;
}

export function SimpleStatsCard({
  title,
  value,
  icon,
  className = ''
}: SimpleStatsCardProps) {
  return (
    <div className={`bg-white rounded-xl p-4 shadow-sm border border-gray-100 ${className}`}>
      <div className="text-center">
        {icon && (
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            {icon}
          </div>
        )}
        <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
        <p className="text-sm text-gray-600">{title}</p>
      </div>
    </div>
  );
}
