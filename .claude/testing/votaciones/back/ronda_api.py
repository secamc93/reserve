#!/usr/bin/env python3
"""Ronda E2E por API del módulo de votaciones (casos .claude/testing/votaciones/back/CU-01..03).

Uso (desde la raíz): set -a && . ./.env.test && set +a && API=http://localhost:3050/api/v1 python3 .claude/testing/votaciones/back/ronda_api.py
Resultados de cada corrida: .claude/testing/votaciones/back/runs/ (ignorado por git).
Crea datos con sufijo de corrida y limpia los grupos de votación que crea.
"""
import json, os, queue, sys, threading, time, urllib.request, urllib.error

API = os.environ.get("API", "http://localhost:3050/api/v1")
EMAIL, PASSWORD = os.environ["E2E_EMAIL"], os.environ["E2E_PASSWORD"]
PROP = os.environ.get("E2E_PROPERTY_NAME", "Tayazal de Suba")
RUN = time.strftime("%Y%m%d-%H%M%S")
results = []
RUNS = os.path.join(os.path.dirname(os.path.abspath(__file__)), "runs")
os.makedirs(RUNS, exist_ok=True)


def call(method, path, token=None, body=None, query=None):
    url = API + path
    if query:
        url += ("&" if "?" in url else "?") + "&".join(f"{k}={v}" for k, v in query.items())
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(url, data=data, method=method)
    req.add_header("Content-Type", "application/json")
    if token:
        req.add_header("Authorization", f"Bearer {token}")
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            raw = r.read().decode()
            return r.status, (json.loads(raw) if raw else {})
    except urllib.error.HTTPError as e:
        raw = e.read().decode()
        try:
            return e.code, json.loads(raw)
        except Exception:
            return e.code, {"raw": raw[:300]}


def open_sse(path, token, query=None):
    """Abre un stream SSE en un hilo y devuelve una cola de (evento, data)."""
    url = API + path + "?" + "&".join(f"{k}={v}" for k, v in {**(query or {}), "token": token}.items())
    q = queue.Queue()

    def run():
        try:
            with urllib.request.urlopen(urllib.request.Request(url), timeout=60) as r:
                q.put(("__status__", r.status))
                ev = None
                for raw in r:
                    line = raw.decode().rstrip("\n")
                    if line.startswith("event:"):
                        ev = line[6:].strip()
                    elif line.startswith("data:"):
                        q.put((ev, json.loads(line[5:].strip())))
        except urllib.error.HTTPError as e:
            q.put(("__status__", e.code))
        except Exception as e:  # noqa: BLE001 - se reporta en la cola
            q.put(("__error__", str(e)))

    threading.Thread(target=run, daemon=True).start()
    return q


def sse_wait(q, name, timeout=10):
    end = time.time() + timeout
    while time.time() < end:
        try:
            ev, d = q.get(timeout=max(0.1, end - time.time()))
        except queue.Empty:
            break
        if ev in ("heartbeat", "__status__"):
            continue
        return ev, d
    return (None, None)


def count_of(d, option_id):
    for x in (d or {}).get("results") or []:
        if x.get("voting_option_id") == option_id:
            return x.get("vote_count")
    return None


def check(name, ok, detail=""):
    results.append((name, bool(ok), detail))
    print(("OK   " if ok else "FAIL ") + name + (f"  -> {detail}" if detail and not ok else ""))
    return ok


def data(resp):
    d = resp.get("data", resp)
    return d


def find_id(obj):
    if isinstance(obj, dict):
        for k in ("id", "ID"):
            if k in obj:
                return obj[k]
    return None


def as_list(d):
    if isinstance(d, list):
        return d
    if isinstance(d, dict):
        for k in ("data", "items", "units", "residents", "votings", "groups", "votes", "options", "property_units"):
            if isinstance(d.get(k), list):
                return d[k]
    return []


# --- Autenticación ---------------------------------------------------------
st, r = call("POST", "/auth/login", body={"email": EMAIL, "password": PASSWORD})
check("login", st == 200 and r.get("success"), f"{st} {r}")
main = r["data"]["token"]
st, r = call("POST", "/auth/business-token", main, {"business_id": 0})
check("business token", st == 200, f"{st} {r}")
BT = r["data"]["token"]

