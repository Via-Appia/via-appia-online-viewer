<template>
  <div v-if="potreeRef.viewer" id="cameraSection">
    <div v-if="seeDetailsPanel" class="fixed top-[50px] left-[300px] z-10">
      <pre class="bg-black bg-opacity-500 scrollable">
        {{ activeCamera }}
        Position Array:
        {{ potreeRef.viewer.scene.getActiveCamera().position.toArray() }}
        target array
        {{ potreeRef.viewer.scene.view.getPivot().toArray() }}
      </pre>
    </div>

    <!-- Camera position-->
    <div v-if="activeCamera" class="mt-4 font-bold">
      <!-- Copy camera position -->
      <button
        class="text-xs text-gray-400 font-capitalize btn btn-xs btn-outline"
        @click="copyCameraPosition(
          `cameraPosition:  [${potreeRef.viewer.scene.getActiveCamera().position.toArray().toString()}]
target:  [${potreeRef.viewer.scene.view.getPivot().toArray().toString()}]`
        )"
      >
        <svg
          class="w-3 mr-1 h-"
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
        Copy Position and Target
      </button>
      <button
        class="text-xs text-gray-400 font-capitalize btn btn-xs btn-outline"
        @click="copyCameraPosition(potreeRef.viewer.scene.getActiveCamera().position.toArray().toString())"
      >
        <svg
          class="w-3 mr-1 h-"
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
        Copy Camera Position
      </button>

      <div class="mt-2 mb-2">
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

      <div class="mt-4">
        <!-- Copy camera Target -->
        <button
          class="text-xs text-gray-400 font-capitalize btn btn-xs btn-outline"
          @click="copyCameraPosition(potreeRef.viewer.scene.view.getPivot().toArray().toString())"
        >
          <svg
            class="w-3 mr-1 h-"
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
          Copy Camera Target
        </button>
        <div class="mt-2 rounded bg-gray-800 p-1">
          {{ potreeRef.viewer.scene.view.getPivot().toArray().map(number=>Math.round(number*1000)/1000).toString() }}
        </div>
      </div>
    </div>

    <!-- Camera Rotation-->
    <div class="mt-4 font-bold">
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

    <div class="mt-4 font-bold">
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
            <label class="flex justify-between cursor-pointer">
              <span class="label-text">Follow the camera</span>
              <div>
                <input type="checkbox" class="toggle toggle-primary" @change="setImageFollowsCamera($event.target.checked)">
                <span class="toggle-mark" />
              </div>
            </label>
            <div class="flex items-center mt-2">
              <div class="flex-grow w-full label-text">
                Opacity <br>{{ activeImage.mesh.material.uniforms.uOpacity.value }}
              </div>
              <input
                :value="activeImage.mesh.material.uniforms.uOpacity.value"
                class="ml-2 input input-xs"
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
    <div class="mb-2 btn btn-xs" @click="seeDetailsPanel = !seeDetailsPanel">
      See stats Panel
    </div>
  </div>
</template>

<script>
import { onMounted } from '@nuxtjs/composition-api'
import { potreeRef } from '~/API/VAPotree'

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
    copyCameraPosition (text) {
      navigator.clipboard.writeText(text)
        .then(() => {
          potreeRef.viewer.postMessage(text, { duration: 3000 })
        })
        .catch((err) => {
          // This can happen if the user denies clipboard permissions:
          console.error('Could not copy text: ', err)
        })
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
