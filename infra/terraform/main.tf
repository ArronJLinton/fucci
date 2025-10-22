# Fucci Infrastructure
# This file contains the main Terraform configuration for the Fucci project

terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# Variables
variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "dev"
}

# VPC
module "vpc" {
  source = "terraform-aws-modules/vpc/aws"
  
  name = "fucci-${var.environment}"
  cidr = "10.0.0.0/16"
  
  azs             = ["${var.aws_region}a", "${var.aws_region}b"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24"]
  
  enable_nat_gateway = true
  enable_vpn_gateway = false
  
  tags = {
    Environment = var.environment
    Project     = "fucci"
  }
}

# RDS PostgreSQL
resource "aws_db_instance" "fucci_db" {
  identifier = "fucci-${var.environment}-db"
  
  engine         = "postgres"
  engine_version = "15.4"
  instance_class = "db.t3.micro"
  
  allocated_storage     = 20
  max_allocated_storage = 100
  storage_encrypted     = true
  
  db_name  = "fucci"
  username = "fucci_admin"
  password = var.db_password
  
  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.fucci.name
  
  backup_retention_period = 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"
  
  skip_final_snapshot = var.environment == "dev"
  
  tags = {
    Name        = "fucci-${var.environment}-db"
    Environment = var.environment
    Project     = "fucci"
  }
}

# S3 Bucket for media storage
resource "aws_s3_bucket" "fucci_media" {
  bucket = "fucci-${var.environment}-media"
  
  tags = {
    Name        = "fucci-${var.environment}-media"
    Environment = var.environment
    Project     = "fucci"
  }
}

# Security Groups
resource "aws_security_group" "rds" {
  name_prefix = "fucci-${var.environment}-rds-"
  vpc_id      = module.vpc.vpc_id
  
  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = module.vpc.private_subnets_cidr_blocks
  }
  
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  tags = {
    Name        = "fucci-${var.environment}-rds-sg"
    Environment = var.environment
    Project     = "fucci"
  }
}

# DB Subnet Group
resource "aws_db_subnet_group" "fucci" {
  name       = "fucci-${var.environment}-db-subnet-group"
  subnet_ids = module.vpc.private_subnets
  
  tags = {
    Name        = "fucci-${var.environment}-db-subnet-group"
    Environment = var.environment
    Project     = "fucci"
  }
}

# Variables that need to be provided
variable "db_password" {
  description = "Database password"
  type        = string
  sensitive   = true
}
