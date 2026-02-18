from supabase import create_client
import random

url = "https://easgxprkcqrzmaiiptok.supabase.co"
key = "sb_publishable_eJiVxyg_CPDWtX1Dx-sOzQ_PyRTGGih"

supabase = create_client(url, key)

lst_permanents = ["Nexus central", "Relais logique", "Extracteur d'Éther",
                  "Bastion", "Sanctuaire"]

lst_temp = ["Balise de stabilisation", "Catalyseur", "Balise d'expansion"]

nb_bat = 1
lat = (48.5000, 49.6000)
lng = (2.3333 ,2.4444)

for i in range(nb_bat):
    point = random.choice(lst_permanents)

    latitude = round(random.uniform(lat[0], lat[1]), 6)
    longitude = round(random.uniform(lng[0], lng[1]), 6)

    print(f"{point}: {latitude},{longitude}")

    try:
        response = supabase.table("pointimportant").insert({
            "nompointimportant": point,
            "longitude": longitude,
            "latitude": latitude,
            "idcarte": 1
        }).execute()

        print(response.data)
    except Exception as e:
        print("Err:", e)
