import { NextRequest, NextResponse } from 'next/server';
import { pooledPrisma as prisma } from '@/lib/prisma-pool';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET - Récupérer les uploads récents
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Récupérer l'utilisateur et son église
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { churchId: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // Récupérer les enregistrements récents
    const recentRecordings = await prisma.recording.findMany({
      where: {
        churchId: user.churchId,
        status: 'APPROVED'
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5,
      select: {
        id: true,
        title: true,
        songId: true,
        userId: true,
        createdAt: true
      }
    });

    // Récupérer les chansons et utilisateurs associés
    const songIds = recentRecordings.map(r => r.songId).filter(Boolean) as string[];
    const userIds = recentRecordings.map(r => r.userId).filter(Boolean) as string[];

    const songs = await prisma.song.findMany({
      where: { id: { in: songIds } },
      select: { id: true, title: true }
    });

    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, firstName: true, lastName: true }
    });

    // Créer des maps pour un accès rapide
    const songMap = new Map(songs.map(s => [s.id, s]));
    const userMap = new Map(users.map(u => [u.id, u]));

    // Formater les uploads
    const uploads = recentRecordings.map(recording => {
      const song = recording.songId ? songMap.get(recording.songId) : null;
      const user = recording.userId ? userMap.get(recording.userId) : null;
      return {
        id: recording.id,
        song: song?.title || recording.title,
        instrument: 'Enregistrement',
        uploadedAt: new Date(recording.createdAt).toLocaleDateString('fr-FR'),
        plays: Math.floor(Math.random() * 50) + 1, // Simulation du nombre d'écoutes
        status: 'approuvé',
        uploadedBy: `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Utilisateur inconnu'
      };
    });

    return NextResponse.json({
      success: true,
      uploads
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des uploads récents:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
