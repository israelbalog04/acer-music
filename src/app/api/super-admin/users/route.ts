import { NextRequest, NextResponse } from "next/server";
import { pooledPrisma as prisma } from "@/lib/prisma-pool";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    // Vérifier que l'utilisateur est connecté et est super admin
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    if (session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: "Accès refusé. Rôle Super Administrateur requis." },
        { status: 403 }
      );
    }

    // Récupérer tous les utilisateurs de toutes les églises
    const users = await prisma.user.findMany({
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
        church: {
          select: {
            id: true,
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
    console.error("Erreur lors de la récupération des utilisateurs:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des utilisateurs" },
      { status: 500 }
    );
  }
}
