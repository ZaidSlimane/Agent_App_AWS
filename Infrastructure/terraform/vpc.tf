
##################################
# VPC
##################################
resource "aws_vpc" "lab" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = { 
    Name    = "${var.project_name}-vpc"
    Project = var.project_name
  }
}

##################################
# INTERNET GATEWAY
##################################
resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.lab.id
  tags   = { 
    Name    = "${var. project_name}-igw"
    Project = var.project_name
  }
}

##################################
# SUBNETS
##################################

# Public subnet (NAT Gateway)
resource "aws_subnet" "public" {
  vpc_id                  = aws_vpc.lab.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "${var.aws_region}a"
  map_public_ip_on_launch = true

  tags = {
    Name                                = "${var.project_name}-public-subnet"
    Project                             = var.project_name
    "kubernetes.io/role/elb"            = "1"
    "kubernetes.io/cluster/lab-eks"     = "shared"
  }
}

# Private app subnet AZ A
resource "aws_subnet" "private_app" {
  vpc_id            = aws_vpc.lab.id
  cidr_block        = "10.0.2.0/24"
  availability_zone = "${var.aws_region}a"

  tags = {
    Name                                = "${var.project_name}-private-app-a"
    Project                             = var.project_name
    "kubernetes.io/role/internal-elb"   = "1"
    "kubernetes.io/cluster/lab-eks"     = "shared"
  }
}

# Private app subnet AZ B
resource "aws_subnet" "private_app_b" {
  vpc_id            = aws_vpc.lab.id
  cidr_block        = "10.0.5.0/24"
  availability_zone = "${var.aws_region}b"

  tags = {
    Name                                = "${var.project_name}-private-app-b"
    Project                             = var.project_name
    "kubernetes.io/role/internal-elb"   = "1"
    "kubernetes.io/cluster/lab-eks"     = "shared"
  }
}

# Private DB subnet AZ A
resource "aws_subnet" "private_db_a" {
  vpc_id            = aws_vpc. lab.id
  cidr_block        = "10.0.3.0/24"
  availability_zone = "${var.aws_region}a"
  tags              = { 
    Name    = "${var.project_name}-private-db-a"
    Project = var.project_name
  }
}

# Private DB subnet AZ B
resource "aws_subnet" "private_db_b" {
  vpc_id            = aws_vpc.lab. id
  cidr_block        = "10.0.4.0/24"
  availability_zone = "${var.aws_region}b"
  tags              = { 
    Name    = "${var.project_name}-private-db-b"
    Project = var.project_name
  }
}

##################################
# ROUTE TABLES
##################################

# Public RT
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.lab. id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }

  tags = { 
    Name    = "${var.project_name}-public-rt"
    Project = var.project_name
  }
}

resource "aws_route_table_association" "public_assoc" {
  subnet_id      = aws_subnet.public. id
  route_table_id = aws_route_table.public.id
}

##################################
# NAT GATEWAY
##################################

resource "aws_eip" "nat_gw" {
  domain = "vpc"
  tags   = { 
    Name    = "${var.project_name}-nat-eip"
    Project = var. project_name
  }
}

resource "aws_nat_gateway" "nat_gw" {
  allocation_id = aws_eip.nat_gw. id
  subnet_id     = aws_subnet.public.id
  tags          = { 
    Name    = "${var.project_name}-nat-gw"
    Project = var.project_name
  }

  depends_on = [aws_internet_gateway.igw]
}

# Private RT
resource "aws_route_table" "private" {
  vpc_id = aws_vpc.lab.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.nat_gw.id
  }

  tags = { 
    Name    = "${var. project_name}-private-rt"
    Project = var.project_name
  }
}

resource "aws_route_table_association" "private_app_a" {
  subnet_id      = aws_subnet.private_app.id
  route_table_id = aws_route_table.private.id
}

resource "aws_route_table_association" "private_app_b" {
  subnet_id      = aws_subnet.private_app_b.id
  route_table_id = aws_route_table.private.id
}

resource "aws_route_table_association" "private_db_a" {
  subnet_id      = aws_subnet.private_db_a.id
  route_table_id = aws_route_table.private.id
}

resource "aws_route_table_association" "private_db_b" {
  subnet_id      = aws_subnet.private_db_b.id
  route_table_id = aws_route_table.private.id
}

##################################
# SECURITY GROUPS
##################################

