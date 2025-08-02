FROM python:3.9-slim

WORKDIR /app

# Install pytz
RUN pip install pytz

# Ensure output is unbuffered
ENV PYTHONUNBUFFERED=1

EXPOSE 3000

COPY log_output.py .

CMD ["python", "log_output.py"]
