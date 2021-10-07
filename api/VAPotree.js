// Access the potreeView instance from everywhere using composition API
import { reactive } from '@nuxtjs/composition-api'
import { VAFirstPersonControls } from '~/components/overrides/VAFirstPersonControls'

export const potreeRef = reactive({})

/*
 Custom methods library for Via Appia
 */
export function setInitialSceneParameters () {
  // Todo move from the global scope
  // we need to pass to the global value the viewer, otherwise, the animation won't be able to load
  const viewer = potreeRef.viewer
  window.viewer = viewer

  viewer.setFOV(60)
  viewer.setBackground('skybox')
  viewer.setEDLEnabled(false)
  viewer.setPointBudget(3_000_000)
  viewer.loadSettingsFromURL()

  // Set initial camera view position
  viewer.scene.view.position.set(296264.39688606694, 4633679.776566018, 129.77835768357866)
  viewer.scene.view.yaw = 0.3
  viewer.scene.view.pitch = 0

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

    viewer.toggleSidebar()

    // Control camera with the keyboard
    viewer.fpControls = new VAFirstPersonControls(viewer)
    viewer.fpControls.addEventListener('start', viewer.disableAnnotations)
    viewer.fpControls.addEventListener('end', viewer.enableAnnotations)
    viewer.setControls(viewer.fpControls)
    viewer.setMoveSpeed(5.5)
  })
}

export function loadInitialPointCloud (isDev) {
  // Pointcloud data source
  const POINT_CLOUD_URL = isDev
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
  potreeRef.viewer.scene.view.getPivot().toArray()
  potreeRef.viewer.scene.cameraAnimations[0].setVisible(!potreeRef.viewer.scene.cameraAnimations[0].visible)
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
