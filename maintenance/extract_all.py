import os
import zipfile
import xml.etree.ElementTree as ET
import shutil

docx_path = 'KITS.docx'
output_dir = 'public/images/products'
os.makedirs(output_dir, exist_ok=True)

ns = {
    'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main',
    'r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
}

with zipfile.ZipFile(docx_path, 'r') as docx:
    rels_xml = docx.read('word/_rels/document.xml.rels')
    root_rels = ET.fromstring(rels_xml)
    rid_to_path = {rel.get('Id'): rel.get('Target') for rel in root_rels.findall('.//{http://schemas.openxmlformats.org/package/2006/relationships}Relationship')}

    doc_xml = docx.read('word/document.xml')
    root_doc = ET.fromstring(doc_xml)
    
    image_index = 1
    for blip in root_doc.findall('.//{http://schemas.openxmlformats.org/drawingml/2006/main}blip'):
        rId = blip.get('{http://schemas.openxmlformats.org/officeDocument/2006/relationships}embed')
        if rId and rId in rid_to_path:
            source_path = f"word/{rid_to_path[rId]}"
            ext = os.path.splitext(source_path)[1]
            target_filename = f"image_{image_index}{ext}"
            target_path = os.path.join(output_dir, target_filename)
            
            with docx.open(source_path) as source, open(target_path, 'wb') as target:
                shutil.copyfileobj(source, target)
            image_index += 1

print(f"Extracted {image_index-1} raw images to {output_dir}")
