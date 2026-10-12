const SHEET_URL =
  "https://script.google.com/macros/s/AKfycbzZdObxY6pD7m7-RAr5NC4v9C00FjHztwiUq-Yos-kD_9CRBdLLMc4buKsXwpeQY9c/exec";

function readBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch (_) {
      return Object.fromEntries(new URLSearchParams(req.body));
    }
  }
  return {};
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ ok: false });
    return;
  }

  const data = readBody(req);
  if (!data.name || !data.phone) {
    res.status(400).json({ ok: false, error: "missing fields" });
    return;
  }

  const params = new URLSearchParams({
    name: String(data.name || ""),
    phone: String(data.phone || ""),
    wilaya: String(data.wilaya || ""),
    address: String(data.address || ""),
    color: String(data.color || ""),
    qty: String(data.qty || 1),
    total: String(data.total || 0),
    offer: String(data.offer || "لانش بوكس مجاني"),
    source: String(data.source || "landing"),
    fbclid: String(data.fbclid || "")
  });

  try {
    await fetch(`${SHEET_URL}?${params.toString()}`, { redirect: "follow" });
    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
};
