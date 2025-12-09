# 🔌 NUEVO ENDPOINT: GET /public/voting-info

## 📋 Descripción
Endpoint unificado que retorna toda la información necesaria para que un residente validado pueda votar. El backend extrae `voting_id`, `hp_id`, `group_id` y `resident_id` del token JWT.

---

## 🎯 Propósito
Simplificar el flujo de votación pública evitando múltiples llamadas al backend. Un solo endpoint que retorna:
- Información completa de la votación
- Todas las opciones disponibles
- Estado del residente (si ya votó o no)
- IDs necesarios para el siguiente paso

---

## 🔗 Endpoint

### URL
```
GET /api/v1/public/voting-info
```

### Headers
```
Authorization: Bearer {VOTING_AUTH_TOKEN}
```

### Sin Body (GET Request)

---

## ✅ Response 200 (SUCCESS)

```json
{
  "success": true,
  "message": "Información de votación obtenida",
  "data": {
    "voting": {
      "id": 1,
      "voting_group_id": 1,
      "title": "Elección de presidente del consejo",
      "description": "Se somete a votación la elección del presidente del consejo de administración para el periodo 2024-2026",
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
        "option_text": "Sí",
        "option_code": "yes",
        "display_order": 1,
        "is_active": true
      },
      {
        "id": 2,
        "voting_id": 1,
        "option_text": "No",
        "option_code": "no",
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
    "resident_id": 5,
    "has_voted": false
  }
}
```

### Campos Retornados

#### **voting** (Object)
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | number | ID de la votación |
| voting_group_id | number | ID del grupo de votación |
| title | string | Título de la votación |
| description | string | Descripción detallada |
| voting_type | string | Tipo: 'simple', 'majority', 'unanimity' |
| is_secret | boolean | Si es votación secreta |
| allow_abstention | boolean | Si permite abstención |
| is_active | boolean | Si está activa |
| display_order | number | Orden de visualización |
| required_percentage | number | Porcentaje requerido para aprobar |

#### **options** (Array)
Lista de opciones disponibles para votar

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | number | ID de la opción |
| voting_id | number | ID de la votación a la que pertenece |
| option_text | string | Texto de la opción (Sí, No, etc.) |
| option_code | string | Código interno (yes, no, abstention) |
| display_order | number | Orden de visualización |
| is_active | boolean | Si está activa |

#### **Datos Adicionales**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| hp_id | number | ID de la propiedad horizontal |
| voting_group_id | number | ID del grupo de votación |
| resident_id | number | ID del residente (extraído del token) |
| has_voted | boolean | Si el residente ya votó en esta votación |

---

## ❌ Response 401 (UNAUTHORIZED)

```json
{
  "success": false,
  "message": "Token inválido o expirado",
  "error": "token expired"
}
```

---

## ❌ Response 404 (NOT FOUND)

```json
{
  "success": false,
  "message": "Votación no encontrada",
  "error": "La votación no existe o ha sido eliminada"
}
```

---

## ❌ Response 403 (FORBIDDEN)

```json
{
  "success": false,
  "message": "Votación no activa",
  "error": "La votación no está activa actualmente"
}
```

---

## 🔐 Lógica Backend

### Implementación Sugerida

```javascript
async function getPublicVotingInfo(req, res) {
  try {
    // 1. Extraer datos del token JWT
    const token = extractTokenFromHeader(req.headers.authorization);
    const decoded = verifyAndDecodeToken(token);
    
    // Validar scope
    if (decoded.scope !== 'voting_auth') {
      return res.status(403).json({
        success: false,
        message: 'Token no válido para esta operación',
        error: 'Invalid token scope'
      });
    }
    
    const { voting_id, hp_id, group_id, resident_id } = decoded;
    
    // 2. Obtener información de la votación
    const voting = await db.votings.findOne({
      where: { 
        id: voting_id,
        voting_group_id: group_id,
        is_active: true 
      }
    });
    
    if (!voting) {
      return res.status(404).json({
        success: false,
        message: 'Votación no encontrada',
        error: 'La votación no existe o no está activa'
      });
    }
    
    // 3. Obtener opciones de votación
    const options = await db.voting_options.findAll({
      where: { 
        voting_id: voting_id,
        is_active: true 
      },
      order: [['display_order', 'ASC']]
    });
    
    // 4. Verificar si el residente ya votó
    const existingVote = await db.votes.findOne({
      where: {
        voting_id: voting_id,
        resident_id: resident_id
      }
    });
    
    const has_voted = !!existingVote;
    
    // 5. Retornar toda la información
    return res.status(200).json({
      success: true,
      message: 'Información de votación obtenida',
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
        hp_id: hp_id,
        voting_group_id: group_id,
        resident_id: resident_id,
        has_voted: has_voted
      }
    });
    
  } catch (error) {
    console.error('Error en getPublicVotingInfo:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener información de votación',
      error: error.message
    });
  }
}
```

