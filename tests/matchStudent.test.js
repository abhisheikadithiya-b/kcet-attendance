import { describe, it, expect, vi, beforeEach } from 'vitest';

// Tunable thresholds (mirrors FACE_THRESHOLDS in app.js)
const FACE_THRESHOLDS = {
  MATCH_DISTANCE: 0.52,
  MATCH_MARGIN: 0.08,
};

// Pure implementation of euclideanDistance for testing
function euclideanDistance(a, b) {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += (a[i] - b[i]) ** 2;
  }
  return Math.sqrt(sum);
}

// Mirrors the updated matchStudent logic from app.js
// Supports both legacy single descriptors and new multi-descriptor format
function createMatchStudent(descriptors, studentsList) {
  return function matchStudent(descriptor) {
    const entries = Object.entries(descriptors);
    if (!entries.length) return null;

    let best = { id: null, distance: Infinity };
    let secondBest = { id: null, distance: Infinity };
    entries.forEach(([id, descriptorSet]) => {
      // Support both legacy single descriptor (flat array of numbers) and
      // new multi-descriptor format (array of arrays)
      const isLegacy = descriptorSet && typeof descriptorSet[0] === 'number';
      const descs = isLegacy ? [descriptorSet] : (descriptorSet || []);

      // Best-of-set: use minimum distance across all stored descriptors
      let minDist = Infinity;
      for (const desc of descs) {
        if (!desc || !desc.length) continue;
        const dist = euclideanDistance(descriptor, new Float32Array(desc));
        if (dist < minDist) minDist = dist;
      }

      if (minDist < best.distance) {
        secondBest = { ...best };
        best = { id, distance: minDist };
      } else if (minDist < secondBest.distance) {
        secondBest = { id, distance: minDist };
      }
    });

    const margin = secondBest.distance - best.distance;

    if (best.distance >= FACE_THRESHOLDS.MATCH_DISTANCE) return null;
    if (entries.length > 1 && margin < FACE_THRESHOLDS.MATCH_MARGIN) return null;

    return studentsList.find((s) => s.id === best.id) || null;
  };
}

// Helper: create a 128-dim descriptor with a known pattern
function makeDescriptor(seed) {
  return new Float32Array(128).map((_, i) => Math.sin(seed * (i + 1)));
}

describe('matchStudent (multi-descriptor, best-of-set)', () => {
  // ── Legacy format (single flat descriptor) backward compatibility ──

  it('matches correctly with a legacy single descriptor (flat array)', () => {
    const desc = makeDescriptor(1);
    // Legacy format: state.descriptors[id] = Array(128) of numbers
    const descriptors = { 'std-001': Array.from(desc) };
    const students = [{ id: 'std-001', name: 'Alice' }];
    const match = createMatchStudent(descriptors, students);
    expect(match(desc)).toEqual({ id: 'std-001', name: 'Alice' });
  });

  // ── New multi-descriptor format ──

  it('matches correctly with new multi-descriptor format (array of arrays)', () => {
    const desc = makeDescriptor(1);
    // New format: state.descriptors[id] = [[128 floats], [128 floats], ...]
    const descriptors = { 'std-001': [Array.from(desc), Array.from(makeDescriptor(2))] };
    const students = [{ id: 'std-001', name: 'Alice' }];
    const match = createMatchStudent(descriptors, students);
    // Query with a descriptor close to the first stored one
    expect(match(desc)).toEqual({ id: 'std-001', name: 'Alice' });
  });

  it('uses best-of-set: matches the closest descriptor in the set', () => {
    const angleA = makeDescriptor(10);
    const angleB = makeDescriptor(20);
    const angleC = makeDescriptor(30);
    // Store 3 distinct angles
    const descriptors = { 'std-001': [Array.from(angleA), Array.from(angleB), Array.from(angleC)] };
    const students = [{ id: 'std-001', name: 'Alice' }];
    const match = createMatchStudent(descriptors, students);

    // Query with angleB itself — should match via best-of-set
    expect(match(angleB)).toEqual({ id: 'std-001', name: 'Alice' });
  });

  // ── Ambiguous match rejection ──

  it('returns null when best and second-best are too close (ambiguous)', () => {
    const desc1 = makeDescriptor(1);
    const desc2 = new Float32Array(128).map((_, i) => desc1[i] + 0.001);
    const descriptors = {
      'std-001': [Array.from(desc1)],
      'std-002': [Array.from(desc2)],
    };
    const students = [
      { id: 'std-001', name: 'Alice' },
      { id: 'std-002', name: 'Bob' },
    ];
    const match = createMatchStudent(descriptors, students);
    const midpoint = new Float32Array(128).map((_, i) => (desc1[i] + desc2[i]) / 2);
    expect(match(midpoint)).toBeNull();
  });

  // ── No descriptors ──

  it('returns null when no descriptors are registered', () => {
    const match = createMatchStudent({}, []);
    expect(match(makeDescriptor(42))).toBeNull();
  });

  // ── Students without descriptors excluded ──

  it('only matches against students who have descriptors', () => {
    const realDesc = makeDescriptor(1);
    const descriptors = { 'std-001': [Array.from(realDesc)] };
    const students = [
      { id: 'std-001', name: 'Alice' },
      { id: 'std-002', name: 'Bob' }, // no descriptor entry
    ];
    const match = createMatchStudent(descriptors, students);
    expect(match(realDesc)).toEqual({ id: 'std-001', name: 'Alice' });
  });

  // ── Threshold rejection ──

  it('returns null when best distance exceeds threshold', () => {
    const stored = makeDescriptor(1);
    const farAway = makeDescriptor(999);
    const descriptors = { 'std-001': [Array.from(stored)] };
    const students = [{ id: 'std-001', name: 'Alice' }];
    const match = createMatchStudent(descriptors, students);
    expect(match(farAway)).toBeNull();
  });

  // ── Mixed legacy + new format ──

  it('handles mixed legacy and new format descriptors correctly', () => {
    const legacyDesc = makeDescriptor(5);
    const newDesc1 = makeDescriptor(10);
    const newDesc2 = makeDescriptor(11);
    const descriptors = {
      'std-legacy': Array.from(legacyDesc),           // Legacy: flat array
      'std-new': [Array.from(newDesc1), Array.from(newDesc2)],  // New: array of arrays
    };
    const students = [
      { id: 'std-legacy', name: 'LegacyStudent' },
      { id: 'std-new', name: 'NewStudent' },
    ];
    const match = createMatchStudent(descriptors, students);
    // Query with exact legacy descriptor
    expect(match(legacyDesc)).toEqual({ id: 'std-legacy', name: 'LegacyStudent' });
    // Query with one of new student's angles
    expect(match(newDesc2)).toEqual({ id: 'std-new', name: 'NewStudent' });
  });

  // ── 5-descriptor set ──

  it('matches correctly with 5 descriptors (full enrollment)', () => {
    const angles = [1, 2, 3, 4, 5].map(s => makeDescriptor(s * 100));
    const descriptors = { 'std-001': angles.map(a => Array.from(a)) };
    const students = [{ id: 'std-001', name: 'Alice' }];
    const match = createMatchStudent(descriptors, students);

    // Each angle should match individually
    for (const angle of angles) {
      expect(match(angle)).toEqual({ id: 'std-001', name: 'Alice' });
    }
  });
});
