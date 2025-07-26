FROM python:3.9-slim

WORKDIR /app

# Install pytz
RUN pip install pytz

COPY log_output.py .

CMD ["python", "log_output.py"]