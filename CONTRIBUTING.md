# 🤝 **GUIDE DE CONTRIBUTION - E-COMPTA-IA**

## **Contribuer au Projet Open Source**

---

Merci de votre intérêt pour contribuer à **E-COMPTA-IA** ! Ce projet vise à révolutionner la comptabilité en Afrique grâce à l'intelligence artificielle et nous accueillons chaleureusement toutes les contributions de la communauté.

---

## 📋 **SOMMAIRE**

- [🎯 Types de Contributions](#-types-de-contributions)
- [🚀 Démarrage Rapide](#-démarrage-rapide)
- [🔧 Configuration Développeur](#-configuration-développeur)
- [📝 Processus de Contribution](#-processus-de-contribution)
- [✅ Standards de Code](#-standards-de-code)
- [🧪 Tests et Qualité](#-tests-et-qualité)
- [📖 Documentation](#-documentation)
- [🐛 Rapporter des Bugs](#-rapporter-des-bugs)
- [💡 Proposer des Fonctionnalités](#-proposer-des-fonctionnalités)
- [👥 Communauté](#-communauté)

---

## 🎯 **TYPES DE CONTRIBUTIONS**

Nous acceptons plusieurs types de contributions :

### **💻 Code & Développement**
- 🔧 **Corrections de bugs** : Résoudre les problèmes existants
- ✨ **Nouvelles fonctionnalités** : Ajouter des modules ou améliorations
- 🎨 **Améliorations UI/UX** : Interface utilisateur et expérience
- ⚡ **Optimisations** : Performance et architecture
- 🔒 **Sécurité** : Renforcement des aspects sécuritaires

### **📚 Documentation**
- 📖 **Guides utilisateur** : Améliorer la documentation existante
- 🎥 **Tutoriels** : Créer des guides vidéo ou écrits
- 🌍 **Traductions** : Adapter le contenu en plusieurs langues
- 📝 **Code comments** : Améliorer la documentation du code

### **🧪 Testing & QA**
- 🐛 **Tests manuels** : Identifier et reporter des bugs
- 🤖 **Tests automatisés** : Créer des tests unitaires/intégration
- 📊 **Tests de performance** : Optimiser les performances
- 🔍 **Audit de code** : Révisions et suggestions

### **🎨 Design & UX**
- 🖌️ **Interface utilisateur** : Mockups et prototypes
- 🎯 **Expérience utilisateur** : Flow et ergonomie
- 📱 **Responsive design** : Adaptation mobile/tablette
- ♿ **Accessibilité** : Améliorer l'accessibilité

### **🌍 Localisation**
- 🗣️ **Traductions** : Français, Anglais, Langues locales
- 🌏 **Adaptations culturelles** : Normes locales par pays
- 📋 **Conformité réglementaire** : Spécificités OHADA par pays

---

## 🚀 **DÉMARRAGE RAPIDE**

### **1️⃣ Fork & Clone**

```bash
# 1. Fork le repository sur GitHub
# Cliquer sur "Fork" sur https://github.com/LnDevAi/E_COMPTA_IA

# 2. Cloner votre fork
git clone https://github.com/VOTRE_USERNAME/E_COMPTA_IA.git
cd E_COMPTA_IA

# 3. Ajouter le repository original comme remote
git remote add upstream https://github.com/LnDevAi/E_COMPTA_IA.git

# 4. Vérifier les remotes
git remote -v
```

### **2️⃣ Installation & Setup**

```bash
# 1. Installer les dépendances
npm install

# 2. Copier la configuration de développement
cp src/environments/environment.example.ts src/environments/environment.ts

# 3. Démarrer en mode développement
npm start

# 4. Vérifier que l'application fonctionne
# http://localhost:4200
```

### **3️⃣ Première Contribution**

```bash
# 1. Créer une branche pour votre contribution
git checkout -b feature/ma-nouvelle-fonctionnalite

# 2. Faire vos modifications
# ... développer ...

# 3. Commiter vos changements
git add .
git commit -m "feat: ajouter ma nouvelle fonctionnalité"

# 4. Pousser vers votre fork
git push origin feature/ma-nouvelle-fonctionnalite

# 5. Créer une Pull Request sur GitHub
```

---

## 🔧 **CONFIGURATION DÉVELOPPEUR**

### **⚙️ Outils Recommandés**

#### **IDE/Éditeur**
- **Visual Studio Code** (recommandé)
  - Extension : Angular Language Service
  - Extension : TypeScript Importer
  - Extension : Prettier
  - Extension : ESLint
  - Extension : GitLens

#### **Navigateur**
- **Chrome** avec Angular DevTools
- **Firefox** Developer Edition

#### **Outils CLI**
```bash
# Angular CLI (global)
npm install -g @angular/cli@20

# Autres outils utiles
npm install -g prettier eslint
```

### **🔧 Configuration VS Code**

Créez `.vscode/settings.json` :

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.organizeImports": true,
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "angular.enable-strict-mode-prompt": false,
  "files.associations": {
    "*.html": "html"
  }
}
```

### **🎯 Configuration des Hooks Git**

```bash
# Installer husky pour les hooks pre-commit
npm install --save-dev husky lint-staged

# Configuration dans package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "commit-msg": "commitizen"
    }
  },
  "lint-staged": {
    "src/**/*.{ts,html,scss}": [
      "prettier --write",
      "eslint --fix"
    ]
  }
}
```

---

## 📝 **PROCESSUS DE CONTRIBUTION**

### **🌟 Workflow Git**

Nous utilisons **Git Flow** simplifié :

- **`main`** : Branche de production stable
- **`develop`** : Branche de développement principale
- **`feature/xxx`** : Nouvelles fonctionnalités
- **`bugfix/xxx`** : Corrections de bugs
- **`hotfix/xxx`** : Corrections urgentes production

### **📋 Processus Détaillé**

#### **1. Préparation**
```bash
# Synchroniser avec upstream
git checkout develop
git pull upstream develop
git push origin develop

# Créer votre branche
git checkout -b feature/nom-fonctionnalite
```

#### **2. Développement**
```bash
# Développer en commits atomiques
git add .
git commit -m "type: description courte"

# Types de commits (conventional commits):
# feat: nouvelle fonctionnalité
# fix: correction de bug
# docs: documentation
# style: formatage, style
# refactor: refactoring code
# test: ajout/modification tests
# chore: maintenance, build
```

#### **3. Tests & Validation**
```bash
# Lancer les tests
npm test

# Vérifier le linting
npm run lint

# Build de production
npm run build --prod

# Tests E2E (si disponibles)
npm run e2e
```

#### **4. Pull Request**
1. **Poussez** votre branche vers votre fork
2. **Créez** une Pull Request sur GitHub
3. **Remplissez** le template de PR (description détaillée)
4. **Assignez** des reviewers si nécessaire
5. **Attendez** la review et les feedbacks

### **📋 Template Pull Request**

```markdown
## 🎯 Description
Brève description de la fonctionnalité/correction

## 🔧 Type de changement
- [ ] Bug fix (correction non-breaking)
- [ ] Nouvelle fonctionnalité (changement non-breaking)
- [ ] Breaking change (correction/fonctionnalité qui casse l'existant)
- [ ] Documentation

## ✅ Checklist
- [ ] Mon code suit les standards du projet
- [ ] J'ai effectué une auto-review de mon code
- [ ] J'ai commenté les parties complexes
- [ ] J'ai mis à jour la documentation
- [ ] Mes changements ne génèrent pas de warnings
- [ ] J'ai ajouté des tests qui prouvent que ma correction est efficace
- [ ] Les tests nouveaux et existants passent localement

## 🧪 Tests
Décrivez les tests effectués pour valider vos changements

## 📱 Screenshots (si applicable)
Ajoutez des captures d'écran pour les changements UI

## 📝 Notes supplémentaires
Toute information supplémentaire pour les reviewers
```

---

## ✅ **STANDARDS DE CODE**

### **🎯 Conventions TypeScript**

#### **Nommage**
```typescript
// Classes : PascalCase
class UserService { }
class BankReconciliationComponent { }

// Variables/Fonctions : camelCase
const currentUser = getCurrentUser();
const calculateTotalAmount = () => {};

// Constantes : UPPER_SNAKE_CASE
const API_BASE_URL = 'https://api.e-compta-ia.com';
const MAX_RETRY_ATTEMPTS = 3;

// Interfaces : PascalCase avec préfixe I (optionnel)
interface User { }
interface IBankTransaction { }

// Enums : PascalCase
enum TransactionType {
  DEBIT = 'debit',
  CREDIT = 'credit'
}
```

#### **Structure des Fichiers**
```typescript
// 1. Imports externes
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

// 2. Imports internes (services, models)
import { UserService } from '../services/user.service';
import { User } from '../models/user.model';

// 3. Déclaration du composant/service
@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {
  // 4. Propriétés publiques d'abord
  users$: Observable<User[]>;
  loading = false;
  
  // 5. Propriétés privées
  private readonly maxUsers = 100;
  
  // 6. Constructor
  constructor(private userService: UserService) {}
  
  // 7. Lifecycle hooks
  ngOnInit(): void {
    this.loadUsers();
  }
  
  // 8. Méthodes publiques
  loadUsers(): void {
    this.loading = true;
    this.users$ = this.userService.getUsers();
  }
  
  // 9. Méthodes privées
  private handleError(error: any): void {
    console.error('Error:', error);
  }
}
```

### **🎨 Standards SCSS**

#### **Structure des Styles**
```scss
// 1. Variables locales
$primary-color: #1976d2;
$border-radius: 4px;

// 2. Mixins locaux
@mixin button-style($bg-color) {
  background-color: $bg-color;
  border-radius: $border-radius;
  padding: 8px 16px;
}

// 3. Styles du composant
.user-list {
  // 4. Propriétés du container principal
  display: flex;
  flex-direction: column;
  padding: 16px;
  
  // 5. Éléments enfants
  &__header {
    margin-bottom: 16px;
    
    .title {
      font-size: 24px;
      font-weight: 500;
    }
  }
  
  &__content {
    flex: 1;
    
    .user-item {
      @include button-style($primary-color);
      margin-bottom: 8px;
      
      &:hover {
        opacity: 0.8;
      }
      
      &--selected {
        background-color: lighten($primary-color, 20%);
      }
    }
  }
  
  // 6. Responsive design
  @media (max-width: 768px) {
    padding: 8px;
    
    &__header .title {
      font-size: 20px;
    }
  }
}
```

### **📱 Standards HTML**

#### **Structure des Templates**
```html
<!-- 1. Container principal avec classe BEM -->
<div class="user-list">
  
  <!-- 2. Header avec actions -->
  <div class="user-list__header">
    <h2 class="title">{{ 'users.title' | translate }}</h2>
    <button 
      mat-raised-button 
      color="primary"
      (click)="addUser()"
      [disabled]="loading">
      {{ 'users.add' | translate }}
    </button>
  </div>
  
  <!-- 3. Contenu principal -->
  <div class="user-list__content">
    
    <!-- 4. Loading state -->
    <div *ngIf="loading" class="loading-spinner">
      <mat-spinner diameter="40"></mat-spinner>
    </div>
    
    <!-- 5. Liste des utilisateurs -->
    <div *ngIf="!loading && users$ | async as users" class="user-grid">
      <div 
        *ngFor="let user of users; trackBy: trackByUserId"
        class="user-item"
        [class.user-item--selected]="selectedUser?.id === user.id"
        (click)="selectUser(user)">
        
        <div class="user-info">
          <span class="name">{{ user.name }}</span>
          <span class="email">{{ user.email }}</span>
        </div>
        
        <div class="user-actions">
          <button 
            mat-icon-button
            (click)="editUser(user); $event.stopPropagation()"
            [attr.aria-label]="'users.edit' | translate">
            <mat-icon>edit</mat-icon>
          </button>
        </div>
        
      </div>
    </div>
    
    <!-- 6. Empty state -->
    <div *ngIf="!loading && (users$ | async)?.length === 0" class="empty-state">
      <mat-icon>person_off</mat-icon>
      <p>{{ 'users.empty' | translate }}</p>
    </div>
    
  </div>
  
</div>
```

### **🔍 Standards de Documentation**

#### **Documentation JSDoc**
```typescript
/**
 * Service pour gérer les utilisateurs de l'application
 * 
 * Ce service fournit les méthodes CRUD pour les utilisateurs
 * et gère la synchronisation avec l'API backend.
 * 
 * @example
 * ```typescript
 * const userService = inject(UserService);
 * const users$ = userService.getUsers();
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class UserService {

  /**
   * Récupère la liste de tous les utilisateurs
   * 
   * @returns Observable<User[]> Stream des utilisateurs
   * @throws {HttpErrorResponse} Erreur si la requête échoue
   * 
   * @example
   * ```typescript
   * this.userService.getUsers().subscribe(users => {
   *   console.log('Utilisateurs:', users);
   * });
   * ```
   */
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`);
  }

  /**
   * Met à jour un utilisateur existant
   * 
   * @param userId - Identifiant unique de l'utilisateur
   * @param userData - Données partielles à mettre à jour
   * @returns Observable<User> Utilisateur mis à jour
   * 
   * @throws {ValidationError} Si les données sont invalides
   * @throws {NotFoundError} Si l'utilisateur n'existe pas
   */
  updateUser(userId: string, userData: Partial<User>): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/users/${userId}`, userData);
  }
}
```

---

## 🧪 **TESTS ET QUALITÉ**

### **🔬 Tests Unitaires**

#### **Structure des Tests**
```typescript
describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;
  
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserService]
    });
    
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });
  
  afterEach(() => {
    httpMock.verify();
  });
  
  describe('getUsers', () => {
    it('should return users list', () => {
      // Arrange
      const mockUsers: User[] = [
        { id: '1', name: 'John Doe', email: 'john@example.com' },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com' }
      ];
      
      // Act
      service.getUsers().subscribe(users => {
        // Assert
        expect(users).toEqual(mockUsers);
        expect(users.length).toBe(2);
      });
      
      // Assert HTTP
      const req = httpMock.expectOne(`${service.apiUrl}/users`);
      expect(req.request.method).toBe('GET');
      req.flush(mockUsers);
    });
    
    it('should handle error gracefully', () => {
      // Act & Assert
      service.getUsers().subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(500);
        }
      });
      
      const req = httpMock.expectOne(`${service.apiUrl}/users`);
      req.flush('Server Error', { status: 500, statusText: 'Server Error' });
    });
  });
});
```

### **🎭 Tests de Composants**
```typescript
describe('UserListComponent', () => {
  let component: UserListComponent;
  let fixture: ComponentFixture<UserListComponent>;
  let userService: jasmine.SpyObj<UserService>;
  
  beforeEach(async () => {
    const userServiceSpy = jasmine.createSpyObj('UserService', ['getUsers']);
    
    await TestBed.configureTestingModule({
      declarations: [UserListComponent],
      imports: [MatTableModule, MatButtonModule],
      providers: [
        { provide: UserService, useValue: userServiceSpy }
      ]
    }).compileComponents();
    
    fixture = TestBed.createComponent(UserListComponent);
    component = fixture.componentInstance;
    userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
  });
  
  it('should create', () => {
    expect(component).toBeTruthy();
  });
  
  it('should load users on init', () => {
    // Arrange
    const mockUsers = [/* ... */];
    userService.getUsers.and.returnValue(of(mockUsers));
    
    // Act
    component.ngOnInit();
    
    // Assert
    expect(userService.getUsers).toHaveBeenCalled();
    expect(component.users$).toBeDefined();
  });
  
  it('should display users in table', fakeAsync(() => {
    // Arrange
    const mockUsers = [/* ... */];
    userService.getUsers.and.returnValue(of(mockUsers));
    
    // Act
    component.ngOnInit();
    fixture.detectChanges();
    tick();
    
    // Assert
    const rows = fixture.debugElement.queryAll(By.css('mat-row'));
    expect(rows.length).toBe(mockUsers.length);
  }));
});
```

### **📊 Couverture de Tests**

```bash
# Lancer les tests avec couverture
ng test --code-coverage

