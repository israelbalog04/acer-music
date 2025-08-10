'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  UserIcon, 
  EnvelopeIcon, 
  LockClosedIcon, 
  PhoneIcon,
  MusicalNoteIcon,
  EyeIcon,
  EyeSlashIcon,
  BuildingOfficeIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

interface Church {
  id: string;
  name: string;
  city: string;
}

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'musicien',
    instruments: [] as string[],
    churchId: '',
    acceptTerms: false,
    newsletter: true
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [churches, setChurches] = useState<Church[]>([]);
  const [loadingChurches, setLoadingChurches] = useState(true);

  const instruments = [
    'Piano', 'Guitare', 'Basse', 'Batterie', 'Chant',
    'Violon', 'Saxophone', 'Trompette', 'Flûte', 'Autre'
  ];

  // Charger les églises disponibles
  useEffect(() => {
    const fetchChurches = async () => {
      try {
        const response = await fetch('/api/churches');
        if (response.ok) {
          const data = await response.json();
          setChurches(data);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des églises:', error);
      } finally {
        setLoadingChurches(false);
      }
    };

    fetchChurches();
  }, []);

  const handleInstrumentChange = (instrument: string) => {
    setFormData(prev => ({
      ...prev,
      instruments: prev.instruments.includes(instrument)
        ? prev.instruments.filter(i => i !== instrument)
        : [...prev.instruments, instrument]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      setLoading(false);
      return;
    }

    if (!formData.churchId) {
      setError('Veuillez sélectionner une église');
      setLoading(false);
      return;
    }

    if (!formData.acceptTerms) {
      setError('Vous devez accepter les conditions d\'utilisation');
      setLoading(false);
      return;
    }

    try {
      // Appel à l'API d'inscription
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          role: formData.role,
          instruments: formData.instruments,
          churchId: formData.churchId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Une erreur est survenue');
        setLoading(false);
        return;
      }

      // Compte créé avec succès, redirection vers la page de connexion
      window.location.href = '/auth/login?message=account-created';
      
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      setError('Une erreur est survenue. Veuillez réessayer.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo et titre */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <MusicalNoteIcon className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Rejoignez ACER Music
          </h1>
          <p className="text-gray-600">
            Créez votre compte et rejoignez votre communauté musicale
          </p>
        </div>

        {/* Card principale */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          {error && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-6">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informations personnelles */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <UserIcon className="h-5 w-5" />
                Informations personnelles
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prénom <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#3244c7] focus:border-[#3244c7] transition-all duration-300"
                    placeholder="Votre prénom"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#3244c7] focus:border-[#3244c7] transition-all duration-300"
                    placeholder="Votre nom"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#3244c7] focus:border-[#3244c7] transition-all duration-300"
                    placeholder="votre@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone
                </label>
                <div className="relative">
                  <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#3244c7] focus:border-[#3244c7] transition-all duration-300"
                    placeholder="+33 6 12 34 56 78"
                  />
                </div>
              </div>
            </div>

            {/* Église */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <BuildingOfficeIcon className="h-4 w-4" />
                Votre église <span className="text-red-500">*</span>
              </label>
              {loadingChurches ? (
                <div className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#3244c7] focus:border-[#3244c7] transition-all duration-300">
                  Chargement des églises...
                </div>
              ) : churches.length === 0 ? (
                <p className="text-sm text-gray-500">Aucune église trouvée. Veuillez contacter l'administrateur.</p>
              ) : (
                <select
                  value={formData.churchId}
                  onChange={(e) => setFormData(prev => ({ ...prev, churchId: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#3244c7] focus:border-[#3244c7] transition-all duration-300"
                  required
                >
                  <option value="">Sélectionnez votre église</option>
                  {churches.map((church) => (
                    <option key={church.id} value={church.id} className="bg-white">
                      {church.name} ({church.city})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Rôle et instruments */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <MusicalNoteIcon className="h-5 w-5" />
                Rôle et instruments
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Votre rôle <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'musicien', label: 'Musicien', description: 'Joueur d\'instrument ou chanteur' },
                    { value: 'chef-louange', label: 'Chef de Louange', description: 'Direction musicale et spirituelle' },
                    { value: 'technicien', label: 'Technicien', description: 'Son, lumière, vidéo' },
                    { value: 'admin', label: 'Administrateur', description: 'Gestion de l\'église (auto-approuvé)' },
                    { value: 'super-admin', label: 'Super Administrateur', description: 'Gestion de toutes les églises (auto-approuvé)' }
                  ].map((role) => (
                    <label key={role.value} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                      <input
                        type="radio"
                        name="role"
                        value={role.value}
                        checked={formData.role === role.value}
                        onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                        className="mt-1 h-4 w-4 text-[#3244c7] focus:ring-[#3244c7] border-gray-300"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{role.label}</span>
                          {(role.value === 'admin' || role.value === 'super-admin') && (
                            <ShieldCheckIcon className="h-4 w-4 text-green-600" title="Auto-approuvé" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{role.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instruments que vous pratiquez
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {instruments.map((instrument) => (
                    <label key={instrument} className="flex items-center space-x-2 p-2 border border-gray-200 rounded hover:bg-gray-50 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={formData.instruments.includes(instrument)}
                        onChange={() => handleInstrumentChange(instrument)}
                        className="h-4 w-4 text-[#3244c7] focus:ring-[#3244c7] border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">{instrument}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Mots de passe */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <LockClosedIcon className="h-5 w-5" />
                Sécurité
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mot de passe <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#3244c7] focus:border-[#3244c7] transition-all duration-300"
                    placeholder="Au moins 6 caractères"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmer le mot de passe <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#3244c7] focus:border-[#3244c7] transition-all duration-300"
                    placeholder="Répétez votre mot de passe"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Conditions et newsletter */}
            <div className="space-y-4">
              <label className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={formData.acceptTerms}
                  onChange={(e) => setFormData(prev => ({ ...prev, acceptTerms: e.target.checked }))}
                  className="mt-1 h-4 w-4 text-[#3244c7] focus:ring-[#3244c7] border-gray-300 rounded"
                  required
                />
                <span className="text-sm text-gray-700">
                  J'accepte les{' '}
                  <Link href="/terms" className="text-[#3244c7] hover:underline">
                    conditions d'utilisation
                  </Link>{' '}
                  et la{' '}
                  <Link href="/privacy" className="text-[#3244c7] hover:underline">
                    politique de confidentialité
                  </Link>
                  <span className="text-red-500"> *</span>
                </span>
              </label>

              <label className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={formData.newsletter}
                  onChange={(e) => setFormData(prev => ({ ...prev, newsletter: e.target.checked }))}
                  className="mt-1 h-4 w-4 text-[#3244c7] focus:ring-[#3244c7] border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">
                  Je souhaite recevoir les actualités et événements de mon église par email
                </span>
              </label>
            </div>

            {/* Bouton d'inscription */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#3244c7] to-[#6366f1] hover:from-[#2938b3] hover:to-[#5855eb] text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? 'Création du compte...' : 'Créer mon compte'}
            </Button>
          </form>

          {/* Lien de connexion */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Déjà un compte ?{' '}
              <Link href="/auth/login" className="text-[#3244c7] hover:underline font-medium">
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}