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
      <button class="btn btn-sm btn-outline text-xs" @click="copyCameraPosition">
        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>
        Copy Camera pos.
      </button>

      Target
      <button class="btn btn-sm text-xs" @click="copyCameraPosition">
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

      <div>
        Offset:
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'CameraSection',
  data () {
    return {
      activeCamera: this.$viewer.scene.getActiveCamera(),
      target: this.$viewer.scene.view.getPivot(),
      fov: 60
    }
  },

  methods: {
    copyCameraPosition () {
      debugger
      event.clipboardData.setData('Text', 'hello??')
      // this.activeCamera.position.x,this.activeCamera.position.y,this.activeCamera.position.z
    },
    setCameraPosition (position, value) {
      this.$viewer.scene.view.position.set(
        parseFloat(position.x || this.activeCamera.position.x),
        parseFloat(position.y || this.activeCamera.position.y),
        parseFloat(position.z || this.activeCamera.position.z)
      )
    }
  }
}
</script>
