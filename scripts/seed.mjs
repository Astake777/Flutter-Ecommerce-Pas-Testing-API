// One-off: builds data/products.json (18 products, real image URLs) from dummyjson.com.
// Run: node scripts/seed.mjs
import { writeFileSync, mkdirSync } from 'node:fs';

const MAP = {
  Electronics: [['laptops', 'smartphones', 'tablets', 'mobile-accessories'], 5],
  Fashion: [['mens-shirts', 'mens-shoes', 'mens-watches', 'womens-bags', 'womens-dresses', 'womens-shoes', 'womens-watches', 'womens-jewellery', 'tops', 'sunglasses'], 5],
  Beauty: [['beauty', 'fragrances', 'skin-care'], 4],
  'Home & Living': [['furniture', 'home-decoration', 'kitchen-accessories'], 4],
};
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const idr = (usd) => Math.round((usd * 16000) / 1000) * 1000;

const { products } = await fetch('https://dummyjson.com/products?limit=0').then((r) => r.json());

const out = [];
for (const [category, [subs, cap]] of Object.entries(MAP)) {
  const seen = {};
  const pool = products
    .filter((p) => subs.includes(p.category))
    .map((p) => ({ p, r: (seen[p.category] = (seen[p.category] ?? -1) + 1) })) // round-robin subcategories
    .sort((a, b) => a.r - b.r)
    .map((x) => x.p)
    .slice(0, cap);
  for (const p of pool) {
    const id = out.length + 1;
    const price = idr(p.price);
    const disc = idr(p.price * (1 - p.discountPercentage / 100));
    out.push({
      id,
      name: p.title,
      slug: slug(p.title),
      description: p.description,
      price,
      discount_price: p.discountPercentage >= 8 && disc < price ? disc : null,
      category,
      brand: p.brand ?? 'Generic',
      images: p.images?.length ? p.images : [p.thumbnail],
      stock: p.stock,
      rating: Math.round(p.rating * 10) / 10,
      sold: ((id * 7919) % 480) + 20, // deterministic fake
      is_active: true,
    });
  }
}
mkdirSync('data', { recursive: true });
writeFileSync('data/products.json', JSON.stringify(out, null, 2));
console.log(out.length, 'products');
