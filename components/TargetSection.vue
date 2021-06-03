<template>
  <div class="pv-menu-list" id="targetSection">
    <li>
      x:<input type="number" id="targetx" step="0.01" :value="target.x" />
    </li>
    <li>y:<input type="number" id="targety" step="1" :value="target.y" /></li>
    <li>z:<input type="number" id="targetz" step="1" :value="target.z" /></li>
  </div>
</template>
<script>
/*eslint-disable */
export default {
  name: "TargetSection",
  props: {
    target: {
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
  watch: {
    target: {
      handler: function (oldValue, newValue) {
        console.log("position in watch", this.target);
      },
      deep: true,
    },
  },
  mounted() {
    console.log("Target");
    // Add event listener
    $(':input[type="number"]').on("change", this.onValueChange);
  },
  methods: {
    onValueChange(e) {
      console.log(e.target.value);
    },
  },
};
</script>