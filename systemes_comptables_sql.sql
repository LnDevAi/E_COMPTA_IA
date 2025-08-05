-- =====================================================
-- BASE DE DONNÉES DES SYSTÈMES COMPTABLES MONDIAUX
-- Systèmes Comptables, Fiscaux et Sociaux par Pays
-- =====================================================

-- Création de la base de données
CREATE DATABASE IF NOT EXISTS systemes_comptables_mondiaux
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE systemes_comptables_mondiaux;

-- =====================================================
-- CRÉATION DES TABLES
-- =====================================================

-- Table principale des pays et leurs systèmes
DROP TABLE IF EXISTS pays_systemes;
CREATE TABLE pays_systemes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pays VARCHAR(100) NOT NULL UNIQUE,
    continent VARCHAR(50) NOT NULL,
    region VARCHAR(100) NOT NULL,
    devise VARCHAR(10) NOT NULL,
    langue VARCHAR(100) NOT NULL,
    
    -- Système comptable
    systeme_comptable VARCHAR(50) NOT NULL,
    referentiel_detail TEXT,
    audit_obligatoire BOOLEAN DEFAULT FALSE,
    
    -- Système fiscal
    is_taux DECIMAL(5,2) NOT NULL COMMENT 'Taux Impôt sur les Sociétés (%)',
    tva_taux DECIMAL(5,2) NOT NULL COMMENT 'Taux TVA principal (%)',
    ir_bareme VARCHAR(200) COMMENT 'Barème Impôt sur le Revenu',
    autres_taxes TEXT COMMENT 'Autres taxes importantes',
    
    -- Système social
    organisme_social VARCHAR(100) COMMENT 'Organisme principal de sécurité sociale',
    cotisations_patronales DECIMAL(5,2) DEFAULT 0 COMMENT 'Cotisations patronales (%)',
    cotisations_salariales DECIMAL(5,2) DEFAULT 0 COMMENT 'Cotisations salariales (%)',
    declaration_sociale VARCHAR(100) COMMENT 'Fréquence déclarations sociales',
    
    -- Informations complémentaires
    particularites TEXT COMMENT 'Particularités du système',
    statut_economique ENUM('Développé', 'En développement', 'PMA') DEFAULT 'En développement',
    
    -- Métadonnées
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_pays (pays),
    INDEX idx_continent (continent),
    INDEX idx_region (region),
    INDEX idx_systeme_comptable (systeme_comptable),
    INDEX idx_is_taux (is_taux),
    INDEX idx_tva_taux (tva_taux)
);

-- Table des systèmes comptables de référence
DROP TABLE IF EXISTS referentiels_comptables;
CREATE TABLE referentiels_comptables (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    nom_complet VARCHAR(200) NOT NULL,
    description TEXT,
    organisme_regulateur VARCHAR(200),
    base_ifrs BOOLEAN DEFAULT FALSE,
    pays_origine VARCHAR(100),
    date_creation_ref DATE,
    statut ENUM('Actif', 'En transition', 'Obsolète') DEFAULT 'Actif'
);

-- Table des zones économiques et unions
DROP TABLE IF EXISTS zones_economiques;
CREATE TABLE zones_economiques (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    nom VARCHAR(200) NOT NULL,
    type_zone ENUM('Union monétaire', 'Zone de libre-échange', 'Union douanière', 'Marché commun') NOT NULL,
    devise_commune VARCHAR(10),
    harmonisation_comptable BOOLEAN DEFAULT FALSE,
    harmonisation_fiscale BOOLEAN DEFAULT FALSE
);

-- Table de liaison pays-zones économiques
DROP TABLE IF EXISTS pays_zones;
CREATE TABLE pays_zones (
    pays_id INT,
    zone_id INT,
    date_adhesion DATE,
    statut ENUM('Membre', 'Observateur', 'Candidat') DEFAULT 'Membre',
    PRIMARY KEY (pays_id, zone_id),
    FOREIGN KEY (pays_id) REFERENCES pays_systemes(id) ON DELETE CASCADE,
    FOREIGN KEY (zone_id) REFERENCES zones_economiques(id) ON DELETE CASCADE
);

-- =====================================================
-- INSERTION DES DONNÉES DE RÉFÉRENCE
-- =====================================================

-- Insertion des référentiels comptables
INSERT INTO referentiels_comptables (code, nom_complet, description, organisme_regulateur, base_ifrs, pays_origine, date_creation_ref) VALUES
('IFRS', 'International Financial Reporting Standards', 'Normes comptables internationales', 'IASB - International Accounting Standards Board', TRUE, 'International', '2001-01-01'),
('SYSCOHADA', 'Système Comptable Ouest-Africain Harmonisé', 'Système comptable harmonisé pour les pays OHADA', 'OHADA', FALSE, 'Multi-pays', '1998-01-01'),
('US-GAAP', 'United States Generally Accepted Accounting Principles', 'Principes comptables américains', 'FASB - Financial Accounting Standards Board', FALSE, 'États-Unis', '1973-01-01'),
('SCF', 'Système Comptable et Financier', 'Système comptable algérien basé sur IFRS', 'Conseil National de la Comptabilité', TRUE, 'Algérie', '2010-01-01'),
('PCG-FR', 'Plan Comptable Général Français', 'Plan comptable français', 'ANC - Autorité des Normes Comptables', FALSE, 'France', '1947-01-01'),
('HGB', 'Handelsgesetzbuch', 'Code de commerce allemand', 'Ministère de la Justice allemand', FALSE, 'Allemagne', '1897-01-01'),
('UK-GAAP', 'United Kingdom Generally Accepted Accounting Principles', 'Normes comptables britanniques', 'FRC - Financial Reporting Council', FALSE, 'Royaume-Uni', '1970-01-01'),
('BR-GAAP', 'Brazilian Generally Accepted Accounting Principles', 'Normes comptables brésiliennes', 'CPC - Comitê de Pronunciamentos Contábeis', TRUE, 'Brésil', '2007-01-01'),
('J-GAAP', 'Japanese Generally Accepted Accounting Principles', 'Normes comptables japonaises', 'ASBJ - Accounting Standards Board of Japan', FALSE, 'Japon', '1949-01-01'),
('CAS', 'Chinese Accounting Standards', 'Normes comptables chinoises', 'Ministry of Finance of China', TRUE, 'Chine', '2006-01-01');

