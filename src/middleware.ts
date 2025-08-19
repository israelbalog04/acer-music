import { NextRequest, NextResponse } from 'next/server';

// =============================================================================
// MULTI-TENANT MIDDLEWARE
// =============================================================================

export async function middleware(request: NextRequest) {
  const { pathname, hostname } = request.nextUrl;
  
  // Skip middleware for static files and API routes that don't need tenant context
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/health') ||
    pathname.startsWith('/api/webhooks')
  ) {
    return NextResponse.next();
  }

  // =============================================================================
  // TENANT RESOLUTION
  // =============================================================================
  
  // Demo mode: Skip tenant resolution and feature checks for now
  // const tenantInfo = await resolveTenant(request);
  const tenantInfo: TenantInfo | null = null;

  // =============================================================================
  // RESPONSE SETUP
  // =============================================================================
  
  const response = NextResponse.next();
  
  // Inject tenant context into headers
  if (tenantInfo) {
    response.headers.set('x-organization-id', (tenantInfo as any).id);
    response.headers.set('x-organization-slug', (tenantInfo as any).slug);
    response.headers.set('x-organization-type', (tenantInfo as any).type);
    response.headers.set('x-subscription-plan', (tenantInfo as any).subscriptionPlan);
  }

  // Security headers
  response.headers.set('x-frame-options', 'DENY');
  response.headers.set('x-content-type-options', 'nosniff');
  response.headers.set('referrer-policy', 'origin-when-cross-origin');

  return response;
}

// =============================================================================
// TENANT RESOLUTION LOGIC
// =============================================================================

interface TenantInfo {
  id: string;
  slug: string;
  type: string;
  subscriptionPlan: string;
  features: Record<string, boolean>;
  isActive: boolean;
  isSuspended: boolean;
}

async function resolveTenant(request: NextRequest): Promise<TenantInfo | null> {
  const { hostname, pathname } = request.nextUrl;
  
  try {
    // Strategy 1: Custom domain (music.acer-paris.fr)
    if (hostname !== process.env.NEXT_PUBLIC_APP_DOMAIN) {
      return await getTenantByCustomDomain(hostname);
    }
    
    // Strategy 2: Subdomain (acer-paris.musicplatform.com)
    if (hostname.includes('.')) {
      const subdomain = hostname.split('.')[0];
      if (subdomain !== 'www' && subdomain !== 'app') {
        return await getTenantBySubdomain(subdomain);
      }
    }
    
    // Strategy 3: Path-based (/org/acer-paris)
    const orgMatch = pathname.match(/^\/org\/([a-zA-Z0-9-]+)/);
    if (orgMatch) {
      return await getTenantBySlug(orgMatch[1]);
    }
    
    // Strategy 4: Query parameter (?org=acer-paris)
    const orgParam = request.nextUrl.searchParams.get('org');
    if (orgParam) {
      return await getTenantBySlug(orgParam);
    }
    
    return null;
  } catch (error) {
    console.error('Error resolving tenant:', error);
    return null;
  }
}

async function getTenantByCustomDomain(domain: string): Promise<TenantInfo | null> {
  // Implementation will connect to database
  // For now, return null to avoid compilation errors
  return null;
}

async function getTenantBySubdomain(subdomain: string): Promise<TenantInfo | null> {
  // Implementation will connect to database
  return null;
}

async function getTenantBySlug(slug: string): Promise<TenantInfo | null> {
  // Implementation will connect to database
  return null;
}

// =============================================================================
// ROUTE PROTECTION
// =============================================================================

function isPublicRoute(pathname: string): boolean {
  const publicRoutes = [
    '/',
    '/about',
    '/pricing',
    '/features',
    '/contact',
    '/auth/signin',
    '/auth/signup',
    '/auth/register',
    '/select-organization',
    '/onboarding',
    '/legal/privacy',
    '/legal/terms',
    '/unauthorized',
    '/upgrade'
  ];
  
  return publicRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );
}

function isProtectedRoute(pathname: string): boolean {
  const protectedPrefixes = [
    '/app',
    '/dashboard',
    '/admin',
    '/settings',
    '/profile',
    '/configuration'
  ];
  
  return protectedPrefixes.some(prefix => pathname.startsWith(prefix));
}

// =============================================================================
// FEATURE ACCESS CONTROL
// =============================================================================

interface FeatureCheckResult {
  allowed: boolean;
  requiredFeature?: string;
  requiredPlan?: string;
}

async function checkFeatureAccess(
  pathname: string, 
  tenant: TenantInfo
): Promise<FeatureCheckResult> {
  // Feature mapping based on routes
  const featureRoutes: Record<string, string> = {
    '/app/recordings': 'recordings',
    '/app/sequences': 'sequences',
    '/app/multimedia': 'multimedia',
    '/app/analytics': 'analytics',
    '/app/messaging': 'messaging',
    '/app/streaming': 'streaming',
    '/app/booking': 'booking',
    '/app/merchandise': 'merchandise',
  };
  
  // Check if route requires a specific feature
  const requiredFeature = Object.entries(featureRoutes).find(([route]) => 
    pathname.startsWith(route)
  )?.[1];
  
  if (requiredFeature && !tenant.features[requiredFeature]) {
    return {
      allowed: false,
      requiredFeature,
      requiredPlan: getRequiredPlanForFeature(requiredFeature)
    };
  }
  
  // Check if organization is suspended
  if (tenant.isSuspended) {
    return { allowed: false };
  }
  
  return { allowed: true };
}

function getRequiredPlanForFeature(feature: string): string {
  const featurePlans: Record<string, string> = {
    recordings: 'STARTER',
    sequences: 'STARTER',
    multimedia: 'STARTER',
    analytics: 'PROFESSIONAL',
    messaging: 'STARTER',
    streaming: 'PROFESSIONAL',
    booking: 'PROFESSIONAL',
    merchandise: 'ENTERPRISE',
  };
  
  return featurePlans[feature] || 'STARTER';
}

// =============================================================================
// CONFIGURATION
// =============================================================================

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};

// =============================================================================
// TENANT CONTEXT HOOK (for client-side)
// =============================================================================

// This will be used in a separate file
export interface TenantContextType {
  organization: {
    id: string;
    name: string;
    slug: string;
    type: string;
    branding: any;
    features: Record<string, boolean>;
    terminology: Record<string, string>;
  } | null;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    permissions: string[];
  } | null;
  isLoading: boolean;
}