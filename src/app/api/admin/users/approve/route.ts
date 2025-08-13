import { NextRequest, NextResponse } from "next/server";
import { pooledPrisma as prisma } from "@/lib/prisma-pool";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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
    const { userId, approved } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "ID utilisateur requis" },
        { status: 400 }
      );
    }

    // Vérifier que l'utilisateur existe et appartient à la même église
    const userToApprove = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!userToApprove) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    // Récupérer l'église pour les notifications
    const church = await prisma.church.findUnique({
      where: { id: userToApprove.churchId }
    });

    if (!userToApprove) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier que l'admin et l'utilisateur appartiennent à la même église
    if (userToApprove.churchId !== session.user.churchId) {
      return NextResponse.json(
        { error: "Vous ne pouvez approuver que les utilisateurs de votre église" },
        { status: 403 }
      );
    }

    // Mettre à jour le statut d'approbation
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        isApproved: approved,
        approvedAt: approved ? new Date() : null,
        approvedBy: approved ? session.user.id : null,
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
        title: approved ? 'Compte approuvé' : 'Compte refusé',
        message: approved 
          ? `Votre compte a été approuvé par l'administrateur de ${church?.name || 'l\'église'}. Vous pouvez maintenant vous connecter.`
          : `Votre demande d'inscription pour ${church?.name || 'l\'église'} a été refusée. Veuillez contacter l'administrateur pour plus d'informations.`,
        type: approved ? 'SUCCESS' : 'WARNING',
        priority: 'HIGH',
        userId: userId,
        createdById: session.user.id,
        churchId: session.user.churchId,
      }
    });

    return NextResponse.json({
      success: true,
      message: approved ? "Utilisateur approuvé avec succès" : "Utilisateur refusé avec succès",
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        role: updatedUser.role,
        isApproved: updatedUser.isApproved,
        churchName: church?.name || '',
        churchCity: church?.city || '',
      }
    });

  } catch (error) {
    console.error("Erreur lors de l'approbation:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'approbation" },
      { status: 500 }
    );
  }
}
