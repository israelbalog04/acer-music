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

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: "Accès refusé. Rôle admin requis." },
        { status: 403 }
      );
    }

    // Récupérer tous les utilisateurs de l'église de l'admin
    const users = await prisma.user.findMany({
      where: {
        churchId: session.user.churchId
      },
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
