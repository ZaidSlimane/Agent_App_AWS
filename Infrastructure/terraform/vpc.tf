 # VPC
 resource "aws_vpc" "lab" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Name = "lab-vpc"
  }
}

 # Internet Gateway
 resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.lab.id

  tags = {
    Name = "lab-igw"
  }
}

 # Subnets
 
# Public subnet (ALB + NAT)
resource "aws_subnet" "public" {
  vpc_id                  = aws_vpc.lab.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "us-east-1a"
  map_public_ip_on_launch = true

  tags = {
    Name = "public-subnet"
    "kubernetes.io/role/elb" = "1"
    "kubernetes.io/cluster/lab-eks" = "shared"
  }
}

# Private app subnet (EKS)
resource "aws_subnet" "private_app" {
  vpc_id            = aws_vpc.lab.id
  cidr_block        = "10.0.2.0/24"
  availability_zone = "us-east-1a"

  tags = {
    Name = "private-app-subnet"
    "kubernetes.io/role/internal-elb" = "1"
    "kubernetes.io/cluster/lab-eks" = "shared"
  }
}

# Private DB subnet AZ A
resource "aws_subnet" "private_db_a" {
  vpc_id            = aws_vpc.lab.id
  cidr_block        = "10.0.3.0/24"
  availability_zone = "us-east-1a"

  tags = {
    Name = "private-db-subnet-a"
  }
}

# Private DB subnet AZ B (REQUIRED FOR RDS)
resource "aws_subnet" "private_db_b" {
  vpc_id            = aws_vpc.lab.id
  cidr_block        = "10.0.4.0/24"
  availability_zone = "us-east-1b"

  tags = {
    Name = "private-db-subnet-b"
  }
}


resource "aws_subnet" "private_app_b" {
  vpc_id            = aws_vpc.lab.id
  cidr_block        = "10.0.5.0/24"
  availability_zone = "us-east-1b"

  tags = {
    Name = "private-app-subnet-b"
    "kubernetes.io/role/internal-elb" = "1"
    "kubernetes.io/cluster/lab-eks"   = "shared"
  }
}


 # Route Tables
 
# Public RT
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.lab.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }

  tags = {
    Name = "public-rt"
  }
}

resource "aws_route_table_association" "public_assoc" {
  subnet_id      = aws_subnet.public.id
  route_table_id = aws_route_table.public.id
}

# Private RT
resource "aws_route_table" "private" {
  vpc_id = aws_vpc.lab.id

  tags = {
    Name = "private-rt"
  }
}

resource "aws_route_table_association" "private_app_assoc" {
  subnet_id      = aws_subnet.private_app.id
  route_table_id = aws_route_table.private.id
}

resource "aws_route_table_association" "private_db_a_assoc" {
  subnet_id      = aws_subnet.private_db_a.id
  route_table_id = aws_route_table.private.id
}

resource "aws_route_table_association" "private_db_b_assoc" {
  subnet_id      = aws_subnet.private_db_b.id
  route_table_id = aws_route_table.private.id
}

resource "aws_route_table_association" "private_app_b_assoc"{
  subnet_id 	 = aws_subnet.private_app_b.id
  route_table_id = aws_route_table.private.id
}

 # NAT Instance
 
resource "aws_eip" "nat" {
  domain = "vpc"
}

resource "aws_security_group" "nat" {
  name   = "nat-sg"
  vpc_id = aws_vpc.lab.id

  ingress {
    protocol    = "-1"
    from_port   = 0
    to_port     = 0
    cidr_blocks = [aws_subnet.private_app.cidr_block, aws_subnet.private_app_b.cidr_block]
  }

  egress {
    protocol    = "-1"
    from_port   = 0
    to_port     = 0
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_instance" "nat" {
  ami                         = "ami-0c02fb55956c7d316"
  instance_type               = "t3.small"
  subnet_id                   = aws_subnet.public.id
  associate_public_ip_address = true
  source_dest_check           = false
  vpc_security_group_ids      = [aws_security_group.nat.id]

  tags = {
    Name = "nat-instance"
  }
}

resource "aws_eip_association" "nat_assoc" {
  instance_id   = aws_instance.nat.id
  allocation_id = aws_eip.nat.id
}

resource "aws_route" "private_nat_route" {
  route_table_id         = aws_route_table.private.id
  destination_cidr_block = "0.0.0.0/0"
  network_interface_id   = aws_instance.nat.primary_network_interface_id
}

 # Security Groups
 
# ALB SG
resource "aws_security_group" "alb" {
  name   = "alb-sg"
  vpc_id = aws_vpc.lab.id

  ingress {
    protocol    = "tcp"
    from_port   = 80
    to_port     = 80
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    protocol    = "-1"
    from_port   = 0
    to_port     = 0
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# EKS nodes SG
resource "aws_security_group" "eks_nodes" {
  name   = "eks-nodes-sg"
  vpc_id = aws_vpc.lab.id

  ingress {
    description     = "From ALB"
    protocol        = "tcp"
    from_port       = 80
    to_port         = 80
    security_groups = [aws_security_group.alb.id]
  }

  ingress {
    description = "Node to node"
    protocol    = "-1"
    from_port   = 0
    to_port     = 0
    self        = true
  }

  egress {
    protocol    = "-1"
    from_port   = 0
    to_port     = 0
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# RDS SG
resource "aws_security_group" "rds" {
  name   = "rds-sg"
  vpc_id = aws_vpc.lab.id

  ingress {
    protocol        = "tcp"
    from_port       = 5432
    to_port         = 5432
    security_groups = [aws_security_group.eks_nodes.id]
  }
}

 # EKS (USING EXISTING ROLES)
 #aws rule : it must include 2 subnets in 2 diff AZs
 
resource "aws_eks_cluster" "lab" {
  name     = "lab-eks"
  role_arn = var.eks_cluster_role_arn

  vpc_config {
    subnet_ids         = [aws_subnet.private_app.id, aws_subnet.public.id, aws_subnet.private_app_b.id, aws_subnet.private_db_b.id]
    security_group_ids = [aws_security_group.eks_nodes.id]
  }
}

resource "aws_eks_node_group" "lab" {
  cluster_name    = aws_eks_cluster.lab.name
  node_group_name = "lab-nodes"
  node_role_arn   = var.eks_node_role_arn
  subnet_ids      = [aws_subnet.private_app.id]

  instance_types = ["t3.small"]

  scaling_config {
    desired_size = 3
    min_size     = 1
    max_size     = 3
  }
}

 # RDS
 
resource "aws_db_subnet_group" "lab" {
  name = "lab-db-subnet-group"

  subnet_ids = [
    aws_subnet.private_db_a.id,
    aws_subnet.private_db_b.id
  ]
}

resource "aws_db_instance" "lab" {
  identifier = "lab-postgres"

  engine         = "postgres"
  instance_class = "db.t3.micro"

  allocated_storage = 20
  storage_type      = "gp2"

  db_name  = var.db_name
  username = var.db_user
  password = var.db_password

  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.lab.name

  publicly_accessible = false
  multi_az            = false

  skip_final_snapshot = true
}