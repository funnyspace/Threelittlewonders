export default async function handler(req, res) {
  const raw = Array.isArray(req.query?.file) ? req.query.file[0] : req.query?.file;
  const file = String(raw || '').trim().replace(/\s*\(\d+\)(?=\.pdf$)/i, '');

  if (!/^[A-Za-z0-9._()-]+\.pdf$/i.test(file)) {
    res.status(400).send('Invalid PDF');
    return;
  }

  const upstreamUrl = 'https://ncert.nic.in/textbook/pdf/' + encodeURIComponent(file);
  const headers = {
    'User-Agent': 'Mozilla/5.0',
    'Accept': 'application/pdf,*/*'
  };

  if (req.headers.range) headers.Range = req.headers.range;

  try {
    const upstream = await fetch(upstreamUrl, { headers, redirect: 'follow' });

    if (!upstream.ok && upstream.status !== 206) {
      res.status(upstream.status || 502).send('PDF unavailable');
      return;
    }

    res.status(upstream.status === 206 ? 206 : 200);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="' + file.replace(/"/g, '') + '"');
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400');
    res.setHeader('X-Content-Type-Options', 'nosniff');

    const passthroughHeaders = ['content-range', 'accept-ranges', 'content-length', 'last-modified', 'etag'];
    passthroughHeaders.forEach(name => {
      const value = upstream.headers.get(name);
      if (value) res.setHeader(name, value);
    });

    if (req.method === 'HEAD') {
      res.end();
      return;
    }

    const buffer = Buffer.from(await upstream.arrayBuffer());
    res.end(buffer);
  } catch (error) {
    res.status(502).send('PDF unavailable');
  }
}
