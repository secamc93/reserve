# Configuración de Variables de Entorno

Este proyecto utiliza archivos de variables de entorno para configurar diferentes aspectos de la aplicación.

## Archivos de Ejemplo Disponibles

- `.env.example` - Variables por defecto
- `.env.development.example` - Variables para desarrollo
- `.env.production.example` - Variables para producción
- `.env.local.example` - Variables locales (sobrescribe otras configuraciones)

## Configuración Inicial

Para comenzar a trabajar con el proyecto, copia los archivos de ejemplo:

```bash
# Copiar archivo principal
cp .env.example .env

# Copiar archivo de desarrollo
cp .env.development.example .env.development

# Copiar archivo de producción
cp .env.production.example .env.production

# Copiar archivo local (opcional)
cp .env.local.example .env.local
```

## Variables Disponibles

### Variables Generales (.env)
- `VITE_APP_NAME` - Nombre de la aplicación
- `VITE_APP_VERSION` - Versión de la aplicación

### Variables de Desarrollo (.env.development)
- `REACT_APP_API_BASE_URL` - URL base de la API para desarrollo

### Variables de Producción (.env.production)
- `REACT_APP_API_BASE_URL` - URL base de la API para producción

### Variables Locales (.env.local)
- `REACT_APP_API_BASE_URL` - URL base de la API local (sobrescribe otras configuraciones)

## Importante

⚠️ **NUNCA** subas los archivos `.env` al repositorio. Solo los archivos `.env.example` deben estar en el control de versiones.

Los archivos `.env` están incluidos en `.gitignore` para evitar que se suban accidentalmente.

## Orden de Precedencia

Las variables de entorno se cargan en el siguiente orden (último en ganar):
1. `.env`
2. `.env.development` (en modo desarrollo)
3. `.env.production` (en modo producción)
4. `.env.local` (siempre, sobrescribe todo) 