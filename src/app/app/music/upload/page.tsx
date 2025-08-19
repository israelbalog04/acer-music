'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function UploadPage() {
  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Upload d'Enregistrements
          </h1>
          <p className="text-gray-600">
            Uploadez vos enregistrements musicaux (temporairement simplifiée)
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="text-center py-8">
            <div className="text-gray-400 text-6xl mb-4">🎵</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Fonctionnalité en cours de développement
            </h3>
            <p className="text-gray-600 mb-6">
              L'interface d'upload complète sera bientôt disponible
            </p>
            <Link href="/app">
              <Button>
                Retour au tableau de bord
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}