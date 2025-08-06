import Sidebar from '@/components/layout/sidebar';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { ContextualNav } from '@/components/ui/contextual-nav';
import { SectionIndicator } from '@/components/ui/section-indicator';
import { PageTransition } from '@/components/ui/page-transition';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        <div className="flex-1 overflow-auto">
          <div className="p-6 lg:p-8 pt-20 lg:pt-8">
            <Breadcrumb />
            <ContextualNav />
            <SectionIndicator />
            <PageTransition>
              {children}
            </PageTransition>
          </div>
        </div>
      </main>
    </div>
  );
}