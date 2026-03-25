import sys
import os
import json
import threading
from pathlib import Path
from tkinter import (
    Tk, Frame, Label, Button, Checkbutton, Spinbox, IntVar, BooleanVar,
    filedialog, messagebox, scrolledtext, Canvas, Scrollbar, VERTICAL, LEFT,
    RIGHT, BOTH, Y, X, TOP, BOTTOM, W, NW, DISABLED, NORMAL, END,
    StringVar, OptionMenu,
)
from dotenv import load_dotenv
from PIL import Image

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

SCRIPT_DIR = Path(__file__).parent.absolute()
load_dotenv(SCRIPT_DIR / ".env")

from google import genai
from google.genai import types


def create_gemini_client():
    """Create Gemini client. Uses Vertex AI if GOOGLE_CLOUD_PROJECT is set, else AI Studio API key."""
    project_id = os.getenv("GOOGLE_CLOUD_PROJECT", "").strip()
    location = os.getenv("GOOGLE_CLOUD_LOCATION", "us-central1").strip()
    sa_key_path = os.getenv("GOOGLE_SA_KEY_FILE", "").strip()

    if project_id:
        # Vertex AI mode — uses credit
        kwargs = {"vertexai": True, "project": project_id, "location": location}

        if sa_key_path and Path(sa_key_path).exists():
            from google.oauth2 import service_account
            creds = service_account.Credentials.from_service_account_file(
                sa_key_path,
                scopes=["https://www.googleapis.com/auth/cloud-platform"]
            )
            kwargs["credentials"] = creds
        # else: uses Application Default Credentials (gcloud auth)

        client = genai.Client(**kwargs)
        mode = f"Vertex AI (project: {project_id}, location: {location})"
        return client, mode
    else:
        # AI Studio mode — free tier
        api_key = os.getenv("GEMINI_API_KEY", "").strip()
        if not api_key:
            return None, "No credentials found"
        client = genai.Client(api_key=api_key)
        return client, "AI Studio (free tier)"

with open(SCRIPT_DIR / "config.json", "r") as f:
    config = json.load(f)

INPUT_DIR = SCRIPT_DIR / config["input_dir"]
OUTPUT_DIR = SCRIPT_DIR / config["output_dir"]
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

CHARACTERS = config["reference_mapping"]["characters"]
LOCATIONS = config["reference_mapping"]["locations"]

# ── Gemini model options ──────────────────────────────────────────────
GEMINI_MODELS = {
    "gemini-3.1-flash-image-preview": "Nano Banana 2 (Best balance, 2K)",
    "gemini-3-pro-image-preview": "Nano Banana Pro (Professional, 4K)",
    "gemini-2.5-flash-image": "Nano Banana (Fast & cheap, 1024px)",
}
DEFAULT_MODEL = "gemini-3.1-flash-image-preview"

# ── Templates ─────────────────────────────────────────────────────────
TEMPLATES = {
    "dinerInterior": (
        "Photorealistic cinematic photograph of {loc_name} matching image1 layout. "
        "In the center foreground, (image2) in {sc_costume} {action}, {verb} (image3) "
        "{player_full} clearly visible, {player_pos} facing {pronoun}. "
        "Behind the cash register on the right side: (image4) in {npc0_costume}. "
        "On the diner floor in the background: (image5) in {npc1_costume} {npc1_action}. "
        "Customers seated in red booths. {lighting}. No customers behind counter. "
        "Both image2 and image3 must be clearly visible in the foreground."
    ),
    "back_empty": (
        "Photorealistic cinematic photograph of {loc_name} matching image1 layout. "
        "In the center foreground, (image2) in {sc_costume} {action}, {verb} (image3) "
        "{player_full} clearly visible, {player_pos} facing {pronoun}. {lighting}. "
        "Both image2 and image3 must be clearly visible in the foreground."
    ),
    "back_npc": (
        "Photorealistic cinematic photograph of {loc_name} matching image1 layout. "
        "In the center foreground, (image2) in {sc_costume} {action}, {verb} (image3) "
        "{player_full} clearly visible, {player_pos} facing {pronoun}. "
        "In the background: (image4) in {npc0_costume} {npc0_action}. {lighting}. "
        "Both image2 and image3 must be clearly visible in the foreground."
    ),
}


