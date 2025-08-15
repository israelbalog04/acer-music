import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { pooledPrisma as prisma } from '@/lib/prisma-pool';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Récupérer l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // Récupérer tous les utilisateurs actifs de l'église
    const users = await prisma.user.findMany({
      where: {
        churchId: user.churchId,
        isApproved: true
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        role: true,
        instruments: true,
        primaryInstrument: true
      },
      orderBy: [
        { firstName: 'asc' },
        { lastName: 'asc' }
      ]
    });

    // Transformer les données pour correspondre à l'interface attendue
    const transformedUsers = users.map(user => ({
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      role: user.role,
      instrument: user.primaryInstrument || (user.instruments ? JSON.parse(user.instruments)[0] : 'Non spécifié')
    }));

    return NextResponse.json(transformedUsers);

  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs disponibles:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}