-- Insertion des zones économiques
INSERT INTO zones_economiques (code, nom, type_zone, devise_commune, harmonisation_comptable, harmonisation_fiscale) VALUES
('OHADA', 'Organisation pour l''Harmonisation en Afrique du Droit des Affaires', 'Union juridique', 'FCFA', TRUE, FALSE),
('UEMOA', 'Union Économique et Monétaire Ouest Africaine', 'Union monétaire', 'FCFA', TRUE, TRUE),
('CEMAC', 'Communauté Économique et Monétaire de l''Afrique Centrale', 'Union monétaire', 'FCFA', TRUE, TRUE),
('UE', 'Union Européenne', 'Union économique', 'EUR', TRUE, TRUE),
('ALENA', 'Accord de Libre-Échange Nord-Américain', 'Zone de libre-échange', NULL, FALSE, FALSE),
('MERCOSUR', 'Marché Commun du Sud', 'Marché commun', NULL, FALSE, FALSE),
('ASEAN', 'Association des Nations de l''Asie du Sud-Est', 'Zone de libre-échange', NULL, FALSE, FALSE),
('UA', 'Union Africaine', 'Union politique', NULL, FALSE, FALSE);

-- =====================================================
-- INSERTION DES DONNÉES PAYS
-- =====================================================

INSERT INTO pays_systemes (
    pays, continent, region, devise, langue, systeme_comptable, referentiel_detail,
    is_taux, tva_taux, ir_bareme, autres_taxes, organisme_social,
    cotisations_patronales, cotisations_salariales, declaration_sociale, particularites, statut_economique
) VALUES

-- PAYS OHADA
('Bénin', 'Afrique', 'OHADA', 'XOF', 'Français', 'SYSCOHADA', 'Acte uniforme relatif au droit comptable et à l''information financière', 30.00, 18.00, 'Progressif', 'IRVM: 10%, TPU: 0,5%', 'CNSS', 16.40, 3.60, 'Mensuelle', 'Système harmonisé OHADA, comptabilité en français obligatoire', 'PMA'),

('Burkina Faso', 'Afrique', 'OHADA', 'XOF', 'Français', 'SYSCOHADA', 'Plan comptable général harmonisé', 27.50, 18.00, 'Progressif', 'IUTS: Progressif, CSI: 2%', 'CNSS', 16.75, 5.50, 'Trimestrielle', 'Contribution du secteur informel', 'PMA'),

('Cameroun', 'Afrique', 'OHADA', 'XAF', 'Français', 'SYSCOHADA', 'Plan comptable général des entreprises', 30.00, 19.25, '10-35%', 'Centimes communaux: 10%', 'CNPS', 16.20, 4.20, 'Mensuelle avant le 15', 'Système normal et système minimal de trésorerie', 'En développement'),

('Centrafrique', 'Afrique', 'OHADA', 'XAF', 'Français', 'SYSCOHADA', 'Application des normes OHADA', 30.00, 19.00, 'Progressif', 'Patente: Variable', 'ACSS', 16.00, 4.00, 'Mensuelle', 'Tenue obligatoire des livres comptables', 'PMA'),

('Comores', 'Afrique', 'OHADA', 'KMF', 'Français/Arabe', 'SYSCOHADA', 'Adopté en 2005', 35.00, 10.00, 'Progressif', 'Impôt sur les salaires: 1%', 'CSSC', 15.00, 3.50, 'Trimestrielle', 'Comptes consolidés pour les groupes', 'PMA'),

('Congo', 'Afrique', 'OHADA', 'XAF', 'Français', 'SYSCOHADA', 'Normalisation comptable selon l''acte uniforme OHADA', 30.00, 18.00, '1-40%', 'IRCM: 20%', 'CNSS', 16.50, 4.00, 'Mensuelle', 'Audit obligatoire selon seuils', 'En développement'),

('Côte d''Ivoire', 'Afrique', 'OHADA', 'XOF', 'Français', 'SYSCOHADA', 'PCGE - Système normal, allégé ou de trésorerie selon la taille', 25.00, 18.00, 'Progressif', 'IRVM: 10%, CN: 1%', 'CNPS', 16.40, 6.30, 'Mensuelle avant le 10', 'Système selon taille entreprise', 'En développement'),

