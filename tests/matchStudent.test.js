import { describe, it, expect, vi, beforeEach } from 'vitest';

// Pure implementation of matchStudent for testing
// This mirrors the logic in app.js exactly
function euclideanDistance(a, b) {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += (a[i] - b[i]) ** 2;
  }
  return Math.sqrt(sum);
}

function createMatchStudent(descriptors, studentsList) {
  return function matchStudent(descriptor) {
    const entries = Object.entries(descriptors);
    if (!entries.length) return null;

    let best = { id: null, distance: Infinity };
    let secondBest = { id: null, distance: Infinity };
    entries.forEach(([id, savedDescriptor]) => {
      const distance = euclideanDistance(descriptor, new Float32Array(savedDescriptor));
      if (distance < best.distance) {
        secondBest = { ...best };
        best = { id, distance };
      } else if (distance < secondBest.distance) {
        secondBest = { id, distance };
      }
    });

    const margin = secondBest.distance - best.distance;

    if (best.distance >= 0.52) return null;
    if (entries.length > 1 && margin < 0.08) return null;

    return studentsList.find((s) => s.id === best.id) || null;
  };
}

// Helper: create a 128-dim descriptor with a known pattern
function makeDescriptor(seed) {
  return new Float32Array(128).map((_, i) => Math.sin(seed * (i + 1)));
}

describe('matchStudent', () => {
  it('returns the correct student when given a matching descriptor', () => {
    const desc = makeDescriptor(1);
    const descriptors = { 'std-001': Array.from(desc) };
    const students = [{ id: 'std-001', name: 'Alice' }];
    const match = createMatchStudent(descriptors, students);
    // Pass the exact same descriptor — distance should be 0
    expect(match(desc)).toEqual({ id: 'std-001', name: 'Alice' });
  });

  it('returns null when best and second-best are too close (ambiguous)', () => {
    const desc1 = makeDescriptor(1);
    // Create a second descriptor that's very close to desc1
    const desc2 = new Float32Array(128).map((_, i) => desc1[i] + 0.001);
    const descriptors = {
      'std-001': Array.from(desc1),
      'std-002': Array.from(desc2),
    };
    const students = [
      { id: 'std-001', name: 'Alice' },
      { id: 'std-002', name: 'Bob' },
    ];
    const match = createMatchStudent(descriptors, students);
    // Input is close to both — margin will be tiny, should return null
    const midpoint = new Float32Array(128).map((_, i) => (desc1[i] + desc2[i]) / 2);
    expect(match(midpoint)).toBeNull();
  });

  it('returns null when no descriptors are registered', () => {
    const match = createMatchStudent({}, []);
    expect(match(makeDescriptor(42))).toBeNull();
  });

  it('only matches against real descriptors (students without descriptors excluded)', () => {
    const realDesc = makeDescriptor(1);
    // Only std-001 has a descriptor in the pool
    const descriptors = { 'std-001': Array.from(realDesc) };
    // std-002 exists as a student but has NO entry in descriptors
    const students = [
      { id: 'std-001', name: 'Alice' },
      { id: 'std-002', name: 'Bob' },
    ];
    const match = createMatchStudent(descriptors, students);
    // Pass a descriptor that matches std-001
    expect(match(realDesc)).toEqual({ id: 'std-001', name: 'Alice' });
  });

  it('returns null when best distance exceeds threshold', () => {
    const stored = makeDescriptor(1);
    const farAway = makeDescriptor(999); // Very different
    const descriptors = { 'std-001': Array.from(stored) };
    const students = [{ id: 'std-001', name: 'Alice' }];
    const match = createMatchStudent(descriptors, students);
    expect(match(farAway)).toBeNull();
  });
});
