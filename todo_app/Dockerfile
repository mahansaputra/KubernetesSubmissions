# Use a slim Python image
FROM python:3.9-slim

# Set the working directory
WORKDIR /app

# Copy the server code
COPY main.py .

# Set default port as an environment variable
#ENV PORT=8000

# Start the Python HTTP server using the environment port
CMD ["python", "-u", "main.py"]