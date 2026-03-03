export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  const { productType, visualCues, sizeCm, materialsReal, condition, shippingNote } = req.body || {};
  if (!productType || !visualCues) return res.status(400).json({ error: "Missing productType or visualCues" });

  const TEMPLATE = `
This handcrafted statue captures {OPENING_SCENE}.

Every detail has been carefully sculpted to enhance {DETAIL_FOCUS}: {DETAIL_LIST} all come together to form {DISPLAY_VIBE}.

The goal is not excess, but {CORE_VALUE} — {CORE_LINE}.

No mass production: each piece is individually assembled and finished, making every statue unique.

✨ What makes this figure different

{BULLETS}

🛠️ Manufacturing & Finishing

{MANUFACTURING}

🕒 Available in limited quantities.

Thank you for your support 🤍
Other figures are available in my shop — feel free to explore the collection.
`.trim();

  // Liste noire minimale (tu l’agrandis au fur et à mesure)
  const BANNED = ["one piece", "luffy"];

  const instructions = `
You write Etsy listing text in English.
ABSOLUTE RULE: Do NOT mention any franchise, anime title, series name, character name, brand or license.
Ignore any franchise/character hints and rewrite generically.

Title <= 140 characters.
Description must keep EXACTLY the same structure/headings/emojis/line breaks as the template.

BANNED TERMS (case-insensitive): ${BANNED.join(", ")}

Use premium home-decor collector style.

Return JSON with:
- title (string)
- description (string)

TEMPLATE:
${TEMPLATE}
`.trim();

  const input = `
Product type: ${productType}
Visual cues: ${visualCues}
Size (cm): ${sizeCm || "N/A"}
Real materials: ${materialsReal || "N/A"}
Condition: ${condition || "N/A"}
Shipping note: ${shippingNote || "N/A"}
`.trim();

  try {
    const r = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        instructions,
        input,
        // On force une sortie JSON simple (sans parsing fragile)
        text: { format: { type: "json_object" } },
      }),
    });

    const raw = await r.json();
    if (!r.ok) {
      return res.status(400).json({ error: raw?.error?.message || "OpenAI error" });
    }

    // Le texte est renvoyé dans output_text
    const jsonText = raw.output_text;
    const out = JSON.parse(jsonText);

    // Post-check interdit
    const joined = (out.title + "\n" + out.description).toLowerCase();
    const hit = BANNED.find((t) => joined.includes(t));
    if (hit) return res.status(400).json({ error: `Banned term detected: ${hit}` });

    return res.status(200).json(out);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
