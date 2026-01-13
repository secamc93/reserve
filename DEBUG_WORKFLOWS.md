# 🐛 Debug de Workflows Fallidos

## ✅ Workflow Exitoso
- **Test Workflow** ✅ - Funcionó perfectamente

## ❌ Workflows Fallidos

Necesitamos revisar los logs de estos workflows para ver qué falló:

1. **Deploy All Services #1** - Failed (15s)
2. **Deploy Services (Frontend, Backend, Nginx) #2** - Failed (22s)
3. **Frontend CI/CD #1** - Failed (40s)
4. **Backend CI/CD #1** - Failed (38s)
5. **Deploy Services (Frontend, Backend, Nginx) #1** - Failed (58s)

## 🔍 Cómo Revisar los Logs

1. Ve a GitHub Actions
2. Haz clic en el workflow fallido
3. Haz clic en el job que falló
4. Revisa los logs para ver el error específico

## 🔧 Errores Comunes

### 1. Secrets no configurados
Si ves: `Error: Input required and not supplied: AWS_ACCESS_KEY_ID`
- Ve a Settings → Secrets and variables → Actions
- Verifica que tengas configurados:
  - `AWS_ACCESS_KEY_ID`
  - `AWS_SECRET_ACCESS_KEY`
  - `EC2_SSH_KEY`
  - `EC2_HOST`
  - `EC2_USER`

### 2. Error de AWS credentials
Si ves: `Error: The security token included in the request is invalid`
- Verifica que las credenciales de AWS sean correctas
- Verifica que el usuario tenga permisos para ECR

### 3. Error de SSH
Si ves: `Permission denied (publickey)`
- Verifica que `EC2_SSH_KEY` tenga el contenido correcto del archivo .pem
- Verifica que `EC2_USER` sea correcto (ubuntu o ec2-user)

### 4. Error de Podman
Si ves: `podman: command not found`
- El workflow instala Podman, pero puede haber un problema
- Verifica que el step "Install Podman" se ejecute correctamente

## 📋 Próximos Pasos

1. Revisa los logs de uno de los workflows fallidos
2. Copia el error específico
3. Te ayudo a solucionarlo
