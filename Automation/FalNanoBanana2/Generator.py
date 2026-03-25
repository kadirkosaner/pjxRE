import sys
import json
import threading
import requests
from pathlib import Path
from tkinter import (
    Tk, Frame, Label, Button, Checkbutton, Spinbox, IntVar, BooleanVar,
    filedialog, messagebox, scrolledtext, Canvas, Scrollbar, VERTICAL, LEFT,
    RIGHT, BOTH, Y, X, TOP, BOTTOM, W, NW, DISABLED, NORMAL, END,
)
from dotenv import load_dotenv

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

SCRIPT_DIR = Path(__file__).parent.absolute()
load_dotenv(SCRIPT_DIR / ".env")

import fal_client

with open(SCRIPT_DIR / "config.json", "r") as f:
    config = json.load(f)

INPUT_DIR = SCRIPT_DIR / config["input_dir"]
OUTPUT_DIR = SCRIPT_DIR / config["output_dir"]
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

CHARACTERS = config["reference_mapping"]["characters"]
LOCATIONS = config["reference_mapping"]["locations"]

TEMPLATES = {
    "dinerInterior": (
        "Photorealistic cinematic photograph of {loc_name}. "
        "The background MUST be an EXACT copy of image1. "
        "FOUR UNIQUE PEOPLE MUST APPEAR: TWO FEMALES (image2, image3) and TWO MALES (image4, image5). "
        "1. FOREGROUND CENTER: (image2) female {sc_name} in {sc_costume} {action}, {verb} (image3). "
        "2. FOREGROUND SIDE: (image3) female {player_name} {player_full}, stands {player_pos}. "
        "3. AT THE CASH REGISTER (FAR RIGHT): (image5) male {npc1_name} stands here, wearing {npc1_costume}. "
        "4. ON THE DINER FLOOR (LEFT BACKGROUND): (image4) male {npc0_name} stands here, wearing {npc0_costume}, {npc0_action}. "
        "IDENTITY LOCK: image2 and image3 ARE FEMALE. image4 and image5 ARE MALE. Never use a male face for female slots. "
        "image5 is always the cashier. image4 is on the floor. Customers in booths."
    ),
    "back_empty": (
        "Photorealistic cinematic photograph of {loc_name}. "
        "The background MUST be an EXACT copy of image1 — same walls, shelves, floor, ceiling, doors, and every object. "
        "Do NOT add, remove, or change ANY element from image1. "
        "FOREGROUND CENTER: (image2) in {sc_costume} {action}, {verb} (image3) {player_full}, {player_pos}. "
        "{lighting}. ONLY image2 and image3 may appear as people."
    ),
    "back_npc": (
        "Photorealistic cinematic photograph of {loc_name}. "
        "The background MUST be an EXACT copy of image1 — same walls, shelves, floor, ceiling, doors, and every object. "
        "Do NOT add, remove, or change ANY element from image1. "
        "FOREGROUND CENTER: (image2) in {sc_costume} {action}, {verb} (image3) {player_full}, {player_pos}. "
        "IN THE BACKGROUND: (image4) wearing {npc0_costume}, {npc0_action}. "
        "{lighting}."
    ),
}


