# HoneyTrap Project Guidelines

This file contains the foundational mandates for the HoneyTrap project.

## 🎯 Project Overview
HoneyTrap is a portfolio-ready SSH and HTTP honeypot with a threat intelligence dashboard.

## 🏗️ Architecture
- **Backend:** Python (Paramiko, Flask)
- **Database:** Supabase (PostgreSQL)
- **Frontend:** Next.js 14, Tailwind CSS, Recharts
- **Infrastructure:** Docker Compose (non-root)

## 🛠️ Development Workflow
1. **Research:** Map the codebase and validate assumptions.
2. **Strategy:** Formulate a plan.
3. **Execution:** Plan -> Act -> Validate.

## 🔒 Security Mandates
- **No Hardcoded Secrets:** Use environment variables.
- **Non-Root Containers:** Always use `USER 1001` in Dockerfiles.
- **RLS Enabled:** Supabase Row Level Security must be strictly enforced.
- **Robustness:** The honeypot must never crash; use extensive error handling.

## 📂 File Structure
Follow the structure defined in the initial prompt.

## 📜 Coding Standards
- **Python:** Use type hints, Google-style docstrings, and follow PEP 8.
- **Next.js:** App Router, Server Components where possible, Tailwind for styling.
- **SQL:** Migrations/Schema in `supabase/schema.sql`.
