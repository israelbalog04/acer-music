import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
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
        createdAt: true,
        song: {
          select: {
            title: true
          }
        },
        user: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    // Formater les uploads
    const uploads = recentRecordings.map(recording => ({
      id: recording.id,
      song: recording.song?.title || recording.title,
      instrument: 'Enregistrement',
      uploadedAt: new Date(recording.createdAt).toLocaleDateString('fr-FR'),
      plays: Math.floor(Math.random() * 50) + 1, // Simulation du nombre d'écoutes
      status: 'approuvé',
      uploadedBy: `${recording.user?.firstName} ${recording.user?.lastName}`
    }));

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