# Voir le rapport de couverture
open coverage/index.html

# Objectifs de couverture:
# - Statements: > 80%
# - Branches: > 75%
# - Functions: > 80%
# - Lines: > 80%
```

### **🔍 Linting & Formatage**

```bash
# ESLint - Analyse du code
npm run lint

# Correction automatique des erreurs ESLint
npm run lint:fix

# Prettier - Formatage du code
npm run format

# Vérification du formatage
npm run format:check
```

---

## 📖 **DOCUMENTATION**

### **📝 Standards de Documentation**

#### **README des Modules**
Chaque module doit avoir un `README.md` :

```markdown
# Module Name

## Description
Brève description du module et de son rôle

## Fonctionnalités
- Feature 1
- Feature 2

## Utilisation
```typescript
// Code example
```

## Configuration
Instructions de configuration spécifique

## Tests
Comment lancer les tests de ce module

## API
Documentation des interfaces publiques
```

#### **Documentation des APIs**
```typescript
/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Récupère la liste des utilisateurs
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Liste des utilisateurs récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
```

### **🌍 Internationalisation**

#### **Ajout de Nouvelles Traductions**
```typescript
// 1. Ajouter dans src/assets/i18n/fr.json
{
  "users": {
    "title": "Gestion des Utilisateurs",
    "add": "Ajouter",
    "edit": "Modifier",
    "delete": "Supprimer"
  }
}

