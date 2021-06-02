<template>
  <div>
    <div id="potree_container" ref="potree_container">
      <!--    Only show the toolbar when developing locally-->
      <div v-if="$nuxt.context.isDev" id="potree_sidebar_container"></div>
      <div class="btn absolute z-20 right-4 bottom-4" @click="toggleSidebar">
        Toggle Panel
      </div>
    </div>
    <camera-section :position="position" :viewerScene="viewerScene" />
  </div>
</template>

<script>
/* eslint no-implicit-globals: "error" */
/* eslint-disable */
import Vue from "vue";
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
      },
    },
    numPoints: {
      type: Number,
      required: false,
      default: 6000000,
      validator(value) {
        return value > 0 && value < 50000000;
      },
    },
    pointClouds: {
      type: Array,
      required: false,
      default: () => [],
    },
  },
  data() {
    return {
      viewer: null,
      position: {
        x: 0,
        y: 0,
        z: 0,
      },
      viewerScene: null,
    };
  },

  mounted() {
    Vue.prototype.$viewer = new Potree.Viewer(this.$refs.potree_container);

    this.viewerScene = this.$viewer.scene;
    // Get active camera position
    const cameraPosition = this.viewerScene.getActiveCamera();
    // Set the position
    this.position = cameraPosition.position;

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
      (e) => {
        const scene = this.$viewer.scene;
        const pointcloud = e.pointcloud;

        const material = pointcloud.material;
        material.size = 1;
        material.pointSizeType = Potree.PointSizeType.ADAPTIVE;
        material.shape = Potree.PointShape.SQUARE;

        scene.addPointCloud(pointcloud);
        this.$viewer.fitToScreen();
      }
    );

    this.$viewer.loadGUI(() => {
      this.$viewer.setLanguage("en");
      $("#menu_tools").next().show();
      $("#menu_clipping").next().show();

      // Add custom section for Camera
      let section = $(`
				<h3 id="menu_meta" class="accordion-header ui-widget"><span>Camera Position</span></h3>
				<div class="accordion-content ui-widget pv-menu-list"></div>
			`);
      // get vue component for Camera Section
      let axisSection = document.getElementById("cameraSection");
      let content = section.last();
      content.html(axisSection);
      section.first().click(() => content.slideToggle());
      section.insertBefore($("#menu_appearance"));
      this.$viewer.toggleSidebar();
    });
    this.$viewer.addEventListener("move_speed_changed", () => {
      // Set the position
      this.position = cameraPosition.position;
    });

    // this.$viewer.onPointCloudLoaded(e => {
    //   debugger;
    //   const pos = this.$viewer.scene.getActiveCamera();
    //   console.log("pos", pos, pos.position.x);
    // });
    // switch (this.graphics) {
    //   case 'low':
    //     this.$viewer.useEDL = false
    //     this.$viewer.useHQ = false
    //     break
    //   case 'medium':
    //     this.$viewer.useEDL = true
    //     this.$viewer.useHQ = false
    //     break
    //   case 'high':
    //     this.$viewer.useEDL = true
    //     this.$viewer.useHQ = true
    //     break
    //   default:
    //     break
    // }
    // this.$viewer.setPointBudget(this.numPoints)
    // this.pointClouds.forEach((pc) => {
    //   Potree.loadPointCloud(`pointclouds/${pc.name.toLowerCase()}/ept.json`, pc.name, (e) => {
    //     this.onPointCloudLoaded(e.pointcloud, 0.65)
    //   })
    // })
    // this.$viewer.setNavigationMode(Potree.PathControls)
    // this.$viewer.setMoveSpeed(2)
    // this.$viewer.pathControls.setPath(pathOverview)
    // this.$viewer.pathControls.rotationSpeed = 50
    // this.$viewer.pathControls.position = 0.2
    // this.$viewer.pathControls.loop = false
    // this.$viewer.pathControls.lockViewToPath = 'moving'
    // this.$viewer.scene.view.direction = this.$viewer.pathControls.path.getTangentAt(
    //   this.$viewer.pathControls.position
    // )
    // this.createAnnotations()
    // this.$watch('$i18n.locale', () => {
    //   this.createAnnotations()
    // })
  },
  methods: {
    toggleSidebar() {
      $("#potree_sidebar_container").toggle();
    },

    onPointCloudLoaded(pointcloud, size) {
      this.$viewer.scene.addPointCloud(pointcloud);
      const { material } = pointcloud;
      material.size = size;
      material.pointSizeType = Potree.PointSizeType.ADAPTIVE;
      if (pointcloud.name === "AHN2") {
        const { offset } = pointcloud.pcoGeometry;
        const { center } = pointcloud.boundingSphere;
        const bbox = pointcloud.boundingBox;
        const lengthX = bbox.max.x + offset.x - (bbox.min.x + offset.x);
        const lengthY = bbox.max.y + offset.y - (bbox.min.y + offset.y);
        const meshGeometry = new THREE.PlaneGeometry(lengthX, lengthY);
        const meshMaterial = new THREE.MeshBasicMaterial({
          color: 0x4b433b,
          side: THREE.DoubleSide,
        });
        const meshPlane = new THREE.Mesh(meshGeometry, meshMaterial);
        meshPlane.position.set(center.x + offset.x, center.y + offset.y, 0);
        this.$viewer.scene.scene.add(meshPlane);
      }
    },
    createAnnotations() {
      this.$viewer.scene.annotations.children = [];
      this.$viewer.scene.addAnnotation([236790, 548513, 69], {
        // title: this.$t('commanderHouse')
        title: "commanderHouse",
      });
      this.$viewer.scene.addAnnotation([237079, 548442, 69], {
        title: "campTerrain",
      });
    },
  },
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
