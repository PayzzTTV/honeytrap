import threading
import signal
import sys
import logging
from config import config
from ssh_trap import start_ssh_trap
from http_trap import start_http_trap
from logger import supabase_logger

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def signal_handler(sig, frame):
    logger.info("Signal received, shutting down...")
    # Flush remaining logs
    # Note: In a real app, we'd wait for the logger thread to finish its last flush
    sys.exit(0)

def main():
    # Validate environment
    try:
        config.validate()
        logger.info("Configuration validated.")
    except EnvironmentError as e:
        logger.error(f"Configuration error: {e}")
        # We don't exit to allow testing/fallback, but in production we should
    
    # Set up signal handling
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)

    # Start traps in separate threads
    ssh_thread = threading.Thread(target=start_ssh_trap, daemon=True)
    http_thread = threading.Thread(target=start_http_trap, daemon=True)

    ssh_thread.start()
    http_thread.start()

    logger.info("HoneyTrap is active. Press Ctrl+C to stop.")
    
    # Keep main thread alive
    while True:
        ssh_thread.join(timeout=1)
        http_thread.join(timeout=1)
        if not ssh_thread.is_alive() or not http_thread.is_alive():
            logger.error("One of the traps has stopped unexpectedly.")
            break

if __name__ == "__main__":
    main()
