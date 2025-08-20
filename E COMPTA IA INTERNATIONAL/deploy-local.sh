#!/usr/bin/env bash
set -euo pipefail

# ===================================================
# DEPLOIEMENT LOCAL - E COMPTA IA INTERNATIONAL
# Orchestration locale via Docker Compose (backend Java + Nginx)
# ===================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $*"; }
log_ok()   { echo -e "${GREEN}[OK]${NC}   $*"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $*"; }
log_err()  { echo -e "${RED}[ERR]${NC}  $*"; }

script_dir="$(cd "$(dirname "$0")" && pwd)"
vps_dir="${script_dir}/vps"
frontend_dir="${script_dir}/frontend"
backend_dir="${script_dir}/backend-java"

# Detect docker compose command
compose_cmd() {
  if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
    echo "docker compose"
  elif command -v docker-compose >/dev/null 2>&1; then
    echo "docker-compose"
  else
    return 1
  fi
}

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    log_err "Commande requise manquante: $1"
    exit 1
  fi
}

check_prereqs() {
  log_info "Vérification des prérequis..."
  require_cmd docker
  compose_cmd >/dev/null || { log_err "Docker Compose n'est pas disponible (docker compose ou docker-compose)"; exit 1; }
  require_cmd mvn
  require_cmd npm
  log_ok "Prérequis OK"
}

build_frontend() {
  log_info "Build frontend Angular..."
  cd "${frontend_dir}"
  npm ci
  npm run build
  cd - >/dev/null

  # Copier le build vers le répertoire servi par Nginx dans le compose VPS
  local target_dir="${vps_dir}/frontend/e-compta-ia"
  mkdir -p "${target_dir}"
  rm -rf "${target_dir}"/*
  cp -R "${frontend_dir}/dist/e-compta-ia/"* "${target_dir}/"
  log_ok "Frontend prêt dans ${target_dir}"
}

verify_backend_compiles() {
  log_info "Vérification du backend Java (compilation rapide sans tests)..."
  cd "${backend_dir}"
  mvn -q -DskipTests package
  cd - >/dev/null
  log_ok "Backend Java compilé (JAR prêt pour le build Docker)"
}

prepare_env() {
  log_info "Préparation de l'environnement (.env ports)..."
  cd "${vps_dir}"
  chmod +x ./setup.sh || true
  ./setup.sh
  cd - >/dev/null
}

do_up() {
  build_frontend
  verify_backend_compiles
  prepare_env
  local dc
  dc="$(compose_cmd)"
  log_info "Démarrage des services (mode détaché)..."
  cd "${vps_dir}"
  ${dc} up -d --build
  cd - >/dev/null
  log_ok "Services démarrés"
  show_urls || true
}

do_down() {
  local dc
  dc="$(compose_cmd)"
  cd "${vps_dir}"
  ${dc} down
  cd - >/dev/null
  log_ok "Services arrêtés"
}

do_restart() {
  do_down
  do_up
}

do_logs() {
  local dc
  dc="$(compose_cmd)"
  cd "${vps_dir}"
  ${dc} logs -f --tail=200
}

do_ps() {
  local dc
  dc="$(compose_cmd)"
  cd "${vps_dir}"
  ${dc} ps
}

do_rebuild() {
  build_frontend
  verify_backend_compiles
  local dc
  dc="$(compose_cmd)"
  cd "${vps_dir}"
  ${dc} build --no-cache
  ${dc} up -d
  cd - >/dev/null
  log_ok "Rebuild terminé"
}

do_clean() {
  local dc
  dc="$(compose_cmd)"
  cd "${vps_dir}"
  ${dc} down -v || true
  cd - >/dev/null
  log_info "Nettoyage des artefacts..."
  rm -rf "${vps_dir}/frontend/e-compta-ia"/* || true
  docker image prune -f || true
  log_ok "Nettoyage terminé"
}

show_urls() {
  if [ -f "${vps_dir}/.env" ]; then
    # shellcheck disable=SC1090
    set -a; . "${vps_dir}/.env"; set +a || true
  fi
  local api_port="${ECOMPTA_API_PORT:-8080}"
  local web_port="${ECOMPTA_WEB_PORT:-80}"
  echo ""
  echo "Endpoints locaux:"
  echo "  Web:     http://localhost:${web_port}/"
  echo "  Swagger: http://localhost:${web_port}/swagger-ui/"
  echo "  API:     http://localhost:${api_port}/api/health"
}

usage() {
  cat <<EOF
Usage: $(basename "$0") <commande>

Commandes:
  up         Build frontend + compose up -d
  down       Arrêt des conteneurs
  restart    Redémarrage
  logs       Suivi des logs
  ps         Statut des services
  rebuild    Rebuild complet des images et redémarrage
  clean      Arrêt + suppression volumes + prune images orphelines
  urls       Affiche les URLs locales
  help       Cette aide

Exemples:
  $(basename "$0") up
  $(basename "$0") logs
  $(basename "$0") clean
EOF
}

main() {
  local cmd="${1:-help}"
  case "$cmd" in
    up)
      check_prereqs
      do_up
      ;;
    down)
      check_prereqs
      do_down
      ;;
    restart)
      check_prereqs
      do_restart
      ;;
    logs)
      check_prereqs
      do_logs
      ;;
    ps|status)
      check_prereqs
      do_ps
      ;;
    rebuild)
      check_prereqs
      do_rebuild
      ;;
    clean)
      check_prereqs
      do_clean
      ;;
    urls)
      show_urls
      ;;
    help|*)
      usage
      ;;
  esac
}

main "$@"