# EKS Cluster SG
resource "aws_security_group" "eks_cluster" {
  name        = "${var. project_name}-eks-cluster-sg"
  description = "Security group for EKS cluster control plane"
  vpc_id      = aws_vpc.lab.id

  egress {
    description = "Allow all outbound traffic"
    protocol    = "-1"
    from_port   = 0
    to_port     = 0
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { 
    Name    = "${var.project_name}-eks-cluster-sg"
    Project = var.project_name
  }
}

# EKS Cluster to Nodes communication
resource "aws_security_group_rule" "cluster_to_nodes_https" {
  type                     = "egress"
  from_port                = 443
  to_port                  = 443
  protocol                 = "tcp"
  security_group_id        = aws_security_group.eks_cluster. id
  source_security_group_id = aws_security_group.eks_nodes.id
  description              = "Allow control plane to communicate with nodes on HTTPS"
}

resource "aws_security_group_rule" "cluster_to_nodes_kubelet" {
  type                     = "egress"
  from_port                = 10250
  to_port                  = 10250
  protocol                 = "tcp"
  security_group_id        = aws_security_group.eks_cluster.id
  source_security_group_id = aws_security_group.eks_nodes.id
  description              = "Allow control plane to communicate with kubelet"
}

# EKS Nodes SG
resource "aws_security_group" "eks_nodes" {
  name        = "${var.project_name}-eks-nodes-sg"
  description = "Security group for EKS worker nodes"
  vpc_id      = aws_vpc.lab.id

  ingress {
    description = "Allow nodes to communicate with each other"
    protocol    = "-1"
    self        = true
    from_port   = 0
    to_port     = 0
  }

  ingress {
    description     = "Allow control plane to communicate with nodes on HTTPS"
    protocol        = "tcp"
    from_port       = 443
    to_port         = 443
    security_groups = [aws_security_group.eks_cluster.id]
  }

  ingress {
    description     = "Allow control plane to communicate with kubelet"
    protocol        = "tcp"
    from_port       = 10250
    to_port         = 10250
    security_groups = [aws_security_group. eks_cluster.id]
  }

  egress {
    description = "Allow all outbound traffic"
    protocol    = "-1"
    from_port   = 0
    to_port     = 0
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { 
    Name    = "${var.project_name}-eks-nodes-sg"
    Project = var.project_name
  }
}

# RDS SG
resource "aws_security_group" "rds" {
  name        = "${var.project_name}-rds-sg"
  description = "Security group for RDS PostgreSQL"
  vpc_id      = aws_vpc.lab.id

  ingress {
    description     = "Allow PostgreSQL from EKS nodes"
    protocol        = "tcp"
    from_port       = 5432
    to_port         = 5432
    security_groups = [aws_security_group.eks_nodes.id]
  }

  egress {
    description = "Allow all outbound traffic"
    protocol    = "-1"
    from_port   = 0
    to_port     = 0
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { 
    Name    = "${var.project_name}-rds-sg"
    Project = var.project_name
  }
}

##################################
# EKS CLUSTER
##################################
resource "aws_eks_cluster" "lab" {
  name     = "lab-eks"
  role_arn = var.eks_cluster_role_arn

  vpc_config {
    subnet_ids = [
      aws_subnet.private_app.id,
      aws_subnet.private_app_b.id
    ]
    security_group_ids      = [aws_security_group. eks_cluster.id]
    endpoint_private_access = true
    endpoint_public_access  = true
  }

  tags = { 
    Name    = "lab-eks"
    Project = var.project_name
  }
}

##################################
# EKS NODE GROUP
##################################
resource "aws_eks_node_group" "lab" {
  cluster_name    = aws_eks_cluster.lab.name
  node_group_name = "lab-nodes"
  node_role_arn   = var.eks_node_role_arn

  subnet_ids = [
    aws_subnet. private_app.id,
    aws_subnet.private_app_b.id
  ]

  instance_types = ["t3.small"]
  disk_size      = 20

  scaling_config {
    desired_size = 1
    min_size     = 1
    max_size     = 2
  }

  update_config {
    max_unavailable = 1
  }

  depends_on = [
    aws_nat_gateway.nat_gw
  ]

  tags = { 
    Name    = "lab-eks-nodes"
    Project = var.project_name
  }
}

##################################
# RDS
##################################
resource "aws_db_subnet_group" "lab" {
  name       = "${var.project_name}-db-subnet-group"
  subnet_ids = [
    aws_subnet.private_db_a. id,
    aws_subnet. private_db_b.id
  ]

  tags = { 
    Name    = "${var. project_name}-db-subnet-group"
    Project = var. project_name
  }
}

resource "aws_db_instance" "lab" {
  identifier = "agent-app-postgres"

  engine               = "postgres"
  instance_class       = "db.t3.micro"
  allocated_storage    = 20
  storage_type         = "gp3"
  storage_encrypted    = true

  db_name  = var.db_name
  username = var.db_user
  password = var.db_password

  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group. lab.name

  publicly_accessible = false
  multi_az            = false
  skip_final_snapshot = true

  backup_retention_period = 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "mon:04:00-mon:05:00"

  tags = { 
    Name    = "${var.project_name}-postgres"
    Project = var.project_name
  }
}

##################################
# OUTPUTS
##################################
output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.lab.id
}

output "eks_cluster_endpoint" {
  description = "EKS cluster endpoint"
  value       = aws_eks_cluster. lab.endpoint
}

output "eks_cluster_name" {
  description = "EKS cluster name"
  value       = aws_eks_cluster.lab.name
}

output "rds_endpoint" {
  description = "RDS endpoint with port"
  value       = aws_db_instance.lab.endpoint
}

output "rds_address" {
  description = "RDS address (hostname only)"
  value       = aws_db_instance.lab.address
}

output "rds_port" {
  description = "RDS port"
  value       = aws_db_instance.lab. port
}

output "configure_kubectl" {
  description = "Command to configure kubectl"
  value       = "aws eks update-kubeconfig --region ${var.aws_region} --name ${aws_eks_cluster.lab. name}"
}

output "connection_string" {
  description = "Database connection string for Kubernetes"
  value       = "postgresql://${var.db_user}:${var.db_password}@${aws_db_instance. lab.address}:${aws_db_instance.lab.port}/${var.db_name}"
  sensitive   = true
}