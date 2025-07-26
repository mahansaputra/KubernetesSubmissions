import uuid
import time
from datetime import datetime
import pytz

# Generate a random UUID string on startup
random_string = str(uuid.uuid4())

def get_timestamp():
    # Get current time in UTC with ISO 8601 format
    return datetime.now(pytz.UTC).isoformat()

def main():
    while True:
        # Print timestamp and random string
        print(f"{get_timestamp()}: {random_string}")
        # Wait for 5 seconds
        time.sleep(5)

if __name__ == "__main__":
    main()
