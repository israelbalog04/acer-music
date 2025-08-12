import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    // Vérifier que l'utilisateur est connecté et est admin
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    if (session.user.role !== 'ADMIN' && session.user.role !== 'CHEF_LOUANGE') {
      return NextResponse.json(
        { error: "Accès refusé. Rôle admin ou chef de louange requis." },
        { status: 403 }
      );
    }

    // Construire les filtres selon le rôle de l'utilisateur
    let whereClause: any = { churchId: session.user.churchId };
    
    // Les ADMIN ne peuvent pas voir les SUPER_ADMIN
    if (session.user.role === 'ADMIN') {
      whereClause.role = {
        not: 'SUPER_ADMIN'
      };
    }
    
    // Les CHEF_LOUANGE ne peuvent pas voir les ADMIN ni les SUPER_ADMIN
    if (session.user.role === 'CHEF_LOUANGE') {
      whereClause.role = {
        not: {
          in: ['ADMIN', 'SUPER_ADMIN']
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
        isApproved: true,
        approvedAt: true,
        approvedBy: true,
        createdAt: true,
        avatar: true,
        bio: true,
        skillLevel: true,
        musicalExperience: true,
        canLead: true,
        church: {
          select: {
            name: true,
            city: true
          }
        }
      },
      orderBy: [
        { isApproved: 'asc' }, // Non approuvés en premier
        { createdAt: 'desc' }  // Plus récents en premier
      ]
    });

    return NextResponse.json(users);

  } catch (error) {
    console.error("Erreur lors de la récupération des profils:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des profils" },
      { status: 500 }
    );
  }
}
