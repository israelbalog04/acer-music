// =============================================================================
// ANALYSE CROISSANCE CLIENTS PAR ANNÉE
// =============================================================================

export interface ClientMetrics {
  year: number;
  totalClients: number;
  newClients: number;
  churnedClients: number;
  netGrowth: number;
  retentionRate: number;
  acquisitionCost: number;
  lifetimeValue: number;
  paybackPeriod: number;
}

export interface ClientGrowthAnalysis {
  scenario: 'conservative' | 'realistic' | 'optimistic';
  yearlyMetrics: ClientMetrics[];
  summary: {
    totalClientsEnd: number;
    averageGrowth: number;
    totalAcquisitionCost: number;
    averageLTV: number;
    churnRate: number;
  };
}

export class ClientGrowthAnalyzer {
  // Scénario Conservateur
  static getConservativeGrowth(): ClientGrowthAnalysis {
    const yearlyMetrics: ClientMetrics[] = [
      {
        year: 1,
        totalClients: 96, // 75 STARTER + 15 PROFESSIONAL + 2 ENTERPRISE + 4 FREE convertis
        newClients: 96,
        churnedClients: 6,
        netGrowth: 90,
        retentionRate: 0.94,
        acquisitionCost: 150,
        lifetimeValue: 1200,
        paybackPeriod: 8
      },
      {
        year: 2,
        totalClients: 156, // +60 nouveaux
        newClients: 66,
        churnedClients: 10,
        netGrowth: 56,
        retentionRate: 0.93,
        acquisitionCost: 140,
        lifetimeValue: 1400,
        paybackPeriod: 7
      },
      {
        year: 3,
        totalClients: 224, // +68 nouveaux
        newClients: 72,
        churnedClients: 16,
        netGrowth: 56,
        retentionRate: 0.92,
        acquisitionCost: 130,
        lifetimeValue: 1600,
        paybackPeriod: 6
      },
      {
        year: 4,
        totalClients: 284, // +60 nouveaux
        newClients: 64,
        churnedClients: 20,
        netGrowth: 44,
        retentionRate: 0.91,
        acquisitionCost: 120,
        lifetimeValue: 1800,
        paybackPeriod: 5
      },
      {
        year: 5,
        totalClients: 338, // +54 nouveaux
        newClients: 58,
        churnedClients: 24,
        netGrowth: 34,
        retentionRate: 0.90,
        acquisitionCost: 110,
        lifetimeValue: 2000,
        paybackPeriod: 4
      }
    ];

    return {
      scenario: 'conservative',
      yearlyMetrics,
      summary: {
        totalClientsEnd: 338,
        averageGrowth: 0.28,
        totalAcquisitionCost: 45600,
        averageLTV: 1600,
        churnRate: 0.10
      }
    };
  }

  // Scénario Réaliste
  static getRealisticGrowth(): ClientGrowthAnalysis {
    const yearlyMetrics: ClientMetrics[] = [
      {
        year: 1,
        totalClients: 154, // 120 STARTER + 24 PROFESSIONAL + 4 ENTERPRISE + 6 FREE convertis
        newClients: 154,
        churnedClients: 9,
        netGrowth: 145,
        retentionRate: 0.94,
        acquisitionCost: 120,
        lifetimeValue: 1400,
        paybackPeriod: 6
      },
      {
        year: 2,
        totalClients: 260, // +106 nouveaux
        newClients: 115,
        churnedClients: 15,
        netGrowth: 100,
        retentionRate: 0.93,
        acquisitionCost: 110,
        lifetimeValue: 1600,
        paybackPeriod: 5.5
      },
      {
        year: 3,
        totalClients: 411, // +151 nouveaux
        newClients: 165,
        churnedClients: 24,
        netGrowth: 141,
        retentionRate: 0.92,
        acquisitionCost: 100,
        lifetimeValue: 1800,
        paybackPeriod: 5
      },
      {
        year: 4,
        totalClients: 601, // +190 nouveaux
        newClients: 204,
        churnedClients: 34,
        netGrowth: 170,
        retentionRate: 0.91,
        acquisitionCost: 90,
        lifetimeValue: 2000,
        paybackPeriod: 4.5
      },
      {
        year: 5,
        totalClients: 791, // +190 nouveaux
        newClients: 204,
        churnedClients: 44,
        netGrowth: 160,
        retentionRate: 0.90,
        acquisitionCost: 80,
        lifetimeValue: 2200,
        paybackPeriod: 4
      }
    ];

    return {
      scenario: 'realistic',
      yearlyMetrics,
      summary: {
        totalClientsEnd: 791,
        averageGrowth: 0.39,
        totalAcquisitionCost: 79200,
        averageLTV: 1800,
        churnRate: 0.08
      }
    };
  }

