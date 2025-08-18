import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { StorageService } from '@/lib/storage';
import { pooledPrisma as prisma } from '@/lib/prisma-pool';

// POST /api/branding/[organizationId]/assets - Upload d'un asset de branding
export async function POST(
  request: NextRequest,
  { params }: { params: { organizationId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.churchId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { organizationId } = params;

    // Vérifier que l'utilisateur appartient à cette organisation
    if (session.user.churchId !== organizationId) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    // Vérifier les permissions - seuls les ADMIN peuvent modifier les assets
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ 
        error: 'Permissions insuffisantes. Seuls les administrateurs peuvent modifier les assets.' 
      }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const assetType = formData.get('type') as string;

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 });
    }

    if (!assetType || !['logo', 'logoLight', 'favicon', 'backgroundImage'].includes(assetType)) {
      return NextResponse.json({ error: 'Type d\'asset invalide' }, { status: 400 });
    }

    // Validation du type de fichier selon l'asset
    const allowedTypes: Record<string, string[]> = {
      logo: ['image/png', 'image/svg+xml', 'image/jpeg', 'image/webp'],
      logoLight: ['image/png', 'image/svg+xml', 'image/jpeg', 'image/webp'],
      favicon: ['image/png', 'image/x-icon', 'image/svg+xml'],
      backgroundImage: ['image/jpeg', 'image/png', 'image/webp']
    };

    if (!allowedTypes[assetType].includes(file.type)) {
      return NextResponse.json({ 
        error: `Type de fichier non supporté pour ${assetType}. Types acceptés: ${allowedTypes[assetType].join(', ')}` 
      }, { status: 400 });
    }

    // Validation de la taille selon l'asset
    const maxSizes: Record<string, number> = {
      logo: 5 * 1024 * 1024, // 5MB
      logoLight: 5 * 1024 * 1024, // 5MB
      favicon: 1 * 1024 * 1024, // 1MB
      backgroundImage: 10 * 1024 * 1024 // 10MB
    };

    if (file.size > maxSizes[assetType]) {
      return NextResponse.json({ 
        error: `Fichier trop volumineux pour ${assetType}. Taille maximum: ${Math.round(maxSizes[assetType] / (1024 * 1024))}MB` 
      }, { status: 400 });
    }

    // Vérifier que l'organisation existe
    const organization = await prisma.church.findUnique({
      where: { id: organizationId }
    });

    if (!organization) {
      return NextResponse.json({ error: 'Organisation non trouvée' }, { status: 404 });
    }

    // Upload du fichier vers Supabase
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileExtension = file.name.split('.').pop() || 'png';
    const fileName = `${assetType}-${Date.now()}.${fileExtension}`;

    const uploadResult = await StorageService.uploadFile({
      folder: `branding/${organizationId}`,
      originalName: fileName,
      buffer,
      mimeType: file.type,
      churchId: organizationId
    });

    if (!uploadResult.success || !uploadResult.url) {
      return NextResponse.json({ 
        error: 'Erreur lors de l\'upload du fichier' 
      }, { status: 500 });
    }

    // Récupérer la configuration actuelle
    let brandingConfig: any = {};
    if (organization.brandingConfig) {
      try {
        brandingConfig = JSON.parse(organization.brandingConfig);
      } catch (error) {
        console.warn('Configuration de branding corrompue, création d\'une nouvelle');
      }
    }

    // Mettre à jour la configuration avec le nouvel asset
    if (!brandingConfig.assets) {
      brandingConfig.assets = {};
    }
    brandingConfig.assets[assetType] = uploadResult.url;
    brandingConfig.lastUpdated = new Date().toISOString();

    // Sauvegarder en base
    await prisma.church.update({
      where: { id: organizationId },
      data: {
        brandingConfig: JSON.stringify(brandingConfig),
        updatedAt: new Date()
      }
    });

    console.log(`📷 Asset ${assetType} mis à jour pour ${organization.name} par ${session.user.email}`);

    return NextResponse.json({
      success: true,
      assetType,
      url: uploadResult.url,
      message: `Asset ${assetType} uploadé avec succès`
    });

  } catch (error) {
    console.error('Erreur lors de l\'upload d\'asset:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// DELETE /api/branding/[organizationId]/assets - Supprimer un asset
export async function DELETE(
  request: NextRequest,
  { params }: { params: { organizationId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.churchId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { organizationId } = params;
    const { searchParams } = new URL(request.url);
    const assetType = searchParams.get('type');

    // Vérifier que l'utilisateur appartient à cette organisation
    if (session.user.churchId !== organizationId) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    // Vérifier les permissions
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ 
        error: 'Permissions insuffisantes' 
      }, { status: 403 });
    }

    if (!assetType || !['logo', 'logoLight', 'favicon', 'backgroundImage'].includes(assetType)) {
      return NextResponse.json({ error: 'Type d\'asset invalide' }, { status: 400 });
    }

    // Récupérer l'organisation
    const organization = await prisma.church.findUnique({
      where: { id: organizationId }
    });

    if (!organization) {
      return NextResponse.json({ error: 'Organisation non trouvée' }, { status: 404 });
    }

    // Récupérer la configuration actuelle
    let brandingConfig: any = {};
    if (organization.brandingConfig) {
      try {
        brandingConfig = JSON.parse(organization.brandingConfig);
      } catch (error) {
        return NextResponse.json({ error: 'Configuration de branding invalide' }, { status: 400 });
      }
    }

    // Supprimer l'asset de la configuration
    if (brandingConfig.assets && brandingConfig.assets[assetType]) {
      const assetUrl = brandingConfig.assets[assetType];
      
      // Tenter de supprimer le fichier du storage (optionnel, ne pas bloquer si ça échoue)
      try {
        // Extraire le chemin du fichier de l'URL
        const urlParts = assetUrl.split('/');
        const fileName = urlParts[urlParts.length - 1];
        await StorageService.deleteFile(`branding/${organizationId}/${fileName}`);
      } catch (error) {
        console.warn('Impossible de supprimer le fichier du storage:', error);
      }

      delete brandingConfig.assets[assetType];
      brandingConfig.lastUpdated = new Date().toISOString();

      // Sauvegarder en base
      await prisma.church.update({
        where: { id: organizationId },
        data: {
          brandingConfig: JSON.stringify(brandingConfig),
          updatedAt: new Date()
        }
      });
    }

    console.log(`🗑️ Asset ${assetType} supprimé pour ${organization.name} par ${session.user.email}`);

    return NextResponse.json({
      success: true,
      assetType,
      message: `Asset ${assetType} supprimé avec succès`
    });

  } catch (error) {
    console.error('Erreur lors de la suppression d\'asset:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}