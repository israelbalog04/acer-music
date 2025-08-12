import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Vérifier que l'utilisateur est admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true, churchId: true }
    });

    if (!user || (user.role !== UserRole.ADMIN && user.role !== UserRole.CHEF_LOUANGE)) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    // Construire les filtres selon le rôle de l'utilisateur
    let whereClause: any = { churchId: user.churchId };
    
    // Les ADMIN ne peuvent pas voir les SUPER_ADMIN
    if (user.role === UserRole.ADMIN) {
      whereClause.role = {
        not: UserRole.SUPER_ADMIN
      };
    }
    
    // Les CHEF_LOUANGE ne peuvent pas voir les ADMIN ni les SUPER_ADMIN
    if (user.role === UserRole.CHEF_LOUANGE) {
      whereClause.role = {
        not: {
          in: [UserRole.ADMIN, UserRole.SUPER_ADMIN]
        }
      };
    }

    // Récupérer les utilisateurs selon les permissions
    const users = await prisma.user.findMany({
      where: whereClause,
              select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          role: true,
          instruments: true,
          avatar: true,
          createdAt: true,
          updatedAt: true,
          isApproved: true,
          approvedAt: true,
          approvedBy: true
        },
      orderBy: [
        { role: 'asc' },
        { firstName: 'asc' },
        { lastName: 'asc' }
      ]
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Vérifier que l'utilisateur est admin
    const admin = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true, churchId: true }
    });

    if (!admin || admin.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    const body = await request.json();
    const { firstName, lastName, email, phone, role, instruments, password } = body;

    // Validation des champs obligatoires
    if (!firstName || !lastName || !email || !role || !password) {
      return NextResponse.json(
        { error: 'Tous les champs obligatoires doivent être remplis' },
        { status: 400 }
      );
    }

    // Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Un utilisateur avec cet email existe déjà' },
        { status: 409 }
      );
    }

    // Créer le nouvel utilisateur
    const newUser = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        phone: phone || null,
        role,
        instruments: instruments ? JSON.stringify(instruments) : JSON.stringify([]),
        password, // Note: Le mot de passe devrait être hashé
        churchId: admin.churchId
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        instruments: true,
        avatar: true,
        createdAt: true
      }
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