('Gabon', 'Afrique', 'OHADA', 'XAF', 'Français', 'SYSCOHADA', 'Plan comptable général harmonisé', 30.00, 18.00, '5-35%', 'TVAI: 18%', 'CNSS', 20.15, 4.50, 'Mensuelle', 'Commissariat aux comptes obligatoire selon seuils', 'En développement'),

('Guinée', 'Afrique', 'OHADA', 'GNF', 'Français', 'SYSCOHADA', 'Adopté en 2000', 35.00, 18.00, '5-40%', 'TAF: 5%', 'CNSS', 18.00, 5.00, 'Trimestrielle', 'Tenue en langue française obligatoire', 'PMA'),

('Guinée-Bissau', 'Afrique', 'OHADA', 'XOF', 'Portugais', 'SYSCOHADA', 'Membre depuis 1997', 25.00, 17.00, 'Progressif', 'IC: 3%', 'INPS', 7.00, 3.00, 'Mensuelle', 'Application progressive des normes', 'PMA'),

('Guinée Équatoriale', 'Afrique', 'OHADA', 'XAF', 'Espagnol', 'SYSCOHADA', 'Plan comptable en espagnol et français', 35.00, 15.00, 'Progressif', 'Impôt sur les hydrocarbures', 'INSESO', 21.50, 4.50, 'Mensuelle', 'Normes adaptées au secteur pétrolier', 'En développement'),

('Mali', 'Afrique', 'OHADA', 'XOF', 'Français', 'SYSCOHADA', 'Système normal ou de trésorerie', 30.00, 18.00, '0-40%', 'IBIC: 30%', 'INPS', 18.60, 5.40, 'Mensuelle avant le 10', 'Deux systèmes comptables disponibles', 'PMA'),

('Niger', 'Afrique', 'OHADA', 'XOF', 'Français', 'SYSCOHADA', 'Plan comptable général harmonisé', 30.00, 19.00, '0-35%', 'TP: 18%', 'CNSS', 17.80, 1.00, 'Trimestrielle', 'Comptes de résultat et bilan obligatoires', 'PMA'),

('Sénégal', 'Afrique', 'OHADA', 'XOF', 'Français', 'SYSCOHADA', 'PCGE + comptes consolidés obligatoires pour les groupes', 30.00, 18.00, '0-40%', 'CFCE: 3%', 'CSS', 21.70, 5.60, 'Mensuelle', 'Consolidation obligatoire pour les groupes', 'En développement'),

('Tchad', 'Afrique', 'OHADA', 'XAF', 'Français', 'SYSCOHADA', 'Plan comptable général', 40.00, 18.00, '2-60%', 'Taxe spéciale sur les sociétés pétrolières', 'CNSS', 16.50, 3.50, 'Mensuelle', 'CAC selon seuils, secteur pétrolier spécifique', 'PMA'),

('Togo', 'Afrique', 'OHADA', 'XOF', 'Français', 'SYSCOHADA', 'Système normal, allégé ou de trésorerie selon la taille', 27.00, 18.00, '5-45%', 'AP: 1,5% CA', 'CNSS', 16.50, 4.00, 'Mensuelle avant le 15', 'Trois systèmes selon taille: normal, allégé, trésorerie', 'PMA'),

-- AUTRES PAYS AFRICAINS
('Afrique du Sud', 'Afrique', 'Afrique Australe', 'ZAR', 'Anglais', 'IFRS', 'IFRS + Companies Act 2008', 27.00, 15.00, '18-45%', 'Withholding Tax: 20%', 'SARS', 3.00, 2.00, 'Mensuelle SARS', 'UIF: 2%, SDL: 1%, WC: variable selon secteur', 'En développement'),

('Algérie', 'Afrique', 'Afrique du Nord', 'DZD', 'Arabe', 'SCF', 'Système Comptable et Financier basé sur les IFRS', 25.00, 19.00, '0-35%', 'TAP: 2%', 'CNAS', 26.00, 9.00, 'Mensuelle', 'Plan de comptes national + consolidation obligatoire', 'En développement'),

('Angola', 'Afrique', 'Afrique Centrale', 'AOA', 'Portugais', 'PGC', 'Plan Général de Comptabilité inspiré des IFRS', 30.00, 14.00, '0-17%', 'Imposto de Selo: 0,2%', 'INSS', 8.00, 3.00, 'Mensuelle', 'Comptes en kwanza obligatoires', 'En développement'),

('Botswana', 'Afrique', 'Afrique Australe', 'BWP', 'Anglais', 'IFRS', 'IFRS pour cotées + BAS + Companies Act 2003', 22.00, 12.00, '0-25%', 'Withholding Tax: 10%', 'Limité', 0.00, 0.00, 'PAYE mensuelle', 'Système de sécurité sociale limité, Workmen''s Compensation uniquement', 'En développement'),

('Égypte', 'Afrique', 'Afrique du Nord', 'EGP', 'Arabe', 'EAS', 'Egyptian Accounting Standards alignées sur IFRS', 22.50, 14.00, '0-25%', 'Stamp Tax: 0,4%', 'NSIA', 18.75, 11.00, 'Mensuelle', 'Loi comptable n°91/2005, audit obligatoire selon seuils', 'En développement'),

('Éthiopie', 'Afrique', 'Afrique de l''Est', 'ETB', 'Amharique', 'EAAS', 'Ethiopian Accounting Standards basées sur IFRS', 30.00, 15.00, '0-35%', 'Excise Tax: variable', 'ESSA', 11.00, 7.00, 'Système récent 2011', 'Commercial Code de 1960 révisé, système social récent', 'PMA'),

