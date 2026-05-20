# HoneyTrap Security Rules

## 🛡️ Principles
- **Data Capture:** Captured credentials and payloads are for analysis and should be handled with care.
- **Key Protection:** Never expose `SUPABASE_SERVICE_KEY` on the client side.
- **Access Control:** 
  - Dashboard uses `anon` key + RLS (read-only).
  - Honeypot uses `service_role` key (insert-only via RLS).
- **Network Safety:** The honeypot should be isolated as much as possible.

## 🚨 Guidelines
1. **No secrets in code:** All keys (Supabase, GeoIP) must be in `.env`.
2. **Least Privilege:** Docker containers must run as non-root users.
3. **Input Validation:** Validate all inputs from the network.
4. **Key Rotation:** Rotate API keys every 90 days.
5. **Legal Disclaimer:** Deploy only on owned infrastructure. Never use for malicious purposes.
