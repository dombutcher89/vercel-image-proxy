export default async function handler(req, res) {
  let imageUrl = req.query.img;

  if (!imageUrl) {
    return res.status(400).send("Missing 'img' query parameter");
  }

  // Fix double-encoding if it's already encoded
  try {
    imageUrl = decodeURIComponent(imageUrl);
  } catch (_) {
    // It's okay if decoding fails
  }

  // Now re-encode safely for use in fetch
  try {
    const fetchUrl = new URL(imageUrl);
    const encodedUrl = fetchUrl.href;

    const response = await fetch(encodedUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });

    if (!response.ok) {
      return res.status(502).send("Failed to fetch image");
    }

    const contentType = response.headers.get("content-type") || "application/octet-stream";
    const buffer = await response.arrayBuffer();

    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.status(200).send(Buffer.from(buffer));
  } catch (error) {
    res.status(500).send("Error: " + error.message);
  }
}
