<template>
  <div class="flex">
    <div id="header">
      <stepsTimelineLinks />
    </div>

    <NuxtChild id="steps" />
    <potree-viewer />
    <div id="navigation" class="flex">
      <!--      <button class="back btn mr-6">-->
      <!--        Back-->
      <!--      </button>-->
      <!--      <div class="next btn ">-->
      <!--        Next-->
      <!--      </div>-->
    </div>
  </div>
</template>

<script>
export default {
  name: 'Examples'
}
</script>

<style scoped>
#header{
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 1;
}
#steps{
  position: absolute;
  top: 20px;
  right: 40%;
  z-index: 1;
}
#navigation{
  position: absolute;
  bottom: 20px;
  right: 20px;
  z-index: 1;
}
</style>
