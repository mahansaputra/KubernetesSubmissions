import os
from http.server import BaseHTTPRequestHandler, HTTPServer

PORT = int(os.getenv("PORT", "8000"))

class SimpleHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.end_headers()
        self.wfile.write(b"Todo App: Server is running!")

if __name__ == "__main__":
    print(f"Server started in port {PORT}")
    server = HTTPServer(("", PORT), SimpleHandler)
    server.serve_forever()
