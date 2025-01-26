import json
from dotenv import load_dotenv
import os
import firebase_admin as fba
from firebase_admin import firestore
import json
import re

def clean_address(address):
    """Remove unwanted characters and normalize spacing"""
    # Remove non-address characters (preserve letters, numbers, basic punctuation)
    cleaned = re.sub(r'[^\w\s,.\'-/]', '', address, flags=re.UNICODE)
    # Collapse multiple spaces and trim
    return re.sub(r'\s+', ' ', cleaned).strip()

load_dotenv()  # Load environment variables from.env file

# Initialize Firebase (replace with your key file path)
cred = fba.credentials.Certificate("../resource/mchacks-39f08-firebase-adminsdk-fbsvc-e9f2462832.json")
app = fba.initialize_app(cred)

# Initialize Firestore
db = firestore.client()

data = db.collection("hospital").document("distanceMatrix").get().to_dict().get('distance_matrix')
# with open("temp_distance_matrix_dump.json", "w", encoding="utf-8") as f:
#     f.write(json.dumps(data, indent=4))
# print(data['distance_matrix'])

processed = []
for entry in data:
    destinations = entry.get('destination_addresses', [])
    elements = entry.get('rows', [{}])[0].get('elements', [])

    for addr, element in zip(destinations, elements):
        if element.get('status') == 'OK' and (dur := element.get('duration', {}).get('value', float('inf'))) <= 3600:
            processed.append((dur, addr))

# Sort by duration and clean addresses
processed.sort(key=lambda x: x[0])
seen = set()
result = []
for dur, addr in processed:
    cleaned = clean_address(addr)
    if cleaned and cleaned not in seen:
        seen.add(cleaned)
        result.append(cleaned)

print("Unique, cleaned addresses sorted by commute time:")
for address in result:
    print(address)

db.collection("hospital").document("qualifyingAddresses").set({"addresses": result})