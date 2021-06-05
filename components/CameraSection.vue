<template>
  <div id="cameraSection" class="pv-menu-list">
    <li>x:<input id="pointx" type="text" :value="position.x"></li>
    <li>y:<input id="pointy" type="text" :value="position.y"></li>
    <li>z:<input id="pointz" type="text" :value="position.z"></li>
    <!-- <li>
      x:<input
        type="number"
        id="pointx"
        step="1"
        :value="parseFloat(position.x)"
      />
    </li> -->

    <div>
      FOV: {{ fov }}
      <div id="fov" class="ui-slider" />
    </div>

    <div>
      Aspect Ratio: {{ aspectRatio }}
      <div id="aspectRatio" class="ui-slider" />
    </div>
  </div>
</template>
<script>
/*eslint-disable */
export default {
  name: "CameraSection",
  props: {
    activeCamera: { default: () => {}},
    position: { type: Object, required: true, default: () => {}},
    view: { type: Object, required: true, default: () => {}},
  },
  data() {
    return {
      fov: 60,
      aspectRatio: 3/4,
    }
  },
  mounted() {
    // Add event listener
    $(':input[type="text"]').on("change", this.onValueChange);
    // $(':input[type="number"]').on("change", this.onValueChange);


    // Field Of View Slider
    $( "#fov" ).slider(
      {
        min: 20,
        max: 100,
        value: this.fov,
        slide:(event, ui) =>{
          this.fov = ui.value
          this.$viewer.setFOV(ui.value)
        }
      }
    )
    // Field Of View Slider
    $( "#aspectRatio" ).slider(
      {
        min: 0,
        max: 1,
        value: this.aspectRatio,
        slide:(event, ui) =>{ this.aspectRatio = ui.value }
      }
    )
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
