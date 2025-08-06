import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError, combineLatest } from 'rxjs';
import { delay, map, catchError, switchMap, filter, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

import {
  CoursComptabilite,
  ProgressionEtudiant,
  Certificat,
  Quiz,
  ExercicePratique,
  Evaluation,
  NiveauAccesElearning,
  StatutProgression,
  MentionCertificat,
  Badge,
  RecommandationIA,
  AnalyticsApprentissage,
  obtenirCoursParNiveauAbonnement,
  calculerPourcentageProgression,
  genererNumeroCertificat,
  determinerMention
} from '../models/elearning.model';

import { CATALOGUE_COURS_ELEARNING, PARCOURS_APPRENTISSAGE } from '../data/cours-syscohada.data';
import { SubscriptionService } from '../../subscription/services/subscription.service';

@Injectable({
  providedIn: 'root'
})
export class ELearningService {
  
  private progressionsSubject = new BehaviorSubject<ProgressionEtudiant[]>([]);
  public progressions$ = this.progressionsSubject.asObservable();

  private certificatsSubject = new BehaviorSubject<Certificat[]>([]);
  public certificats$ = this.certificatsSubject.asObservable();

  private badgesSubject = new BehaviorSubject<Badge[]>([]);
  public badges$ = this.badgesSubject.asObservable();

  private etudiantActuelId = 'current_user_id'; // À récupérer du contexte utilisateur
  private readonly API_BASE_URL = 'https://api.e-compta-ia.com/elearning';

  constructor(
    private http: HttpClient,
    private subscriptionService: SubscriptionService
  ) {
    this.initialiserDonneesSimulees();
  }

  // =====================================================
  // GESTION DES COURS
  // =====================================================

  /**
   * Récupère tous les cours disponibles selon le niveau d'abonnement
   */
  getCoursDisponibles(): Observable<CoursComptabilite[]> {
    return this.subscriptionService.getAbonnementActuel().pipe(
      map(abonnement => {
        const niveauAcces = abonnement?.plan?.id ? 
          this.mapPlanToNiveauAcces(abonnement.plan.id) : 
          NiveauAccesElearning.GRATUIT;
        
        return obtenirCoursParNiveauAbonnement(niveauAcces);
      }),
      delay(300)
    );
  }

  /**
   * Récupère un cours par son ID
   */
  getCoursParId(coursId: string): Observable<CoursComptabilite | null> {
    const cours = CATALOGUE_COURS_ELEARNING.find(c => c.id === coursId);
    return of(cours || null).pipe(delay(200));
  }

  /**
   * Récupère les cours par catégorie
   */
  getCoursParCategorie(categorie: string): Observable<CoursComptabilite[]> {
    return this.getCoursDisponibles().pipe(
      map(cours => cours.filter(c => c.categorie === categorie))
    );
  }

  /**
   * Recherche de cours
   */
  rechercherCours(terme: string): Observable<CoursComptabilite[]> {
    return this.getCoursDisponibles().pipe(
      map(cours => cours.filter(c => 
        c.titre.toLowerCase().includes(terme.toLowerCase()) ||
        c.description.toLowerCase().includes(terme.toLowerCase()) ||
        c.motsCles.some(mot => mot.toLowerCase().includes(terme.toLowerCase()))
      ))
    );
  }

  /**
   * Récupère les parcours d'apprentissage recommandés
   */
  getParcoursApprentissage(): Observable<any> {
    return of(PARCOURS_APPRENTISSAGE).pipe(delay(200));
  }

  // =====================================================
  // GESTION DES INSCRIPTIONS
  // =====================================================

  /**
   * Inscrit l'étudiant à un cours
   */
  inscrireAuCours(coursId: string): Observable<ProgressionEtudiant> {
    return this.getCoursParId(coursId).pipe(
      switchMap(cours => {
        if (!cours) {
          return throwError(() => new Error('Cours non trouvé'));
        }

        // Vérifier si déjà inscrit
        const progressions = this.progressionsSubject.value;
        const progressionExistante = progressions.find(p => 
          p.coursId === coursId && p.etudiantId === this.etudiantActuelId
        );

        if (progressionExistante) {
          return throwError(() => new Error('Déjà inscrit à ce cours'));
        }

        // Créer nouvelle progression
        const nouvelleProgression: ProgressionEtudiant = {
          id: this.genererIdProgression(),
          etudiantId: this.etudiantActuelId,
          coursId: coursId,
          pourcentageCompletion: 0,
          statut: StatutProgression.NON_COMMENCE,
          dateInscription: new Date(),
          dateDerniereActivite: new Date(),
          modulesCompletes: [],
          leconsVues: [],
          exercicesRealises: [],
          noteActuelle: 0,
          moyenneQuiz: 0,
          moyenneExercices: 0,
          tempsTotal: 0,
          nombreConnexions: 1,
          streakJours: 1,
          difficultesIdentifiees: [],
          recommandationsIA: [],
          rythmeApprentissage: 'flexible',
          badgesObtenus: [],
          pointsExperience: 0,
          niveau: 1
        };

        // Ajouter aux progressions
        const progressionsUpdate = [...progressions, nouvelleProgression];
        this.progressionsSubject.next(progressionsUpdate);

        console.log('✅ Inscription réussie au cours:', cours.titre);
        return of(nouvelleProgression);
      }),
      delay(500)
    );
  }

  /**
   * Désinscrire du cours
   */
  desinscrireDuCours(coursId: string): Observable<boolean> {
    const progressions = this.progressionsSubject.value;
    const progressionsUpdate = progressions.filter(p => 
      !(p.coursId === coursId && p.etudiantId === this.etudiantActuelId)
    );
    
    this.progressionsSubject.next(progressionsUpdate);
    return of(true).pipe(delay(300));
  }

  // =====================================================
  // GESTION DE LA PROGRESSION
  // =====================================================

  /**
   * Récupère la progression de l'étudiant pour un cours
   */
  getProgressionCours(coursId: string): Observable<ProgressionEtudiant | null> {
    const progressions = this.progressionsSubject.value;
    const progression = progressions.find(p => 
      p.coursId === coursId && p.etudiantId === this.etudiantActuelId
    );
    return of(progression || null);
  }

  /**
   * Récupère toutes les progressions de l'étudiant
   */
  getToutesProgressions(): Observable<ProgressionEtudiant[]> {
    const progressions = this.progressionsSubject.value;
    return of(progressions.filter(p => p.etudiantId === this.etudiantActuelId));
  }

  /**
   * Marque une leçon comme vue
   */
  marquerLeconVue(
    coursId: string, 
    leconId: string, 
    tempsConsomme: number
  ): Observable<boolean> {
    return this.mettreAJourProgression(coursId, progression => {
      // Mettre à jour ou ajouter la leçon vue
      const leconIndex = progression.leconsVues.findIndex(l => l.leconId === leconId);
      if (leconIndex >= 0) {
        progression.leconsVues[leconIndex].tempsConsomme += tempsConsomme;
        progression.leconsVues[leconIndex].complete = true;
      } else {
        progression.leconsVues.push({
          leconId: leconId,
          complete: true,
          tempsConsomme: tempsConsomme
        });
      }

      // Mettre à jour temps total et activité
      progression.tempsTotal += tempsConsomme;
      progression.dateDerniereActivite = new Date();
      progression.statut = StatutProgression.EN_COURS;

      // Recalculer pourcentage
      progression.pourcentageCompletion = calculerPourcentageProgression(progression);

      return progression;
    });
  }

  /**
   * Enregistre le résultat d'un exercice
   */
  enregistrerResultatExercice(
    coursId: string,
    exerciceId: string,
    noteObtenue: number,
    reussi: boolean
  ): Observable<boolean> {
    return this.mettreAJourProgression(coursId, progression => {
      // Ajouter ou mettre à jour l'exercice
      const exerciceIndex = progression.exercicesRealises.findIndex(e => e.exerciceId === exerciceId);
      if (exerciceIndex >= 0) {
        progression.exercicesRealises[exerciceIndex].noteObtenue = noteObtenue;
        progression.exercicesRealises[exerciceIndex].reussi = reussi;
        progression.exercicesRealises[exerciceIndex].nombreTentatives++;
      } else {
        progression.exercicesRealises.push({
          exerciceId: exerciceId,
          reussi: reussi,
          noteObtenue: noteObtenue,
          nombreTentatives: 1
        });
      }

      // Recalculer moyennes
      const exercicesReussis = progression.exercicesRealises.filter(e => e.reussi);
      progression.moyenneExercices = exercicesReussis.length > 0 ?
        exercicesReussis.reduce((sum, e) => sum + e.noteObtenue, 0) / exercicesReussis.length : 0;

      // Mettre à jour note actuelle (moyenne pondérée)
      progression.noteActuelle = (progression.moyenneQuiz + progression.moyenneExercices) / 2;

      // Attribution points d'expérience
      if (reussi) {
        progression.pointsExperience += Math.floor(noteObtenue / 10) * 10;
        this.verifierNouveauxBadges(progression);
      }

      progression.dateDerniereActivite = new Date();
      return progression;
    });
  }

  /**
   * Enregistre le résultat d'un quiz
   */
  enregistrerResultatQuiz(
    coursId: string,
    quizId: string,
    noteObtenue: number,
    tempsEcoule: number
  ): Observable<boolean> {
    return this.mettreAJourProgression(coursId, progression => {
      // Simuler l'ajout du quiz aux résultats
      // Dans un vrai système, on aurait une structure pour les quiz
      
      // Mettre à jour moyenne quiz (simplifiée)
      progression.moyenneQuiz = (progression.moyenneQuiz + noteObtenue) / 2;
      progression.noteActuelle = (progression.moyenneQuiz + progression.moyenneExercices) / 2;
      progression.tempsTotal += tempsEcoule;
      progression.dateDerniereActivite = new Date();

      // Attribution points d'expérience
      progression.pointsExperience += Math.floor(noteObtenue / 5) * 5;
      this.verifierNouveauxBadges(progression);

      return progression;
    });
  }

  /**
   * Complète un module
   */
  completerModule(coursId: string, moduleId: string): Observable<boolean> {
    return this.mettreAJourProgression(coursId, progression => {
      if (!progression.modulesCompletes.includes(moduleId)) {
        progression.modulesCompletes.push(moduleId);
        
        // Bonus XP pour complétion module
        progression.pointsExperience += 100;
        this.verifierNouveauxBadges(progression);
        
        // Vérifier si cours complet
        this.verifierCompletionCours(progression);
      }
      return progression;
    });
  }

  // =====================================================
  // GESTION DES ÉVALUATIONS
  // =====================================================

  /**
   * Démarrer une évaluation
   */
  demarrerEvaluation(evaluationId: string): Observable<any> {
    console.log('🎯 Démarrage évaluation:', evaluationId);
    
    // Simulation du démarrage d'évaluation
    return of({
      sessionId: `session_${Date.now()}`,
      dateDebut: new Date(),
      dureeMaximale: 120, // minutes
      surveillanceActive: true,
      questions: [], // Chargées dynamiquement
      tentativeNumero: 1
    }).pipe(delay(1000));
  }

  /**
   * Soumettre une évaluation
   */
  soumettreEvaluation(
    evaluationId: string,
    sessionId: string,
    reponses: any[]
  ): Observable<any> {
    console.log('📤 Soumission évaluation:', { evaluationId, sessionId, reponses: reponses.length });
    
    return of(null).pipe(
      delay(2000), // Simulation traitement
      map(() => {
        // Simulation calcul note
        const noteObtenue = Math.floor(Math.random() * 40 + 60); // 60-100
        const noteMaximale = 100;
        const pourcentageReussite = (noteObtenue / noteMaximale) * 100;
        const mention = determinerMention(pourcentageReussite);
        const reussi = pourcentageReussite >= 60;

        return {
          evaluationId,
          sessionId,
          noteObtenue,
          noteMaximale,
          pourcentageReussite,
          mention,
          reussi,
          datePassage: new Date(),
          tempsEcoule: Math.floor(Math.random() * 90 + 30), // 30-120 min
          details: {
            sectionsReussies: Math.floor(Math.random() * 3 + 1),
            questionsCorrectes: Math.floor((noteObtenue / 100) * 50),
            questionsTotal: 50
          }
        };
      })
    );
  }

  // =====================================================
  // GESTION DES CERTIFICATS
  // =====================================================

  /**
   * Générer un certificat
   */
  genererCertificat(
    coursId: string,
    noteFinale: number,
    dureeFormation: number
  ): Observable<Certificat> {
    return this.getCoursParId(coursId).pipe(
      switchMap(cours => {
        if (!cours) {
          return throwError(() => new Error('Cours non trouvé'));
        }

        const pourcentageReussite = noteFinale;
        const mention = determinerMention(pourcentageReussite);
        
        const certificat: Certificat = {
          id: this.genererIdCertificat(),
          numeroUnique: genererNumeroCertificat(),
          etudiantId: this.etudiantActuelId,
          nomEtudiant: 'Étudiant Test', // À récupérer du profil
          emailEtudiant: 'etudiant@example.com',
          coursId: coursId,
          titreCours: cours.titre,
          niveauCours: cours.niveau,
          dureeFormation: dureeFormation,
          noteObtenue: noteFinale,
          noteMaximale: 100,
          pourcentageReussite: pourcentageReussite,
          mention: mention,
          competencesValidees: this.extraireCompetences(cours),
          objectifsAtteints: cours.objectifs.map(obj => obj.description),
          dateObtention: new Date(),
          dateExpiration: cours.certification.validite ? 
            new Date(Date.now() + cours.certification.validite * 30 * 24 * 60 * 60 * 1000) : undefined,
          version: '1.0',
          hashVerification: this.genererHashCertificat(),
          signatureNumerique: this.genererSignature(),
          templateUtilise: 'certificat-syscohada-standard',
          urlPublique: `/certificats/public/${this.genererIdCertificat()}`,
          urlVerification: `/certificats/verify/${this.genererIdCertificat()}`,
          formatsPEisponibles: ['PDF', 'PNG', 'JSON']
        };

        // Ajouter aux certificats
        const certificats = this.certificatsSubject.value;
        this.certificatsSubject.next([...certificats, certificat]);

        console.log('🏆 Certificat généré:', certificat.numeroUnique);
        return of(certificat);
      }),
      delay(1500)
    );
  }

  /**
   * Récupère tous les certificats de l'étudiant
   */
  getCertificatsEtudiant(): Observable<Certificat[]> {
    const certificats = this.certificatsSubject.value;
    return of(certificats.filter(c => c.etudiantId === this.etudiantActuelId));
  }

  /**
   * Vérifier un certificat
   */
  verifierCertificat(numeroUnique: string): Observable<any> {
    const certificats = this.certificatsSubject.value;
    const certificat = certificats.find(c => c.numeroUnique === numeroUnique);
    
    if (!certificat) {
      return throwError(() => new Error('Certificat non trouvé'));
    }

    return of({
      valide: true,
      certificat: certificat,
      verification: {
        hashVerifie: true,
        signatureValide: true,
        dateVerification: new Date(),
        autorite: 'E-COMPTA-IA Certification Authority'
      }
    }).pipe(delay(800));
  }

  // =====================================================
  // ANALYTICS ET RECOMMANDATIONS IA
  // =====================================================

  /**
   * Génère des recommandations IA personnalisées
   */
  genererRecommandationsIA(coursId: string): Observable<RecommandationIA[]> {
    return this.getProgressionCours(coursId).pipe(
      map(progression => {
        if (!progression) return [];

        const recommandations: RecommandationIA[] = [];

        // Analyser les performances
        if (progression.moyenneExercices < 60) {
          recommandations.push({
            type: 'exercice_supplementaire',
            priorite: 'haute',
            titre: 'Renforcement nécessaire',
            description: 'Vos résultats aux exercices indiquent des difficultés. Je recommande de refaire les exercices du module précédent.',
            actions: [
              {
                type: 'exercice',
                description: 'Reprendre les exercices fondamentaux',
                url: `/cours/${coursId}/exercices-revision`
              }
            ],
            dateGeneration: new Date(),
            confidence: 0.85
          });
        }

        // Analyser le rythme
        if (progression.tempsTotal < 60) { // Moins d'1h
          recommandations.push({
            type: 'cours_complement',
            priorite: 'moyenne',
            titre: 'Approfondissement suggéré',
            description: 'Vous progressez rapidement ! Considérez des ressources complémentaires pour approfondir.',
            actions: [
              {
                type: 'ressources',
                description: 'Consulter la bibliographie',
                url: `/cours/${coursId}/ressources`
              }
            ],
            dateGeneration: new Date(),
            confidence: 0.72
          });
        }

        // Analyser l'inactivité
        const joursInactivite = Math.floor(
          (new Date().getTime() - progression.dateDerniereActivite.getTime()) / 
          (1000 * 60 * 60 * 24)
        );

        if (joursInactivite > 7) {
          recommandations.push({
            type: 'revision',
            priorite: 'haute',
            titre: 'Révision recommandée',
            description: `Vous n'avez pas étudié depuis ${joursInactivite} jours. Une révision vous aiderait à maintenir vos acquis.`,
            actions: [
              {
                type: 'revision',
                description: 'Quiz de révision rapide',
                url: `/cours/${coursId}/quiz-revision`
              }
            ],
            dateGeneration: new Date(),
            confidence: 0.90
          });
        }

        return recommandations;
      }),
      delay(500)
    );
  }

  /**
   * Récupère les analytics d'apprentissage
   */
  getAnalyticsApprentissage(): Observable<AnalyticsApprentissage> {
    const progressions = this.progressionsSubject.value;
    
    return of({
      id: 'analytics-global',
      periode: {
        debut: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        fin: new Date()
      },
      nombreEtudiants: 1,
      nouveauxEtudiants: 1,
      etudiantsActifs: 1,
      tauxCompletion: progressions.length > 0 ? 
        progressions.reduce((sum, p) => sum + p.pourcentageCompletion, 0) / progressions.length : 0,
      coursPopulaires: [],
      coursProblematiques: [],
      noteMoyenne: progressions.length > 0 ?
        progressions.reduce((sum, p) => sum + p.noteActuelle, 0) / progressions.length : 0,
      tauxReussiteGlobal: 85.2,
      tempsMoyenParSession: 45,
      frequenceConnexion: {
        quotidienne: 2,
        hebdomadaire: 5,
        mensuelle: 1
      },
      tauxAbandon: {
        global: 15.3,
        premiereSemaine: 8.2,
        premierMois: 7.1
      },
      questionsEchouees: [],
      exercicesProblematiques: [],
      feedbackEtudiants: [],
      certificatsDelivres: this.certificatsSubject.value.length,
      competencesValidees: [],
      progressionMoyenne: 67.8,
      predictionsReussite: [],
      recommandationsAmelioration: [
        'Ajouter plus d\'exercices interactifs',
        'Améliorer les explications des concepts complexes',
        'Intégrer plus de cas pratiques SYSCOHADA'
      ]
    }).pipe(delay(800));
  }

  // =====================================================
  // GESTION DES BADGES
  // =====================================================

  /**
   * Récupère tous les badges de l'étudiant
   */
  getBadgesEtudiant(): Observable<Badge[]> {
    const badges = this.badgesSubject.value;
    return of(badges.filter(b => b.dateObtention !== null));
  }

  /**
   * Vérifie et attribue de nouveaux badges
   */
  private verifierNouveauxBadges(progression: ProgressionEtudiant): void {
    const badges = this.badgesSubject.value;
    const nouveauxBadges: Badge[] = [];

    // Badge première connexion
    if (progression.nombreConnexions === 1 && 
        !badges.some(b => b.id === 'badge-premier-pas')) {
      nouveauxBadges.push({
        id: 'badge-premier-pas',
        nom: 'Premier Pas',
        description: 'Vous avez commencé votre parcours d\'apprentissage !',
        icone: '🚀',
        couleur: '#10B981',
        critereObtention: 'Première connexion à un cours',
        rarete: 'commun',
        dateObtention: new Date(),
        pointsExperience: 10
      });
    }

    // Badge persévérance
    if (progression.streakJours >= 7 && 
        !badges.some(b => b.id === 'badge-perseverance')) {
      nouveauxBadges.push({
        id: 'badge-perseverance',
        nom: 'Persévérance',
        description: '7 jours consécutifs d\'apprentissage !',
        icone: '🔥',
        couleur: '#F59E0B',
        critereObtention: '7 jours consécutifs',
        rarete: 'rare',
        dateObtention: new Date(),
        pointsExperience: 50
      });
    }

    // Badge expert
    if (progression.pointsExperience >= 1000 && 
        !badges.some(b => b.id === 'badge-expert')) {
      nouveauxBadges.push({
        id: 'badge-expert',
        nom: 'Expert SYSCOHADA',
        description: 'Maîtrise exceptionnelle du SYSCOHADA !',
        icone: '👑',
        couleur: '#8B5CF6',
        critereObtention: '1000 points d\'expérience',
        rarete: 'legendaire',
        dateObtention: new Date(),
        pointsExperience: 200
      });
    }

    if (nouveauxBadges.length > 0) {
      this.badgesSubject.next([...badges, ...nouveauxBadges]);
      console.log('🏅 Nouveaux badges obtenus:', nouveauxBadges.map(b => b.nom));
    }
  }

  // =====================================================
  // UTILITAIRES PRIVÉS
  // =====================================================

  private mettreAJourProgression(
    coursId: string, 
    updateFn: (progression: ProgressionEtudiant) => ProgressionEtudiant
  ): Observable<boolean> {
    const progressions = this.progressionsSubject.value;
    const index = progressions.findIndex(p => 
      p.coursId === coursId && p.etudiantId === this.etudiantActuelId
    );

    if (index === -1) {
      return throwError(() => new Error('Progression non trouvée'));
    }

    const progressionUpdate = updateFn({...progressions[index]});
    const progressionsUpdate = [...progressions];
    progressionsUpdate[index] = progressionUpdate;
    
    this.progressionsSubject.next(progressionsUpdate);
    return of(true).pipe(delay(200));
  }

  private verifierCompletionCours(progression: ProgressionEtudiant): void {
    // Dans un vrai système, on vérifierait tous les modules requis
    if (progression.pourcentageCompletion >= 100) {
      progression.statut = StatutProgression.COMPLETE;
      
      // Déclencher génération certificat si éligible
      if (progression.noteActuelle >= 60) {
        console.log('🎓 Cours complété avec succès - Certificat éligible');
      }
    }
  }

  private mapPlanToNiveauAcces(planId: string): NiveauAccesElearning {
    switch (planId) {
      case 'starter': return NiveauAccesElearning.STARTER;
      case 'professional': return NiveauAccesElearning.PROFESSIONAL;
      case 'enterprise': return NiveauAccesElearning.ENTERPRISE;
      case 'multinational': return NiveauAccesElearning.MULTINATIONAL;
      default: return NiveauAccesElearning.GRATUIT;
    }
  }

  private extraireCompetences(cours: CoursComptabilite): any[] {
    return cours.objectifs.map(obj => ({
      id: obj.id,
      nom: obj.description,
      description: obj.description,
      niveau: obj.niveau,
      domaine: cours.categorie,
      dateValidation: new Date(),
      preuveValidation: `Cours ${cours.titre} complété avec succès`
    }));
  }

  private genererIdProgression(): string {
    return `prog_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private genererIdCertificat(): string {
    return `cert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private genererHashCertificat(): string {
    return `sha256_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;
  }

  private genererSignature(): string {
    return `sig_${Date.now()}_${Math.random().toString(36).substr(2, 20)}`;
  }

  private initialiserDonneesSimulees(): void {
    // Simulation de données pour démonstration
    setTimeout(() => {
      // Progression exemple pour fondamentaux SYSCOHADA
      const progressionExemple: ProgressionEtudiant = {
        id: 'prog_demo_1',
        etudiantId: this.etudiantActuelId,
        coursId: 'syscohada-fundamentals',
        pourcentageCompletion: 45.5,
        statut: StatutProgression.EN_COURS,
        dateInscription: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        dateDerniereActivite: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        modulesCompletes: ['module-1-introduction'],
        leconsVues: [
          { leconId: 'lecon-1-1', complete: true, tempsConsomme: 45 },
          { leconId: 'lecon-1-2', complete: true, tempsConsomme: 30 },
          { leconId: 'lecon-2-1', complete: false, tempsConsomme: 20 }
        ],
        exercicesRealises: [
          { exerciceId: 'exercice-module-1', reussi: true, noteObtenue: 85, nombreTentatives: 1 }
        ],
        noteActuelle: 78.5,
        moyenneQuiz: 82,
        moyenneExercices: 75,
        tempsTotal: 95,
        nombreConnexions: 5,
        streakJours: 3,
        difficultesIdentifiees: [],
        recommandationsIA: [],
        rythmeApprentissage: 'regulier',
        badgesObtenus: [],
        pointsExperience: 150,
        niveau: 2
      };

      this.progressionsSubject.next([progressionExemple]);

      // Badge exemple
      const badgeExemple: Badge = {
        id: 'badge-premier-pas',
        nom: 'Premier Pas',
        description: 'Vous avez commencé votre parcours !',
        icone: '🚀',
        couleur: '#10B981',
        critereObtention: 'Première connexion',
        rarete: 'commun',
        dateObtention: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        pointsExperience: 10
      };

      this.badgesSubject.next([badgeExemple]);
    }, 1000);
  }

  // =====================================================
  // MÉTHODES PUBLIQUES UTILITAIRES
  // =====================================================

  /**
   * Obtient les statistiques d'apprentissage de l'étudiant
   */
  getStatistiquesEtudiant(): Observable<any> {
    return combineLatest([
      this.getToutesProgressions(),
      this.getCertificatsEtudiant(),
      this.getBadgesEtudiant()
    ]).pipe(
      map(([progressions, certificats, badges]) => ({
        nombreCoursInscrits: progressions.length,
        nombreCoursCompletes: progressions.filter(p => p.statut === StatutProgression.COMPLETE).length,
        pourcentageCompletionMoyen: progressions.length > 0 ?
          progressions.reduce((sum, p) => sum + p.pourcentageCompletion, 0) / progressions.length : 0,
        tempsApprentissageTotal: progressions.reduce((sum, p) => sum + p.tempsTotal, 0),
        noteMoyenne: progressions.length > 0 ?
          progressions.reduce((sum, p) => sum + p.noteActuelle, 0) / progressions.length : 0,
        nombreCertificats: certificats.length,
        nombreBadges: badges.length,
        pointsExperienceTotal: progressions.reduce((sum, p) => sum + p.pointsExperience, 0),
        niveauMoyen: progressions.length > 0 ?
          Math.floor(progressions.reduce((sum, p) => sum + p.niveau, 0) / progressions.length) : 1,
        streakMaximum: Math.max(...progressions.map(p => p.streakJours), 0),
        coursEnCours: progressions.filter(p => p.statut === StatutProgression.EN_COURS).length,
        dernierAcces: progressions.length > 0 ?
          new Date(Math.max(...progressions.map(p => p.dateDerniereActivite.getTime()))) : null
      }))
    );
  }

  /**
   * Recherche intelligente avec recommandations
   */
  rechercheIntelligente(terme: string): Observable<any> {
    return combineLatest([
      this.rechercherCours(terme),
      this.getToutesProgressions()
    ]).pipe(
      map(([cours, progressions]) => {
        // Tri par pertinence et progression
        const coursAvecPertinence = cours.map(c => {
          const progression = progressions.find(p => p.coursId === c.id);
          let score = 0;
          
          // Score basé sur le titre
          if (c.titre.toLowerCase().includes(terme.toLowerCase())) score += 10;
          
          // Score basé sur les mots-clés
          const motsMatches = c.motsCles.filter(mot => 
            mot.toLowerCase().includes(terme.toLowerCase())
          ).length;
          score += motsMatches * 5;
          
          // Bonus si cours en cours
          if (progression?.statut === StatutProgression.EN_COURS) score += 15;
          
          // Bonus si niveau adapté
          if (c.niveau === 'debutant') score += 3;
          
          return { ...c, score, progression };
        });

        // Trier par score de pertinence
        const coursTriés = coursAvecPertinence.sort((a, b) => b.score - a.score);

        return {
          cours: coursTriés,
          suggestions: this.genererSuggestionsRecherche(terme, coursTriés),
          statistiques: {
            nombreResultats: coursTriés.length,
            tempsRecherche: Math.random() * 100 + 50, // ms
            pertinenceMoyenne: coursTriés.length > 0 ?
              coursTriés.reduce((sum, c) => sum + c.score, 0) / coursTriés.length : 0
          }
        };
      })
    );
  }

  private genererSuggestionsRecherche(terme: string, cours: any[]): string[] {
    const suggestions = [];
    
    // Suggestions basées sur les mots-clés des cours trouvés
    const motsCles = cours.flatMap(c => c.motsCles);
    const motsFrequents = [...new Set(motsCles)].slice(0, 3);
    
    suggestions.push(...motsFrequents.map(mot => `${terme} ${mot}`));
    
    // Suggestions contextuelles
    if (terme.toLowerCase().includes('syscohada')) {
      suggestions.push('plan comptable SYSCOHADA', 'analyse financière SYSCOHADA');
    }
    
    if (terme.toLowerCase().includes('comptabilité')) {
      suggestions.push('comptabilité OHADA', 'tenue comptabilité');
    }
    
    return suggestions.slice(0, 5);
  }
}