import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { OnboardingData, ORGANIZATION_TEMPLATES, SUBSCRIPTION_FEATURES } from '@/types/saas';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schema
const createOrganizationSchema = z.object({
  // Hiérarchie
  organizationLevel: z.enum(['PARENT', 'CHILD', 'INDEPENDENT']),
  parentOrganizationId: z.string().optional(),
  
  // Organisation
  organizationType: z.enum(['CHURCH', 'CONSERVATORY', 'PROFESSIONAL_BAND', 'AMATEUR_BAND', 'ORCHESTRA', 'CHOIR', 'MUSIC_SCHOOL', 'STUDIO', 'ASSOCIATION', 'OTHER']),
  organizationName: z.string().min(2).max(100),
  slug: z.string().min(3).max(50).regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  musicIndustry: z.enum(['RELIGIOUS', 'CLASSICAL', 'CONTEMPORARY', 'JAZZ', 'ROCK', 'ELECTRONIC', 'WORLD', 'EDUCATIONAL', 'COMMERCIAL', 'OTHER']).optional(),
  size: z.enum(['MICRO', 'SMALL', 'MEDIUM', 'LARGE', 'ENTERPRISE']).optional(),
  
  // Localisation
  country: z.string().min(2).max(2),
  region: z.string().optional(),
  city: z.string().optional(),
  timezone: z.string().optional(),
  
  // Configuration
  subscriptionPlan: z.enum(['FREE', 'STARTER', 'PROFESSIONAL', 'ENTERPRISE']),
  billingCycle: z.enum(['monthly', 'yearly']).optional(),
  branding: z.object({
    colors: z.object({
      primary: z.string(),
      secondary: z.string(),
      accent: z.string()
    }).partial()
  }).optional(),
  terminology: z.record(z.string()).optional(),
  
  // Admin user
  adminUser: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(8)
  })
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = createOrganizationSchema.parse(body);
    
    // Validate hierarchy rules
    if (validatedData.organizationLevel === 'CHILD' && !validatedData.parentOrganizationId) {
      return NextResponse.json(
        { error: 'Un site/démembrement doit avoir une organisation mère' },
        { status: 400 }
      );
    }

    // Check if slug is available
    const existingOrganization = await prisma.organization.findUnique({
      where: { slug: validatedData.slug }
    });

    if (existingOrganization) {
      return NextResponse.json(
        { error: 'Cette URL est déjà utilisée' },
        { status: 409 }
      );
    }

    // Check if email is already taken
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.adminUser.email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Cette adresse email est déjà utilisée' },
        { status: 409 }
      );
    }

    // If CHILD, verify parent organization exists and allows new sites
    let parentOrganization = null;
    if (validatedData.organizationLevel === 'CHILD') {
      parentOrganization = await prisma.organization.findUnique({
        where: { 
          id: validatedData.parentOrganizationId,
          organizationLevel: 'PARENT',
          isActive: true,
          isSuspended: false
        }
      });

      if (!parentOrganization) {
        return NextResponse.json(
          { error: 'Organisation mère introuvable ou inactive' },
          { status: 404 }
        );
      }

      // Check if parent allows new sites
      if (!parentOrganization.allowCrossSiteAccess) {
        return NextResponse.json(
          { error: 'Cette organisation ne permet pas la création de nouveaux sites' },
          { status: 403 }
        );
      }
    }

    // Get template data
    const template = ORGANIZATION_TEMPLATES[validatedData.organizationType];
    const planFeatures = SUBSCRIPTION_FEATURES[validatedData.subscriptionPlan];

    // Merge branding and terminology with template defaults
    const branding = {
      ...template.branding,
      ...validatedData.branding,
      colors: {
        ...template.branding?.colors,
        ...validatedData.branding?.colors
      }
    };

    const terminology = {
      ...template.terminology,
      ...validatedData.terminology
    };

    // Generate subdomain
    const subdomain = validatedData.slug;

    // Calculate trial end date (14 days from now)
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 14);

    // Handle inheritance from parent organization
    let finalBranding = branding;
    let finalTerminology = terminology;
    let finalPlanFeatures = planFeatures;
    let finalSubscriptionPlan = validatedData.subscriptionPlan;

    if (validatedData.organizationLevel === 'CHILD' && parentOrganization) {
      // Child organizations inherit settings from parent
      const parentBranding = parentOrganization.branding ? JSON.parse(parentOrganization.branding) : {};
      const parentTerminology = parentOrganization.terminology ? JSON.parse(parentOrganization.terminology) : {};
      
      // Inherit branding if parent shares it and child doesn't override
      if (parentOrganization.shareBrandingWithChildren) {
        finalBranding = {
          ...parentBranding,
          ...branding // Child can still override
        };
      }
      
      // Always inherit terminology unless child overrides
      finalTerminology = {
        ...parentTerminology,
        ...terminology
      };

      // Child inherits parent's subscription features
      finalSubscriptionPlan = parentOrganization.subscriptionPlan;
      finalPlanFeatures = SUBSCRIPTION_FEATURES[parentOrganization.subscriptionPlan];
    }

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create organization
      const organization = await tx.organization.create({
        data: {
          name: validatedData.organizationName,
          slug: validatedData.slug,
          subdomain,
          
          // Hierarchy
          organizationLevel: validatedData.organizationLevel,
          parentId: validatedData.parentOrganizationId || null,
          
          // Organization details
          type: validatedData.organizationType,
          industry: validatedData.musicIndustry || 'OTHER',
          size: validatedData.size || 'SMALL',
          country: validatedData.country,
          region: validatedData.region,
          city: validatedData.city,
          timezone: validatedData.timezone || 'Europe/Paris',
          description: validatedData.description,
          
          // Subscription (inherited from parent for CHILD organizations)
          subscriptionPlan: finalSubscriptionPlan,
          subscriptionStatus: finalSubscriptionPlan === 'FREE' ? 'ACTIVE' : 'TRIAL',
          subscriptionStartDate: new Date(),
          trialEndDate: finalSubscriptionPlan === 'FREE' ? null : trialEndDate,
          contributesToParentQuota: validatedData.organizationLevel === 'CHILD',
          
          // Limits based on plan (or inherited from parent)
          maxMembers: finalPlanFeatures.maxMembers,
          storageLimit: finalPlanFeatures.storageLimit,
          
          // Cross-site permissions (default for PARENT)
          allowCrossSiteAccess: validatedData.organizationLevel === 'PARENT',
          shareBrandingWithChildren: validatedData.organizationLevel === 'PARENT',
          allowChildCustomBranding: validatedData.organizationLevel === 'PARENT',
          
          // Configuration as JSON
          settings: JSON.stringify({
            ...template.settings,
            ...getDefaultSettings()
          }),
          branding: JSON.stringify(finalBranding),
          features: JSON.stringify(finalPlanFeatures.features),
          terminology: JSON.stringify(finalTerminology),
          
          // Status
          isActive: true,
          isVerified: true, // Auto-verify for now
          isSuspended: false
        }
      });

      // Hash password
      const hashedPassword = await bcrypt.hash(validatedData.adminUser.password, 12);

      // Create admin user
      const adminUser = await tx.user.create({
        data: {
          email: validatedData.adminUser.email,
          firstName: validatedData.adminUser.firstName,
          lastName: validatedData.adminUser.lastName,
          password: hashedPassword,
          role: 'ORG_ADMIN',
          organizationId: organization.id,
          isActive: true,
          isApproved: true,
          emailVerified: new Date(), // Auto-verify for onboarding
          preferences: JSON.stringify(getDefaultUserPreferences()),
          timezone: validatedData.timezone || 'Europe/Paris',
          language: 'fr'
        }
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          action: 'organization.created',
          resourceType: 'Organization',
          resourceId: organization.id,
          details: JSON.stringify({
            organizationType: validatedData.organizationType,
            subscriptionPlan: validatedData.subscriptionPlan,
            adminUserEmail: validatedData.adminUser.email
          }),
          userId: adminUser.id,
          organizationId: organization.id
        }
      });

      return { organization, adminUser };
    });

    // Return success response with organization data
    return NextResponse.json({
      success: true,
      organization: {
        id: result.organization.id,
        name: result.organization.name,
        slug: result.organization.slug,
        subdomain: result.organization.subdomain,
        type: result.organization.type,
        subscriptionPlan: result.organization.subscriptionPlan,
        subscriptionStatus: result.organization.subscriptionStatus,
        trialEndDate: result.organization.trialEndDate
      },
      adminUser: {
        id: result.adminUser.id,
        email: result.adminUser.email,
        firstName: result.adminUser.firstName,
        lastName: result.adminUser.lastName,
        role: result.adminUser.role
      },
      redirectUrl: `/${result.organization.slug}/dashboard`
    });

  } catch (error) {
    console.error('Error creating organization:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Données invalides',
          details: error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'organisation' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Default settings for new organizations
function getDefaultSettings() {
  return {
    allowPublicRegistration: false,
    requireApprovalForMembers: true,
    defaultUserRole: 'MEMBER',
    enableRecordings: true,
    enableSequences: true,
    enableMultimedia: true,
    enableAnalytics: false,
    enableMessaging: true,
    allowPublicSongs: false,
    allowMemberUploads: true,
    autoApproveUploads: false,
    emailNotifications: true,
    pushNotifications: true,
    digestFrequency: 'weekly',
    passwordRequirements: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: false
    },
    sessionTimeout: 120,
    twoFactorRequired: false
  };
}

// Default user preferences
function getDefaultUserPreferences() {
  return {
    theme: 'light',
    language: 'fr',
    emailNotifications: {
      newEvents: true,
      eventReminders: true,
      eventUpdates: true,
      newSongs: true,
      invitations: true,
      announcements: true
    },
    pushNotifications: {
      enabled: true,
      eventReminders: true,
      messages: true,
      mentions: true
    },
    calendarView: 'month',
    startWeekOn: 'monday',
    autoplay: false,
    showChords: true,
    showLyrics: true
  };
}