FROM ubuntu:22.04

# Install dependencies
RUN apt-get update && apt-get install -y \
    curl \
    gnupg \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install Freelens
RUN curl -L https://raw.githubusercontent.com/freelensapp/freelens/main/freelens/build/apt/freelens.asc | tee /etc/apt/keyrings/freelens.asc
RUN curl -L https://raw.githubusercontent.com/freelensapp/freelens/main/freelens/build/apt/freelens.sources | tee /etc/apt/sources.list.d/freelens.sources
RUN apt-get update && apt-get install -y freelens

# Expose the port Freelens uses (default is 3000 for the GUI)
EXPOSE 3000

# Set the entrypoint to run Freelens
CMD ["freelens"]
