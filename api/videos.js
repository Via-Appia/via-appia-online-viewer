import { ref } from '@nuxtjs/composition-api'

import { potreeRef } from '~/api/VAPotree'

export const videos = ref({})

export const loadVideo = (path = '/videos/counter.mp4', width = 16, height = 9) => {
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

  const geometry = new THREE.PlaneGeometry(1, 1)
  const texture = new THREE.VideoTexture(video)
  const material = new THREE.MeshLambertMaterial({
    map: texture,
    opacity: 0.8, /// TODO HEEEEEEEEEEEEEEEEEEEERRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRrEEEEEEERE THE TRANSPARENCY
    transparent: true,
    side: THREE.DoubleSide
  })
  const meshFloatingVideo = new THREE.Mesh(geometry, material)
  // meshFloatingVideo.name.set('hello there')

  // set the position of the image meshFloatingVideo in the x,y,z dimensions
  meshFloatingVideo.position.set(296258.018, 4633698.280614582, 131.53239533881214)
  const scale = 5 * 1.48
  meshFloatingVideo.scale.set(1 * scale, (height / width) * scale, 1 * scale)
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

// TODO CONTINUE HEREEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE
/*

let container, scene, camera, renderer, controls, stats
const keyboard = new THREEx.KeyboardState()
const clock = new THREE.Clock()
// custom global variables
let cube
let MovingCube

export const moveVideo = () => {
  const delta = clock.getDelta() // seconds.
  const moveDistance = 200 * delta // 200 pixels per second
  const rotateAngle = Math.PI / 2 * delta // pi/2 radians (90 degrees) per second

  // local transformations

  // move forwards/backwards/left/right
  if (keyboard.pressed('W')) { MovingCube.translateZ(-moveDistance) }
  if (keyboard.pressed('S')) { MovingCube.translateZ(moveDistance) }
  if (keyboard.pressed('Q')) { MovingCube.translateX(-moveDistance) }
  if (keyboard.pressed('E')) { MovingCube.translateX(moveDistance) }

  // rotate left/right/up/down
  const rotation_matrix = new THREE.Matrix4().identity()
  if (keyboard.pressed('A')) { MovingCube.rotateOnAxis(new THREE.Vector3(0, 1, 0), rotateAngle) }
  if (keyboard.pressed('D')) { MovingCube.rotateOnAxis(new THREE.Vector3(0, 1, 0), -rotateAngle) }
  if (keyboard.pressed('R')) { MovingCube.rotateOnAxis(new THREE.Vector3(1, 0, 0), rotateAngle) }
  if (keyboard.pressed('F')) { MovingCube.rotateOnAxis(new THREE.Vector3(1, 0, 0), -rotateAngle) }

  if (keyboard.pressed('Z')) {
    MovingCube.position.set(0, 25.1, 0)
    MovingCube.rotation.set(0, 0, 0)
  }

  const relativeCameraOffset = new THREE.Vector3(0, 50, 200)

  const cameraOffset = relativeCameraOffset.applyMatrix4(MovingCube.matrixWorld)

  camera.position.x = cameraOffset.x
  camera.position.y = cameraOffset.y
  camera.position.z = cameraOffset.z
  camera.lookAt(MovingCube.position)

  // camera.updateMatrix();
  // camera.updateProjectionMatrix();

  stats.update()
  console.log('🎹', stats)
}
*/

export const removeVideo = (path = '/videos/counter.mp4') => {
  try {
    const object = potreeRef.viewer.scene.scene.getObjectByName(path)
    object.material.dispose()
    potreeRef.viewer.scene.scene.remove(object)
  } catch (e) {
    console.error('🚨 No video selected:', e)
  }
}

export const moveToVideo = (mesh, offset = 3.6) => {
  // Convert position and rotation of mesh into target
  const newCamPos = mesh.position?.clone()
  const newCamRotation = mesh.rotation?.clone()

  const normal = new THREE.Vector3(0, 0, -1).applyEuler(newCamRotation)
  const target = new THREE.Vector3().add(newCamPos).add(normal.setLength(1))

  // TODO THIS METHOD DOESNT" WORK, BECAUSE IT SENDS THE CAMERA WAAYY TO FAR
  // Move into direction vector
  const distance = offset
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
