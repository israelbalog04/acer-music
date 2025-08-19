import { OPTIMIZED_PRICING, calculateOptimizedRevenue, REVENUE_TARGETS } from '@/types/pricing-strategy';

export class RevenueCalculator {
  // Projection réaliste
  static getRealisticProjection(): RevenueProjection {
    const conversionRates = {
      freeToStarter: 0.15,      // 15% des FREE passent à STARTER
      starterToProfessional: 0.20, // 20% des STARTER passent à PROFESSIONAL
      professionalToEnterprise: 0.10 // 10% des PROFESSIONAL passent à ENTERPRISE
    };

    const freeUsers = 500; // Utilisateurs FREE après 1 an
    return calculateOptimizedRevenue(freeUsers, conversionRates);
  }

  // Projection optimiste
  static getOptimisticProjection(): RevenueProjection {
    const conversionRates = {
      freeToStarter: 0.25,      // 25% de conversion
      starterToProfessional: 0.30, // 30% d'upselling
      professionalToEnterprise: 0.15 // 15% vers ENTERPRISE
    };

    const freeUsers = 800; // Plus d'utilisateurs FREE
    return calculateOptimizedRevenue(freeUsers, conversionRates);
  }

  // Projection conservatrice
  static getConservativeProjection(): RevenueProjection {
    const conversionRates = {
      freeToStarter: 0.10,      // 10% de conversion
      starterToProfessional: 0.15, // 15% d'upselling
      professionalToEnterprise: 0.05 // 5% vers ENTERPRISE
    };

    const freeUsers = 300; // Moins d'utilisateurs FREE
    return calculateOptimizedRevenue(freeUsers, conversionRates);
  }

  // Calcul du ROI
  static calculateROI(
    initialInvestment: number,
    monthlyRevenue: number,
    monthlyExpenses: number
  ): ROIAnalysis {
    const monthlyProfit = monthlyRevenue - monthlyExpenses;
    const annualProfit = monthlyProfit * 12;
    const roi = ((annualProfit - initialInvestment) / initialInvestment) * 100;
    const paybackPeriod = initialInvestment / annualProfit;

    return {
      monthlyRevenue,
      monthlyExpenses,
      monthlyProfit,
      annualProfit,
      roi,
      paybackPeriod,
      isProfitable: roi > 0
    };
  }

  // Analyse des coûts
  static getCostBreakdown(): CostBreakdown {
    return {
      development: {
        initial: 15000, // Développement initial
        monthly: 2000   // Maintenance et nouvelles fonctionnalités
      },
      infrastructure: {
        hosting: 300,   // Vercel, AWS, etc.
        database: 100,  // PostgreSQL
        storage: 200,   // S3
        cdn: 50         // CloudFlare
      },
      marketing: {
        ads: 500,       // Google Ads, Facebook
        content: 200,   // Blog, vidéos
        events: 300     // Conférences, meetups
      },
      support: {
        tools: 100,     // Intercom, Zendesk
        staff: 1000     // Support client
      },
      legal: {
        initial: 2000,  // Contrats, CGV
        monthly: 100    // Conseils juridiques
      }
    };
  }

  // Projection sur 3 ans
  static getThreeYearProjection(): ThreeYearProjection {
    const year1 = this.getRealisticProjection();
    const year2 = {
      ...year1,
      mrr: year1.mrr * 1.5, // +50% de croissance
      arr: year1.arr * 1.5
    };
    const year3 = {
      ...year2,
      mrr: year2.mrr * 1.3, // +30% de croissance
      arr: year2.arr * 1.3
    };

    return {
      year1,
      year2,
      year3,
      totalRevenue: year1.arr + year2.arr + year3.arr
    };
  }

  // Analyse de rentabilité
  static getProfitabilityAnalysis(): ProfitabilityAnalysis {
    const revenue = this.getRealisticProjection();
    const costs = this.getCostBreakdown();
    
    const totalMonthlyCosts = Object.values(costs).reduce((total, category) => {
      return total + Object.values(category).reduce((sum, cost) => sum + (typeof cost === 'number' ? cost : 0), 0);
    }, 0);

    const monthlyProfit = revenue.mrr - totalMonthlyCosts;
    const profitMargin = (monthlyProfit / revenue.mrr) * 100;

    return {
      revenue: revenue.mrr,
      costs: totalMonthlyCosts,
      profit: monthlyProfit,
      profitMargin,
      isProfitable: monthlyProfit > 0,
      breakEvenPoint: totalMonthlyCosts / revenue.mrr * 100 // % de capacité nécessaire
    };
  }
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

export interface ROIAnalysis {
  monthlyRevenue: number;
  monthlyExpenses: number;
  monthlyProfit: number;
  annualProfit: number;
  roi: number;
  paybackPeriod: number;
  isProfitable: boolean;
}

export interface CostBreakdown {
  development: {
    initial: number;
    monthly: number;
  };
  infrastructure: {
    hosting: number;
    database: number;
    storage: number;
    cdn: number;
  };
  marketing: {
    ads: number;
    content: number;
    events: number;
  };
  support: {
    tools: number;
    staff: number;
  };
  legal: {
    initial: number;
    monthly: number;
  };
}

export interface ThreeYearProjection {
  year1: RevenueProjection;
  year2: RevenueProjection;
  year3: RevenueProjection;
  totalRevenue: number;
}

export interface ProfitabilityAnalysis {
  revenue: number;
  costs: number;
  profit: number;
  profitMargin: number;
  isProfitable: boolean;
  breakEvenPoint: number;
}

// Exemple d'utilisation
export function generateRevenueReport(): string {
  const realistic = RevenueCalculator.getRealisticProjection();
  const optimistic = RevenueCalculator.getOptimisticProjection();
  const conservative = RevenueCalculator.getConservativeProjection();
  const profitability = RevenueCalculator.getProfitabilityAnalysis();

  return `
📊 RAPPORT DE REVENUS - PROJECTION 1 AN

🎯 PROJECTIONS:
• Réaliste: ${realistic.mrr.toFixed(0)}€/mois (${realistic.arr.toFixed(0)}€/an)
• Optimiste: ${optimistic.mrr.toFixed(0)}€/mois (${optimistic.arr.toFixed(0)}€/an)
• Conservateur: ${conservative.mrr.toFixed(0)}€/mois (${conservative.arr.toFixed(0)}€/an)

💰 RENTABILITÉ:
• Revenus: ${profitability.revenue.toFixed(0)}€/mois
• Coûts: ${profitability.costs.toFixed(0)}€/mois
• Profit: ${profitability.profit.toFixed(0)}€/mois
• Marge: ${profitability.profitMargin.toFixed(1)}%
• Rentable: ${profitability.isProfitable ? '✅ Oui' : '❌ Non'}

📈 OBJECTIFS:
• Mois 6: ${REVENUE_TARGETS.month6.mrr}€/mois
• Mois 12: ${REVENUE_TARGETS.month12.mrr}€/mois
• Mois 18: ${REVENUE_TARGETS.month18.mrr}€/mois
  `;
}