st, r = call("GET", "/horizontal-properties", BT, query={"page": 1, "page_size": 100})
props = as_list(data(r))
prop = next((p for p in props if p.get("name") == PROP), None)
if not check(f"propiedad '{PROP}' existe", prop, f"{st} {r}"):
    sys.exit(1)
BID = prop["id"]
Q = {"business_id": BID}

# --- Unidades (por torre) y residentes ------------------------------------
st, r = call("GET", "/horizontal-properties/property-units", BT, query={**Q, "page": 1, "page_size": 100})
units = as_list(data(r))
check("listar unidades", st == 200, f"{st} {r}")
if len(units) < 6:
    plan = [("T1-101", "T1", 1, 0.20), ("T1-102", "T1", 1, 0.20), ("T1-201", "T1", 2, 0.15),
            ("T2-101", "T2", 1, 0.15), ("T2-102", "T2", 1, 0.15), ("T2-201", "T2", 2, 0.15)]
    for num, block, floor, coef in plan:
        st, r = call("POST", "/horizontal-properties/property-units", BT,
                     {"number": num, "block": block, "floor": floor, "unit_type": "apartment",
                      "participation_coefficient": coef}, Q)
        check(f"crear unidad {num}", st in (200, 201) and r.get("success"), f"{st} {r}")
    st, r = call("GET", "/horizontal-properties/property-units", BT, query={**Q, "page": 1, "page_size": 100})
    units = as_list(data(r))
check("hay >= 6 unidades", len(units) >= 6, f"{len(units)} unidades")
unit_ids = [u["id"] for u in units][:6]

# Residentes (uno por unidad, DNI determinístico para poder re-correr)
st, r = call("GET", "/horizontal-properties/residents", BT, query={**Q, "page": 1, "page_size": 100})
residents = as_list(data(r))
check("listar residentes", st == 200, f"{st} {r}")
have_res = {(x.get("property_unit_id") or x.get("propertyUnitId")) for x in residents}
for i, uid in enumerate(unit_ids):
    if uid in have_res:
        continue
    st, r = call("POST", "/horizontal-properties/residents", BT,
                 {"business_id": BID, "property_unit_id": uid, "resident_type_id": 1,
                  "name": f"Residente QA {i+1}", "email": f"qa{i+1}.tayazal@example.com",
                  "dni": f"90000{uid:04d}", "is_main_resident": True}, Q)
    ya = st == 409 and "existe" in json.dumps(r, ensure_ascii=False)
    check(f"residente unidad {uid} (creado o ya existía)", (st in (200, 201) and r.get("success")) or ya, f"{st} {r}")

# --- CU-01: grupo, votación, opciones (CRUD) -------------------------------
start = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(time.time() - 60))
end = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(time.time() + 86400))
grp = {"name": f"Asamblea QA {RUN}", "description": "Ronda automática", "voting_start_date": start,
       "voting_end_date": end, "requires_quorum": True, "quorum_percentage": 51}
st, r = call("POST", "/horizontal-properties/voting-groups", BT, grp)
check("super admin sin ?business_id -> 400", st == 400, f"{st} {r}")
st, r = call("POST", "/horizontal-properties/voting-groups", BT, grp, Q)
check("crear grupo", st in (200, 201) and r.get("success"), f"{st} {r}")
GID = find_id(data(r))
st, r = call("GET", "/horizontal-properties/voting-groups", BT, query=Q)
check("listar grupos incluye el creado", st == 200 and any(find_id(g) == GID for g in as_list(data(r))), f"{st}")
check("grupo nuevo con require_document_validation=false por defecto",
      any(find_id(g) == GID and g.get("require_document_validation") is False for g in as_list(data(r))), f"{as_list(data(r))[:1]}")
st, r = call("PUT", f"/horizontal-properties/voting-groups/{GID}", BT, {**grp, "description": "Editado"}, Q)
check("actualizar grupo", st == 200 and r.get("success") and data(r).get("require_document_validation") is False, f"{st} {r}")

