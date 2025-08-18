'use client';

export function BrandingTest() {
  return (
    <div className="p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-brand-text mb-2">Test de Branding</h1>
        <p className="text-brand-text-secondary">
          Ce composant utilise les couleurs dynamiques du branding
        </p>
      </div>

      {/* Test des couleurs primaires */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-brand-primary text-white rounded-lg text-center">
          <div className="font-semibold">Primaire</div>
          <div className="text-sm opacity-90">brand-primary</div>
        </div>
        
        <div className="p-4 bg-brand-secondary text-white rounded-lg text-center">
          <div className="font-semibold">Secondaire</div>
          <div className="text-sm opacity-90">brand-secondary</div>
        </div>
        
        <div className="p-4 bg-brand-accent text-white rounded-lg text-center">
          <div className="font-semibold">Accent</div>
          <div className="text-sm opacity-90">brand-accent</div>
        </div>
        
        <div className="p-4 bg-brand-surface border border-gray-200 rounded-lg text-center">
          <div className="font-semibold text-brand-text">Surface</div>
          <div className="text-sm text-brand-text-secondary">brand-surface</div>
        </div>
      </div>

      {/* Test des boutons */}
      <div className="flex flex-wrap gap-4">
        <button className="px-4 py-2 bg-brand-primary text-white rounded-md hover:opacity-90 transition-opacity">
          Bouton Primaire
        </button>
        
        <button className="px-4 py-2 bg-brand-secondary text-white rounded-md hover:opacity-90 transition-opacity">
          Bouton Secondaire
        </button>
        
        <button className="px-4 py-2 border border-brand-primary text-brand-primary rounded-md hover:bg-brand-primary hover:text-white transition-colors">
          Bouton Outline
        </button>
      </div>

      {/* Test des couleurs d'état */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-3 bg-brand-success text-white rounded text-center text-sm">
          Succès
        </div>
        
        <div className="p-3 bg-brand-warning text-white rounded text-center text-sm">
          Attention
        </div>
        
        <div className="p-3 bg-brand-error text-white rounded text-center text-sm">
          Erreur
        </div>
        
        <div className="p-3 bg-brand-info text-white rounded text-center text-sm">
          Information
        </div>
      </div>

      {/* Test avec primary-xxx de Tailwind */}
      <div className="space-y-2">
        <h3 className="font-semibold text-brand-text">Test Palette Primary Tailwind :</h3>
        <div className="grid grid-cols-5 gap-2">
          <div className="p-2 bg-primary-100 text-primary-900 rounded text-xs text-center">primary-100</div>
          <div className="p-2 bg-primary-300 text-primary-900 rounded text-xs text-center">primary-300</div>
          <div className="p-2 bg-primary-500 text-white rounded text-xs text-center">primary-500</div>
          <div className="p-2 bg-primary-700 text-white rounded text-xs text-center">primary-700</div>
          <div className="p-2 bg-primary-900 text-white rounded text-xs text-center">primary-900</div>
        </div>
      </div>

      {/* Debug CSS Variables */}
      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h3 className="font-semibold mb-2">Variables CSS Actuelles :</h3>
        <div className="text-xs font-mono space-y-1">
          <div>--color-primary: <span style={{color: 'var(--color-primary)'}}>████</span></div>
          <div>--color-secondary: <span style={{color: 'var(--color-secondary)'}}>████</span></div>
          <div>--color-accent: <span style={{color: 'var(--color-accent)'}}>████</span></div>
        </div>
      </div>
    </div>
  );
}