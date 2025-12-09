# 🔌 ENDPOINT: GET /public/voting-info

## 📋 Descripción
Endpoint único que retorna **toda la información necesaria** para que un residente vote. El backend extrae `voting_id`, `hp_id`, `group_id` y `resident_id` del token JWT.

Este endpoint reemplaza las múltiples llamadas anteriores y consolida toda la información en una sola respuesta.

---

## 🎯 Propósito
Después de que el residente se valida con su DNI y unidad, obtiene un `VOTING_AUTH_TOKEN`. Con ese token, este endpoint le proporciona:
- ✅ Información completa de la votación
- ✅ Opciones de votación disponibles
- ✅ Estado de si ya votó o no
- ✅ Configuración de la votación

---

## 📡 Request

### Método
```
GET /public/voting-info
```

### Headers
```http
Authorization: Bearer {VOTING_AUTH_TOKEN}
```

### Query Parameters
Ninguno. Todo se extrae del token JWT.

---

## ✅ Response 200 (SUCCESS)

```json
{
  "success": true,
  "message": "Información de votación obtenida exitosamente",
  "data": {
    "voting": {
      "id": 1,
      "voting_group_id": 1,
      "title": "Elección de presidente del consejo",
      "description": "Se somete a votación la elección del nuevo presidente del consejo de administración para el período 2024-2026",
      "voting_type": "simple",
      "is_secret": true,
      "allow_abstention": true,
      "is_active": true,
      "display_order": 1,
      "required_percentage": 50.0,
      "created_at": "2024-01-01T10:00:00Z",
      "updated_at": "2024-01-01T10:00:00Z"
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
    "has_voted": false,
    "hp_id": 14,
    "voting_group_id": 1,
    "resident_id": 5
  }
}
```

### Campos de Respuesta

#### `voting` (Object)
Información completa de la votación:
- `id`: ID de la votación
- `voting_group_id`: ID del grupo de votaciones (asamblea)
- `title`: Título de la votación
- `description`: Descripción detallada
- `voting_type`: Tipo de votación (`simple`, `majority`, `unanimity`)
- `is_secret`: Si la votación es secreta o pública
- `allow_abstention`: Si permite abstención
- `is_active`: Si la votación está activa
- `display_order`: Orden de visualización
- `required_percentage`: Porcentaje requerido para aprobar
- `created_at`: Fecha de creación
- `updated_at`: Fecha de última actualización

#### `options` (Array)
Lista de opciones de votación:
- `id`: ID de la opción
- `voting_id`: ID de la votación a la que pertenece
- `option_text`: Texto de la opción (ej: "Sí", "No", "Abstención")
- `option_code`: Código interno (ej: "yes", "no", "abstention")
- `display_order`: Orden de visualización
- `is_active`: Si la opción está activa

#### `has_voted` (Boolean)
Indica si el residente ya votó en esta votación. Si es `true`, no se le debe permitir votar nuevamente.

#### `hp_id` (Number)
ID de la propiedad horizontal. Útil para contexto.

#### `voting_group_id` (Number)
ID del grupo de votaciones. Útil para navegación.

#### `resident_id` (Number)
ID del residente que está consultando. Útil para auditoría frontend.

---

## ❌ Response 401 (UNAUTHORIZED)

```json
{
  "success": false,
  "message": "Token de autenticación inválido o expirado",
  "error": "invalid_token"
}
```

**Cuándo ocurre:**
- Token expirado
- Token inválido
- Token con scope incorrecto

---

## ❌ Response 404 (NOT FOUND)

```json
{
  "success": false,
  "message": "Votación no encontrada",
  "error": "La votación no existe o ha sido eliminada"
}
```

**Cuándo ocurre:**
- La votación fue eliminada
- El voting_id del token no existe

---

## ❌ Response 403 (FORBIDDEN)

```json
{
  "success": false,
  "message": "Acceso denegado",
  "error": "El residente no tiene permisos para esta votación"
}
```

**Cuándo ocurre:**
- El residente no pertenece a la propiedad horizontal
- La votación no está activa
- El token tiene scope incorrecto

---

## 💻 Lógica Backend