// 2. Ajouter dans src/assets/i18n/en.json
{
  "users": {
    "title": "User Management",
    "add": "Add",
    "edit": "Edit",
    "delete": "Delete"
  }
}

// 3. Utiliser dans les templates
{{ 'users.title' | translate }}

// 4. Utiliser dans les composants
constructor(private translate: TranslateService) {}

ngOnInit() {
  this.title = this.translate.instant('users.title');
}
```

---

## 🐛 **RAPPORTER DES BUGS**

### **📋 Template de Bug Report**

Utilisez le template suivant pour créer une issue :

```markdown
**🐛 Description du Bug**
Description claire et concise du problème

**🔄 Étapes pour Reproduire**
1. Aller à '...'
2. Cliquer sur '....'
3. Descendre jusqu'à '....'
4. Voir l'erreur

**✅ Comportement Attendu**
Description de ce qui devrait se passer

**❌ Comportement Actuel**
Description de ce qui se passe réellement

**📱 Screenshots**
Si applicable, ajoutez des captures d'écran

**🌍 Environnement:**
 - OS: [ex: Windows 10]
 - Navigateur: [ex: Chrome 95]
 - Version: [ex: 1.2.0]
 - Device: [ex: Desktop/Mobile]

**📋 Logs/Erreurs**
```
Coller ici les messages d'erreur de la console
```

