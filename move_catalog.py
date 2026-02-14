import os

# Manual mapping based on document order and product IDs
# Each image in public/images/products (image_1.png, image_2.jpeg, etc.)
# corresponds to a specific product ID.

mapping = {
    "image_1": 101,  # Kit Revo
    "image_2": 111,  # AIP 977
    "image_3": 112,  # ACP 138
    "image_4": 113,  # OLP 067
    "image_5": 114,  # FLP 476
    "image_6": 102,  # Mobil Delvac
    "image_7": 103,  # Kit Vigo
    "image_8": 115,  # AIP 651
    "image_9": 116,  # ACP 071
    "image_11": 117, # FLP 355
    "image_12": 104, # Kit Nissan Gasoline
    "image_13": 118, # AIP 961
    "image_14": 119, # ACP 123
    "image_15": 120, # OLP 019
    "image_16": 105, # Mobil 10w30
    "image_18": 106, # Kit Nissan Diesel
    "image_20": 122, # OLP 077
    "image_21": 123, # FLP 472
    "image_22": 107, # Kit Ford Nacional
    "image_24": 124, # OLP 115
    "image_25": 125, # ACP 120
    "image_26": 212, # FLP 509 (Wait, ID is 212 in doc analysis?) -> check constants.ts
    "image_27": 126, # Motorcraft 10w30
    "image_28": 108, # Kit Ford 2022
    "image_30": 127, # EB3Z-9365B
    "image_31": 129, # JU2Z-6731A
    "image_32": 128, # MG2MZ9601B
    "image_33": 130, # HB3Z19N619B
    "image_34": 109, # Kit Ford 2025
    "image_36": 132, # MB3Z-9601C
    "image_37": 131, # KV61-9155AG
    "image_38": 133, # MB3Z19N619C
}

# Correcting IDs based on constants.ts reality
# 125 FLP 509 -> wait, I have it as 125 in the script but 208 in doc?
# Let's check IDs in constants.ts again from the previous view.
# OLP 115: 124, FLP 509: 125, Motorcraft 10w30: 126
# EB3Z: 127, MG2MZ: 128, JU2Z: 129, HB3Z: 130
# KV61: 131, MB3Z-9601C: 132, MB3Z19N619C: 133

# Refined map:
final_map = {
    101: "image_1", 111: "image_2", 112: "image_3", 113: "image_4", 114: "image_5", 102: "image_6",
    103: "image_7", 115: "image_8", 116: "image_9", 117: "image_11",
    104: "image_12", 118: "image_13", 119: "image_14", 120: "image_15", 105: "image_16",
    106: "image_18", 122: "image_20", 123: "image_21",
    107: "image_22", 124: "image_24", 125: "image_25", 126: "image_27",
    108: "image_28", 127: "image_30", 129: "image_31", 128: "image_32", 130: "image_33",
    109: "image_34", 131: "image_37", 132: "image_36", 133: "image_38", 110: "image_27" # reusing oil image for 110
}

output_dir = 'public/images/products'
raw_files = os.listdir(output_dir)

for pid, raw_prefix in final_map.items():
    # Find matching raw file
    found = False
    for f in raw_files:
        if f.startswith(raw_prefix + "."):
            ext = os.path.splitext(f)[1]
            target = f"{pid}{ext}"
            shutil.copy(os.path.join(output_dir, f), os.path.join(output_dir, target))
            print(f"Mapped {f} -> {target}")
            found = True
            break
    if not found:
        print(f"MISSING: {raw_prefix} for PID {pid}")

# Clean up raw image_N files
for f in raw_files:
    if f.startswith("image_"):
        os.remove(os.path.join(output_dir, f))
