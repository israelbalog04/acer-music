import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const config = await request.json();
    
    // Simulation de la création d'organisation avec la configuration rapide
    // Dans une vraie application, ceci interagirait avec Prisma
    
    const organizationData = {
      id: `org_${Date.now()}`,
      name: config.name,
      type: config.type,
      slug: config.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      
      // Configuration automatique basée sur le template
      settings: {
        hierarchy: config.hierarchy,
        terminology: config.terminology,
        defaultRoles: generateDefaultRoles(config.type),
        enabledFeatures: getDefaultFeatures(config.type)
      },
      
      // Branding
      branding: {
        colors: config.branding,
        logo: config.branding.logo || null,
        customization: {
          primaryColor: config.branding.primary,
          accentColor: config.branding.accent || config.branding.primary
        }
      },
      
      // État initial
      subscriptionPlan: 'FREE',
      isActive: true,
      isVerified: false,
      
      // Timestamps
      createdAt: new Date().toISOString(),
      setupCompleted: true,
      setupMethod: 'quick-setup'
    };

    // Ici on sauvegarderait en base avec Prisma :
    // const organization = await prisma.organization.create({
    //   data: organizationData
    // });

    console.log('Organisation créée via Quick Setup:', organizationData);

    return NextResponse.json({
      success: true,
      organization: organizationData,
      message: 'Organisation créée avec succès',
      nextSteps: [
        'Inviter vos premiers membres',
        'Créer votre premier événement',
        'Explorer les fonctionnalités'
      ]
    });

  } catch (error) {
    console.error('Erreur lors de la création rapide:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la création de l\'organisation' 
      },
      { status: 500 }
    );
  }
}

// Génère les rôles par défaut selon le type d'organisation
function generateDefaultRoles(type: string) {
  const roleTemplates = {
    CHURCH: [
      { name: 'pastor', displayName: 'Pasteur', permissions: ['all'] },
      { name: 'leader', displayName: 'Responsable Louange', permissions: ['events.manage', 'songs.manage'] },
      { name: 'member', displayName: 'Membre', permissions: ['events.view', 'songs.view'] }
    ],
    SCHOOL: [
      { name: 'director', displayName: 'Directeur', permissions: ['all'] },
      { name: 'teacher', displayName: 'Professeur', permissions: ['students.manage', 'classes.manage'] },
      { name: 'student', displayName: 'Élève', permissions: ['classes.view', 'assignments.view'] }
    ],
    BAND: [
      { name: 'leader', displayName: 'Leader', permissions: ['all'] },
      { name: 'musician', displayName: 'Musicien', permissions: ['events.view', 'songs.view'] }
    ],
    ORCHESTRA: [
      { name: 'conductor', displayName: 'Chef d\'Orchestre', permissions: ['all'] },
      { name: 'section_leader', displayName: 'Chef de Section', permissions: ['section.manage'] },
      { name: 'musician', displayName: 'Musicien', permissions: ['events.view', 'repertoire.view'] }
    ],
    CHOIR: [
      { name: 'director', displayName: 'Chef de Chœur', permissions: ['all'] },
      { name: 'section_leader', displayName: 'Chef de Pupitre', permissions: ['section.manage'] },
      { name: 'singer', displayName: 'Choriste', permissions: ['events.view', 'scores.view'] }
    ]
  };

  return roleTemplates[type as keyof typeof roleTemplates] || roleTemplates.BAND;
}

// Définit les fonctionnalités par défaut selon le type
function getDefaultFeatures(type: string) {
  const baseFeatures = ['members', 'events', 'repertoire'];
  
  const typeFeatures = {
    CHURCH: [...baseFeatures, 'worship', 'donations'],
    SCHOOL: [...baseFeatures, 'education', 'assignments'],
    BAND: [...baseFeatures, 'recordings', 'commercial'],
    ORCHESTRA: [...baseFeatures, 'scores', 'seasons'],
    CHOIR: [...baseFeatures, 'scores', 'voice_parts']
  };

  return typeFeatures[type as keyof typeof typeFeatures] || baseFeatures;
}