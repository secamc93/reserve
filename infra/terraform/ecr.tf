# Repositorios ECR privados para frontend, backend y nginx

# Repositorio para el frontend (rupu-central)
resource "aws_ecr_repository" "frontend" {
  name                 = "rupu-frontend"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  encryption_configuration {
    encryption_type = "AES256"
  }

  tags = merge(
    var.tags,
    {
      Name    = "rupu-frontend"
      Service = "frontend"
    }
  )
}

# Repositorio para el backend (central-reserve)
resource "aws_ecr_repository" "backend" {
  name                 = "rupu-backend"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  encryption_configuration {
    encryption_type = "AES256"
  }

  tags = merge(
    var.tags,
    {
      Name    = "rupu-backend"
      Service = "backend"
    }
  )
}

# Repositorio para nginx
resource "aws_ecr_repository" "nginx" {
  name                 = "rupu-nginx"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  encryption_configuration {
    encryption_type = "AES256"
  }

  tags = merge(
    var.tags,
    {
      Name    = "rupu-nginx"
      Service = "nginx"
    }
  )
}

# Lifecycle Policy para frontend - Mantener solo 1 imagen (la última)
resource "aws_ecr_lifecycle_policy" "frontend_lifecycle" {
  repository = aws_ecr_repository.frontend.name

  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Mantener solo 1 imagen (la última), eliminar todas las demás"
        selection = {
          tagStatus     = "any"
          countType     = "imageCountMoreThan"
          countNumber   = 1
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}

# Lifecycle Policy para backend - Mantener solo 1 imagen (la última)
resource "aws_ecr_lifecycle_policy" "backend_lifecycle" {
  repository = aws_ecr_repository.backend.name

  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Mantener solo 1 imagen (la última), eliminar todas las demás"
        selection = {
          tagStatus     = "any"
          countType     = "imageCountMoreThan"
          countNumber   = 1
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}

# Lifecycle Policy para nginx - Mantener solo 1 imagen (la última)
resource "aws_ecr_lifecycle_policy" "nginx_lifecycle" {
  repository = aws_ecr_repository.nginx.name

  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Mantener solo 1 imagen (la última), eliminar todas las demás"
        selection = {
          tagStatus     = "any"
          countType     = "imageCountMoreThan"
          countNumber   = 1
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}

# Outputs para facilitar el uso en otros módulos
output "ecr_repository_frontend_url" {
  description = "URL del repositorio ECR para frontend"
  value       = aws_ecr_repository.frontend.repository_url
}

output "ecr_repository_backend_url" {
  description = "URL del repositorio ECR para backend"
  value       = aws_ecr_repository.backend.repository_url
}

output "ecr_repository_nginx_url" {
  description = "URL del repositorio ECR para nginx"
  value       = aws_ecr_repository.nginx.repository_url
}
