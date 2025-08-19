import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { FeatureGate } from '@/middleware/feature-gate';
import { GlobalLimitChecker } from '@/services/limit-checker';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // 1. Vérifier l'accès à la fonctionnalité
    const featureCheck = await FeatureGate.middleware(request, {
      feature: 'recordings',
      requiredPlan: 'STARTER',
      message: 'Les enregistrements nécessitent un plan STARTER ou supérieur'
    });

    if (featureCheck.status !== 200) {
      return featureCheck;
    }

    // 2. Extraire l'organizationId depuis les headers
    const organizationId = request.headers.get('x-organization-id');
    if (!organizationId) {
      return NextResponse.json(
        { error: 'Organisation non identifiée' },
        { status: 400 }
      );
    }

    // 3. Vérifier les limites de stockage
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'Fichier requis' },
        { status: 400 }
      );
    }

    const fileSize = file.size;
    const canAddFile = await GlobalLimitChecker.canOrganizationPerformAction(
      organizationId, 
      'addFile', 
      fileSize
    );

    if (!canAddFile) {
      return NextResponse.json(
        { 
          error: 'Limite de stockage atteinte',
          details: 'Votre plan actuel ne permet pas d\'ajouter ce fichier'
        },
        { status: 413 }
      );
    }

    // 4. Traitement du fichier (exemple simplifié)
    const fileName = file.name;
    const fileType = file.type;
    
    // Ici vous feriez l'upload vers votre service de stockage (S3, etc.)
    // const uploadResult = await uploadToStorage(file);
    
    // 5. Sauvegarder en base de données
    const recording = await prisma.recording.create({
      data: {
        title: fileName,
        fileName: fileName,
        fileSize: fileSize,
        fileType: fileType,
        fileUrl: 'https://example.com/uploaded-file.mp3', // URL après upload
        organizationId: organizationId,
        uploadedById: request.headers.get('x-user-id') || '',
        isApproved: false,
        isPublic: false
      }
    });

    // 6. Mettre à jour l'utilisation du stockage
    const limitChecker = new (await import('@/services/limit-checker')).LimitChecker(organizationId);
    await limitChecker.updateStorageUsage(fileSize, 'add');

    return NextResponse.json({
      success: true,
      recording: {
        id: recording.id,
        title: recording.title,
        fileSize: recording.fileSize,
        uploadedAt: recording.createdAt
      }
    });

  } catch (error) {
    console.error('Error uploading recording:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'upload' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'accès à la fonctionnalité
    const featureCheck = await FeatureGate.middleware(request, {
      feature: 'recordings',
      requiredPlan: 'STARTER'
    });

    if (featureCheck.status !== 200) {
      return featureCheck;
    }

    const organizationId = request.headers.get('x-organization-id');
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const recordings = await prisma.recording.findMany({
      where: { organizationId },
      include: {
        uploadedBy: {
          select: { firstName: true, lastName: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    });

    const total = await prisma.recording.count({
      where: { organizationId }
    });

    return NextResponse.json({
      success: true,
      recordings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching recordings:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des enregistrements' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
