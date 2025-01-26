import requests
from bs4 import BeautifulSoup
import time
import firebase_admin as fba
from firebase_admin import firestore
import json
from dotenv import load_dotenv

load_dotenv()  # Load environment variables from .env file

cred = fba.credentials.Certificate("../resource/mchacks-39f08-firebase-adminsdk-fbsvc-e9f2462832.json")
app = fba.initialize_app(cred)

# Initialize Firestore
db = firestore.client()

with open("../resource/hospital_geocode.txt", "r", encoding="utf-8") as f:
    data = f.read()

db.collection("hospital").document("hospitalGeocode").set({"hospital_geocode_unity": data})