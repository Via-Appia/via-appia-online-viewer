<template>
  <div id="potree-viewer" />
</template>

<script>
import Vue from 'vue'
// import { pathOverview } from './path'
const { Potree, THREE } = window
export default {
  name: 'PotreeViewer',
  props: {
    graphics: {
      type: String,
      required: false,
      default: 'medium',
      validator (value) {
        return ['low', 'medium', 'high'].includes(value)
      }
    },
    numPoints: {
      type: Number,
      required: false,
      default: 6000000,
      validator (value) {
        return value > 0 && value < 50000000
      }
    },
    pointClouds: {
      type: Array,
      required: false,
      default: () => []
    }
  },
  // watch: {
  //   graphics (value) {
  //     switch (value) {
  //       case 'low':
  //         this.$viewer.useEDL = false
  //         this.$viewer.useHQ = false
  //         break
  //       case 'medium':
  //         this.$viewer.useEDL = true
  //         this.$viewer.useHQ = false
  //         break
  //       case 'high':
  //         this.$viewer.useEDL = true
  //         this.$viewer.useHQ = true
  //         break
  //       default:
  //         break
  //     }
  //   },
  //   numPoints (value) {
  //     this.$viewer.setPointBudget(value)
  //   },
  //   pointClouds: {
  //     handler (pointClouds = []) {
  //       pointClouds.forEach((pc) => {
  //         const pcPotree = this.$viewer.scene.pointclouds.filter(v => v.name === pc.name)[0]
  //         if (pcPotree) { pcPotree.visible = pc.visible }
  //       })
  //     },
  //     deep: true
  //   }
  // },
  mounted () {
    Vue.prototype.$viewer = new Potree.Viewer(this.$el)
    this.$viewer.setFOV(80)
    this.$viewer.setBackground('skybox')
    switch (this.graphics) {
      case 'low':
        this.$viewer.useEDL = false
        this.$viewer.useHQ = false
        break
      case 'medium':
        this.$viewer.useEDL = true
        this.$viewer.useHQ = false
        break
      case 'high':
        this.$viewer.useEDL = true
        this.$viewer.useHQ = true
        break
      default:
        break
    }
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
    onPointCloudLoaded (pointcloud, size) {
      this.$viewer.scene.addPointCloud(pointcloud)
      const { material } = pointcloud
      material.size = size
      material.pointSizeType = Potree.PointSizeType.ADAPTIVE
      if (pointcloud.name === 'AHN2') {
        const { offset } = pointcloud.pcoGeometry
        const { center } = pointcloud.boundingSphere
        const bbox = pointcloud.boundingBox
        const lengthX = bbox.max.x + offset.x - (bbox.min.x + offset.x)
        const lengthY = bbox.max.y + offset.y - (bbox.min.y + offset.y)
        const meshGeometry = new THREE.PlaneGeometry(lengthX, lengthY)
        const meshMaterial = new THREE.MeshBasicMaterial({
          color: 0x4B433B,
          side: THREE.DoubleSide
        })
        const meshPlane = new THREE.Mesh(meshGeometry, meshMaterial)
        meshPlane.position.set(center.x + offset.x, center.y + offset.y, 0)
        this.$viewer.scene.scene.add(meshPlane)
      }
    },
    createAnnotations () {
      this.$viewer.scene.annotations.children = []
      this.$viewer.scene.addAnnotation([236790, 548513, 69], {
        // title: this.$t('commanderHouse')
        title: 'commanderHouse'
      })
      this.$viewer.scene.addAnnotation([237079, 548442, 69], {
        title: 'campTerrain'
      })
    }
  }
}
</script>

<style>
#potree-viewer {
  width: 100%;
  height: 100vh;
}
</style>
