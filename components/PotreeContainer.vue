<template>
  <div>
    <div id="potree_container" ref="potree_container" class="z-0 absolute w-screen h-screen">
      <div id="potree_sidebar_container" />
      <!--  Only show the toolbar when developing locally-->
      <!--  <div v-if="$nuxt.context.isDev" id="potree_sidebar_container" /> -->
      <div class="flex absolute right-4 bottom-4 z-20">
        <div class="btn " @click="toggleSidebar">
          Toggle Panel
        </div>
        <div class="btn" @click="moveCamera">
          move camera
        </div>
        <div class="btn" @click="toggleAnimationVisibility">
          Toogle Animation Paths
        </div>
      </div>
    </div>
    <camera-section v-if="camera" :active-camera="camera" :position="position" :view="view" />
  </div>
</template>

<script>
// import Vue from 'vue'
import { onMounted, ref } from '@nuxtjs/composition-api'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { VAOrientedImageLoader } from './overrides/VAOrientedImages'
import { VAFirstPersonControls } from './overrides/VAFirstPersonControls'
import { potreeRef } from '~/scene/VAPotree'

// Access the potreeView instance from everywhere using composition API
// export const potreeRef = reactive({})
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
    // console.log('setup', props)
    // const potree = ref(null)
    onMounted(() => {
      // check if the sidebar is visible
      isSidebarOpen.value = $('#potree_sidebar_container').is(':visible')

      // Logs: `Headline`

      // console.log('🎹', containerRef)
    })

    /* Tween function used with camera movement - arrow buttons
*****************************************************/
    // function tweenFunction (direction, currentAmountObject, newAmountObject) {
    //   // Setup the animation loop.
    //   function animate (time) {
    //     requestAnimationFrame(animate)
    //     TWEEN.update(time)
    //   }
    //   requestAnimationFrame(animate)
    //
    //   // declare and initalize tween
    //   const tween = new TWEEN.Tween(currentAmountObject)
    //     .to(newAmountObject, 1000)
    //     .easing(TWEEN.Easing.Quintic.Out)
    //     .onUpdate(function () {
    //       if (direction === 'up' || direction === 'down') {
    //         potreeRef.viewer.scene.view.pitch = currentAmountObject.amount
    //       } else if (direction === 'left' || direction === 'right') {
    //         potreeRef.viewer.scene.view.yaw = currentAmountObject.amount
    //       }
    //     })
    //     .start() // Start the tween immediately.
    // }

    /* Rotate Camera Up
    *****************************************************/
    // function rotateUp () {
    //   // movement direction
    //   const direction = 'up'
    //
    //   // NOTE: we need values as a property in an object for tween to work
    //   const currentPitchObject = {
    //     amount: potreeRef.viewer.scene.view.pitch
    //   }
    //   const newPitchObject = {
    //     amount: potreeRef.viewer.scene.view.pitch + 0.25
    //   }
    //
    //   // call tween function
    //   tweenFunction(direction, currentPitchObject, newPitchObject)
    // }

    // Methods
    function moveCamera ({ x = 296264.07, y = 4633679, z = 129 }) {
      console.log('🎹', x, y, z, potreeRef.viewer.scene)
      console.log('🎹', potreeRef.viewer.scene.view.getPivot().toArray())

      // fly to: the animation
      potreeRef.viewer.scene.cameraAnimations[0].play()
    }
    function toggleAnimationVisibility () {
      potreeRef.viewer.scene.view.getPivot().toArray()
      // TODO this only does it for the first element in the array
      potreeRef.viewer.scene.cameraAnimations[0].setVisible(!potreeRef.viewer.scene.cameraAnimations[0].visible)
      console.log('🎹', potreeRef.viewer.scene.cameraAnimations[0])

      // fly to:
    }

    // animation paths
    function addAnimationPath () {
      const animation = new Potree.CameraAnimation(potreeRef.viewer)

      const positions = [
        [296267.12792342174, 4633681.40622494, 128.3653329922611],
        [296271.14629413467, 4633685.636950317, 129.3653329922611],
        [296286.3704886272, 4633683.871486212, 132.01175511086956]
      ]

      const targets = [
        [296250.7719238924, 4633714.095726619, 126.43484628061825],
        [296235.8339610568, 4633681.722820112, 125.17872130141684],
        [296235.8339610568, 4633681.732820112, 125.17872130141684]
      ]

      for (let i = 0; i < positions.length; i++) {
        const cp = animation.createControlPoint()

        cp.position.set(...positions[i])
        cp.target.set(...targets[i])
      }

      potreeRef.viewer.scene.addCameraAnimation(animation)
      // animation.play()
    }

    return {
      // It is important to return the ref,
      // otherwise it won't work.
      // potreeRef,
      toggleAnimationVisibility,
      addAnimationPath,
      isSidebarOpen,
      moveCamera
    }
  },

  data () {
    return {
      position: { x: 0, y: 0, z: 0 },
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
    // we need to pass to the global value the viewer, otherwise, the animation won't be able to load
    window.viewer = potreeRef.viewer
    // const viewer = new Potree.Viewer(this.$refs.potree_container)      //// THIS WORKS

    const viewer = potreeRef.viewer
    // CLEAN UP THE MESS WITH THE VARIABLES!
    const scene = viewer.scene

    scene.annotations.add(
      new Potree.Annotation({
        position: [296264.396, 4633679.776, 129.778],
        title: 'About Annotations',

        cameraPosition: [296264.39688606694, 4633679.776566018, 129.77835768357866],
        cameraTarget: [296254.64710414334, 4633692.914354076, 127.63586441697944],
        description: `
<ul>
  <li>Click on the annotation label to move a predefined view.</li>
  <li>Click on the icon to execute the specified action.
  </li>In this case, the action will bring you to another scene and point cloud.</ul>
`
      }))

    this.addAnimationPath(viewer)

    // LIGHTS
    {
      const directional = new THREE.DirectionalLight(0xFFFFFF, 1.0)
      directional.position.set(10, 10, 10)
      directional.lookAt(0, 0, 0)

      const ambient = new THREE.AmbientLight(0x555555)

      viewer.scene.scene.add(directional)
      viewer.scene.scene.add(ambient)
    }

    // Load Textured bunny from obj
    {
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
      loader.load('/models/stanford_bunny_reduced.obj', function (object) {
        object.traverse(function (child) {
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
    }

    // Get active camera position
    this.camera = scene.getActiveCamera()
    this.view = scene.view

    // Set the position
    this.position = this.camera.position

    viewer.setFOV(60)
    viewer.setBackground('skybox')
    viewer.setEDLEnabled(false)
    viewer.setPointBudget(3_000_000)
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

        // Control camera with the keyboard
        viewer.fpControls = new VAFirstPersonControls(viewer)
        viewer.fpControls.addEventListener('start', viewer.disableAnnotations.bind(viewer))
        viewer.fpControls.addEventListener('end', viewer.enableAnnotations.bind(viewer))
        viewer.setControls(viewer.fpControls)
        viewer.setMoveSpeed(5.5)

        const cameraParamsPath = '/images/images.xml'
        const imageParamsPath = '/images/pyramid.txt'

        VAOrientedImageLoader.load(
          cameraParamsPath,
          imageParamsPath,
          viewer
        ).then(([images, controls]) => {
          viewer.scene.addOrientedImages(images)

          // const material = this.createMaterial()
          // material.transparent = true
          // images.images[0].mesh.material = material
        })
      }
    )

    viewer.loadGUI(() => {
      viewer.setLanguage('en')
      $('#menu_tools').next().show()
      $('#menu_clipping').next().show()
      $('#menu_scene').next().show()

      // Add custom section for Camera
      const cameraSection = $(`
        <h3 id="menu_camera" class="accordion-header ui-widget"><span>Camera</span></h3>
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
