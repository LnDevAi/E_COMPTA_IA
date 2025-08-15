// =====================================================
// SERVICE KNOWLEDGE BASE E-COMPTA-IA
// Gestion intelligente de la base de connaissances
// =====================================================

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of, forkJoin } from 'rxjs';
import { map, catchError, debounceTime, distinctUntilChanged } from 'rxjs/operators';

// =====================================================
// INTERFACES
// =====================================================

export interface DocumentKnowledge {
  id: string;
  titre: string;
  categorie: CategorieDocument;
  domaine: DomaineExpertise;
  pays: string[];
  
  // Métadonnées
  datePublication: Date;
  dateValidite?: Date;
  source: string;
  fiabilite: NiveauFiabilite;
  version: string;
  
  // Contenu
  contenu: string;
  motsCles: string[];
  resume: string;
  langues: string[];
  
  // Classification IA
  entitesExtracted: EntiteComptable[];
  conceptsLies: string[];
  scoreRelevance: number;
  
  // Utilisation
  nombreConsultations: number;
  dernierAcces: Date;
  feedback: FeedbackDocument[];
  
  // Techniques
  chemin: string;
  taille: number;
  hashContenu: string;
  formatOriginal: string;
}

export interface RequeteKnowledge {
  query: string;
  contexte: ContexteRecherche;
  filtres: FiltresRecherche;
  options: OptionsRecherche;
}

export interface ResultatRecherche {
  documents: DocumentKnowledge[];
  synthese: SyntheseReponse;
  suggestions: string[];
  tempsReponse: number;
  confidence: number;
}

export interface ContexteRecherche {
  entreprise?: {
    pays: string;
    secteur: string;
    regimeFiscal: string;
    tailleEntreprise: string;
  };
  utilisateur?: {
    niveauExpertise: string;
    roleComptable: string;
    languePreferee: string;
  };
  session?: {
    moduleCourant: string;
    operationEnCours: string;
    historiqueRequetes: string[];
  };
}

export interface FiltresRecherche {
  categories?: CategorieDocument[];
  domaines?: DomaineExpertise[];
  pays?: string[];
  datePublication?: {
    debut: Date;
    fin: Date;
  };
  fiabilite?: NiveauFiabilite[];
  langues?: string[];
}

export interface OptionsRecherche {
  nombreResultats: number;
  inclureSynthese: boolean;
  inclureSuggestions: boolean;
  typeRecherche: TypeRecherche;
  niveauDetail: NiveauDetail;
}

export interface SyntheseReponse {
  reponseComplete: string;
  pointsCles: string[];
  sourcesUtilisees: string[];
  niveauConfiance: number;
  recommandations: string[];
  avertissements?: string[];
}

export interface StatistiquesKB {
  nombreDocuments: number;
  nombreConsultations: number;
  categoriesPopulaires: { categorie: string; count: number }[];
  domainesPopulaires: { domaine: string; count: number }[];
  requetesFrequentes: { query: string; count: number }[];
  satisfactionMoyenne: number;
  tempsReponseMoyen: number;
}

// =====================================================
// ENUMERATIONS
// =====================================================

export enum CategorieDocument {
  REGLEMENTAIRE = 'reglementaire',
  TECHNIQUE = 'technique',
  PRATIQUE = 'pratique',
  FORMATION = 'formation',
  REFERENCE = 'reference'
}

export enum DomaineExpertise {
  COMPTABILITE = 'comptabilite',
  FISCAL = 'fiscal',
  SOCIAL = 'social',
  JURIDIQUE = 'juridique',
  AUDIT = 'audit'
}

export enum NiveauFiabilite {
  OFFICIELLE = 'officielle',
  VALIDEE = 'validee',
  COMMUNAUTAIRE = 'communautaire',
  BROUILLON = 'brouillon'
}

export enum TypeRecherche {
  EXACTE = 'exacte',
  SEMANTIQUE = 'semantique',
  HYBRIDE = 'hybride',
  CONTEXTUALISEE = 'contextualisee'
}

export enum NiveauDetail {
  MINIMAL = 'minimal',
  STANDARD = 'standard',
  COMPLET = 'complet',
  EXPERT = 'expert'
}

// =====================================================
// SERVICE PRINCIPAL
// =====================================================

@Injectable({
  providedIn: 'root'
})
export class KnowledgeBaseService {
  
  private readonly API_BASE = '/api/knowledge-base';
  
