import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ churchId: string }> }
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

    const { churchId } = await params;
    const body = await request.json();
    const { name, city, address, phone, email, website, description, isActive } = body;

    // Vérifier que l'église existe
    const existingChurch = await prisma.church.findUnique({
      where: { id: churchId }
    });

    if (!existingChurch) {
      return NextResponse.json(
        { error: "Église non trouvée" },
        { status: 404 }
      );
    }

    // Mettre à jour l'église
    const updatedChurch = await prisma.church.update({
      where: { id: churchId },
      data: {
        name: name || existingChurch.name,
        city: city || existingChurch.city,
        address: address !== undefined ? address : existingChurch.address,
        phone: phone !== undefined ? phone : existingChurch.phone,
        email: email !== undefined ? email : existingChurch.email,
        website: website !== undefined ? website : existingChurch.website,
        description: description !== undefined ? description : existingChurch.description,
        isActive: isActive !== undefined ? isActive : existingChurch.isActive,
      },
      include: {
        _count: {
          select: {
            users: true,
            schedules: true,
            songs: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: "Église mise à jour avec succès",
      church: updatedChurch
    });

  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'église:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de l'église" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ churchId: string }> }
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

    const { churchId } = await params;

    // Vérifier que l'église existe
    const existingChurch = await prisma.church.findUnique({
      where: { id: churchId },
      include: {
        _count: {
          select: {
            users: true,
            schedules: true,
            songs: true
          }
        }
      }
    });

    if (!existingChurch) {
      return NextResponse.json(
        { error: "Église non trouvée" },
        { status: 404 }
      );
    }

    // Vérifier s'il y a des utilisateurs dans cette église
    if (existingChurch._count.users > 0) {
      return NextResponse.json(
        { error: "Impossible de supprimer une église qui contient des utilisateurs" },
        { status: 400 }
      );
    }

    // Supprimer l'église
    await prisma.church.delete({
      where: { id: churchId }
    });

    return NextResponse.json({
      success: true,
      message: "Église supprimée avec succès"
    });

  } catch (error) {
    console.error("Erreur lors de la suppression de l'église:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de l'église" },
      { status: 500 }
    );
  }
}
