import uuid
from datetime import datetime
import pytz
from flask import Flask

app = Flask(__name__)

def get_timestamp():
    return datetime.now(pytz.UTC).isoformat()

@app.route('/')
def display_log():
    random_string = str(uuid.uuid4())  # New UUID per request
    return f"{get_timestamp()}: {random_string}"

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=3000)