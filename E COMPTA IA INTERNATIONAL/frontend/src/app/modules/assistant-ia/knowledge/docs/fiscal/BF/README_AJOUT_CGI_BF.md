# 📋 GUIDE : AJOUTER LE CODE GÉNÉRAL DES IMPÔTS BURKINA FASO 2024

## 🎯 **EMPLACEMENT EXACT**

```
📂 DOSSIER DE DESTINATION :
src/app/modules/assistant-ia/knowledge/docs/fiscal/BF/

📝 FICHIER À CRÉER :
REGL_BF_FISCAL_20240101_CGI_Complet.pdf
```

---

## 📏 **ÉTAPE 1 : VÉRIFIER LA TAILLE**

### 🔍 **Si votre document est :**

#### ✅ **< 50 MB**
- **Action** : Upload direct ✅
- **Aucune** modification nécessaire

#### ⚠️ **50-100 MB** 
- **Action** : Compression recommandée
- **Outil** : https://smallpdf.com/fr/compresser-pdf
- **Objectif** : Réduire à < 50 MB

#### ❌ **> 100 MB**
- **Action** : Division obligatoire
- **Stratégie** : Diviser par livres du code
- **Outil** : https://smallpdf.com/fr/diviser-pdf

---

## ✂️ **ÉTAPE 2 : DIVISION RECOMMANDÉE (si nécessaire)**

### 📚 **STRUCTURE TYPIQUE CODE BURKINA FASO :**

```
🗂️ Division suggérée :
├── REGL_BF_FISCAL_2024_Livre1_Revenus.pdf       (Livre I)
├── REGL_BF_FISCAL_2024_Livre2_ChiffreAffaires.pdf (Livre II)  
├── REGL_BF_FISCAL_2024_Livre3_AutresImpots.pdf   (Livre III)
├── REGL_BF_FISCAL_2024_Livre4_Procedures.pdf     (Livre IV)
├── REGL_BF_FISCAL_2024_Livre5_Contentieux.pdf    (Livre V)
└── REGL_BF_FISCAL_2024_Index_Complet.pdf         (Index)
```

### 📋 **CONTENU PAR LIVRE :**

**📖 LIVRE I - REVENUS :**
- Impôt sur les Traitements et Salaires (ITS)
- Impôt sur les Bénéfices (IBIC/IBNC)
- Retenues à la source
- Déclarations et paiements

**📖 LIVRE II - CHIFFRE D'AFFAIRES :**
- Taxe sur la Valeur Ajoutée (TVA)
- Taxe Spécifique sur certains Produits (TSP)
- Contribution du Secteur Informel (CSI)
- Régimes TVA

**📖 LIVRE III - AUTRES IMPÔTS :**
- Impôts fonciers
- Droits d'enregistrement
- Taxes diverses
- Contributions spéciales

**📖 LIVRE IV - PROCÉDURES :**
- Contrôles fiscaux
- Vérifications comptables
- Procédures de redressement
- Recours et réclamations

**📖 LIVRE V - CONTENTIEUX :**
- Sanctions fiscales
- Pénalités
- Procédures judiciaires
- Prescription

---

## 🏷️ **ÉTAPE 3 : NOMMER LES FICHIERS**

### 📝 **NOMS STANDARDISÉS :**

```
DOCUMENT COMPLET :
✅ REGL_BF_FISCAL_20240101_CGI_Complet.pdf

DOCUMENTS DIVISÉS :
✅ REGL_BF_FISCAL_20240101_CGI_Livre1_Revenus.pdf
✅ REGL_BF_FISCAL_20240101_CGI_Livre2_ChiffreAffaires.pdf  
✅ REGL_BF_FISCAL_20240101_CGI_Livre3_AutresImpots.pdf
✅ REGL_BF_FISCAL_20240101_CGI_Livre4_Procedures.pdf
✅ REGL_BF_FISCAL_20240101_CGI_Livre5_Contentieux.pdf
✅ REGL_BF_FISCAL_20240101_CGI_Index.pdf
```

---

## 🏷️ **ÉTAPE 4 : CRÉER LES MÉTADONNÉES**

### 📄 **POUR CHAQUE FICHIER, CRÉER UN .meta.json**

**EXEMPLE :**
```
Fichier : REGL_BF_FISCAL_20240101_CGI_Livre1_Revenus.pdf
Métadonnées : REGL_BF_FISCAL_20240101_CGI_Livre1_Revenus.pdf.meta.json
```

### 📋 **CONTENU MÉTADONNÉES LIVRE 1 :**