**📝 Contexte Supplémentaire**
Toute information supplémentaire utile
```

### **🔍 Priorités des Bugs**

- **🔥 Critique** : Application inutilisable, perte de données
- **⚠️ Élevée** : Fonctionnalité majeure cassée
- **🟡 Moyenne** : Fonctionnalité mineure ou workaround possible
- **🟢 Faible** : Cosmétique, pas d'impact fonctionnel

---

## 💡 **PROPOSER DES FONCTIONNALITÉS**

### **📋 Template Feature Request**

```markdown
**🎯 Problème à Résoudre**
Description claire du problème ou du besoin

**💡 Solution Proposée**
Description détaillée de la solution envisagée

**🔄 Alternatives Considérées**
Autres solutions que vous avez envisagées

**👥 Impact Utilisateurs**
Qui sera affecté par cette fonctionnalité ?

**🎨 Mockups/Designs (optionnel)**
Captures d'écran, wireframes, ou prototypes

**📋 Spécifications Techniques**
- [ ] Modification du modèle de données
- [ ] Nouvelle API endpoint
- [ ] Changement d'interface
- [ ] Impact sur les performances
- [ ] Considérations de sécurité

**✅ Critères d'Acceptation**
- [ ] Critère 1
- [ ] Critère 2
- [ ] Critère 3