def build_prompt(scene, scene_char_key):
    loc_id = scene["location"]
    loc_name = LOCATIONS[loc_id]["promptName"]

    sc = CHARACTERS[scene_char_key]
    player = CHARACTERS["player"]

    npcs = scene.get("npcs", [])
    npc_data = []
    for npc_key in npcs:
        npc_data.append(CHARACTERS[npc_key])

    # Select template
    if loc_id == "dinerInterior":
        template_key = "dinerInterior"
    elif not npcs:
        template_key = "back_empty"
    else:
        template_key = "back_npc"

    template = TEMPLATES[template_key]

    # player_full: outfit only — (image3) tag already written in the template
    player_outfit = scene.get("playerOutfit", "").strip()
    if player_outfit:
        player_full = f"in {player_outfit}"
    else:
        player_full = ""

    data = {
        "loc_name": loc_name,
        "sc_name": sc["name"],
        "sc_gender": sc["gender"],
        "sc_costume": sc["costume"],
        "action": scene.get("characterAction", ""),
        "verb": scene.get("talkingVerb", "talking to"),
        "player_name": player["name"],
        "player_gender": player["gender"],
        "player_full": player_full,
        "player_pos": scene.get("playerPosition", "nearby"),
        "lighting": scene.get("lighting", "Natural light"),
    }

    if template_key == "dinerInterior":
        # Tom must be npcs[1] (image5 = cash register)
        # npcs[0] is the diner floor NPC (image4)
        if len(npcs) != 2:
            raise ValueError(f"Scene {scene['id']}: dinerInterior requires exactly 2 NPCs.")
        if npcs[1] != "tom":
            raise ValueError(f"Scene {scene['id']}: dinerInterior requires 'tom' as the SECOND NPC (npcs[1]).")

        npc0_key = npcs[0]  # diner floor NPC -> image4
        npc1_key = npcs[1]  # tom at cash register -> image5
        npc0_action = scene.get("npcActions", {}).get(npc0_key, "standing")

        # npcCostumes in scene JSON overrides the character's default costume
        npc_costumes_override = scene.get("npcCostumes", {})
        npc0_costume = npc_costumes_override.get(npc0_key, npc_data[0]["costume"])
        npc1_costume = npc_costumes_override.get(npc1_key, npc_data[1]["costume"])

        data.update({
            "npc0_name": CHARACTERS[npc0_key]["name"],
            "npc0_gender": CHARACTERS[npc0_key]["gender"],
            "npc0_costume": npc0_costume,
            "npc0_action": npc0_action,
            "npc1_name": CHARACTERS[npc1_key]["name"],
            "npc1_gender": CHARACTERS[npc1_key]["gender"],
            "npc1_costume": npc1_costume,
        })
    elif template_key == "back_npc":
        if not npcs:
            raise ValueError(f"Scene {scene['id']}: back_npc requires at least 1 NPC.")
        npc0_key = npcs[0]
        npc0_action = scene.get("npcActions", {}).get(npc0_key, "standing")
        npc_costumes_override = scene.get("npcCostumes", {})
        npc0_costume = npc_costumes_override.get(npc0_key, npc_data[0]["costume"])
        data.update({
            "npc0_name": CHARACTERS[npc0_key]["name"],
            "npc0_gender": CHARACTERS[npc0_key]["gender"],
            "npc0_costume": npc0_costume,
            "npc0_action": npc0_action,
        })

    prompt = template.format(**data)
    return prompt


def build_image_list(scene, scene_char_key):
    images = []
    loc_id = scene.get("location", "dinerInterior")
    loc_entry = LOCATIONS.get(loc_id, {"file": "dinerInterior.jpg"})
    # Handle both dict (new format) and string (fallback)
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
    """Assembles the final prompt with image roles and slot-position rules."""
    if "prompt" in scene:
        scene_prompt = scene["prompt"]
    else:
        scene_prompt = build_prompt(scene, scene_char_key)

    # Build image role list: slot number -> character role only (NO physical descriptions)
    role_lines = []
    for i, (_, label) in enumerate(image_list):
        slot_num = i + 1
        parts = label.split("_", 1)
        char_key = parts[0]
        role = parts[1] if len(parts) > 1 else label
        if char_key == "location":
            role_lines.append(f"image{slot_num}=background")
        else:
            role_lines.append(f"image{slot_num}={char_key}_{role}")

    roles_desc = ", ".join(role_lines)

    # Build dynamic slot rules based on actual character genders and NPC count
    npcs = scene.get("npcs", [])
    sc = CHARACTERS[scene_char_key]
    player = CHARACTERS["player"]

    sc_gender_label    = "MALE"   if sc["gender"]     == "male" else "FEMALE"
    player_gender_label = "MALE"  if player["gender"] == "male" else "FEMALE"

    slot_rules = (
        "STRICT IDENTITY RULES: "
        "1) image1 is the STATIC BACKGROUND — EXACT copy. "
        f"2) image2 is {sc_gender_label} ({sc['name']}) — foreground center. "
        f"3) image3 is {player_gender_label} ({player['name']}) — foreground side. "
        "4) image2 and image3 MUST be in the foreground facing each other. "
        "DO NOT USE THE SAME FACE TWICE."
    )

    final_check_parts = [
        f"image2={sc['name']} ({sc_gender_label})",
        f"image3={player['name']} ({player_gender_label})",
    ]

    if not npcs:
        slot_rules += " 5) No extra characters beyond image2 and image3."
    else:
        npc_actions = scene.get("npcActions", {})
        for i, npc_key in enumerate(npcs):
            npc = CHARACTERS[npc_key]
            npc_gender_label = "MALE" if npc["gender"] == "male" else "FEMALE"
            slot_num = 4 + i
            action = npc_actions.get(npc_key, "in the background")
            slot_rules += (
                f" {4 + i}) image{slot_num} is {npc_gender_label} ({npc['name']}) wearing {npc['costume']} — {action}."
            )
            final_check_parts.append(f"image{slot_num}={npc['name']} ({npc_gender_label})")

    final_check = "FINAL CHECK: " + ", ".join(final_check_parts) + ". DO NOT SWAP FACES OR GENDERS."

    final_prompt = f"Image roles: {roles_desc}. {scene_prompt} {slot_rules}. {final_check}"

    return final_prompt


class GeneratorApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Ruby's Diner - Image Generator")
        self.root.geometry("800x700")
        self.root.minsize(600, 500)

        self.scenes = []
        self.scene_char_key = "emma"
        self.check_vars = []
        self.running = False
        self.loaded_path = None

        self._build_ui()

    def _build_ui(self):
        # Top bar: Load + controls
        top = Frame(self.root, padx=10, pady=5)
        top.pack(fill=X, side=TOP)

        Button(top, text="Load JSON", command=self._load_file).pack(side=LEFT, padx=(0, 5))
        self.refresh_btn = Button(top, text="Refresh", command=self._refresh, state=DISABLED)
        self.refresh_btn.pack(side=LEFT, padx=(0, 10))

        self.file_label = Label(top, text="No file loaded", fg="gray")
        self.file_label.pack(side=LEFT, padx=(0, 10))

        self.char_label = Label(top, text="", fg="blue", font=("Consolas", 9, "bold"))
        self.char_label.pack(side=LEFT)

        # Controls bar
        ctrl = Frame(self.root, padx=10, pady=5)
        ctrl.pack(fill=X, side=TOP)

        Button(ctrl, text="Select All", command=self._select_all).pack(side=LEFT, padx=(0, 5))
        Button(ctrl, text="Deselect All", command=self._deselect_all).pack(side=LEFT, padx=(0, 15))

        Label(ctrl, text="Max Workers:").pack(side=LEFT, padx=(0, 5))
        self.workers_var = IntVar(value=2)
        Spinbox(ctrl, from_=1, to=10, textvariable=self.workers_var, width=4).pack(side=LEFT, padx=(0, 15))

        self.gen_btn = Button(ctrl, text="Generate Selected", command=self._start_generate, state=DISABLED)
        self.gen_btn.pack(side=LEFT, padx=(0, 5))

        self.stop_btn = Button(ctrl, text="Stop", command=self._stop, state=DISABLED)
        self.stop_btn.pack(side=LEFT)

        self.count_label = Label(ctrl, text="")
        self.count_label.pack(side=RIGHT)

        # Checkbox list (scrollable)
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

        # Mouse wheel scroll
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

        # Support both formats: {scene_character, scenes: [...]} and [...]
        if isinstance(data, dict):
            self.scene_char_key = data.get("scene_character", config["reference_mapping"]["scene_character"])
            self.scenes = data.get("scenes", [])
        elif isinstance(data, list):
            self.scene_char_key = config["reference_mapping"]["scene_character"]
            self.scenes = data
        else:
            messagebox.showerror("Error", "Invalid JSON format.")
            return False

        # --- Duplicate ID check (hardcoded uniqueness enforcement) ---
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
            messagebox.showerror(
                "Duplicate IDs Detected",
                f"The following scene IDs appear more than once:\n\n{dup_list}\n\nFix the JSON before loading."
            )
            return False

        # --- Duplicate character check (same character cannot appear in multiple roles) ---
        char_conflicts = []
        scene_char = self.scene_char_key  # e.g. "james"
        for scene in self.scenes:
            npcs = scene.get("npcs", [])
            all_chars = [scene_char, "player"] + npcs
            seen_chars = set()
            for c in all_chars:
                if c in seen_chars:
                    char_conflicts.append(f"{scene['id']}: '{c}' appears more than once")
                seen_chars.add(c)
        if char_conflicts:
            conflict_list = "\n".join(f"  • {c}" for c in char_conflicts[:10])
            suffix = f"\n  ... and {len(char_conflicts)-10} more" if len(char_conflicts) > 10 else ""
            messagebox.showerror(
                "Duplicate Characters Detected",
                f"The same character key appears in multiple roles:\n\n{conflict_list}{suffix}\n\nFix the JSON before loading."
            )
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
        # Remember which IDs were checked
        old_checked = set()
        for i, var in enumerate(self.check_vars):
            if var.get() and i < len(self.scenes):
                old_checked.add(self.scenes[i]["id"])

        if self._load_from_path(self.loaded_path):
            # Restore check states
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
        selected = [(i, self.scenes[i]) for i, v in enumerate(self.check_vars) if v.get()]
        if not selected:
            messagebox.showwarning("Warning", "No prompts selected.")
            return

        self.running = True
        self.gen_btn.config(state=DISABLED)
        self.stop_btn.config(state=NORMAL)
        workers = self.workers_var.get()
        scene_char = self.scene_char_key

        thread = threading.Thread(target=self._generate_worker, args=(selected, workers, scene_char), daemon=True)
        thread.start()

    def _generate_worker(self, selected, max_workers, scene_char):
        from concurrent.futures import ThreadPoolExecutor, as_completed

        self.root.after(0, self._log, f"Starting generation: {len(selected)} scenes, {max_workers} workers, character: {scene_char}")

        def generate_one(idx, scene):
            if not self.running:
                return idx, scene["id"], "STOPPED"

            # Check if already generated in any common format
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

            try:
                image_urls = [fal_client.upload_file(str(img_path)) for img_path, _ in image_list]
                full_prompt = assemble_full_prompt(scene, scene_char, image_list)

                fal_params = config["fal_config"]["parameters"]
                arguments = {
                    "prompt": full_prompt,
                    "image_urls": image_urls,
                    "thinking_level": "high",
                }
                if "aspect_ratio" in fal_params:
                    arguments["aspect_ratio"] = fal_params["aspect_ratio"]
                if "resolution" in fal_params:
                    arguments["resolution"] = fal_params["resolution"]

                result = fal_client.subscribe(
                    config["fal_config"]["model"],
                    arguments=arguments,
                    with_logs=False,
                )

                img_url = result["images"][0]["url"]
                img_response = requests.get(img_url)
                img_data = img_response.content

                # Detect extension from URL first, then Content-Type
                from urllib.parse import urlparse
                url_path = urlparse(img_url).path.lower()
                ext = ".png"  # default
                for candidate in (".png", ".jpg", ".jpeg", ".webp"):
                    if url_path.endswith(candidate):
                        ext = candidate
                        break
                else:
                    ct = img_response.headers.get("Content-Type", "")
                    if "jpeg" in ct or "jpg" in ct:
                        ext = ".jpg"
                    elif "webp" in ct:
                        ext = ".webp"
                    elif "png" in ct:
                        ext = ".png"

                output_file = OUTPUT_DIR / f"{scene['id']}{ext}"
                with open(output_file, "wb") as f:
                    f.write(img_data)
                return idx, scene["id"], "OK"

            except Exception as e:
                return idx, scene["id"], f"FAIL: {e}"

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

                # Update checkbox color on success
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
    app = GeneratorApp(root)
    root.mainloop()