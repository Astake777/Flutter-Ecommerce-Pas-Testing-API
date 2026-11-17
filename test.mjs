import test from 'node:test';
import assert from 'node:assert/strict';
import { route } from './api/index.js';

const get = (u) => route(u);

test('api routes', () => {
  assert.equal(get('/api/products')[1].meta.total, 18);
  assert.equal(get('/api/products/1')[1].data.id, 1);
  assert.equal(get('/api/products/9999')[0], 404);
  assert.equal(get('/api/categories')[1].data.length, 2);

  const fashion = get('/api/products?category=electronics')[1].data;
  assert.ok(fashion.length && fashion.every((p) => p.category === 'Electronics'));
  assert.equal(get('/api/products?category=home-living')[1].data[0].category, 'Home & Living');

  const asc = get('/api/products?sort=price_asc')[1].data.map((p) => p.discount_price ?? p.price);
  assert.deepEqual(asc, [...asc].sort((a, b) => a - b));

  assert.ok(get('/api/products?search=phone')[1].data.length > 0);
  assert.equal(get('/api/products?limit=5&page=2')[1].data.length, 5);
  assert.ok(get('/api/flash-sale')[1].data.every((p) => p.discount_price < p.price));
  assert.equal(get('/api/featured')[1].data.length, 10);
});
