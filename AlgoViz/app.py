import os
from flask import Flask
from werkzeug.middleware.proxy_fix import ProxyFix

# Create the Flask app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "dev-secret-key-change-in-production")

# Apply ProxyFix (important for Render/Heroku reverse proxies)
app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_host=1)

# Import routes AFTER app is created
from routes import *

# Entry point
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))  # Render/Heroku assign this dynamically
    app.run(host="0.0.0.0", port=port, debug=False)
