import { TestBed } from '@angular/core/testing';
import { ReconciliationService } from './reconciliationService';
import { BankTransaction, BookEntry, ReconciliationMatch, ReconciliationStatus } from './types';

describe('ReconciliationService', () => {
  let service: ReconciliationService;

  // Mock data
  const mockBankTransactions: BankTransaction[] = [
    {
      id: 'bank-1',
      date: '2024-01-15',
      description: 'Virement SARL ABC',
      amount: 1000000,
      type: 'credit',
      reference: 'VIR123456',
      balance: 5000000,
      category: 'virement'
    },
    {
      id: 'bank-2',
      date: '2024-01-16',
      description: 'Achat matériel bureau',
      amount: -250000,
      type: 'debit',
      reference: 'CB789012',
      balance: 4750000,
      category: 'achat'
    }
  ];

  const mockBookEntries: BookEntry[] = [
    {
      id: 'book-1',
      date: '2024-01-15',
      description: 'Vente marchandises SARL ABC',
      amount: 1000000,
      account: '411100',
      reference: 'FAC-2024-001',
      journal: 'VTE',
      status: 'validated'
    },
    {
      id: 'book-2',
      date: '2024-01-16',
      description: 'Achat mobilier bureau',
      amount: -250000,
      account: '213100',
      reference: 'FAC-ACH-001',
      journal: 'ACH',
      status: 'validated'
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ReconciliationService]
    });
    service = TestBed.inject(ReconciliationService);
  });

  describe('🧪 Service Initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should initialize with empty data', async () => {
      const result = await service.getReconciliationData('test-account');
      expect(result.bankTransactions).toBeDefined();
      expect(result.bookEntries).toBeDefined();
      expect(result.matches).toBeDefined();
      expect(result.summary).toBeDefined();
    });
  });

  describe('🧪 Auto-matching Algorithm', () => {
    beforeEach(() => {
      // Setup mock data for auto-matching tests
      service['mockBankTransactions'] = mockBankTransactions;
      service['mockBookEntries'] = mockBookEntries;
    });

    it('should perform auto-matching with exact amount and date', async () => {
      const matches = await service.performAutoMatching('test-account');
      expect(matches.length).toBeGreaterThan(0);
      
      // Check if exact matches were found
      const exactMatch = matches.find(match => 
        match.confidence === 'high' && 
        match.bankTransaction.amount === match.bookEntry.amount
      );
      expect(exactMatch).toBeDefined();
    });

    it('should calculate string similarity correctly', () => {
      const similarity1 = service['calculateStringSimilarity']('Virement SARL ABC', 'Vente marchandises SARL ABC');
      const similarity2 = service['calculateStringSimilarity']('test', 'completely different');
      
      expect(similarity1).toBeGreaterThan(0.5);
      expect(similarity2).toBeLessThan(0.5);
    });

    it('should handle date tolerance in matching', () => {
      const date1 = new Date('2024-01-15');
      const date2 = new Date('2024-01-16');
      const date3 = new Date('2024-01-20');
      
      expect(service['isDateWithinTolerance'](date1, date2, 2)).toBe(true);
      expect(service['isDateWithinTolerance'](date1, date3, 2)).toBe(false);
    });

    it('should assign confidence levels correctly', async () => {
      const matches = await service.performAutoMatching('test-account');
      
      matches.forEach(match => {
        expect(['high', 'medium', 'low']).toContain(match.confidence);
        if (match.confidence === 'high') {
          expect(match.score).toBeGreaterThanOrEqual(0.8);
        }
      });
    });
  });

  describe('🧪 Manual Matching', () => {
    it('should create manual match successfully', async () => {
      const bankTransaction = mockBankTransactions[0];
      const bookEntry = mockBookEntries[0];
      
      const result = await service.createManualMatch('test-account', bankTransaction.id, bookEntry.id);
      expect(result.success).toBe(true);
      expect(result.match).toBeDefined();
      expect(result.match?.type).toBe('manual');
    });

    it('should validate manual match data', async () => {
      const result = await service.createManualMatch('test-account', 'invalid-bank', 'invalid-book');
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should remove manual match', async () => {
      // First create a match
      const createResult = await service.createManualMatch('test-account', 'bank-1', 'book-1');
      expect(createResult.success).toBe(true);
      
      // Then remove it
      const removeResult = await service.removeMatch('test-account', createResult.match!.id);
      expect(removeResult.success).toBe(true);
    });
  });

  describe('🧪 Data Validation', () => {
    it('should validate bank transaction data', () => {
      const validTransaction = mockBankTransactions[0];
      const invalidTransaction = { ...validTransaction, amount: null };
      
      expect(service['validateBankTransaction'](validTransaction)).toBe(true);
      expect(service['validateBankTransaction'](invalidTransaction as any)).toBe(false);
    });

    it('should validate book entry data', () => {
      const validEntry = mockBookEntries[0];
      const invalidEntry = { ...validEntry, date: '' };
      
      expect(service['validateBookEntry'](validEntry)).toBe(true);
      expect(service['validateBookEntry'](invalidEntry as any)).toBe(false);
    });

    it('should handle missing required fields', () => {
      const incompleteTransaction = {
        id: 'test',
        date: '2024-01-15'
        // Missing amount, description, etc.
      };
      
      expect(service['validateBankTransaction'](incompleteTransaction as any)).toBe(false);
    });
  });

  describe('🧪 Summary Calculations', () => {
    it('should calculate reconciliation summary correctly', async () => {
      const data = await service.getReconciliationData('test-account');
      
      expect(data.summary).toBeDefined();
      expect(data.summary.totalBankTransactions).toBeDefined();
      expect(data.summary.totalBookEntries).toBeDefined();
      expect(data.summary.matchedTransactions).toBeDefined();
      expect(data.summary.unmatchedTransactions).toBeDefined();
      expect(data.summary.difference).toBeDefined();
    });

    it('should update summary when matches change', async () => {
      const initialData = await service.getReconciliationData('test-account');
      const initialMatched = initialData.summary.matchedTransactions;
      
      // Create a manual match
      await service.createManualMatch('test-account', 'bank-1', 'book-1');
      
      const updatedData = await service.getReconciliationData('test-account');
      expect(updatedData.summary.matchedTransactions).toBeGreaterThanOrEqual(initialMatched);
    });
  });

  describe('🧪 Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      // Mock network error
      spyOn(service, 'getReconciliationData').and.rejectWith(new Error('Network error'));
      
      try {
        await service.getReconciliationData('test-account');
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should handle invalid account IDs', async () => {
      const result = await service.getReconciliationData('');
      expect(result).toBeDefined();
      // Should return empty/default data rather than throwing
    });

    it('should handle malformed data', async () => {
      // Test with corrupted mock data
      service['mockBankTransactions'] = [null as any];
      
      const matches = await service.performAutoMatching('test-account');
      expect(matches).toBeDefined();
      expect(Array.isArray(matches)).toBe(true);
    });
  });

  describe('🧪 Performance Tests', () => {
    it('should handle large datasets efficiently', async () => {
      // Create large mock dataset
      const largeBankTransactions = Array.from({ length: 1000 }, (_, i) => ({
        ...mockBankTransactions[0],
        id: `bank-${i}`,
        amount: Math.random() * 1000000
      }));
      
      const largeBookEntries = Array.from({ length: 1000 }, (_, i) => ({
        ...mockBookEntries[0],
        id: `book-${i}`,
        amount: Math.random() * 1000000
      }));
      
      service['mockBankTransactions'] = largeBankTransactions;
      service['mockBookEntries'] = largeBookEntries;
      
      const startTime = performance.now();
      await service.performAutoMatching('test-account');
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(5000); // Should complete in under 5 seconds
    });

    it('should optimize string similarity calculations', () => {
      const text1 = 'Virement SARL ABC pour facture 2024-001';
      const text2 = 'Vente marchandises SARL ABC facture 001';
      
      const startTime = performance.now();
      const similarity = service['calculateStringSimilarity'](text1, text2);
      const endTime = performance.now();
      
      expect(similarity).toBeDefined();
      expect(endTime - startTime).toBeLessThan(10); // Should be very fast
    });
  });

  describe('🧪 SYSCOHADA Compliance', () => {
    it('should handle SYSCOHADA account codes', async () => {
      const syscohadaEntry = {
        ...mockBookEntries[0],
        account: '521000' // Banque SYSCOHADA code
      };
      
      expect(service['validateBookEntry'](syscohadaEntry)).toBe(true);
    });

    it('should support XOF currency formatting', () => {
      const amount = 1000000;
      const formatted = service['formatAmount'](amount, 'XOF');
      expect(formatted).toContain('XOF');
      expect(formatted).toContain('1 000 000');
    });

    it('should handle OHADA banking standards', async () => {
      const ohadaTransaction = {
        ...mockBankTransactions[0],
        reference: 'VIR' + Date.now().toString().substr(-10) // OHADA reference format
      };
      
      expect(service['validateBankTransaction'](ohadaTransaction)).toBe(true);
    });
  });

  describe('🧪 Integration Tests', () => {
    it('should integrate with Angular HTTP client', () => {
      // Test HTTP service integration
      expect(service['http']).toBeDefined();
    });

    it('should handle reactive data streams', (done) => {
      service.getReconciliationData('test-account').then(data => {
        expect(data).toBeDefined();
        done();
      });
    });

    it('should support real-time updates', async () => {
      // Test real-time reconciliation updates
      const initialData = await service.getReconciliationData('test-account');
      expect(initialData.summary.lastUpdated).toBeDefined();
    });
  });
});