def build_prompt(scene, scene_char_key):
    loc_id = scene["location"]
    loc_name = LOCATIONS[loc_id]["promptName"]

    sc = CHARACTERS[scene_char_key]
    player = CHARACTERS["player"]

    npcs = scene.get("npcs", [])
    npc_data = [CHARACTERS[k] for k in npcs]

    # Select template
    if loc_id == "dinerInterior":
        template_key = "dinerInterior"
    elif not npcs:
        template_key = "back_empty"
    else:
        template_key = "back_npc"

    template = TEMPLATES[template_key]

    # Player outfit
    player_outfit = scene.get("playerOutfit", "").strip()
    if player_outfit:
        player_full = f"in {player_outfit}"
    else:
        player_full = f"in {player['costume']}"

    data = {
        "loc_name": loc_name,
        "sc_costume": sc["costume"],
        "action": scene.get("characterAction", ""),
        "verb": scene.get("talkingVerb", "talking to"),
        "player_full": player_full,
        "player_pos": scene.get("playerPosition", "facing"),
        "pronoun": "him" if sc["gender"] == "male" else "her",
        "lighting": scene.get("lighting", "Natural light"),
    }

    if template_key == "dinerInterior":
        if not npcs or npcs[0] != "tom":
            raise ValueError(f"Scene {scene['id']}: dinerInterior requires 'tom' as npcs[0].")
        if len(npcs) != 2:
            raise ValueError(f"Scene {scene['id']}: dinerInterior requires exactly 2 NPCs.")

        npc1_key = npcs[1]
        npc1_action = scene.get("npcActions", {}).get(npc1_key, "standing")

        data.update({
            "npc0_costume": npc_data[0]["costume"],
            "npc1_costume": npc_data[1]["costume"],
            "npc1_action": npc1_action,
        })
    elif template_key == "back_npc":
        if len(npcs) > 1:
            raise ValueError(f"Scene {scene['id']}: Non-dinerInterior supports at most 1 NPC.")
        npc0_key = npcs[0]
        npc0_action = scene.get("npcActions", {}).get(npc0_key, "standing")
        data.update({
            "npc0_costume": npc_data[0]["costume"],
            "npc0_action": npc0_action,
        })

    return template.format(**data)


def build_image_list(scene, scene_char_key):
    images = []
    loc_id = scene.get("location", "dinerInterior")
    loc_entry = LOCATIONS.get(loc_id, {"file": "dinerInterior.jpg"})
    loc_filename = loc_entry["file"] if isinstance(loc_entry, dict) else loc_entry
    images.append((INPUT_DIR / loc_filename, "location"))

    sc = CHARACTERS.get(scene_char_key, CHARACTERS[config["reference_mapping"]["scene_character"]])
    images.append((INPUT_DIR / sc["file"], f"{scene_char_key}_{sc['role']}"))

    pl = CHARACTERS["player"]
    images.append((INPUT_DIR / pl["file"], f"player_{pl['role']}"))

    for npc_key in scene.get("npcs", []):
        if npc_key in CHARACTERS:
            npc = CHARACTERS[npc_key]
            images.append((INPUT_DIR / npc["file"], f"{npc_key}_{npc['role']}"))

    return images


def assemble_full_prompt(scene, scene_char_key, image_list):
    """Assembles the final prompt with image roles and simple identity rules."""
    if "prompt" in scene:
        scene_prompt = scene["prompt"]
    else:
        scene_prompt = build_prompt(scene, scene_char_key)

    roles_parts = [f"image{i+1}={label}" for i, (_, label) in enumerate(image_list)]
    roles_desc = ", ".join(roles_parts)

    identity_rules = (
        "RULES: Each numbered image is a DIFFERENT person. "
        "Do NOT swap or blend faces between image slots. "
        "Every referenced image slot character MUST appear in the final image. "
        "image2 and image3 MUST both be clearly visible."
    )

    if not scene.get("npcs"):
        identity_rules += " No additional people should appear near the foreground characters."

    return f"Image roles: {roles_desc}. {scene_prompt} {identity_rules}"


