// Access the potreeView instance from everywhere using composition API
import { reactive } from '@nuxtjs/composition-api'

import { VAFirstPersonControls } from '~/api/VAFirstPersonControls'
import { moveToVideo } from '~/api/videos'
import { visiblePointCloud } from '~/content/app-settings.yaml'
import config from '~/nuxt.config'
import { goToCameraPosition } from '~/api/utils'

// import { VACameraAnimation } from '~/api/VACameraAnimation'
export const potreeRef = reactive(
  {
    viewer: null, // shortcut
    camera: null,
    props: { moveSpeed: null },
    videos: {},
    selectedVideo: null,
    followCamera: false,
    fov: 60,
    idleTimer: 0,
    isWebPanelOpen: true,
    lang: 'nl'
  })

/*
 Custom methods library for Via Appia
 */

export function initViewer (DOMElement) {
  window.potreeRef = potreeRef
  // Load potree viewer inside the DOM
  potreeRef.viewer = new Potree.Viewer(DOMElement)

  potreeRef.camera = potreeRef.viewer.scene.getActiveCamera()
  const renderer = potreeRef.viewer.renderer

  const cameraGroup = new THREE.Group()
  cameraGroup.position.set(0, -1, 1.5) // Set the initial VR Headset Position.

  // When user turn on the VR mode.

  const controller1 = renderer.xr.getController(0) // 0 is the right hand, 1 is the left hand.

  const xrSession = renderer.xr.getSession()

  // VR Session Start
  renderer.xr.addEventListener('sessionstart', function () {
    console.log('🎹 enter VR')

    const controllerGrip0 = renderer.xr.getControllerGrip(0)
    controllerGrip0.addEventListener('connected', (e) => {
      console.log(e.data.gamepad)
    })

    potreeRef.props.moveSpeed = 0.05
    console.log('scene', potreeRef.viewer.sceneVR)
    // potreeRef.viewer.scene.add(cameraGroup)
    // cameraGroup.add(potreeRef.camera)

    controllerGrip0.addEventListener('connected', (e) => {
      console.log('🔥', e.data.gamepad)
      // potreeRef.viewer.scene.view.setView(
      //   [297021.32189172896, 4632734.229026784, 138.83809020126625],
      //   [297019.95815798827, 4632737.3404541155, 128.82249902670137]
      // )
    })
  })
  // When user turn off the VR mode.
  renderer.xr.addEventListener('sessionend', function () {
    console.log('🎹 exit vr')
    // potreeRef.viewer.scene.remove(cameraGroup)
    // cameraGroup.remove(potreeRef.camera)
  })
  function goToVRPosition (position) {
    // const vrControls = potreeRef.viewer.vrControls
    // const camVR = potreeRef.viewer.vrControls.getCamera()
    // const sceneVR = potreeRef.viewer.sceneVR
    // const node = potreeRef.viewer.vrControls.node.clone()

    // node?.up?.set(0, 0, 1)
    // console.log('🎹 node ', node)

    // this.camera = new PerspectiveCamera(fov, el.clientWidth / el.clientHeight, 0.1, 1000);
    // Set initial position
    // camVR.position.set(0, 1.6, 0)
    // sceneVR.add(camVR)
    //
    // // Add group for teleportation help
    // const cameraGroup = new THREE.Group()
    // cameraGroup.add(camVR)
    // sceneVR.add(cameraGroup)

    // camVR.position.set(297021.32189172896, 4632734.229026784, 138.83809020126625)
    // const hello = new THREE.Vector3()
    // const vrPos = camVR.getWorldPosition(new THREE.Vector3())
    // const vrDir = camVR.getWorldDirection(new THREE.Vector3())
    // // const vrTarget = vrPos.clone().add(vrDir)
    //
    // const scenePos = toScene(vrPos, node)
    // const sceneDir = toScene(vrPos.clone().add(vrDir), node).sub(scenePos)
    // // sceneDir.normalize().multiplyScalar(scale)
    // const sceneTarget = scenePos.clone().add(sceneDir)
    //
    // // potreeRef.viewer.scene.view.setView(vrPos, vrDir)
    // vrControls.viewer.scene.view.setView(scenePos, sceneTarget)

    function toScene (vec, ref) {
      const node = ref.clone()
      node.updateMatrix()
      node.updateMatrixWorld()

      const result = vec.clone().applyMatrix4(node.matrix)
      result.z -= 0.8 * node.scale.x
      return result
    };

    // const camVR = potreeRef.viewer.vrControls.getCamera()
    const vrControls = potreeRef.viewer.vrControls
    const sceneVR = potreeRef.viewer.sceneVR
    const node = potreeRef.viewer.vrControls.node.clone()

    const fakeCam = new THREE.PerspectiveCamera()
    const camVR = vrControls.viewer.renderer.xr.getCamera(fakeCam)

    const vrPos = camVR.getWorldPosition(new THREE.Vector3(297021.32189172896, 4632734.229026784, 138.83809020126625))
    const vrDir = camVR.getWorldDirection(new THREE.Vector3(297019.95815798827, 4632737.3404541155, 128.82249902670137))
    // const vrTarget = vrPos.clone().add(vrDir.multiplyScalar(scale))

    const vrControls = potreeRef.viewer.vrControls
    vrControls.viewer.scene.view.setView(
      new THREE.Vector3(297021.32189172896, 4632734.229026784, 138.83809020126625),
      new THREE.Vector3(297021.32189172896, 4632734.229026784, 138.83809020126625)
    )

    const scenePos = toScene(vrPos, vrControls.node)
    const sceneDir = toScene(vrPos.clone().add(vrDir), vrControls.node).sub(scenePos)
    // sceneDir.normalize().multiplyScalar(scale)
    const sceneTarget = scenePos.clone().add(sceneDir)

    vrControls.viewer.scene.view.setView(scenePos, sceneTarget)
  }

  controller1.addEventListener('selectstart', () => {
    console.log('select start', xrSession)

    // const controllerGrip0 = renderer.xr.getControllerGrip(0)

    // potreeRef.viewer.scene.view.setView(
    //   [297021.32189172896, 4632734.229026784, 138.83809020126625],
    //   [297019.95815798827, 4632737.3404541155, 128.82249902670137]
    // )
    // refSpace = xrSession.requestReferenceSpace('local')
    //   .then((refSpace) => {
    //     console.log('request reference space', refSpace)
    //
    //     let xrReferenceSpace = refSpace
    //     xrReferenceSpace = xrReferenceSpace.getOffsetReferenceSpace(
    //       new XRRigidTransform(startPosition, {
    //         x: 0,
    //         y: 0,
    //         z: 1.0,
    //         w: 1.0
    //       }))
    //     xrSession.requestAnimationFrame(drawFrame)
    //   })
  })

  controller1.addEventListener('selectend', function () {
    console.log('select end')
    goToVRPosition()
    // console.log('🎹 select end', window.router)
    // window.router.push('/stories/c/monument')

    // const router = new VueRouter({
    //   mode: 'history',
    //   routes
    // })
    // router.push({to: 'stories', params: {story: "o", page: 'monument'})

    // http://localhost:3000/stories/o/01_o_01_jhp-720p
    // goToCameraPosition([
    //   [[296931.215172637, 4632817.463419554, 142.58990221807665], [296939.75952856085, 4632815.540032167, 143.0211841598578]],
    //   [[296924.4350279619, 4632816.680167795, 144.26897258359915], [296940.8415879849, 4632816.859497718, 142.5246592541178]],
    //   [[296914.87994132796, 4632816.788384672, 145.41877017778373], [296931.26394754136, 4632816.03781444, 143.6157214467935]],
    //   [[296912.51318480907, 4632839.809527022, 144.08578871128137], [296923.6876265672, 4632827.751859346, 142.67352045418983]],
    //   [[296929.28785643005, 4632856.122564406, 142.63299224381888], [296936.3369849388, 4632841.232928367, 141.70642551429566]]
    // ])
    //
    // If there is only one point defined in the scene, then fly to it directly
    //
    // try {
    //   // renderer.xr.getCamera()//.lookAt(296249.19705492083, 4633726.448203472, 128.7690558114301)
    //   // console.log('🎹 renderer.xr.getCamera()', renderer.xr.getCamera(potreeRef.viewer.scene))
    //   // console.log('🎹 renderer.xr.getCamera()',
    //   renderer.xr.getCamera(new THREE.Scene()).lookAt(296249.19705492083, 4633726.448203472, 128.7690558114301)
    //   console.log('pos', renderer.xr.getCamera(new THREE.Scene()).position)
    //   // potreeRef.viewer.scene.view.lookAt(296249.19705492083, 4633726.448203472, 128.7690558114301)
    // }
    // catch (e) {
    //   console.log(e)
    // }
    //
    // potreeRef.viewer.scene.view.position.set(
    //   296249.19705492083, 4633726.448203472, 128.7690558114301
    // )

    // position: [296249.19705492083, 4633726.448203472, 128.7690558114301]
    // cameraPosition: [296260.6092322839, 4633696.311992192, 130.7733116269969]
    // cameraTarget: [296255.42565172265, 4633711.747814068, 133.44087523067427]
  })

  // const width = window.innerWidth
  // const height = window.innerHeight
  // const camera = new THREE.PerspectiveCamera(60, width / height, 0.01, 100)
  // potreeRef.cameraControls = new CameraControls(camera, DOMElement)
  // potreeRef.cameraControls = new CameraControls(potreeRef.camera, DOMElement)

  const viewer = potreeRef.viewer

  if (visiblePointCloud || !config.isDev) {
    loadInitialPointCloud()
  }

  viewer.loadGUI(() => {
    viewer.setLanguage('en')
    $('#menu_tools').next().show()
    $('#menu_clipping').next().show()
    $('#menu_scene').next().show()
    // hide menu button in the sidebar
    // $('#potree_quick_buttons').hide()
    // Add custom section for Camera
    const cameraSection = $(`
        <h3 id="menu_camera" class="accordion-header ui-widget"><span>Camera</span></h3>
        <div class="accordion-content ui-widget pv-menu-list"></div>
        `)

    // get vue component for Camera Section
    const cameraSectionHTML = $('#cameraSection')
    const cameraSectionContent = cameraSection.last()
    cameraSectionContent.html(cameraSectionHTML)
    cameraSection.first().click(() => cameraSectionContent.slideToggle())
    cameraSection.insertBefore($('#menu_tools'))
    const initialMoveSpeed = 5.5

    potreeRef.props.moveSpeed = initialMoveSpeed
    viewer.setMoveSpeed(initialMoveSpeed)

    viewer.setFOV(60)
    viewer.setBackground('skybox')
    viewer.setEDLEnabled(false)
    viewer.setPointBudget(process.env.pointsBudget)
    viewer.loadSettingsFromURL()

    // Set initial camera view position
    viewer.scene.view.position.set(296264.39688606694, 4633679.776566018, 129.77835768357866)
    viewer.scene.view.yaw = 0.3
    viewer.scene.view.pitch = 0

    // TODO: Add fog to th scene
    // const color = 0xFFFFFF
    // viewer.scene.fog = new THREE.Fog(color, 1000, 5000)
    // console.log('🎹 view: ' + viewer.scene.fog)

    // Potree leave Side Panel
    viewer.toggleSidebar()

    // Control camera with the keyboard
    viewer.fpControls = new VAFirstPersonControls(potreeRef.viewer)
    viewer.fpControls.addEventListener('start', viewer.disableAnnotations)
    viewer.fpControls.addEventListener('end', viewer.enableAnnotations)
    viewer.setControls(potreeRef.viewer.fpControls)

    addFloor()
    addLights()
    if (config.isDev) {
      listenSelectObject()
    }
    // addBunnyExample()
  })
}

