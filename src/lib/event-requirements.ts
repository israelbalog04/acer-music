// Configuration des besoins d'instruments par type d'événement

export interface InstrumentRequirement {
  instrument: string;
  roles: string[];
  required: boolean; // Obligatoire ou optionnel
  priority: 'critical' | 'high' | 'medium' | 'low';
  minCount: number;
  maxCount?: number;
  description?: string;
}

export interface EventRequirements {
  [eventType: string]: {
    name: string;
    description: string;
    instruments: InstrumentRequirement[];
    minTotalMembers: number;
    maxTotalMembers?: number;
  };
}

// Définition des besoins par type d'événement
export const EVENT_REQUIREMENTS: EventRequirements = {
  'SERVICE': {
    name: 'Service Dominical',
    description: 'Service de culte principal nécessitant une équipe complète',
    minTotalMembers: 4,
    maxTotalMembers: 12,
    instruments: [
      {
        instrument: 'Piano',
        roles: ['Piano Principal', 'Pianiste', 'Clavier'],
        required: true,
        priority: 'critical',
        minCount: 1,
        maxCount: 2,
        description: 'Instrument de base indispensable'
      },
      {
        instrument: 'Guitare',
        roles: ['Guitare Lead', 'Guitare Électrique', 'Guitare Acoustique', 'Guitariste'],
        required: true,
        priority: 'critical',
        minCount: 1,
        maxCount: 2,
        description: 'Support harmonique principal'
      },
      {
        instrument: 'Chant',
        roles: ['Chant Lead', 'Chanteur Principal', 'Chanteur', 'Lead Vocal', 'Choriste'],
        required: true,
        priority: 'critical',
        minCount: 1,
        maxCount: 4,
        description: 'Direction vocale de la louange'
      },
      {
        instrument: 'Basse',
        roles: ['Basse', 'Bassiste', 'Guitare Basse'],
        required: true,
        priority: 'high',
        minCount: 1,
        maxCount: 1,
        description: 'Fondation rythmique'
      },
      {
        instrument: 'Batterie',
        roles: ['Batterie', 'Batteur', 'Percussions'],
        required: true,
        priority: 'high',
        minCount: 1,
        maxCount: 1,
        description: 'Structure rythmique'
      },
      {
        instrument: 'Violon',
        roles: ['Violon', 'Violoniste', 'Cordes'],
        required: false,
        priority: 'medium',
        minCount: 0,
        maxCount: 2,
        description: 'Enrichissement mélodique'
      },
      {
        instrument: 'Saxophone',
        roles: ['Saxophone', 'Saxo', 'Cuivres'],
        required: false,
        priority: 'low',
        minCount: 0,
        maxCount: 1,
        description: 'Couleur musicale supplémentaire'
      }
    ]
  },
  
  'REPETITION': {
    name: 'Répétition',
    description: 'Session de travail nécessitant les instruments essentiels',
    minTotalMembers: 3,
    maxTotalMembers: 8,
    instruments: [
      {
        instrument: 'Piano',
        roles: ['Piano Principal', 'Pianiste', 'Clavier'],
        required: true,
        priority: 'critical',
        minCount: 1,
        maxCount: 1,
        description: 'Direction musicale'
      },
      {
        instrument: 'Guitare',
        roles: ['Guitare Lead', 'Guitare Électrique', 'Guitare Acoustique', 'Guitariste'],
        required: true,
        priority: 'critical',
        minCount: 1,
        maxCount: 1,
        description: 'Accompagnement principal'
      },
      {
        instrument: 'Chant',
        roles: ['Chant Lead', 'Chanteur Principal', 'Chanteur', 'Lead Vocal'],
        required: true,
        priority: 'high',
        minCount: 1,
        maxCount: 2,
        description: 'Direction vocale'
      },
      {
        instrument: 'Basse',
        roles: ['Basse', 'Bassiste', 'Guitare Basse'],
        required: false,
        priority: 'medium',
        minCount: 0,
        maxCount: 1,
        description: 'Complémentaire selon besoin'
      },
      {
        instrument: 'Batterie',
        roles: ['Batterie', 'Batteur', 'Percussions'],
        required: false,
        priority: 'medium',
        minCount: 0,
        maxCount: 1,
        description: 'Selon le type de répétition'
      }
    ]
  },
  
  'CONCERT': {
    name: 'Concert',
    description: 'Événement spécial nécessitant une formation complète et variée',
    minTotalMembers: 6,
    maxTotalMembers: 15,
    instruments: [
      {
        instrument: 'Piano',
        roles: ['Piano Principal', 'Pianiste', 'Clavier'],
        required: true,
        priority: 'critical',
        minCount: 1,
        maxCount: 2,
        description: 'Soliste et accompagnateur'
      },
      {
        instrument: 'Guitare',
        roles: ['Guitare Lead', 'Guitare Électrique', 'Guitare Acoustique', 'Guitariste'],
        required: true,
        priority: 'critical',
        minCount: 1,
        maxCount: 3,
        description: 'Lead et accompagnement'
      },
      {
        instrument: 'Chant',
        roles: ['Chant Lead', 'Chanteur Principal', 'Chanteur', 'Lead Vocal', 'Choriste'],
        required: true,
        priority: 'critical',
        minCount: 2,
        maxCount: 6,
        description: 'Solistes et chœur'
      },
      {
        instrument: 'Basse',
        roles: ['Basse', 'Bassiste', 'Guitare Basse'],
        required: true,
        priority: 'critical',
        minCount: 1,
        maxCount: 1,
        description: 'Indispensable pour concert'
      },
      {
        instrument: 'Batterie',
        roles: ['Batterie', 'Batteur', 'Percussions'],
        required: true,
        priority: 'critical',
        minCount: 1,
        maxCount: 1,
        description: 'Rythme professionnel requis'
      },
      {
        instrument: 'Violon',
        roles: ['Violon', 'Violoniste', 'Cordes'],
        required: true,
        priority: 'high',
        minCount: 1,
        maxCount: 3,
        description: 'Section cordes pour richesse'
      },
      {
        instrument: 'Saxophone',
        roles: ['Saxophone', 'Saxo', 'Cuivres'],
        required: false,
        priority: 'medium',
        minCount: 0,
        maxCount: 2,
        description: 'Section cuivres'
      }
    ]
  },
  
  'FORMATION': {
    name: 'Formation',
    description: 'Session de formation pour apprentissage et développement',
    minTotalMembers: 2,
    maxTotalMembers: 6,
    instruments: [
      {
        instrument: 'Piano',
        roles: ['Piano Principal', 'Pianiste', 'Clavier'],
        required: true,
        priority: 'high',
        minCount: 1,
        maxCount: 1,
        description: 'Formateur principal'
      },
      {
        instrument: 'Guitare',
        roles: ['Guitare Lead', 'Guitare Électrique', 'Guitare Acoustique', 'Guitariste'],
        required: false,
        priority: 'medium',
        minCount: 0,
        maxCount: 2,
        description: 'Selon programme de formation'
      },
      {
        instrument: 'Chant',
        roles: ['Chant Lead', 'Chanteur Principal', 'Chanteur', 'Lead Vocal'],
        required: false,
        priority: 'medium',
        minCount: 0,
        maxCount: 2,
        description: 'Formation vocale si nécessaire'
      }
    ]
  }
};

