import requests
from bs4 import BeautifulSoup
import time
import firebase_admin as fba
from firebase_admin import firestore
import json
from dotenv import load_dotenv
import googlemaps
import os

load_dotenv()  # Load environment variables from.env file

# Initialize Firebase (replace with your key file path)
cred = fba.credentials.Certificate("../resource/mchacks-39f08-firebase-adminsdk-fbsvc-e9f2462832.json")
app = fba.initialize_app(cred)

# Initialize Firestore
db = firestore.client()

