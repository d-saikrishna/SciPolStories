import requests

def get_aqi(lat, lon, token):
    url = f"https://api.waqi.info/feed/geo:{lat};{lon}/?token={token}"
    response = requests.get(url)
    data = response.json()

    if data["status"] == "ok":
        aqi = data["data"]["aqi"]
        location = data["data"]["city"]["name"]
        print(f"Location: {location}, AQI: {aqi}")
        return aqi
    else:
        print("Error fetching AQI:", data["data"])
        return None

# Example usage
lat = 28.6139   # New Delhi latitude
lon = 77.2090   # New Delhi longitude
token = "d7f35f8bbf5a998b95331e9e8ae23003f66c44cf"
get_aqi(lat, lon, token)
