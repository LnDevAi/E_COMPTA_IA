import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { 
  Entreprise, 
  PAYS_SYSCOHADA, 
  SystemeComptable, 
  DocumentOfficiel, 
  ValidationIA,
  ControleIA,
  StatutEntreprise,
  StatutValidation,
  TypeDocument
} from '../models/entreprise.model';

@Injectable({
  providedIn: 'root'
})
export class EntrepriseService {
  private entrepriseSubject = new BehaviorSubject<Entreprise | null>(null);
  public entreprise$ = this.entrepriseSubject.asObservable();

  constructor() { }

  // Obtenir les pays SYSCOHADA
  getPaysSyscohada(): Observable<any[]> {
    return of(PAYS_SYSCOHADA);
  }

  // Obtenir le système comptable selon le pays
  getSystemeComptableParPays(codePays: string): SystemeComptable {
    const pays = PAYS_SYSCOHADA.find(p => p.code === codePays);
    
    if (pays) {
      return {
        nom: 'SYSCOHADA AUDCIF',
        version: '2019',
        dateApplication: new Date('2019-01-01'),
        caracteristiques: [
          'Plan comptable uniforme',
          'États financiers normalisés',
          'Ratios financiers AUDCIF',
          'Consolidation des comptes',
          'Audit et contrôle interne'
        ]
      };
    }
    
    // Système par défaut pour autres pays
    return {
      nom: 'SYSCOHADA AUDCIF (Adapté)',
      version: '2019',
      dateApplication: new Date(),
      caracteristiques: [
        'Adaptation aux normes locales',
        'Conformité internationale',
        'Reporting multicritères'
      ]
    };
  }

  // Validation automatique avec IA
  validerEntrepriseAvecIA(entreprise: Entreprise): Observable<ValidationIA> {
    return new Observable(observer => {
      setTimeout(() => {
        const controles: ControleIA[] = [];
        let score = 0;
        const recommandations: string[] = [];

        // Contrôle 1: Informations de base
        if (entreprise.raisonSociale && entreprise.formeJuridique && entreprise.secteurActivite) {
          controles.push({
            type: 'INFORMATIONS_BASE',
            resultat: 'CONFORME',
            message: 'Informations de base complètes et conformes'
          });
          score += 20;
        } else {
          controles.push({
            type: 'INFORMATIONS_BASE',
            resultat: 'NON_CONFORME',
            message: 'Informations de base incomplètes'
          });
          recommandations.push('Compléter la raison sociale, forme juridique et secteur d\'activité');
        }

        // Contrôle 2: Conformité SYSCOHADA
        const paysSyscohada = PAYS_SYSCOHADA.find(p => p.code === entreprise.pays);
        if (paysSyscohada) {
          controles.push({
            type: 'CONFORMITE_SYSCOHADA',
            resultat: 'CONFORME',
            message: `Pays ${paysSyscohada.nom} conforme SYSCOHADA AUDCIF`
          });
          score += 25;
        } else {
          controles.push({
            type: 'CONFORMITE_SYSCOHADA',
            resultat: 'ATTENTION',
            message: 'Pays hors zone SYSCOHADA - adaptation nécessaire'
          });
          score += 10;
          recommandations.push('Vérifier l\'adaptation du système comptable local');
        }

        // Contrôle 3: Documents légaux
        const documentsRequis = [TypeDocument.REGISTRE_COMMERCE, TypeDocument.IFU];
        const documentsPresents = entreprise.documentsOfficiels?.filter(d => 
          documentsRequis.includes(d.type) && d.statutValidation === StatutValidation.VALIDE
        ) || [];

        if (documentsPresents.length >= documentsRequis.length) {
          controles.push({
            type: 'DOCUMENTS_LEGAUX',
            resultat: 'CONFORME',
            message: 'Documents légaux requis présents et validés'
          });
          score += 25;
        } else {
          controles.push({
            type: 'DOCUMENTS_LEGAUX',
            resultat: 'NON_CONFORME',
            message: 'Documents légaux manquants ou non validés'
          });
          recommandations.push('Télécharger et valider le registre de commerce et l\'IFU');
        }

        // Contrôle 4: Cohérence fiscale
        if (entreprise.regimeFiscal && entreprise.exerciceComptable) {
          controles.push({
            type: 'COHERENCE_FISCALE',
            resultat: 'CONFORME',
            message: 'Régime fiscal et exercice comptable définis'
          });
          score += 20;
        } else {
          controles.push({
            type: 'COHERENCE_FISCALE',
            resultat: 'NON_CONFORME',
            message: 'Régime fiscal ou exercice comptable manquant'
          });
          recommandations.push('Définir le régime fiscal et les dates d\'exercice comptable');
        }

        // Contrôle 5: Validation numéros officiels
        if (entreprise.numeroIFU && this.validerFormatIFU(entreprise.numeroIFU)) {
          controles.push({
            type: 'FORMAT_IFU',
            resultat: 'CONFORME',
            message: 'Format IFU valide'
          });
          score += 10;
        } else if (entreprise.numeroIFU) {
          controles.push({
            type: 'FORMAT_IFU',
            resultat: 'NON_CONFORME',
            message: 'Format IFU invalide'
          });
          recommandations.push('Vérifier le format du numéro IFU');
        }

        const validation: ValidationIA = {
          score,
          controles,
          recommandations,
          dateValidation: new Date()
        };

        observer.next(validation);
        observer.complete();
      }, 2000); // Simulation délai validation IA
    });
  }