('Ghana', 'Afrique', 'Afrique de l''Ouest', 'GHS', 'Anglais', 'IFRS', 'IFRS + GNAS + Companies Act 2019', 25.00, 17.50, '0-25%', 'VAT+NHIL+GETFund: 17,5%', 'SSNIT', 13.00, 5.50, 'Mensuelle', 'TVA composite: 12,5% + NHIL 2,5% + GETFund 2,5%', 'En développement'),

('Kenya', 'Afrique', 'Afrique de l''Est', 'KES', 'Anglais', 'IFRS', 'IFRS + PBES + Companies Act 2015', 30.00, 16.00, '10-30%', 'Withholding Tax: 5-20%', 'NSSF', 0.00, 0.00, 'Mensuelle iTax', 'NSSF + NHIF cotisations variables selon revenus', 'En développement'),

('Maroc', 'Afrique', 'Afrique du Nord', 'MAD', 'Arabe', 'CGNC', 'Code Général de Normalisation Comptable + transition IFRS', 31.00, 20.00, '0-38%', 'CSS: 2,5%', 'CNSS', 20.48, 4.48, 'DAMANCOM mensuelle', 'Loi comptable n°9-88, transition progressive vers IFRS', 'En développement'),

('Nigeria', 'Afrique', 'Afrique de l''Ouest', 'NGN', 'Anglais', 'NAS', 'Nigerian Accounting Standards basées sur IFRS', 30.00, 7.50, '7-24%', 'Education Tax: 2%', 'NSITF', 10.00, 8.00, 'Mensuelle', 'CAMA 2020, Pension Fund: 18% (10% + 8%)', 'En développement'),

('Tunisie', 'Afrique', 'Afrique du Nord', 'TND', 'Arabe', 'SCE', 'Système Comptable des Entreprises basé sur IFRS', 25.00, 19.00, '0-35%', 'TFP: 2%', 'CNSS', 16.57, 9.18, 'Trimestrielle', 'Loi comptable n°96-112, Ordre des Experts Comptables', 'En développement'),

-- AMÉRIQUE DU NORD
('Canada', 'Amérique du Nord', 'Amérique du Nord', 'CAD', 'Anglais/Français', 'IFRS/ASPE', 'IFRS pour publiques + ASPE pour privées', 15.00, 5.00, '15-33%', 'Impôts provinciaux: 0-16%', 'ARC', 8.51, 8.51, 'Mensuelle ARC', 'RPC: 5,95%, AE: 2,56%, taux variables par province', 'Développé'),

('États-Unis', 'Amérique du Nord', 'Amérique du Nord', 'USD', 'Anglais', 'US-GAAP', 'FASB + SEC oversight pour les publiques', 21.00, 0.00, '10-37%', 'State tax: 0-12%, Sales tax: 0-10%', 'IRS', 15.30, 7.65, 'Trimestrielle', 'Social Security: 12,4%, Medicare: 2,9%, FUTA: 6%', 'Développé'),

('Mexique', 'Amérique du Nord', 'Amérique du Nord', 'MXN', 'Espagnol', 'NIF', 'Normas de Información Financiera basées sur IFRS', 30.00, 16.00, '1,92-35%', 'IETU: 17,5%, IDE: 3%', 'IMSS', 25.00, 3.00, 'Mensuelle', 'CINIF oversight, INFONAVIT: 5%', 'En développement'),

-- AMÉRIQUE DU SUD
('Argentine', 'Amérique du Sud', 'Amérique du Sud', 'ARS', 'Espagnol', 'RT', 'Resoluciones Técnicas basées sur IFRS', 35.00, 21.00, '5-35%', 'IBP: 0,5-1,25%, IDC: 0,6%', 'ANSES', 27.00, 17.00, 'Mensuelle', 'FACPCE oversight, Obra Social obligatoire', 'En développement'),

('Brésil', 'Amérique du Sud', 'Amérique du Sud', 'BRL', 'Portugais', 'BR-GAAP', 'CPC convergent vers IFRS + CVM pour cotées', 25.00, 0.00, '0-27,5%', 'CSLL: 9%, ICMS: 7-18%, PIS/COFINS: 3,65-9,25%', 'INSS', 20.00, 8.00, 'Mensuelle', 'FGTS: 8%, diverses contributions (SESI, SENAI, etc.)', 'En développement'),

('Chili', 'Amérique du Sud', 'Amérique du Sud', 'CLP', 'Espagnol', 'IFRS', 'IFRS obligatoires depuis 2009 + SVS oversight', 27.00, 19.00, '0-40%', 'IA: 35%', 'AFP', 0.00, 20.00, 'Mensuelle', 'AFP retraite: ~10%, Salud: 7%, Seguro Cesantía: 3%', 'Développé'),

('Colombie', 'Amérique du Sud', 'Amérique du Sud', 'COP', 'Espagnol', 'NCIF', 'Normas basées sur IFRS - 3 groupes selon taille', 35.00, 19.00, '0-39%', 'ICA: 0,2-1%, RF: variable', 'Multiple', 37.50, 8.00, 'Mensuelle', 'EPS: 12,5%, Pension: 16%, ARL: 0,5-8,7%, SENA/ICBF: 9%', 'En développement'),

