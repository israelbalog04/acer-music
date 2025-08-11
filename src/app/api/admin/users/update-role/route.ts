import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { UserRole } from "@prisma/client";

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { userId, role } = body;

    if (!userId || !role) {
      return NextResponse.json(
        { error: "ID utilisateur et rôle requis" },
        { status: 400 }
      );
    }

    // Vérifier que le rôle est valide
    const validRoles = Object.values(UserRole);
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: "Rôle invalide" },
        { status: 400 }
      );
    }

    // Vérifier que l'utilisateur existe et appartient à la même église
    const userToUpdate = await prisma.user.findUnique({
      where: { id: userId },
      include: { church: true }
    });

    if (!userToUpdate) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier que l'admin et l'utilisateur appartiennent à la même église
    if (userToUpdate.churchId !== session.user.churchId) {
      return NextResponse.json(
        { error: "Vous ne pouvez modifier que les utilisateurs de votre église" },
        { status: 403 }
      );
    }

    // Empêcher un admin de se dégrader lui-même
    if (userId === session.user.id && role !== 'ADMIN') {
      return NextResponse.json(
        { error: "Vous ne pouvez pas changer votre propre rôle d'admin" },
        { status: 403 }
      );
    }

    // Mettre à jour le rôle
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        role: role,
      },
      include: {
        church: {
          select: {
            name: true,
            city: true
          }
        }
      }
    });

    // Créer une notification pour l'utilisateur
    await prisma.notification.create({
      data: {
        title: 'Rôle mis à jour',
        message: `Votre rôle a été changé en "${role}" par l'administrateur de ${userToUpdate.church.name}.`,
        type: 'INFO',
        priority: 'MEDIUM',
        userId: userId,
        createdById: session.user.id,
        churchId: session.user.churchId,
      }
    });

    return NextResponse.json({
      success: true,
      message: "Rôle mis à jour avec succès",
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        role: updatedUser.role,
        churchName: updatedUser.church.name,
        churchCity: updatedUser.church.city,
      }
    });

  } catch (error) {
    console.error("Erreur lors de la mise à jour du rôle:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du rôle" },
      { status: 500 }
    );
  }
}
