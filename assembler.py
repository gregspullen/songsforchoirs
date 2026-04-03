import json
import os

DATA_FILE = "data.js"

def create_slug(title):
    slug = title.lower()
    slug = slug.replace("’", "")   # remove curly apostrophes
    slug = slug.replace("'", "")   # remove straight apostrophes
    slug = slug.replace(" ", "-")  # spaces to hyphens
    return slug


def build_metadata(title, description, voicing):
    slug = create_slug(title)

    meta_title = f"{title} – Songs for Choirs"
    clean_description = description.rstrip('.')
    clean_voicing = voicing.rstrip('.')

    meta_description = f"{clean_description}. {clean_voicing}."

    preview_url = f"/preview?score={slug}.pdf"
    order_url = f"/orderform.html?score={slug}"

    return {
        "slug": slug,
        "meta_title": meta_title,
        "meta_description": meta_description,
        "preview_url": preview_url,
        "order_url": order_url
    }


# 🐸 NEW FUNCTION (this is the fairy)
def update_data_js(slug, title, description):
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, "r") as f:
            content = f.read().strip()

        if content.startswith("const PIECES ="):
            json_part = content.replace("const PIECES =", "").strip().rstrip(";")
            data = json.loads(json_part or "{}")
        else:
            data = {}
    else:
        data = {}

    data[slug] = {
        "title": title,
        "description": description
    }

    with open(DATA_FILE, "w") as f:
        f.write("const PIECES = ")
        json.dump(data, f, indent=2)
        f.write(";")

    print(f"\n✅ Updated data.js with '{slug}'")


# --- RUN IT ---

while True:
    title = input("Title: ")
    description = input("Description: ")
    voicing = input("Voicing: ")

    data = build_metadata(title, description, voicing)

    print("\n================ PREVIEW ================\n")
    print(f"Slug: {data['slug']}")
    print(f"<title>{data['meta_title']}</title>")
    print(f'<meta name="description" content="{data["meta_description"]}" />')

    confirm = input("\nIs this correct? (y/n): ").lower()

    if confirm == "y":    
        print("🔥 CALLING UPDATE FUNCTION")
        update_data_js(data["slug"], title, data["meta_description"])    
        break

    print("\nLet’s try again...\n")

print("\n--- RESULT ---\n")

print(f"Slug: {data['slug']}")
print(f"Preview: {data['preview_url']}")
print(f"Order: {data['order_url']}")

print("\n--- META ---\n")

print(f"<title>{data['meta_title']}</title>")
print(f'<meta name="description" content="{data["meta_description"]}" />')

print("\n================ FINAL OUTPUT ================\n")

print(f"""<h1>{title}</h1>
<p class="tagline">{voicing.rstrip('.')}</p>

<iframe src="{data['preview_url']}" width="100%" height="600"></iframe>

<a href="{data['order_url']}" class="buy-button">
  Buy licensed copies
</a>
""")

print("\n================ PAGE INPUT ================\n")

print(f'const TITLE = "{title}";')
print(f'const DESCRIPTION = "{data["meta_description"]}";')
