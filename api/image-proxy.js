export default async function handler(req, res) {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const fullParam = url.searchParams.get("full");

    if (!fullParam) {
      return res.status(400).send("Missing 'full' parameter");
    }

    const imageUrl = decodeURIComponent(fullParam);

    if (!/^https?:\/\//.test(imageUrl)) {
      return res.status(400).send("Invalid URL format.");
    }

    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0', // spoof browser
        'Accept': '*/*'
      }
    });

    if (!response.ok) {
      return res.status(502).send("Failed to fetch image.");
    }

    // Try to infer content type
    let contentType = response.headers.get("content-type");

    // Fallback if FestivalPro doesn't return one
    if (!contentType || contentType === 'application/octet-stream') {
      contentType = 'image/jpeg'; // most likely
    }

    const buffer = await response.arrayBuffer();

    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.status(200).send(Buffer.from(buffer));
  } catch (error) {
    res.status(500).send("Proxy error: " + error.message);
  }
}
