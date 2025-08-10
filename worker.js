export default {
  async fetch(request, env) {
    // Basic Auth (set secrets BASIC_AUTH_USER / BASIC_AUTH_PASS)
    const auth = request.headers.get('authorization');
    const expected = 'Basic ' + btoa(`${env.BASIC_AUTH_USER}:${env.BASIC_AUTH_PASS}`);
    if (!auth || auth !== expected) {
      return new Response('Unauthorized', {
        status: 401,
        headers: { 'WWW-Authenticate': 'Basic realm="E-COMPTA-IA"' }
      });
    }

    // Serve static assets
    const res = await env.ASSETS.fetch(request);

    // SPA fallback: on 404 HTML, return index.html
    if (res.status === 404) {
      const accept = request.headers.get('accept') || '';
      if (accept.includes('text/html')) {
        const url = new URL(request.url);
        return env.ASSETS.fetch(new Request(url.origin + '/index.html'));
      }
    }

    return res;
  }
}