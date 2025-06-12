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
        'User-Agent': 'Mozilla/5.0',
        'Accept': '*/*'
      }
    });

    if (!response.ok) {
      return res.status(502).send("Failed to fetch image.");
    }

    const contentType = response.headers.get("content-type") || 'application/octet-stream';
    const buffer = await response.arrayBuffer();

    // DEBUG RESPONSE INFO
    console.log("📦 Image fetched from:", imageUrl);
    console.log("📎 Content-Type:", contentType);
    console.log("📏 Buffer size:", buffer.byteLength);
    console.log("🔍 First 16 bytes:", Buffer.from(buffer).toString('hex', 0, 16));

    // Show the raw response info (for now only)
    res.setHeader("Content-Type", "text/plain");
    res.status(200).send(`
      Content-Type: ${contentType}
      Byte Length: ${buffer.byteLength}
      First 16 bytes (hex): ${Buffer.from(buffer).toString('hex', 0, 16)}
    `);
  } catch (error) {
    res.status(500).send("Proxy error: " + error.message);
  }
}
