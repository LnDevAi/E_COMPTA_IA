#!/bin/bash

# =====================================================
# SCRIPT D'OPTIMISATION DE DOCUMENTS E-COMPTA-IA
# Réduction automatique de la taille des fichiers
# =====================================================

echo "🚀 OPTIMISATION DOCUMENTS E-COMPTA-IA"
echo "======================================"

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
MAX_SIZE_MB=50
KNOWLEDGE_DIR="src/app/modules/assistant-ia/knowledge"
TEMP_DIR="/tmp/ecompta-optimization"
BACKUP_DIR="$KNOWLEDGE_DIR/backups"

# Créer les dossiers nécessaires
mkdir -p "$TEMP_DIR"
mkdir -p "$BACKUP_DIR"

echo -e "${BLUE}📁 Recherche de gros fichiers (> ${MAX_SIZE_MB}MB)...${NC}"

# Fonction pour optimiser les PDF
optimize_pdf() {
    local input_file="$1"
    local output_file="$2"
    local original_size=$(du -m "$input_file" | cut -f1)
    
    echo -e "${YELLOW}📄 Optimisation PDF: $(basename "$input_file")${NC}"
    
    # Méthode 1 : Ghostscript (si disponible)
    if command -v gs &> /dev/null; then
        gs -sDEVICE=pdfwrite \
           -dCompatibilityLevel=1.4 \
           -dPDFSETTINGS=/ebook \
           -dNOPAUSE -dQUIET -dBATCH \
           -dColorImageResolution=150 \
           -dGrayImageResolution=150 \
           -dMonoImageResolution=150 \
           -sOutputFile="$output_file" \
           "$input_file"
    
    # Méthode 2 : qpdf (si disponible)
    elif command -v qpdf &> /dev/null; then
        qpdf --linearize --object-streams=generate "$input_file" "$output_file"
    
    # Méthode 3 : Copie simple si pas d'outils
    else
        cp "$input_file" "$output_file"
        echo -e "${RED}⚠️  Outils d'optimisation PDF non trouvés${NC}"
    fi
    
    local new_size=$(du -m "$output_file" | cut -f1)
    local reduction=$((original_size - new_size))
    
    echo -e "${GREEN}✅ Taille réduite: ${original_size}MB → ${new_size}MB (-${reduction}MB)${NC}"
}

# Fonction pour optimiser les images
optimize_image() {
    local input_file="$1"
    local output_file="$2"
    local original_size=$(du -m "$input_file" | cut -f1)
    
    echo -e "${YELLOW}🖼️  Optimisation image: $(basename "$input_file")${NC}"
    
    # ImageMagick (si disponible)
    if command -v convert &> /dev/null; then
        convert "$input_file" \
                -quality 80 \
                -resize '2048x2048>' \
                -strip \
                "$output_file"
    else
        cp "$input_file" "$output_file"
        echo -e "${RED}⚠️  ImageMagick non trouvé${NC}"
    fi
    
    local new_size=$(du -m "$output_file" | cut -f1)
    local reduction=$((original_size - new_size))
    
    echo -e "${GREEN}✅ Taille réduite: ${original_size}MB → ${new_size}MB (-${reduction}MB)${NC}"
}

