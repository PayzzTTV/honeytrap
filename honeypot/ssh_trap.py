import socket
import threading
import time
import random
import logging
import paramiko
from geoip import GeoIP
from logger import supabase_logger

logger = logging.getLogger(__name__)

# Top 100 passwords constant (truncated for brevity but keeping significant ones)
TOP_PASSWORDS = [
    "123456", "password", "12345678", "qwerty", "12345", "123456789", "admin", "1234", "111111", "123123",
    "root", "admin123", "password123", "ssh", "support", "user", "guest", "default", "oracle", "mysql"
] # In a real scenario, this would be a full list of 100.

class SSHServer(paramiko.ServerInterface):
    def __init__(self, client_ip):
        self.event = threading.Event()
        self.client_ip = client_ip
        self.username = None
        self.password = None

    def check_auth_password(self, username, password):
        self.username = username
        self.password = password
        
        # Calculate threat score
        score = 0
        if username in ["root", "admin", "ubuntu", "support"]:
            score += 30
        if password in TOP_PASSWORDS:
            score += 20
        
        # Geolocation
        geo = GeoIP.lookup(self.client_ip) or {}
        
        event = {
            "ip_address": self.client_ip,
            "port": 2222,
            "protocol": "SSH",
            "username": username,
            "password": password,
            "threat_score": score,
            **geo
        }
        
        supabase_logger.log_event(event)
        
        # Artifical delay
        time.sleep(random.uniform(0.5, 2.0))
        
        return paramiko.AUTH_FAILED

    def get_allowed_auths(self, username):
        return "password"

def handle_ssh_connection(client, addr):
    client_ip = addr[0]
    logger.info(f"SSH connection from {client_ip}")
    
    try:
        transport = paramiko.Transport(client)
        transport.add_server_key(paramiko.RSAKey.generate(2048))
        transport.local_version = "SSH-2.0-OpenSSH_8.9p1 Ubuntu-3ubuntu0.6"
        
        server = SSHServer(client_ip)
        try:
            transport.start_server(server=server)
        except paramiko.SSHException:
            return

        # Wait for auth attempts (30s timeout)
        start_time = time.time()
        while transport.is_active() and (time.time() - start_time < 30):
            time.sleep(1)
            
    except Exception as e:
        logger.error(f"Error handling SSH connection from {client_ip}: {e}")
    finally:
        client.close()

def start_ssh_trap(host="0.0.0.0", port=2222):
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    sock.bind((host, port))
    sock.listen(100)
    
    logger.info(f"SSH Trap listening on {host}:{port}")
    
    while True:
        try:
            client, addr = sock.accept()
            threading.Thread(target=handle_ssh_connection, args=(client, addr), daemon=True).start()
        except Exception as e:
            logger.error(f"Error in SSH Trap accept loop: {e}")
