from flask import Flask, request, jsonify
import requests
import logging
import os

app = Flask(__name__)

# Configure logging
logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO"),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Get N8N URL from environment (set by ConfigMap)
N8N_WEBHOOK_URL = os.getenv(
    "N8N_WEBHOOK_URL",
    "http://n8n-service:5678/webhook/incoming-message"
)

logger.info(f"N8N Webhook URL: {N8N_WEBHOOK_URL}")


@app.route("/api/execute", methods=["POST"])
def execute():
    try:
        payload = request.json
        logger.info(f"Received payload: {payload}")

        # Forward to n8n webhook
        response = requests.post(
            N8N_WEBHOOK_URL,
            json=payload,
            timeout=30,
            headers={"Content-Type": "application/json"}
        )

        logger.info(f"n8n responded with status: {response.status_code}")

        # Return n8n's response
        try:
            response_data = response.json()
        except:
            response_data = response.text

        return jsonify({
            "status": "success",
            "n8n_status_code": response.status_code,
            "n8n_response": response_data
        }), response.status_code

    except requests.exceptions.Timeout:
        logger.error("Request to n8n timed out")
        return jsonify({
            "status": "error",
            "message": "n8n webhook timed out"
        }), 504

    except requests.exceptions.ConnectionError as e:
        logger.error(f"Could not connect to n8n: {e}")
        return jsonify({
            "status": "error",
            "message": "Could not connect to n8n service"
        }), 503

    except Exception as e:
        logger.error(f"Error communicating with n8n: {e}")
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


@app.route("/health", methods=["GET"])
def health():
    """Health check endpoint for Kubernetes"""
    try:
        # Test n8n connectivity
        response = requests.get("http://n8n-service:5678/healthz", timeout=5)
        n8n_healthy = response.status_code == 200
    except Exception as e:
        logger.warning(f"n8n health check failed: {e}")
        n8n_healthy = False

    return jsonify({
        "status": "healthy",
        "service": "backend",
        "n8n_reachable": n8n_healthy,
        "n8n_url": N8N_WEBHOOK_URL
    }), 200


@app.route("/", methods=["GET"])
def index():
    return jsonify({
        "service": "backend-api",
        "version": "1.0.0",
        "endpoints": {
            "execute": "POST /api/execute",
            "health": "GET /health"
        }
    })


if __name__ == "__main__":
    # Use gunicorn in production
    if os.getenv("FLASK_ENV") == "production":
        from gunicorn.app.base import BaseApplication


        class FlaskApplication(BaseApplication):
            def __init__(self, app, options=None):
                self.options = options or {}
                self.application = app
                super().__init__()

            def load_config(self):
                for key, value in self.options.items():
                    self.cfg.set(key, value)

            def load(self):
                return self.application


        options = {
            'bind': '0.0.0.0:5001',
            'workers': 4,
            'timeout': 120,
            'loglevel': 'info',
        }
        FlaskApplication(app, options).run()
    else:
        app.run(host="0.0.0.0", port=5001, debug=True)