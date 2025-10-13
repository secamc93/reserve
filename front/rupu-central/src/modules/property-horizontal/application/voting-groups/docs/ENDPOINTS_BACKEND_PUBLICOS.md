# 🔌 ENDPOINTS PÚBLICOS PARA VOTACIÓN CON QR

## 📋 Resumen
Documentación completa de los endpoints públicos necesarios para el sistema de votación con QR. **El backend extrae todos los datos del token JWT**.

---

## 🔄 FLUJO COMPLETO

```
1. Escanear QR → token público (PUBLIC_VOTING_TOKEN)
2. POST /public/validate-resident → voting_auth_token (VOTING_AUTH_TOKEN)
3. GET /public/voting-info → información completa de votación ⬅️ NUEVO
4. POST /public/vote → registrar voto
```

---

## 1️⃣ GENERAR URL PÚBLICA (ADMIN)

### Endpoint
```
POST /horizontal-properties/{hp_id}/voting-groups/{group_id}/votings/{voting_id}/generate-public-url
```

### Headers
```
Authorization: Bearer {ADMIN_TOKEN}
Content-Type: application/json
```

### Request Body
```json
{
  "duration_hours": 24,
  "frontend_url": "https://miapp.com/public/vote"
}
```

### Response 200
```json
{
  "success": true,
  "message": "URL de votación pública generada exitosamente",
  "data": {
    "public_url": "https://miapp.com/public/vote?token=eyJhbG...",
    "token": "eyJhbG...",
    "voting_id": 1,
    "hp_id": 14,
    "expires_in_hours": 24
  }
}
```

### Payload JWT (PUBLIC_VOTING_TOKEN)
```json
{
  "voting_id": 1,
  "hp_id": 14,
  "group_id": 1,
  "scope": "public_voting",
  "exp": 1709654400
}
```

---

## 2️⃣ VALIDAR RESIDENTE

### Endpoint
```
POST /public/horizontal-properties/{hp_id}/validate-resident
```

### Headers
```
Authorization: Bearer {PUBLIC_VOTING_TOKEN}
Content-Type: application/json
```

### Request Body
```json
{
  "property_unit_id": 1,
  "dni": "123456789"
}
```

### Response 200
```json
{
  "success": true,
  "message": "Residente validado exitosamente",
  "data": {
    "resident_id": 10,
    "resident_name": "Juan Pérez García",
    "property_unit_id": 1,
    "property_unit_number": "101",
    "voting_auth_token": "eyJhbG...",
    "voting_id": 1,
    "hp_id": 14,
    "group_id": 1
  }
}
```

### Payload JWT (VOTING_AUTH_TOKEN)
```json
{
  "resident_id": 10,
  "voting_id": 1,
  "hp_id": 14,
  "group_id": 1,
  "scope": "voting_auth",
  "exp": 1709575200
}
```

### Validaciones Backend
- ✅ Residente existe en la BD
- ✅ Residente pertenece a la unidad especificada
- ✅ Residente está activo (is_active = true)
- ✅ DNI coincide exactamente
- ✅ Token público válido y no expirado

---

## 3️⃣ OBTENER INFORMACIÓN DE VOTACIÓN ⬅️ **NUEVO**

### Endpoint
```
GET /public/voting-info
```

### Headers
```
Authorization: Bearer {VOTING_AUTH_TOKEN}
```

### Response 200
```json
{
  "success": true,
  "message": "Información de votación obtenida",
  "data": {
    "voting": {
      "id": 1,
      "voting_group_id": 1,
      "title": "Elección de presidente del consejo",
      "description": "Se somete a votación la elección del nuevo presidente...",
      "voting_type": "simple",
      "is_secret": true,
      "allow_abstention": true,
      "is_active": true,
      "display_order": 1,
      "required_percentage": 50.0,
      "created_at": "2025-01-15T10:00:00Z",
      "updated_at": "2025-01-15T10:00:00Z"
    },
    "options": [
      {
        "id": 1,
        "voting_id": 1,
        "option_text": "Candidato A - Juan Pérez",
        "option_code": "candidate_a",
        "display_order": 1,
        "is_active": true
      },
      {
        "id": 2,
        "voting_id": 1,
        "option_text": "Candidato B - María García",
        "option_code": "candidate_b",
        "display_order": 2,
        "is_active": true
      },
      {
        "id": 3,
        "voting_id": 1,
        "option_text": "Abstención",
        "option_code": "abstention",
        "display_order": 3,
        "is_active": true
      }
    ],
    "hp_id": 14,
    "voting_group_id": 1,
    "resident_id": 10,
    "has_voted": false
  }
}
```