vt = {"title": f"Aprobación presupuesto {RUN}", "description": "Votación QA", "voting_type": "majority",
      "is_secret": False, "allow_abstention": True, "display_order": 1, "required_percentage": 51}
VP = f"/horizontal-properties/voting-groups/{GID}/votings"
st, r = call("POST", VP, BT, vt, Q)
check("crear votación", st in (200, 201) and r.get("success"), f"{st} {r}")
VID = find_id(data(r))
st, r = call("PUT", f"{VP}/{VID}", BT, {**vt, "description": "Votación QA editada"}, Q)
check("actualizar votación", st == 200 and r.get("success"), f"{st} {r}")
st, r = call("POST", VP, BT, {**vt, "voting_type": "invalido"}, Q)
check("votación con tipo inválido -> 400", st == 400, f"{st} {r}")

opts = {}
for i, (text, code, color) in enumerate([("Sí", "SI", "#1f8a4c"), ("No", "NO", "#c8382d"), ("Abstención", "ABS", "#8a8580")], 1):
    st, r = call("POST", f"{VP}/{VID}/options", BT, {"option_text": text, "option_code": code, "color": color, "display_order": i}, Q)
    check(f"crear opción {text}", st in (200, 201) and r.get("success"), f"{st} {r}")
    opts[code] = find_id(data(r))
st, r = call("POST", f"{VP}/{VID}/options", BT, {"option_text": "Temporal", "option_code": "TMP", "color": "#000000", "display_order": 4}, Q)
tmp = find_id(data(r))
st, r = call("PATCH", f"{VP}/{VID}/options/{tmp}/status", BT, {"is_active": False}, Q)
check("desactivar opción", st == 200 and r.get("success"), f"{st} {r}")
st, r = call("DELETE", f"{VP}/{VID}/options/{tmp}", BT, query=Q)
check("borrar opción", st in (200, 204), f"{st} {r}")
st, r = call("GET", f"{VP}/{VID}/options", BT, query=Q)
olist = as_list(data(r))
check("opciones = Sí/No/Abstención", st == 200 and sorted(o.get("option_code") for o in olist) == ["ABS", "NO", "SI"], f"{[o.get('option_code') for o in olist]}")
st, r = call("PATCH", f"{VP}/{VID}/activate", BT, query=Q)
check("activar votación", st == 200 and r.get("success"), f"{st} {r}")

# --- CU-02: votos del admin y resultados -----------------------------------
VV = f"{VP}/{VID}/votes"
st, r = call("GET", f"{VP}/{VID}/unvoted-units", BT, query=Q)
check("unvoted-units inicial", st == 200, f"{st} {r}")
u0, u1, u2 = unit_ids[0], unit_ids[1], unit_ids[2]
st, r = call("POST", VV, BT, {"property_unit_id": u0, "voting_option_id": opts["SI"]}, Q)
check("voto admin Sí", st in (200, 201) and r.get("success"), f"{st} {r}")
vote0 = find_id(data(r))
st, r = call("POST", VV, BT, {"property_unit_id": u0, "voting_option_id": opts["NO"]}, Q)
check("voto duplicado misma unidad rechazado", st >= 400, f"{st} {r}")
st, r = call("POST", f"{VV}/bulk", BT, {"property_unit_ids": [u1, u2], "voting_option_id": opts["NO"], "auto_mark_attendance": True}, Q)
check("voto masivo (2 unidades)", st in (200, 201) and r.get("success"), f"{st} {r}")
st, r = call("GET", VV, BT, query=Q)
check("listar votos = 3", st == 200 and len(as_list(data(r))) == 3, f"{len(as_list(data(r)))} votos")
st, r = call("GET", f"{VP}/{VID}/voting-details", BT, query=Q)
check("voting-details", st == 200 and r.get("success"), f"{st} {r}")
det = json.dumps(data(r))
st, r = call("PUT", f"{VP}/{VID}/units/{unit_ids[3]}/attendance", BT, {"mark_attendance": True}, Q)
check("marcar asistencia", st == 200 and r.get("success"), f"{st} {r}")
if vote0:
    st, r = call("DELETE", f"{VV}/{vote0}", BT, query=Q)
    check("anular voto admin", st in (200, 204), f"{st} {r}")
    st, r = call("GET", VV, BT, query=Q)
    check("tras anular quedan 2 votos", len(as_list(data(r))) == 2, f"{len(as_list(data(r)))}")
    # Regla: con lista de asistencia activa (la creó el voto masivo), solo vota quien tiene asistencia.
    st, r = call("POST", VV, BT, {"property_unit_id": u0, "voting_option_id": opts["SI"]}, Q)
    check("re-votar sin asistencia rechazado (regla de asistencia)", st >= 400 and "asistencia" in json.dumps(r), f"{st} {r}")
    st, r = call("PUT", f"{VP}/{VID}/units/{u0}/attendance", BT, {"mark_attendance": True}, Q)
    check("marcar asistencia unidad anulada", st == 200, f"{st} {r}")
    st, r = call("POST", VV, BT, {"property_unit_id": u0, "voting_option_id": opts["SI"]}, Q)
    check("re-votar unidad con asistencia", st in (200, 201), f"{st} {r}")

