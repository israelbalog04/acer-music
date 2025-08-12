import { NextRequest, NextResponse } from 'next/server';
import { pooledPrisma as prisma } from '@/lib/prisma-pool';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync, unlinkSync } from 'fs';

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

    // Vérifier le type de fichier
    if (!image.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Seules les images sont acceptées' },
        { status: 400 }
      );
    }

    // Vérifier la taille (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (image.size > maxSize) {
      return NextResponse.json(
        { error: 'L\'image ne doit pas dépasser 10MB' },
        { status: 400 }
      );
    }

    // Créer le dossier de stockage s'il n'existe pas
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'multimedia');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Générer un nom de fichier unique
    const timestamp = Date.now();
    const fileExtension = image.name.split('.').pop();
    const fileName = `musician_${timestamp}.${fileExtension}`;
    const filePath = join(uploadDir, fileName);

    // Convertir le fichier en buffer et l'écrire
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Créer l'enregistrement en base de données
    let imageId;
    try {
      imageId = `img_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      const insertQuery = `
        INSERT INTO musician_images (id, title, description, fileName, fileUrl, fileSize, fileType, tags, location, eventDate, isPublic, isActive, isApproved, uploadedById, eventId, churchId, createdAt, updatedAt)
        VALUES (
          '${imageId}',
          '${title}',
          ${description ? `'${description}'` : 'NULL'},
          '${image.name}',
          '/uploads/multimedia/${fileName}',
          ${image.size},
          '${image.type}',
          ${tags ? `'${tags}'` : 'NULL'},
          ${location ? `'${location}'` : 'NULL'},
          ${eventDate ? `datetime('${eventDate}')` : 'NULL'},
          ${isPublic ? 1 : 0},
          1,
          ${user.role === 'ADMIN' || user.role === 'MULTIMEDIA' ? 1 : 0},
          '${user.id}',
          ${eventId ? `'${eventId}'` : 'NULL'},
          '${user.churchId}',
          datetime('now'),
          datetime('now')
        )
      `;
      await prisma.$executeRawUnsafe(insertQuery);
    } catch (error) {
      console.error('❌ Erreur lors de la création en base:', error);
      // Supprimer le fichier uploadé si la création en base échoue
      try {
        if (existsSync(filePath)) {
          unlinkSync(filePath);
        }
      } catch (unlinkError) {
        console.warn('⚠️ Impossible de supprimer le fichier:', unlinkError);
      }
      
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
          const notificationQuery = `
            INSERT INTO notifications (id, title, message, type, priority, userId, createdById, actionType, actionId, actionUrl, churchId, createdAt, updatedAt)
            VALUES (
              '${notificationId}',
              'Nouvelles photos disponibles',
              '${user.firstName} ${user.lastName} a déposé de nouvelles photos : "${title}"',
              'INFO',
              'MEDIUM',
              '${musician.id}',
              '${user.id}',
              'multimedia_upload',
              '${imageId}',
              '/app/music/photos',
              '${user.churchId}',
              datetime('now'),
              datetime('now')
            )
          `;
          await prisma.$executeRawUnsafe(notificationQuery);
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
