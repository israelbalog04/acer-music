'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { EnvelopeIcon, LockClosedIcon, EyeIcon, EyeSlashIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showApprovalMessage, setShowApprovalMessage] = useState(false);
  
  const searchParams = useSearchParams();

  useEffect(() => {
    const message = searchParams.get('message');
    if (message === 'account-created') {
      setSuccessMessage('Votre compte a été créé avec succès ! Votre inscription est en attente de validation par l\'administrateur.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');
    setShowApprovalMessage(false);

    try {
      const result = await signIn('credentials', {
        email: email.trim(),
        password: password.trim(),
        redirect: false,
      });

      if (result?.error) {
        if (result.error === 'USER_NOT_APPROVED') {
          setShowApprovalMessage(true);
          setError('Votre compte n\'est pas encore approuvé par l\'administrateur. Veuillez patienter ou contacter l\'administrateur de votre église.');
        } else if (result.error === 'EMAIL_NOT_FOUND') {
          setError('Aucun compte trouvé avec cette adresse email. Vérifiez votre email ou créez un compte.');
        } else if (result.error === 'INVALID_PASSWORD') {
          setError('Mot de passe incorrect. Vérifiez votre mot de passe et réessayez.');
        } else {
          setError('Une erreur est survenue lors de la connexion. Veuillez réessayer.');
        }
        setLoading(false);
        return;
      }

      // Connexion réussie, redirection vers le dashboard
      window.location.href = '/app';
      
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      setError('Une erreur est survenue. Veuillez réessayer.');
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Card principale */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
        {/* Header du formulaire */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Bon retour !
          </h2>
          <p className="text-gray-600">
            Connectez-vous à votre espace musical
          </p>
        </div>

        {/* Message de succès */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">{successMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* Message d'erreur */}
        {error && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Formulaire de connexion */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Adresse email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <EnvelopeIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3244c7] focus:border-[#3244c7] transition-colors"
                placeholder="votre@email.com"
                required
              />
            </div>
          </div>

          {/* Mot de passe */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Mot de passe
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LockClosedIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3244c7] focus:border-[#3244c7] transition-colors"
                placeholder="Votre mot de passe"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>
          </div>

          {/* Options */}
          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-[#3244c7] focus:ring-[#3244c7] border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-600">Se souvenir de moi</span>
            </label>
            <Link
              href="/auth/forgot-password"
              className="text-sm text-[#3244c7] hover:text-[#2938b3] transition-colors"
            >
              Mot de passe oublié ?
            </Link>
          </div>

          {/* Bouton de connexion */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[#3244c7] hover:bg-[#2938b3] text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </Button>
        </form>

        {/* Section d'approbation admin */}
        {showApprovalMessage && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-sm font-medium text-blue-900 mb-2">
              Compte en attente d'approbation
            </h3>
            <p className="text-sm text-blue-800 mb-3">
              Votre compte a été créé mais n'est pas encore approuvé par l'administrateur de votre église. 
              Vous recevrez une notification par email une fois votre compte approuvé.
            </p>
            <div className="text-xs text-blue-600">
              💡 Vous pouvez contacter directement l'administrateur de votre église pour accélérer le processus.
            </div>
          </div>
        )}

        {/* Séparateur */}
        <div className="my-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Pas encore de compte ?</span>
            </div>
          </div>
        </div>

        {/* Lien d'inscription */}
        <div className="text-center">
          <Link
            href="/auth/register"
            className="inline-flex items-center px-4 py-2 border border-[#3244c7] text-[#3244c7] rounded-lg hover:bg-[#3244c7] hover:text-white transition-colors"
          >
            Créer un compte
          </Link>
        </div>
      </div>
    </div>
  );
}