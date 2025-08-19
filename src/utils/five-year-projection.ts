// =============================================================================
// PROJECTION CHIFFRE D'AFFAIRES SUR 5 ANS
// =============================================================================

import { OPTIMIZED_PRICING } from '@/types/pricing-strategy';

export interface YearlyProjection {
  year: number;
  mrr: number;
  arr: number;
  totalRevenue: number; // Cumulé depuis le début
  users: {
    free: number;
    starter: number;
    professional: number;
    enterprise: number;
    total: number;
  };
  growth: {
    mrrGrowth: number; // % de croissance MRR
    userGrowth: number; // % de croissance utilisateurs
    churnRate: number; // % de churn
  };
  metrics: {
    ltv: number; // Lifetime Value moyen
    cac: number; // Customer Acquisition Cost
    paybackPeriod: number; // Période de retour sur investissement
  };
}

export interface FiveYearProjection {
  scenario: 'conservative' | 'realistic' | 'optimistic';
  years: YearlyProjection[];
  summary: {
    totalRevenue: number;
    averageGrowth: number;
    peakMRR: number;
    totalUsers: number;
    roi: number;
  };
}

export class FiveYearProjector {
  // Scénario Conservateur
  static getConservativeProjection(): FiveYearProjection {
    const years: YearlyProjection[] = [
      {
        year: 1,
        mrr: 8000,
        arr: 96000,
        totalRevenue: 96000,
        users: { free: 500, starter: 75, professional: 15, enterprise: 2, total: 592 },
        growth: { mrrGrowth: 0, userGrowth: 0, churnRate: 0.08 },
        metrics: { ltv: 1200, cac: 150, paybackPeriod: 8 }
      },
      {
        year: 2,
        mrr: 12000,
        arr: 144000,
        totalRevenue: 240000,
        users: { free: 800, starter: 120, professional: 24, enterprise: 4, total: 948 },
        growth: { mrrGrowth: 0.50, userGrowth: 0.60, churnRate: 0.07 },
        metrics: { ltv: 1400, cac: 120, paybackPeriod: 6 }
      },
      {
        year: 3,
        mrr: 18000,
        arr: 216000,
        totalRevenue: 456000,
        users: { free: 1200, starter: 180, professional: 36, enterprise: 8, total: 1424 },
        growth: { mrrGrowth: 0.50, userGrowth: 0.50, churnRate: 0.06 },
        metrics: { ltv: 1600, cac: 100, paybackPeriod: 5 }
      },
      {
        year: 4,
        mrr: 25000,
        arr: 300000,
        totalRevenue: 756000,
        users: { free: 1600, starter: 240, professional: 48, enterprise: 12, total: 1900 },
        growth: { mrrGrowth: 0.39, userGrowth: 0.33, churnRate: 0.05 },
        metrics: { ltv: 1800, cac: 80, paybackPeriod: 4 }
      },
      {
        year: 5,
        mrr: 32000,
        arr: 384000,
        totalRevenue: 1140000,
        users: { free: 2000, starter: 300, professional: 60, enterprise: 20, total: 2380 },
        growth: { mrrGrowth: 0.28, userGrowth: 0.25, churnRate: 0.04 },
        metrics: { ltv: 2000, cac: 60, paybackPeriod: 3 }
      }
    ];

    return {
      scenario: 'conservative',
      years,
      summary: {
        totalRevenue: 1140000,
        averageGrowth: 0.32,
        peakMRR: 32000,
        totalUsers: 2380,
        roi: 250
      }
    };
  }

  // Scénario Réaliste
  static getRealisticProjection(): FiveYearProjection {
    const years: YearlyProjection[] = [
      {
        year: 1,
        mrr: 12000,
        arr: 144000,
        totalRevenue: 144000,
        users: { free: 800, starter: 120, professional: 24, enterprise: 4, total: 948 },
        growth: { mrrGrowth: 0, userGrowth: 0, churnRate: 0.06 },
        metrics: { ltv: 1400, cac: 120, paybackPeriod: 6 }
      },
      {
        year: 2,
        mrr: 20000,
        arr: 240000,
        totalRevenue: 384000,
        users: { free: 1400, starter: 210, professional: 42, enterprise: 8, total: 1660 },
        growth: { mrrGrowth: 0.67, userGrowth: 0.75, churnRate: 0.05 },
        metrics: { ltv: 1600, cac: 100, paybackPeriod: 5 }
      },
      {
        year: 3,
        mrr: 32000,
        arr: 384000,
        totalRevenue: 768000,
        users: { free: 2200, starter: 330, professional: 66, enterprise: 15, total: 2611 },
        growth: { mrrGrowth: 0.60, userGrowth: 0.57, churnRate: 0.04 },
        metrics: { ltv: 1800, cac: 80, paybackPeriod: 4 }
      },
      {
        year: 4,
        mrr: 48000,
        arr: 576000,
        totalRevenue: 1344000,
        users: { free: 3200, starter: 480, professional: 96, enterprise: 25, total: 3801 },
        growth: { mrrGrowth: 0.50, userGrowth: 0.46, churnRate: 0.03 },
        metrics: { ltv: 2000, cac: 60, paybackPeriod: 3 }
      },
      {
        year: 5,
        mrr: 65000,
        arr: 780000,
        totalRevenue: 2124000,
        users: { free: 4200, starter: 630, professional: 126, enterprise: 35, total: 4991 },
        growth: { mrrGrowth: 0.35, userGrowth: 0.31, churnRate: 0.025 },
        metrics: { ltv: 2200, cac: 50, paybackPeriod: 2.5 }
      }
    ];

    return {
      scenario: 'realistic',
      years,
      summary: {
        totalRevenue: 2124000,
        averageGrowth: 0.52,
        peakMRR: 65000,
        totalUsers: 4991,
        roi: 400
      }
    };
  }

