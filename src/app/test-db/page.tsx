import { testPrismaConnection } from '@/lib/test-prisma'

export default async function TestDBPage() {
  const result = await testPrismaConnection()

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Test de la Base de Données</h1>
        
        {result.success ? (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
              <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
              <h2 className="text-xl font-semibold text-green-700">Connexion réussie</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{result.userCount}</div>
                <div className="text-sm text-blue-700">Utilisateurs</div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{result.songCount}</div>
                <div className="text-sm text-green-700">Chants</div>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{result.teamCount}</div>
                <div className="text-sm text-purple-700">Équipes</div>
              </div>
              
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{result.scheduleCount}</div>
                <div className="text-sm text-orange-700">Plannings</div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-2">Actions disponibles :</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• <a href="http://localhost:5555" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Ouvrir Prisma Studio</a> pour gérer la base de données</p>
                <p>• <code className="bg-gray-200 px-2 py-1 rounded">npm run db:seed</code> pour ajouter des données de test</p>
                <p>• <code className="bg-gray-200 px-2 py-1 rounded">npm run db:push</code> pour synchroniser le schéma</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
              <div className="w-4 h-4 bg-red-500 rounded-full mr-3"></div>
              <h2 className="text-xl font-semibold text-red-700">Erreur de connexion</h2>
            </div>
            
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-red-700">{result.error}</p>
            </div>
            
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-2">Actions à effectuer :</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• Vérifier que la base de données SQLite existe : <code className="bg-gray-200 px-2 py-1 rounded">ls prisma/dev.db</code></p>
                <p>• Régénérer le client Prisma : <code className="bg-gray-200 px-2 py-1 rounded">npm run db:generate</code></p>
                <p>• Pousser le schéma : <code className="bg-gray-200 px-2 py-1 rounded">npm run db:push</code></p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 