### Response 200 (Ya votó)
```json
{
  "success": true,
  "message": "Información de votación obtenida",
  "data": {
    "voting": { ... },
    "options": [ ... ],
    "hp_id": 14,
    "voting_group_id": 1,
    "resident_id": 10,
    "has_voted": true,
    "vote": {
      "id": 45,
      "voting_option_id": 1,
      "voted_at": "2025-01-15T14:30:00Z"
    }
  }
}
```

### Lógica Backend
```javascript
// 1. Extraer datos del token JWT
const { resident_id, voting_id, hp_id, group_id } = decodeToken(votingAuthToken);

// 2. Validar token y scope
if (token.scope !== 'voting_auth') {
  return error("Token inválido para esta operación");
}

// 3. Obtener votación
const voting = await getVoting(hp_id, group_id, voting_id);
if (!voting || !voting.is_active) {
  return error("Votación no encontrada o no está activa");
}

// 4. Obtener opciones
const options = await getVotingOptions(voting_id);

// 5. Verificar si ya votó
const hasVoted = await checkIfResidentHasVoted(voting_id, resident_id);
let vote = null;
if (hasVoted) {
  vote = await getResidentVote(voting_id, resident_id);
}

// 6. Retornar información completa
return {
  voting,
  options,
  hp_id,
  voting_group_id: group_id,
  resident_id,
  has_voted: hasVoted,
  vote: vote
};
```

### Casos de Uso
1. **Residente validado accede a votación**: Frontend obtiene toda la info necesaria en una sola llamada
2. **Residente ya votó**: Backend indica `has_voted: true` y frontend muestra mensaje
3. **Votación inactiva**: Backend retorna error y frontend muestra mensaje apropiado

---

## 4️⃣ REGISTRAR VOTO

### Endpoint
```
POST /public/vote
```

### Headers
```
Authorization: Bearer {VOTING_AUTH_TOKEN}
Content-Type: application/json
```

### Request Body
```json
{
  "voting_option_id": 1,
  "ip_address": "192.168.1.100",
  "user_agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)"
}
```

### Response 201
```json
{
  "success": true,
  "message": "Voto registrado exitosamente",
  "data": {
    "id": 45,
    "voting_id": 1,
    "resident_id": 10,
    "voting_option_id": 1,
    "voted_at": "2025-01-15T14:30:00Z",
    "ip_address": "192.168.1.100",
    "user_agent": "Mozilla/5.0..."
  }
}
```

### Response 400 (Ya votó)
```json
{
  "success": false,
  "message": "No se pudo registrar el voto",
  "error": "El residente ya ha votado en esta votación"
}
```

### Response 400 (Votación inactiva)
```json
{
  "success": false,
  "message": "No se pudo registrar el voto",
  "error": "La votación no está activa"
}
```

### Lógica Backend
```javascript
// 1. Extraer datos del token JWT
const { resident_id, voting_id, hp_id, group_id } = decodeToken(votingAuthToken);

// 2. Validar token y scope
if (token.scope !== 'voting_auth') {
  return error("Token inválido para esta operación");
}

// 3. Validar votación activa
const voting = await getVoting(hp_id, group_id, voting_id);
if (!voting || !voting.is_active) {
  return error("La votación no está activa");
}

// 4. Validar que no haya votado antes
const hasVoted = await checkIfResidentHasVoted(voting_id, resident_id);
if (hasVoted) {
  return error("El residente ya ha votado en esta votación");
}

// 5. Validar opción de votación
const option = await getVotingOption(body.voting_option_id);
if (!option || option.voting_id !== voting_id || !option.is_active) {
  return error("Opción de votación inválida");
}

// 6. Registrar voto
const vote = await createVote({
  voting_id: voting_id,
  resident_id: resident_id,
  voting_option_id: body.voting_option_id,
  ip_address: body.ip_address,
  user_agent: body.user_agent,
  voted_at: new Date()
});

// 7. Emitir evento SSE para votación en tiempo real
broadcastVoteToSSE(hp_id, group_id, voting_id, vote);

// 8. Retornar confirmación
return { vote };
```

---

## 🔐 SEGURIDAD

### Tipos de Tokens

#### PUBLIC_VOTING_TOKEN
- **Scope**: `public_voting`
- **Duración**: 24 horas (configurable)
- **Permite**: Validar residente
- **NO permite**: Votar, ver votación

