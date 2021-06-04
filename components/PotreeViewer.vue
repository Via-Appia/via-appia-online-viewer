<template>
  <div>
    <div id="potree_container" ref="potree_container">
      <!--    Only show the toolbar when developing locally-->
      <div v-if="$nuxt.context.isDev" id="potree_sidebar_container" />
      <div class="btn absolute z-20 right-4 bottom-4" @click="toggleSidebar">
        Toggle Panel
      </div>
    </div>
    <camera-section :active-camera="camera" :position="position" :view="view" />
    <image-orientation-section
      :viewer="$viewer"
      :active-image="activeImage"
      :offset="offset"
    />
    <target-section :target="target" :view="view" />
  </div>
</template>

<script>
/* eslint no-implicit-globals: "error" */
/* eslint-disable */
import Vue from "vue";

import { VAOrientedImage, VAOrientedImageLoader } from './overrides/VAOrientedImages'
import { VAOrientedImageControls } from './overrides/VAOrientedImageControls';

// import { pathOverview } from './path'
const { Potree, THREE } = window;
export default {
  name: "PotreeViewer",
  props: {
    graphics: {
      type: String,
      required: false,
      default: "medium",
      validator(value) {
        return ["low", "medium", "high"].includes(value);
      }
    },
    numPoints: {
      type: Number,
      required: false,
      default: 6000000,
      validator(value) {
        return value > 0 && value < 50000000;
      }
    },
    pointClouds: {
      type: Array,
      required: false,
      default: () => []
    }
  },
  data() {
    return {
      position: {
        x: 0,
        y: 0,
        z: 0
      },
      target: {
        x: 0,
        y: 0,
        z: 0
      },
      camera: null,
      view: null,
      viewerScene: null,
      offset: 0,
      activeImage: null
    };
  },

  mounted() {
    var that = this;

    Vue.prototype.$viewer = new Potree.Viewer(this.$refs.potree_container);

    const { scene } = this.$viewer;
    this.camera = scene.getActiveCamera();
    this.view = scene.view;

    this.viewerScene = this.$viewer.scene;
    // Get active camera position
    const cameraPosition = this.viewerScene.getActiveCamera();

    console.log("🎹🎹🎹🎹🎹🎹", cameraPosition.updateProjectionMatrix);
    this.activeCamera = cameraPosition;

    // Set the position
    this.position = this.camera.position;

    // Set the Target
    this.target = this.view.getPivot();

    this.$viewer.setFOV(60);
    this.$viewer.setBackground("skybox");

    this.$viewer.setEDLEnabled(false);
    this.$viewer.setPointBudget(1_000_000);
    this.$viewer.loadSettingsFromURL();
    // hide menu button in the sidebar
    $("#potree_quick_buttons").hide();


    Potree.loadPointCloud(
      "../pointclouds/DRIVE_1_V3_levels_8/cloud.js",
      "Drive Map",
      e => {
        const scene = this.$viewer.scene;
        const pointcloud = e.pointcloud;

        const material = pointcloud.material;
        material.size = 1;
        material.pointSizeType = Potree.PointSizeType.ADAPTIVE;
        material.shape = Potree.PointShape.SQUARE;

        scene.addPointCloud(pointcloud);

        // scene.view.position.set(
        //   296222.037838164,
        //   4633731.544238769,
        //   134.34521355290298
        // );
        // scene.view.lookAt(
        //   296222.037838164,
        //   4633731.544238769,
        //   134.34521355290298
        // );
        this.$viewer.fitToScreen();

        const cameraParamsPath = "http://localhost:3000/images/images.xml";
        const imageParamsPath = "http://localhost:3000/images/pyramid.txt";

        VAOrientedImageLoader.load(
          cameraParamsPath,
          imageParamsPath,
          this.$viewer
        ).then(([images, controls]) => {
          this.$viewer.scene.addOrientedImages(images);

          const material = that.createMaterial();
          material.transparent = true;
          images.images[0].mesh.material = material;

          const that = this
        });
      }
    );

    this.$viewer.loadGUI(() => {
      this.$viewer.setLanguage("en");
      $("#menu_tools")
        .next()
        .show();
      $("#menu_clipping")
        .next()
        .show();

      // Add custom section for Target
      let targetSection = $(`
				<h3 id="menu_target" class="accordion-header ui-widget"><span>Target</span></h3>
				<div class="accordion-content ui-widget pv-menu-list"></div>
			`);
      // get the vue component for target section
      const targetSectionHTML = document.getElementById("targetSection");
      const targetSectionContent = targetSection.last();
      targetSectionContent.html(targetSectionHTML);
      targetSection.first().click(() => targetSectionContent.slideToggle());
      targetSection.insertBefore($("#menu_tools"));

      // Add custom section for Camera
      let cameraSection = $(`
				<h3 id="menu_camera" class="accordion-header ui-widget"><span>Camera Position</span></h3>
				<div class="accordion-content ui-widget pv-menu-list"></div>
			`);
      // get vue component for Camera Section
      const cameraSectionHTML = document.getElementById("cameraSection");
      const cameraSectionContent = cameraSection.last();
      cameraSectionContent.html(cameraSectionHTML);
      cameraSection.first().click(() => cameraSectionContent.slideToggle());
      cameraSection.insertBefore($("#menu_target"));

      // Add custom section for Camera
      let imageOrientationSection = $(`
				<h3 id="menu_camera" class="accordion-header ui-widget"><span>Image Orientation</span></h3>
				<div class="accordion-content ui-widget pv-menu-list"></div>
			`);
      // get vue component for Image Orientation
      const imageOrientationSectionHTML = document.getElementById("imageOrientationSection");
      const imageOrientationSectioncontent = imageOrientationSection.last();
      imageOrientationSectioncontent.html(imageOrientationSectionHTML);
      imageOrientationSection.first().click(() => imageOrientationSectioncontent.slideToggle());
      imageOrientationSection.insertBefore($("#menu_tools"));

      this.$viewer.toggleSidebar();
    });
    this.$viewer.addEventListener("move_speed_changed", () => {
      // Set the position
      this.position = this.camera.position;
    });
  },
  methods: {
    toggleSidebar() {
      $("#potree_sidebar_container").toggle();
    },

    createMaterial() {
      let vertexShader = `
        uniform float uNear;
        varying vec2 vUV;
        varying vec4 vDebug;
        
        void main(){
          vDebug = vec4(0.0, 1.0, 0.0, 1.0);
          vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
          // make sure that this mesh is at least in front of the near plane
          modelViewPosition.xyz += normalize(modelViewPosition.xyz) * uNear;
          gl_Position = projectionMatrix * modelViewPosition;
          vUV = uv;
        }`;

      let fragmentShader = `
        uniform sampler2D tColor;
        uniform float uOpacity;
        varying vec2 vUV;
        varying vec4 vDebug;
        void main(){
          vec4 color = texture2D(tColor, vUV);          
          gl_FragColor = color;
          gl_FragColor.a = uOpacity;
        }`;

      const material = new THREE.ShaderMaterial({
        uniforms: {
          // time: { value: 1.0 },
          // resolution: { value: new THREE.Vector2() }
          tColor: { value: new THREE.Texture() },
          uNear: { value: 0.0 },
          uOpacity: { value: 0.5 }
        },
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        side: THREE.DoubleSide
      });

      material.side = THREE.DoubleSide;

      return material;
    },

    createAnnotations() {
      this.$viewer.scene.annotations.children = [];
      this.$viewer.scene.addAnnotation([236790, 548513, 69], {
        // title: this.$t('commanderHouse')
        title: "commanderHouse"
      });
      this.$viewer.scene.addAnnotation([237079, 548442, 69], {
        title: "campTerrain"
      });
    }
  }
};
</script>

<style>
#potree_menu img {
  display: inline-block;
}
#potree_container {
  z-index: 0;
  position: absolute;
  width: 100vw;
  height: 100vh;
}

#potree_sidebar_container {
  position: absolute;
  z-index: 1000;
  left: 0px;
  top: 0px;
  background: black;
  color: white;
  /*padding: 0.3em 0.8em;*/
  font-family: "system-ui";
  border-radius: 0em 0em 0.3em 0.3em;
  /*display: flex;*/
}

.potree_toolbar_label {
  text-align: center;
  font-size: smaller;
  opacity: 0.9;
}

.potree_toolbar_separator {
  background: white;
  padding: 0px;
  margin: 5px 10px;
  width: 1px;
}
.pv-menu-list > li > input {
  margin-bottom: 5px;
  padding: 5px;
  color: black;
}
input[type="number"]::-webkit-inner-spin-button {
  opacity: 1;
}
</style>