**📝 Notes Supplémentaires**
Toute information supplémentaire
```

### **🎯 Priorités des Fonctionnalités**

- **🚀 Haute** : Améliore significativement l'expérience utilisateur
- **📈 Moyenne** : Fonctionnalité utile mais non critique
- **🔧 Faible** : Nice-to-have ou amélioration mineure

---

## 👥 **COMMUNAUTÉ**

### **💬 Canaux de Communication**

- **💻 GitHub Discussions** : Questions techniques et discussions
- **📧 Email** : contribute@e-compta-ia.com
- **💬 Discord** : [Serveur E-COMPTA-IA](https://discord.gg/e-compta-ia)
- **🐦 Twitter** : [@EComptaIA](https://twitter.com/EComptaIA)

### **📅 Événements Communautaires**

- **🗓️ Webinaires mensuels** : Présentation des nouvelles fonctionnalités
- **👥 Meetups** : Rencontres locales (Ouagadougou, Abidjan, Dakar)
- **🎓 Hackathons** : Événements de développement collaboratif
- **📚 Formations** : Sessions de formation pour contributors

### **🏆 Reconnaissance des Contributeurs**

#### **Niveaux de Contribution**
- **🌟 First-time Contributor** : Première contribution acceptée
- **🎯 Regular Contributor** : 5+ contributions acceptées
- **🔧 Core Contributor** : 20+ contributions + review d'autres PRs
- **👑 Maintainer** : Accès en écriture au repository principal

#### **Récompenses**
- **📜 Certificats** de contribution open source
- **🎁 Goodies** E-COMPTA-IA (t-shirts, stickers)
- **🎤 Opportunités** de speaking dans les conférences
- **💼 Mentions** sur LinkedIn et réseaux professionnels

### **📋 Code de Conduite**

Nous suivons le [Contributor Covenant](https://www.contributor-covenant.org/) pour maintenir une communauté accueillante et respectueuse.

#### **Comportements Attendus**
- ✅ Respecter les autres contributeurs
- ✅ Être constructif dans les feedbacks
- ✅ Aider les nouveaux contributeurs
- ✅ Focus sur les aspects techniques

#### **Comportements Inacceptables**
- ❌ Langage offensant ou discriminatoire
- ❌ Harcèlement sous toute forme
- ❌ Trolling ou commentaires déplacés
- ❌ Publication d'informations privées

---

## 🎓 **RESSOURCES POUR DÉBUTER**

### **📚 Liens Utiles**

- **Angular Documentation** : https://angular.io/docs
- **TypeScript Handbook** : https://www.typescriptlang.org/docs/
- **Material Design** : https://material.angular.io/
- **RxJS Documentation** : https://rxjs.dev/
- **SYSCOHADA Guide** : https://ohada.org/

### **🎯 Issues pour Débutants**

Recherchez les labels suivants pour des contributions faciles :
- `good first issue` : Parfait pour débuter
- `help wanted` : Contributions recherchées
- `documentation` : Améliorations de la doc
- `beginner-friendly` : Accessible aux débutants

### **🤝 Mentorat**

Nous proposons un programme de mentorat pour les nouveaux contributeurs :
- **📧 Contact** : mentoring@e-compta-ia.com
- **🎯 1-on-1 sessions** avec des maintainers expérimentés
- **📚 Ressources** personnalisées selon votre niveau
- **🛤️ Roadmap** de progression personnalisée

---

## 📞 **CONTACT & SUPPORT**

### **Questions & Aide**
- **💬 GitHub Discussions** : Questions techniques
- **📧 Email** : contribute@e-compta-ia.com
- **💻 Discord** : Support en temps réel

### **Rapports de Problèmes**
- **🐛 Bug Reports** : GitHub Issues
- **🔒 Sécurité** : security@e-compta-ia.com
- **⚖️ Code de Conduite** : conduct@e-compta-ia.com

---

**🙏 Merci de contribuer à E-COMPTA-IA et d'aider à révolutionner la comptabilité en Afrique !**

**Ensemble, nous construisons l'avenir de la comptabilité intelligente ! 🚀**