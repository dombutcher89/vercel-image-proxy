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
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Referer': 'https://newwineunited.festivalpro.com',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache'
      }
    });

    const contentType = response.headers.get("content-type") || 'application/octet-stream';
    const buffer = await response.arrayBuffer();

    // Debug response
    console.log("📦 Image fetched:", imageUrl);
    console.log("📎 Type:", contentType);
    console.log("📏 Size:", buffer.byteLength);

    if (buffer.byteLength < 10) {
      res.setHeader("Content-Type", "text/plain");
      return res.status(200).send("⛔ FestivalPro likely blocked the request (empty response).");
    }

    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.status(200).send(Buffer.from(buffer));
  } catch (error) {
    res.status(500).send("Proxy error: " + error.message);
  }
}
