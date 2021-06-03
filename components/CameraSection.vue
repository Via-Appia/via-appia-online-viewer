<template>
  <div class="pv-menu-list" id="cameraSection">
    <li>x:<input type="text" id="pointx" :value="position.x" /></li>
    <li>y:<input type="text" id="pointy" :value="position.y" /></li>
    <li>z:<input type="text" id="pointz" :value="position.z" /></li>
    <!-- <li>
      x:<input
        type="number"
        id="pointx"
        step="1"
        :value="parseFloat(position.x)"
      />
    </li> -->
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

  mounted() {
    // Add event listener
    $(':input[type="text"]').on("change", this.onValueChange);
    // $(':input[type="number"]').on("change", this.onValueChange);
  },
  methods: {
    onValueChange(e) {
      const val = parseFloat(e.target.value);
      switch (e.target.id) {
        case "pointx":
          this.view.position.set(val, this.position.y, this.position.z);
          break;
        case "pointy":
          this.view.position.set(this.position.x, val, this.position.z);
          break;
        case "pointz":
          this.view.position.set(this.position.x, this.position.y, val);
          break;
      }
    },
  },
};
</script>