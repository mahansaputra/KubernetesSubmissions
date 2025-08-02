import uuid
from datetime import datetime
import pytz
from flask import Flask

app = Flask(__name__)

def get_timestamp():
    # Get current time in UTC with ISO 8601 format
    return datetime.now(pytz.UTC).isoformat()

@app.route('/')
def display_log():
    # Generate a new random UUID string for each request
    random_string = str(uuid.uuid4())
    # Return timestamp and random string
    return f"{get_timestamp()}: {random_string}"

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=3000)