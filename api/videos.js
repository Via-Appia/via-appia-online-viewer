import { ref } from '@nuxtjs/composition-api'

import { potreeRef } from '~/api/VAPotree'

export const videos = ref({})

export const loadVideo = (path = '/videos/counter.mp4') => {
  const scene = potreeRef.viewer.scene.scene
  /**
     * Video
     */
  // assuming you have created a HTML video element with id="video"
  videos.value[path] = document.createElement('video')

  const video = videos.value[path]
  video.src = path
  video.id = path
  video.muted = true
  video.loop = false
  video.play()
  video.addEventListener('ended', () => {
    console.log('🎹 Ended')
    video.className = ''
  })
  video.addEventListener('seeked', (e) => {
    console.log('🎹 seeked', e)
  })

  const geometry = new THREE.PlaneGeometry(5, 5 * 0.75)
  const texture = new THREE.VideoTexture(video)
  const material = new THREE.MeshLambertMaterial({
    map: texture,
    opacity: 0.8, /// TODO HEEEEEEEEEEEEEEEEEEEERRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRrEEEEEEERE THE TRANSPARENCY
    transparent: true
  })
  const meshFloatingVideo = new THREE.Mesh(geometry, material)
  // meshFloatingVideo.name.set('hello there')

  // set the position of the image meshFloatingVideo in the x,y,z dimensions
  meshFloatingVideo.position.set(296258.018, 4633698.280614582, 131.53239533881214)
  meshFloatingVideo.rotation.set(90, 0, 0)
  meshFloatingVideo.name = path
  meshFloatingVideo.type = 'VIDEO_TYPE'

  // Callback for onclick?
  meshFloatingVideo.callback = function () { console.log('hello', this.name) }
  // add the image to the scene

  // TODO ADD VIDEO HERE!!!!!! UNCOMMENT
  scene.add(meshFloatingVideo)
  // return meshFloatingVideo
}

export const removeVideo = (path = '/videos/counter.mp4') => {
  try {
    const object = potreeRef.viewer.scene.scene.getObjectByName(path)
    object.material.dispose()
    potreeRef.viewer.scene.scene.remove(object)
  } catch (e) {
    console.error('🚨 No video selected:', e)
  }
}

export const moveToVideo = (mesh, offset = 1.25) => {
  // Convert position and rotation of mesh into target
  const newCamPos = mesh.position?.clone()
  const newCamRotation = mesh.rotation?.clone()

  const normal = new THREE.Vector3(0, 0, -1).applyEuler(newCamRotation)
  const target = new THREE.Vector3().add(newCamPos).add(normal.setLength(1))

  // TODO THIS METHOD DOESNT" WORK, BECAUSE IT SENDS THE CAMERA WAAYY TO FAR
  // Move into direction vector
  const distance = 4
  const dir = new THREE.Vector3() // create once an reuse it
  dir.subVectors(newCamPos, target).normalize() // create a direction vector based on the two 3D Points

  const pointNew = newCamPos.clone().addScaledVector(dir, distance) // your new point

  potreeRef.viewer.scene.view.setView(pointNew, target, 700, () => {
    console.log('🎹 eneded movement')
  })
}

function fitCameraToObject (camera, object, offset) {
  offset = offset || 1.5

  const boundingBox = new THREE.Box3()

  boundingBox.setFromObject(object)

  const center = boundingBox.getCenter(new THREE.Vector3())
  const size = boundingBox.getSize(new THREE.Vector3())

  const startDistance = center.distanceTo(camera.position)
  // here we must check if the screen is horizontal or vertical, because camera.fov is
  // based on the vertical direction.
  const endDistance = camera.aspect > 1
    ? ((size.y / 2) + offset) / Math.abs(Math.tan(camera.fov / 2))
    : ((size.y / 2) + offset) / Math.abs(Math.tan(camera.fov / 2)) / camera.aspect

  camera.position.set(
    camera.position.x * endDistance / startDistance,
    camera.position.y * endDistance / startDistance,
    camera.position.z * endDistance / startDistance
  )
  return camera.position
  // return new THREE.Vector3(camera.position.x * endDistance / startDistance,
  //   camera.position.y * endDistance / startDistance,
  //   camera.position.z * endDistance / startDistance
  // )
  // potreeRef.viewer.scene.view.lookAt(center)
}
