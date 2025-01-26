import requests
from bs4 import BeautifulSoup
import time
import firebase_admin as fba
from firebase_admin import firestore
import json
from dotenv import load_dotenv
import googlemaps
import os

BASE_URL = "https://www.quebec.ca/en/health/health-system-and-services/service-organization/quebec-health-system-and-its-services/situation-in-emergency-rooms-in-quebec"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
}
NOT_AVAILABLE = "currently not available"
NOT_APPLICABLE = "not applicable"

load_dotenv()  # Load environment variables from.env file

# Initialize Google Maps API client
google_api_key = os.getenv("GOOGLE_MAP_PLATFORM_API_KEY")
gmaps = googlemaps.Client(key=google_api_key)

def calc(i: float, N: float, T: float, O: float, A_prev: float, S_prev: float):
    return 0.75 ** (5.5 - i) * ((i / 5) ** 4 * (90 * N / T + 60 * O + 0.6 * A_prev + 0.4 * S_prev) + 0.35 * A_prev * (i / 5) ** 1.5 + 0.25 * S_prev * (i / 5) ** 2)

def time_to_minutes(time_str: str) -> float:
    h, m = map(int, time_str.split(':'))
    return h * 60.0 + m * 1.0

def percentage_to_float(percentage_str: str) -> float:
    return float(str(percentage_str).strip('%')) / 100.0

def transform_geocode(address) -> str:
    geoloc = gmaps.geocode(address)
    return (str(geoloc[0]['geometry']['location']['lat']) + "%2C"
            + str(geoloc[0]['geometry']['location']['lng']) + "%7C")

def scrape_hospital_data():
    hospitals = []

    for page_num in range(1, 13):
        print(f"Scraping page {page_num}/12...")
        params = {
            "tx_solr[location]": "",
            "tx_solr[page]": page_num,
            "tx_solr[pt]": ""
        }

        response = requests.get(BASE_URL, params=params, headers=HEADERS)
        if response.status_code != 200:
            print(f"Failed to fetch page {page_num}")
            continue

        soup = BeautifulSoup(response.text, "html.parser")
        hospital_elements = soup.find_all("div", class_="hospital_element")

        for element in hospital_elements:
            hospital = {}

            # Extract name and address
            title_section = element.find("li", class_="title")
            if title_section:
                hospital["name"] = title_section.find("div", class_="font-weight-bold").get_text(strip=True)
                address_div = title_section.find("div", class_="adresse")
                hospital["address"] = address_div.get_text(separator=" ", strip=True) if address_div else "N/A"

            # Extract metrics
            metrics = element.find_all("li", class_="hopital-item")
            for metric in metrics:
                div = metric.find_all("div")[1] if len(metric.find_all("div")) > 1 else None
                if div:
                    full_text = div.get_text(strip=True)
                    if ":" in full_text:
                        label_part, value_part = full_text.split(":", 1)
                        label = label_part.strip()
                        value = value_part.strip()
                    else:
                        label = full_text
                        value = "N/A"

                    # Map labels to keys
                    if "Estimated waiting time for non-priority cases" in label:
                        hospital["estimated_waiting_time"] = value
                    elif "Number of people waiting to see a doctor" in label:
                        hospital["waiting_count"] = value
                    elif "Total number of people in the emergency room" in label:
                        hospital["total_people"] = value
                    elif "Occupancy rate of stretchers" in label:
                        hospital["stretcher_occupancy"] = value
                    elif "Average time in the waiting room" in label:
                        hospital["avg_waiting_room_time"] = value
                    elif "Average waiting time on a stretcher" in label:
                        hospital["avg_stretcher_time"] = value

            hospitals.append(hospital)

        time.sleep(0.5)

    return hospitals


