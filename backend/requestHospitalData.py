import requests
from bs4 import BeautifulSoup
import time
import firebase_admin as fba
from firebase_admin import firestore
import json
from dotenv import load_dotenv

BASE_URL = "https://www.quebec.ca/en/health/health-system-and-services/service-organization/quebec-health-system-and-its-services/situation-in-emergency-rooms-in-quebec"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
}


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
    load_dotenv()  # Load environment variables from.env file

    # Initialize Firebase (replace with your key file path)
    cred = fba.credentials.Certificate("../resource/mchacks-39f08-firebase-adminsdk-fbsvc-e9f2462832.json")
    app = fba.initialize_app(cred)

    # Initialize Firestore
    db = firestore.client()

    data = scrape_hospital_data()

    for hospital in data:
        if hospital.get('name') == 'Ensemble du Québec':
            data.remove(hospital)

    db.collection("hospital").document("hospitalsData").set({"hospitals": data})

    # with open("../resource/hospitals.json", "w", encoding="utf-8") as f:
    #     json.dump(data, f, ensure_ascii=False, indent=4)

    print(f"Scraped {len(data)} hospitals. Data saved to firestore database.")