import products from '../data/products.json' with { type: 'json' };

const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const active = products.filter((p) => p.is_active);
const price = (p) => p.discount_price ?? p.price;

const SORTS = {
  price_asc: (a, b) => price(a) - price(b),
  price_desc: (a, b) => price(b) - price(a),
  rating: (a, b) => b.rating - a.rating,
  sold: (a, b) => b.sold - a.sold,
};

const list = (items, q = new URLSearchParams()) => {
  const search = q.get('search')?.toLowerCase();
  const category = q.get('category');
  let r = items.filter(
    (p) =>
      (!category || slug(p.category) === slug(category)) &&
      (!search || `${p.name} ${p.description} ${p.brand} ${p.category}`.toLowerCase().includes(search)),
  );
  if (SORTS[q.get('sort')]) r = [...r].sort(SORTS[q.get('sort')]);
  const total = r.length;
  const limit = Number(q.get('limit')) || total; // no limit => everything
  const page = Number(q.get('page')) || 1;
  return { data: r.slice((page - 1) * limit, page * limit), meta: { total, page, limit } };
};

export function route(rawUrl) {
  const url = new URL(rawUrl, 'http://x');
  const path = url.pathname.replace(/\/+$/, '');
  const q = url.searchParams;

  if (path === '/api/products') return [200, list(active, q)];
  if (path === '/api/categories') {
    const names = [...new Set(active.map((p) => p.category))];
    return [200, { data: names.map((name) => ({ name, slug: slug(name), count: active.filter((p) => p.category === name).length })) }];
  }
  if (path === '/api/featured') {
    return [200, { data: [...active].sort((a, b) => b.rating - a.rating || b.sold - a.sold).slice(0, Number(q.get('limit')) || 10) }];
  }
  if (path === '/api/flash-sale') {
    const pct = (p) => (p.price - p.discount_price) / p.price;
    return [200, { data: active.filter((p) => p.discount_price).sort((a, b) => pct(b) - pct(a)).slice(0, Number(q.get('limit')) || 10) }];
  }
  const m = path.match(/^\/api\/products\/([^/]+)$/);
  if (m) {
    const p = active.find((x) => String(x.id) === m[1] || x.slug === m[1]);
    return p ? [200, { data: p }] : [404, { error: 'Product not found' }];
  }
  return [404, { error: 'Not found' }];
}

export default function handler(req, res) {
  const [status, body] = route(req.url);
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*'); // Flutter web needs CORS
  res.setHeader('Cache-Control', 'public, max-age=60');
  res.end(JSON.stringify(body));
}