---

## 🔄 Flujo Actualizado

### Antes (Múltiples Endpoints)
```
1. Escanear QR → token público
2. POST /public/validate-resident → voting_auth_token
3. GET /public/voting → información de votación
4. GET /public/voting/options → opciones
5. POST /public/vote → votar
```

### Ahora (Simplificado)
```
1. Escanear QR → token público
2. POST /public/validate-resident → voting_auth_token
3. GET /public/voting-info → toda la información ⬅️ NUEVO
4. POST /public/vote → votar
```

---

## 📊 Ventajas del Nuevo Endpoint

### 1. **Menos Llamadas al Backend**
- Antes: 2 llamadas (voting + options)
- Ahora: 1 llamada (voting-info)

### 2. **Más Rápido**
- Una sola conexión HTTP
- Menos latencia total
- Mejor experiencia de usuario

### 3. **Información Completa**
- Votación + opciones + estado del residente
- Todo en una respuesta

### 4. **Prevención de Errores**
- `has_voted` permite mostrar mensaje antes de intentar votar
- Evita llamadas innecesarias al endpoint de voto

### 5. **Más Seguro**
- Backend controla todo desde el token
- Frontend no necesita saber IDs
- Menos puntos de manipulación

---

## 🎨 Implementación en Frontend

### Código Actualizado

```typescript
const loadVotingData = async () => {
  try {
    setLoading(true);

    // Una sola llamada para obtener toda la información
    const response = await fetch(
      'http://localhost:3050/api/v1/public/voting-info', 
      {
        headers: {
          'Authorization': `Bearer ${votingAuthToken}`
        }
      }
    );

    if (!response.ok) {
      throw new Error('No se pudo cargar la información de la votación');
    }

    const result = await response.json();

    if (result.success && result.data) {
      // Extraer votación y opciones
      setVotingData(result.data.voting);
      setOptions(result.data.options.sort(
        (a, b) => a.display_order - b.display_order
      ));
      
      // Verificar si ya votó
      if (result.data.has_voted) {
        onError('Ya has votado en esta votación. Solo puedes votar una vez.');
      }
    } else {
      throw new Error(result.message || 'Error al cargar datos');
    }
  } catch (err) {
    console.error('Error:', err);
    onError('Error al cargar la información de la votación');
  } finally {
    setLoading(false);
  }
};
```

---

## ✅ Checklist de Implementación Backend

- [ ] Crear ruta GET `/api/v1/public/voting-info`
- [ ] Middleware para verificar VOTING_AUTH_TOKEN
- [ ] Extraer `voting_id`, `hp_id`, `group_id`, `resident_id` del token
- [ ] Validar scope del token (`voting_auth`)
- [ ] Obtener votación de la base de datos
- [ ] Verificar que la votación esté activa
- [ ] Obtener opciones de votación ordenadas
- [ ] Verificar si el residente ya votó
- [ ] Retornar estructura completa
- [ ] Manejo de errores (401, 403, 404, 500)
- [ ] Logging de accesos para auditoría
- [ ] Testing del endpoint

---

## 🧪 Ejemplo de Prueba (cURL)

```bash
curl -X GET "http://localhost:3050/api/v1/public/voting-info" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 📝 Notas Importantes

1. **El token DEBE tener scope `voting_auth`**
2. **El token contiene todos los IDs necesarios**
3. **El campo `has_voted` evita intentos de voto duplicado**
4. **Las opciones se retornan ordenadas por `display_order`**
5. **Solo votaciones activas son retornadas**
6. **Este endpoint NO registra el voto, solo consulta**

---

## 🎯 Conclusión

Este nuevo endpoint simplifica significativamente el flujo de votación pública:
- ✅ Menos código en el frontend
- ✅ Menos llamadas HTTP
- ✅ Mejor rendimiento
- ✅ Más información en un solo request
- ✅ Mejor UX para el residente

El backend controla toda la lógica y seguridad, el frontend solo consume y muestra.

