import { NextRequest, NextResponse } from "next/server";
import { pooledPrisma as prisma } from "@/lib/prisma-pool";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { UserRole } from "@prisma/client";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
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

    const { userId } = await params;
    const body = await request.json();
    const { role, isApproved, approvedBy } = body;

    // Vérifier que l'utilisateur existe
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        church: {
          select: {
            name: true,
            city: true
          }
        }
      }
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier que le rôle est valide
    if (role && !Object.values(UserRole).includes(role)) {
      return NextResponse.json(
        { error: "Rôle invalide" },
        { status: 400 }
      );
    }

    // Mettre à jour l'utilisateur
    const updateData: any = {};
    
    if (role !== undefined) {
      updateData.role = role;
    }
    
    if (isApproved !== undefined) {
      updateData.isApproved = isApproved;
      if (isApproved) {
        updateData.approvedAt = new Date();
        updateData.approvedBy = approvedBy || session.user.email;
      } else {
        updateData.approvedAt = null;
        updateData.approvedBy = null;
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      include: {
        church: {
          select: {
            name: true,
            city: true
          }
        }
      }
    });

    // Créer une notification pour l'utilisateur si son rôle a changé
    if (role && role !== existingUser.role) {
      await prisma.notification.create({
        data: {
          title: 'Rôle mis à jour',
          message: `Votre rôle a été changé de ${existingUser.role} à ${role} par le Super Administrateur.`,
          type: 'INFO',
          priority: 'MEDIUM',
          userId: userId,
          createdById: session.user.id,
          churchId: existingUser.churchId,
        }
      });
    }

    // Créer une notification si l'utilisateur a été approuvé
    if (isApproved && !existingUser.isApproved) {
      await prisma.notification.create({
        data: {
          title: 'Compte approuvé',
          message: `Votre compte a été approuvé par le Super Administrateur. Vous pouvez maintenant vous connecter.`,
          type: 'INFO',
          priority: 'HIGH',
          userId: userId,
          createdById: session.user.id,
          churchId: existingUser.churchId,
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: "Utilisateur mis à jour avec succès",
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        role: updatedUser.role,
        isApproved: updatedUser.isApproved,
        approvedAt: updatedUser.approvedAt,
        approvedBy: updatedUser.approvedBy,
        church: (updatedUser as any).church
      }
    });

  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'utilisateur:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de l'utilisateur" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
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

    const { userId } = await params;

    // Vérifier que l'utilisateur existe
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    // Empêcher la suppression du super admin lui-même
    if (existingUser.role === 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: "Impossible de supprimer un Super Administrateur" },
        { status: 400 }
      );
    }

    // Supprimer l'utilisateur
    await prisma.user.delete({
      where: { id: userId }
    });

    return NextResponse.json({
      success: true,
      message: "Utilisateur supprimé avec succès"
    });

  } catch (error) {
    console.error("Erreur lors de la suppression de l'utilisateur:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de l'utilisateur" },
      { status: 500 }
    );
  }
}
