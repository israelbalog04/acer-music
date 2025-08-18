import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { pooledPrisma as prisma } from '@/lib/prisma-pool';
import { BrandingConfig, validateBrandingConfig, DEFAULT_BRANDING_CONFIG } from '@/types/branding';

// GET /api/branding/[organizationId] - Récupérer la configuration de branding
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ organizationId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.churchId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { organizationId } = await context.params;

    // Vérifier que l'utilisateur appartient à cette organisation
    if (session.user.churchId !== organizationId) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    // Récupérer la configuration de l'organisation
    const organization = await prisma.church.findUnique({
      where: { id: organizationId },
      select: {
        id: true,
        name: true,
        brandingConfig: true,
        customDomain: true,
        subdomain: true,
        updatedAt: true
      }
    });

    if (!organization) {
      return NextResponse.json({ error: 'Organisation non trouvée' }, { status: 404 });
    }

    // Parser la configuration ou utiliser les valeurs par défaut
    let config: BrandingConfig;
    if (organization.brandingConfig) {
      try {
        config = JSON.parse(organization.brandingConfig);
        // Assurer la compatibilité avec les nouvelles versions
        config = { ...DEFAULT_BRANDING_CONFIG, ...config };
      } catch (error) {
        console.warn('Configuration de branding corrompue, utilisation des valeurs par défaut');
        config = DEFAULT_BRANDING_CONFIG;
      }
    } else {
      config = DEFAULT_BRANDING_CONFIG;
    }

    // Mettre à jour l'organizationId
    config.organizationId = organizationId;

    return NextResponse.json({
      config,
      organization: {
        id: organization.id,
        name: organization.name,
        customDomain: organization.customDomain,
        subdomain: organization.subdomain,
        lastUpdated: organization.updatedAt
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération de la configuration:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// PUT /api/branding/[organizationId] - Mettre à jour la configuration de branding
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ organizationId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.churchId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { organizationId } = await context.params;

    // Vérifier que l'utilisateur appartient à cette organisation
    if (session.user.churchId !== organizationId) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    // Vérifier les permissions - seuls les ADMIN peuvent modifier le branding
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ 
        error: 'Permissions insuffisantes. Seuls les administrateurs peuvent modifier l\'apparence.' 
      }, { status: 403 });
    }

    const body = await request.json();
    const { config } = body;

    if (!config) {
      return NextResponse.json({ error: 'Configuration manquante' }, { status: 400 });
    }

    // Valider la configuration
    const validation = validateBrandingConfig(config);
    if (!validation.valid) {
      return NextResponse.json({ 
        error: 'Configuration invalide', 
        details: validation.errors 
      }, { status: 400 });
    }

    // Vérifier que l'organisation existe
    const organization = await prisma.church.findUnique({
      where: { id: organizationId }
    });

    if (!organization) {
      return NextResponse.json({ error: 'Organisation non trouvée' }, { status: 404 });
    }

    // Mettre à jour la configuration
    const updatedConfig = {
      ...config,
      organizationId,
      lastUpdated: new Date().toISOString(),
      version: '1.0.0'
    };

    const updatedOrganization = await prisma.church.update({
      where: { id: organizationId },
      data: {
        brandingConfig: JSON.stringify(updatedConfig),
        updatedAt: new Date()
      },
      select: {
        id: true,
        name: true,
        brandingConfig: true,
        updatedAt: true
      }
    });

    // Log de l'activité
    console.log(`🎨 Configuration de branding mise à jour pour ${organization.name} par ${session.user.email}`);

    return NextResponse.json({
      success: true,
      config: updatedConfig,
      organization: {
        id: updatedOrganization.id,
        name: updatedOrganization.name,
        lastUpdated: updatedOrganization.updatedAt
      },
      warnings: validation.warnings
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour de la configuration:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// DELETE /api/branding/[organizationId] - Réinitialiser la configuration
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ organizationId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.churchId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { organizationId } = await context.params;

    // Vérifier que l'utilisateur appartient à cette organisation
    if (session.user.churchId !== organizationId) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    // Vérifier les permissions - seuls les ADMIN peuvent réinitialiser
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ 
        error: 'Permissions insuffisantes' 
      }, { status: 403 });
    }

    // Réinitialiser à la configuration par défaut
    const defaultConfig = {
      ...DEFAULT_BRANDING_CONFIG,
      organizationId,
      lastUpdated: new Date().toISOString()
    };

    await prisma.church.update({
      where: { id: organizationId },
      data: {
        brandingConfig: JSON.stringify(defaultConfig),
        updatedAt: new Date()
      }
    });

    console.log(`🔄 Configuration de branding réinitialisée pour l'organisation ${organizationId}`);

    return NextResponse.json({
      success: true,
      config: defaultConfig,
      message: 'Configuration réinitialisée aux valeurs par défaut'
    });

  } catch (error) {
    console.error('Erreur lors de la réinitialisation:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}