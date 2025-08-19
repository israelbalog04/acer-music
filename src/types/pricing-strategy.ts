// =============================================================================
// STRATÉGIE DE PRICING OPTIMISÉE
// =============================================================================

export interface PricingTier {
  name: string;
  price: number;
  annualPrice: number; // Prix annuel avec réduction
  features: string[];
  targetAudience: string;
  conversionGoal: number; // % de conversion attendu
}

export const OPTIMIZED_PRICING: PricingTier[] = [
  {
    name: 'FREE',
    price: 0,
    annualPrice: 0,
    features: [
      '5 membres maximum',
      '1 GB de stockage',
      'Répertoire de base',
      'Planning simple',
      'Support communautaire'
    ],
    targetAudience: 'Petites églises, groupes amateurs',
    conversionGoal: 0.15 // 15% vers STARTER
  },
  {
    name: 'STARTER',
    price: 24, // Augmenté de 19€ à 24€
    annualPrice: 240, // 2 mois gratuits
    features: [
      '25 membres maximum',
      '10 GB de stockage',
      'Enregistrements audio',
      'Partitions et séquences',
      'Multimédia',
      'Messagerie interne',
      'Support email'
    ],
    targetAudience: 'Églises moyennes, écoles de musique',
    conversionGoal: 0.20 // 20% vers PROFESSIONAL
  },
  {
    name: 'PROFESSIONAL',
    price: 59, // Augmenté de 49€ à 59€
    annualPrice: 590, // 2 mois gratuits
    features: [
      '100 membres maximum',
      '50 GB de stockage',
      'Analytics avancées',
      'Streaming live',
      'Système de réservation',
      'Branding personnalisé',
      'API access',
      'Support prioritaire'
    ],
    targetAudience: 'Grandes églises, conservatoires',
    conversionGoal: 0.10 // 10% vers ENTERPRISE
  },
  {
    name: 'ENTERPRISE',
    price: 129, // Augmenté de 99€ à 129€
    annualPrice: 1290, // 2 mois gratuits
    features: [
      'Membres illimités',
      'Stockage illimité',
      'Boutique en ligne',
      'Rétention données illimitée',
      'Sauvegardes étendues',
      'Support dédié',
      'Formation personnalisée'
    ],
    targetAudience: 'Réseaux d\'églises, grandes institutions',
    conversionGoal: 0.95 // 95% de rétention
  }
];

// Calcul des revenus optimisés
export function calculateOptimizedRevenue(
  freeUsers: number,
  conversionRates: Record<string, number>
): RevenueProjection {
  const starterUsers = Math.floor(freeUsers * conversionRates.freeToStarter);
  const professionalUsers = Math.floor(starterUsers * conversionRates.starterToProfessional);
  const enterpriseUsers = Math.floor(professionalUsers * conversionRates.professionalToEnterprise);

  const mrr = (
    starterUsers * OPTIMIZED_PRICING[1].price +
    professionalUsers * OPTIMIZED_PRICING[2].price +
    enterpriseUsers * OPTIMIZED_PRICING[3].price
  );

  const arr = mrr * 12;

  return {
    mrr,
    arr,
    users: {
      free: freeUsers,
      starter: starterUsers,
      professional: professionalUsers,
      enterprise: enterpriseUsers
    },
    breakdown: {
      starter: starterUsers * OPTIMIZED_PRICING[1].price,
      professional: professionalUsers * OPTIMIZED_PRICING[2].price,
      enterprise: enterpriseUsers * OPTIMIZED_PRICING[3].price
    }
  };
}

export interface RevenueProjection {
  mrr: number;
  arr: number;
  users: {
    free: number;
    starter: number;
    professional: number;
    enterprise: number;
  };
  breakdown: {
    starter: number;
    professional: number;
    enterprise: number;
  };
}

// Stratégies d'augmentation des revenus
export const REVENUE_STRATEGIES = {
  // 1. Facturation annuelle avec réduction
  annualBilling: {
    discount: 0.17, // 2 mois gratuits
    conversionBoost: 0.30 // +30% de conversion
  },

  // 2. Upselling automatique
  upselling: {
    triggers: [
      'Limite de membres atteinte',
      'Limite de stockage atteinte',
      'Demande de fonctionnalité premium'
    ],
    conversionRate: 0.25
  },

  // 3. Add-ons et services
  addons: {
    services: [
      { name: 'Migration de données', price: 299 },
      { name: 'Formation équipe', price: 199 },
      { name: 'Support premium', price: 99 },
      { name: 'Stockage supplémentaire', price: 0.10 } // par GB/mois
    ]
  },

  // 4. Programmes de fidélité
  loyalty: {
    referralBonus: 0.10, // 10% de réduction pour parrainage
    longTermDiscount: 0.05 // 5% après 2 ans
  }
};

// Calcul du LTV (Lifetime Value)
export function calculateLTV(
  plan: string,
  averageRetentionMonths: number,
  churnRate: number
): number {
  const pricing = OPTIMIZED_PRICING.find(p => p.name === plan);
  if (!pricing) return 0;

  // LTV = Prix mensuel × Durée moyenne de rétention
  const ltv = pricing.price * averageRetentionMonths;
  
  // Ajustement pour le churn
  const adjustedLtv = ltv * (1 - churnRate);
  
  return adjustedLtv;
}

// Objectifs de revenus par mois
export const REVENUE_TARGETS = {
  month6: {
    mrr: 3000, // 3,000€/mois
    users: {
      free: 150,
      starter: 35,
      professional: 8,
      enterprise: 1
    }
  },
  month12: {
    mrr: 8000, // 8,000€/mois
    users: {
      free: 500,
      starter: 150,
      professional: 45,
      enterprise: 8
    }
  },
  month18: {
    mrr: 15000, // 15,000€/mois
    users: {
      free: 1000,
      starter: 300,
      professional: 100,
      enterprise: 20
    }
  }
};
