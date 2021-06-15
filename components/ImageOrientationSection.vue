<template>
  <div id="imageOrientationSection" class="pv-menu-list">
    <li>x:<input id="pointx" type="text" :value="position.x"></li>
    <li>y:<input id="pointy" type="text" :value="position.y"></li>
    <li>z:<input id="pointz" type="text" :value="position.z"></li>

    <li>offset:<input id="offset" type="text" :value="offset"></li>
  </div>
</template>

<script>
import { VAOrientedImage } from './overrides/VAOrientedImages'

/*eslint-disable */
export default {
  name: "ImageOrientationSection",
  props: { 
    position: { type: Object, required: true, default: () => {}}, 
    // rotation: { type: Object, required: true, default: () => {}}, 
    offset: { type: Number, default: () => 0}, 
    // opacity: { type: Object, required: true, default: () => {}}, 
  },

  // computed:{
  //   position:{
  //     get(){ return this.positon },
  //     set(){ this.$emit('on-position-changed', position) }
  //   }
  // },
  data() {
    return {
      activeImage: new VAOrientedImage(),
    }
  },
 
  mounted() {
    // Add event listener
    $('#offset').on("change", this.onValueChange);
    $(':input[type="text"]').on("change", this.onValueChange);
        
    this.$viewer.addEventListener('image clicked', (image) => {
      // this.activeImage = image
      this.$emit('on-image-clicked', image)
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