-- EUROPE
('France', 'Europe', 'Europe de l''Ouest', 'EUR', 'Français', 'PCG', 'Plan Comptable Général + IFRS pour cotées', 25.00, 20.00, '0-45%', 'CET: 1,5%, C3S: 0,16%', 'URSSAF', 45.00, 23.00, 'Mensuelle DSN', 'ANC oversight, régimes complémentaires complexes', 'Développé'),

('Allemagne', 'Europe', 'Europe de l''Ouest', 'EUR', 'Allemand', 'HGB/IFRS', 'HGB + IFRS pour cotées + BilMoG', 30.00, 19.00, '14-45%', 'Gewerbesteuer: 14%', 'Multiple', 21.00, 21.00, 'Mensuelle', 'Système d''assurance sociale complexe: 42% total', 'Développé'),

('Royaume-Uni', 'Europe', 'Europe de l''Ouest', 'GBP', 'Anglais', 'UK-GAAP/IFRS', 'FRS 102 pour PME + IFRS pour cotées', 25.00, 20.00, '20-45%', 'Business rates', 'HMRC', 13.80, 12.00, 'RTI mensuelle', 'National Insurance Class 1, employeur: 13,8%', 'Développé'),

('Italie', 'Europe', 'Europe du Sud', 'EUR', 'Italien', 'ITA-GAAP/IFRS', 'Codice Civile + IFRS pour cotées', 24.00, 22.00, '23-43%', 'IRAP: 3,9%', 'INPS', 30.00, 9.19, 'Mensuelle', 'Système contributif complexe variant selon secteur', 'Développé'),

('Espagne', 'Europe', 'Europe du Sud', 'EUR', 'Espagnol', 'PGC', 'Plan General de Contabilidad + IFRS pour cotées', 25.00, 21.00, '19-47%', 'IAE selon activité', 'Seguridad Social', 29.90, 6.35, 'Mensuelle', 'Régimes spéciaux selon secteur d''activité', 'Développé'),

-- ASIE
('Chine', 'Asie', 'Asie de l''Est', 'CNY', 'Chinois', 'CAS', 'Chinese Accounting Standards convergent vers IFRS', 25.00, 13.00, '3-45%', 'TVA réformée en 2016', 'Multiple', 37.00, 22.00, 'Mensuelle', 'Système des 5 assurances + 1 fonds', 'En développement'),

('Japon', 'Asie', 'Asie de l''Est', 'JPY', 'Japonais', 'J-GAAP/IFRS', 'J-GAAP + option IFRS pour cotées', 23.20, 10.00, '5-45%', 'Taxe locale: 10%', 'Multiple', 15.00, 15.00, 'Mensuelle', 'Système d''assurances complexe et stratifié', 'Développé'),

('Inde', 'Asie', 'Asie du Sud', 'INR', 'Hindi/Anglais', 'Ind-AS', 'Indian Accounting Standards basées sur IFRS', 30.00, 18.00, '5-30%', 'GST: 18%, Cess: variables', 'EPFO', 12.00, 12.00, 'Mensuelle', 'PF: 12%, ESI: 3,25% pour salaires < 21000', 'En développement'),

('Singapour', 'Asie', 'Asie du Sud-Est', 'SGD', 'Anglais', 'SFRS(I)', 'Singapore FRS identical to IFRS', 17.00, 7.00, '0-22%', 'Property tax', 'CPF', 17.00, 20.00, 'Mensuelle', 'CPF rates vary by age and salary level', 'Développé');

-- =====================================================
-- CRÉATION DES VUES UTILES
-- =====================================================

-- Vue des pays OHADA
CREATE VIEW v_pays_ohada AS
SELECT p.*, 'OHADA' as union_type
FROM pays_systemes p 
WHERE p.region = 'OHADA';

-- Vue des pays africains avec leurs systèmes
CREATE VIEW v_pays_africains AS
SELECT 
    p.pays,
    p.region,
    p.devise,
    p.systeme_comptable,
    p.is_taux,
    p.tva_taux,
    p.cotisations_patronales + p.cotisations_salariales as total_cotisations,
    p.statut_economique
FROM pays_systemes p 
WHERE p.continent = 'Afrique'
ORDER BY p.region, p.pays;

-- Vue des pays utilisant IFRS
CREATE VIEW v_pays_ifrs AS
SELECT 
    p.pays,
    p.continent,
    p.systeme_comptable,
    p.referentiel_detail,
    p.is_taux,
    p.statut_economique
FROM pays_systemes p 
WHERE p.systeme_comptable LIKE '%IFRS%' 
   OR p.referentiel_detail LIKE '%IFRS%';

-- Vue comparative des taux fiscaux
CREATE VIEW v_comparaison_fiscale AS
SELECT 
    p.pays,
    p.continent,
    p.region,
    p.is_taux,
    p.tva_taux,
    CASE 
        WHEN p.is_taux < 20 THEN 'Faible'
        WHEN p.is_taux BETWEEN 20 AND 30 THEN 'Modéré'
        ELSE 'Élevé'
    END as niveau_is,
    CASE 
        WHEN p.tva_taux < 15 THEN 'Faible'
        WHEN p.tva_taux BETWEEN 15 AND 20 THEN 'Modéré'
        ELSE 'Élevé'
    END as niveau_tva
FROM pays_systemes p
ORDER BY p.is_taux DESC;

