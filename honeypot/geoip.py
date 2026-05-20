import requests
from functools import lru_cache
import logging

logger = logging.getLogger(__name__)

class GeoIP:
    @staticmethod
    @lru_cache(maxsize=1000)
    def lookup(ip: str):
        """
        Looks up geolocation info for a given IP address using ip-api.com.
        """
        # Skip private IPs
        if ip.startswith(("127.", "192.168.", "10.", "172.16.")):
            return None

        try:
            # ip-api.com/json/{ip}?fields=status,message,country,countryCode,region,regionName,city,lat,lon,isp,as
            response = requests.get(f"http://ip-api.com/json/{ip}", timeout=5)
            response.raise_for_status()
            data = response.json()

            if data.get("status") == "fail":
                logger.warning(f"GeoIP lookup failed for {ip}: {data.get('message')}")
                return None

            return {
                "country_code": data.get("countryCode"),
                "country_name": data.get("country"),
                "city": data.get("city"),
                "asn": data.get("as"),
                "latitude": data.get("lat"),
                "longitude": data.get("lon"),
                "isp": data.get("isp")
            }
        except Exception as e:
            logger.error(f"Error during GeoIP lookup for {ip}: {e}")
            return None