  // Scénario Optimiste
  static getOptimisticGrowth(): ClientGrowthAnalysis {
    const yearlyMetrics: ClientMetrics[] = [
      {
        year: 1,
        totalClients: 222, // 180 STARTER + 36 PROFESSIONAL + 6 ENTERPRISE + 0 FREE convertis
        newClients: 222,
        churnedClients: 9,
        netGrowth: 213,
        retentionRate: 0.96,
        acquisitionCost: 100,
        lifetimeValue: 1600,
        paybackPeriod: 5
      },
      {
        year: 2,
        totalClients: 408, // +186 nouveaux
        newClients: 200,
        churnedClients: 12,
        netGrowth: 188,
        retentionRate: 0.95,
        acquisitionCost: 90,
        lifetimeValue: 1800,
        paybackPeriod: 4.5
      },
      {
        year: 3,
        totalClients: 709, // +301 nouveaux
        newClients: 315,
        churnedClients: 18,
        netGrowth: 297,
        retentionRate: 0.94,
        acquisitionCost: 80,
        lifetimeValue: 2000,
        paybackPeriod: 4
      },
      {
        year: 4,
        totalClients: 1184, // +475 nouveaux
        newClients: 489,
        churnedClients: 24,
        netGrowth: 465,
        retentionRate: 0.93,
        acquisitionCost: 70,
        lifetimeValue: 2200,
        paybackPeriod: 3.5
      },
      {
        year: 5,
        totalClients: 1800, // +616 nouveaux
        newClients: 630,
        churnedClients: 30,
        netGrowth: 600,
        retentionRate: 0.92,
        acquisitionCost: 60,
        lifetimeValue: 2400,
        paybackPeriod: 3
      }
    ];

    return {
      scenario: 'optimistic',
      yearlyMetrics,
      summary: {
        totalClientsEnd: 1800,
        averageGrowth: 0.52,
        totalAcquisitionCost: 126000,
        averageLTV: 2000,
        churnRate: 0.06
      }
    };
  }

  // Calcul des métriques d'acquisition
  static calculateAcquisitionMetrics(growth: ClientGrowthAnalysis): AcquisitionMetrics {
    const { yearlyMetrics } = growth;
    
    const totalNewClients = yearlyMetrics.reduce((sum, year) => sum + year.newClients, 0);
    const totalAcquisitionCost = yearlyMetrics.reduce((sum, year) => sum + (year.newClients * year.acquisitionCost), 0);
    const averageCAC = totalAcquisitionCost / totalNewClients;
    
    const totalLTV = yearlyMetrics.reduce((sum, year) => sum + (year.totalClients * year.lifetimeValue), 0);
    const averageLTV = totalLTV / yearlyMetrics[yearlyMetrics.length - 1].totalClients;
    
    const ltvCacRatio = averageLTV / averageCAC;

    return {
      totalNewClients,
      totalAcquisitionCost,
      averageCAC,
      averageLTV,
      ltvCacRatio,
      paybackPeriod: averageCAC / (averageLTV / 12) // En mois
    };
  }

  // Analyse de la rétention
  static calculateRetentionMetrics(growth: ClientGrowthAnalysis): RetentionMetrics {
    const { yearlyMetrics } = growth;
    
    const averageRetention = yearlyMetrics.reduce((sum, year) => sum + year.retentionRate, 0) / yearlyMetrics.length;
    const totalChurned = yearlyMetrics.reduce((sum, year) => sum + year.churnedClients, 0);
    const totalClientsEver = yearlyMetrics.reduce((sum, year) => sum + year.newClients, 0);
    const overallChurnRate = totalChurned / totalClientsEver;

    // Calcul de la cohorte de rétention
    const cohortRetention = yearlyMetrics.map((year, index) => {
      if (index === 0) return 1.0;
      const previousYearClients = yearlyMetrics[index - 1].totalClients;
      const retainedClients = year.totalClients - year.newClients;
      return retainedClients / previousYearClients;
    });

    return {
      averageRetention,
      overallChurnRate,
      totalChurned,
      cohortRetention,
      netRetentionRate: yearlyMetrics[yearlyMetrics.length - 1].retentionRate
    };
  }

  // Projection de croissance future
  static projectFutureGrowth(
    currentGrowth: ClientGrowthAnalysis,
    yearsToProject: number = 3
  ): FutureProjection {
    const lastYear = currentGrowth.yearlyMetrics[currentGrowth.yearlyMetrics.length - 1];
    const averageGrowth = currentGrowth.summary.averageGrowth;
    const averageRetention = currentGrowth.yearlyMetrics.reduce((sum, year) => sum + year.retentionRate, 0) / currentGrowth.yearlyMetrics.length;

    const projections = [];
    let currentClients = lastYear.totalClients;

    for (let year = 1; year <= yearsToProject; year++) {
      const expectedGrowth = averageGrowth * (1 - year * 0.1); // Décroissance de 10% par an
      const newClients = Math.floor(currentClients * expectedGrowth);
      const churnedClients = Math.floor(currentClients * (1 - averageRetention));
      const netGrowth = newClients - churnedClients;
      
      currentClients += netGrowth;
      
      projections.push({
        year: lastYear.year + year,
        totalClients: currentClients,
        newClients,
        churnedClients,
        netGrowth,
        growthRate: expectedGrowth
      });
    }

    return {
      currentYear: lastYear.year,
      projections,
      totalProjectedClients: currentClients,
      averageProjectedGrowth: projections.reduce((sum, p) => sum + p.growthRate, 0) / projections.length
    };
  }
}

