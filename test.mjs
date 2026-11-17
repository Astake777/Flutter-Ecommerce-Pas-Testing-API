import test from 'node:test';
import assert from 'node:assert/strict';
import { route } from './api/index.js';

const get = (u) => route(u);

test('api routes', () => {
  assert.equal(get('/api/products')[1].meta.total, 18);
  assert.equal(get('/api/products/1')[1].data.id, 1);
  assert.equal(get('/api/products/apple-macbook-pro')[1].data.id, 1);
  assert.equal(get('/api/products/9999')[0], 404);
  assert.equal(get('/api/categories')[1].data.length, 2);

  const elek = get('/api/products?category=elektronik')[1].data;
  assert.ok(elek.length && elek.every((p) => p.category === 'Elektronik'));
  assert.equal(get('/api/products?category=rumah-dekorasi')[1].data[0].category, 'Rumah & Dekorasi');

  const asc = get('/api/products?sort=price_asc')[1].data.map((p) => p.price);
  assert.deepEqual(asc, [...asc].sort((a, b) => a - b));

  assert.ok(get('/api/products?search=MOUSE')[1].data.length > 0);
  assert.equal(get('/api/products?limit=5&page=2')[1].data.length, 5);
  assert.equal(get('/api/featured')[1].data.length, 10);
  assert.equal(get('/api/flash-sale')[0], 404);
  assert.ok(get('/api/products')[1].data.every((p) => !('discount_price' in p) && !('discount_percent' in p)));
});
