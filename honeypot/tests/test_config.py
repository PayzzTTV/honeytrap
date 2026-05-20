import unittest
import os
from honeypot.config import Config

class TestConfig(unittest.TestCase):
    def test_validation_missing_vars(self):
        # Clear env vars for test
        old_url = os.environ.get("SUPABASE_URL")
        old_key = os.environ.get("SUPABASE_SERVICE_KEY")
        
        if "SUPABASE_URL" in os.environ: del os.environ["SUPABASE_URL"]
        if "SUPABASE_SERVICE_KEY" in os.environ: del os.environ["SUPABASE_SERVICE_KEY"]
        
        # We need to re-initialize or mock the class because it reads on import
        class MockConfig(Config):
            SUPABASE_URL = None
            SUPABASE_SERVICE_KEY = None
            
        with self.assertRaises(EnvironmentError):
            MockConfig.validate()
            
        # Restore (optional, as env is process-wide)
        if old_url: os.environ["SUPABASE_URL"] = old_url
        if old_key: os.environ["SUPABASE_SERVICE_KEY"] = old_key

if __name__ == '__main__':
    unittest.main()
