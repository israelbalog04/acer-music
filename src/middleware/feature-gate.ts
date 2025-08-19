import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { SUBSCRIPTION_FEATURES } from '@/types/saas';

const prisma = new PrismaClient();

export interface FeatureGateConfig {
  feature: string;
  requiredPlan: 'FREE' | 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';
  redirectTo?: string;
  message?: string;
}

export class FeatureGate {
  private organizationId: string;
  private subscriptionPlan: string;
  private features: any;

  constructor(organizationId: string, subscriptionPlan: string) {
    this.organizationId = organizationId;
    this.subscriptionPlan = subscriptionPlan;
    this.features = SUBSCRIPTION_FEATURES[subscriptionPlan as keyof typeof SUBSCRIPTION_FEATURES];
  }

  // Vérifier si une fonctionnalité est disponible
  hasFeature(feature: string): boolean {
    return this.features?.features?.[feature] === true;
  }

  // Vérifier les limites (membres, stockage, etc.)
  checkLimit(limitType: 'maxMembers' | 'storageLimit', currentValue: number): boolean {
    const limit = this.features?.[limitType];
    if (limit === -1) return true; // Illimité
    return currentValue < limit;
  }

  // Obtenir les limites actuelles
  getLimits() {
    return {
      maxMembers: this.features?.maxMembers || 5,
      storageLimit: this.features?.storageLimit || 1024,
      features: this.features?.features || {}
    };
  }

  // Middleware pour protéger les routes
  static async middleware(request: NextRequest, config: FeatureGateConfig) {
    try {
      // Extraire l'organizationId depuis l'URL ou les headers
      const organizationId = request.headers.get('x-organization-id') || 
                           request.nextUrl.searchParams.get('org') ||
                           this.extractFromSubdomain(request);

      if (!organizationId) {
        return NextResponse.json(
          { error: 'Organisation non identifiée' },
          { status: 400 }
        );
      }

      // Récupérer les infos de l'organisation
      const organization = await prisma.organization.findUnique({
        where: { id: organizationId },
        select: { 
          subscriptionPlan: true, 
          subscriptionStatus: true,
          trialEndDate: true 
        }
      });

      if (!organization) {
        return NextResponse.json(
          { error: 'Organisation non trouvée' },
          { status: 404 }
        );
      }

      // Vérifier si l'abonnement est actif
      if (organization.subscriptionStatus !== 'ACTIVE' && 
          organization.subscriptionStatus !== 'TRIAL') {
        return NextResponse.json(
          { error: 'Abonnement inactif' },
          { status: 402 }
        );
      }

      // Vérifier si la période d'essai n'est pas expirée
      if (organization.subscriptionStatus === 'TRIAL' && 
          organization.trialEndDate && 
          new Date() > organization.trialEndDate) {
        return NextResponse.json(
          { error: 'Période d\'essai expirée' },
          { status: 402 }
        );
      }

      // Vérifier l'accès à la fonctionnalité
      const featureGate = new FeatureGate(organizationId, organization.subscriptionPlan);
      
      if (!featureGate.hasFeature(config.feature)) {
        return NextResponse.json(
          { 
            error: config.message || 'Fonctionnalité non disponible avec votre plan',
            requiredPlan: config.requiredPlan,
            currentPlan: organization.subscriptionPlan
          },
          { status: 403 }
        );
      }

      // Ajouter les infos de l'organisation aux headers pour les routes suivantes
      const response = NextResponse.next();
      response.headers.set('x-organization-id', organizationId);
      response.headers.set('x-subscription-plan', organization.subscriptionPlan);
      
      return response;

    } catch (error) {
      console.error('FeatureGate middleware error:', error);
      return NextResponse.json(
        { error: 'Erreur de vérification des permissions' },
        { status: 500 }
      );
    }
  }

  private static extractFromSubdomain(request: NextRequest): string | null {
    const hostname = request.nextUrl.hostname;
    const subdomain = hostname.split('.')[0];
    
    // Logique pour extraire l'organizationId depuis le subdomain
    // À implémenter selon votre logique de routing
    return null;
  }
}

// Configuration des fonctionnalités par route
export const FEATURE_GATES: Record<string, FeatureGateConfig> = {
  '/api/recordings': {
    feature: 'recordings',
    requiredPlan: 'STARTER',
    message: 'Les enregistrements nécessitent un plan STARTER ou supérieur'
  },
  '/api/sequences': {
    feature: 'sequences',
    requiredPlan: 'STARTER',
    message: 'Les partitions nécessitent un plan STARTER ou supérieur'
  },
  '/api/analytics': {
    feature: 'analytics',
    requiredPlan: 'PROFESSIONAL',
    message: 'Les analytics nécessitent un plan PROFESSIONAL ou supérieur'
  },
  '/api/streaming': {
    feature: 'streaming',
    requiredPlan: 'PROFESSIONAL',
    message: 'Le streaming nécessite un plan PROFESSIONAL ou supérieur'
  },
  '/api/merchandise': {
    feature: 'merchandise',
    requiredPlan: 'ENTERPRISE',
    message: 'La boutique nécessite un plan ENTERPRISE'
  }
};