  // État de la knowledge base
  private documentsSubject = new BehaviorSubject<DocumentKnowledge[]>([]);
  private statsSubject = new BehaviorSubject<StatistiquesKB | null>(null);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  
  // Observables publics
  public documents$ = this.documentsSubject.asObservable();
  public stats$ = this.statsSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();
  
  // Cache pour optimiser les performances
  private cacheRecherche = new Map<string, ResultatRecherche>();
  private cacheDocuments = new Map<string, DocumentKnowledge>();
  
  constructor(private http: HttpClient) {
    this.initialiserKnowledgeBase();
  }
  
  // =====================================================
  // RECHERCHE ET CONSULTATION
  // =====================================================
  
  /**
   * Recherche intelligente dans la knowledge base
   */
  rechercherDocuments(requete: RequeteKnowledge): Observable<ResultatRecherche> {
    const cacheKey = this.genererCleCache(requete);
    
    // Vérifier le cache
    if (this.cacheRecherche.has(cacheKey)) {
      return of(this.cacheRecherche.get(cacheKey)!);
    }
    
    this.loadingSubject.next(true);
    
    return this.http.post<ResultatRecherche>(`${this.API_BASE}/search`, requete)
      .pipe(
        map(resultat => {
          // Enrichir les résultats
          resultat.documents = resultat.documents.map(doc => this.enrichirDocument(doc));
          
          // Mettre en cache
          this.cacheRecherche.set(cacheKey, resultat);
          
          return resultat;
        }),
        catchError(error => {
          console.error('Erreur recherche knowledge base:', error);
          return of({
            documents: [],
            synthese: {
              reponseComplete: 'Désolé, une erreur est survenue lors de la recherche.',
              pointsCles: [],
              sourcesUtilisees: [],
              niveauConfiance: 0,
              recommandations: []
            },
            suggestions: [],
            tempsReponse: 0,
            confidence: 0
          });
        }),
        map(resultat => {
          this.loadingSubject.next(false);
          return resultat;
        })
      );
  }
  
  /**
   * Consultation d'un document spécifique
   */
  consulterDocument(documentId: string): Observable<DocumentKnowledge> {
    // Vérifier le cache
    if (this.cacheDocuments.has(documentId)) {
      return of(this.cacheDocuments.get(documentId)!);
    }
    
    return this.http.get<DocumentKnowledge>(`${this.API_BASE}/documents/${documentId}`)
      .pipe(
        map(document => {
          const documentEnrichi = this.enrichirDocument(document);
          this.cacheDocuments.set(documentId, documentEnrichi);
          
          // Enregistrer la consultation
          this.enregistrerConsultation(documentId);
          
          return documentEnrichi;
        }),
        catchError(error => {
          console.error('Erreur consultation document:', error);
          throw error;
        })
      );
  }
  
  /**
   * Suggestions basées sur le contexte
   */
  obtenirSuggestions(contexte: ContexteRecherche): Observable<string[]> {
    return this.http.post<string[]>(`${this.API_BASE}/suggestions`, { contexte })
      .pipe(
        catchError(error => {
          console.error('Erreur suggestions:', error);
          return of([]);
        })
      );
  }
  
  // =====================================================
  // GESTION DES DOCUMENTS
  // =====================================================
  
  /**
   * Ajouter un nouveau document
   */
  ajouterDocument(document: Partial<DocumentKnowledge>, fichier: File): Observable<DocumentKnowledge> {
    const formData = new FormData();
    formData.append('fichier', fichier);
    formData.append('metadata', JSON.stringify(document));
    
    return this.http.post<DocumentKnowledge>(`${this.API_BASE}/documents`, formData)
      .pipe(
        map(documentCree => {
          // Mettre à jour le cache
          this.cacheDocuments.set(documentCree.id, documentCree);
          
          // Mettre à jour la liste
          const documents = this.documentsSubject.value;
          this.documentsSubject.next([...documents, documentCree]);
          
          return documentCree;
        }),
        catchError(error => {
          console.error('Erreur ajout document:', error);
          throw error;
        })
      );
  }
  
