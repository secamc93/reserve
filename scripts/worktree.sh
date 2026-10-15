#!/usr/bin/env bash
# worktree.sh — un worktree por agente (o por tarea) para trabajar en paralelo sin pisarse.
#
#   new <nombre> [rama-base]   Crea ../reserve-wt/<nombre> en la rama wt/<nombre> (desde main o
#                              desde rama-base), copia los .env ignorados, le asigna puertos
#                              libres (+10, +20, ...) y una base de datos propia (rupu_<nombre>,
#                              copia de la local). Imprime puertos y sesión tmux.
#   list                       Lista los worktrees.
#   remove <nombre>            Detiene sus servicios, borra su base y el worktree (la rama queda).
#
# Al terminar, el trabajo se integra desde el repo principal (PR o merge, ver
# .claude/rules/servicios-y-worktrees.md).

set -eo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BASE="$(dirname "$ROOT")/reserve-wt"
ENV_FILES="back/central-reserve/.env back/dbpostgres/.env front/rupu-central/.env.local"
PG_CONTAINER="rupu_postgres_local"
PG_USER="postgres"
PG_SOURCE_DB="postgres"
BASE_BACK=3050
BASE_FRONT=3000

db_name() {
    echo "rupu_$(echo "$1" | tr '[:upper:]-' '[:lower:]_' | tr -cd 'a-z0-9_')"
}

set_key() {
    local file="$1" key="$2" value="$3"
    [ -f "$file" ] || return 0
    if grep -qE "^${key}=" "$file"; then
        sed -i -E "s#^${key}=.*#${key}=${value}#" "$file"
    else
        echo "${key}=${value}" >> "$file"
    fi
}

# Puertos ya asignados a otros worktrees o escuchando en la máquina.
used_ports() {
    local f
    for f in "$BASE"/*/back/central-reserve/.env; do
        [ -f "$f" ] && grep -E '^HTTP_PORT=' "$f" | cut -d= -f2
    done
    for f in "$BASE"/*/front/rupu-central/.env.local; do
        [ -f "$f" ] && grep -E '^PORT=' "$f" | cut -d= -f2
    done
    ss -ltn 2>/dev/null | awk 'NR>1 {n=split($4,a,":"); print a[n]}'
}

free_offset() {
    local used off=10
    used="$(used_ports | sort -u)"
    while echo "$used" | grep -qx "$((BASE_BACK + off))" || echo "$used" | grep -qx "$((BASE_FRONT + off))"; do
        off=$((off + 10))
    done
    echo "$off"
}

# Base propia del worktree dentro del mismo Postgres local: copia de la base principal
# (estructura y datos) para que pueda migrar y escribir sin afectar a los demás.
clone_database() {
    local name="$1" dir="$2" db f
    docker exec "$PG_CONTAINER" pg_isready -U "$PG_USER" >/dev/null 2>&1 || return 1
    db="$(db_name "$name")"
    docker exec "$PG_CONTAINER" createdb -U "$PG_USER" "$db" || return 1
    docker exec "$PG_CONTAINER" sh -c "pg_dump -U $PG_USER $PG_SOURCE_DB | psql -q -U $PG_USER $db" >/dev/null 2>&1 || return 1
    for f in back/central-reserve/.env back/dbpostgres/.env; do
        set_key "$dir/$f" DB_NAME "$db"
    done
}

cmd_new() {
    local name="$1" from="${2:-main}" dir f off back front data
    [ -n "$name" ] || { echo "uso: $0 new <nombre> [rama-base]"; exit 1; }
    dir="$BASE/$name"
    [ -e "$dir" ] && { echo "Ya existe: $dir"; exit 1; }
    mkdir -p "$BASE"
    git -C "$ROOT" worktree add -b "wt/$name" "$dir" "$from"

    for f in $ENV_FILES; do
        if [ -f "$ROOT/$f" ]; then
            mkdir -p "$(dirname "$dir/$f")"
            cp "$ROOT/$f" "$dir/$f"
            chmod 600 "$dir/$f"
        fi
    done

    off="$(free_offset)"
    back=$((BASE_BACK + off))
    front=$((BASE_FRONT + off))
    set_key "$dir/back/central-reserve/.env" HTTP_PORT "$back"
    set_key "$dir/front/rupu-central/.env.local" PORT "$front"
    # El front del worktree habla con el back del worktree, no con el del repo principal.
    set_key "$dir/front/rupu-central/.env.local" API_BASE_URL "http://localhost:$back/api/v1"
    set_key "$dir/front/rupu-central/.env.local" NEXT_PUBLIC_API_BASE_URL "http://localhost:$back/api/v1"

    data="BD compartida con el repo principal (el Postgres local no está arriba)"
    if clone_database "$name" "$dir"; then
        data="BD propia $(db_name "$name") (copia de la local)"
    fi

    echo ""
    echo "Worktree listo: $dir (rama wt/$name, desde $from)"
    echo "  back :$back  front :$front  — $data"
    echo "  servicios: $dir/scripts/dev-services.sh start backend   (sesión tmux rupu-$name)"
    echo "  front sin dependencias: cd $dir/front/rupu-central && pnpm install --frozen-lockfile"
}

cmd_remove() {
    local name="$1" dir
    [ -n "$name" ] || { echo "uso: $0 remove <nombre>"; exit 1; }
    dir="$BASE/$name"
    [ -x "$dir/scripts/dev-services.sh" ] && "$dir/scripts/dev-services.sh" stop backend >/dev/null 2>&1 || true
    [ -x "$dir/scripts/dev-services.sh" ] && "$dir/scripts/dev-services.sh" stop frontend >/dev/null 2>&1 || true
    tmux kill-session -t "=rupu-$name" 2>/dev/null || true
    git -C "$ROOT" worktree remove "$dir"
    # La base propia se va con el worktree (nunca la principal: db_name siempre lleva prefijo rupu_).
    docker exec "$PG_CONTAINER" dropdb -U "$PG_USER" --if-exists --force "$(db_name "$name")" >/dev/null 2>&1 || true
    echo "Eliminado $dir (la rama wt/$name se conserva; bórrala con git branch -D wt/$name cuando esté integrada)."
}

case "${1:-}" in
    new) cmd_new "${2:-}" "${3:-}" ;;
    list) git -C "$ROOT" worktree list ;;
    remove) cmd_remove "${2:-}" ;;
    *) echo "uso: $0 new <nombre> [rama-base] | list | remove <nombre>"; exit 1 ;;
esac