  // Scénario Optimiste
  static getOptimisticProjection(): FiveYearProjection {
    const years: YearlyProjection[] = [
      {
        year: 1,
        mrr: 18000,
        arr: 216000,
        totalRevenue: 216000,
        users: { free: 1200, starter: 180, professional: 36, enterprise: 6, total: 1422 },
        growth: { mrrGrowth: 0, userGrowth: 0, churnRate: 0.04 },
        metrics: { ltv: 1600, cac: 100, paybackPeriod: 5 }
      },
      {
        year: 2,
        mrr: 35000,
        arr: 420000,
        totalRevenue: 636000,
        users: { free: 2200, starter: 330, professional: 66, enterprise: 12, total: 2608 },
        growth: { mrrGrowth: 0.94, userGrowth: 0.83, churnRate: 0.03 },
        metrics: { ltv: 1800, cac: 80, paybackPeriod: 4 }
      },
      {
        year: 3,
        mrr: 60000,
        arr: 720000,
        totalRevenue: 1356000,
        users: { free: 3800, starter: 570, professional: 114, enterprise: 25, total: 4509 },
        growth: { mrrGrowth: 0.71, userGrowth: 0.73, churnRate: 0.025 },
        metrics: { ltv: 2000, cac: 60, paybackPeriod: 3 }
      },
      {
        year: 4,
        mrr: 90000,
        arr: 1080000,
        totalRevenue: 2436000,
        users: { free: 5800, starter: 870, professional: 174, enterprise: 40, total: 6884 },
        growth: { mrrGrowth: 0.50, userGrowth: 0.53, churnRate: 0.02 },
        metrics: { ltv: 2200, cac: 40, paybackPeriod: 2.5 }
      },
      {
        year: 5,
        mrr: 125000,
        arr: 1500000,
        totalRevenue: 3936000,
        users: { free: 8000, starter: 1200, professional: 240, enterprise: 60, total: 9500 },
        growth: { mrrGrowth: 0.39, userGrowth: 0.38, churnRate: 0.015 },
        metrics: { ltv: 2400, cac: 30, paybackPeriod: 2 }
      }
    ];

    return {
      scenario: 'optimistic',
      years,
      summary: {
        totalRevenue: 3936000,
        averageGrowth: 0.63,
        peakMRR: 125000,
        totalUsers: 9500,
        roi: 600
      }
    };
  }

  // Calcul des métriques financières
  static calculateFinancialMetrics(projection: FiveYearProjection): FinancialMetrics {
    const { years } = projection;
    const totalInvestment = 50000; // Investissement initial + développement
    const totalRevenue = years[years.length - 1].totalRevenue;
    const totalProfit = totalRevenue - totalInvestment;
    const roi = (totalProfit / totalInvestment) * 100;

    // Calcul du NPV (Net Present Value) avec un taux de 10%
    const npv = years.reduce((acc, year, index) => {
      const discountRate = 0.10;
      const yearRevenue = year.arr;
      const discountedValue = yearRevenue / Math.pow(1 + discountRate, index + 1);
      return acc + discountedValue;
    }, 0) - totalInvestment;

    return {
      totalInvestment,
      totalRevenue,
      totalProfit,
      roi,
      npv,
      paybackPeriod: totalInvestment / (years[0].arr / 12), // En mois
      averageMonthlyGrowth: years.reduce((acc, year) => acc + year.growth.mrrGrowth, 0) / years.length
    };
  }

  // Analyse des risques
  static getRiskAnalysis(): RiskAnalysis {
    return {
      highRisk: {
        description: 'Marché saturé, concurrence agressive',
        probability: 0.15,
        impact: 'Réduction de 40% des revenus'
      },
      mediumRisk: {
        description: 'Changement de réglementation, coûts d\'infrastructure',
        probability: 0.25,
        impact: 'Réduction de 20% des revenus'
      },
      lowRisk: {
        description: 'Fluctuations saisonnières, churn temporaire',
        probability: 0.40,
        impact: 'Réduction de 10% des revenus'
      }
    };
  }