  /**
   * Mettre à jour un document existant
   */
  mettreAJourDocument(documentId: string, modifications: Partial<DocumentKnowledge>): Observable<DocumentKnowledge> {
    return this.http.put<DocumentKnowledge>(`${this.API_BASE}/documents/${documentId}`, modifications)
      .pipe(
        map(documentMisAJour => {
          // Mettre à jour le cache
          this.cacheDocuments.set(documentId, documentMisAJour);
          
          // Mettre à jour la liste
          const documents = this.documentsSubject.value;
          const index = documents.findIndex(d => d.id === documentId);
          if (index !== -1) {
            documents[index] = documentMisAJour;
            this.documentsSubject.next([...documents]);
          }
          
          return documentMisAJour;
        }),
        catchError(error => {
          console.error('Erreur mise à jour document:', error);
          throw error;
        })
      );
  }
  
  /**
   * Supprimer un document
   */
  supprimerDocument(documentId: string): Observable<boolean> {
    return this.http.delete<boolean>(`${this.API_BASE}/documents/${documentId}`)
      .pipe(
        map(succes => {
          if (succes) {
            // Supprimer du cache
            this.cacheDocuments.delete(documentId);
            
            // Mettre à jour la liste
            const documents = this.documentsSubject.value;
            const documentsFiltres = documents.filter(d => d.id !== documentId);
            this.documentsSubject.next(documentsFiltres);
          }
          return succes;
        }),
        catchError(error => {
          console.error('Erreur suppression document:', error);
          throw error;
        })
      );
  }
  
  // =====================================================
  // ANALYTICS ET STATISTIQUES
  // =====================================================
  
  /**
   * Obtenir les statistiques de la knowledge base
   */
  obtenirStatistiques(): Observable<StatistiquesKB> {
    return this.http.get<StatistiquesKB>(`${this.API_BASE}/stats`)
      .pipe(
        map(stats => {
          this.statsSubject.next(stats);
          return stats;
        }),
        catchError(error => {
          console.error('Erreur statistiques:', error);
          return of({
            nombreDocuments: 0,
            nombreConsultations: 0,
            categoriesPopulaires: [],
            domainesPopulaires: [],
            requetesFrequentes: [],
            satisfactionMoyenne: 0,
            tempsReponseMoyen: 0
          });
        })
      );
  }
  
  /**
   * Enregistrer un feedback sur un document
   */
  enregistrerFeedback(documentId: string, feedback: {
    note: number;
    commentaire?: string;
    utile: boolean;
  }): Observable<boolean> {
    return this.http.post<boolean>(`${this.API_BASE}/documents/${documentId}/feedback`, feedback)
      .pipe(
        catchError(error => {
          console.error('Erreur feedback:', error);
          return of(false);
        })
      );
  }
  
  // =====================================================
  // UTILITAIRES ET OPTIMISATIONS
  // =====================================================
  
  /**
   * Initialiser la knowledge base
   */
  private initialiserKnowledgeBase(): void {
    // Charger les documents populaires
    this.chargerDocumentsPopulaires();
    
    // Charger les statistiques
    this.obtenirStatistiques().subscribe();
    
    // Programmer le nettoyage du cache
    setInterval(() => this.nettoyerCache(), 30 * 60 * 1000); // Toutes les 30 minutes
  }
  
  /**
   * Charger les documents les plus consultés
   */
  private chargerDocumentsPopulaires(): void {
    this.http.get<DocumentKnowledge[]>(`${this.API_BASE}/documents/populaires`)
      .pipe(
        catchError(error => {
          console.error('Erreur chargement documents populaires:', error);
          return of([]);
        })
      )
      .subscribe(documents => {
        this.documentsSubject.next(documents);
        
        // Pré-charger en cache
        documents.forEach(doc => {
          this.cacheDocuments.set(doc.id, doc);
        });
      });
  }
  
  /**
   * Enrichir un document avec des métadonnées calculées
   */
  private enrichirDocument(document: DocumentKnowledge): DocumentKnowledge {
    return {
      ...document,
      // Ajouter des informations calculées
      scoreRelevance: this.calculerScoreRelevance(document),
      conceptsLies: this.extraireConcepts(document.contenu),
      nombreConsultations: document.nombreConsultations || 0,
      dernierAcces: document.dernierAcces || new Date()
    };
  }
  
