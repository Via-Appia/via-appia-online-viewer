import { ref } from '@nuxtjs/composition-api'

import { potreeRef } from '~/api/VAPotree'
import { tweenToPromisify } from '~/api/tweenUtils'
import { fadeOutDT } from '~/content/app-settings.yaml'

export const videos = ref({})

export const loadVideo = async ({
  mediaPath = '/videos/counter.mp4',
  mediaPosition,
  mediaRotation,
  mediaScale = 1,
  cameraFOV
}) => {
  try {
    !mediaPosition && console.error('No mediaPosition defined')
    !mediaRotation.length === 0 && console.error('No mediaRotation defined')
    mediaPath === '' && console.error('No mediaPath defined')

    // Define aspect Screen aspect ratio
    const aspectRatio = 9 / 16 // 16:9

    const scene = potreeRef.viewer.scene.scene
    /**
     * Video
     */
    // Create video placeholder
    // assuming there is created an HTML video element with id="video"
    videos.value[mediaPath] = document.createElement('video')
    const video = videos.value[mediaPath]
    video.src = mediaPath
    video.id = mediaPath
    video.muted = true
    video.loop = false
    video.autoplay = true
    video.pause()

    const geometry = new THREE.PlaneGeometry(1, 1)
    const texture = new THREE.VideoTexture(video)
    const material = new THREE.MeshLambertMaterial({
      map: texture,
      opacity: 0,
      transparent: true,
      side: THREE.DoubleSide
    })

    const meshFloatingVideo = new THREE.Mesh(geometry, material)

    // set the position of the image meshFloatingVideo in the x,y,z dimensions
    // const keep = 6.37 * this.scaleMedia
    const keep = 6.41 * mediaScale
    const scale = keep * Math.tan(cameraFOV / 2.0 * Math.PI / 180.0) * 2.0
    meshFloatingVideo.scale.set(1 * scale, (aspectRatio) * scale, 1 * scale)
    meshFloatingVideo.name = mediaPath
    meshFloatingVideo.type = 'VIDEO_TYPE'
    meshFloatingVideo.rotation.set(90, 0, 0)
    meshFloatingVideo.position.set(mediaPosition[0], mediaPosition[1], mediaPosition[2])

    const quaternion = {
      _x: mediaRotation[0],
      _y: mediaRotation[1],
      _z: mediaRotation[2],
      _w: mediaRotation[3]
    }
    const rads = new THREE.Euler().setFromQuaternion(quaternion)
    meshFloatingVideo.rotation.set(rads._x, rads._y, rads._z)

    // Add media to the scene
    scene.add(meshFloatingVideo)
    tweenToPromisify(meshFloatingVideo.material, { opacity: 1 }, fadeOutDT * 1000)
  }
  catch (e) {
    console.error('Video could not be loaded')
  }
}

export const removeVideo = (mediaPath = '/videos/counter.mp4') => {
  try {
    const object = potreeRef.viewer.scene.scene.getObjectByName(mediaPath)
    object.material.dispose()
    potreeRef.viewer.scene.scene.remove(object)
  }
  catch (e) {
    console.error('🚨 No video selected:', e)
  }
}

export const moveToVideo = (mesh, offset = 3.6) => {
  // Convert position and rotation of mesh into target
  const newCamPos = mesh.position?.clone()
  const newCamRotation = mesh.rotation?.clone()

  const normal = new THREE.Vector3(0, 0, -1).applyEuler(newCamRotation)
  const target = new THREE.Vector3().add(newCamPos).add(normal.setLength(1))

  // Move into direction vector
  const distance = offset
  const dir = new THREE.Vector3() // create once an reuse it
  dir.subVectors(newCamPos, target).normalize() // create a direction vector based on the two 3D Points

  const pointNew = newCamPos.clone().addScaledVector(dir, distance) // your new point

  potreeRef.viewer.scene.view.setView(/* move to point */pointNew, /* look at target */target, /* Speed */ 700, () => {
    console.log('🎹 eneded movement')
  })
}
