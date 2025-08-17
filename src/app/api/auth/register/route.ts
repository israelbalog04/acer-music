import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { pooledPrisma as prisma } from "@/lib/prisma-pool";
import { UserRole } from "@prisma/client";

const registerSchema = z.object({
  firstName: z.string().min(1, "Le prénom est requis"),
  lastName: z.string().min(1, "Le nom est requis"),
  email: z.string().email("Email invalide"),
  phone: z.string().optional(),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  role: z.enum(["musicien", "chef-louange", "technicien", "admin", "autre"]).default("musicien"),
  instruments: z.array(z.string()).default([]),
  churchId: z.string().min(1, "Veuillez sélectionner une église"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = registerSchema.parse(body);

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Un utilisateur avec cet email existe déjà" },
        { status: 400 }
      );
    }

    // Vérifier que l'église existe
    const church = await prisma.church.findUnique({
      where: { id: validatedData.churchId }
    });

    if (!church) {
      return NextResponse.json(
        { error: "Église sélectionnée invalide" },
        { status: 400 }
      );
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(validatedData.password, 12);

    // Mapper le rôle
    const roleMap: Record<string, UserRole> = {
      "musicien": UserRole.MUSICIEN,
      "chef-louange": UserRole.CHEF_LOUANGE,
      "technicien": UserRole.TECHNICIEN,
      "admin": UserRole.ADMIN,
      "super-admin": UserRole.SUPER_ADMIN,
      "autre": UserRole.MUSICIEN,
    };

    const userRole = roleMap[validatedData.role];
    
    // Les admins et super admins sont automatiquement approuvés, les autres utilisateurs non
    const isApproved = userRole === UserRole.ADMIN || userRole === UserRole.SUPER_ADMIN;

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        email: validatedData.email,
        phone: validatedData.phone || null,
        password: hashedPassword,
        role: userRole,
        instruments: JSON.stringify(validatedData.instruments),
        isApproved: isApproved, // Auto-approuvé si admin
        churchId: validatedData.churchId,
      }
    });

    // Récupérer l'église pour les données de réponse
    const churchDetails = await prisma.church.findUnique({
      where: { id: validatedData.churchId },
      select: {
        name: true,
        city: true
      }
    });

    // Si ce n'est pas un admin, créer des notifications pour les admins de l'église
    if (!isApproved) {
      const admins = await prisma.user.findMany({
        where: {
          churchId: validatedData.churchId,
          role: 'ADMIN'
        }
      });

      // Créer des notifications pour chaque admin
      for (const admin of admins) {
        await prisma.notification.create({
          data: {
            title: 'Nouvelle demande d\'inscription',
            message: `${user.firstName} ${user.lastName} souhaite rejoindre ${church.name}`,
            type: 'INFO',
            priority: 'MEDIUM',
            userId: admin.id,
            createdById: user.id,
            churchId: validatedData.churchId,
          }
        });
      }
    }

    const message = isApproved 
      ? "Compte admin créé avec succès. Vous pouvez vous connecter immédiatement."
      : "Compte créé avec succès. Votre inscription est en attente de validation par l'administrateur.";

    return NextResponse.json({
      success: true,
      message: message,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        instruments: user.instruments,
        churchId: user.churchId,
        isApproved: user.isApproved,
        churchName: churchDetails?.name || '',
        churchCity: churchDetails?.city || '',
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error("Erreur lors de l'inscription:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: "Données invalides", 
          details: error.issues 
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Erreur lors de la création du compte" },
      { status: 500 }
    );
  }
}