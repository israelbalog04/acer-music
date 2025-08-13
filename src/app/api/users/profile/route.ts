import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { pooledPrisma as prisma } from '@/lib/prisma-pool';
import { churchFilter } from '@/lib/church-filter';

// GET /api/users/profile - Récupérer le profil utilisateur
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session?.user?.churchId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const user = await prisma.user.findFirst({
      where: {
        id: session.user.id,
        ...churchFilter(session.user.churchId)
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        instruments: true,
        primaryInstrument: true,
        skillLevel: true,
        musicalExperience: true,
        voiceType: true,
        canLead: true,
        preferredGenres: true,
        avatar: true,
        bio: true,
        birthDate: true,
        joinedChurchDate: true,
        address: true,
        whatsapp: true,
        emergencyContact: true,
        socialMedia: true,
        isPublic: true,
        notificationPrefs: true,
        language: true,
        generalAvailability: true,
        createdAt: true,
        updatedAt: true,
        church: {
          select: {
            name: true,
            city: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    return NextResponse.json({ user });

  } catch (error) {
    console.error('Erreur récupération profil:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du profil' },
      { status: 500 }
    );
  }
}

// PUT /api/users/profile - Mettre à jour le profil utilisateur
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session?.user?.churchId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    const {
      firstName,
      lastName,
      phone,
      instruments,
      primaryInstrument,
      skillLevel,
      musicalExperience,
      voiceType,
      canLead,
      preferredGenres,
      bio,
      birthDate,
      joinedChurchDate,
      address,
      whatsapp,
      emergencyContact,
      socialMedia,
      isPublic,
      notificationPrefs,
      language,
      generalAvailability
    } = body;

    // Validation des données
    if (!firstName || !lastName) {
      return NextResponse.json(
        { error: 'Le prénom et nom sont requis' },
        { status: 400 }
      );
    }

    // Validation du niveau de compétence
    const validSkillLevels = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'];
    if (skillLevel && !validSkillLevels.includes(skillLevel)) {
      return NextResponse.json(
        { error: 'Niveau de compétence invalide' },
        { status: 400 }
      );
    }

    // Validation du type vocal
    const validVoiceTypes = ['SOPRANO', 'MEZZO_SOPRANO', 'ALTO', 'TENOR', 'BARITONE', 'BASS'];
    if (voiceType && !validVoiceTypes.includes(voiceType)) {
      return NextResponse.json(
        { error: 'Type vocal invalide' },
        { status: 400 }
      );
    }

    // Construire les données à mettre à jour
    const updateData: any = {
      firstName,
      lastName,
      phone,
      instruments,
      primaryInstrument,
      skillLevel,
      musicalExperience: musicalExperience ? parseInt(musicalExperience) : null,
      voiceType,
      canLead: Boolean(canLead),
      preferredGenres,
      bio,
      birthDate: birthDate ? new Date(birthDate) : null,
      joinedChurchDate: joinedChurchDate ? new Date(joinedChurchDate) : null,
      address,
      whatsapp,
      emergencyContact,
      socialMedia,
      isPublic: Boolean(isPublic),
      notificationPrefs,
      language: language || 'fr',
      generalAvailability
    };

    // Mettre à jour l'utilisateur
    const updatedUser = await prisma.user.update({
      where: {
        id: session.user.id,
        churchId: session.user.churchId
      },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        instruments: true,
        primaryInstrument: true,
        skillLevel: true,
        musicalExperience: true,
        voiceType: true,
        canLead: true,
        preferredGenres: true,
        avatar: true,
        bio: true,
        birthDate: true,
        joinedChurchDate: true,
        address: true,
        whatsapp: true,
        emergencyContact: true,
        socialMedia: true,
        isPublic: true,
        notificationPrefs: true,
        language: true,
        generalAvailability: true,
        updatedAt: true,
        church: {
          select: {
            name: true,
            city: true
          }
        }
      }
    });

    return NextResponse.json({
      message: 'Profil mis à jour avec succès',
      user: updatedUser
    });

  } catch (error) {
    console.error('Erreur mise à jour profil:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du profil' },
      { status: 500 }
    );
  }
}