// Fonction pour obtenir les besoins d'un type d'événement
export function getEventRequirements(eventType: string) {
  return EVENT_REQUIREMENTS[eventType] || EVENT_REQUIREMENTS['SERVICE']; // Par défaut SERVICE
}

// Fonction pour analyser les manques d'une équipe
export function analyzeTeamNeeds(eventType: string, teamMembers: any[]) {
  const requirements = getEventRequirements(eventType);
  const analysis = {
    critical: [] as string[],
    high: [] as string[],
    medium: [] as string[],
    satisfied: [] as string[],
    totalMembers: teamMembers.length,
    minRequired: requirements.minTotalMembers,
    maxRecommended: requirements.maxTotalMembers,
    isUnderStaffed: teamMembers.length < requirements.minTotalMembers,
    isOverStaffed: requirements.maxTotalMembers ? teamMembers.length > requirements.maxTotalMembers : false
  };

  // Analyser chaque instrument requis
  requirements.instruments.forEach(req => {
    // Compter les membres qui correspondent à cet instrument
    const matchingMembers = teamMembers.filter(member => {
      const memberRole = member.role?.toLowerCase() || '';
      const memberInstrument = member.user?.primaryInstrument?.toLowerCase() || '';
      
      // Vérifier si le rôle ou l'instrument principal correspond
      return req.roles.some(role => 
        memberRole.includes(role.toLowerCase()) || 
        memberInstrument.includes(req.instrument.toLowerCase())
      );
    });

    const currentCount = matchingMembers.length;
    const needed = Math.max(0, req.minCount - currentCount);

    if (needed > 0) {
      const message = `${req.instrument} (${needed} manquant${needed > 1 ? 's' : ''})`;
      
      if (req.priority === 'critical') {
        analysis.critical.push(message);
      } else if (req.priority === 'high') {
        analysis.high.push(message);
      } else if (req.priority === 'medium') {
        analysis.medium.push(message);
      }
    } else {
      analysis.satisfied.push(`${req.instrument} (${currentCount})`);
    }
  });

  return analysis;
}