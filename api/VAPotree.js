// Access the potreeView instance from everywhere using composition API
import { reactive } from '@nuxtjs/composition-api'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { VAFirstPersonControls } from '~/components/overrides/VAFirstPersonControls'

export const potreeRef = reactive(
  {
    viewer: null,
    props: { moveSpeed: null },
    videos: {}
  })

/*
 Custom methods library for Via Appia
 */

export function initViewer (DOMElement) {
  // Load potree viewer inside the DOM
  potreeRef.viewer = new Potree.Viewer(DOMElement)
  const viewer = potreeRef.viewer
  loadInitialPointCloud()

  viewer.loadGUI(() => {
    viewer.setLanguage('en')
    $('#menu_tools').next().show()
    $('#menu_clipping').next().show()
    $('#menu_scene').next().show()
    // hide menu button in the sidebar
    $('#potree_quick_buttons').hide()
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

    // Potree leave Side Panel
    viewer.toggleSidebar()

    // Control camera with the keyboard
    viewer.fpControls = new VAFirstPersonControls(potreeRef.viewer)
    viewer.fpControls.addEventListener('start', viewer.disableAnnotations)
    viewer.fpControls.addEventListener('end', viewer.enableAnnotations)
    viewer.setControls(potreeRef.viewer.fpControls)

    addFloor()
    addLights()
    listenSelectObject()
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
  const material = new THREE.MeshBasicMaterial({ color: 0x2E3222, side: THREE.DoubleSide })
  const plane = new THREE.Mesh(geometry, material)
  plane.position.set(296266.35737207683, 4633691.154054946, 100)
  potreeRef.viewer.scene.scene.add(plane)
}

export function listenSelectObject () {
  const raycaster = new THREE.Raycaster()
  const mouse = new THREE.Vector2()

  window.addEventListener('click', (event) => {
    // calculate mouse position in normalized device coordinates
    // (-1 to +1) for both components
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
    // update the picking ray with the camera and mouse position
    const camera = potreeRef.viewer.scene.getActiveCamera()
    raycaster.setFromCamera(mouse, camera)
    const sceneChildren = potreeRef.viewer.scene.scene.children
    // calculate objects intersecting the picking ray
    const intersects = raycaster.intersectObjects(sceneChildren)

    for (let i = 0; i < intersects.length; i++) {
      if (intersects[i].object.type === 'VIDEO_TYPE') {
        // Toggle color, DEMO
        const isSelected = intersects[i].object.material.emissive?.getHex() === 0xFF0000
        intersects[i].object.material.emissive?.setHex(isSelected ? 0x000000 : 0xFF0000)
        potreeRef.selectedVideo = intersects[i].object.uuid
        console.log('🎹', potreeRef.selectedVideo)
      }
    }
  })
}

export function loadInitialPointCloud () {
  // Pointcloud data source
  const POINT_CLOUD_URL = process.env.isLocalPointClouds
    // locally
    ? 'http://localhost:3000/pointclouds/DRIVE_1_V3_levels_8/cloud.js'
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