  // Validation format IFU (exemple pour pays UEMOA)
  private validerFormatIFU(ifu: string): boolean {
    // Format IFU UEMOA: 12 chiffres
    const regexIFU = /^\d{12}$/;
    return regexIFU.test(ifu);
  }

  // Sauvegarder entreprise
  sauvegarderEntreprise(entreprise: Entreprise): Observable<Entreprise> {
    entreprise.derniereModification = new Date();
    if (!entreprise.dateCreationDossier) {
      entreprise.dateCreationDossier = new Date();
    }

    // Déterminer le statut
    entreprise.statut = this.determinerStatutEntreprise(entreprise);

    this.entrepriseSubject.next(entreprise);
    
    // Simulation sauvegarde
    return of(entreprise);
  }

  // Déterminer statut selon données
  private determinerStatutEntreprise(entreprise: Entreprise): StatutEntreprise {
    const champsObligatoires = [
      entreprise.raisonSociale,
      entreprise.formeJuridique,
      entreprise.secteurActivite,
      entreprise.pays,
      entreprise.ville,
      entreprise.adresseComplete
    ];

    const champsCompletes = champsObligatoires.filter(champ => champ && champ.trim() !== '');
    
    if (champsCompletes.length < champsObligatoires.length) {
      return StatutEntreprise.INCOMPLET;
    }

    const documentsValides = entreprise.documentsOfficiels?.filter(d => 
      d.statutValidation === StatutValidation.VALIDE
    ) || [];

    if (documentsValides.length === 0) {
      return StatutEntreprise.EN_COURS_VALIDATION;
    }

    return StatutEntreprise.VALIDE;
  }

  // Upload et validation document
  uploaderDocument(file: File, type: TypeDocument): Observable<DocumentOfficiel> {
    return new Observable(observer => {
      const document: DocumentOfficiel = {
        id: this.genererIdDocument(),
        type,
        nom: file.name,
        numeroDocument: '',
        dateEmission: new Date(),
        fichier: file,
        statutValidation: StatutValidation.EN_ATTENTE,
        remarquesIA: []
      };

      // Simulation validation IA document
      setTimeout(() => {
        document.statutValidation = this.validerDocumentAvecIA(file, type);
        if (document.statutValidation === StatutValidation.VALIDE) {
          document.numeroDocument = this.extraireNumeroDocument(file, type);
          document.remarquesIA = ['Document validé automatiquement par IA'];
        } else {
          document.remarquesIA = ['Vérification manuelle requise - qualité image insuffisante'];
        }

        observer.next(document);
        observer.complete();
      }, 3000);
    });
  }

  // Validation IA document (simulation)
  private validerDocumentAvecIA(file: File, type: TypeDocument): StatutValidation {
    // Simulation: validation basée sur taille et type de fichier
    const tailleOk = file.size > 50000 && file.size < 5000000; // 50KB - 5MB
    const typeOk = ['application/pdf', 'image/jpeg', 'image/png'].includes(file.type);
    
    if (tailleOk && typeOk) {
      return Math.random() > 0.2 ? StatutValidation.VALIDE : StatutValidation.VERIFICATION_MANUELLE;
    }
    
    return StatutValidation.REJETE;
  }

  // Extraction numéro document (simulation OCR)
  private extraireNumeroDocument(file: File, type: TypeDocument): string {
    // Simulation extraction OCR
    switch (type) {
      case TypeDocument.REGISTRE_COMMERCE:
        return 'RC-' + Math.floor(Math.random() * 1000000);
      case TypeDocument.IFU:
        return Math.floor(Math.random() * 1000000000000).toString().padStart(12, '0');
      default:
        return 'DOC-' + Math.floor(Math.random() * 100000);
    }
  }

  private genererIdDocument(): string {
    return 'doc_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
  }

  // Obtenir entreprise actuelle
  getEntrepriseActuelle(): Observable<Entreprise | null> {
    return this.entreprise$;
  }

  // Créer nouvelle entreprise avec valeurs par défaut
  creerNouvelleEntreprise(): Entreprise {
    return {
      raisonSociale: '',
      formeJuridique: '',
      secteurActivite: '',
      pays: '',
      ville: '',
      adresseComplete: '',
      systemeComptable: {
        nom: '',
        version: '',
        dateApplication: new Date(),
        caracteristiques: []
      },
      dateCreation: new Date(),
      regimeFiscal: {
        type: 'REEL_NORMAL',
        description: '',
        obligationsComptables: []
      },
      exerciceComptable: {
        dateDebut: new Date(),
        dateFin: new Date(),
        dureeEnMois: 12,
        statut: 'EN_PREPARATION'
      },
      documentsOfficiels: [],
      monnaie: 'XOF',
      tauxTVA: 18,
      dateCreationDossier: new Date(),
      derniereModification: new Date(),
      statut: StatutEntreprise.NOUVEAU
    };
  }
}