# --- CU-03: voto público por QR --------------------------------------------
st, r = call("POST", f"/horizontal-properties/voting-groups/{GID}/generate-public-url", BT, {"duration_hours": 2}, Q)
check("generar URL pública del grupo", st in (200, 201) and r.get("success"), f"{st} {r}")
PT = data(r).get("token")
st, r = call("GET", "/public/voting-context", PT)
check("public voting-context (require_document_validation=false)", st == 200 and data(r).get("require_document_validation") is False, f"{st} {r}")
st, r = call("GET", "/public/property-units", PT)
check("public unidades (token del QR)", st == 200, f"{st} {r}")
u4 = unit_ids[4]

# Grupo que exige documento (require_document_validation=true)
st, r = call("PUT", f"/horizontal-properties/voting-groups/{GID}", BT, {**grp, "require_document_validation": True}, Q)
check("activar require_document_validation en el grupo", st == 200 and data(r).get("require_document_validation") is True, f"{st} {r}")
st, r = call("GET", "/public/voting-context", PT)
check("public voting-context (require_document_validation=true)", st == 200 and data(r).get("require_document_validation") is True, f"{st} {r}")
st, r = call("POST", "/public/validate-resident", PT, {"property_unit_id": u4})
check("con documento: validar sin dni -> 400 Documento requerido", st == 400 and r.get("message") == "Documento requerido", f"{st} {r}")
st, r = call("POST", "/public/validate-resident", PT, {"property_unit_id": u4, "dni": "999999999"})
check("con documento: DNI erróneo -> 404", st == 404, f"{st} {r}")
st, r = call("POST", "/public/validate-resident", PT, {"property_unit_id": u4, "dni": f"90000{u4:04d}"})
check("con documento: validar residente con DNI", st == 200 and r.get("success") and data(r).get("require_document_validation") is True, f"{st} {r}")

# Grupo sin documento: basta la unidad (el voto es por unidad)
st, r = call("PUT", f"/horizontal-properties/voting-groups/{GID}", BT, {**grp, "require_document_validation": False}, Q)
check("desactivar require_document_validation en el grupo", st == 200 and data(r).get("require_document_validation") is False, f"{st} {r}")
st, r = call("POST", "/public/validate-resident", PT, {"property_unit_id": 999999999})
check("sin documento: unidad inexistente/ajena -> 404", st == 404, f"{st} {r}")
st, r = call("POST", "/public/validate-resident", PT, {"property_unit_id": u4})
check("sin documento: validar solo con la unidad", st == 200 and r.get("success") and data(r).get("resident_name") and data(r).get("require_document_validation") is False, f"{st} {r}")
VAT = data(r).get("voting_auth_token")
st, r = call("GET", "/public/voting-group/votings", VAT)
check("public votaciones del grupo (token de residente)", st == 200 and r.get("success")
      and (data(r).get("voting_group") or {}).get("require_document_validation") is False, f"{st} {r}")

