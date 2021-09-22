<template>
  <div>
    <div id="potree_container" ref="potree_container" class="z-0 absolute w-screen h-screen">
      <div id="potree_sidebar_container" />
      <!--  Only show the toolbar when developing locally-->
      <!--  <div v-if="$nuxt.context.isDev" id="potree_sidebar_container" /> -->
      <div class="absolute z-20 btn right-4 bottom-4" @click="toggleSidebar">
        Toggle Panel
      </div>
    </div>
    <camera-section v-if="camera" :active-camera="camera" :position="position" :view="view" />
  </div>
</template>

<script>
// import Vue from 'vue'
import { onMounted, ref, reactive } from '@nuxtjs/composition-api'

import { VAOrientedImageLoader } from './overrides/VAOrientedImages'
import { VAFirstPersonControls } from './overrides/VAFirstPersonControls'

// Access the potreeView instance from everywhere using composition API
export const potreeRef = reactive({})
export const isSidebarOpen = ref(false)

export default {
  name: 'PotreeViewer',
  props: {
    graphics: {
      type: String,
      required: false,
      default: 'medium',
      validator (value) {
        return ['low', 'medium', 'high'].includes(value)
      }
    },
    numPoints: {
      type: Number,
      required: false,
      default: 6000000,
      validator (value) {
        return value > 0 && value < 50000000
      }
    },
    pointClouds: {
      type: Array,
      required: false,
      default: () => []
    }
  },

  setup (props, context) {
    // const containerRef = ref(null)
    console.log('setup', props)
    // const potree = ref(null)
    onMounted(() => {
      // check if the sidebar is visible
      isSidebarOpen.value = $('#potree_sidebar_container').is(':visible')

      // Logs: `Headline`

      // console.log('🎹', containerRef)
    })

    return {
      // It is important to return the ref,
      // otherwise it won't work.
      // potreeRef
      isSidebarOpen
    }
  },

  data () {
    return {
      position: { x: 0, y: 0, z: 0 },
      target: { x: 0, y: 0, z: 0 },
      camera: null,
      view: null,
      offset: 0,
      activeImage: null
    }
  },
  mounted () {
    // hide toolbar if production mode
    if (!this.$nuxt.context.isDev) {
      this.toggleSidebar()
    }
    // const s = new Potree.Viewer(this.$refs.potree_container)
    // cosa.viewer = new Potree.Viewer(this.$refs.potree_container)

    // Vue.prototype.$viewer = new Potree.Viewer(this.$refs.potree_container)

    potreeRef.viewer = new Potree.Viewer(this.$refs.potree_container) // this not, adn I think it is because it is a recursive error object?
    // const viewer = new Potree.Viewer(this.$refs.potree_container)      //// THIS WORKS
    const viewer = potreeRef.viewer

    // CLEAN UP THE MESS WITH THE VARIABLES!
    const scene = viewer.scene
    // Get active camera position
    this.camera = scene.getActiveCamera()
    this.view = scene.view

    // Set the position
    this.position = this.camera.position

    // Set the Target
    this.target = this.view.getPivot()

    viewer.setFOV(60)
    viewer.setBackground('skybox')
    viewer.setEDLEnabled(false)
    viewer.setPointBudget(1_000_000)
    viewer.loadSettingsFromURL()

    // Pointcloud data source
    const POINT_CLOUD_URL = this.$nuxt.context.isDev
      // locally
      ? 'http://localhost:3000/pointclouds/DRIVE_1_V3_levels_8/cloud.js'
      // Cloud storage
      : 'https://storage.googleapis.com/via-appia-20540.appspot.com/cloud.js'

    // hide menu button in the sidebar
    $('#potree_quick_buttons').hide()

    Potree.loadPointCloud(
      POINT_CLOUD_URL,
      'Drive Map',
      ({ pointcloud }) => {
        pointcloud.material.size = 1
        pointcloud.material.pointSizeType = Potree.PointSizeType.ADAPTIVE
        pointcloud.material.shape = Potree.PointShape.SQUARE

        // Load pointcloud data
        viewer.scene.addPointCloud(pointcloud)

        // Set initial camera view position
        viewer.scene.view.position.set(
          296264.39688606694,
          4633679.776566018,
          129.77835768357866
        )
        viewer.scene.view.yaw = 0.3
        viewer.scene.view.pitch = 0

        viewer.fpControls = new VAFirstPersonControls(viewer)
        viewer.fpControls.addEventListener('start', viewer.disableAnnotations.bind(viewer))
        viewer.fpControls.addEventListener('end', viewer.enableAnnotations.bind(viewer))

        viewer.setControls(viewer.fpControls)
        viewer.setMoveSpeed(3.5)

        const cameraParamsPath = '/images/images.xml'
        const imageParamsPath = '/images/pyramid.txt'

        VAOrientedImageLoader.load(
          cameraParamsPath,
          imageParamsPath,
          viewer
        ).then(([images, controls]) => {
          viewer.scene.addOrientedImages(images)

          // const material = this.createMaterial();
          // material.transparent = true;
          // images.images[0].mesh.material = material;
        })
      }
    )

    viewer.loadGUI(() => {
      viewer.setLanguage('en')
      $('#menu_tools').next().show()
      $('#menu_clipping').next().show()

      // Add custom section for Camera
      const cameraSection = $(`
        <h3 id="menu_camera" class="accordion-header ui-widget"><span>Camera Position</span></h3>
        <div class="accordion-content ui-widget pv-menu-list"></div>
        `)
      // get vue component for Camera Section
      const cameraSectionHTML = document.getElementById('cameraSection')
      const cameraSectionContent = cameraSection.last()
      cameraSectionContent.html(cameraSectionHTML)
      cameraSection.first().click(() => cameraSectionContent.slideToggle())
      cameraSection.insertBefore($('#menu_tools'))

      viewer.toggleSidebar()
    })
    viewer.addEventListener('move_speed_changed', () => {
      // Set the position
      this.position = this.camera.position
    })
  },
  methods: {
    toggleSidebar () {
      $('#potree_sidebar_container').toggle()
      isSidebarOpen.value = $('#potree_sidebar_container').is(':visible')
    },

    // createMaterial() {
    //   let vertexShader = `
    //     uniform float uNear;
    //     varying vec2 vUV;
    //     varying vec4 vDebug;

    //     void main(){
    //       vDebug = vec4(0.0, 1.0, 0.0, 1.0);
    //       vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
    //       // make sure that this mesh is at least in front of the near plane
    //       modelViewPosition.xyz += normalize(modelViewPosition.xyz) * uNear;
    //       gl_Position = projectionMatrix * modelViewPosition;
    //       vUV = uv;
    //     }`;

    //   let fragmentShader = `
    //     uniform sampler2D tColor;
    //     uniform float uOpacity;
    //     varying vec2 vUV;
    //     varying vec4 vDebug;
    //     void main(){
    //       vec4 color = texture2D(tColor, vUV);
    //       gl_FragColor = color;
    //       gl_FragColor.a = uOpacity;
    //     }`;

    //   const material = new THREE.ShaderMaterial({
    //     uniforms: {
    //       // time: { value: 1.0 },
    //       // resolution: { value: new THREE.Vector2() }
    //       tColor: { value: new THREE.Texture() },
    //       uNear: { value: 0.0 },
    //       uOpacity: { value: 0.5 }
    //     },
    //     vertexShader: vertexShader,
    //     fragmentShader: fragmentShader,
    //     side: THREE.DoubleSide
    //   });

    //   material.side = THREE.DoubleSide;

    //   return material;
    // },

    createAnnotations () {
      this.$viewer.scene.annotations.children = []
      this.$viewer.scene.addAnnotation([236790, 548513, 69], {
        // title: this.$t('commanderHouse')
        title: 'commanderHouse'
      })
      this.$viewer.scene.addAnnotation([237079, 548442, 69], {
        title: 'campTerrain'
      })
    }
  }
}
</script>

<style>
#potree_menu img {
  display: inline-block;
}

#potree_sidebar_container {
  position: absolute;
  z-index: 1000;
  left: 0px;
  top: 0px;
  background: black;
  color: white;
  /*padding: 0.3em 0.8em;*/
  font-family: "system-ui";
  border-radius: 0em 0em 0.3em 0.3em;
  /*display: flex;*/
}

.potree_toolbar_label {
  text-align: center;
  font-size: smaller;
  opacity: 0.9;
}

.potree_toolbar_separator {
  background: white;
  padding: 0px;
  margin: 5px 10px;
  width: 1px;
}
.pv-menu-list > li > input {
  margin-bottom: 5px;
  padding: 5px;
  color: black;
}
input[type="number"]::-webkit-inner-spin-button {
  opacity: 1;
}
</style>
