import proj4 from 'proj4'
import { VACameraAnimation } from '~/api/VACameraAnimation'
import { potreeRef } from '~/api/VAPotree'
import { cameraMoveDT } from '~/content/app-settings.yaml'

export class Utils {
  static computeAzimuth (p1, p2, projection) {
    let azimuth = 0

    if (projection) {
      // if there is a projection, transform coordinates to WGS84
      // and compute angle to north there

      let transform

      if (projection.includes('EPSG')) {
        transform = proj4(projection, 'WGS84')
      }
      else {
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
    }
    else {
      // if there is no projection, assume [0, 1, 0] as north direction

      const dir = [p2.x - p1.x, p2.y - p1.y]
      azimuth = Math.atan2(dir[1], dir[0]) - Math.PI / 2
    }

    // make clockwise
    azimuth = -azimuth

    return azimuth
  }
};

export async function goToCameraPosition (cameraPath = []) {
  // if there are not any camera points defined, then don't do anything.
  if (cameraPath?.length === 0) {
    return
  }
  debugger
  //
  // If there is only one point defined in the scene, then fly to it directly
  //
  const animation = new VACameraAnimation(potreeRef.viewer)

  // Get the positions and tagets from the markdown file
  const positions = cameraPath?.map(position => position[0]) || []
  const targets = cameraPath?.map(target => target[1]) || []

  // Add to the current camera point to the camera path to animate from it
  positions.push(potreeRef.viewer.scene.getActiveCamera().position.toArray())
  targets.push(potreeRef.viewer.scene.view.getPivot().toArray())

  // Reverse the array to start the camera animation from the bottom to the beginning
  const _positions = positions.reverse()
  const _targets = targets.reverse()
  // Build the camera animation path
  _positions.forEach((position, i) => {
    const cp = animation.createControlPoint()
    cp.position.set(..._positions[i])
    cp.target.set(..._targets[i])
  })

  animation.visible = false
  animation.duration = cameraMoveDT
  // Wait for the camera animation transition to finish
  await animation.play()
  // }
}
