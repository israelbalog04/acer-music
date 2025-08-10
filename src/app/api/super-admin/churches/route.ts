import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
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

    // Récupérer toutes les églises avec leurs statistiques
    const churches = await prisma.church.findMany({
      select: {
        id: true,
        name: true,
        city: true,
        address: true,
        phone: true,
        email: true,
        website: true,
        description: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            users: true,
            schedules: true,
            songs: true
          }
        }
      },
      orderBy: [
        { isActive: 'desc' }, // Églises actives en premier
        { name: 'asc' }       // Puis par ordre alphabétique
      ]
    });

    return NextResponse.json(churches);

  } catch (error) {
    console.error("Erreur lors de la récupération des églises:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des églises" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { name, city, address, phone, email, website, description, isActive } = body;

    // Validation des champs requis
    if (!name || !city) {
      return NextResponse.json(
        { error: "Le nom et la ville sont requis" },
        { status: 400 }
      );
    }

    // Vérifier si une église avec le même nom existe déjà
    const existingChurch = await prisma.church.findFirst({
      where: {
        name: name.trim(),
        city: city.trim()
      }
    });

    if (existingChurch) {
      return NextResponse.json(
        { error: "Une église avec ce nom existe déjà dans cette ville" },
        { status: 409 }
      );
    }

    // Créer la nouvelle église
    const newChurch = await prisma.church.create({
      data: {
        name: name.trim(),
        city: city.trim(),
        address: address?.trim() || null,
        phone: phone?.trim() || null,
        email: email?.trim() || null,
        website: website?.trim() || null,
        description: description?.trim() || null,
        isActive: isActive ?? true
      },
      select: {
        id: true,
        name: true,
        city: true,
        address: true,
        phone: true,
        email: true,
        website: true,
        description: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
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
      message: "Église créée avec succès",
      church: newChurch
    }, { status: 201 });

  } catch (error) {
    console.error("Erreur lors de la création de l'église:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de l'église" },
      { status: 500 }
    );
  }
}