// LIGHTS
function addLights () {
  // Ambient light will make the messes look uniform.
  const ambient = new THREE.AmbientLight(0xFFFFFF)

  // Other lights create shadows and luminescence for the images
  //   const directional = new THREE.DirectionalLight(0xFFFFFF, 1.0)
  //   directional.position.set(10, 10, 10)
  //   directional.lookAt(0, 0, 0)
  //   viewer.scene.scene.add(directional)

  potreeRef.viewer.scene.scene.add(ambient)
}

// Floor
function addFloor () {
  const geometry = new THREE.PlaneGeometry(100000, 100000)
  const material = new THREE.MeshBasicMaterial({ color: 0x24271A, side: THREE.DoubleSide })
  const plane = new THREE.Mesh(geometry, material)
  plane.position.set(296266.35737207683, 4633691.154054946, 100)
  potreeRef.viewer.scene.scene.add(plane)
}

function initOpacityKeys () {
  let history = null

  const setOpacity = (video, opacity) => {
    if (video) {
      video.material.opacity = opacity
    }
  }

  const handleKeyPress = (event) => {
    const keys = { 1: 0.1, 2: 0.2, 3: 0.3, 4: 0.4, 5: 0.5, 6: 0.6, 7: 0.7, 8: 0.8, 9: 0.9, 0: 0.0 }
    const input = keys[event.key] && event.altKey ? keys[event.key] : null

    if (!input) {
      return
    }

    const opacity = input === history ? 1 : input
    setOpacity(potreeRef.selectedVideo, opacity)
    history = opacity
  }
  if (config.isDev) {
    document.addEventListener('keydown', handleKeyPress)
  }
}

