<template>
  <div class="pv-menu-list" id="cameraSection">
    <li>
      x:<input type="number" id="pointx" step="0.01" :value="position.x" />
    </li>
    <li>y:<input type="number" id="pointy" step="1" :value="position.y" /></li>
    <li>z:<input type="number" id="pointz" step="1" :value="position.z" /></li>
  </div>
</template>
<script>
/*eslint-disable */
export default {
  name: "CameraSection",
  props: {
    position: {
      type: Object,
      required: true,
      default: () => {},
    },
    viewerScene: {
      type: Object,
      required: true,
      default: () => {},
    },
  },
  watch: {
    position: {
      handler: function (oldValue, newValue) {
        console.log(
          "position in watch",
          this.position,
          this.viewerScene.getActiveCamera()
        );
      },
      deep: true,
    },
  },
  mounted() {
    // Add event listener
    $(':input[type="number"]').on("change", () => console.log("change"));
    console.log("inputs", $(':input[type="number"]'));
  },
};
</script>