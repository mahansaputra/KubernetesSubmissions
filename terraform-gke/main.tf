# Configuring the Google Cloud provider
provider "google" {
  project     = var.project_id
  region      = "asia-southeast2"
  zone        = "asia-southeast2-a"
  credentials = file("/home/hansa/.config/gcloud/application_default_credentials.json") # Update with actual path
}

# Defining the GKE cluster resource
resource "google_container_cluster" "dwk_cluster" {
  name     = "dwk-cluster"
  location = "asia-southeast2-a"

  # Setting the specific GKE version
  min_master_version = "1.32"

  # Disable deletion protection
  deletion_protection = false

  # Configuring the node pool
  node_pool {
    name       = "default-pool"
    node_count = 3

    node_config {
      machine_type = "e2-micro"
      disk_size_gb = 32
      disk_type    = "pd-standard"
    }
  }

  # Removing default node pool after creation to avoid conflicts
  remove_default_node_pool = false
}

# Defining variables for project ID
variable "project_id" {
  description = "The ID of the Google Cloud project"
  type        = string
}