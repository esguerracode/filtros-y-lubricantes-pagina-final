import os
import shutil

# Manual mapping based on document order and product IDs
final_map = {
    101: "image_1", 111: "image_2", 112: "image_3", 113: "image_4", 114: "image_5", 102: "image_6",
    103: "image_7", 115: "image_8", 116: "image_9", 117: "image_11",
    104: "image_12", 118: "image_13", 119: "image_14", 120: "image_15", 105: "image_16",
    106: "image_18", 122: "image_20", 123: "image_21",
    107: "image_22", 124: "image_24", 125: "image_25", 126: "image_27",
    108: "image_28", 127: "image_30", 129: "image_31", 128: "image_32", 130: "image_33",
    109: "image_34", 131: "image_37", 132: "image_36", 133: "image_38", 110: "image_27"
}

output_dir = 'public/images/products'
raw_files = os.listdir(output_dir)

for pid, raw_prefix in final_map.items():
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

for f in raw_files:
    if f.startswith("image_"):
        os.remove(os.path.join(output_dir, f))