-- Vue des charges sociales
CREATE VIEW v_charges_sociales AS
SELECT 
    p.pays,
    p.continent,
    p.organisme_social,
    p.cotisations_patronales,
    p.cotisations_salariales,
    p.cotisations_patronales + p.cotisations_salariales as charge_totale,
    p.declaration_sociale,
    CASE 
        WHEN (p.cotisations_patronales + p.cotisations_salariales) < 15 THEN 'Faible'
        WHEN (p.cotisations_patronales + p.cotisations_salariales) BETWEEN 15 AND 30 THEN 'Modéré'
        ELSE 'Élevé'
    END as niveau_charges
FROM pays_systemes p
WHERE p.cotisations_patronales IS NOT NULL 
  AND p.cotisations_salariales IS NOT NULL
ORDER BY charge_totale DESC;

-- =====================================================
-- REQUÊTES D'ANALYSE PRÊTES À L'EMPLOI
-- =====================================================

-- 1. Classement des pays par taux d'IS
-- SELECT pays, is_taux, continent FROM pays_systemes WHERE is_taux > 30 ORDER BY is_taux DESC;

-- 2. Comparaison des taux de TVA par continent
-- SELECT continent, 
--        AVG(tva_taux) as tva_moyenne,
--        MIN(tva_taux) as tva_min,
--        MAX(tva_taux) as tva_max,
--        COUNT(*) as nb_pays
-- FROM pays_systemes 
-- GROUP BY continent 
-- ORDER BY tva_moyenne DESC;

-- 3. Systèmes comptables les plus utilisés
-- SELECT systeme_comptable, 
--        COUNT(*) as nb_pays,
--        ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM pays_systemes), 2) as pourcentage
-- FROM pays_systemes 
-- GROUP BY systeme_comptable 
-- ORDER BY nb_pays DESC;

-- 4. Pays avec les charges sociales les plus élevées
-- SELECT pays, 
--        (cotisations_patronales + cotisations_salariales) as charge_totale,
--        continent,
--        organisme_social
-- FROM pays_systemes 
-- WHERE cotisations_patronales IS NOT NULL 
--   AND cotisations_salariales IS NOT NULL
-- ORDER BY charge_totale DESC LIMIT 10;

-- 5. Analyse par statut économique
-- SELECT statut_economique,
--        COUNT(*) as nb_pays,
--        AVG(is_taux) as is_moyen,
--        AVG(tva_taux) as tva_moyenne,
--        AVG(cotisations_patronales) as charges_patronales_moyenne
-- FROM pays_systemes 
-- GROUP BY statut_economique;

-- =====================================================
-- PROCÉDURES STOCKÉES UTILES
-- =====================================================

DELIMITER //

-- Procédure pour rechercher un pays
CREATE PROCEDURE RechercherPays(IN nom_pays VARCHAR(100))
BEGIN
    SELECT p.*, 
           (p.cotisations_patronales + p.cotisations_salariales) as charge_sociale_totale
    FROM pays_systemes p 
    WHERE p.pays LIKE CONCAT('%', nom_pays, '%');
END //

-- Procédure pour comparer deux pays
CREATE PROCEDURE ComparerPays(IN pays1 VARCHAR(100), IN pays2 VARCHAR(100))
BEGIN
    SELECT 
        'Système Comptable' as critere,
        p1.systeme_comptable as pays_1,
        p2.systeme_comptable as pays_2
    FROM pays_systemes p1, pays_systemes p2
    WHERE p1.pays = pays1 AND p2.pays = pays2
    
    UNION ALL
    
    SELECT 
        'Taux IS (%)',
        CAST(p1.is_taux as CHAR),
        CAST(p2.is_taux as CHAR)
    FROM pays_systemes p1, pays_systemes p2
    WHERE p1.pays = pays1 AND p2.pays = pays2
    
    UNION ALL
    
    SELECT 
        'Taux TVA (%)',
        CAST(p1.tva_taux as CHAR),
        CAST(p2.tva_taux as CHAR)
    FROM pays_systemes p1, pays_systemes p2
    WHERE p1.pays = pays1 AND p2.pays = pays2
    
    UNION ALL
    
    SELECT 
        'Charges Patronales (%)',
        CAST(p1.cotisations_patronales as CHAR),
        CAST(p2.cotisations_patronales as CHAR)
    FROM pays_systemes p1, pays_systemes p2
    WHERE p1.pays = pays1 AND p2.pays = pays2
    
    UNION ALL
    
    SELECT 
        'Charges Salariales (%)',
        CAST(p1.cotisations_salariales as CHAR),
        CAST(p2.cotisations_salariales as CHAR)
    FROM pays_systemes p1, pays_systemes p2
    WHERE p1.pays = pays1 AND p2.pays = pays2;
END //

-- Procédure pour obtenir les statistiques d'un continent
CREATE PROCEDURE StatistiquesContinent(IN nom_continent VARCHAR(50))
BEGIN
    SELECT 
        nom_continent as continent,
        COUNT(*) as nombre_pays,
        ROUND(AVG(is_taux), 2) as is_moyen,
        ROUND(AVG(tva_taux), 2) as tva_moyenne,
        ROUND(AVG(cotisations_patronales), 2) as charges_patronales_moyenne,
        ROUND(AVG(cotisations_salariales), 2) as charges_salariales_moyenne,
        MIN(is_taux) as is_minimum,
        MAX(is_taux) as is_maximum
    FROM pays_systemes 
    WHERE continent = nom_continent;
    
    -- Détail par pays du continent
    SELECT 
        pays,
        region,
        systeme_comptable,
        is_taux,
        tva_taux,
        (cotisations_patronales + cotisations_salariales) as charge_totale
    FROM pays_systemes 
    WHERE continent = nom_continent
    ORDER BY is_taux DESC;
