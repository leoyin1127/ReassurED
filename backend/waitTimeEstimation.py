import googlemaps
import requests
from dotenv import load_dotenv
import os
import firebase_admin as fba
from firebase_admin import firestore
import urllib.parse
import json

def calc(i: float, N: float, T: float, O: float, A_prev: float, S_prev: float):
    return 0.75 ** (5.5 - i) * ((i / 5) ** 4 * (90 * N / T + 60 * O + 0.6 * A_prev + 0.4 * S_prev) + 0.35 * A_prev * (i / 5) ** 1.5 + 0.25 * S_prev * (i / 5) ** 2)

def time_to_minutes(time_str: str) -> float:
    h, m = map(int, time_str.split(':'))
    return h * 60.0 + m * 1.0

def percentage_to_float(percentage_str: str) -> float:
    return float(percentage_str.strip('%')) / 100.0

load_dotenv()

# Initialize Firebase
firestore_cred = fba.credentials.Certificate("../resource/mchacks-39f08-firebase-adminsdk-fbsvc-e9f2462832.json")
firestore_app = fba.initialize_app(firestore_cred)

# Initialize Firestore
db = firestore.client()

data = db.collection("hospital").document("filteredHospitals").get().to_dict()
hospitals = data.get("hospitals")

for hospital in hospitals:
    N = float(hospital.get('waiting_count'))
    T = float(hospital.get('total_people'))
    O = percentage_to_float(hospital.get('stretcher_occupancy'))
    A_prev = time_to_minutes(hospital.get('avg_waiting_room_time'))
    S_prev = time_to_minutes(hospital.get('avg_stretcher_time'))
    for i in range(1, 6):
        hospital[f'triage_level_{i}'] = calc(i, N, T, O, A_prev, S_prev)

db.collection("hospital").document("filteredHospitals").set({"hospitals": hospitals})