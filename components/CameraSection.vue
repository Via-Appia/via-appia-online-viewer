<template>
  <div>
    <div id="cameraSection" class="pv-menu-list">
      <div class="fixed top-[50px] left-[300px] z-10">
        <pre class="bg-black bg-opacity-70">{{ activeCamera }}
          camera position:
        {{ activeCamera.position }}
          <br>
        target position:
        {{ target }}
        </pre>
      </div>

      <!--      Camera Position -->
      <li>
        x: <input
          :value="activeCamera.position.x"
          class="input input-xs"
          type="number"
          step=".1"
          @input="setCameraPosition({x:$event.target.value})"
        >
      </li>
      <li>
        y: <input
          :value="activeCamera.position.y"
          class="input input-xs"
          type="number"
          step=".1"
          @input="setCameraPosition({y:$event.target.value})"
        >
      </li>
      <li>
        z: <input
          :value="activeCamera.position.z"
          class="input input-xs"
          type="number"
          step=".1"
          @input="setCameraPosition({z:$event.target.value})"
        >
      </li>

      <!--      Camera Rotation -->
      <li>
        x: <input
          :value="activeCamera.rotation.x"
          class="input input-xs"
          type="number"
          step=".1"
          @input="setCameraRotation({x:$event.target.value})"
        >
      </li>
      <li>
        y: <input
          :value="activeCamera.rotation.y"
          class="input input-xs"
          type="number"
          step=".1"
          @input="setCameraRotation({y:$event.target.value})"
        >
      </li>
      <li>
        z: <input
          :value="activeCamera.rotation.z"
          class="input input-xs"
          type="number"
          step=".1"
          @input="setCameraRotation({z:$event.target.value})"
        >
      </li>

      <button class="text-xs btn btn-sm btn-outline" @click="copyCameraPosition">
        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>
        Copy Camera pos.
      </button>

      Target
      <button class="text-xs btn btn-sm" @click="copyCameraPosition">
        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>
        Copy Target pos.
      </button>
      <li>
        x: <input
          :value="activeCamera.position.x"
          class="input input-xs"
          type="number"
          step=".1"
          @input="setCameraPosition({x:$event.target.value})"
        >
      </li>
      <li>
        y: <input
          :value="activeCamera.position.y"
          class="input input-xs"
          type="number"
          step=".1"
          @input="setCameraPosition({y:$event.target.value})"
        >
      </li>
      <li>
        z: <input
          :value="activeCamera.position.z"
          class="input input-xs"
          type="number"
          step=".1"
          @input="setCameraPosition({z:$event.target.value})"
        >
      </li>

      <div>
        FOV: {{ activeCamera.fov }}
        <input type="range" min="20" max="100" :value="activeCamera.fov" @input="$viewer.setFOV($event.target.value)">
      </div>

      <div />
      <div v-if="activeImage">
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
      fov: 60
    }
  },
  mounted () {
    this.$viewer.addEventListener('image clicked', (payload) => {
      this.activeImage = payload.image
      console.log('🎹image clicked', payload.image)
    })
  },

  methods: {
    copyCameraPosition () {
      event.clipboardData.setData('Text', 'hello??')
      // this.activeCamera.position.x,this.activeCamera.position.y,this.activeCamera.position.z
    },
    setCameraPosition (newPosition) {
      this.$viewer.scene.view.position.set(
        parseFloat(newPosition.x || this.activeCamera.position.x),
        parseFloat(newPosition.y || this.activeCamera.position.y),
        parseFloat(newPosition.z || this.activeCamera.position.z)
      )
    },
    setCameraRotation (newRotation) {
      // const position = new THREE.Vector3()
      // const quaternion = new THREE.Quaternion()
      // const scale = new THREE.Vector3()

      // this.activeImage.mesh.matrixWorld.decompose(position, quaternion, scale)

      // this.$viewer.camera.quaternion.copy(quaternion)

      // mesh.updateMatrixWorld(true)

      this.$viewer.scene.view.rotation.set(
        parseFloat(newRotation.x || this.activeCamera.rotation.x),
        parseFloat(newRotation.y || this.activeCamera.rotation.y),
        parseFloat(newRotation.z || this.activeCamera.rotation.z)
      )
    },
    setActiveImageOpacity (value) {
      this.activeImage.mesh.material.uniforms.uOpacity.value = parseFloat(value)
    },
    setActiveImageOffset (offsetValue) {
      this.offset = offsetValue
      // this.activeImage.mesh.material.uniforms.uNear.value = parseFloat(value)
      const rotation = [90, 0, 0]
      this.activeImage.setPosition(Object.values(this.activeCamera.position), rotation, offsetValue)
    }
  }
}
</script>
