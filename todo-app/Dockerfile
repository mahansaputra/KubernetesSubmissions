# Use a slim Python image
FROM python:3.9-slim

# Set the working directory
WORKDIR /app

# Copy the server code
COPY main.py .

# Set default port as an environment variable
EXPOSE 3000

# Start the Python HTTP server using the environment port
CMD ["python", "main.py"]