export function listenSelectObject () {
  // Do not select any object if there is a media following the camera
  if (potreeRef.followCamera) {
    return
  }
  const raycaster = new THREE.Raycaster()
  const mouse = new THREE.Vector2()
  // calculate mouse position in normalized device coordinates
  // (-1 to +1) for both components
  mouse.x = (event?.clientX / window.innerWidth) * 2 - 1
  mouse.y = -(event?.clientY / window.innerHeight) * 2 + 1
  // update the picking ray with the camera and mouse position
  const camera = potreeRef.viewer.scene.getActiveCamera()
  raycaster.setFromCamera(mouse, camera)
  const sceneChildren = potreeRef.viewer.scene.scene.children
  // calculate objects intersecting the picking ray
  const intersects = raycaster.intersectObjects(sceneChildren)

  // for (let i = 0; i < intersects.length; i++) {
  if (intersects[0]?.object?.type === 'VIDEO_TYPE' && config.isDev) {
    // Toggle color, DEMO
    // const isSelected = intersects[0].object.material.emissive?.getHex() === 0xFF0000
    // intersects[0].object.material.emissive?.setHex(isSelected ? 0x000000 : 0xFF0000)
    moveToVideo(intersects[0].object)
    potreeRef.selectedVideo = intersects[0].object
    // }
  }
}

