import googlemaps
import requests
from dotenv import load_dotenv
import os
import firebase_admin as fba
from firebase_admin import firestore
import urllib.parse
import json

DISTANCE_MATRIX_JSON = "../resource/distance_matrix.json"

load_dotenv()  # Load environment variables from.env file

# Initialize Google Maps API client
google_api_key = os.getenv("GOOGLE_MAP_PLATFORM_API_KEY")
gmaps = googlemaps.Client(key=google_api_key)

def transform_geocode(address) -> str:
    geoloc = gmaps.geocode(address)
    return (str(geoloc[0]['geometry']['location']['lat']) + "%2C"
            + str(geoloc[0]['geometry']['location']['lng']) + "%7C")

# Initialize Firebase
firestore_cred = fba.credentials.Certificate("../resource/mchacks-39f08-firebase-adminsdk-fbsvc-e9f2462832.json")
firestore_app = fba.initialize_app(firestore_cred)

# Initialize Firestore
db = firestore.client()

# Fetch hospitals data from Firestore
hospitals_ref = db.collection("hospital").document("hospitalsData").get()
hospitals_data = hospitals_ref.to_dict()
hospitals = hospitals_data.get("hospitals")

# d = ["" for _ in range(12)]
#
# for i in range(11):
#     for j in range(10):
#         d[i] += transform_geocode(hospitals[i*10+j]['address'])
# for j in range(5):
#     d[11] += transform_geocode(hospitals[11*10+j]['address'])
#
# (db.collection("hospital")
#  .document("hospitalGeocode")
#  .set({"hospital_geocode_unity0": d[0],
#        "hospital_geocode_unity1": d[1],
#        "hospital_geocode_unity2": d[2],
#        "hospital_geocode_unity3": d[3],
#        "hospital_geocode_unity4": d[4],
#        "hospital_geocode_unity5": d[5],
#        "hospital_geocode_unity6": d[6],
#        "hospital_geocode_unity7": d[7],
#        "hospital_geocode_unity8": d[8],
#        "hospital_geocode_unity9": d[9],
#        "hospital_geocode_unity10": d[10],
#        "hospital_geocode_unity11": d[11]}))

# Fetch hospital geocode data from Firestore
hospital_geocode_ref = db.collection("hospital").document("hospitalGeocode").get()
hospital_geocode_data = hospital_geocode_ref.to_dict()
hospital_geocode = hospital_geocode_data.get("hospital_geocode_unity")

# Fetch user's location from Firestore
user_ref = db.collection("user").document("google-oauth2|100496775126729065378").get()

# Set arbitrary for reference until real data is available
# origin = transform_geocode("2007 Av. Beaconsfield, Montréal, QC H4A 2G7")
origin = "45.464644%2C-73.6157698%7C"
# print(origin)
destination = ["" for _ in range(12)]
for i in range(12):
    last_path = f"hospital_geocode_unity{i}"
    destination[i] = db.collection("hospital").document("hospitalGeocode").get().to_dict()[last_path]

# Calculate the distance between the user's location and each hospital's location
base_url = [f"""https://maps.googleapis.com/maps/api/distancematrix/json?origins={origin}&destinations={destination[i]}&key={google_api_key}""" for i in range(12)]

with open(DISTANCE_MATRIX_JSON, "w", encoding="utf-8") as f:
    f.write("{\n")
    f.write("  \"distance_matrix\": [\n")
for url in base_url:
    distance_matrix_response = requests.get(url)
    with open(DISTANCE_MATRIX_JSON, "a", encoding="utf-8") as f:
        f.write(distance_matrix_response.text)
        f.write(",\n")
with open(DISTANCE_MATRIX_JSON, "a", encoding="utf-8") as f:
    f.write("{\"endFlag\": true}\n")
    f.write("]\n")
    f.write("}")


# Parse and store the distance data in Firestore
with open(DISTANCE_MATRIX_JSON, "r", encoding="utf-8") as f:
    data = json.load(f)
db.collection("hospital").document("distanceMatrix").set(data)