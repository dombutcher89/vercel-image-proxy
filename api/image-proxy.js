export default async function handler(req, res) {
  try {
    // Get the full request path after /api/image-proxy/
    const rawPath = req.url.split('/api/image-proxy/')[1];

    if (!rawPath) {
      return res.status(400).send("Missing image URL path.");
    }

    // Include query string if present
    const fullUrl = decodeURIComponent(
      rawPath + (req.url.includes('?') ? '?' + req.url.split('?')[1] : '')
    );

    // Must start with http/https
    if (!/^https?:\/\//.test(fullUrl)) {
      return res.status(400).send("Invalid image URL.");
    }

    const response = await fetch(fullUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });

    if (!response.ok) {
      return res.status(502).send("Failed to fetch image.");
    }

    const contentType = response.headers.get("content-type") || "application/octet-stream";
    const buffer = await response.arrayBuffer();

    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.status(200).send(Buffer.from(buffer));
  } catch (err) {
    res.status(500).send("Proxy error: " + err.message);
  }
}
