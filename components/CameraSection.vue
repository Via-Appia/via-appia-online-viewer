<template>
  <div v-if="potreeRef.viewer" id="cameraSection">
    <div v-if="seeDetailsPanel" class="fixed top-[50px] left-[300px] z-10">
      <pre class="bg-black bg-opacity-50">
            {{ activeCamera }}

            {{ potreeRef.viewer.scene.view }}
          </pre>
    </div>
    <div class="btn btn-xs mb-2" @click="seeDetailsPanel = !seeDetailsPanel">
      See stats Panel
    </div>
    <button
      class="text-xs font-capitalize btn btn-xs btn-outline text-gray-400"
      @cdivck="copyCameraPosition"
    >
      <svg
        class="w-3 h- mr-1"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          stroke-divnecap="round"
          stroke-divnejoin="round"
          stroke-width="2"
          d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
        />
      </svg>
      Copy coordinates
    </button>
    <!-- Camera position-->
    <div v-if="activeCamera" class="font-bold mt-4">
      Camera Position
      <div class="mb-2">
        x: <input
          :value="activeCamera.position.x"
          class="input input-xs"
          type="number"
          step=".01"
          @input="setCameraPosition({x:$event.target.value})"
        >
      </div>
      <div class="mb-2">
        y: <input
          :value="activeCamera.position.y"
          class="input input-xs"
          type="number"
          step=".01"
          @input="setCameraPosition({y:$event.target.value})"
        >
      </div>
      <div class="mb-2">
        z: <input
          :value="activeCamera.position.z"
          class="input input-xs"
          type="number"
          step=".01"
          @input="setCameraPosition({z:$event.target.value})"
        >
      </div>
    </div>

    <!-- Camera Rotation-->
    <div class="font-bold mt-4">
      Camera Rotation (Radians)
      <div class="mb-2">
        Yaw (left-right): <input
          :value="potreeRef.viewer.scene.view.yaw"
          class="input input-xs"
          type="number"
          step=".01"
          @input="setCameraRotation({yaw:$event.target.value})"
        >
      </div>
      <div class="mb-2">
        Pitch (up-down): <input
          :value="potreeRef.viewer.scene.view._pitch"
          class="input input-xs"
          type="number"
          step=".01"
          :min="potreeRef.viewer.scene.view.minPitch"
          :max="potreeRef.viewer.scene.view.maxPitch"
          @input="setCameraRotation({pitch:$event.target.value})"
        >
      </div>
    </div>

    <div class="font-bold mt-4">
      FOV (Field of View): {{ potreeRef.viewer.scene.getActiveCamera().fov }}
    </div>
    <input
      type="range"
      min="20"
      max="100"
      :value="potreeRef.viewer.scene.getActiveCamera()"
      @input="potreeRef.viewer.setFOV($event.target.value)"
    >
    <div v-if="activeImage">
      <div class="mt-4 font-medium">
        Active Image
      </div>
      <div>
        <div class="p-3 card bordered">
          <div class="form-control">
            <label class="cursor-pointer flex justify-between">
              <span class="label-text">Follow the camera</span>
              <div>
                <input type="checkbox" class="toggle toggle-primary" @change="setImageFollowsCamera($event.target.checked)">
                <span class="toggle-mark" />
              </div>
            </label>
            <div class="flex items-center mt-2">
              <div class="label-text flex-grow w-full">
                Opacity <br>{{ activeImage.mesh.material.uniforms.uOpacity.value }}
              </div>
              <input
                :value="activeImage.mesh.material.uniforms.uOpacity.value"
                class="input input-xs ml-2"
                step="0.01"
                type="range"
                min="0"
                max="1"
                @input="setActiveImageOpacity($event.target.value)"
              >
            </div>
            <div class="mt-3">
              <label class="label-text"> Offset </label>
              <input
                :value="offset"
                class="input input-xs"
                type="number"
                step="0.02"
                @input="setActiveImageOffset($event.target.value)"
              >
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { onMounted } from '@nuxtjs/composition-api'
import { potreeRef } from '~/components/PotreeViewer'

export default {
  setup () {
    onMounted(() => {
      potreeRef.viewer.addEventListener('image clicked', (payload) => {
        this.activeImage = payload.image
      })
    })

    return { potreeRef }
  },

  data () {
    return {
      seeDetailsPanel: false,
      offset: -0.9,
      activeImage: null,
      activeCamera: null,
      target: null,
      fov: 60,
      imageFollowsCamera: false
    }
  },
  mounted () {
    this.activeCamera = potreeRef.viewer.scene.getActiveCamera()
    this.target = potreeRef.viewer.scene.view.getPivot()

    potreeRef.viewer.addEventListener('image clicked', (payload) => {
      this.activeImage = payload.image
    })
  },

  methods: {
    copyCameraPosition () {
      // TODO be able to copy the camera coordenates directly to clipboard
      event.cdivpboardData.setData('Text', 'hello??')
      // this.activeCamera.position.x,this.activeCamera.position.y,this.activeCamera.position.z
    },
    setCameraPosition (newPosition) {
      potreeRef.viewer.scene.view.position.set(
        parseFloat(newPosition.x || this.activeCamera.position.x),
        parseFloat(newPosition.y || this.activeCamera.position.y),
        parseFloat(newPosition.z || this.activeCamera.position.z)
      )

      if (this.activeImage && this.imageFollowsCamera) {
        this.activeImage.setPosition(this.activeCamera, this.offset)
      }
    },
    setCameraRotation (newRotation) {
      if (newRotation.yaw) {
        potreeRef.viewer.scene.view.yaw = parseFloat(newRotation.yaw)
      }
      if (newRotation.pitch) {
        potreeRef.viewer.scene.view.pitch = parseFloat(newRotation.pitch)
      }

      if (this.activeImage && this.imageFollowsCamera) {
        this.activeImage.setPosition(this.activeCamera, this.offset)
      }
    },
    setActiveImageOpacity (value) {
      this.activeImage.mesh.material.uniforms.uOpacity.value = parseFloat(value)
    },
    setActiveImageOffset (offsetValue = this.offset) {
      this.offset = offsetValue
      this.activeImage.setPosition(this.activeCamera, offsetValue)
    },
    setImageFollowsCamera (value) {
      this.imageFollowsCamera = value
      if (this.imageFollowsCamera) {
        potreeRef.viewer.fpControls.registerForUpdate(this)
      } else {
        potreeRef.viewer.fpControls.deRegisterForUpdate(this)
      }
    },
    update () {
      this.activeImage.setPosition(this.activeCamera, this.offset)
    }

  }
}
</script>
