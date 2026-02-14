import os
import zipfile
import xml.etree.ElementTree as ET
import shutil
import re

docx_path = 'KITS.docx'
output_dir = 'public/images/products'
constants_path = 'src/constants.ts'
os.makedirs(output_dir, exist_ok=True)

ns = {
    'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main',
    'r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
    'wp': 'http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing',
    'a': 'http://schemas.openxmlformats.org/drawingml/2006/main',
}

# Mapping: Search Text in Doc -> Product ID in constants.ts
product_id_map = {
    "AIP 977": 111, "ACP 138": 112, "OLP 067": 113, "FLP 476": 114, "KIT TOYOTA REVO": 101,
    "AIP 651": 115, "ACP 071": 116, "FLP 355": 117, "KIT TOYOTA VIGO": 103,
    "AIP 961": 118, "ACP 123": 119, "OLP 019": 120, "KIT NISSAN NP 300 GASOLINA": 104,
    "OLP 077": 122, "FLP 472": 123, "KIT NISSAN NP 300 DIESEL": 106,
    "AIP 892": 107, "OLP 115": 124, "ACP 120": 125, "FLP 509": 125,
    "MOTORCRAF 10W30": 126, "KIT FORD RANGER FILTROS NAC": 107,
    "EB3Z-9365B": 127, "JU2Z-6731A": 129, "MG2MZ9601B": 128, "HB3Z19N619B": 130, "RANGER ORIGINAL 2022-2024": 108,
    "MB3Z-9601C": 132, "KV61-9155AG": 131, "MB3Z19N619C": 133, "MOTROCRAF 5W30": 110, "RANGER ORIGINAL 2025-2026": 109,
    "MOBIL DELVAC 15W40": 102, "MOBIL 10W30": 105
}

saved_files = {}

with zipfile.ZipFile(docx_path, 'r') as docx:
    rels_xml = docx.read('word/_rels/document.xml.rels')
    root_rels = ET.fromstring(rels_xml)
    rid_to_path = {rel.get('Id'): rel.get('Target') for rel in root_rels.findall('.//{http://schemas.openxmlformats.org/package/2006/relationships}Relationship')}

    doc_xml = docx.read('word/document.xml')
    root_doc = ET.fromstring(doc_xml)
    
    current_product_id = None

    for p in root_doc.findall('.//w:p', ns):
        text = "".join(t.text for t in p.findall('.//w:t', ns) if t.text).strip()
        
        # Check for matching product in this paragraph
        found_pid = None
        for search_text, pid in product_id_map.items():
            if search_text in text.upper():
                found_pid = pid
                break
        
        if found_pid:
            current_product_id = found_pid
            print(f"DEBUG: Context switched to PID {current_product_id} by '{text}'")
        
        blips = p.findall('.//a:blip', ns)
        for blip in blips:
            rId = blip.get('{http://schemas.openxmlformats.org/officeDocument/2006/relationships}embed')
            if rId and rId in rid_to_path and current_product_id:
                source_path = f"word/{rid_to_path[rId]}"
                ext = os.path.splitext(source_path)[1]
                target_filename = f"{current_product_id}{ext}"
                target_path = os.path.join(output_dir, target_filename)
                
                with docx.open(source_path) as source, open(target_path, 'wb') as target:
                    shutil.copyfileobj(source, target)
                
                saved_files[current_product_id] = f"/images/products/{target_filename}"
                print(f"✅ Saved: {target_filename} for product {current_product_id}")

# 2. Update constants.ts
with open(constants_path, 'r', encoding='utf-8') as f:
    content = f.read()

updated_count = 0
for pid, web_path in saved_files.items():
    # Update image field for the product ID
    pattern = rf"(id:\s*{pid},.*?image:\s*')https?://[^\s']+"
    replacement = rf"\1{web_path}"
    new_content = re.sub(pattern, replacement, content, flags=re.DOTALL)
    if new_content != content:
        content = new_content
        updated_count += 1

with open(constants_path, 'w', encoding='utf-8') as f:
    f.write(content)

print(f"\n🚀 SUCCESS: Updated constants.ts with {updated_count} unique product images.")
