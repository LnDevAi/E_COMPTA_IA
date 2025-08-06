import { 
  FinancialStatement, 
  BalanceSheet, 
  IncomeStatement, 
  CashFlowStatement,
  FinancialRatios,
  FinancialPeriod,
  StatementFormat
} from '../types';

export interface FinancialStatementsFilter {
  periodId?: string;
  year?: number;
  format?: StatementFormat;
  status?: 'draft' | 'finalized' | 'published';
}

export interface GenerationOptions {
  format: StatementFormat;
  includeComparatives: boolean;
  includeCashFlow: boolean;
  includeRatios: boolean;
  includeNotes: boolean;
  currency: string;
}

export class FinancialStatementsService {
  private static instance: FinancialStatementsService;
  private baseUrl = '/api/financial-statements';

  static getInstance(): FinancialStatementsService {
    if (!FinancialStatementsService.instance) {
      FinancialStatementsService.instance = new FinancialStatementsService();
    }
    return FinancialStatementsService.instance;
  }

  // Récupération des périodes financières
  async getFinancialPeriods(): Promise<FinancialPeriod[]> {
    try {
      const response = await fetch(`${this.baseUrl}/periods`);
      if (!response.ok) throw new Error('Erreur lors de la récupération des périodes');
      return await response.json();
    } catch (error) {
      console.error('Erreur getFinancialPeriods:', error);
      throw error;
    }
  }

