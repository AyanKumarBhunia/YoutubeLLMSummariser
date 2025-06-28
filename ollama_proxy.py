from flask import Flask, request, Response
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app)

@app.route('/ollama', methods=['POST'])
def proxy():
    r = requests.post('http://localhost:11434/api/generate', json=request.json)
    return Response(r.content, status=r.status_code, content_type=r.headers['Content-Type'])

if __name__ == '__main__':
    app.run(port=3002) 