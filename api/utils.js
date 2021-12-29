import proj4 from 'proj4'

export class Utils {
  static computeAzimuth (p1, p2, projection) {
    let azimuth = 0

    if (projection) {
      // if there is a projection, transform coordinates to WGS84
      // and compute angle to north there

      let transform

      if (projection.includes('EPSG')) {
        transform = proj4(projection, 'WGS84')
      } else {
        proj4.defs('pointcloud', projection)
        transform = proj4('pointcloud', 'WGS84')
      }

      const llP1 = transform.forward(p1.toArray())
      const llP2 = transform.forward(p2.toArray())
      const dir = [
        llP2[0] - llP1[0],
        llP2[1] - llP1[1]
      ]
      azimuth = Math.atan2(dir[1], dir[0]) - Math.PI / 2
    } else {
      // if there is no projection, assume [0, 1, 0] as north direction

      const dir = [p2.x - p1.x, p2.y - p1.y]
      azimuth = Math.atan2(dir[1], dir[0]) - Math.PI / 2
    }

    // make clockwise
    azimuth = -azimuth

    return azimuth
  }
};
