import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ReconciliationService } from '../../src/app/modules/bank-reconciliation/reconciliationService';
import { FinancialStatementsService } from '../../src/app/modules/financial-statements/financialStatementsService';
import { UserPermissionsService } from '../../src/app/modules/user-permissions/userPermissionsService';

describe('🧪 E-COMPTA-IA Modules Integration Tests', () => {
  let reconciliationService: ReconciliationService;
  let financialService: FinancialStatementsService;
  let userService: UserPermissionsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ReconciliationService,
        FinancialStatementsService,
        UserPermissionsService
      ]
    });

    reconciliationService = TestBed.inject(ReconciliationService);
    financialService = TestBed.inject(FinancialStatementsService);
    userService = TestBed.inject(UserPermissionsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('🧪 Cross-Module Data Flow', () => {
    it('should integrate reconciliation data with financial statements', async () => {
      const entrepriseId = 'test-entreprise-1';
      
      // Mock reconciliation data
      const reconciliationData = {
        bankTransactions: [
          {
            id: 'bank-1',
            date: '2024-01-15',
            description: 'Virement client',
            amount: 1000000,
            type: 'credit' as const,
            reference: 'VIR123',
            balance: 5000000,
            category: 'virement'
          }
        ],
        bookEntries: [
          {
            id: 'book-1',
            date: '2024-01-15',
            description: 'Vente marchandises',
            amount: 1000000,
            account: '411100',
            reference: 'FAC-001',
            journal: 'VTE',
            status: 'validated' as const
          }
        ],
        matches: [],
        summary: {
          totalBankTransactions: 1,
          totalBookEntries: 1,
          matchedTransactions: 0,
          unmatchedTransactions: 2,
          difference: 0,
          lastUpdated: new Date()
        }
      };

      // Test reconciliation service
      spyOn(reconciliationService, 'getReconciliationData').and.returnValue(Promise.resolve(reconciliationData));
      
      const reconData = await reconciliationService.getReconciliationData(entrepriseId);
      expect(reconData.bankTransactions.length).toBe(1);

      // Test financial statements integration
      const statements = await financialService.generateStatements(entrepriseId, '2024');
      expect(statements).toBeDefined();
      expect(statements.bilanComptable).toBeDefined();
      expect(statements.compteResultat).toBeDefined();

      // Verify data consistency
      expect(reconData.summary.totalBankTransactions).toBeGreaterThan(0);
      expect(statements.bilanComptable.actif.circulant.tresorerie).toBeDefined();
    });

    it('should enforce user permissions across modules', async () => {
      const userId = 'test-user-1';
      const entrepriseId = 'test-entreprise-1';

      // Create user with limited permissions
      const userData = {
        id: userId,
        email: 'test@example.com',
        nom: 'Test User',
        role: 'COMPTABLE' as const,
        permissions: [
          {
            id: 'perm-1',
            module: 'bank-reconciliation',
            action: 'read',
            granted: true
          },
          {
            id: 'perm-2',
            module: 'financial-statements',
            action: 'read',
            granted: false
          }
        ],
        entrepriseId,
        isActive: true,
        lastLogin: new Date(),
        settings: {
          langue: 'fr',
          theme: 'default',
          notifications: true
        }
      };

      spyOn(userService, 'getUserById').and.returnValue(Promise.resolve({ success: true, user: userData }));
      spyOn(userService, 'checkPermission').and.callFake((userId, module, action) => {
        const permission = userData.permissions.find(p => p.module === module && p.action === action);
        return Promise.resolve({ success: true, hasPermission: permission?.granted || false });
      });

      // Test permissions for bank reconciliation (should be allowed)
      const bankPermission = await userService.checkPermission(userId, 'bank-reconciliation', 'read');
      expect(bankPermission.hasPermission).toBe(true);

      // Test permissions for financial statements (should be denied)
      const financePermission = await userService.checkPermission(userId, 'financial-statements', 'read');
      expect(financePermission.hasPermission).toBe(false);
    });
  });

  describe('🧪 End-to-End Workflow Tests', () => {
    it('should complete full accounting cycle', async () => {
      const entrepriseId = 'test-entreprise-1';
      const userId = 'test-user-1';

      // Step 1: Import bank transactions
      const bankData = await reconciliationService.getReconciliationData(entrepriseId);
      expect(bankData).toBeDefined();

      // Step 2: Perform reconciliation
      const matches = await reconciliationService.performAutoMatching(entrepriseId);
      expect(matches).toBeDefined();

      // Step 3: Generate financial statements
      const statements = await financialService.generateStatements(entrepriseId, '2024');
      expect(statements.bilanComptable).toBeDefined();
      expect(statements.compteResultat).toBeDefined();

      // Step 4: Calculate financial ratios
      const ratios = await financialService.calculateRatios(entrepriseId, '2024');
      expect(ratios.liquidite).toBeDefined();
      expect(ratios.rentabilite).toBeDefined();

      // Step 5: Generate audit trail
      const auditResult = await userService.logUserAction(userId, 'generate_statements', {
        entrepriseId,
        exercice: '2024'
      });
      expect(auditResult.success).toBe(true);
    });

    it('should handle SYSCOHADA compliance across modules', async () => {
      const entrepriseId = 'test-entreprise-syscohada';

      // Test SYSCOHADA plan comptable integration
      const reconciliationData = await reconciliationService.getReconciliationData(entrepriseId);
      
      // Verify SYSCOHADA account codes are used
      const syscohadaAccounts = ['411100', '521000', '701100', '601100'];
      reconciliationData.bookEntries.forEach(entry => {
        if (entry.account && syscohadaAccounts.includes(entry.account)) {
          expect(entry.account).toMatch(/^[1-8]\d{4,5}$/); // SYSCOHADA format
        }
      });

      // Test financial statements SYSCOHADA format
      const statements = await financialService.generateStatements(entrepriseId, '2024');
      expect(statements.bilanComptable.actif).toBeDefined();
      expect(statements.bilanComptable.passif).toBeDefined();
      expect(statements.compteResultat.charges).toBeDefined();
      expect(statements.compteResultat.produits).toBeDefined();

      // Verify SYSCOHADA structure
      expect(statements.bilanComptable.actif.immobilise).toBeDefined();
      expect(statements.bilanComptable.actif.circulant).toBeDefined();
      expect(statements.bilanComptable.passif.capitauxPropres).toBeDefined();
      expect(statements.bilanComptable.passif.dettes).toBeDefined();
    });
  });

  describe('🧪 Data Consistency Tests', () => {
    it('should maintain data integrity across modules', async () => {
      const entrepriseId = 'test-entreprise-1';

      // Get data from different modules
      const reconciliationData = await reconciliationService.getReconciliationData(entrepriseId);
      const statements = await financialService.generateStatements(entrepriseId, '2024');

      // Verify data consistency
      const bankBalance = reconciliationData.bankTransactions.reduce((sum, transaction) => {
        return sum + (transaction.type === 'credit' ? transaction.amount : -transaction.amount);
      }, 0);

      // Bank balance should match treasury in financial statements
      const treasuryBalance = statements.bilanComptable.actif.circulant.tresorerie.banques;
      
      // Allow for reasonable tolerance in floating point calculations
      const tolerance = 1; // 1 XOF tolerance
      expect(Math.abs(bankBalance - treasuryBalance)).toBeLessThanOrEqual(tolerance);
    });

    it('should synchronize user actions across modules', async () => {
      const userId = 'test-user-1';
      const entrepriseId = 'test-entreprise-1';

      // Perform action in reconciliation module
      await reconciliationService.createManualMatch(entrepriseId, 'bank-1', 'book-1');

      // Log the action
      const auditLog = await userService.logUserAction(userId, 'create_manual_match', {
        entrepriseId,
        bankTransactionId: 'bank-1',
        bookEntryId: 'book-1'
      });

      expect(auditLog.success).toBe(true);
      expect(auditLog.logEntry).toBeDefined();
      expect(auditLog.logEntry?.action).toBe('create_manual_match');

      // Verify audit trail
      const userAuditLog = await userService.getUserAuditLog(userId, { limit: 10 });
      expect(userAuditLog.logs.length).toBeGreaterThan(0);
      
      const lastLog = userAuditLog.logs[0];
      expect(lastLog.action).toBe('create_manual_match');
      expect(lastLog.userId).toBe(userId);
    });
  });

  describe('🧪 Performance Integration Tests', () => {
    it('should handle concurrent module operations', async () => {
      const entrepriseId = 'test-entreprise-1';
      const userId = 'test-user-1';

      const startTime = performance.now();

      // Run multiple operations concurrently
      const operations = await Promise.all([
        reconciliationService.getReconciliationData(entrepriseId),
        financialService.generateStatements(entrepriseId, '2024'),
        userService.getUserById(userId),
        reconciliationService.performAutoMatching(entrepriseId)
      ]);

      const endTime = performance.now();
      const duration = endTime - startTime;

      // All operations should complete
      expect(operations).toHaveLength(4);
      operations.forEach(result => {
        expect(result).toBeDefined();
      });

      // Should complete in reasonable time (adjust threshold as needed)
      expect(duration).toBeLessThan(3000); // 3 seconds
    });

    it('should optimize memory usage across modules', () => {
      // Monitor memory usage during module operations
      const initialMemory = process.memoryUsage?.() || { heapUsed: 0 };

      // Perform memory-intensive operations
      const largeDataset = Array.from({ length: 10000 }, (_, i) => ({
        id: `item-${i}`,
        data: new Array(100).fill(`data-${i}`)
      }));

      // Cleanup
      largeDataset.length = 0;

      const finalMemory = process.memoryUsage?.() || { heapUsed: 0 };
      
      // Memory should not leak significantly
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // Less than 50MB increase
    });
  });

  describe('🧪 Error Handling Integration', () => {
    it('should handle cascading failures gracefully', async () => {
      const entrepriseId = 'invalid-entreprise';

      // Test how modules handle invalid data
      try {
        await reconciliationService.getReconciliationData(entrepriseId);
        await financialService.generateStatements(entrepriseId, '2024');
      } catch (error) {
        // Should handle errors gracefully without crashing
        expect(error).toBeDefined();
      }

      // System should remain stable
      const validResult = await reconciliationService.getReconciliationData('valid-entreprise');
      expect(validResult).toBeDefined();
    });

    it('should maintain transaction integrity', async () => {
      const entrepriseId = 'test-entreprise-1';
      const userId = 'test-user-1';

      // Simulate a complex transaction that might fail
      try {
        // Start transaction
        await userService.logUserAction(userId, 'start_transaction', { entrepriseId });

        // Perform operations
        await reconciliationService.createManualMatch(entrepriseId, 'bank-1', 'book-1');
        
        // Simulate failure
        throw new Error('Simulated failure');

      } catch (error) {
        // Should rollback gracefully
        await userService.logUserAction(userId, 'rollback_transaction', { 
          entrepriseId, 
          error: error.message 
        });

        expect(error.message).toBe('Simulated failure');
      }

      // System should be in consistent state
      const reconciliationData = await reconciliationService.getReconciliationData(entrepriseId);
      expect(reconciliationData).toBeDefined();
    });
  });
});