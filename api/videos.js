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

  const geometry = new THREE.PlaneGeometry(10, 10 * 0.75)
  const texture = new THREE.VideoTexture(video)
  const material = new THREE.MeshLambertMaterial({ map: texture })
  const meshFloatingVideo = new THREE.Mesh(geometry, material)
  // meshFloatingVideo.name.set('hello there')

  // set the position of the image meshFloatingVideo in the x,y,z dimensions
  meshFloatingVideo.position.set(296255.77195538126, 4633698.280614582, 131.53239533881214)
  meshFloatingVideo.rotation.set(90, 0, 0)
  meshFloatingVideo.name = path
  meshFloatingVideo.type = 'VIDEO_TYPE'

  // Callback for onclick?
  meshFloatingVideo.callback = function () { console.log('hello', this.name) }
  // add the image to the scene
  scene.add(meshFloatingVideo)
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
