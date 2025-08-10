import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST /api/sequences/[sequenceId]/download - Enregistrer un téléchargement
export async function POST(
  request: NextRequest,
  { params }: { params: { sequenceId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.churchId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Vérifier que la séquence existe et appartient à l'église
    const sequence = await prisma.sequence.findFirst({
      where: {
        id: params.sequenceId,
        churchId: session.user.churchId,
        isActive: true
      }
    });

    if (!sequence) {
      return NextResponse.json({ error: 'Séquence non trouvée' }, { status: 404 });
    }

    // Vérifier s'il existe déjà un téléchargement pour cet utilisateur et cette séquence
    const existingDownload = await prisma.sequenceDownload.findUnique({
      where: {
        sequenceId_userId: {
          sequenceId: params.sequenceId,
          userId: session.user.id
        }
      }
    });

    if (!existingDownload) {
      // Créer un nouvel enregistrement de téléchargement
      await prisma.sequenceDownload.create({
        data: {
          sequenceId: params.sequenceId,
          userId: session.user.id,
          churchId: session.user.churchId,
          ipAddress: request.ip || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown'
        }
      });
    }

    // Retourner les informations de téléchargement (URL, etc.)
    return NextResponse.json({
      message: 'Téléchargement enregistré',
      downloadUrl: sequence.fileUrl,
      fileName: sequence.fileName,
      fileSize: sequence.fileSize
    });
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement du téléchargement:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// GET /api/sequences/[sequenceId]/download - Récupérer les statistiques de téléchargement
export async function GET(
  request: NextRequest,
  { params }: { params: { sequenceId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.churchId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Vérifier que la séquence existe
    const sequence = await prisma.sequence.findFirst({
      where: {
        id: params.sequenceId,
        churchId: session.user.churchId,
        isActive: true
      }
    });

    if (!sequence) {
      return NextResponse.json({ error: 'Séquence non trouvée' }, { status: 404 });
    }

    // Récupérer les statistiques de téléchargement
    const downloads = await prisma.sequenceDownload.findMany({
      where: {
        sequenceId: params.sequenceId
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: {
        downloadedAt: 'desc'
      }
    });

    const totalDownloads = downloads.length;
    const uniqueUsers = new Set(downloads.map(d => d.userId)).size;
    const recentDownloads = downloads.slice(0, 10); // Les 10 derniers téléchargements

    return NextResponse.json({
      totalDownloads,
      uniqueUsers,
      recentDownloads,
      allDownloads: downloads
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}