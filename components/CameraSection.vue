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
    view: {
      type: Object,
      required: true,
      default: () => {},
    },
  },
  // watch: {
  //   position: {
  //     handler: function (oldValue, newValue) {
  //       console.log("position in watch", this.position);
  //     },
  //     deep: true,
  //   },
  // },
  mounted() {
    // Add event listener
    $(':input[type="number"]').on("change", this.onValueChange);
  },
  methods: {
    onValueChange(e) {
      console.log("val", e.target.value);
      switch (e.target.id) {
        case "pointx":
          this.view.position.set(
            e.target.value,
            this.position.y,
            this.position.z
          );
          break;
        case "pointy":
          this.view.position.set(
            this.position.x,
            e.target.value,
            this.position.z
          );
          break;
        case "pointz":
          this.view.position.set(
            this.position.x,
            this.position.y,
            e.target.value
          );
          break;
      }
    },
  },
};
</script>