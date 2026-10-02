export default async function handler(req, res) {
  const { url, ping } = req.query;
  
  // Permitir CORS desde CUALQUIER origen
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-ARC-Key');
  res.setHeader('Access-Control-Max-Age', '86400');
  
  // Preflight
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  
  // PING test
  if (ping === '1') {
    return res.status(200).json({ ok: true, service: 'arc-image-proxy-vercel' });
  }
  
  // PROXY
  if (!url) {
    return res.status(400).json({ error: 'Falta parámetro ?url=' });
  }
  
  try {
    const target = new URL(url);
    const upstream = await fetch(target.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept': '*/*',
      },
    });
    
    const buffer = await upstream.arrayBuffer();
    const ct = upstream.headers.get('Content-Type') || 'application/octet-stream';
    
    res.setHeader('Content-Type', ct);
    res.setHeader('Cache-Control', 'no-store');
    return res.status(upstream.status).end(Buffer.from(buffer));
  } catch (e) {
    return res.status(502).json({ error: 'No se pudo conectar: ' + e.message });
  }
}
