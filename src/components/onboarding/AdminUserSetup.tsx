'use client';

import React, { useState } from 'react';

interface AdminUser {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

interface AdminUserSetupProps {
  data?: AdminUser;
  onChange: (data: AdminUser) => void;
}

export function AdminUserSetup({ data, onChange }: AdminUserSetupProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const adminData = data || {
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  };

  const handleChange = (field: keyof AdminUser, value: string) => {
    const updated = { ...adminData, [field]: value };
    onChange(updated);

    if (field === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
  };

  const calculatePasswordStrength = (password: string): number => {
    let strength = 0;
    
    if (password.length >= 8) strength += 1;
    if (password.length >= 12) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    return Math.min(strength, 4);
  };

  const getPasswordStrengthLabel = (strength: number): string => {
    const labels = ['Très faible', 'Faible', 'Moyen', 'Fort', 'Très fort'];
    return labels[strength] || 'Très faible';
  };

  const getPasswordStrengthColor = (strength: number): string => {
    const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-green-600'];
    return colors[strength] || 'bg-gray-300';
  };

  const isEmailValid = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isFormValid = (): boolean => {
    return !!(
      adminData.firstName.trim() &&
      adminData.lastName.trim() &&
      isEmailValid(adminData.email) &&
      adminData.password.length >= 8
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Créez votre compte administrateur
        </h3>
        <p className="text-gray-600">
          Ce sera le compte principal pour gérer votre organisation
        </p>
      </div>

      <div className="max-w-md mx-auto space-y-6">
        {/* Prénom */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Prénom *
          </label>
          <input
            type="text"
            value={adminData.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            placeholder="Votre prénom"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            required
          />
        </div>

        {/* Nom */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nom *
          </label>
          <input
            type="text"
            value={adminData.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            placeholder="Votre nom"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            required
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Adresse email *
          </label>
          <input
            type="email"
            value={adminData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="votre@email.com"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
              adminData.email && !isEmailValid(adminData.email)
                ? 'border-red-300 focus:ring-red-500'
                : 'border-gray-300'
            }`}
            required
          />
          {adminData.email && !isEmailValid(adminData.email) && (
            <p className="text-sm text-red-600 mt-1">
              Veuillez entrer une adresse email valide
            </p>
          )}
        </div>

        {/* Mot de passe */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mot de passe *
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={adminData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              placeholder="Créez un mot de passe sécurisé"
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showPassword ? (
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>

          {/* Password strength indicator */}
          {adminData.password && (
            <div className="mt-2">
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor(passwordStrength)}`}
                    style={{ width: `${(passwordStrength / 4) * 100}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600">
                  {getPasswordStrengthLabel(passwordStrength)}
                </span>
              </div>
            </div>
          )}

          {/* Password requirements */}
          <div className="mt-3 text-xs text-gray-500 space-y-1">
            <p>Le mot de passe doit contenir :</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li className={adminData.password.length >= 8 ? 'text-green-600' : ''}>
                Au moins 8 caractères
              </li>
              <li className={/[a-z]/.test(adminData.password) ? 'text-green-600' : ''}>
                Une lettre minuscule
              </li>
              <li className={/[A-Z]/.test(adminData.password) ? 'text-green-600' : ''}>
                Une lettre majuscule
              </li>
              <li className={/[0-9]/.test(adminData.password) ? 'text-green-600' : ''}>
                Un chiffre
              </li>
            </ul>
          </div>
        </div>

        {/* Permissions info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-blue-400 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <h4 className="text-sm font-medium text-blue-900 mb-1">
                Permissions administrateur
              </h4>
              <p className="text-sm text-blue-700">
                En tant qu'administrateur, vous aurez accès à toutes les fonctionnalités 
                et pourrez inviter d'autres membres à rejoindre votre organisation.
              </p>
            </div>
          </div>
        </div>

        {/* Form validation summary */}
        {!isFormValid() && (
          <div className="text-center">
            <p className="text-sm text-gray-500">
              Veuillez remplir tous les champs requis pour continuer
            </p>
          </div>
        )}
      </div>
    </div>
  );
}