# SSE público con el token del residente de grupo + voting_id
SSE = open_sse("/public/voting-stream", VAT, {"voting_id": VID})
ev, d = sse_wait(SSE, "connected")
check("SSE público: connected", ev == "connected", f"{ev} {d}")
ev, d = sse_wait(SSE, "initial_data")
check("SSE público: initial_data con resultados", ev == "initial_data" and count_of(d, opts["SI"]) is not None
      and all("percentage_by_coefficient" in x for x in d.get("results", [])), f"{ev} {d}")
si_inicial = count_of(d, opts["SI"]) or 0
st, _ = call("GET", "/public/voting-stream", None, {"voting_id": VID})
check("SSE público sin token -> 401", st == 401, f"{st}")
st, r = call("GET", "/public/units-with-residents", VAT)
check("public unidades con residentes (token de residente)", st == 200, f"{st} {r}")
st, r = call("GET", "/public/voting-info", VAT, query={"voting_id": VID})
check("public voting-info", st == 200, f"{st} {r}")
st, r = call("POST", "/public/vote", VAT, {"voting_id": VID, "voting_option_id": opts["SI"]})
check("voto público sin asistencia -> 403 (no 500)", st == 403, f"{st} {r}")
st, r = call("PUT", f"{VP}/{VID}/units/{u4}/attendance", BT, {"mark_attendance": True}, Q)
check("admin marca asistencia de la unidad del QR", st == 200, f"{st} {r}")
st, r = call("POST", "/public/vote", VAT, {"voting_id": VID, "voting_option_id": opts["SI"]})
check("voto público Sí", st in (200, 201) and r.get("success"), f"{st} {r}")
ev, d = sse_wait(SSE, "new_vote")
check("SSE público: new_vote con el conteo nuevo", ev == "new_vote" and count_of(d, opts["SI"]) == si_inicial + 1, f"{ev} {d}")
st, r = call("POST", "/public/vote", VAT, {"voting_id": VID, "voting_option_id": opts["NO"]})
check("voto público duplicado -> 409", st == 409, f"{st} {r}")
st, r = call("POST", "/public/vote", BT, {"voting_id": VID, "voting_option_id": opts["SI"]})
check("JWT de admin no sirve como token público", st >= 400, f"{st} {r}")
st, r = call("GET", VV, BT, query=Q)
check("admin ve el voto público (4 votos)", len(as_list(data(r))) == 4, f"{len(as_list(data(r)))}")

# --- Resultados por coeficiente --------------------------------------------
st, r = call("GET", f"{VP}/{VID}/voting-details", BT, query=Q)
json.dump(data(r), open(os.path.join(RUNS, "ultimo-detalle.json"), "w"), ensure_ascii=False, indent=1)

# --- Cierre y limpieza (CRUD delete) ----------------------------------------
st, r = call("PATCH", f"{VP}/{VID}/deactivate", BT, query=Q)
check("desactivar votación", st == 200 and r.get("success"), f"{st} {r}")
st, r = call("DELETE", f"{VV}/reset", BT, query=Q)
check("resetear votos", st in (200, 204), f"{st} {r}")
ev, d = sse_wait(SSE, "votes_reset")
check("SSE público: votes_reset con conteo 0", ev == "votes_reset" and count_of(d, opts["SI"]) == 0, f"{ev} {d}")
st, r = call("GET", VV, BT, query=Q)
check("tras reset 0 votos", len(as_list(data(r))) == 0, f"{len(as_list(data(r)))}")
st, r = call("DELETE", f"{VP}/{VID}", BT, query=Q)
check("borrar votación", st in (200, 204), f"{st} {r}")
st, r = call("DELETE", f"/horizontal-properties/voting-groups/{GID}", BT, query=Q)
check("borrar grupo", st in (200, 204), f"{st} {r}")

ok = sum(1 for _, o, _ in results if o)
print(f"\nRESUMEN: {ok}/{len(results)} OK")
json.dump([{"caso": n, "ok": o, "detalle": d[:500]} for n, o, d in results],
          open(os.path.join(RUNS, f"ronda-{RUN}.json"), "w"), ensure_ascii=False, indent=1)
sys.exit(0 if ok == len(results) else 1)
