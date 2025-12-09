# 🔌 RUTAS ACTUALIZADAS DE ENDPOINTS PÚBLICOS

## 📋 Rutas Implementadas en Frontend

### 1. Generar URL Pública (Admin)
```
POST /horizontal-properties/{hp_id}/voting-groups/{group_id}/votings/{voting_id}/generate-public-url
```
**Quién lo llama**: Admin desde votación en vivo  
**Token**: ADMIN_TOKEN  
**Retorna**: public_url con PUBLIC_VOTING_TOKEN  

---

### 2. Validar Residente ✅ ACTUALIZADO
```
POST /public/validate-resident
```
**Cambio**: Ya NO lleva `{hp_id}` en la URL, el backend lo extrae del token  
**Quién lo llama**: Residente en pantalla de validación  
**Token**: PUBLIC_VOTING_TOKEN  
**Body**: `{ property_unit_id, dni }`  
**Retorna**: VOTING_AUTH_TOKEN + datos del residente  

---

### 3. Obtener Información de Votación
```
GET /public/voting-info
```
**Quién lo llama**: Residente después de validarse  
**Token**: VOTING_AUTH_TOKEN  
**Retorna**: voting + options + has_voted  

---

### 4. Registrar Voto
```
POST /public/vote
```
**Quién lo llama**: Residente al votar  
**Token**: VOTING_AUTH_TOKEN  
**Body**: `{ voting_option_id, ip_address, user_agent }`  
**Retorna**: Confirmación del voto  

---

## 🔐 Tokens y Datos

### PUBLIC_VOTING_TOKEN
```json
{
  "voting_id": 3,
  "voting_group_id": 1,
  "hp_id": 14,
  "scope": "public_voting"
}
```

### VOTING_AUTH_TOKEN
```json
{
  "resident_id": 10,
  "voting_id": 3,
  "voting_group_id": 1,
  "hp_id": 14,
  "scope": "voting_auth"
}
```

---

## 📊 Flujo de Datos

```
1. Admin genera QR
   POST /horizontal-properties/{hp_id}/voting-groups/{group_id}/votings/{voting_id}/generate-public-url
   → public_url con PUBLIC_VOTING_TOKEN

2. Residente escanea QR
   → /public/vote?token=PUBLIC_VOTING_TOKEN

3. Residente valida
   POST /public/validate-resident (token saca hp_id)
   Body: { property_unit_id, dni }
   → VOTING_AUTH_TOKEN

4. Cargar votación
   GET /public/voting-info (token saca todo)
   → voting + options + has_voted

5. Votar
   POST /public/vote (token saca resident_id, voting_id)
   Body: { voting_option_id }
   → confirmación
```

---

## ✅ Cambios Recientes

### Antes:
```
POST /public/horizontal-properties/{hp_id}/validate-resident
```

### Ahora:
```
POST /public/validate-resident
```

**Razón**: El backend extrae `hp_id` del PUBLIC_VOTING_TOKEN, no necesita recibirlo en la URL.

---

## 🎯 Implementación Actual en Frontend

### validate-resident.action.ts
```typescript
const url = `${env.API_BASE_URL}/public/validate-resident`;
// ✅ Sin {hp_id} en la URL
// ✅ Backend lo extrae del token
```

### Logs Implementados
Todos los endpoints ahora tienen logs detallados:
- 🔐 Request con parámetros
- 📥 Response con status y datos
- ✅ Success confirmación
- ❌ Error con detalles

¡Frontend actualizado y funcionando con las nuevas rutas! 🚀


