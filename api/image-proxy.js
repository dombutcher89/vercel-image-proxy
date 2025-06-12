export default async function handler(req, res) {
  try {
    const { pathname } = new URL(req.url, `http://${req.headers.host}`);

    // Remove leading slash from path
    const raw = pathname.replace('/api/image-proxy/', '');
    const decodedUrl = decodeURIComponent(raw);

    const response = await fetch(decodedUrl, {
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
  } catch (err) {
    res.status(500).send("Error: " + err.message);
  }
}
