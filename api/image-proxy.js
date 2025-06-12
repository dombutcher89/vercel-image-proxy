export default async function handler(req, res) {
  const imageUrl = req.query.img;
  if (!imageUrl) {
    return res.status(400).send("Missing 'img' query parameter");
  }
  try {
    const fetchResponse = await fetch(imageUrl, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });
    if (!fetchResponse.ok) {
      return res.status(502).send("Failed to fetch image");
    }
    const contentType = fetchResponse.headers.get("content-type") || "application/octet-stream";
    const buffer = await fetchResponse.arrayBuffer();
    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.status(200).send(Buffer.from(buffer));
  } catch (e) {
    res.status(500).send("Error: " + e.message);
  }
}