if __name__ == "__main__":
    # Initialize Firebase (replace with your key file path)
    cred = fba.credentials.Certificate("../resource/mchacks-39f08-firebase-adminsdk-fbsvc-e9f2462832.json")
    app = fba.initialize_app(cred)

    # Initialize Firestore
    db = firestore.client()

    user_ref = db.collection("users").document("google-oauth2|100496775126729065378").get()
    # print(user_ref.to_dict())
    user_location = user_ref.to_dict().get('lastLocation')
    user_loc_str = f"{user_location['latitude']}%2C{user_location['longitude']}%7C"

    data = scrape_hospital_data()

    for hospital in data:
        if hospital.get('name') == 'Ensemble du Québec':
            data.remove(hospital)

    for hospital in data:
        hospital_address = transform_geocode(hospital['address'])
        hospital['Lat'] = gmaps.geocode(hospital['address'])[0]['geometry']['location']['lat']
        hospital['Lng'] = gmaps.geocode(hospital['address'])[0]['geometry']['location']['lng']
        # distance_result = gmaps.distance_matrix(user_loc_str, transform_geocode(hospital['address']), mode="driving")
        distance_result = requests.get(f"https://maps.googleapis.com/maps/api/distancematrix/json?origins={user_loc_str}&destinations={hospital_address}&key={google_api_key}")
        # print(distance_result.text)
        distance = distance_result.json().get('rows', [{}])[0].get('elements', [{}])[0].get('duration', {}).get('value')
        # distance_info = distance_result.text.get('rows', [{}])[0].get('elements', [{}])[0]
        # print(distance_info)
        hospital['travel_time'] = distance
        if hospital['estimated_waiting_time'] != "currently not available":
            wait_time = (int(hospital['estimated_waiting_time'].split(':')[0]) * 3600 +
                         int(hospital['estimated_waiting_time'].split(':')[1]) * 60)
            hospital['total_waiting_time'] = (
                    hospital['travel_time'] +
                    wait_time)
        else:
            hospital['total_waiting_time'] = "currently not available"


    db.collection("hospital").document("hospitalsData").set({"hospitals": data})

    # with open("../resource/hospitals.json", "w", encoding="utf-8") as f:
    #     json.dump(data, f, ensure_ascii=False, indent=4)

    print(f"Scraped {len(data)} hospitals. Data saved to firestore database.")

    result = []
    data = db.collection("hospital").document("hospitalsData").get().to_dict().get('hospitals')
    for hospital in data:
        if (hospital.get('travel_time') <= 3600 and hospital.get('total_waiting_time') != "currently not available"):
            result.append(hospital)
    result.sort(key=lambda x: float(x.get('total_waiting_time', float('inf'))))
    # print(result)
    db.collection("hospital").document("filteredHospitals").set({"hospitals": result})

    print(f"Filtered {len(result)} hospitals. Data saved to firestore database.")

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

    print(f"Calculated triage level wait times for {len(hospitals)} hospitals. Data saved to firestore database.")

    data = db.collection("hospital").document("filteredHospitals").get().to_dict()
    hospitals = data.get("hospitals")

    for hospital in hospitals:
        hospital['total_waiting_time'] = hospital['total_waiting_time'] / 60.00 if hospital.get(
            'total_waiting_time') != NOT_AVAILABLE else NOT_AVAILABLE
        hospital['travel_time'] /= 60.00
        hospital['avg_waiting_room_time'] = time_to_minutes(hospital.get('avg_waiting_room_time')) if hospital.get(
            'avg_waiting_room_time') != NOT_AVAILABLE else NOT_AVAILABLE
        hospital['avg_stretcher_time'] = time_to_minutes(hospital.get('avg_stretcher_time')) if hospital.get(
            'avg_stretcher_time') != NOT_AVAILABLE else NOT_AVAILABLE
        hospital['estimated_waiting_time'] = time_to_minutes(hospital.get('estimated_waiting_time')) if hospital.get(
            'estimated_waiting_time') != NOT_AVAILABLE else NOT_AVAILABLE

    db.collection("hospital").document("filteredHospitals").set({"hospitals": hospitals})

    data = db.collection("hospital").document("hospitalsData").get().to_dict()
    hospitals_data = data.get("hospitals")

    for hospital in hospitals_data:
        hospital['total_waiting_time'] = hospital['total_waiting_time'] / 60.00 if hospital.get(
            'total_waiting_time') != NOT_AVAILABLE else NOT_AVAILABLE
        hospital['travel_time'] /= 60.00
        hospital['stretcher_occupancy'] = percentage_to_float(hospital.get('stretcher_occupancy')) if hospital.get(
            'stretcher_occupancy') != NOT_APPLICABLE else NOT_APPLICABLE
        hospital['avg_waiting_room_time'] = time_to_minutes(hospital.get('avg_waiting_room_time')) if hospital.get(
            'avg_waiting_room_time') != NOT_AVAILABLE else NOT_AVAILABLE
        hospital['avg_stretcher_time'] = time_to_minutes(hospital.get('avg_stretcher_time')) if hospital.get(
            'avg_stretcher_time') != NOT_AVAILABLE else NOT_AVAILABLE
        hospital['estimated_waiting_time'] = time_to_minutes(hospital.get('estimated_waiting_time')) if hospital.get(
            'estimated_waiting_time') != NOT_AVAILABLE else NOT_AVAILABLE

    db.collection("hospital").document("hospitalsData").set({"hospitals": hospitals_data})
    print(f"Converted all times to minutes. Data saved to firestore database.")