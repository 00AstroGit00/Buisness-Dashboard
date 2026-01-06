"""
Asset Processing Pipeline for Business Dashboard.

This script automates the transformation of raw branding assets (JPG, PNG, SVG) 
into web-optimized formats, generating responsive variants and extracting 
color palettes for the design system.

Dependencies:
    - Pillow>=10.0.0
    - colorthief>=0.2.1

Usage:
    python process_assets.py
"""

import os
import json
from PIL import Image
from colorthief import ColorThief

# Configuration
RAW_DIR = "."
OUTPUT_DIR = "./processed_assets"
RESPONSIVE_WIDTHS = [480, 800, 1200]
ICON_SIZES = [64, 192, 512]

def extract_palette(image_path, color_count=6):
    """
    Extracts a color palette from an image using ColorThief.

    Args:
        image_path (str): Path to the source image.
        color_count (int): Number of colors to extract.

    Returns:
        list: A list of HEX color strings.
    """
    try:
        color_thief = ColorThief(image_path)
        palette = color_thief.get_palette(color_count=color_count)
        return ['#%02x%02x%02x' % rgb for rgb in palette]
    except Exception as e:
        print(f"Error extracting palette from {image_path}: {e}")
        return []

def process_image(filename):
    """
    Processes a single image file: converts to WebP, generates responsive 
    variants, and indexes metadata.

    Args:
        filename (str): Name of the file in the RAW_DIR.

    Returns:
        dict: Metadata about the processed assets.
    """
    base_name = os.path.splitext(filename)[0]
    file_path = os.path.join(RAW_DIR, filename)
    
    metadata = {
        "original": filename,
        "variants": [],
        "palette": extract_palette(file_path)
    }

    with Image.open(file_path) as img:
        # Save as WebP
        webp_path = os.path.join(OUTPUT_DIR, f"{base_name}.webp")
        img.save(webp_path, "WEBP", quality=80)
        metadata["variants"].append({"format": "webp", "path": webp_path})

        # Generate Responsive Variants
        for width in RESPONSIVE_WIDTHS:
            ratio = width / float(img.size[0])
            height = int(float(img.size[1]) * float(ratio))
            resized_img = img.resize((width, height), Image.Resampling.LANCZOS)
            
            variant_path = os.path.join(OUTPUT_DIR, f"{base_name}_{width}w.jpg")
            resized_img.save(variant_path, "JPEG", optimize=True, quality=85)
            metadata["variants"].append({"width": width, "path": variant_path})

    return metadata

def main():
    """
    Main entry point for the processing pipeline.
    Ensures output directory exists and processes all valid images.
    """
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)

    catalog = {"assets": []}
    
    valid_extensions = ('.jpg', '.jpeg', '.png')
    files = [f for f in os.listdir(RAW_DIR) if f.lower().endswith(valid_extensions)]

    print(f"🔄 Processing {len(files)} assets...")

    for filename in files:
        print(f"  → Processing {filename}...")
        asset_metadata = process_image(filename)
        catalog["assets"].append(asset_metadata)

    # Save Catalog
    catalog_path = os.path.join(OUTPUT_DIR, "catalog.json")
    with open(catalog_path, "w") as f:
        json.dump(catalog, f, indent=4)

    print(f"✅ Success! Catalog generated at {catalog_path}")

if __name__ == "__main__":
    main()