  // Stratégies de croissance
  static getGrowthStrategies(): GrowthStrategy[] {
    return [
      {
        year: 1,
        strategies: [
          'Lancement MVP avec fonctionnalités core',
          'Acquisition de 50 clients pilotes',
          'Optimisation du produit basée sur les retours',
          'Mise en place du support client'
        ],
        budget: 25000,
        expectedImpact: 0.20
      },
      {
        year: 2,
        strategies: [
          'Expansion vers de nouveaux marchés (écoles de musique)',
          'Développement de fonctionnalités premium',
          'Programme de parrainage et fidélité',
          'Marketing automation et inbound'
        ],
        budget: 40000,
        expectedImpact: 0.35
      },
      {
        year: 3,
        strategies: [
          'Internationalisation (Canada, Suisse, Belgique)',
          'API et intégrations tierces',
          'Partenariats stratégiques',
          'Acquisition de concurrents plus petits'
        ],
        budget: 60000,
        expectedImpact: 0.30
      },
      {
        year: 4,
        strategies: [
          'Développement de solutions enterprise',
          'Intelligence artificielle et analytics avancés',
          'Expansion vers d\'autres secteurs musicaux',
          'Préparation pour levée de fonds'
        ],
        budget: 80000,
        expectedImpact: 0.25
      },
      {
        year: 5,
        strategies: [
          'Levée de fonds série A (2-5M€)',
          'Expansion internationale majeure',
          'Développement de produits complémentaires',
          'Acquisition de technologies innovantes'
        ],
        budget: 150000,
        expectedImpact: 0.40
      }
    ];
  }
}

export interface FinancialMetrics {
  totalInvestment: number;
  totalRevenue: number;
  totalProfit: number;
  roi: number;
  npv: number;
  paybackPeriod: number;
  averageMonthlyGrowth: number;
}

export interface RiskAnalysis {
  highRisk: { description: string; probability: number; impact: string };
  mediumRisk: { description: string; probability: number; impact: string };
  lowRisk: { description: string; probability: number; impact: string };
}

export interface GrowthStrategy {
  year: number;
  strategies: string[];
  budget: number;
  expectedImpact: number;
}

// Génération du rapport complet
export function generateFiveYearReport(): string {
  const conservative = FiveYearProjector.getConservativeProjection();
  const realistic = FiveYearProjector.getRealisticProjection();
  const optimistic = FiveYearProjector.getOptimisticProjection();

  const conservativeMetrics = FiveYearProjector.calculateFinancialMetrics(conservative);
  const realisticMetrics = FiveYearProjector.calculateFinancialMetrics(realistic);
  const optimisticMetrics = FiveYearProjector.calculateFinancialMetrics(optimistic);

  return `
📊 PROJECTION CHIFFRE D'AFFAIRES SUR 5 ANS

🎯 SCÉNARIOS:

CONSERVATEUR:
• Année 1: ${conservative.years[0].arr.toLocaleString()}€
• Année 5: ${conservative.years[4].arr.toLocaleString()}€
• Total 5 ans: ${conservativeMetrics.totalRevenue.toLocaleString()}€
• ROI: ${conservativeMetrics.roi.toFixed(0)}%
• Utilisateurs fin année 5: ${conservative.years[4].users.total.toLocaleString()}

RÉALISTE:
• Année 1: ${realistic.years[0].arr.toLocaleString()}€
• Année 5: ${realistic.years[4].arr.toLocaleString()}€
• Total 5 ans: ${realisticMetrics.totalRevenue.toLocaleString()}€
• ROI: ${realisticMetrics.roi.toFixed(0)}%
• Utilisateurs fin année 5: ${realistic.years[4].users.total.toLocaleString()}

OPTIMISTE:
• Année 1: ${optimistic.years[0].arr.toLocaleString()}€
• Année 5: ${optimistic.years[4].arr.toLocaleString()}€
• Total 5 ans: ${optimisticMetrics.totalRevenue.toLocaleString()}€
• ROI: ${optimisticMetrics.roi.toFixed(0)}%
• Utilisateurs fin année 5: ${optimistic.years[4].users.total.toLocaleString()}

💰 MÉTRIQUES FINANCIÈRES (Scénario Réaliste):
• Investissement total: ${realisticMetrics.totalInvestment.toLocaleString()}€
• Profit total: ${realisticMetrics.totalProfit.toLocaleString()}€
• NPV (10%): ${realisticMetrics.npv.toLocaleString()}€
• Période de retour: ${realisticMetrics.paybackPeriod.toFixed(1)} mois
• Croissance moyenne mensuelle: ${(realisticMetrics.averageMonthlyGrowth * 100).toFixed(1)}%

📈 ÉVOLUTION MRR (Scénario Réaliste):
• Mois 12: ${(realistic.years[0].mrr).toLocaleString()}€/mois
• Mois 24: ${(realistic.years[1].mrr).toLocaleString()}€/mois
• Mois 36: ${(realistic.years[2].mrr).toLocaleString()}€/mois
• Mois 48: ${(realistic.years[3].mrr).toLocaleString()}€/mois
• Mois 60: ${(realistic.years[4].mrr).toLocaleString()}€/mois

🎯 OBJECTIFS CLÉS:
• Atteindre 5,000 utilisateurs actifs
• MRR de 65,000€/mois en année 5
• ROI de 400% sur 5 ans
• Expansion internationale
• Levée de fonds série A
  `;
}
