from flask import Flask, request, Response
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app)

@app.route('/ollama', methods=['POST'])
def proxy():
    ollama_response = requests.post(
        'http://localhost:11434/api/generate',
        json=request.json,
        headers={'Content-Type': 'application/json'}
    )
    return Response(ollama_response.content, status=ollama_response.status_code, content_type=ollama_response.headers['Content-Type'])

if __name__ == '__main__':
    app.run(port=3002) 