import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      return NextResponse.json(
        { error: 'Slug parameter is required' },
        { status: 400 }
      );
    }

    // Validate slug format
    if (!/^[a-z0-9-]+$/.test(slug) || slug.length < 3 || slug.length > 50) {
      return NextResponse.json(
        { 
          available: false, 
          error: 'Le slug doit contenir uniquement des lettres minuscules, chiffres et tirets (3-50 caractères)' 
        },
        { status: 400 }
      );
    }

    // Check if slug is already taken
    const existingOrganization = await prisma.organization.findUnique({
      where: { slug },
      select: { id: true }
    });

    const available = !existingOrganization;

    return NextResponse.json({ 
      available,
      slug,
      message: available ? 'URL disponible' : 'Cette URL est déjà utilisée'
    });

  } catch (error) {
    console.error('Error checking slug availability:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la vérification de la disponibilité' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}