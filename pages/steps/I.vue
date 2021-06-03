<template>
  <div class="bg-gray-700 bg-opacity-90 rounded ">
    <h2> {{ page.title }} </h2>
    <div class="w-full">
      <nuxt-content :document="page" class="text-gray-400 prose prose-sm sm:prose lg:prose-lg" />
    </div>
    <div class="btn" @click="targetTo">
      target
    </div>
  </div>
</template>

<script>
export default {
  async asyncData ({ $content }) {
    const page = await $content('I').fetch()

    return {
      page
    }
  },
  methods: {
    /*
    *
    * if you want to move the camera and target it to a certain object/coordinate
      * meanwhile, remain its direction and radius
    * code goes below
    */
    targetTo (target) {
      const { view } = this.$viewer.scene
      // const { direction, radius } = view

      // position
      view.position.set(296409.834, 4633292.402, 284.229)
      // target
      view.lookAt(new THREE.Vector3(296389.882, 4633364.782, 267.282))

      // const endPosition = new THREE.Vector3(295767.711, 4631801.029, 586.717)
      //   .addScaledVector(direction, -radius) // notice do not forget the negative symbol here
      // view.position.copy(endPosition)
    },

    /**
     * Make camera fly to target position with given lookAt position
     * @param position camera's target position
     * @param lookAt camera's new lookAt position
     */
    flyTo (position = THREE.Vector3, lookAt = THREE.Vector3) {
      const camera = this.camera
      const controls = this.controls
      if (!camera || !controls) {
        return
      }
      if (this.tween) {
        this.tween.stop() // avoid re-entry
      }

      // const update = (
      //   p, // ?: THREE.Vector3,
      //   t // ?: THREE.Vector3
      // ) => {
      //   t && camera.lookAt(t)
      //   p && camera.position.set(p.x, p.y, p.z)
      //   t && controls.target.set(t.x, t.y, t.z)
      //   controls.update()
      // }

      // there are two steps
      // 1) change camera's lookAt point in x miliseconds
      // 2) change camera's position in y miliseconds
      // const t = controls.target.clone() // have to copy one, otherwise TWEEN breaks the passed in object!
      // this.tween = new TWEEN.Tween(t)
      // this.tween.to(lookAt, 500)
      // this.tween.easing(TWEEN.Easing.Sinusoidal.InOut)
      // this.tween.onUpdate(() => {
      //   update(undefined, t)
      // })
      // this.tween.onComplete(() => {
      //   const p = camera.position.clone()
      //   this.tween = new TWEEN.Tween(p)
      //   this.tween.to(position, 1500)
      //   this.tween.easing(TWEEN.Easing.Sinusoidal.InOut)
      //   this.tween.onUpdate(() => {
      //     update(p, lookAt)
      //   })
      //   this.tween.onComplete(() => {
      //     update(p, lookAt)
      //   })
      //   this.tween.start()
      // })
      // this.tween.start()
    }

  }

}
</script>
