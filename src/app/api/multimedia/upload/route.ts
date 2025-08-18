import { NextRequest, NextResponse } from 'next/server';
import { pooledPrisma as prisma } from '@/lib/prisma-pool';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { StorageService, FileValidator } from '@/lib/storage';

// POST - Upload d'une image
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // Vérifier les permissions
    const allowedRoles = ['MULTIMEDIA', 'ADMIN'];
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json({ error: 'Permissions insuffisantes' }, { status: 403 });
    }

    const formData = await request.formData();
    const image = formData.get('image') as File;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const tags = formData.get('tags') as string;
    const location = formData.get('location') as string;
    const eventDate = formData.get('eventDate') as string;
    const eventId = formData.get('eventId') as string;
    const isPublic = formData.get('isPublic') === 'true';

    // Validation
    if (!image || !title) {
      return NextResponse.json(
        { error: 'Image et titre requis' },
        { status: 400 }
      );
    }

    // Valider le fichier image
    const validation = FileValidator.validateImageFile(image);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Upload vers le service de stockage (Supabase)
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const uploadResult = await StorageService.uploadFile({
      folder: 'multimedia',
      originalName: image.name,
      buffer,
      mimeType: image.type,
      churchId: user.churchId
    });

    const { url: fileUrl, fileName } = uploadResult;

    // Créer l'enregistrement en base de données
    let imageId;
    try {
      imageId = `img_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      
      await prisma.musicianImage.create({
        data: {
          id: imageId,
          title: title,
          description: description || null,
          fileName: image.name,
          fileUrl: fileUrl,
          fileSize: image.size,
          fileType: image.type,
          tags: tags || null,
          location: location || null,
          eventDate: eventDate ? new Date(eventDate) : null,
          isPublic: isPublic,
          isActive: true,
          isApproved: user.role === 'ADMIN' || user.role === 'MULTIMEDIA',
          uploadedById: user.id,
          eventId: eventId || null,
          churchId: user.churchId
        }
      });
    } catch (error) {
      console.error('❌ Erreur lors de la création en base:', error);
      // TODO: Supprimer le fichier de Supabase en cas d'erreur
      
      return NextResponse.json(
        { error: 'Erreur lors de la sauvegarde en base de données. Vérifiez que le schéma est à jour.' },
        { status: 500 }
      );
    }

    console.log(`✅ Image uploadée: ${fileName} par ${user.firstName} ${user.lastName}`);

    // Créer des notifications pour tous les musiciens de l'église
    try {
      const musicians = await prisma.user.findMany({
        where: {
          churchId: user.churchId,
          role: {
            in: ['MUSICIEN', 'TECHNICIEN', 'CHEF_LOUANGE']
          }
        },
        select: { id: true }
      });

      // Créer une notification simple pour chaque musicien
      for (const musician of musicians) {
        try {
          const notificationId = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
          
          await prisma.notification.create({
            data: {
              id: notificationId,
              title: 'Nouvelles photos disponibles',
              message: `${user.firstName} ${user.lastName} a déposé de nouvelles photos : "${title}"`,
              type: 'INFO',
              priority: 'MEDIUM',
              userId: musician.id,
              createdById: user.id,
              actionType: 'multimedia_upload',
              actionId: imageId,
              actionUrl: '/app/music/photos',
              churchId: user.churchId
            }
          });
        } catch (notifError) {
          console.warn('⚠️ Erreur lors de la création d\'une notification:', notifError);
        }
      }
      console.log(`🔔 ${musicians.length} notifications créées pour les musiciens`);
    } catch (error) {
      console.warn('⚠️ Erreur lors de la création des notifications:', error);
      // Ne pas faire échouer l'upload si les notifications échouent
    }

    return NextResponse.json({
      success: true,
      image: { id: imageId, title, fileName: image.name },
      message: 'Image uploadée avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de l\'upload:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
