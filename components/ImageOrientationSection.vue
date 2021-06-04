<template>
  <div id="imageOrientationSection" class="pv-menu-list">
    <li>offset:<input id="offset" type="text" :value="offset"></li>
  </div>
</template>

<script>
import { VAOrientedImage } from './overrides/VAOrientedImages'
/*eslint-disable */
export default {
  name: "ImageOrientationSection",
  props: {
    viewer: { type: Object, required: true, default: () => {}},
    activeImage: { type: VAOrientedImage|null, required: true, default: () => {}},
    // position: { type: Object, required: true, default: () => {}},
    // rotation: { type: Object, required: true, default: () => {}},
    offset: { type: Number, required: true, default: () => {}},
    // opacity: { type: Object, required: true, default: () => {}},
  },
  data() {
    return {      
    }
  },
  mounted() {
    // Add event listener
    $('#offset').on("change", this.onValueChange);
    
    this.viewer.addEventListener('image clicked', function(image) {
      that.activeImage = image
      console.log('YES  MFUCKAH')
    })
  },
  methods: {
    onValueChange(e) {
      const val = parseFloat(e.target.value);
      
      console.log(this.activeImage);
      switch (e.target.id) {
        case "offset":
          this.activeImage.mesh.material.uNear = val;
          break;
      }
    },
  },
};
</script>
