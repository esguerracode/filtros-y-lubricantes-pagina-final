
import requests
import json

url = 'https://filtrosylubricantes.co/wp-json/wc/v3/products'
params = {
    'consumer_key': 'ck_94239f46265fa5783236a3071ba498c243b6abe9',
    'consumer_secret': 'cs_737a842a7726787831bc1886b95ea80815ff7a2b',
    'per_page': 100
}

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

try:
    response = requests.get(url, params=params, headers=headers)
    if response.status_code == 200:
        products = response.json()
        print(f"Total Products: {len(products)}")
        output = []
        for p in products:
            output.append({"id": p['id'], "name": p['name']})
        
        with open('wc_names_dump.json', 'w', encoding='utf-8') as f:
            json.dump(output, f, indent=2, ensure_ascii=False)
        print("SUCCESS: Data dumped to wc_names_dump.json")
    else:
        print(f"ERROR {response.status_code}: {response.text}")
except Exception as e:
    print(f"EXCEPTION: {str(e)}")
