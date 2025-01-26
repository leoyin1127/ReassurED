import requests
from bs4 import BeautifulSoup
import time
import firebase_admin as fba
from firebase_admin import firestore
import json
from dotenv import load_dotenv
import googlemaps
import os

def time_to_minutes(time_str: str) -> float:
    h, m = map(int, time_str.split(':'))
    return h * 60.0 + m * 1.0

def percentage_to_float(percentage_str: str) -> float:
    return float(str(percentage_str).strip('%')) / 100.0

NOT_AVAILABLE = "currently not available"
NOT_APPLICABLE = "not applicable"

load_dotenv()  # Load environment variables from .env file

# Initialize Firebase (replace with your key file path)
cred = fba.credentials.Certificate("../resource/mchacks-39f08-firebase-adminsdk-fbsvc-e9f2462832.json")
app = fba.initialize_app(cred)

# Initialize Firestore
db = firestore.client()

data = db.collection("hospital").document("filteredHospitals").get().to_dict()
hospitals = data.get("hospitals")

for hospital in hospitals:
    hospital['total_waiting_time'] = hospital['total_waiting_time'] / 60.00 if hospital.get('total_waiting_time') != NOT_AVAILABLE else NOT_AVAILABLE
    hospital['travel_time'] /= 60.00
    hospital['avg_waiting_room_time'] = time_to_minutes(hospital.get('avg_waiting_room_time')) if hospital.get('avg_waiting_room_time') != NOT_AVAILABLE else NOT_AVAILABLE
    hospital['avg_stretcher_time'] = time_to_minutes(hospital.get('avg_stretcher_time')) if hospital.get('avg_stretcher_time') != NOT_AVAILABLE else NOT_AVAILABLE
    hospital['estimated_waiting_time'] = time_to_minutes(hospital.get('estimated_waiting_time')) if hospital.get('estimated_waiting_time') != NOT_AVAILABLE else NOT_AVAILABLE

db.collection("hospital").document("filteredHospitals").set({"hospitals": hospitals})

data = db.collection("hospital").document("hospitalsData").get().to_dict()
hospitals_data = data.get("hospitals")

for hospital in hospitals_data:
    hospital['total_waiting_time'] = hospital['total_waiting_time'] / 60.00 if hospital.get('total_waiting_time') != NOT_AVAILABLE else NOT_AVAILABLE
    hospital['travel_time'] /= 60.00
    hospital['stretcher_occupancy'] = percentage_to_float(hospital.get('stretcher_occupancy')) if hospital.get('stretcher_occupancy') != NOT_APPLICABLE else NOT_APPLICABLE
    hospital['avg_waiting_room_time'] = time_to_minutes(hospital.get('avg_waiting_room_time')) if hospital.get('avg_waiting_room_time') != NOT_AVAILABLE else NOT_AVAILABLE
    hospital['avg_stretcher_time'] = time_to_minutes(hospital.get('avg_stretcher_time')) if hospital.get('avg_stretcher_time') != NOT_AVAILABLE else NOT_AVAILABLE
    hospital['estimated_waiting_time'] = time_to_minutes(hospital.get('estimated_waiting_time')) if hospital.get('estimated_waiting_time') != NOT_AVAILABLE else NOT_AVAILABLE

db.collection("hospital").document("hospitalsData").set({"hospitals": hospitals_data})