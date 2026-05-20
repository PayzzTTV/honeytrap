import unittest
from honeypot.ssh_trap import SSHServer
from honeypot.http_trap import log_http_event
from unittest.mock import MagicMock, patch

class TestScoringLogic(unittest.TestCase):
    def test_ssh_threat_score(self):
        server = SSHServer("1.2.3.4")
        # Mock the logger to avoid network calls
        with patch('honeypot.ssh_trap.supabase_logger') as mock_logger:
            with patch('honeypot.ssh_trap.GeoIP.lookup') as mock_geo:
                mock_geo.return_value = {"country_code": "US"}
                
                # Test high risk attempt
                server.check_auth_password("root", "123456")
                # Extract the logged event
                args, _ = mock_logger.log_event.call_args
                event = args[0]
                self.assertEqual(event['threat_score'], 50) # 30 (root) + 20 (common pass)
                
                # Test low risk attempt
                server.check_auth_password("normal_user", "random_string_xyz")
                args, _ = mock_logger.log_event.call_args
                event = args[0]
                self.assertEqual(event['threat_score'], 0)

if __name__ == '__main__':
    unittest.main()
