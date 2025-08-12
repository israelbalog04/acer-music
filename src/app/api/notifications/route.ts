import { NextRequest, NextResponse } from 'next/server';
import { pooledPrisma as prisma } from '@/lib/prisma-pool';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET - Récupérer les notifications de l'utilisateur
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const unread = searchParams.get('unread');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Construire la requête avec échappement des caractères spéciaux
    let query = `SELECT * FROM notifications WHERE userId = ?`;
    const params = [user.id];
    
    if (unread === 'true') {
      query += ` AND isRead = 0`;
    }
    query += ` ORDER BY createdAt DESC LIMIT ?`;
    params.push(limit.toString());

    const notifications = await prisma.$queryRawUnsafe(query, ...params);

    return NextResponse.json(notifications);

  } catch (error) {
    console.error('Erreur lors de la récupération des notifications:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// PATCH - Marquer une notification comme lue
export async function PATCH(request: NextRequest) {
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

    let body;
    try {
      body = await request.json();
    } catch (error) {
      console.error('Erreur lors du parsing du body:', error);
      return NextResponse.json({ error: 'Body de requête invalide' }, { status: 400 });
    }
    
    const { notificationId, isRead } = body;

    if (!notificationId) {
      return NextResponse.json({ error: 'ID de notification requis' }, { status: 400 });
    }

    // Marquer la notification comme lue
    const updateQuery = `
      UPDATE notifications 
      SET isRead = ?, readAt = ?
      WHERE id = ? AND userId = ?
    `;
    await prisma.$executeRawUnsafe(updateQuery, isRead ? 1 : 0, isRead ? new Date().toISOString() : null, notificationId, user.id);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Erreur lors de la mise à jour de la notification:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}