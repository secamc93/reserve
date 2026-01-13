# ✅ Checklist de Secrets de GitHub Actions

## 🔐 Secrets Requeridos

Ve a: **Settings → Secrets and variables → Actions**

Verifica que tengas estos secrets configurados:

### AWS Secrets
- [ ] `AWS_ACCESS_KEY_ID` - Tu Access Key de AWS
- [ ] `AWS_SECRET_ACCESS_KEY` - Tu Secret Key de AWS

### EC2 Secrets
- [ ] `EC2_SSH_KEY` - Contenido completo de tu archivo `.pem` (incluyendo `-----BEGIN RSA PRIVATE KEY-----` y `-----END RSA PRIVATE KEY-----`)
- [ ] `EC2_HOST` - `ec2-3-220-183-29.compute-1.amazonaws.com`
- [ ] `EC2_USER` - `ubuntu`

### Opcionales (para frontend)
- [ ] `NEXT_PUBLIC_API_BASE_URL` - URL pública de la API (opcional, tiene default)
- [ ] `API_BASE_URL` - URL interna de la API (opcional, tiene default)

## 🐛 Cómo Verificar si Faltan Secrets

1. Ve a Actions
2. Haz clic en un workflow fallido
3. Revisa los logs
4. Si ves: `Error: Input required and not supplied: AWS_ACCESS_KEY_ID`
   → Falta ese secret

## 📝 Nota sobre EC2_SSH_KEY

El secret debe contener TODO el contenido del archivo `.pem`, incluyendo:
```
-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA...
...
-----END RSA PRIVATE KEY-----
```

## ✅ Después de Configurar

1. Los workflows se ejecutarán automáticamente en el próximo push
2. O puedes ejecutarlos manualmente: Actions → Workflow → Run workflow
