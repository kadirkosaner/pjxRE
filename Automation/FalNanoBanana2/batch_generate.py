import sys
import json
import requests
from pathlib import Path
from dotenv import load_dotenv

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

SCRIPT_DIR = Path(__file__).parent.absolute()
load_dotenv(SCRIPT_DIR / ".env")

import fal_client

with open(SCRIPT_DIR / "config.json", "r") as f:
    config = json.load(f)

PROJECT_ROOT = Path(config["project_path"])
INPUT_DIR = SCRIPT_DIR / config["input_dir"]
OUTPUT_DIR = SCRIPT_DIR / config["output_dir"]
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

CHARACTERS = config["reference_mapping"]["characters"]
LOCATIONS = config["reference_mapping"]["locations"]
SCENE_CHAR_KEY = config["reference_mapping"]["scene_character"]


def load_prompts(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)
        if isinstance(data, dict):
            return data.get("scenes", []), data.get("scene_character", SCENE_CHAR_KEY)
        return data, SCENE_CHAR_KEY




def run_batch(file_path, limit=None):
    scenes, scene_char = load_prompts(file_path)

    if not scenes:
        print("No scenes found.")
        return

    if limit:
        scenes = scenes[:limit]

    print(f"Found {len(scenes)} scenes to generate (character: {scene_char}).\n")

    for scene in scenes:
        output_file = OUTPUT_DIR / f"{scene['id']}.webp"

        if output_file.exists():
            print(f"[SKIP] {scene['id']}")
            continue

        # Use refactored functions from Generator
        import Generator
        image_list = Generator.build_image_list(scene, scene_char)

        missing = [img[0].name for img in image_list if not img[0].exists()]
        if missing:
            print(f"[ERROR] {scene['id']} - missing: {', '.join(missing)}")
            continue

        roles_parts = [f"image{i+1}: {label}" for i, (_, label) in enumerate(image_list)]
        roles_desc = ", ".join(roles_parts)

        print(f"[GEN] {scene['id']} | {scene['location']} | {len(image_list)} images")
        print(f"  Roles: {roles_desc}")

        try:
            print(f"  Uploading...")
            image_urls = [fal_client.upload_file(str(p)) for p, _ in image_list]

            full_prompt = Generator.assemble_full_prompt(scene, scene_char, image_list)

            print(f"  Prompt: {full_prompt[:100]}...")

            result = fal_client.subscribe(
                config["fal_config"]["model"],
                arguments={
                    "prompt": full_prompt,
                    "image_urls": image_urls,
                    "aspect_ratio": config["fal_config"]["parameters"]["aspect_ratio"],
                    "resolution": config["fal_config"]["parameters"]["resolution"],
                },
                with_logs=True,
            )

            img_url = result["images"][0]["url"]
            img_data = requests.get(img_url).content
            with open(output_file, "wb") as f:
                f.write(img_data)
            print(f"  [OK] {output_file.name}")

        except Exception as e:
            print(f"  [FAIL] {e}")

        print()


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("path", help="Path to the JSON file to process")
    parser.add_argument("--limit", type=int, default=None, help="Limit number of scenes")
    args = parser.parse_args()
    
    run_batch(args.path, limit=args.limit)