END //

DELIMITER ;

-- =====================================================
-- FONCTIONS UTILES
-- =====================================================

DELIMITER //

-- Fonction pour classer le niveau de fiscalité
CREATE FUNCTION NiveauFiscalite(is_rate DECIMAL(5,2), tva_rate DECIMAL(5,2)) 
RETURNS VARCHAR(20)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE score DECIMAL(5,2);
    SET score = (is_rate + tva_rate) / 2;
    
    CASE
        WHEN score < 20 THEN RETURN 'Faible';
        WHEN score BETWEEN 20 AND 30 THEN RETURN 'Modéré';
        WHEN score BETWEEN 30 AND 40 THEN RETURN 'Élevé';
        ELSE RETURN 'Très Élevé';
    END CASE;
END //

-- Fonction pour calculer la charge sociale totale
CREATE FUNCTION ChargeSocialeTotale(patronales DECIMAL(5,2), salariales DECIMAL(5,2))
RETURNS DECIMAL(5,2)
READS SQL DATA
DETERMINISTIC
BEGIN
    RETURN IFNULL(patronales, 0) + IFNULL(salariales, 0);
END //

DELIMITER ;

-- =====================================================
-- TRIGGERS POUR AUDIT ET VALIDATION
-- =====================================================

-- Table d'audit des modifications
CREATE TABLE audit_pays_systemes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pays VARCHAR(100),
    action_type ENUM('INSERT', 'UPDATE', 'DELETE'),
    ancien_is_taux DECIMAL(5,2),
    nouveau_is_taux DECIMAL(5,2),
    ancien_tva_taux DECIMAL(5,2),
    nouveau_tva_taux DECIMAL(5,2),
    utilisateur VARCHAR(100),
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DELIMITER //

-- Trigger pour auditer les modifications de taux
CREATE TRIGGER audit_taux_fiscaux
AFTER UPDATE ON pays_systemes
FOR EACH ROW
BEGIN
    IF OLD.is_taux != NEW.is_taux OR OLD.tva_taux != NEW.tva_taux THEN
        INSERT INTO audit_pays_systemes (
            pays, action_type, ancien_is_taux, nouveau_is_taux,
            ancien_tva_taux, nouveau_tva_taux, utilisateur
        ) VALUES (
            NEW.pays, 'UPDATE', OLD.is_taux, NEW.is_taux,
            OLD.tva_taux, NEW.tva_taux, USER()
        );
    END IF;
END //

-- Trigger de validation des données
CREATE TRIGGER validation_donnees
BEFORE INSERT ON pays_systemes
FOR EACH ROW
BEGIN
    -- Validation des taux (doivent être positifs et raisonnables)
    IF NEW.is_taux < 0 OR NEW.is_taux > 60 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Taux IS invalide (doit être entre 0 et 60%)';
    END IF;
    
    IF NEW.tva_taux < 0 OR NEW.tva_taux > 30 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Taux TVA invalide (doit être entre 0 et 30%)';
    END IF;
    
    IF NEW.cotisations_patronales < 0 OR NEW.cotisations_patronales > 50 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cotisations patronales invalides (doit être entre 0 et 50%)';
    END IF;
END //

DELIMITER ;

-- =====================================================
-- INDEX POUR OPTIMISATION DES PERFORMANCES
-- =====================================================

-- Index composés pour les requêtes fréquentes
CREATE INDEX idx_continent_region ON pays_systemes(continent, region);
CREATE INDEX idx_taux_fiscaux ON pays_systemes(is_taux, tva_taux);
CREATE INDEX idx_charges_sociales ON pays_systemes(cotisations_patronales, cotisations_salariales);
CREATE INDEX idx_systeme_statut ON pays_systemes(systeme_comptable, statut_economique);

-- Index pour les recherches textuelles
CREATE FULLTEXT INDEX idx_recherche_pays ON pays_systemes(pays, particularites);

-- =====================================================
-- REQUÊTES D'ANALYSE AVANCÉES
-- =====================================================

-- Analyse de corrélation entre développement économique et fiscalité
/*
SELECT 
    statut_economique,
    COUNT(*) as nb_pays,
    AVG(is_taux) as is_moyen,
    AVG(tva_taux) as tva_moyenne,
    AVG(cotisations_patronales + cotisations_salariales) as charges_sociales_moyenne,
    GROUP_CONCAT(DISTINCT systeme_comptable) as systemes_utilises
FROM pays_systemes 
GROUP BY statut_economique
ORDER BY 
    CASE statut_economique 
        WHEN 'Développé' THEN 1 
        WHEN 'En développement' THEN 2 
        WHEN 'PMA' THEN 3 
    END;
*/

-- Analyse de l'harmonisation comptable par région
/*
SELECT 
    region,
    COUNT(*) as nb_pays,
    COUNT(DISTINCT systeme_comptable) as nb_systemes_differents,
    GROUP_CONCAT(DISTINCT systeme_comptable ORDER BY systeme_comptable) as systemes_utilises,
    CASE 
        WHEN COUNT(DISTINCT systeme_comptable) = 1 THEN 'Harmonisé'
        WHEN COUNT(DISTINCT systeme_comptable) <= 3 THEN 'Partiellement harmonisé'
        ELSE 'Non harmonisé'
    END as niveau_harmonisation
FROM pays_systemes 
GROUP BY region
ORDER BY nb_pays DESC;
*/

