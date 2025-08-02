FROM python:3.9-slim

WORKDIR /app

# Install pytz and Flask
RUN pip install pytz flask

# Ensure output is unbuffered
ENV PYTHONUNBUFFERED=1

EXPOSE 3000

COPY app.py .

CMD ["python", "app.py"]