  // Génération du bilan
  async generateBalanceSheet(periodId: string, options: GenerationOptions): Promise<BalanceSheet> {
    try {
      const response = await fetch(`${this.baseUrl}/balance-sheet/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          periodId,
          options
        }),
      });

      if (!response.ok) throw new Error('Erreur lors de la génération du bilan');
      return await response.json();
    } catch (error) {
      console.error('Erreur generateBalanceSheet:', error);
      throw error;
    }
  }

  // Génération du compte de résultat
  async generateIncomeStatement(periodId: string, options: GenerationOptions): Promise<IncomeStatement> {
    try {
      const response = await fetch(`${this.baseUrl}/income-statement/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          periodId,
          options
        }),
      });

      if (!response.ok) throw new Error('Erreur lors de la génération du compte de résultat');
      return await response.json();
    } catch (error) {
      console.error('Erreur generateIncomeStatement:', error);
      throw error;
    }
  }

  // Génération du tableau des flux de trésorerie
  async generateCashFlowStatement(periodId: string, options: GenerationOptions): Promise<CashFlowStatement> {
    try {
      const response = await fetch(`${this.baseUrl}/cash-flow/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          periodId,
          options
        }),
      });

      if (!response.ok) throw new Error('Erreur lors de la génération du tableau des flux');
      return await response.json();
    } catch (error) {
      console.error('Erreur generateCashFlowStatement:', error);
      throw error;
    }
  }

  // Calcul des ratios financiers
  async calculateFinancialRatios(periodId: string): Promise<FinancialRatios> {
    try {
      const response = await fetch(`${this.baseUrl}/ratios/calculate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ periodId }),
      });

      if (!response.ok) throw new Error('Erreur lors du calcul des ratios');
      return await response.json();
    } catch (error) {
      console.error('Erreur calculateFinancialRatios:', error);
      throw error;
    }
  }

  // Génération complète des états financiers
  async generateCompleteFinancialStatements(
    periodId: string, 
    options: GenerationOptions
  ): Promise<FinancialStatement> {
    try {
      const response = await fetch(`${this.baseUrl}/complete/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          periodId,
          options
        }),
      });

      if (!response.ok) throw new Error('Erreur lors de la génération complète');
      return await response.json();
    } catch (error) {
      console.error('Erreur generateCompleteFinancialStatements:', error);
      throw error;
    }
  }

  // Validation des états financiers
  async validateFinancialStatements(periodId: string): Promise<{
    isValid: boolean;
    errors: Array<{
      code: string;
      message: string;
      severity: 'error' | 'warning';
      section: 'balance_sheet' | 'income_statement' | 'cash_flow' | 'ratios';
    }>;
    warnings: Array<{
      code: string;
      message: string;
      suggestion: string;
    }>;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ periodId }),
      });

      if (!response.ok) throw new Error('Erreur lors de la validation');
      return await response.json();
    } catch (error) {
      console.error('Erreur validateFinancialStatements:', error);
      throw error;
    }
  }

  // Finalisation d'une période
  async finalizePeriod(periodId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/periods/${periodId}/finalize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Erreur lors de la finalisation');
      return true;
    } catch (error) {
      console.error('Erreur finalizePeriod:', error);
      throw error;
    }
  }

  // Publication des états financiers
  async publishFinancialStatements(periodId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/periods/${periodId}/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Erreur lors de la publication');
      return true;
    } catch (error) {
      console.error('Erreur publishFinancialStatements:', error);
      throw error;
    }
  }

  // Export des états financiers
  async exportFinancialStatements(
    periodId: string, 
    format: 'pdf' | 'excel' | 'word', 
    options: GenerationOptions
  ): Promise<Blob> {
    try {
      const response = await fetch(`${this.baseUrl}/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          periodId,
          format,
          options
        }),
      });

      if (!response.ok) throw new Error('Erreur lors de l\'export');
      return await response.blob();
    } catch (error) {
      console.error('Erreur exportFinancialStatements:', error);
      throw error;
    }
  }

  // Comparaison entre périodes
  async compareFinancialStatements(
    currentPeriodId: string, 
    previousPeriodId: string
  ): Promise<{
    balanceSheetComparison: any;
    incomeStatementComparison: any;
    ratiosComparison: any;
    analysis: {
      growthRates: any;
      trends: any;
      alerts: string[];
    };
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/compare`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPeriodId,
          previousPeriodId
        }),
      });

      if (!response.ok) throw new Error('Erreur lors de la comparaison');
      return await response.json();
    } catch (error) {
      console.error('Erreur compareFinancialStatements:', error);
      throw error;
    }
  }

  // Analyse automatique par IA
  async analyzeFinancialStatements(periodId: string): Promise<{
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
    recommendations: Array<{
      priority: 'high' | 'medium' | 'low';
      category: string;
      description: string;
      impact: string;
    }>;
    overallScore: number;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ periodId }),
      });

      if (!response.ok) throw new Error('Erreur lors de l\'analyse IA');
      return await response.json();
    } catch (error) {
      console.error('Erreur analyzeFinancialStatements:', error);
      throw error;
    }
  }

  // Templates par secteur d'activité
  async getIndustryTemplates(industryCode: string): Promise<{
    balanceSheetTemplate: any;
    incomeStatementTemplate: any;
    keyRatios: string[];
    benchmarks: any;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/templates/industry/${industryCode}`);
      if (!response.ok) throw new Error('Erreur lors de la récupération du template');
      return await response.json();
    } catch (error) {
      console.error('Erreur getIndustryTemplates:', error);
      throw error;
    }
  }

  // Conversion de format (OHADA <-> IFRS)
  async convertFormat(
    periodId: string, 
    fromFormat: StatementFormat, 
    toFormat: StatementFormat
  ): Promise<FinancialStatement> {
    try {
      const response = await fetch(`${this.baseUrl}/convert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          periodId,
          fromFormat,
          toFormat
        }),
      });

      if (!response.ok) throw new Error('Erreur lors de la conversion');
      return await response.json();
    } catch (error) {
      console.error('Erreur convertFormat:', error);
      throw error;
    }
  }

  // Calcul de ratios personnalisés
  calculateCustomRatios(balanceSheet: BalanceSheet, incomeStatement: IncomeStatement): FinancialRatios {
    // Calculs côté client pour les ratios standards
    const totalAssets = balanceSheet.assets.total;
    const totalEquity = balanceSheet.equity.total;
    const totalDebt = balanceSheet.liabilities.total;
    const currentAssets = balanceSheet.assets.current;
    const currentLiabilities = balanceSheet.liabilities.current;
    const inventory = balanceSheet.assets.inventory || 0;
    const cash = balanceSheet.assets.cash;
    const revenue = incomeStatement.revenue.total;
    const grossProfit = incomeStatement.grossProfit;
    const operatingIncome = incomeStatement.operatingIncome;
    const netIncome = incomeStatement.netIncome;
    const interestExpense = incomeStatement.interestExpense || 0;

    return {
      liquidity: {
        currentRatio: currentAssets / currentLiabilities,
        quickRatio: (currentAssets - inventory) / currentLiabilities,
        cashRatio: cash / currentLiabilities,
        workingCapital: currentAssets - currentLiabilities
      },
      profitability: {
        grossMargin: (grossProfit / revenue) * 100,
        operatingMargin: (operatingIncome / revenue) * 100,
        netMargin: (netIncome / revenue) * 100,
        roe: (netIncome / totalEquity) * 100,
        roa: (netIncome / totalAssets) * 100,
        roic: (operatingIncome / (totalEquity + totalDebt)) * 100
      },
      leverage: {
        debtToEquity: totalDebt / totalEquity,
        debtToAssets: (totalDebt / totalAssets) * 100,
        equityRatio: (totalEquity / totalAssets) * 100,
        interestCoverage: interestExpense > 0 ? operatingIncome / interestExpense : 0
      },
      efficiency: {
        assetTurnover: revenue / totalAssets,
        inventoryTurnover: revenue / inventory,
        receivableTurnover: revenue / (balanceSheet.assets.receivables || 0),
        payablesTurnover: revenue / (balanceSheet.liabilities.payables || 0)
      },
      valuation: {
        bookValuePerShare: 0, // Nécessite nombre d'actions
        earningsPerShare: 0,  // Nécessite nombre d'actions
        priceToBook: 0,       // Nécessite cours de bourse
        priceToEarnings: 0    // Nécessite cours de bourse
      }
    };
  }

  // Détection d'anomalies
  detectAnomalies(currentPeriod: FinancialStatement, previousPeriod?: FinancialStatement): Array<{
    type: 'error' | 'warning' | 'info';
    category: string;
    description: string;
    impact: string;
    suggestion: string;
  }> {
    const anomalies: any[] = [];

    // Vérification de l'équilibre du bilan
    const balanceSheet = currentPeriod.balanceSheet;
    if (Math.abs(balanceSheet.assets.total - (balanceSheet.liabilities.total + balanceSheet.equity.total)) > 1000) {
      anomalies.push({
        type: 'error',
        category: 'Balance Sheet',
        description: 'Le bilan n\'est pas équilibré',
        impact: 'États financiers invalides',
        suggestion: 'Vérifier les écritures comptables et corriger les erreurs'
      });
    }

    // Ratios anormaux
    const ratios = this.calculateCustomRatios(balanceSheet, currentPeriod.incomeStatement);
    
    if (ratios.liquidity.currentRatio < 1) {
      anomalies.push({
        type: 'warning',
        category: 'Liquidity',
        description: 'Ratio de liquidité général inférieur à 1',
        impact: 'Risque de difficultés de trésorerie',
        suggestion: 'Améliorer la gestion du BFR ou renforcer la trésorerie'
      });
    }

    if (ratios.profitability.netMargin < 0) {
      anomalies.push({
        type: 'warning',
        category: 'Profitability',
        description: 'Marge nette négative',
        impact: 'Rentabilité insuffisante',
        suggestion: 'Analyser les coûts et optimiser la structure de revenus'
      });
    }

    // Comparaison avec période précédente
    if (previousPeriod) {
      const previousRatios = this.calculateCustomRatios(
        previousPeriod.balanceSheet, 
        previousPeriod.incomeStatement
      );

      const revenueGrowth = ((currentPeriod.incomeStatement.revenue.total - previousPeriod.incomeStatement.revenue.total) 
        / previousPeriod.incomeStatement.revenue.total) * 100;

      if (revenueGrowth < -10) {
        anomalies.push({
          type: 'warning',
          category: 'Growth',
          description: `Forte baisse du chiffre d'affaires (${revenueGrowth.toFixed(1)}%)`,
          impact: 'Détérioration de l\'activité',
          suggestion: 'Analyser les causes et mettre en place un plan de redressement'
        });
      }
    }

    return anomalies;
  }

  // Préparation pour audit
  async prepareForAudit(periodId: string): Promise<{
    checklist: Array<{
      item: string;
      status: 'completed' | 'pending' | 'na';
      notes?: string;
    }>;
    supportingDocuments: string[];
    reconciliations: any[];
    trialBalance: any;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/audit/prepare`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ periodId }),
      });

      if (!response.ok) throw new Error('Erreur lors de la préparation audit');
      return await response.json();
    } catch (error) {
      console.error('Erreur prepareForAudit:', error);
      throw error;
    }
  }
}