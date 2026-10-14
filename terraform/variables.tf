variable "aws_region" {
  description = "Região AWS de provisionamento dos recursos"
  type        = string
  default     = "us-east-1"
}

variable "database_name" {
  description = "Nome do banco de dados relacional PostgreSQL"
  type        = string
  default     = "techtrack"
}

variable "database_password" {
  description = "Senha administrativa do banco de dados relacional"
  type        = string
  sensitive   = true
}

variable "database_username" {
  description = "Usuário administrativo do banco de dados relacional"
  type        = string
  default     = "techtrack_admin"
}

variable "environment" {
  description = "Ambiente de implantação da aplicação"
  type        = string
  default     = "staging"

  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "O ambiente deve ser dev, staging ou prod."
  }
}

variable "instance_type" {
  description = "Tipo de instância computacional para execução do contêiner"
  type        = string
  default     = "t3.small"
}

variable "project_name" {
  description = "Nome do projeto para identificação de tags e prefixos de recursos"
  type        = string
  default     = "techtrack"
}
