output "database_endpoint" {
  description = "Endpoint de conexao do banco relacional PostgreSQL RDS"
  value       = aws_db_instance.main.endpoint
}

output "database_name" {
  description = "Nome do banco de dados provisionado"
  value       = aws_db_instance.main.db_name
}

output "ecr_repository_url" {
  description = "URL do repositorio ECR para envio da imagem OCI do TechTrack"
  value       = aws_ecr_repository.app.repository_url
}

output "vpc_id" {
  description = "Identificador da VPC criada para a infraestrutura"
  value       = aws_vpc.main.id
}
