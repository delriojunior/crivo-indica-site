const PIXEL_ID = '1762745028188951';
const ALLOWED_GROUPS = new Set(['perfumes', 'beleza', 'moda', 'skincare']);

const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  },
});

const cookieValue = (request, name) => {
  const cookie = request.headers.get('Cookie') || '';
  const entry = cookie.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${name}=`));
  return entry ? decodeURIComponent(entry.slice(name.length + 1)) : undefined;
};

const clientIp = (request) => request.headers.get('CF-Connecting-IP') || undefined;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname !== '/api/meta-conversion') {
      return env.ASSETS.fetch(request);
    }

    if (request.method !== 'POST') {
      return json({ error: 'method_not_allowed' }, 405);
    }

    const origin = request.headers.get('Origin');
    if (origin !== 'https://crivoindica.com.br' && origin !== 'https://www.crivoindica.com.br') {
      return json({ error: 'invalid_origin' }, 403);
    }

    if (!env.META_CAPI_ACCESS_TOKEN) {
      return json({ error: 'conversion_api_not_configured' }, 503);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: 'invalid_json' }, 400);
    }

    const group = typeof body.group === 'string' ? body.group : '';
    const eventId = typeof body.eventId === 'string' ? body.eventId : '';
    if (!ALLOWED_GROUPS.has(group) || !/^group-[a-z]+-\d+-[0-9a-f-]{36}$/.test(eventId)) {
      return json({ error: 'invalid_event' }, 400);
    }

    const userData = {
      client_ip_address: clientIp(request),
      client_user_agent: request.headers.get('User-Agent') || undefined,
      fbp: cookieValue(request, '_fbp'),
      fbc: cookieValue(request, '_fbc'),
    };

    Object.keys(userData).forEach((key) => userData[key] === undefined && delete userData[key]);

    const metaResponse = await fetch(
      `https://graph.facebook.com/v23.0/${PIXEL_ID}/events`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_token: env.META_CAPI_ACCESS_TOKEN,
          data: [{
            event_name: 'Lead',
            event_time: Math.floor(Date.now() / 1000),
            event_id: eventId,
            action_source: 'website',
            event_source_url: request.headers.get('Referer') || 'https://crivoindica.com.br/',
            user_data: userData,
            custom_data: { content_name: `WhatsApp: ${group}` },
          }],
        }),
      },
    );

    if (!metaResponse.ok) {
      console.error('Meta CAPI error', metaResponse.status, await metaResponse.text());
      return json({ error: 'meta_api_error' }, 502);
    }

    return json({ accepted: true });
  },
};
