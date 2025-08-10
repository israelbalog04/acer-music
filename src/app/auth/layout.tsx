export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Contenu principal */}
      <div className="min-h-screen flex flex-col">
        {/* Header avec logo */}
        <header className="p-8">
          <div className="max-w-md mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#3244c7] rounded-2xl shadow-lg mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Acer Music</h1>
            <p className="text-gray-600 text-sm">Église Acer Paris</p>
          </div>
        </header>

        {/* Contenu principal centré */}
        <main className="flex-1 flex items-center justify-center px-4 pb-12">
          <div className="w-full max-w-md">
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="p-8 text-center">
          <p className="text-gray-500 text-sm">
            © 2024 Acer Paris. Tous droits réservés.
          </p>
        </footer>
      </div>
    </div>
  );
}