```json
{
  "titre": "Code Général des Impôts BF 2024 - Livre I Revenus",
  "categorie": "reglementaire",
  "domaine": "fiscal",
  "pays": ["BF"],
  "datePublication": "2024-01-01",
  "source": "Direction Générale des Impôts - Burkina Faso",
  "fiabilite": "officielle",
  "version": "2024.1_livre1",
  
  "mots_cles": [
    "burkina faso", "impot revenus", "ITS", "IBIC", "IBNC", 
    "traitements salaires", "benefices", "retenues source"
  ],
  
  "resume": "Livre I du CGI Burkina Faso 2024 - Impôts sur les revenus et bénéfices",
  
  "contenu_specifique": {
    "chapitre_1": "Impôt sur les Traitements et Salaires",
    "chapitre_2": "Impôt sur les Bénéfices Industriels et Commerciaux",  
    "chapitre_3": "Impôt sur les Bénéfices Non Commerciaux",
    "chapitre_4": "Retenues à la source",
    "chapitre_5": "Modalités déclaratives"
  },
  
  "document_complet": "REGL_BF_FISCAL_20240101_CGI_Complet.pdf",
  "parties_liees": [
    "REGL_BF_FISCAL_20240101_CGI_Livre2_ChiffreAffaires.pdf",
    "REGL_BF_FISCAL_20240101_CGI_Livre4_Procedures.pdf"
  ]
}
```

---

## 📤 **ÉTAPE 5 : UPLOAD**

### 📂 **PROCÉDURE :**

1. **📁 Naviguer vers :**
   ```
   src/app/modules/assistant-ia/knowledge/docs/fiscal/BF/
   ```

2. **📤 Glisser-déposer :**
   - Le(s) fichier(s) PDF optimisé(s)
   - Le(s) fichier(s) .meta.json correspondant(s)

3. **✅ Vérifier :**
   - Noms corrects
   - Tailles < 50 MB
   - Métadonnées présentes

---

## 🎯 **RÉSULTAT ATTENDU**

### 📂 **STRUCTURE FINALE :**

```
src/app/modules/assistant-ia/knowledge/docs/fiscal/BF/
├── 📄 REGL_BF_FISCAL_20240101_CGI_Livre1_Revenus.pdf
├── 📄 REGL_BF_FISCAL_20240101_CGI_Livre1_Revenus.pdf.meta.json
├── 📄 REGL_BF_FISCAL_20240101_CGI_Livre2_ChiffreAffaires.pdf  
├── 📄 REGL_BF_FISCAL_20240101_CGI_Livre2_ChiffreAffaires.pdf.meta.json
├── 📄 REGL_BF_FISCAL_20240101_CGI_Livre3_AutresImpots.pdf
├── 📄 REGL_BF_FISCAL_20240101_CGI_Livre3_AutresImpots.pdf.meta.json
├── 📄 REGL_BF_FISCAL_20240101_CGI_Livre4_Procedures.pdf
├── 📄 REGL_BF_FISCAL_20240101_CGI_Livre4_Procedures.pdf.meta.json
├── 📄 REGL_BF_FISCAL_20240101_CGI_Livre5_Contentieux.pdf
├── 📄 REGL_BF_FISCAL_20240101_CGI_Livre5_Contentieux.pdf.meta.json
├── 📄 REGL_BF_FISCAL_20240101_CGI_Index.pdf
├── 📄 REGL_BF_FISCAL_20240101_CGI_Index.pdf.meta.json
└── 📋 README_AJOUT_CGI_BF.md (ce guide)
```

---

## 🤖 **UTILISATION PAR L'IA**

### ✅ **L'IA POURRA RÉPONDRE À :**

❓ "Quel est le taux d'impôt sur les sociétés au Burkina Faso ?"  
✅ **Réponse** : 27,5% (taux normal) ou 25% (PME)

❓ "Comment calculer la TVA au Burkina Faso ?"  
✅ **Réponse** : Taux normal 18%, taux réduit 9%

❓ "Quelles sont les procédures de contrôle fiscal au BF ?"  
✅ **Réponse** : Livre IV - Procédures détaillées

❓ "Barème ITS Burkina Faso 2024 ?"  
✅ **Réponse** : Barème progressif jusqu'à 30%

### 🎯 **COMPARAISONS AUTOMATIQUES :**
- BF vs CI (Côte d'Ivoire)
- BF vs autres pays OHADA  
- Évolution 2023 → 2024

---

## 📞 **SUPPORT**

### 🆘 **EN CAS DE PROBLÈME :**

- **📋 Fichier trop volumineux** → Voir `GUIDE_OPTIMISATION_DOCUMENTS.md`
- **📝 Erreur de nomenclature** → Suivre format exact ci-dessus
- **🏷️ Métadonnées manquantes** → Utiliser templates fournis
- **🤖 IA ne trouve pas** → Vérifier mots-clés dans métadonnées

### 📧 **CONTACT :**
- **Support technique** : support@e-compta-ia.com
- **Questions fiscales** : experts@e-compta-ia.com

---

## ✅ **CHECKLIST FINALE**

```
□ Document compressé si > 50 MB ?
□ Divisé par livres si nécessaire ?
□ Noms conformes à la nomenclature ?
□ Fichiers .meta.json créés ?
□ Mots-clés pertinents inclus ?
□ Upload dans dossier BF/ ?
□ Test de recherche IA effectué ?
```

**🎯 Si tous les ✅ sont cochés → VOTRE CGI BURKINA FASO EST PRÊT !**

---

*Guide créé spécialement pour le Code Général des Impôts Burkina Faso 2024*  
*Dernière mise à jour : Mars 2024*