```javascript
async function getPublicVotingInfo(req, res) {
  try {
    // 1. Extraer datos del token JWT
    const token = req.headers.authorization?.replace('Bearer ', '');
    const decoded = jwt.verify(token, SECRET_KEY);
    
    // Validar scope
    if (decoded.scope !== 'voting_auth') {
      return res.status(403).json({
        success: false,
        message: 'Token con scope inválido',
        error: 'Se requiere token de autenticación de votación'
      });
    }
    
    const { resident_id, voting_id, hp_id, group_id } = decoded;
    
    // 2. Obtener información de la votación
    const voting = await db.query(
      `SELECT * FROM horizontal_property.votings WHERE id = ? AND is_active = true`,
      [voting_id]
    );
    
    if (!voting) {
      return res.status(404).json({
        success: false,
        message: 'Votación no encontrada',
        error: 'La votación no existe o no está activa'
      });
    }
    
    // 3. Obtener opciones de votación
    const options = await db.query(
      `SELECT * FROM horizontal_property.voting_options 
       WHERE voting_id = ? AND is_active = true 
       ORDER BY display_order ASC`,
      [voting_id]
    );
    
    // 4. Verificar si el residente ya votó
    const existingVote = await db.query(
      `SELECT id FROM horizontal_property.votes 
       WHERE voting_id = ? AND resident_id = ?`,
      [voting_id, resident_id]
    );
    
    const has_voted = existingVote !== null;
    
    // 5. Retornar respuesta completa
    return res.status(200).json({
      success: true,
      message: 'Información de votación obtenida exitosamente',
      data: {
        voting: {
          id: voting.id,
          voting_group_id: voting.voting_group_id,
          title: voting.title,
          description: voting.description,
          voting_type: voting.voting_type,
          is_secret: voting.is_secret,
          allow_abstention: voting.allow_abstention,
          is_active: voting.is_active,
          display_order: voting.display_order,
          required_percentage: voting.required_percentage,
          created_at: voting.created_at,
          updated_at: voting.updated_at
        },
        options: options.map(opt => ({
          id: opt.id,
          voting_id: opt.voting_id,
          option_text: opt.option_text,
          option_code: opt.option_code,
          display_order: opt.display_order,
          is_active: opt.is_active
        })),
        has_voted: has_voted,
        hp_id: hp_id,
        voting_group_id: group_id,
        resident_id: resident_id
      }
    });
    
  } catch (error) {
    console.error('Error en getPublicVotingInfo:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
}
```

---

## 🔐 Seguridad

### Validaciones Requeridas:
1. ✅ Token JWT válido y no expirado
2. ✅ Scope correcto: `voting_auth`
3. ✅ Votación existe y está activa
4. ✅ Residente pertenece a la HP
5. ✅ Solo retornar opciones activas

### No Exponer:
- ❌ Votos de otros residentes (si es secreta)
- ❌ Información sensible del residente
- ❌ Configuración interna del sistema

---

## 📊 Flujo de Uso

```
1. Residente escanea QR
   → Obtiene PUBLIC_VOTING_TOKEN
   
2. Residente valida DNI + unidad
   → POST /public/validate-resident
   → Obtiene VOTING_AUTH_TOKEN
   
3. Frontend llama a este endpoint
   → GET /public/voting-info (con VOTING_AUTH_TOKEN)
   → Recibe toda la información
   
4. Frontend muestra pantalla de votación
   → Usuario selecciona opción
   → POST /public/vote (con VOTING_AUTH_TOKEN)
   → Voto registrado
```

---

## 🎯 Ventajas de Este Endpoint

1. **Una sola llamada**: En lugar de 2-3 endpoints, uno solo
2. **Consistencia**: Toda la data viene del mismo token
3. **Seguridad**: Backend controla todo
4. **Rendimiento**: Menos round-trips
5. **Simplicidad**: Frontend solo envía token

---

## ✅ Ejemplo de Uso en Frontend

```typescript
// 1. Después de validar residente
const votingAuthToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";

// 2. Obtener información de votación
const response = await fetch('http://localhost:3050/api/v1/public/voting-info', {
  headers: {
    'Authorization': `Bearer ${votingAuthToken}`
  }
});

const result = await response.json();

if (result.success) {
  const { voting, options, has_voted } = result.data;
  
  // 3. Verificar si ya votó
  if (has_voted) {
    alert('Ya has votado en esta votación');
    return;
  }
  
  // 4. Mostrar votación
  console.log('Votación:', voting.title);
  console.log('Opciones:', options);
  
  // 5. Usuario selecciona y vota
  const selectedOptionId = 1;
  await fetch('http://localhost:3050/api/v1/public/vote', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${votingAuthToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      voting_option_id: selectedOptionId,
      ip_address: '192.168.1.100',
      user_agent: navigator.userAgent
    })
  });
}
```

---

## 📝 Notas Importantes

1. **Token es suficiente**: No se necesitan IDs adicionales
2. **Backend valida todo**: Contra el token JWT
3. **`has_voted` es crítico**: Previene votos duplicados
4. **Opciones ordenadas**: Por `display_order`
5. **Solo opciones activas**: Filtradas por `is_active`

---

## 🔄 Comparación: Antes vs Ahora

### Antes (3 endpoints):
```typescript
// 1. Obtener votación
GET /public/voting → {voting}

// 2. Obtener opciones
GET /public/voting/options → {options}

// 3. Verificar si votó (implícito en el voto)
```

### Ahora (1 endpoint):
```typescript
// Todo en uno
GET /public/voting-info → {voting, options, has_voted}
```

**Ventajas:**
- ✅ 66% menos llamadas al servidor
- ✅ Datos siempre consistentes
- ✅ Más rápido (1 round-trip)
- ✅ Más simple de mantener

---

## ✅ Checklist de Implementación Backend

- [ ] Crear endpoint `GET /public/voting-info`
- [ ] Validar token JWT y scope `voting_auth`
- [ ] Extraer `resident_id`, `voting_id`, `hp_id`, `group_id` del token
- [ ] Consultar votación en BD
- [ ] Consultar opciones activas
- [ ] Verificar si el residente ya votó
- [ ] Retornar respuesta completa
- [ ] Manejar errores (401, 403, 404, 500)
- [ ] Logging de accesos
- [ ] Tests unitarios e integración

