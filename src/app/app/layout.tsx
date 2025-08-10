import Sidebar from '@/components/layout/sidebar';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { ContextualNav } from '@/components/ui/contextual-nav';
import { SectionIndicator } from '@/components/ui/section-indicator';
import { PageTransition } from '@/components/ui/page-transition';
import { Toaster } from '@/components/ui/toaster';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50 overflow-hidden">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden lg:ml-0 relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23999%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
        </div>
        
        {/* Content Container */}
        <div className="flex-1 overflow-auto relative z-10">
          <div className="p-6 lg:p-8 pt-20 lg:pt-8 min-h-full">
            {/* Navigation Components */}
            <div className="space-y-4 mb-8">
              <Breadcrumb />
              <ContextualNav />
              <SectionIndicator />
            </div>
            
            {/* Page Content with Enhanced Transitions */}
            <PageTransition>
              <div className="animate-fadeInUp">
                {children}
              </div>
            </PageTransition>
          </div>
        </div>
        
        {/* Floating Action Button for Mobile */}
        <div className="lg:hidden fixed bottom-6 right-6 z-50">
          <button className="w-14 h-14 bg-primary-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-primary-200">
            <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
        </div>
      </main>
      
      {/* Toast Notifications */}
      <Toaster />
      
      {/* Loading Overlay */}
      <div id="loading-overlay" className="fixed inset-0 bg-white bg-opacity-90 z-[9999] flex items-center justify-center hidden">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-neutral-600 font-medium">Chargement...</p>
        </div>
      </div>
    </div>
  );
}