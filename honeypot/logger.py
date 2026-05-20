import json
import queue
import threading
import time
import logging
import requests
from config import config

# Setup basic logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class SupabaseLogger:
    def __init__(self):
        self.queue = queue.Queue()
        self.url = config.SUPABASE_URL
        self.key = config.SUPABASE_SERVICE_KEY
        self.endpoint = f"{self.url}/rest/v1/honeypot_events"
        self.fallback_path = "/tmp/honeytrap_fallback.jsonl"
        
        self.worker_thread = threading.Thread(target=self._worker, daemon=True)
        self.worker_thread.start()
        logger.info("Supabase direct REST logger initialized.")

    def log_event(self, event: dict):
        self.queue.put(event)

    def _worker(self):
        while True:
            batch = []
            while not self.queue.empty() and len(batch) < 10:
                batch.append(self.queue.get())
            
            if batch:
                self._flush(batch)
            
            time.sleep(2)

    def _flush(self, batch):
        if not self.url or not self.key:
            self._fallback_log(batch)
            return

        headers = {
            "apikey": self.key,
            "Authorization": f"Bearer {self.key}",
            "Content-Type": "application/json",
            "Prefer": "return=minimal"
        }

        try:
            # Direct REST API call to Supabase
            response = requests.post(self.endpoint, headers=headers, json=batch, timeout=10)
            if response.status_code in [200, 201]:
                logger.info(f"Successfully logged {len(batch)} events to Supabase via REST.")
            else:
                logger.error(f"Supabase REST error {response.status_code}: {response.text}")
                self._fallback_log(batch)
        except Exception as e:
            logger.error(f"Error during REST flush to Supabase: {e}")
            self._fallback_log(batch)

    def _fallback_log(self, batch):
        try:
            with open(self.fallback_path, "a") as f:
                for event in batch:
                    f.write(json.dumps(event) + "\n")
            logger.warning(f"Logged {len(batch)} events to fallback file.")
        except Exception as e:
            logger.error(f"CRITICAL: Failed to write to fallback log: {e}")

supabase_logger = SupabaseLogger()
