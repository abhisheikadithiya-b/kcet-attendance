import { describe, it, expect } from 'vitest';

function getDecimalPlaces(val) {
  if (val === null || val === undefined) return 0;
  const str = String(val).trim();
  if (!str.includes('.')) return 0;
  return str.split('.')[1].length;
}

function distanceToSegmentMeters(pLat, pLon, lat1, lon1, lat2, lon2) {
  const latRad = (pLat * Math.PI) / 180;
  const metersPerDegreeLat = 111139;
  const metersPerDegreeLon = 111139 * Math.cos(latRad);

  const px = 0;
  const py = 0;
  const x1 = (lon1 - pLon) * metersPerDegreeLon;
  const y1 = (lat1 - pLat) * metersPerDegreeLat;
  const x2 = (lon2 - pLon) * metersPerDegreeLon;
  const y2 = (lat2 - pLat) * metersPerDegreeLat;

  const dx = x2 - x1;
  const dy = y2 - y1;

  if (dx === 0 && dy === 0) {
    return Math.sqrt(x1 * x1 + y1 * y1);
  }

  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy)));
  const projX = x1 + t * dx;
  const projY = y1 + t * dy;

  return Math.sqrt(projX * projX + projY * projY);
}

function minDistanceToPolygonMeters(lat, lon, polygon) {
  if (!polygon || polygon.length < 3) return Infinity;
  let minDistance = Infinity;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const p1 = polygon[j];
    const p2 = polygon[i];
    const dist = distanceToSegmentMeters(lat, lon, p1[0], p1[1], p2[0], p2[1]);
    if (dist < minDistance) minDistance = dist;
  }
  return minDistance;
}

function isPointInPolygon(lat, lon, vs) {
  let inside = false;
  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    let xi = vs[i][0], yi = vs[i][1];
    let xj = vs[j][0], yj = vs[j][1];
    let intersect = ((yi > lon) !== (yj > lon))
        && (lat < (xj - xi) * (lon - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

// Strict Polygon Evaluation (NO BUFFER)
function evaluateGeofenceStrict(latitude, longitude, accuracy, polygon) {
  const rawLatStr = latitude !== undefined && latitude !== null ? String(latitude) : '';
  const rawLonStr = longitude !== undefined && longitude !== null ? String(longitude) : '';

  if (accuracy === undefined || accuracy === null || isNaN(accuracy) || accuracy <= 0) {
    return { inside: false, reason: 'REJECTED: GPS accuracy reading missing or invalid' };
  }

  if (getDecimalPlaces(rawLatStr) < 4 || getDecimalPlaces(rawLonStr) < 4) {
    return { inside: false, reason: 'REJECTED: Coarse GPS reading' };
  }

  const inside = isPointInPolygon(latitude, longitude, polygon);
  const distanceOutside = inside ? 0 : minDistanceToPolygonMeters(latitude, longitude, polygon);
  return { inside, distanceOutside };
}

describe('Strict Polygon-Only Geofence Evaluation (No Buffer)', () => {
  const polygon = [
    [9.673000, 77.961800],
    [9.673400, 77.961800],
    [9.673400, 77.962200],
    [9.673000, 77.962200]
  ];

  it('passes coordinate strictly inside classroom polygon', () => {
    const insideLat = 9.673200;
    const insideLon = 77.962001;
    const result = evaluateGeofenceStrict(insideLat, insideLon, 10, polygon);
    expect(result.inside).toBe(true);
    expect(result.distanceOutside).toBe(0);
  });

  it('rejects coordinate even 1 meter outside the classroom polygon with zero tolerance', () => {
    const justOutsideLat = 9.673409; // ~1 meter north of top edge
    const insideLon = 77.962001;
    const accuracy = 3;

    const result = evaluateGeofenceStrict(justOutsideLat, insideLon, accuracy, polygon);
    expect(result.inside).toBe(false);
    expect(result.distanceOutside).toBeGreaterThan(0);
  });

  it('rejects coordinate 5m outside polygon even when accuracy is 12m (no buffer allowed)', () => {
    const nearLat = 9.673445;
    const nearLon = 77.962001;
    const accuracy = 12;

    const result = evaluateGeofenceStrict(nearLat, nearLon, accuracy, polygon);
    expect(result.inside).toBe(false);
    expect(result.distanceOutside).toBeGreaterThan(0);
  });

  it('rejects coordinate 20m outside polygon strictly', () => {
    const outsideLat = 9.673580;
    const outsideLon = 77.962001;

    const result = evaluateGeofenceStrict(outsideLat, outsideLon, 10, polygon);
    expect(result.inside).toBe(false);
    expect(result.distanceOutside).toBeGreaterThan(15);
  });

  it('rejects coarse coordinates with fewer than 4 decimal places', () => {
    const coarseLat = 9.67;
    const coarseLon = 77.962001;

    const result = evaluateGeofenceStrict(coarseLat, coarseLon, 5, polygon);
    expect(result.inside).toBe(false);
    expect(result.reason).toContain('Coarse GPS reading');
  });

  it('rejects missing or zero accuracy readings requiring retry', () => {
    const validLat = 9.673200;
    const validLon = 77.962001;

    expect(evaluateGeofenceStrict(validLat, validLon, 0, polygon).inside).toBe(false);
    expect(evaluateGeofenceStrict(validLat, validLon, null, polygon).inside).toBe(false);
    expect(evaluateGeofenceStrict(validLat, validLon, undefined, polygon).inside).toBe(false);
  });
});
