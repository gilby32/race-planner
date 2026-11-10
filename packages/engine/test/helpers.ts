/**
 * Generates a synthetic GPX heading north along a meridian.
 * `elevationAt` takes the distance in meters and returns the elevation.
 */
export function syntheticGpx(
  distanceM: number,
  elevationAt: (distanceM: number) => number,
  stepM = 10,
  name = 'Test course',
): string {
  const metersPerDegLat = 111_195; // approx. along a meridian with mean Earth radius
  const pts: string[] = [];
  for (let d = 0; d <= distanceM + 1e-9; d += stepM) {
    const lat = 40 + d / metersPerDegLat;
    pts.push(
      `<trkpt lat="${lat.toFixed(7)}" lon="-3.7"><ele>${elevationAt(d).toFixed(2)}</ele></trkpt>`,
    );
  }
  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="test" xmlns="http://www.topografix.com/GPX/1/1">
  <trk><name>${name}</name><trkseg>${pts.join('')}</trkseg></trk>
</gpx>`;
}
