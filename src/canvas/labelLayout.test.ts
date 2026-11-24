import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveLabelPositions } from './labelLayout';

test('resolveLabelPositions separates overlapping labels within mobile viewport bounds', () => {
  const bounds = { minX: 8, minY: 16, maxX: 356, maxY: 600 };
  const result = resolveLabelPositions(
    [
      { id: 'mbappe', x: 180, y: 120, width: 72, height: 18 },
      { id: 'vinicius', x: 185, y: 124, width: 76, height: 18 },
      { id: 'bellingham', x: 178, y: 128, width: 84, height: 18 },
    ],
    bounds,
    4,
  );

  const items = Array.from(result.values());
  assert.equal(items.length, 3);

  // Verify every pair is non-overlapping and clamped inside bounds
  for (let i = 0; i < items.length; i++) {
    const a = items[i];
    assert.ok(a.x - a.width / 2 >= bounds.minX - 0.5);
    assert.ok(a.x + a.width / 2 <= bounds.maxX + 0.5);
    assert.ok(a.y - a.height / 2 >= bounds.minY - 0.5);
    assert.ok(a.y + a.height / 2 <= bounds.maxY + 0.5);

    for (let j = i + 1; j < items.length; j++) {
      const b = items[j];
      const sepX = Math.abs(a.x - b.x) >= (a.width + b.width) / 2;
      const sepY = Math.abs(a.y - b.y) >= (a.height + b.height) / 2;
      assert.ok(sepX || sepY, `Labels ${a.id} and ${b.id} must not overlap`);
    }
  }
});

test('resolveLabelPositions preserves non-overlapping labels at their ideal coordinates', () => {
  const bounds = { minX: 0, minY: 0, maxX: 1000, maxY: 600 };
  const result = resolveLabelPositions(
    [
      { id: 'a', x: 120, y: 100, width: 80, height: 20 },
      { id: 'b', x: 400, y: 300, width: 80, height: 20 },
    ],
    bounds,
  );

  assert.equal(result.get('a')?.x, 120);
  assert.equal(result.get('a')?.y, 100);
  assert.equal(result.get('a')?.displaced, false);
  assert.equal(result.get('b')?.x, 400);
  assert.equal(result.get('b')?.y, 300);
});
