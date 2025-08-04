import { Account, AccountClass, AccountType } from '@/types'

// Plan comptable SYCEBNL - Système Comptable des Entités à But Non Lucratif
export const SYCEBNL_ACCOUNTS: Account[] = [
  // CLASSE 1 - COMPTES DE RESSOURCES DURABLES
  {
    id: '1',
    code: '1',
    name: 'COMPTES DE RESSOURCES DURABLES',
    class: AccountClass.CLASSE_1,
    type: AccountType.EQUITY,
    isActive: true,
    description: 'Ressources stables de l\'entité'
  },
  {
    id: '10',
    code: '10',
    name: 'DOTATIONS',
    class: AccountClass.CLASSE_1,
    type: AccountType.EQUITY,
    parentId: '1',
    isActive: true
  },
  {
    id: '101',
    code: '101',
    name: 'Dotations initiales',
    class: AccountClass.CLASSE_1,
    type: AccountType.EQUITY,
    parentId: '10',
    isActive: true
  },
  {
    id: '1011',
    code: '1011',
    name: 'Dotations en numéraire',
    class: AccountClass.CLASSE_1,
    type: AccountType.EQUITY,
    parentId: '101',
    isActive: true
  },
  {
    id: '1012',
    code: '1012',
    name: 'Dotations en nature',
    class: AccountClass.CLASSE_1,
    type: AccountType.EQUITY,
    parentId: '101',
    isActive: true
  },
  {
    id: '102',
    code: '102',
    name: 'Dotations complémentaires',
    class: AccountClass.CLASSE_1,
    type: AccountType.EQUITY,
    parentId: '10',
    isActive: true
  },
  {
    id: '11',
    code: '11',
    name: 'RESERVES',
    class: AccountClass.CLASSE_1,
    type: AccountType.EQUITY,
    parentId: '1',
    isActive: true
  },
  {
    id: '111',
    code: '111',
    name: 'Réserves statutaires',
    class: AccountClass.CLASSE_1,
    type: AccountType.EQUITY,
    parentId: '11',
    isActive: true
  },
  {
    id: '112',
    code: '112',
    name: 'Réserves facultatives',
    class: AccountClass.CLASSE_1,
    type: AccountType.EQUITY,
    parentId: '11',
    isActive: true
  },
  {
    id: '113',
    code: '113',
    name: 'Réserves réglementées',
    class: AccountClass.CLASSE_1,
    type: AccountType.EQUITY,
    parentId: '11',
    isActive: true
  },
  {
    id: '12',
    code: '12',
    name: 'FONDS AFFECTES',
    class: AccountClass.CLASSE_1,
    type: AccountType.EQUITY,
    parentId: '1',
    isActive: true
  },
  {
    id: '121',
    code: '121',
    name: 'Fonds affectés par les tiers',
    class: AccountClass.CLASSE_1,
    type: AccountType.EQUITY,
    parentId: '12',
    isActive: true
  },
  {
    id: '122',
    code: '122',
    name: 'Fonds affectés par l\'entité',
    class: AccountClass.CLASSE_1,
    type: AccountType.EQUITY,
    parentId: '12',
    isActive: true
  },
  {
    id: '13',
    code: '13',
    name: 'RESULTATS',
    class: AccountClass.CLASSE_1,
    type: AccountType.EQUITY,
    parentId: '1',
    isActive: true
  },
  {
    id: '131',
    code: '131',
    name: 'Résultat en instance d\'affectation',
    class: AccountClass.CLASSE_1,
    type: AccountType.EQUITY,
    parentId: '13',
    isActive: true
  },
  {
    id: '132',
    code: '132',
    name: 'Résultat de l\'exercice',
    class: AccountClass.CLASSE_1,
    type: AccountType.EQUITY,
    parentId: '13',
    isActive: true
  },
  {
    id: '14',
    code: '14',
    name: 'SUBVENTIONS D\'INVESTISSEMENT',
    class: AccountClass.CLASSE_1,
    type: AccountType.EQUITY,
    parentId: '1',
    isActive: true
  },
  {
    id: '141',
    code: '141',
    name: 'Subventions d\'équipement',
    class: AccountClass.CLASSE_1,
    type: AccountType.EQUITY,
    parentId: '14',
    isActive: true
  },
  {
    id: '15',
    code: '15',
    name: 'PROVISIONS REGLEMENTEES',
    class: AccountClass.CLASSE_1,
    type: AccountType.EQUITY,
    parentId: '1',
    isActive: true
  },
  {
    id: '16',
    code: '16',
    name: 'EMPRUNTS ET DETTES ASSIMILEES',
    class: AccountClass.CLASSE_1,
    type: AccountType.LIABILITY,
    parentId: '1',
    isActive: true
  },
  {
    id: '161',
    code: '161',
    name: 'Emprunts obligataires',
    class: AccountClass.CLASSE_1,
    type: AccountType.LIABILITY,
    parentId: '16',
    isActive: true
  },
  {
    id: '162',
    code: '162',
    name: 'Emprunts et dettes auprès des établissements de crédit',
    class: AccountClass.CLASSE_1,
    type: AccountType.LIABILITY,
    parentId: '16',
    isActive: true
  },

  // CLASSE 2 - COMPTES D'ACTIF IMMOBILISE
  {
    id: '2',
    code: '2',
    name: 'COMPTES D\'ACTIF IMMOBILISE',
    class: AccountClass.CLASSE_2,
    type: AccountType.ASSET,
    isActive: true,
    description: 'Biens et droits destinés à rester durablement dans l\'entité'
  },
  {
    id: '20',
    code: '20',
    name: 'IMMOBILISATIONS INCORPORELLES',
    class: AccountClass.CLASSE_2,
    type: AccountType.ASSET,
    parentId: '2',
    isActive: true
  },
  {
    id: '201',
    code: '201',
    name: 'Frais de recherche et développement',
    class: AccountClass.CLASSE_2,
    type: AccountType.ASSET,
    parentId: '20',
    isActive: true
  },
  {
    id: '205',
    code: '205',
    name: 'Concessions et droits similaires',
    class: AccountClass.CLASSE_2,
    type: AccountType.ASSET,
    parentId: '20',
    isActive: true
  },
  {
    id: '206',
    code: '206',
    name: 'Droit au bail',
    class: AccountClass.CLASSE_2,
    type: AccountType.ASSET,
    parentId: '20',
    isActive: true
  },
  {
    id: '207',
    code: '207',
    name: 'Fonds commercial',
    class: AccountClass.CLASSE_2,
    type: AccountType.ASSET,
    parentId: '20',
    isActive: true
  },
  {
    id: '208',
    code: '208',
    name: 'Autres immobilisations incorporelles',
    class: AccountClass.CLASSE_2,
    type: AccountType.ASSET,
    parentId: '20',
    isActive: true
  },
  {
    id: '21',
    code: '21',
    name: 'IMMOBILISATIONS CORPORELLES',
    class: AccountClass.CLASSE_2,
    type: AccountType.ASSET,
    parentId: '2',
    isActive: true
  },
  {
    id: '211',
    code: '211',
    name: 'Terrains',
    class: AccountClass.CLASSE_2,
    type: AccountType.ASSET,
    parentId: '21',
    isActive: true
  },
  {
    id: '212',
    code: '212',
    name: 'Agencements et aménagements de terrains',
    class: AccountClass.CLASSE_2,
    type: AccountType.ASSET,
    parentId: '21',
    isActive: true
  },
  {
    id: '213',
    code: '213',
    name: 'Constructions',
    class: AccountClass.CLASSE_2,
    type: AccountType.ASSET,
    parentId: '21',
    isActive: true
  },
  {
    id: '215',
    code: '215',
    name: 'Installations techniques, matériel et outillage industriels',
    class: AccountClass.CLASSE_2,
    type: AccountType.ASSET,
    parentId: '21',
    isActive: true
  },
  {
    id: '218',
    code: '218',
    name: 'Autres immobilisations corporelles',
    class: AccountClass.CLASSE_2,
    type: AccountType.ASSET,
    parentId: '21',
    isActive: true
  },

  // CLASSE 3 - COMPTES DE STOCKS
  {
    id: '3',
    code: '3',
    name: 'COMPTES DE STOCKS',
    class: AccountClass.CLASSE_3,
    type: AccountType.ASSET,
    isActive: true,
    description: 'Biens détenus pour être vendus ou consommés'
  },
  {
    id: '31',
    code: '31',
    name: 'MATIERES PREMIERES',
    class: AccountClass.CLASSE_3,
    type: AccountType.ASSET,
    parentId: '3',
    isActive: true
  },
  {
    id: '32',
    code: '32',
    name: 'AUTRES APPROVISIONNEMENTS',
    class: AccountClass.CLASSE_3,
    type: AccountType.ASSET,
    parentId: '3',
    isActive: true
  },
  {
    id: '33',
    code: '33',
    name: 'EN-COURS DE PRODUCTION DE BIENS',
    class: AccountClass.CLASSE_3,
    type: AccountType.ASSET,
    parentId: '3',
    isActive: true
  },
  {
    id: '34',
    code: '34',
    name: 'EN-COURS DE PRODUCTION DE SERVICES',
    class: AccountClass.CLASSE_3,
    type: AccountType.ASSET,
    parentId: '3',
    isActive: true
  },
  {
    id: '35',
    code: '35',
    name: 'STOCKS DE PRODUITS',
    class: AccountClass.CLASSE_3,
    type: AccountType.ASSET,
    parentId: '3',
    isActive: true
  },
  {
    id: '37',
    code: '37',
    name: 'STOCKS DE MARCHANDISES',
    class: AccountClass.CLASSE_3,
    type: AccountType.ASSET,
    parentId: '3',
    isActive: true
  },

  // CLASSE 4 - COMPTES DE TIERS
  {
    id: '4',
    code: '4',
    name: 'COMPTES DE TIERS',
    class: AccountClass.CLASSE_4,
    type: AccountType.ASSET,
    isActive: true,
    description: 'Créances et dettes liées aux relations avec les tiers'
  },
  {
    id: '40',
    code: '40',
    name: 'FOURNISSEURS ET COMPTES RATTACHES',
    class: AccountClass.CLASSE_4,
    type: AccountType.LIABILITY,
    parentId: '4',
    isActive: true
  },
  {
    id: '401',
    code: '401',
    name: 'Fournisseurs',
    class: AccountClass.CLASSE_4,
    type: AccountType.LIABILITY,
    parentId: '40',
    isActive: true
  },
  {
    id: '408',
    code: '408',
    name: 'Fournisseurs - Factures non parvenues',
    class: AccountClass.CLASSE_4,
    type: AccountType.LIABILITY,
    parentId: '40',
    isActive: true
  },
  {
    id: '409',
    code: '409',
    name: 'Fournisseurs débiteurs',
    class: AccountClass.CLASSE_4,
    type: AccountType.ASSET,
    parentId: '40',
    isActive: true
  },
  {
    id: '41',
    code: '41',
    name: 'CLIENTS ET COMPTES RATTACHES',
    class: AccountClass.CLASSE_4,
    type: AccountType.ASSET,
    parentId: '4',
    isActive: true
  },
  {
    id: '411',
    code: '411',
    name: 'Clients',
    class: AccountClass.CLASSE_4,
    type: AccountType.ASSET,
    parentId: '41',
    isActive: true
  },
  {
    id: '418',
    code: '418',
    name: 'Clients - Produits non encore facturés',
    class: AccountClass.CLASSE_4,
    type: AccountType.ASSET,
    parentId: '41',
    isActive: true
  },
  {
    id: '42',
    code: '42',
    name: 'PERSONNEL ET COMPTES RATTACHES',
    class: AccountClass.CLASSE_4,
    type: AccountType.LIABILITY,
    parentId: '4',
    isActive: true
  },
  {
    id: '421',
    code: '421',
    name: 'Personnel - Rémunérations dues',
    class: AccountClass.CLASSE_4,
    type: AccountType.LIABILITY,
    parentId: '42',
    isActive: true
  },
  {
    id: '43',
    code: '43',
    name: 'SECURITE SOCIALE ET AUTRES ORGANISMES SOCIAUX',
    class: AccountClass.CLASSE_4,
    type: AccountType.LIABILITY,
    parentId: '4',
    isActive: true
  },
  {
    id: '44',
    code: '44',
    name: 'ETAT ET COLLECTIVITES PUBLIQUES',
    class: AccountClass.CLASSE_4,
    type: AccountType.ASSET,
    parentId: '4',
    isActive: true
  },
  {
    id: '445',
    code: '445',
    name: 'État - Taxes sur le chiffre d\'affaires',
    class: AccountClass.CLASSE_4,
    type: AccountType.ASSET,
    parentId: '44',
    isActive: true
  },
  {
    id: '46',
    code: '46',
    name: 'DEBITEURS DIVERS ET CREDITEURS DIVERS',
    class: AccountClass.CLASSE_4,
    type: AccountType.ASSET,
    parentId: '4',
    isActive: true
  },
  {
    id: '461',
    code: '461',
    name: 'Débiteurs divers',
    class: AccountClass.CLASSE_4,
    type: AccountType.ASSET,
    parentId: '46',
    isActive: true
  },
  {
    id: '462',
    code: '462',
    name: 'Créditeurs divers',
    class: AccountClass.CLASSE_4,
    type: AccountType.LIABILITY,
    parentId: '46',
    isActive: true
  },
  {
    id: '47',
    code: '47',
    name: 'COMPTES TRANSITOIRES OU D\'ATTENTE',
    class: AccountClass.CLASSE_4,
    type: AccountType.ASSET,
    parentId: '4',
    isActive: true
  },

  // CLASSE 5 - COMPTES FINANCIERS
  {
    id: '5',
    code: '5',
    name: 'COMPTES FINANCIERS',
    class: AccountClass.CLASSE_5,
    type: AccountType.ASSET,
    isActive: true,
    description: 'Disponibilités et valeurs mobilières de placement'
  },
  {
    id: '50',
    code: '50',
    name: 'VALEURS MOBILIERES DE PLACEMENT',
    class: AccountClass.CLASSE_5,
    type: AccountType.ASSET,
    parentId: '5',
    isActive: true
  },
  {
    id: '51',
    code: '51',
    name: 'BANQUES, ETABLISSEMENTS FINANCIERS ET ASSIMILES',
    class: AccountClass.CLASSE_5,
    type: AccountType.ASSET,
    parentId: '5',
    isActive: true
  },
  {
    id: '511',
    code: '511',
    name: 'Banques',
    class: AccountClass.CLASSE_5,
    type: AccountType.ASSET,
    parentId: '51',
    isActive: true
  },
  {
    id: '512',
    code: '512',
    name: 'Banques - Comptes sur livrets',
    class: AccountClass.CLASSE_5,
    type: AccountType.ASSET,
    parentId: '51',
    isActive: true
  },
  {
    id: '53',
    code: '53',
    name: 'CAISSE',
    class: AccountClass.CLASSE_5,
    type: AccountType.ASSET,
    parentId: '5',
    isActive: true
  },
  {
    id: '531',
    code: '531',
    name: 'Caisse',
    class: AccountClass.CLASSE_5,
    type: AccountType.ASSET,
    parentId: '53',
    isActive: true
  },
  {
    id: '54',
    code: '54',
    name: 'REGIES D\'AVANCES ET ACCREDITIFS',
    class: AccountClass.CLASSE_5,
    type: AccountType.ASSET,
    parentId: '5',
    isActive: true
  },

  // CLASSE 6 - COMPTES DE CHARGES
  {
    id: '6',
    code: '6',
    name: 'COMPTES DE CHARGES',
    class: AccountClass.CLASSE_6,
    type: AccountType.EXPENSE,
    isActive: true,
    description: 'Charges d\'exploitation, financières et exceptionnelles'
  },
  {
    id: '60',
    code: '60',
    name: 'ACHATS',
    class: AccountClass.CLASSE_6,
    type: AccountType.EXPENSE,
    parentId: '6',
    isActive: true
  },
  {
    id: '601',
    code: '601',
    name: 'Achats stockés - Matières premières',
    class: AccountClass.CLASSE_6,
    type: AccountType.EXPENSE,
    parentId: '60',
    isActive: true
  },
  {
    id: '602',
    code: '602',
    name: 'Achats stockés - Autres approvisionnements',
    class: AccountClass.CLASSE_6,
    type: AccountType.EXPENSE,
    parentId: '60',
    isActive: true
  },
  {
    id: '606',
    code: '606',
    name: 'Achats non stockés de matières et fournitures',
    class: AccountClass.CLASSE_6,
    type: AccountType.EXPENSE,
    parentId: '60',
    isActive: true
  },
  {
    id: '607',
    code: '607',
    name: 'Achats de marchandises',
    class: AccountClass.CLASSE_6,
    type: AccountType.EXPENSE,
    parentId: '60',
    isActive: true
  },
  {
    id: '61',
    code: '61',
    name: 'SERVICES EXTERIEURS',
    class: AccountClass.CLASSE_6,
    type: AccountType.EXPENSE,
    parentId: '6',
    isActive: true
  },
  {
    id: '611',
    code: '611',
    name: 'Sous-traitance générale',
    class: AccountClass.CLASSE_6,
    type: AccountType.EXPENSE,
    parentId: '61',
    isActive: true
  },
  {
    id: '613',
    code: '613',
    name: 'Locations',
    class: AccountClass.CLASSE_6,
    type: AccountType.EXPENSE,
    parentId: '61',
    isActive: true
  },
  {
    id: '615',
    code: '615',
    name: 'Entretien et réparations',
    class: AccountClass.CLASSE_6,
    type: AccountType.EXPENSE,
    parentId: '61',
    isActive: true
  },
  {
    id: '62',
    code: '62',
    name: 'AUTRES SERVICES EXTERIEURS',
    class: AccountClass.CLASSE_6,
    type: AccountType.EXPENSE,
    parentId: '6',
    isActive: true
  },
  {
    id: '621',
    code: '621',
    name: 'Personnel extérieur à l\'entité',
    class: AccountClass.CLASSE_6,
    type: AccountType.EXPENSE,
    parentId: '62',
    isActive: true
  },
  {
    id: '622',
    code: '622',
    name: 'Rémunérations d\'intermédiaires et honoraires',
    class: AccountClass.CLASSE_6,
    type: AccountType.EXPENSE,
    parentId: '62',
    isActive: true
  },
  {
    id: '63',
    code: '63',
    name: 'IMPOTS, TAXES ET VERSEMENTS ASSIMILES',
    class: AccountClass.CLASSE_6,
    type: AccountType.EXPENSE,
    parentId: '6',
    isActive: true
  },
  {
    id: '64',
    code: '64',
    name: 'CHARGES DE PERSONNEL',
    class: AccountClass.CLASSE_6,
    type: AccountType.EXPENSE,
    parentId: '6',
    isActive: true
  },
  {
    id: '641',
    code: '641',
    name: 'Rémunérations du personnel',
    class: AccountClass.CLASSE_6,
    type: AccountType.EXPENSE,
    parentId: '64',
    isActive: true
  },
  {
    id: '645',
    code: '645',
    name: 'Charges de sécurité sociale et de prévoyance',
    class: AccountClass.CLASSE_6,
    type: AccountType.EXPENSE,
    parentId: '64',
    isActive: true
  },
  {
    id: '65',
    code: '65',
    name: 'AUTRES CHARGES D\'EXPLOITATION',
    class: AccountClass.CLASSE_6,
    type: AccountType.EXPENSE,
    parentId: '6',
    isActive: true
  },
  {
    id: '66',
    code: '66',
    name: 'CHARGES FINANCIERES',
    class: AccountClass.CLASSE_6,
    type: AccountType.EXPENSE,
    parentId: '6',
    isActive: true
  },
  {
    id: '67',
    code: '67',
    name: 'CHARGES EXCEPTIONNELLES',
    class: AccountClass.CLASSE_6,
    type: AccountType.EXPENSE,
    parentId: '6',
    isActive: true
  },
  {
    id: '68',
    code: '68',
    name: 'DOTATIONS AUX AMORTISSEMENTS ET AUX PROVISIONS',
    class: AccountClass.CLASSE_6,
    type: AccountType.EXPENSE,
    parentId: '6',
    isActive: true
  },

  // CLASSE 7 - COMPTES DE PRODUITS
  {
    id: '7',
    code: '7',
    name: 'COMPTES DE PRODUITS',
    class: AccountClass.CLASSE_7,
    type: AccountType.REVENUE,
    isActive: true,
    description: 'Produits d\'exploitation, financiers et exceptionnels'
  },
  {
    id: '70',
    code: '70',
    name: 'VENTES DE PRODUITS FABRIQUES, PRESTATIONS DE SERVICES, MARCHANDISES',
    class: AccountClass.CLASSE_7,
    type: AccountType.REVENUE,
    parentId: '7',
    isActive: true
  },
  {
    id: '701',
    code: '701',
    name: 'Ventes de produits finis',
    class: AccountClass.CLASSE_7,
    type: AccountType.REVENUE,
    parentId: '70',
    isActive: true
  },
  {
    id: '706',
    code: '706',
    name: 'Prestations de services',
    class: AccountClass.CLASSE_7,
    type: AccountType.REVENUE,
    parentId: '70',
    isActive: true
  },
  {
    id: '707',
    code: '707',
    name: 'Ventes de marchandises',
    class: AccountClass.CLASSE_7,
    type: AccountType.REVENUE,
    parentId: '70',
    isActive: true
  },
  {
    id: '71',
    code: '71',
    name: 'PRODUCTION STOCKEE',
    class: AccountClass.CLASSE_7,
    type: AccountType.REVENUE,
    parentId: '7',
    isActive: true
  },
  {
    id: '72',
    code: '72',
    name: 'PRODUCTION IMMOBILISEE',
    class: AccountClass.CLASSE_7,
    type: AccountType.REVENUE,
    parentId: '7',
    isActive: true
  },
  {
    id: '74',
    code: '74',
    name: 'SUBVENTIONS D\'EXPLOITATION',
    class: AccountClass.CLASSE_7,
    type: AccountType.REVENUE,
    parentId: '7',
    isActive: true
  },
  {
    id: '75',
    code: '75',
    name: 'AUTRES PRODUITS D\'EXPLOITATION',
    class: AccountClass.CLASSE_7,
    type: AccountType.REVENUE,
    parentId: '7',
    isActive: true
  },
  {
    id: '751',
    code: '751',
    name: 'Redevances pour concessions, brevets, licences',
    class: AccountClass.CLASSE_7,
    type: AccountType.REVENUE,
    parentId: '75',
    isActive: true
  },
  {
    id: '754',
    code: '754',
    name: 'Cotisations',
    class: AccountClass.CLASSE_7,
    type: AccountType.REVENUE,
    parentId: '75',
    isActive: true,
    description: 'Cotisations des adhérents EBNL'
  },
  {
    id: '755',
    code: '755',
    name: 'Dons et libéralités',
    class: AccountClass.CLASSE_7,
    type: AccountType.REVENUE,
    parentId: '75',
    isActive: true,
    description: 'Dons reçus par l\'EBNL'
  },
  {
    id: '76',
    code: '76',
    name: 'PRODUITS FINANCIERS',
    class: AccountClass.CLASSE_7,
    type: AccountType.REVENUE,
    parentId: '7',
    isActive: true
  },
  {
    id: '77',
    code: '77',
    name: 'PRODUITS EXCEPTIONNELS',
    class: AccountClass.CLASSE_7,
    type: AccountType.REVENUE,
    parentId: '7',
    isActive: true
  },
  {
    id: '78',
    code: '78',
    name: 'REPRISES SUR AMORTISSEMENTS ET PROVISIONS',
    class: AccountClass.CLASSE_7,
    type: AccountType.REVENUE,
    parentId: '7',
    isActive: true
  },

  // CLASSE 8 - COMPTES SPECIAUX
  {
    id: '8',
    code: '8',
    name: 'COMPTES SPECIAUX',
    class: AccountClass.CLASSE_8,
    type: AccountType.SPECIAL,
    isActive: true,
    description: 'Comptes spéciaux aux EBNL'
  },
  {
    id: '80',
    code: '80',
    name: 'CONTRIBUTIONS VOLONTAIRES EN NATURE',
    class: AccountClass.CLASSE_8,
    type: AccountType.SPECIAL,
    parentId: '8',
    isActive: true,
    description: 'Valorisation du bénévolat et contributions en nature'
  },
  {
    id: '801',
    code: '801',
    name: 'Bénévolat',
    class: AccountClass.CLASSE_8,
    type: AccountType.SPECIAL,
    parentId: '80',
    isActive: true
  },
  {
    id: '802',
    code: '802',
    name: 'Prestations en nature',
    class: AccountClass.CLASSE_8,
    type: AccountType.SPECIAL,
    parentId: '80',
    isActive: true
  },
  {
    id: '803',
    code: '803',
    name: 'Dons en nature',
    class: AccountClass.CLASSE_8,
    type: AccountType.SPECIAL,
    parentId: '80',
    isActive: true
  },
  {
    id: '86',
    code: '86',
    name: 'EMPLOIS DES CONTRIBUTIONS VOLONTAIRES EN NATURE',
    class: AccountClass.CLASSE_8,
    type: AccountType.SPECIAL,
    parentId: '8',
    isActive: true
  },
  {
    id: '87',
    code: '87',
    name: 'CONTRIBUTIONS VOLONTAIRES EN NATURE',
    class: AccountClass.CLASSE_8,
    type: AccountType.SPECIAL,
    parentId: '8',
    isActive: true
  }
]

// Fonction utilitaire pour obtenir les comptes par classe
export const getAccountsByClass = (accountClass: AccountClass): Account[] => {
  return SYCEBNL_ACCOUNTS.filter(account => account.class === accountClass)
}

// Fonction utilitaire pour obtenir les comptes racines (niveau 1)
export const getRootAccounts = (): Account[] => {
  return SYCEBNL_ACCOUNTS.filter(account => !account.parentId)
}

// Fonction utilitaire pour obtenir les comptes enfants
export const getChildAccounts = (parentId: string): Account[] => {
  return SYCEBNL_ACCOUNTS.filter(account => account.parentId === parentId)
}

// Fonction utilitaire pour rechercher un compte par code
export const findAccountByCode = (code: string): Account | undefined => {
  return SYCEBNL_ACCOUNTS.find(account => account.code === code)
}