export function loadInitialPointCloud () {
  initOpacityKeys()
  // Pointcloud data source
  const POINT_CLOUD_URL = process.env.isLocalPointClouds
    // locally
    // ? 'http://localhost:3000/pointclouds/DRIVE_1_V3_levels_8/cloud.js'
    ? '/pointclouds/highres/cloud.js'
    // Cloud storage
    : 'https://storage.googleapis.com/via-appia-20540.appspot.com/cloud.js'

  Potree.loadPointCloud(
    POINT_CLOUD_URL,
    'Drive Map',
    ({ pointcloud }) => {
      pointcloud.material.size = 1
      pointcloud.material.pointSizeType = Potree.PointSizeType.ADAPTIVE
      pointcloud.material.shape = Potree.PointShape.SQUARE

      // Load pointcloud data
      potreeRef.viewer.scene.addPointCloud(pointcloud)
    }
  )
}

export function toggleAnimationVisibility () {
  potreeRef.viewer.scene.scene.view.getPivot().toArray()
  potreeRef.viewer.scene.scene.cameraAnimations[0].setVisible(!potreeRef.viewer.scene.cameraAnimations[0].visible)
}

export function addAnimationPath (positions = [], targets = [], duration = 3) {
  const animation = new Potree.CameraAnimation(potreeRef.viewer)

  for (let i = 0; i < positions.length; i++) {
    const cp = animation.createControlPoint()
    cp.position.set(...positions[i])
    cp.target.set(...targets[i])
  }
  animation.visible = false
  animation.duration = duration
  potreeRef.viewer.scene.addCameraAnimation(animation)
}

// Load Textured bunny from obj
/* function addBunnyExample () {
  const manager = new THREE.LoadingManager()
  manager.onProgress = function (item, loaded, total) {
    console.log(item, loaded, total)
  }
  const textureLoader = new THREE.TextureLoader(manager)
  const texture = textureLoader.load(`${Potree.resourcePath}/textures/brick_pavement.jpg`)
  const onProgress = function (xhr) {
    if (xhr.lengthComputable) {
      const percentComplete = xhr.loaded / xhr.total * 100
      console.log(Math.round(percentComplete, 2) + '% downloaded')
    }
  }
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping

  const onError = function (xhr) {}
  const loader = new OBJLoader(manager)
  loader.load('/models/stanford_bunny_reduced.obj', (object) => {
    object.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material.map = texture
      }
    })

    object.position.set(296266.35737207683, 4633691.154054946, 127.2844159686045)
    object.scale.multiplyScalar(10)
    object.rotation.set(Math.PI / 2, Math.PI, 0)

    viewer.scene.scene.add(object)

    viewer.onGUILoaded(() => {
      // Add entries to object list in sidebar
      const tree = $('#jstree_scene')
      const parentNode = 'other'

      const bunnyID = tree.jstree('create_node', parentNode, {
        text: 'Bunny Textured',
        icon: `${Potree.resourcePath}/icons/triangle.svg`,
        data: object
      },
      'last', false, false)
      tree.jstree(object.visible ? 'check_node' : 'uncheck_node', bunnyID)

      // tree.jstree("open_node", parentNode);
    })
  }, onProgress, onError)
} */
