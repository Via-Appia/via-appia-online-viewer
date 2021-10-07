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
        <div class="btn" @click="toggleAnimationVisibility">
          Toggle Animation Paths
        </div>
      </div>
    </div>
    <camera-section v-if="camera" />
  </div>
</template>

<script>
// import Vue from 'vue'
import { ref } from '@nuxtjs/composition-api'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { VAOrientedImageLoader } from './overrides/VAOrientedImages'
import {
  potreeRef, toggleAnimationVisibility,
  setInitialSceneParameters, loadInitialPointCloud, addAnimationPath
} from '~/api/VAPotree'

// Access the potreeView instance from everywhere using composition API
// export const potreeRef = reactive({})
export const isSidebarOpen = ref(false)

export default {
  name: 'PotreeViewer',
  setup (props, context) {
    return {
      toggleAnimationVisibility,
      isSidebarOpen
    }
  },

  data () {
    return {
      labels: [],
      camera: null
    }
  },
  async fetch () {
    this.labels = await this.$content('labels-map').fetch()
  },

  /**
   * When entring a new page, add the animations in place
   */
  watch: {
    $route (to, from) {
      this.getAnimationPaths(to.params)
    }
  },
  mounted () {
    // check if the sidebar is visible
    isSidebarOpen.value = $('#potree_sidebar_container').is(':visible')

    // hide toolbar if production mode
    if (!this.$nuxt.context.isDev) {
      this.toggleSidebar()
    }

    // Load potree viewer inside the DOM
    potreeRef.viewer = new Potree.Viewer(this.$refs.potree_container)
    setInitialSceneParameters()
    loadInitialPointCloud(this.$nuxt.context.isDev)

    const viewer = potreeRef.viewer
    const scene = viewer.scene
    this.camera = scene.getActiveCamera()

    // Example Add image to the scene
    {
      const cameraParamsPath = '/images/images.xml'
      const imageParamsPath = '/images/pyramid.txt'
      VAOrientedImageLoader.load(cameraParamsPath, imageParamsPath, viewer)
        .then(([images, controls]) => {
          viewer.scene.addOrientedImages(images)
          const material = this.createMaterial()
          material.transparent = false
          images.images[0].mesh.material = material
        })
    }

    // Example annotation
    {
      const annotationName = new Potree.Annotation({
        position: [296249.19705492083, 4633726.448203472, 128.7690558114301],
        title: 'Piramide',
        cameraPosition: [296260.6092322839, 4633696.311992192, 130.7733116269969],
        cameraTarget: [296255.42565172265, 4633711.747814068, 133.44087523067427],
        description: 'Click on the annotation label to move a predefined view. <br>Click on the icon to execute the specified action.<br>In this case, the action will bring you to another scene and point cloud.'
      })
      scene.annotations.add(annotationName)
    }

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
  },

  methods: {
    async getAnimationPaths ({ story = '', page = '' }) {
      console.log('scene', potreeRef.viewer.scene)

      const animation = await this.$content(story, page)
        .only(['cameraTarget', 'cameraPosition', 'animationSpeed'])
        .fetch()
        .catch((err) => { console.error({ statusCode: 404, message: 'Page not found', error: err }) })
      console.log('🎹animation ', story, page, animation)

      const positions = [
        potreeRef.viewer.scene.getActiveCamera().position.toArray(), // current camera position
        animation.cameraPosition
      ]
      const targets = [
        potreeRef.viewer.scene.view.getPivot().toArray(), // current target position
        animation.cameraTarget
      ]

      // Remove previous animations
      // TODO this doesn't remove the animation from the previous path
      potreeRef.viewer.scene.cameraAnimations.length = 0
      addAnimationPath(positions, targets, animation.animationSpeed)

      potreeRef.viewer.scene.cameraAnimations[0].play()
    },

    toggleSidebar () {
      $('#potree_sidebar_container').toggle()
      isSidebarOpen.value = $('#potree_sidebar_container').is(':visible')
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
