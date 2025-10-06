const apiFetch = async (entry, { body, params } = {}) => {
  const cfg = typeof entry === 'function' ? entry(params) : entry;
  const opts = {
    method: cfg.method,
    headers: { 'Content-Type': 'application/json' }
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(cfg.url, opts);
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) throw { status: res.status, body: data };
  return data;
};