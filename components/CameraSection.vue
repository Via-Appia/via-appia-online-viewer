<template>
  <div id="cameraSection">
    <div class="fixed top-[50px] left-[300px] z-10">
      <pre class="bg-black bg-opacity-50">
        {{ activeCamera.rotation }}

        {{ $viewer.scene.view }}
      </pre>
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
    <div class="font-bold mt-4">
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
          :value="$viewer.scene.view.yaw"
          class="input input-xs"
          type="number"
          step=".01"
          @input="setCameraRotation({yaw:$event.target.value})"
        >
      </div>
      <div class="mb-2">
        Pitch (up-down): <input
          :value="$viewer.scene.view._pitch"
          class="input input-xs"
          type="number"
          step=".01"
          :min="$viewer.scene.view.minPitch"
          :max="$viewer.scene.view.maxPitch"
          @input="setCameraRotation({pitch:$event.target.value})"
        >
      </div>
    </div>

    <div class="font-bold mt-4">
      FOV (Field of View): {{ activeCamera.fov }}
    </div>
    <input
      type="range"
      min="20"
      max="100"
      :value="activeCamera.fov"
      @input="$viewer.setFOV($event.target.value)"
    >
    <div v-if="activeImage">
      <div class="text-xl">
        Active Image
      </div>
      <div>
        <input type="checkbox" class="form-checkbox" @change="setImageFollowsCamera($event.target.checked)">
        Follow camera
      </div>
      <div>
        opacity: <input
          :value="activeImage.mesh.material.uniforms.uOpacity.value"
          class="input input-xs"
          step="0.1"
          type="range"
          min="0.0"
          max="1.0"
          @input="setActiveImageOpacity($event.target.value)"
        >
      </div>
      <div>
        Offset: <input
          :value="offset"
          class="input input-xs"
          type="number"
          step="0.02"
          @input="setActiveImageOffset($event.target.value)"
        >
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'CameraSection',
  data () {
    return {
      offset: -0.9,
      activeImage: null,
      activeCamera: this.$viewer.scene.getActiveCamera(),
      target: this.$viewer.scene.view.getPivot(),
      fov: 60,
      imageFollowsCamera: false
    }
  },
  mounted () {
    this.$viewer.addEventListener('image clicked', (payload) => {
      this.activeImage = payload.image
    })
  },

  methods: {
    copyCameraPosition () {
      event.cdivpboardData.setData('Text', 'hello??')
      // this.activeCamera.position.x,this.activeCamera.position.y,this.activeCamera.position.z
    },
    setCameraPosition (newPosition) {
      this.$viewer.scene.view.position.set(
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
        this.$viewer.scene.view.yaw = parseFloat(newRotation.yaw)
      }
      if (newRotation.pitch) {
        this.$viewer.scene.view.pitch = parseFloat(newRotation.pitch)
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
        this.$viewer.fpControls.registerForUpdate(this)
      } else {
        this.$viewer.fpControls.deRegisterForUpdate(this)
      }
    },
    update () {
      this.activeImage.setPosition(this.activeCamera, this.offset)
    }

  }
}
</script>