#### VOTING_AUTH_TOKEN
- **Scope**: `voting_auth`
- **Duración**: 2 horas
- **Permite**: Ver votación info, votar
- **Contiene**: `resident_id`, `voting_id`, `hp_id`, `group_id`

### Validaciones Críticas

1. **✅ Verificar scope** en cada endpoint
2. **✅ Validar expiración** del token
3. **✅ Evitar votos duplicados** (constraint BD + validación)
4. **✅ Registrar auditoría** (IP + User Agent)
5. **✅ Solo residentes activos** pueden votar
6. **✅ Solo votaciones activas** aceptan votos
7. **✅ Opciones pertenecen** a la votación correcta

---

## 📊 COMPARACIÓN: ANTES vs AHORA

### ❌ Antes (Múltiples Endpoints)
```
Frontend → GET /public/voting (token)
        ← {voting data}
        
Frontend → GET /public/voting/options (token)
        ← {options array}
        
Frontend → POST /public/vote (token + option_id)
        ← {vote confirmation}
```

### ✅ Ahora (Endpoint Único)
```
Frontend → GET /public/voting-info (token)
        ← {voting data + options + has_voted + vote info}
        
Frontend → POST /public/vote (token + option_id)
        ← {vote confirmation}
```

### Ventajas del Nuevo Enfoque:
1. **🚀 Más rápido**: 1 llamada en vez de 2
2. **🔒 Más seguro**: Toda la info viene del token
3. **💾 Menos carga**: Menos requests al servidor
4. **🎯 Más simple**: Frontend solo necesita 1 endpoint
5. **✅ Mejor UX**: Información más rápida para el usuario

---

## 📝 CHECKLIST BACKEND

### Endpoints a Implementar:
- [ ] `POST /horizontal-properties/{hp_id}/voting-groups/{group_id}/votings/{voting_id}/generate-public-url`
- [ ] `POST /public/horizontal-properties/{hp_id}/validate-resident`
- [ ] `GET /public/voting-info` ⬅️ **NUEVO**
- [ ] `POST /public/vote`

### Lógica JWT:
- [ ] Generar PUBLIC_VOTING_TOKEN con scope `public_voting`
- [ ] Generar VOTING_AUTH_TOKEN con scope `voting_auth`
- [ ] Validar scope en cada endpoint
- [ ] Extraer `resident_id`, `voting_id`, `hp_id`, `group_id` del token

### Validaciones:
- [ ] Verificar DNI y unidad en `/validate-resident`
- [ ] Prevenir votos duplicados (BD + código)
- [ ] Validar votación activa antes de votar
- [ ] Registrar IP y User Agent para auditoría

### Funcionalidades:
- [ ] Endpoint `/voting-info` retorna info completa + `has_voted`
- [ ] Emitir SSE cuando se registra un voto
- [ ] Manejo de errores con mensajes claros

---

## ✅ FRONTEND YA IMPLEMENTADO

- ✅ Página `/public/vote` con validación y votación
- ✅ Generador de QR en modal de votación en vivo
- ✅ Buscador de unidades residenciales
- ✅ Validación de residente con DNI
- ✅ Pantalla de votación con opciones
- ✅ Integración SSE para tiempo real
- ✅ Manejo de errores y estados
- ✅ UI responsiva y moderna

---

## 🎯 EJEMPLO COMPLETO

### 1. Admin genera QR
```bash
curl -X POST http://localhost:3050/api/v1/horizontal-properties/14/voting-groups/1/votings/1/generate-public-url \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"duration_hours": 24, "frontend_url": "https://miapp.com/public/vote"}'
```

### 2. Residente escanea QR
```
URL: https://miapp.com/public/vote?token=PUBLIC_TOKEN&voting_id=1&hp_id=14
```

### 3. Residente valida con DNI
```bash
curl -X POST http://localhost:3050/api/v1/public/horizontal-properties/14/validate-resident \
  -H "Authorization: Bearer PUBLIC_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"property_unit_id": 1, "dni": "123456789"}'
```

### 4. Frontend obtiene info de votación
```bash
curl -X GET http://localhost:3050/api/v1/public/voting-info \
  -H "Authorization: Bearer VOTING_AUTH_TOKEN"
```

### 5. Residente vota
```bash
curl -X POST http://localhost:3050/api/v1/public/vote \
  -H "Authorization: Bearer VOTING_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"voting_option_id": 1, "ip_address": "192.168.1.100", "user_agent": "Mozilla/5.0..."}'
```

---

**El sistema de votación pública está 100% implementado en el frontend y listo para funcionar con estos endpoints del backend.** 🚀

