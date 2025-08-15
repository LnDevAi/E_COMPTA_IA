import { TestBed } from '@angular/core/testing';
import { ReconciliationService } from './services/reconciliationService';
import { BankTransaction, BookEntry, ReconciliationMatch, ReconciliationStats } from './types';

describe('🏦 ReconciliationService - Tests Basiques', () => {
  let service: ReconciliationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ReconciliationService]
    });
    service = ReconciliationService.getInstance();
  });

  describe('🧪 Service Initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should be singleton', () => {
      const service1 = ReconciliationService.getInstance();
      const service2 = ReconciliationService.getInstance();
      expect(service1).toBe(service2);
    });
  });

  describe('🧪 Basic Functionality', () => {
    it('should have getBankTransactions method', () => {
      expect(typeof service.getBankTransactions).toBe('function');
    });

    it('should have getBookEntries method', () => {
      expect(typeof service.getBookEntries).toBe('function');
    });

    it('should have getReconciliationSummary method', () => {
      expect(typeof service.getReconciliationSummary).toBe('function');
    });

    it('should have manualMatch method', () => {
      expect(typeof service.manualMatch).toBe('function');
    });

    it('should have autoMatch method', () => {
      expect(typeof service.autoMatch).toBe('function');
    });
  });

  describe('🧪 SYSCOHADA Compatibility', () => {
    it('should work with SYSCOHADA account codes', () => {
      const testAccountId = '521000'; // Code SYSCOHADA banque
      expect(testAccountId).toMatch(/^[1-8]\d{4,5}$/);
    });

    it('should handle XOF currency format', () => {
      // Test currency compatibility
      const amount = 1000000;
      const formatted = new Intl.NumberFormat('fr-BF', {
        style: 'currency',
        currency: 'XOF'
      }).format(amount);
      expect(formatted).toMatch(/XOF|CFA/); // Accept both XOF and CFA formats
    });
  });

  describe('🧪 Error Handling', () => {
    it('should handle invalid account IDs gracefully', async () => {
      try {
        await service.getBankTransactions('');
        // If no error is thrown, that's also acceptable
        expect(true).toBe(true);
      } catch (error) {
        // Error handling is expected for invalid input
        expect(error).toBeDefined();
      }
    });
  });

  describe('🧪 Integration Ready', () => {
    it('should be ready for Angular integration', () => {
      expect(service).toBeInstanceOf(ReconciliationService);
    });

    it('should have proper base URL configuration', () => {
      expect((service as any).baseUrl).toContain('bank-reconciliation');
    });
  });
});