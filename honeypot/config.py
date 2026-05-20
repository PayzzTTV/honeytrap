import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SUPABASE_URL = os.getenv("SUPABASE_URL")
    SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
    # ip-api.com free tier doesn't require a key, but we'll keep it for extensibility
    GEOIP_API_KEY = os.getenv("GEOIP_API_KEY")

    @classmethod
    def validate(cls):
        required_vars = ["SUPABASE_URL", "SUPABASE_SERVICE_KEY"]
        missing = [var for var in required_vars if not getattr(cls, var)]
        if missing:
            raise EnvironmentError(f"Missing required environment variables: {', '.join(missing)}")

config = Config()
