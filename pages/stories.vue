<template>
  <div class="flex">
    <potree-viewer />

    <div id="header">
      <explore-stories-button />
      <stepsTimelineLinks />
    </div>
    <transition>
      <NuxtChild id="steps" class="absolute top-20  min-w-[500px] left-[350px] p-3 prose" />
    </transition>
  </div>
</template>

<script>
export default {
  name: 'Examples'
}
</script>

<style scoped>

/* Transitions using the page hook */
.page-enter-active {
  animation: acrossIn .40s ease-out both;
}
/*.page-leave-active {*/
/*  animation: acrossOut .60s ease-in both;*/
/*}*/
@keyframes acrossIn {
  0% {
    transform: translate3d(0, 10px, 0);
    opacity: 0;
  }
  100% {
    transform: translate3d(0, 0, 0);
    opacity: 1;
  }
}
@keyframes acrossOut {
  0% {
    transform: translate3d(0, 0, 0);
  }
  100% {
    transform: translate3d(100%, 0, 0);
  }
}

#header{
  position: absolute;
  top: 20px;
  right: 20px;
}
#steps{
  position: absolute;
  top: 20px;
  right: 40%;
}

</style>
