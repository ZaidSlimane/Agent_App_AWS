from flask import Flask, request, jsonify
import requests

app = Flask(__name__)

N8N_URL = "http://n8n.default.svc.cluster.local:5678/webhook/execute"

@app.route("/api/execute", methods=["POST"])
def execute():
    payload = request.json

    r = requests.post(N8N_URL, json=payload, timeout=10)
    return jsonify({
        "status": "forwarded",
        "n8n_status": r.status_code,
        "n8n_response": r.text
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001)
