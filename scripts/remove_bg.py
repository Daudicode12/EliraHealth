#!/usr/bin/env python3
import os
import sys
from pathlib import Path
from PIL import Image

try:
    from rembg import remove
except ImportError:
    print("Error: 'rembg' library is not installed. Run 'pip install rembg' first.")
    sys.exit(1)

def main():
    # Base directory of the project
    base_dir = Path(__file__).resolve().parent.parent
    images_dir = base_dir / "public" / "images"

    if not images_dir.exists():
        print(f"Error: Images directory {images_dir} does not exist.")
        sys.exit(1)

    print(f"Scanning for PNG images in: {images_dir}")
    png_files = list(images_dir.glob("*.png"))

    if not png_files:
        print("No PNG images found in the directory.")
        return

    print(f"Found {len(png_files)} images to process:")
    for f in png_files:
        print(f" - {f.name}")

    print("\nStarting background removal...")
    for index, img_path in enumerate(png_files, 1):
        print(f"[{index}/{len(png_files)}] Processing {img_path.name}...", end="", flush=True)
        try:
            # Open the image
            with Image.open(img_path) as img:
                # Remove background
                output = remove(img)
                # Save transparent PNG
                output.save(img_path, "PNG")
            print(" Done! (Background removed)")
        except Exception as e:
            print(f" Failed!\nError: {e}")

    print("\nAll images processed successfully!")

if __name__ == "__main__":
    main()