export interface AcquisitionMetrics {
  totalNewClients: number;
  totalAcquisitionCost: number;
  averageCAC: number;
  averageLTV: number;
  ltvCacRatio: number;
  paybackPeriod: number;
}

export interface RetentionMetrics {
  averageRetention: number;
  overallChurnRate: number;
  totalChurned: number;
  cohortRetention: number[];
  netRetentionRate: number;
}

export interface FutureProjection {
  currentYear: number;
  projections: {
    year: number;
    totalClients: number;
    newClients: number;
    churnedClients: number;
    netGrowth: number;
    growthRate: number;
  }[];
  totalProjectedClients: number;
  averageProjectedGrowth: number;
}

// Génération du rapport clients
export function generateClientGrowthReport(): string {
  const conservative = ClientGrowthAnalyzer.getConservativeGrowth();
  const realistic = ClientGrowthAnalyzer.getRealisticGrowth();
  const optimistic = ClientGrowthAnalyzer.getOptimisticGrowth();

  const conservativeAcquisition = ClientGrowthAnalyzer.calculateAcquisitionMetrics(conservative);
  const realisticAcquisition = ClientGrowthAnalyzer.calculateAcquisitionMetrics(realistic);
  const optimisticAcquisition = ClientGrowthAnalyzer.calculateAcquisitionMetrics(optimistic);

  return `
👥 ANALYSE CROISSANCE CLIENTS SUR 5 ANS

📊 NOMBRE DE CLIENTS PAR ANNÉE:

CONSERVATEUR:
• Année 1: ${conservative.yearlyMetrics[0].totalClients} clients
• Année 2: ${conservative.yearlyMetrics[1].totalClients} clients (+${conservative.yearlyMetrics[1].netGrowth})
• Année 3: ${conservative.yearlyMetrics[2].totalClients} clients (+${conservative.yearlyMetrics[2].netGrowth})
• Année 4: ${conservative.yearlyMetrics[3].totalClients} clients (+${conservative.yearlyMetrics[3].netGrowth})
• Année 5: ${conservative.yearlyMetrics[4].totalClients} clients (+${conservative.yearlyMetrics[4].netGrowth})

RÉALISTE:
• Année 1: ${realistic.yearlyMetrics[0].totalClients} clients
• Année 2: ${realistic.yearlyMetrics[1].totalClients} clients (+${realistic.yearlyMetrics[1].netGrowth})
• Année 3: ${realistic.yearlyMetrics[2].totalClients} clients (+${realistic.yearlyMetrics[2].netGrowth})
• Année 4: ${realistic.yearlyMetrics[3].totalClients} clients (+${realistic.yearlyMetrics[3].netGrowth})
• Année 5: ${realistic.yearlyMetrics[4].totalClients} clients (+${realistic.yearlyMetrics[4].netGrowth})

OPTIMISTE:
• Année 1: ${optimistic.yearlyMetrics[0].totalClients} clients
• Année 2: ${optimistic.yearlyMetrics[1].totalClients} clients (+${optimistic.yearlyMetrics[1].netGrowth})
• Année 3: ${optimistic.yearlyMetrics[2].totalClients} clients (+${optimistic.yearlyMetrics[2].netGrowth})
• Année 4: ${optimistic.yearlyMetrics[3].totalClients} clients (+${optimistic.yearlyMetrics[3].netGrowth})
• Année 5: ${optimistic.yearlyMetrics[4].totalClients} clients (+${optimistic.yearlyMetrics[4].netGrowth})

💰 MÉTRIQUES D'ACQUISITION (Scénario Réaliste):
• Nouveaux clients totaux: ${realisticAcquisition.totalNewClients}
• Coût d'acquisition total: ${realisticAcquisition.totalAcquisitionCost.toLocaleString()}€
• CAC moyen: ${realisticAcquisition.averageCAC}€
• LTV moyen: ${realisticAcquisition.averageLTV}€
• Ratio LTV/CAC: ${realisticAcquisition.ltvCacRatio.toFixed(1)}
• Période de retour: ${realisticAcquisition.paybackPeriod.toFixed(1)} mois

📈 CROISSANCE MOYENNE:
• Conservateur: ${(conservative.summary.averageGrowth * 100).toFixed(0)}% par an
• Réaliste: ${(realistic.summary.averageGrowth * 100).toFixed(0)}% par an
• Optimiste: ${(optimistic.summary.averageGrowth * 100).toFixed(0)}% par an

🔄 RÉTENTION:
• Conservateur: ${(conservative.summary.churnRate * 100).toFixed(0)}% de churn
• Réaliste: ${(realistic.summary.churnRate * 100).toFixed(0)}% de churn
• Optimiste: ${(optimistic.summary.churnRate * 100).toFixed(0)}% de churn

🎯 OBJECTIFS CLÉS:
• Atteindre 791 clients payants en année 5 (scénario réaliste)
• Maintenir un taux de rétention > 90%
• Optimiser le CAC pour un LTV/CAC > 3
• Réduire le churn de 8% à 5% sur 5 ans
  `;
}