# Fonction pour diviser un gros document
split_document() {
    local input_file="$1"
    local base_name=$(basename "$input_file" .pdf)
    local dir_name=$(dirname "$input_file")
    
    echo -e "${YELLOW}✂️  Division du document: $(basename "$input_file")${NC}"
    
    # Créer un dossier pour les parties
    local split_dir="$dir_name/${base_name}_parties"
    mkdir -p "$split_dir"
    
    # Diviser le PDF (si pdftk disponible)
    if command -v pdftk &> /dev/null; then
        # Obtenir le nombre de pages
        local pages=$(pdftk "$input_file" dump_data | grep NumberOfPages | cut -d' ' -f2)
        local pages_per_part=50
        local current_page=1
        local part=1
        
        while [ $current_page -le $pages ]; do
            local end_page=$((current_page + pages_per_part - 1))
            if [ $end_page -gt $pages ]; then
                end_page=$pages
            fi
            
            local output_part="$split_dir/${base_name}_partie${part}.pdf"
            pdftk "$input_file" cat ${current_page}-${end_page} output "$output_part"
            
            echo -e "${GREEN}📑 Créé: $(basename "$output_part") (pages ${current_page}-${end_page})${NC}"
            
            current_page=$((end_page + 1))
            part=$((part + 1))
        done
        
        # Créer un fichier index
        cat > "$split_dir/README.md" << EOF
# Document Divisé: $base_name

Ce document a été automatiquement divisé en plusieurs parties pour faciliter l'upload.

## Parties créées:
EOF
        
        for part_file in "$split_dir"/*.pdf; do
            if [ -f "$part_file" ]; then
                echo "- $(basename "$part_file")" >> "$split_dir/README.md"
            fi
        done
        
        echo -e "${GREEN}✅ Document divisé en $((part-1)) parties dans: $split_dir${NC}"
    else
        echo -e "${RED}⚠️  pdftk non disponible pour la division${NC}"
    fi
}

# Fonction pour créer une version texte extractée
extract_text() {
    local input_file="$1"
    local output_file="${input_file%.*}_extracted_text.txt"
    
    echo -e "${YELLOW}📝 Extraction de texte: $(basename "$input_file")${NC}"
    
    # pdftotext (si disponible)
    if command -v pdftotext &> /dev/null; then
        pdftotext "$input_file" "$output_file"
        echo -e "${GREEN}✅ Texte extrait: $(basename "$output_file")${NC}"
        
        # Créer les métadonnées pour le fichier texte
        cat > "${output_file}.meta.json" << EOF
{
  "titre": "Texte extrait de $(basename "$input_file")",
  "categorie": "technique",
  "domaine": "extracted_content",
  "dateExtraction": "$(date -Iseconds)",
  "fichierOriginal": "$(basename "$input_file")",
  "note": "Contenu textuel extrait automatiquement pour optimisation IA"
}
EOF
    else
        echo -e "${RED}⚠️  pdftotext non disponible${NC}"
    fi
}

# Rechercher et traiter les gros fichiers
find "$KNOWLEDGE_DIR" -type f -size +${MAX_SIZE_MB}M | while read -r file; do
    echo -e "\n${BLUE}🔍 Fichier volumineux trouvé: $(basename "$file")${NC}"
    
    # Créer une sauvegarde
    backup_file="$BACKUP_DIR/$(basename "$file").backup.$(date +%Y%m%d_%H%M%S)"
    cp "$file" "$backup_file"
    echo -e "${GREEN}💾 Sauvegarde créée: $(basename "$backup_file")${NC}"
    
    # Déterminer le type de fichier et optimiser
    case "${file##*.}" in
        pdf)
            # Option 1: Optimiser
            optimized_file="$TEMP_DIR/$(basename "$file")"
            optimize_pdf "$file" "$optimized_file"
            
            # Si toujours trop gros, diviser
            if [ $(du -m "$optimized_file" | cut -f1) -gt $MAX_SIZE_MB ]; then
                split_document "$file"
            else
                mv "$optimized_file" "$file"
            fi
            
            # Extraire le texte pour l'IA
            extract_text "$file"
            ;;
        
        jpg|jpeg|png|bmp|tiff)
            optimized_file="$TEMP_DIR/$(basename "$file")"
            optimize_image "$file" "$optimized_file"
            mv "$optimized_file" "$file"
            ;;
        
        docx|doc)
            echo -e "${YELLOW}📄 Document Word détecté. Conversion en PDF recommandée.${NC}"
            # Si libreoffice disponible
            if command -v libreoffice &> /dev/null; then
                libreoffice --headless --convert-to pdf --outdir "$(dirname "$file")" "$file"
                echo -e "${GREEN}✅ Converti en PDF${NC}"
            fi
            ;;
        
        *)
            echo -e "${YELLOW}⚠️  Type de fichier non supporté pour l'optimisation: ${file##*.}${NC}"
            ;;
    esac
done

# Nettoyage
rm -rf "$TEMP_DIR"

echo -e "\n${GREEN}🎉 OPTIMISATION TERMINÉE !${NC}"
echo -e "${BLUE}📊 Résumé:${NC}"
echo -e "   💾 Sauvegardes dans: $BACKUP_DIR"
echo -e "   📝 Fichiers texte extraits pour l'IA"
echo -e "   ✂️  Gros documents divisés si nécessaire"

echo -e "\n${YELLOW}💡 CONSEILS:${NC}"
echo -e "   1. Vérifiez les fichiers optimisés"
echo -e "   2. Testez l'upload des nouvelles versions"
echo -e "   3. Les sauvegardes sont conservées"
echo -e "   4. Les fichiers texte aident l'IA même sans PDF"