-- Identification des pays outliers en matière fiscale
/*
WITH stats_fiscales AS (
    SELECT 
        AVG(is_taux) as is_moyen_global,
        STDDEV(is_taux) as is_ecart_type,
        AVG(tva_taux) as tva_moyenne_globale,
        STDDEV(tva_taux) as tva_ecart_type
    FROM pays_systemes
)
SELECT 
    p.pays,
    p.continent,
    p.is_taux,
    p.tva_taux,
    CASE 
        WHEN ABS(p.is_taux - s.is_moyen_global) > 2 * s.is_ecart_type THEN 'IS Atypique'
        WHEN ABS(p.tva_taux - s.tva_moyenne_globale) > 2 * s.tva_ecart_type THEN 'TVA Atypique'
        ELSE 'Normal'
    END as statut_fiscal
FROM pays_systemes p
CROSS JOIN stats_fiscales s
WHERE ABS(p.is_taux - s.is_moyen_global) > 2 * s.is_ecart_type
   OR ABS(p.tva_taux - s.tva_moyenne_globale) > 2 * s.tva_ecart_type
ORDER BY p.is_taux DESC;
*/

-- =====================================================
-- SCRIPTS DE MAINTENANCE
-- =====================================================

-- Vérification de la cohérence des données
/*
-- Pays sans système social défini
SELECT pays, continent FROM pays_systemes 
WHERE organisme_social IS NULL OR organisme_social = '';

-- Pays avec des taux suspects
SELECT pays, is_taux, tva_taux FROM pays_systemes 
WHERE is_taux = 0 OR tva_taux = 0;

-- Vérification des doublons
SELECT pays, COUNT(*) FROM pays_systemes 
GROUP BY pays HAVING COUNT(*) > 1;
*/

-- Script de mise à jour des taux (exemple)
/*
-- Mise à jour des taux français (exemple)
UPDATE pays_systemes 
SET is_taux = 25.0, 
    tva_taux = 20.0,
    date_modification = CURRENT_TIMESTAMP
WHERE pays = 'France';
*/

-- =====================================================
-- SAUVEGARDE ET RESTAURATION
-- =====================================================

-- Commande de sauvegarde (à exécuter depuis la ligne de commande)
-- mysqldump -u username -p systemes_comptables_mondiaux > sauvegarde_systemes_comptables.sql

-- Commande de restauration
-- mysql -u username -p systemes_comptables_mondiaux < sauvegarde_systemes_comptables.sql

-- =====================================================
-- UTILISATEURS ET PERMISSIONS
-- =====================================================

-- Création des utilisateurs (décommentez si nécessaire)
/*
-- Utilisateur en lecture seule pour les consultations
CREATE USER 'lecteur_comptable'@'%' IDENTIFIED BY 'motdepasse_securise';
GRANT SELECT ON systemes_comptables_mondiaux.* TO 'lecteur_comptable'@'%';

-- Utilisateur pour les mises à jour
CREATE USER 'admin_comptable'@'%' IDENTIFIED BY 'motdepasse_admin_securise';
GRANT SELECT, INSERT, UPDATE, DELETE ON systemes_comptables_mondiaux.* TO 'admin_comptable'@'%';

-- Application des privilèges
FLUSH PRIVILEGES;
*/

-- =====================================================
-- NOTES D'UTILISATION
-- =====================================================

/*
UTILISATION DE LA BASE DE DONNÉES :

1. REQUÊTES DE BASE :
   - Rechercher un pays : SELECT * FROM pays_systemes WHERE pays = 'France';
   - Lister par continent : SELECT * FROM pays_systemes WHERE continent = 'Afrique';
   - Pays OHADA : SELECT * FROM v_pays_ohada;

2. ANALYSES COMPARATIVES :
   - CALL ComparerPays('France', 'Allemagne');
   - CALL StatistiquesContinent('Europe');

3. REQUÊTES ANALYTIQUES :
   - SELECT * FROM v_comparaison_fiscale WHERE niveau_is = 'Élevé';
   - SELECT * FROM v_charges_sociales ORDER BY charge_totale DESC;

4. MAINTENANCE :
   - Vérifier les audits : SELECT * FROM audit_pays_systemes ORDER BY date_modification DESC;
   - Rechercher par texte : SELECT * FROM pays_systemes WHERE MATCH(pays, particularites) AGAINST('IFRS');

5. MISES À JOUR :
   - Toujours utiliser des transactions pour les modifications importantes
   - Les triggers d'audit enregistrent automatiquement les changements
   - Valider les données avec les contraintes définies

PERFORMANCE :
- Les index sont optimisés pour les requêtes fréquentes
- Utiliser EXPLAIN pour analyser les performances des requêtes complexes
- Les vues matérialisées peuvent être créées pour les analyses récurrentes

SÉCURITÉ :
- Utiliser des comptes avec permissions limitées en production
- Chiffrer les connexions (SSL/TLS)
- Sauvegarder régulièrement la base de données
*/

-- =====================================================
-- FIN DU SCRIPT
-- Base de données prête à l'utilisation !
-- =====================================================