  /**
   * Calculer le score de pertinence d'un document
   */
  private calculerScoreRelevance(document: DocumentKnowledge): number {
    let score = 0;
    
    // Facteurs de score
    score += document.fiabilite === NiveauFiabilite.OFFICIELLE ? 50 : 0;
    score += document.nombreConsultations * 0.1;
    score += document.feedback?.length * 2 || 0;
    
    // Actualité du document
    const ageEnJours = (Date.now() - document.datePublication.getTime()) / (1000 * 60 * 60 * 24);
    score += Math.max(0, 100 - ageEnJours / 365 * 10); // Décrément selon l'âge
    
    return Math.min(100, Math.max(0, score));
  }
  
  /**
   * Extraire les concepts comptables du contenu
   */
  private extraireConcepts(contenu: string): string[] {
    const conceptsComptables = [
      'débit', 'crédit', 'bilan', 'compte de résultat', 'TVA', 'amortissement',
      'provision', 'immobilisation', 'charge', 'produit', 'actif', 'passif',
      'capitaux propres', 'trésorerie', 'fournisseur', 'client', 'stock'
    ];
    
    return conceptsComptables.filter(concept => 
      contenu.toLowerCase().includes(concept.toLowerCase())
    );
  }
  
  /**
   * Générer une clé de cache pour une requête
   */
  private genererCleCache(requete: RequeteKnowledge): string {
    return btoa(JSON.stringify({
      query: requete.query,
      filtres: requete.filtres,
      options: requete.options
    }));
  }
  
  /**
   * Enregistrer une consultation de document
   */
  private enregistrerConsultation(documentId: string): void {
    this.http.post(`${this.API_BASE}/documents/${documentId}/consultation`, {
      timestamp: new Date(),
      utilisateur: 'current-user' // À remplacer par l'ID utilisateur réel
    }).pipe(
      catchError(error => {
        console.error('Erreur enregistrement consultation:', error);
        return of(null);
      })
    ).subscribe();
  }
  
  /**
   * Nettoyer le cache périodiquement
   */
  private nettoyerCache(): void {
    // Limiter la taille du cache
    if (this.cacheRecherche.size > 100) {
      const cles = Array.from(this.cacheRecherche.keys());
      const clesASupprimer = cles.slice(0, 50);
      clesASupprimer.forEach(cle => this.cacheRecherche.delete(cle));
    }
    
    if (this.cacheDocuments.size > 200) {
      const cles = Array.from(this.cacheDocuments.keys());
      const clesASupprimer = cles.slice(0, 100);
      clesASupprimer.forEach(cle => this.cacheDocuments.delete(cle));
    }
  }
  
  // =====================================================
  // API PUBLIQUES POUR COMPOSANTS
  // =====================================================
  
  /**
   * Recherche simple avec debounce
   */
  rechercheSimple(query: string): Observable<DocumentKnowledge[]> {
    if (!query || query.length < 3) {
      return of([]);
    }
    
    const requete: RequeteKnowledge = {
      query,
      contexte: {},
      filtres: {},
      options: {
        nombreResultats: 10,
        inclureSynthese: false,
        inclureSuggestions: false,
        typeRecherche: TypeRecherche.HYBRIDE,
        niveauDetail: NiveauDetail.STANDARD
      }
    };
    
    return this.rechercherDocuments(requete).pipe(
      map(resultat => resultat.documents)
    );
  }
  
  /**
   * Obtenir les documents par catégorie
   */
  obtenirDocumentsParCategorie(categorie: CategorieDocument): Observable<DocumentKnowledge[]> {
    return this.http.get<DocumentKnowledge[]>(`${this.API_BASE}/documents/categorie/${categorie}`)
      .pipe(
        catchError(error => {
          console.error('Erreur documents par catégorie:', error);
          return of([]);
        })
      );
  }
  
  /**
   * Obtenir les documents récents
   */
  obtenirDocumentsRecents(limite: number = 10): Observable<DocumentKnowledge[]> {
    return this.http.get<DocumentKnowledge[]>(`${this.API_BASE}/documents/recents?limite=${limite}`)
      .pipe(
        catchError(error => {
          console.error('Erreur documents récents:', error);
          return of([]);
        })
      );
  }
}

// =====================================================
// INTERFACES SUPPLÉMENTAIRES
// =====================================================

export interface EntiteComptable {
  type: string;
  valeur: string;
  position: number;
  confidence: number;
}

export interface FeedbackDocument {
  utilisateur: string;
  note: number;
  commentaire?: string;
  date: Date;
  utile: boolean;
}

export interface ParametrePreRemplissage {
  nom: string;
  valeur: any;
  description: string;
}

export default KnowledgeBaseService;