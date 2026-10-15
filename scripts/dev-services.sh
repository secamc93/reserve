#!/usr/bin/env bash
# dev-services.sh — servicios de desarrollo de Rupü en tmux (bash y zsh).
#
# Cada servicio corre en una ventana de la sesión tmux del checkout:
#   repo principal  -> sesión "rupu"
#   worktree        -> sesión "rupu-<nombre>", con sus propios puertos
# Los puertos salen del .env de cada checkout (HTTP_PORT del back, PORT del front),
# así que varios worktrees pueden correr a la vez sin pisarse.
# La infraestructura Docker (Postgres local) es una sola y la comparten todos.
#
# Solo toca procesos de ESTE checkout: nunca mata procesos de otros proyectos.
#
# Uso: ./scripts/dev-services.sh <comando> [servicio]
#   start   infra|backend|frontend|all
#   stop    infra|backend|frontend|all     (infra solo desde el repo principal)
#   restart backend|frontend|all
#   status                                  estado, puertos y sesión
#   logs    backend|frontend [N]            últimas N líneas (100 por defecto)
#   health                                  health check HTTP
#   attach                                  entrar a la sesión tmux
#   kill-zombies                            procesos huérfanos de ESTE checkout en sus puertos

set -eo pipefail

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BACKEND_DIR="$PROJECT_ROOT/back/central-reserve"
FRONTEND_DIR="$PROJECT_ROOT/front/rupu-central"
BACKEND_ENV="$BACKEND_DIR/.env"
FRONTEND_ENV="$FRONTEND_DIR/.env.local"
COMPOSE_FILE="$PROJECT_ROOT/infra/compose-local/docker-compose.yml"
PG_CONTAINER="rupu_postgres_local"
PG_VOLUME="rupu_pg_local"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
CYAN='\033[0;36m'
NC='\033[0m'

is_worktree() {
    local gd cm
    gd="$(git -C "$PROJECT_ROOT" rev-parse --git-dir 2>/dev/null || true)"
    cm="$(git -C "$PROJECT_ROOT" rev-parse --git-common-dir 2>/dev/null || true)"
    [ -n "$gd" ] && [ "$(cd "$PROJECT_ROOT" && realpath "$gd")" != "$(cd "$PROJECT_ROOT" && realpath "$cm")" ]
}

if is_worktree; then
    TMUX_SESSION="rupu-$(basename "$PROJECT_ROOT")"
else
    TMUX_SESSION="rupu"
fi
LOG_DIR="/tmp/rupu-logs/$TMUX_SESSION"
mkdir -p "$LOG_DIR"

env_value() {
    local file="$1" key="$2" default="$3" v=""
    [ -f "$file" ] && v="$(grep -E "^${key}=" "$file" | tail -1 | cut -d= -f2- | tr -d "\"'")"
    echo "${v:-$default}"
}

compose() {
    if docker compose version >/dev/null 2>&1; then
        docker compose -f "$COMPOSE_FILE" "$@"
    else
        docker-compose -f "$COMPOSE_FILE" "$@"
    fi
}

svc_dir() {
    case "$1" in
        backend) echo "$BACKEND_DIR" ;;
        frontend) echo "$FRONTEND_DIR" ;;
    esac
}

svc_port() {
    case "$1" in
        backend) env_value "$BACKEND_ENV" HTTP_PORT 3050 ;;
        frontend) env_value "$FRONTEND_ENV" PORT 3000 ;;
    esac
}

svc_cmd() {
    case "$1" in
        backend) echo "go run ./cmd/main.go" ;;
        frontend) echo "pnpm dev -p $(svc_port frontend)" ;;
    esac
}

svc_health_url() {
    case "$1" in
        backend) echo "http://127.0.0.1:$(svc_port backend)/health" ;;
        frontend) echo "http://127.0.0.1:$(svc_port frontend)/login" ;;
    esac
}

window_exists() {
    tmux has-session -t "=$TMUX_SESSION" 2>/dev/null &&
        tmux list-windows -t "=$TMUX_SESSION" -F '#{window_name}' | grep -qx "$1"
}

