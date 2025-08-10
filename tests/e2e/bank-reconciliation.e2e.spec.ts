import { test, expect, Page } from '@playwright/test';

/**
 * Tests E2E pour le module de Réconciliation Bancaire
 * E-COMPTA-IA - SYSCOHADA AUDCIF
 */

test.describe('🏦 Réconciliation Bancaire E2E', () => {
  let page: Page;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    
    // Navigation vers la page de réconciliation
    await page.goto('/modules/bank-reconciliation');
    
    // Attendre que la page soit chargée
    await page.waitForLoadState('networkidle');
  });

  test.describe('🧪 Navigation et Interface', () => {
    test('should display reconciliation dashboard', async () => {
      // Vérifier le titre de la page
      await expect(page).toHaveTitle(/Réconciliation Bancaire.*E-COMPTA-IA/);
      
      // Vérifier les éléments principaux de l'interface
      await expect(page.locator('[data-testid="reconciliation-dashboard"]')).toBeVisible();
      await expect(page.locator('[data-testid="bank-transactions-table"]')).toBeVisible();
      await expect(page.locator('[data-testid="book-entries-table"]')).toBeVisible();
      await expect(page.locator('[data-testid="reconciliation-summary"]')).toBeVisible();
    });

    test('should show account selector', async () => {
      const accountSelector = page.locator('[data-testid="account-selector"]');
      await expect(accountSelector).toBeVisible();
      
      // Tester la sélection d'un compte
      await accountSelector.click();
      await expect(page.locator('[data-testid="account-option"]').first()).toBeVisible();
    });

    test('should display filter options', async () => {
      // Vérifier les filtres de date
      await expect(page.locator('[data-testid="date-filter-start"]')).toBeVisible();
      await expect(page.locator('[data-testid="date-filter-end"]')).toBeVisible();
      
      // Vérifier les filtres de statut
      await expect(page.locator('[data-testid="status-filter"]')).toBeVisible();
      
      // Vérifier le filtre de montant
      await expect(page.locator('[data-testid="amount-filter"]')).toBeVisible();
    });
  });

  test.describe('🧪 Transactions Bancaires', () => {
    test('should load and display bank transactions', async () => {
      // Attendre le chargement des données
      await page.waitForSelector('[data-testid="bank-transaction-row"]', { timeout: 10000 });
      
      // Vérifier qu'au moins une transaction est affichée
      const transactionRows = page.locator('[data-testid="bank-transaction-row"]');
      await expect(transactionRows.first()).toBeVisible();
      
      // Vérifier les colonnes de la transaction
      const firstRow = transactionRows.first();
      await expect(firstRow.locator('[data-testid="transaction-date"]')).toBeVisible();
      await expect(firstRow.locator('[data-testid="transaction-description"]')).toBeVisible();
      await expect(firstRow.locator('[data-testid="transaction-amount"]')).toBeVisible();
      await expect(firstRow.locator('[data-testid="transaction-type"]')).toBeVisible();
    });

    test('should format amounts in XOF currency', async () => {
      await page.waitForSelector('[data-testid="transaction-amount"]');
      
      const amountElement = page.locator('[data-testid="transaction-amount"]').first();
      const amountText = await amountElement.textContent();
      
      // Vérifier le format XOF (ex: "1 000 000 XOF")
      expect(amountText).toMatch(/[\d\s]+XOF/);
    });

    test('should show transaction details on click', async () => {
      await page.waitForSelector('[data-testid="bank-transaction-row"]');
      
      // Cliquer sur la première transaction
      await page.locator('[data-testid="bank-transaction-row"]').first().click();
      
      // Vérifier l'ouverture du modal de détails
      await expect(page.locator('[data-testid="transaction-details-modal"]')).toBeVisible();
      
      // Vérifier les détails affichés
      await expect(page.locator('[data-testid="detail-reference"]')).toBeVisible();
      await expect(page.locator('[data-testid="detail-category"]')).toBeVisible();
      await expect(page.locator('[data-testid="detail-balance"]')).toBeVisible();
    });
  });

  test.describe('🧪 Écritures Comptables', () => {
    test('should display book entries with SYSCOHADA accounts', async () => {
      await page.waitForSelector('[data-testid="book-entry-row"]');
      
      const entryRows = page.locator('[data-testid="book-entry-row"]');
      await expect(entryRows.first()).toBeVisible();
      
      // Vérifier les comptes SYSCOHADA
      const accountElement = entryRows.first().locator('[data-testid="entry-account"]');
      const accountText = await accountElement.textContent();
      
      // Vérifier le format de compte SYSCOHADA (ex: "411100", "521000")
      expect(accountText).toMatch(/^[1-8]\d{4,5}$/);
    });

    test('should show journal codes', async () => {
      await page.waitForSelector('[data-testid="entry-journal"]');
      
      const journalElement = page.locator('[data-testid="entry-journal"]').first();
      const journalText = await journalElement.textContent();
      
      // Vérifier les codes de journaux SYSCOHADA (VTE, ACH, BQ, etc.)
      expect(journalText).toMatch(/^(VTE|ACH|BQ|OD|PAIE|CA)$/);
    });
  });

  test.describe('🧪 Auto-matching', () => {
    test('should perform automatic matching', async () => {
      // Cliquer sur le bouton d'auto-matching
      await page.locator('[data-testid="auto-match-button"]').click();
      
      // Attendre le traitement
      await page.waitForSelector('[data-testid="matching-progress"]');
      await page.waitForSelector('[data-testid="matching-results"]', { timeout: 30000 });
      
      // Vérifier les résultats
      const resultsElement = page.locator('[data-testid="matching-results"]');
      await expect(resultsElement).toBeVisible();
      
      const matchCount = await resultsElement.locator('[data-testid="match-count"]').textContent();
      expect(matchCount).toMatch(/\d+/); // Au moins un chiffre
    });

    test('should show confidence levels for matches', async () => {
      // Effectuer auto-matching
      await page.locator('[data-testid="auto-match-button"]').click();
      await page.waitForSelector('[data-testid="match-item"]', { timeout: 30000 });
      
      // Vérifier les niveaux de confiance
      const matchItems = page.locator('[data-testid="match-item"]');
      const firstMatch = matchItems.first();
      
      await expect(firstMatch.locator('[data-testid="confidence-badge"]')).toBeVisible();
      
      const confidenceBadge = firstMatch.locator('[data-testid="confidence-badge"]');
      const confidenceText = await confidenceBadge.textContent();
      
      expect(['Élevée', 'Moyenne', 'Faible']).toContain(confidenceText);
    });
  });

  test.describe('🧪 Matching Manuel', () => {
    test('should create manual match', async () => {
      // Sélectionner une transaction bancaire
      await page.locator('[data-testid="bank-transaction-row"]').first().click();
      await page.locator('[data-testid="select-transaction-button"]').click();
      
      // Sélectionner une écriture comptable
      await page.locator('[data-testid="book-entry-row"]').first().click();
      await page.locator('[data-testid="select-entry-button"]').click();
      
      // Créer le matching manuel
      await page.locator('[data-testid="create-manual-match-button"]').click();
      
      // Vérifier la confirmation
      await expect(page.locator('[data-testid="match-success-message"]')).toBeVisible();
      
      // Vérifier que le match apparaît dans la liste
      await expect(page.locator('[data-testid="manual-match-item"]')).toBeVisible();
    });

    test('should validate manual match data', async () => {
      // Essayer de créer un match avec des montants différents
      await page.locator('[data-testid="bank-transaction-row"]').first().click();
      
      // Sélectionner une écriture avec un montant différent
      const bookEntries = page.locator('[data-testid="book-entry-row"]');
      await bookEntries.nth(1).click(); // Sélectionner la deuxième entrée
      
      await page.locator('[data-testid="create-manual-match-button"]').click();
      
      // Vérifier l'avertissement de différence de montant
      await expect(page.locator('[data-testid="amount-difference-warning"]')).toBeVisible();
      
      // Confirmer malgré la différence
      await page.locator('[data-testid="confirm-match-button"]').click();
      
      // Vérifier que le match est créé avec le flag de différence
      await expect(page.locator('[data-testid="match-warning-badge"]')).toBeVisible();
    });

    test('should remove manual match', async () => {
      // Créer un match d'abord
      await page.locator('[data-testid="bank-transaction-row"]').first().click();
      await page.locator('[data-testid="book-entry-row"]').first().click();
      await page.locator('[data-testid="create-manual-match-button"]').click();
      
      // Attendre la création
      await expect(page.locator('[data-testid="manual-match-item"]')).toBeVisible();
      
      // Supprimer le match
      await page.locator('[data-testid="remove-match-button"]').first().click();
      
      // Confirmer la suppression
      await page.locator('[data-testid="confirm-remove-button"]').click();
      
      // Vérifier la suppression
      await expect(page.locator('[data-testid="match-removed-message"]')).toBeVisible();
    });
  });

  test.describe('🧪 Résumé et Statistiques', () => {
    test('should display reconciliation summary', async () => {
      const summaryElement = page.locator('[data-testid="reconciliation-summary"]');
      
      // Vérifier les métriques principales
      await expect(summaryElement.locator('[data-testid="total-bank-transactions"]')).toBeVisible();
      await expect(summaryElement.locator('[data-testid="total-book-entries"]')).toBeVisible();
      await expect(summaryElement.locator('[data-testid="matched-count"]')).toBeVisible();
      await expect(summaryElement.locator('[data-testid="unmatched-count"]')).toBeVisible();
      await expect(summaryElement.locator('[data-testid="balance-difference"]')).toBeVisible();
    });

    test('should update summary after matching', async () => {
      // Récupérer le nombre initial de matches
      const initialMatched = await page.locator('[data-testid="matched-count"]').textContent();
      
      // Créer un nouveau match
      await page.locator('[data-testid="auto-match-button"]').click();
      await page.waitForSelector('[data-testid="matching-results"]', { timeout: 30000 });
      
      // Vérifier que le résumé s'est mis à jour
      const updatedMatched = await page.locator('[data-testid="matched-count"]').textContent();
      expect(updatedMatched).not.toBe(initialMatched);
    });

    test('should show last update timestamp', async () => {
      const lastUpdatedElement = page.locator('[data-testid="last-updated"]');
      await expect(lastUpdatedElement).toBeVisible();
      
      const timestamp = await lastUpdatedElement.textContent();
      // Vérifier le format de date français
      expect(timestamp).toMatch(/\d{2}\/\d{2}\/\d{4}.*\d{2}:\d{2}/);
    });
  });

  test.describe('🧪 Export et Rapports', () => {
    test('should export reconciliation data', async () => {
      // Setup download handler
      const downloadPromise = page.waitForEvent('download');
      
      // Cliquer sur export
      await page.locator('[data-testid="export-button"]').click();
      await page.locator('[data-testid="export-excel"]').click();
      
      // Attendre le téléchargement
      const download = await downloadPromise;
      
      // Vérifier le nom du fichier
      expect(download.suggestedFilename()).toMatch(/reconciliation.*\.xlsx/);
    });

    test('should generate reconciliation report', async () => {
      // Générer le rapport
      await page.locator('[data-testid="generate-report-button"]').click();
      
      // Attendre l'ouverture du modal de rapport
      await expect(page.locator('[data-testid="report-modal"]')).toBeVisible();
      
      // Vérifier le contenu du rapport
      await expect(page.locator('[data-testid="report-summary"]')).toBeVisible();
      await expect(page.locator('[data-testid="report-matches"]')).toBeVisible();
      await expect(page.locator('[data-testid="report-discrepancies"]')).toBeVisible();
      
      // Vérifier les totaux en XOF
      const totalElement = page.locator('[data-testid="report-total"]');
      const totalText = await totalElement.textContent();
      expect(totalText).toContain('XOF');
    });
  });

  test.describe('🧪 Responsive Design', () => {
    test('should work on mobile devices', async () => {
      // Redimensionner pour mobile
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Vérifier que l'interface s'adapte
      await expect(page.locator('[data-testid="mobile-menu-button"]')).toBeVisible();
      
      // Tester la navigation mobile
      await page.locator('[data-testid="mobile-menu-button"]').click();
      await expect(page.locator('[data-testid="mobile-nav-menu"]')).toBeVisible();
    });

    test('should work on tablet devices', async () => {
      // Redimensionner pour tablette
      await page.setViewportSize({ width: 768, height: 1024 });
      
      // Vérifier l'adaptation de l'interface
      await expect(page.locator('[data-testid="reconciliation-dashboard"]')).toBeVisible();
      
      // Les tables doivent rester lisibles
      await expect(page.locator('[data-testid="bank-transactions-table"]')).toBeVisible();
      await expect(page.locator('[data-testid="book-entries-table"]')).toBeVisible();
    });
  });

  test.describe('🧪 Performance', () => {
    test('should load page within acceptable time', async () => {
      const startTime = Date.now();
      
      await page.goto('/modules/bank-reconciliation');
      await page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(5000); // 5 secondes max
    });

    test('should handle large datasets efficiently', async () => {
      // Simuler un grand dataset
      await page.locator('[data-testid="account-selector"]').click();
      await page.locator('[data-testid="large-account-option"]').click(); // Compte avec beaucoup de données
      
      const startTime = Date.now();
      await page.waitForSelector('[data-testid="bank-transaction-row"]');
      const loadTime = Date.now() - startTime;
      
      expect(loadTime).toBeLessThan(10000); // 10 secondes max pour gros dataset
    });
  });

  test.describe('🧪 Accessibilité', () => {
    test('should be keyboard navigable', async () => {
      // Navigation au clavier
      await page.keyboard.press('Tab');
      await expect(page.locator(':focus')).toBeVisible();
      
      // Navigation dans la table
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('Enter');
      
      // Vérifier l'ouverture du détail par clavier
      await expect(page.locator('[data-testid="transaction-details-modal"]')).toBeVisible();
    });

    test('should have proper ARIA labels', async () => {
      // Vérifier les labels ARIA
      const button = page.locator('[data-testid="auto-match-button"]');
      await expect(button).toHaveAttribute('aria-label');
      
      // Vérifier les rôles
      const table = page.locator('[data-testid="bank-transactions-table"]');
      await expect(table).toHaveAttribute('role', 'table');
    });

    test('should work with screen readers', async () => {
      // Vérifier les textes alternatifs
      const summaryElement = page.locator('[data-testid="reconciliation-summary"]');
      await expect(summaryElement).toHaveAttribute('aria-describedby');
      
      // Vérifier les titres pour navigation
      await expect(page.locator('h1, h2, h3')).toHaveCount(4); // Structure hiérarchique
    });
  });
});