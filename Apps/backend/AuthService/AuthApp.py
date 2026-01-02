from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash
from datetime import datetime
from sqlalchemy.exc import SQLAlchemyError
import os

# ---------------------------
# App
# ---------------------------

app = Flask(__name__)

# ---------------------------
# Database (RDS ONLY)
# ---------------------------

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is required. App will not start.")

app.config["SQLALCHEMY_DATABASE_URI"] = DATABASE_URL
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# RDS-safe pool configuration
app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
    "pool_size": 5,
    "max_overflow": 10,
    "pool_timeout": 30,
    "pool_recycle": 1800,
}

db = SQLAlchemy(app)

# ---------------------------
# Models
# ---------------------------

class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)


class Message(db.Model):
    __tablename__ = "messages"

    id = db.Column(db.String, primary_key=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    platform = db.Column(db.String(50), nullable=False)
    content = db.Column(db.Text, nullable=False)
    agent_response = db.Column(db.Text)
    status = db.Column(db.String(20), default="pending", nullable=False)

# ---------------------------
# Health Check (REAL)
# ---------------------------

@app.route("/health", methods=["GET"])
def health():
    try:
        db.session.execute("SELECT 1")
        return jsonify({"status": "ok"}), 200
    except SQLAlchemyError:
        return jsonify({"status": "db_error"}), 500

# ---------------------------
# Routes
# ---------------------------

@app.route("/signup", methods=["POST"])
def signup():
    data = request.get_json(silent=True) or {}

    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"msg": "Username and password required"}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({"msg": "User already exists"}), 400

    user = User(
        username=username,
        password=generate_password_hash(password)
    )

    db.session.add(user)
    db.session.commit()

    return jsonify({"msg": "User created successfully"}), 201


@app.route("/messages", methods=["GET"])
def get_messages():
    messages = Message.query.order_by(Message.timestamp.desc()).all()

    return jsonify([
        {
            "id": msg.id,
            "timestamp": msg.timestamp.isoformat(),
            "platform": msg.platform,
            "content": msg.content,
            "agentResponse": msg.agent_response,
            "status": msg.status,
        }
        for msg in messages
    ]), 200

# ---------------------------
# Entry Point
# ---------------------------

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001)
