export default async function handler(req, res) {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const fullParam = url.searchParams.get("full");

    if (!fullParam) {
      return res.status(400).send("Missing 'full' parameter");
    }

    const imageUrl = decodeURIComponent(fullParam);

    // Ensure it's an http or https URL
    if (!/^https?:\/\//.test(imageUrl)) {
      return res.status(400).send("Invalid URL format.");
    }

    const response = await fetch(imageUrl, {
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
  } catch (error) {
    res.status(500).send("Proxy error: " + error.message);
  }
}