# ── GUI ────────────────────────────────────────────────────────────────
class GeneratorGeminiApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Ruby's Diner - Gemini Image Generator")
        self.root.geometry("900x750")
        self.root.minsize(700, 550)

        self.scenes = []
        self.scene_char_key = "emma"
        self.check_vars = []
        self.running = False
        self.loaded_path = None

        # Gemini client
        self.client, self.api_mode = create_gemini_client()
        if not self.client:
            messagebox.showwarning("Warning",
                "No credentials found!\n\n"
                "Set GOOGLE_CLOUD_PROJECT in .env for Vertex AI,\n"
                "or GEMINI_API_KEY for AI Studio.")

        self._build_ui()

    def _build_ui(self):
        # Top bar
        top = Frame(self.root, padx=10, pady=5)
        top.pack(fill=X, side=TOP)

        Button(top, text="Load JSON", command=self._load_file).pack(side=LEFT, padx=(0, 5))
        self.refresh_btn = Button(top, text="Refresh", command=self._refresh, state=DISABLED)
        self.refresh_btn.pack(side=LEFT, padx=(0, 10))

        self.file_label = Label(top, text="No file loaded", fg="gray")
        self.file_label.pack(side=LEFT, padx=(0, 10))

        self.char_label = Label(top, text="", fg="blue", font=("Consolas", 9, "bold"))
        self.char_label.pack(side=LEFT)

        # Model selector + controls
        ctrl = Frame(self.root, padx=10, pady=5)
        ctrl.pack(fill=X, side=TOP)

        Label(ctrl, text="Model:").pack(side=LEFT, padx=(0, 5))
        self.model_var = StringVar(value=DEFAULT_MODEL)
        model_menu = OptionMenu(ctrl, self.model_var, *GEMINI_MODELS.keys())
        model_menu.config(width=30)
        model_menu.pack(side=LEFT, padx=(0, 10))

        Button(ctrl, text="Select All", command=self._select_all).pack(side=LEFT, padx=(0, 5))
        Button(ctrl, text="Deselect All", command=self._deselect_all).pack(side=LEFT, padx=(0, 15))

        Label(ctrl, text="Workers:").pack(side=LEFT, padx=(0, 5))
        self.workers_var = IntVar(value=2)
        Spinbox(ctrl, from_=1, to=5, textvariable=self.workers_var, width=4).pack(side=LEFT, padx=(0, 15))

        self.gen_btn = Button(ctrl, text="Generate Selected", command=self._start_generate, state=DISABLED)
        self.gen_btn.pack(side=LEFT, padx=(0, 5))

        self.stop_btn = Button(ctrl, text="Stop", command=self._stop, state=DISABLED)
        self.stop_btn.pack(side=LEFT)

        self.count_label = Label(ctrl, text="")
        self.count_label.pack(side=RIGHT)

        # Checkbox list
        list_frame = Frame(self.root, padx=10, pady=5)
        list_frame.pack(fill=BOTH, expand=True, side=TOP)

        canvas = Canvas(list_frame, borderwidth=1, relief="sunken")
        scrollbar = Scrollbar(list_frame, orient=VERTICAL, command=canvas.yview)
        self.checkbox_frame = Frame(canvas)

        self.checkbox_frame.bind(
            "<Configure>", lambda e: canvas.configure(scrollregion=canvas.bbox("all"))
        )
        canvas.create_window((0, 0), window=self.checkbox_frame, anchor=NW)
        canvas.configure(yscrollcommand=scrollbar.set)

        scrollbar.pack(side=RIGHT, fill=Y)
        canvas.pack(side=LEFT, fill=BOTH, expand=True)

        def _on_mousewheel(event):
            canvas.yview_scroll(int(-1 * (event.delta / 120)), "units")
        canvas.bind_all("<MouseWheel>", _on_mousewheel)

        # Log area
        log_frame = Frame(self.root, padx=10, pady=5)
        log_frame.pack(fill=X, side=BOTTOM)

        Label(log_frame, text="Log:", anchor=W).pack(fill=X)
        self.log = scrolledtext.ScrolledText(log_frame, height=12, state=DISABLED, font=("Consolas", 9))
        self.log.pack(fill=X)

    def _log(self, msg):
        self.log.configure(state=NORMAL)
        self.log.insert(END, msg + "\n")
        self.log.see(END)
        self.log.configure(state=DISABLED)

    def _update_count(self):
        selected = sum(1 for v in self.check_vars if v.get())
        total = len(self.check_vars)
        self.count_label.config(text=f"{selected}/{total} selected")

    def _load_from_path(self, path):
        try:
            with open(path, "r", encoding="utf-8") as f:
                data = json.load(f)
        except Exception as e:
            messagebox.showerror("Error", f"Failed to load file:\n{e}")
            return False

        if isinstance(data, dict):
            self.scene_char_key = data.get("scene_character", config["reference_mapping"]["scene_character"])
            self.scenes = data.get("scenes", [])
        elif isinstance(data, list):
            self.scene_char_key = config["reference_mapping"]["scene_character"]
            self.scenes = data
        else:
            messagebox.showerror("Error", "Invalid JSON format.")
            return False

        # Duplicate ID check
        seen_ids = {}
        duplicates = []
        for scene in self.scenes:
            sid = scene.get("id", "")
            if sid in seen_ids:
                duplicates.append(sid)
            else:
                seen_ids[sid] = True
        if duplicates:
            dup_list = "\n".join(f"  • {d}" for d in duplicates)
            messagebox.showerror("Duplicate IDs", f"Duplicate IDs found:\n\n{dup_list}\n\nFix before loading.")
            return False

        # Duplicate character check
        char_conflicts = []
        scene_char = self.scene_char_key
        for scene in self.scenes:
            npcs = scene.get("npcs", [])
            all_chars = [scene_char, "player"] + npcs
            seen_chars = set()
            for c in all_chars:
                if c in seen_chars:
                    char_conflicts.append(f"{scene['id']}: '{c}' duplicate")
                seen_chars.add(c)
        if char_conflicts:
            conflict_list = "\n".join(f"  • {c}" for c in char_conflicts[:10])
            messagebox.showerror("Duplicate Characters", f"Character conflicts:\n\n{conflict_list}")
            return False

        self.loaded_path = path
        self.file_label.config(text=Path(path).name, fg="black")
        self.char_label.config(text=f"[{self.scene_char_key}]")
        self._populate_checkboxes()
        self.gen_btn.config(state=NORMAL)
        self.refresh_btn.config(state=NORMAL)
        return True

    def _load_file(self):
        path = filedialog.askopenfilename(
            initialdir=str(SCRIPT_DIR),
            title="Select prompts JSON",
            filetypes=[("JSON files", "*.json")],
        )
        if not path:
            return
        if self._load_from_path(path):
            self._log(f"Loaded {len(self.scenes)} scenes from {Path(path).name} (character: {self.scene_char_key})")

    def _refresh(self):
        if not self.loaded_path:
            return
        old_checked = set()
        for i, var in enumerate(self.check_vars):
            if var.get() and i < len(self.scenes):
                old_checked.add(self.scenes[i]["id"])

        if self._load_from_path(self.loaded_path):
            for i, scene in enumerate(self.scenes):
                if i < len(self.check_vars):
                    self.check_vars[i].set(scene["id"] in old_checked)
            self._log(f"Refreshed {len(self.scenes)} scenes from {Path(self.loaded_path).name}")

    def _populate_checkboxes(self):
        for widget in self.checkbox_frame.winfo_children():
            widget.destroy()
        self.check_vars.clear()

        for i, scene in enumerate(self.scenes):
            var = BooleanVar(value=True)
            var.trace_add("write", lambda *_: self._update_count())
            self.check_vars.append(var)

            output_exists = any(
                (OUTPUT_DIR / f"{scene['id']}{ext}").exists()
                for ext in (".png", ".jpg", ".jpeg", ".webp")
            )
            status = " [EXISTS]" if output_exists else ""
            location = scene.get("location", "?")
            npcs = ", ".join(scene.get("npcs", [])) or "none"
            text = f"{scene['id']}  |  {location}  |  npcs: {npcs}{status}"

            cb = Checkbutton(self.checkbox_frame, text=text, variable=var, anchor=W, font=("Consolas", 9))
            cb.pack(fill=X, anchor=W)
            if output_exists:
                cb.config(fg="green")

        self._update_count()

    def _select_all(self):
        for v in self.check_vars:
            v.set(True)

    def _deselect_all(self):
        for v in self.check_vars:
            v.set(False)

    def _stop(self):
        self.running = False
        self._log("Stopping after current task...")

    def _start_generate(self):
        if not self.client:
            messagebox.showerror("Error", "No GEMINI_API_KEY set in .env!")
            return

        selected = [(i, self.scenes[i]) for i, v in enumerate(self.check_vars) if v.get()]
        if not selected:
            messagebox.showwarning("Warning", "No prompts selected.")
            return

        self.running = True
        self.gen_btn.config(state=DISABLED)
        self.stop_btn.config(state=NORMAL)
        workers = self.workers_var.get()
        scene_char = self.scene_char_key
        model_name = self.model_var.get()

        thread = threading.Thread(
            target=self._generate_worker,
            args=(selected, workers, scene_char, model_name),
            daemon=True,
        )
        thread.start()

    def _generate_worker(self, selected, max_workers, scene_char, model_name):
        from concurrent.futures import ThreadPoolExecutor, as_completed

        self.root.after(0, self._log,
            f"Starting: {len(selected)} scenes, {max_workers} workers, "
            f"model: {model_name}, char: {scene_char}"
        )

        gemini_cfg = config.get("gemini_config", {}).get("parameters", {})
        aspect_ratio = gemini_cfg.get("aspect_ratio", "16:9")
        resolution = gemini_cfg.get("resolution", "2K")

        MAX_RETRIES = 3

        def generate_one(idx, scene):
            if not self.running:
                return idx, scene["id"], "STOPPED"

            # Check if already exists
            output_exists = any(
                (OUTPUT_DIR / f"{scene['id']}{ext}").exists()
                for ext in (".png", ".jpg", ".jpeg", ".webp")
            )
            if output_exists:
                return idx, scene["id"], "SKIP"

            image_list = build_image_list(scene, scene_char)
            missing = [img[0].name for img in image_list if not img[0].exists()]
            if missing:
                return idx, scene["id"], f"MISSING: {', '.join(missing)}"

            # Build contents once
            full_prompt = assemble_full_prompt(scene, scene_char, image_list)
            contents = [full_prompt]
            for img_path, label in image_list:
                contents.append(Image.open(str(img_path)))

            for attempt in range(1, MAX_RETRIES + 1):
                if not self.running:
                    return idx, scene["id"], "STOPPED"

                try:
                    # Call Gemini API
                    response = self.client.models.generate_content(
                        model=model_name,
                        contents=contents,
                        config=types.GenerateContentConfig(
                            response_modalities=["IMAGE"],
                            image_config=types.ImageConfig(
                                aspect_ratio=aspect_ratio,
                                image_size=resolution,
                            ),
                        ),
                    )

                    # Extract image from response
                    saved = False
                    for part in response.parts:
                        if hasattr(part, "inline_data") and part.inline_data is not None:
                            img = part.as_image()
                            output_file = OUTPUT_DIR / f"{scene['id']}.png"
                            img.save(str(output_file))
                            saved = True
                            break

                    if saved:
                        return idx, scene["id"], "OK"
                    else:
                        text_parts = [p.text for p in response.parts if p.text]
                        if text_parts:
                            return idx, scene["id"], f"BLOCKED: {text_parts[0][:100]}"
                        return idx, scene["id"], "FAIL: No image in response"

                except Exception as e:
                    err_str = str(e)
                    # Auto-retry on rate limit (429)
                    if "429" in err_str and attempt < MAX_RETRIES:
                        # Extract retry delay from error if available
                        import re
                        delay_match = re.search(r'retry in (\d+)', err_str)
                        wait_secs = int(delay_match.group(1)) + 5 if delay_match else 65
                        self.root.after(0, self._log,
                            f"  ⏳ {scene['id']}: Rate limited, waiting {wait_secs}s (retry {attempt}/{MAX_RETRIES})..."
                        )
                        import time
                        time.sleep(wait_secs)
                        continue
                    return idx, scene["id"], f"FAIL: {e}"

            return idx, scene["id"], "FAIL: Max retries exceeded"

        done_count = 0
        total = len(selected)

        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            futures = {executor.submit(generate_one, idx, scene): (idx, scene) for idx, scene in selected}

            for future in as_completed(futures):
                if not self.running:
                    executor.shutdown(wait=False, cancel_futures=True)
                    break

                idx, scene_id, status = future.result()
                done_count += 1
                msg = f"[{done_count}/{total}] {scene_id}: {status}"
                self.root.after(0, self._log, msg)

                if status == "OK":
                    def _update_cb(i=idx):
                        children = self.checkbox_frame.winfo_children()
                        if i < len(children):
                            children[i].config(fg="green")
                    self.root.after(0, _update_cb)

        self.root.after(0, self._log, "Generation finished." if self.running else "Generation stopped.")
        self.root.after(0, lambda: self.gen_btn.config(state=NORMAL))
        self.root.after(0, lambda: self.stop_btn.config(state=DISABLED))
        self.running = False


if __name__ == "__main__":
    root = Tk()
    app = GeneratorGeminiApp(root)
    root.mainloop()