# PIDs escuchando en un puerto (vacío si ninguno).
port_pids() {
    ss -ltnp 2>/dev/null | awk -v p=":$1" '$4 ~ p"$"' | grep -oE 'pid=[0-9]+' | cut -d= -f2 | sort -u
}

# ¿El proceso pertenece a este checkout? (su cwd está dentro de PROJECT_ROOT)
pid_in_checkout() {
    local cwd
    cwd="$(readlink -f "/proc/$1/cwd" 2>/dev/null || true)"
    [ -n "$cwd" ] && case "$cwd/" in "$PROJECT_ROOT"/*) return 0 ;; esac
    return 1
}

# Un puerto lo ocupa otro checkout u otro proyecto: no se toca, se avisa.
port_busy_by_other() {
    local pid
    for pid in $(port_pids "$1"); do
        pid_in_checkout "$pid" || return 0
    done
    return 1
}

start_infra() {
    if is_worktree; then
        echo -e "${YELLOW}[infra]${NC} la infraestructura es compartida: se maneja desde el repo principal."
        return 0
    fi
    if docker ps --format '{{.Names}}' | grep -qx "$PG_CONTAINER"; then
        echo -e "${GREEN}[infra]${NC} $PG_CONTAINER ya está arriba (127.0.0.1:5435)"
        return 0
    fi
    docker volume inspect "$PG_VOLUME" >/dev/null 2>&1 || docker volume create "$PG_VOLUME" >/dev/null
    if docker ps -a --format '{{.Names}}' | grep -qx "$PG_CONTAINER"; then
        docker start "$PG_CONTAINER" >/dev/null
    else
        compose up -d postgres
    fi
    echo -e "${GREEN}[infra]${NC} $PG_CONTAINER arriba en 127.0.0.1:5435"
}

stop_infra() {
    if is_worktree; then
        echo -e "${YELLOW}[infra]${NC} la infraestructura se detiene solo desde el repo principal."
        return 0
    fi
    docker stop "$PG_CONTAINER" >/dev/null 2>&1 && echo -e "${GREEN}[infra]${NC} $PG_CONTAINER detenido" || true
}

start_service() {
    local svc="$1" port dir
    port="$(svc_port "$svc")"
    dir="$(svc_dir "$svc")"
    if window_exists "$svc"; then
        echo -e "${YELLOW}[$svc]${NC} ya corre en la sesión $TMUX_SESSION (puerto $port)"
        return 0
    fi
    if port_busy_by_other "$port"; then
        echo -e "${RED}[$svc]${NC} el puerto $port lo usa otro checkout u otro proyecto. No se toca nada:"
        echo "        cambia el puerto en $( [ "$svc" = backend ] && echo "$BACKEND_ENV (HTTP_PORT)" || echo "$FRONTEND_ENV (PORT)" )"
        return 1
    fi
    if ! tmux has-session -t "=$TMUX_SESSION" 2>/dev/null; then
        tmux new-session -d -s "$TMUX_SESSION" -n "$svc" -c "$dir"
    else
        tmux new-window -t "=$TMUX_SESSION" -n "$svc" -c "$dir"
    fi
    : > "$LOG_DIR/$svc.log"
    tmux pipe-pane -t "=$TMUX_SESSION:$svc" -o "cat >> '$LOG_DIR/$svc.log'"
    tmux send-keys -t "=$TMUX_SESSION:$svc" "$(svc_cmd "$svc")" C-m
    echo -e "${GREEN}[$svc]${NC} iniciado en tmux $TMUX_SESSION:$svc -> puerto $port (logs: $0 logs $svc)"
}

stop_service() {
    local svc="$1" port pid
    port="$(svc_port "$svc")"
    if window_exists "$svc"; then
        tmux send-keys -t "=$TMUX_SESSION:$svc" C-c
        sleep 2
        tmux kill-window -t "=$TMUX_SESSION:$svc" 2>/dev/null || true
    fi
    # go run / next dejan hijos: matar solo los de ESTE checkout que sigan en el puerto.
    for pid in $(port_pids "$port"); do
        pid_in_checkout "$pid" && kill "$pid" 2>/dev/null || true
    done
    echo -e "${GREEN}[$svc]${NC} detenido"
}

wait_healthy() {
    local svc="$1" url i
    url="$(svc_health_url "$svc")"
    for i in $(seq 1 60); do
        curl -sf -o /dev/null "$url" && { echo -e "${GREEN}[$svc]${NC} responde en $url"; return 0; }
        sleep 2
    done
    echo -e "${RED}[$svc]${NC} no respondió en $url. Ver: $0 logs $svc"
    return 1
}

show_status() {
    local svc port state
    echo -e "${CYAN}Checkout:${NC} $PROJECT_ROOT"
    echo -e "${CYAN}Sesión tmux:${NC} $TMUX_SESSION"
    if docker ps --format '{{.Names}}' | grep -qx "$PG_CONTAINER"; then
        echo -e "  infra      ${GREEN}arriba${NC}   Postgres 127.0.0.1:5435 (BD: $(env_value "$BACKEND_ENV" DB_NAME postgres))"
    else
        echo -e "  infra      ${RED}abajo${NC}    Postgres 127.0.0.1:5435"
    fi
    for svc in backend frontend; do
        port="$(svc_port "$svc")"
        if window_exists "$svc"; then
            curl -sf -o /dev/null "$(svc_health_url "$svc")" && state="${GREEN}sano${NC}  " || state="${YELLOW}iniciando${NC}"
        elif [ -n "$(port_pids "$port")" ]; then
            state="${YELLOW}fuera de tmux${NC}"
        else
            state="${RED}detenido${NC}"
        fi
        echo -e "  $(printf '%-10s' "$svc") $state  puerto $port"
    done
}

kill_zombies() {
    local svc port pid n=0
    for svc in backend frontend; do
        window_exists "$svc" && continue
        port="$(svc_port "$svc")"
        for pid in $(port_pids "$port"); do
            if pid_in_checkout "$pid"; then
                kill "$pid" 2>/dev/null && n=$((n + 1)) && echo "  $svc: pid $pid (puerto $port)"
            fi
        done
    done
    echo -e "${GREEN}[kill-zombies]${NC} $n proceso(s) huérfano(s) de este checkout detenido(s)"
}

expand() {
    case "$1" in
        all) echo "infra backend frontend" ;;
        infra|backend|frontend) echo "$1" ;;
        *) echo -e "${RED}Servicio desconocido:${NC} '$1' (infra|backend|frontend|all)" >&2; exit 1 ;;
    esac
}

CMD="${1:-}"
SVC="${2:-}"
case "$CMD" in
    start)
        [ -n "$SVC" ] || { echo "uso: $0 start infra|backend|frontend|all"; exit 1; }
        for s in $(expand "$SVC"); do
            if [ "$s" = infra ]; then start_infra; else start_service "$s"; fi
        done
        for s in $(expand "$SVC"); do
            [ "$s" = infra ] || wait_healthy "$s" || true
        done
        ;;
    stop)
        [ -n "$SVC" ] || { echo "uso: $0 stop infra|backend|frontend|all"; exit 1; }
        for s in $(expand "$SVC"); do
            if [ "$s" = infra ]; then [ "$SVC" = infra ] && stop_infra; else stop_service "$s"; fi
        done
        ;;
    restart)
        [ -n "$SVC" ] || { echo "uso: $0 restart backend|frontend|all"; exit 1; }
        for s in $(expand "$SVC"); do [ "$s" = infra ] || { stop_service "$s"; start_service "$s"; wait_healthy "$s" || true; }; done
        ;;
    status) show_status ;;
    logs)
        [ -n "$SVC" ] || { echo "uso: $0 logs backend|frontend [N]"; exit 1; }
        tail -n "${3:-100}" "$LOG_DIR/$SVC.log" 2>/dev/null || echo "Sin logs de $SVC en $LOG_DIR"
        ;;
    health)
        for s in backend frontend; do
            code="$(curl -s -o /dev/null -w '%{http_code}' "$(svc_health_url "$s")" || true)"
            echo "  $(printf '%-10s' "$s") $(svc_health_url "$s") -> ${code:-sin respuesta}"
        done
        ;;
    attach) tmux attach -t "=$TMUX_SESSION" ;;
    kill-zombies) kill_zombies ;;
    *)
        sed -n '2,22p' "$0" | sed 's/^# \{0,1\}//'
        exit 1
        ;;
esac
