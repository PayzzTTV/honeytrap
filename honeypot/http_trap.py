from flask import Flask, request, make_response
import logging
import random
from geoip import GeoIP
from logger import supabase_logger

# Disable Flask default logging to keep it clean
log = logging.getLogger('werkzeug')
log.setLevel(logging.ERROR)

app = Flask(__name__)
logger = logging.getLogger(__name__)

def log_http_event(threat_score_extra=0):
    client_ip = request.remote_addr
    geo = GeoIP.lookup(client_ip) or {}
    
    score = 0
    path = request.path
    body = request.get_data(as_text=True)
    ua = request.headers.get("User-Agent", "")
    
    # Threat score calculation
    score = 10 # Base score for any hit
    if ".." in path or "etc/passwd" in path:
        score += 40
    if "<script" in body.lower() or "SELECT" in body.upper():
        score += 30
    if any(scanner in ua for scanner in ["Nikto", "sqlmap", "Nmap", "Masscan"]):
        score += 20
    
    score += threat_score_extra
    
    event = {
        "ip_address": client_ip,
        "port": 8080,
        "protocol": "HTTP",
        "http_path": path,
        "http_method": request.method,
        "http_user_agent": ua,
        "http_payload": body[:1000], # Truncate if too large
        "threat_score": min(score, 100),
        **geo
    }
    
    supabase_logger.log_event(event)

@app.before_request
def before_request():
    log_http_event()

@app.route('/')
def index():
    # Fake WordPress Login Page
    return """
    <html>
    <head><title>Log In &lsaquo; My WordPress Site &#8212; WordPress</title></head>
    <body class="login">
        <div id="login">
            <form name="loginform" id="loginform" action="/wp-login.php" method="post">
                <p><label for="user_login">Username or Email Address<br />
                <input type="text" name="log" id="user_login" class="input" value="" size="20" /></label></p>
                <p><label for="user_pass">Password<br />
                <input type="password" name="pwd" id="user_pass" class="input" value="" size="20" /></label></p>
                <p class="submit">
                    <input type="submit" name="wp-submit" id="wp-submit" class="button button-primary button-large" value="Log In" />
                </p>
            </form>
        </div>
    </body>
    </html>
    """, 200

@app.route('/wp-login.php', methods=['POST'])
def wp_login():
    # Already logged in before_request
    return "Invalid username or password.", 403

@app.route('/admin')
@app.route('/phpmyadmin')
@app.route('/.env')
def env_file():
    return """
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=production_db
DB_USERNAME=admin
DB_PASSWORD=P@ssw0rd2024!
APP_KEY=base64:7vX8...
    """, 200

@app.route('/etc/passwd')
@app.route('/etc/shadow')
def passwd_file():
    return "root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nbin:x:2:2:bin:/bin:/usr/sbin/nologin", 200

@app.route('/shell', methods=['GET', 'POST'])
@app.route('/cmd', methods=['GET', 'POST'])
def web_shell():
    return "$ ", 200

@app.route('/phpinfo')
@app.route('/phpinfo.php')
def php_info():
    return "PHP Version 7.4.3", 200

@app.errorhandler(404)
def page_not_found(e):
    return "Not Found", 404

def start_http_trap(host="0.0.0.0", port=8080):
    logger.info(f"HTTP Trap listening on {host}:{port}")
    # Simulating Apache/2.4.41
    app.run(host=host, port=port, threaded=True)

@app.after_request
def add_headers(response):
    response.headers['Server'] = 'Apache/2.4.41 (Ubuntu)'
    return response
