variable "aws_region" {
  description = "AWS region to deploy rescs"
  type = string
}

variable "project_name" {
  description = "Name of the project"
  type = string   
}

variable "eks_cluster_role_arn" { type = string }
variable "eks_node_role_arn" { type = string }

variable "db_name" { type = string }
variable "db_user" { type = string }
variable "db_password" {
  type      = string
  sensitive = true
}
