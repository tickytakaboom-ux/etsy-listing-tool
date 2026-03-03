const $ = (id) => document.getElementById(id);

$("btn").addEventListener("click", async () => {
  $("status").textContent = "Generating...";
  $("out").classList.add("hidden");

  const payload = {
    productType: $("productType").value.trim(),
    visualCues: $("visualCues").value.trim(),
    sizeCm: $("sizeCm").value.trim(),
    materialsReal: $("materialsReal").value.trim(),
    condition: $("condition").value.trim(),
    shippingNote: $("shippingNote").value.trim(),
  };

  try {
    const res = await fetch("/api/generate-text", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Error");

    $("title").textContent = data.title;
    $("desc").textContent = data.description;
    $("out").classList.remove("hidden");
    $("status").textContent = "Done ✅";
  } catch (e) {
    $("status").textContent = "Error: " + e.message;
  }
});

$("copyTitle").addEventListener("click", () => navigator.clipboard.writeText($("title").textContent));
$("copyDesc").addEventListener("click", () => navigator.clipboard.writeText($("desc").textContent));
