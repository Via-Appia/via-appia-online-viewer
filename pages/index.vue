<template>
  <div class="relative">
    <div class="fixed bg-black opacity-80 top-0 left-0 right-0 bottom-0" />
    <section
      v-motion
      :initial="{ opacity: 0}"
      :enter="{ opacity: 1}"
      class="fixed top-0 left-0 right-0 bottom-0  w-screen h-screen flex items-center justify-center"
    >
      <locale-switch class="absolute top-[15%] right-[15%]" />

      <div class="text-white py-20">
        <div class="container mx-auto flex flex-row items-center my-12 md:my-24">
          <div class="flex flex-col w-2/3 md:w-1/3 justify-center items-start p-8">
            <h1 class="text-3xl md:text-5xl py-2 text-yellow-300 tracking-loose">
              REVISITED <br>Via Appia
            </h1>

            <div v-if="potreeRef.lang ==='nl'">
              <p class="text-sm md:text-base my-4">
                Reis in tijd en ruimte langs de belangrijkste oudste Romeinse weg.
              </p>
              <p class="text-sm md:text-base mb-4">
                Zes monumenten en meer dan honderd standpunten laten zien hoe de Via Appia Antica in
                de loop van de tijd door kunstenaars en fotografen werd gezien.
              </p>
              <nuxt-link to="stories" class="button">
                BEGIN Verkenning
              </nuxt-link>
            </div>

            <div v-if="potreeRef.lang ==='en'">
              <p class="text-sm md:text-base my-4">
                Travel in time and space along the most important ancient Roman road.
              </p>
              <p class="text-sm md:text-base mb-4">
                Six monuments and more than a hundred viewpoints show how the Via Appia Antica was
                seen by artists and photographers over time.
              </p>
              <nuxt-link to="stories" class="button">
                START exploring
              </nuxt-link>
            </div>
            <div v-if="potreeRef.lang ==='de'">
              <p class="text-sm md:text-base my-4">
                Reisen Sie durch Zeit und Raum entlang der wichtigsten alten Römerstraße.
              </p>
              <p class="text-sm md:text-base mb-4">
                Sechs Denkmäler und mehr als hundert Aussichtspunkte zeigen, wie die Via Appia
                Antica im Laufe der Zeit von Künstlern und Fotografen gesehen wurde.
              </p>
              <nuxt-link to="stories" class="button">
                BEGINNEN Sie zu erkunden
              </nuxt-link>
            </div>

            <!-- VR Content-->
            <div class="flex text-opacity-50 text-white">
              Also in VR
              <svg
                class=" ml-4 "
                width="32"
                height="24"
                viewBox="0 0 32 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M11.0703 16.7333L8.07031 8.20208H9.85156L11.8908 14.817L13.9414 8.20208H15.7285L12.7168 16.7333H11.0703Z"
                  fill="currentColor"
                />
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M19.707 8.20208H16.6074V16.7333H18.2188V13.5107H19.7581L21.4238 16.7333H23.1523V16.6513L21.2702 13.1243C21.5137 13.0178 21.7329 12.8888 21.9277 12.7372C22.2129 12.5185 22.4336 12.247 22.5898 11.9228C22.7461 11.5986 22.8242 11.2158 22.8242 10.7743C22.8242 10.2158 22.6992 9.74505 22.4492 9.36224C22.1992 8.97943 21.8418 8.69036 21.377 8.49505C20.9121 8.29974 20.3555 8.20208 19.707 8.20208ZM18.2188 12.2392H19.7246C20.0566 12.2392 20.332 12.1806 20.5508 12.0634C20.7695 11.9462 20.9336 11.7841 21.043 11.5771C21.1562 11.3701 21.2129 11.1337 21.2129 10.8681C21.2129 10.5829 21.1582 10.3368 21.0488 10.1298C20.9395 9.91888 20.7734 9.75677 20.5508 9.64349C20.3281 9.53021 20.0469 9.47357 19.707 9.47357H18.2188V12.2392Z"
                  fill="currentColor"
                />
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M2.0986 8.24533L1.5232 6.2272C2.53032 5.93947 3.54386 5.68237 4.56248 5.45589L5.40344 3.35433L7.38347 4.14507L7.05591 4.96429C12.975 3.94492 19.0256 3.94495 24.9447 4.9644L24.6173 4.14477C24.3797 3.55084 23.9689 3.04201 23.4392 2.68342C22.9095 2.32483 22.2845 2.13323 21.6448 2.13333H10.3552C9.71577 2.13306 9.09093 2.32435 8.56124 2.68254C8.03156 3.04073 7.62133 3.5494 7.38347 4.14293L5.40344 3.35433C5.79912 2.36453 6.48263 1.51528 7.3652 0.917511C8.24778 0.319744 9.28924 0.000163032 10.3552 0H21.6448C22.7108 0.000163032 23.7522 0.319744 24.6348 0.917511C25.5174 1.51528 26.2006 2.3638 26.5963 3.3536L27.4375 5.45589C28.4561 5.68237 29.4697 5.93947 30.4768 6.2272C30.9155 6.35238 31.3015 6.61707 31.5763 6.98121C31.8512 7.34535 31.9999 7.78912 32 8.24533H31.9979V15.3813H32C32 17.5257 31.1482 19.5822 29.6319 21.0985C28.1156 22.6148 26.059 23.4667 23.9147 23.4667H22.7584C22.4583 23.4672 22.1637 23.3866 21.9057 23.2334C21.6477 23.0802 21.4359 22.86 21.2928 22.5963C19.006 18.4088 12.9929 18.4085 10.7077 22.5954L10.7072 22.5963C10.5641 22.86 10.3523 23.0802 10.0943 23.2334C9.83631 23.3866 9.54167 23.4672 9.2416 23.4667H8.08533C5.94097 23.4667 3.88443 22.6148 2.36814 21.0985C0.851845 19.5822 0 17.5257 0 15.3813V8.24533C0.000571088 7.78948 0.149513 7.34621 0.424315 6.9825C0.699118 6.61879 1.08484 6.35441 1.5232 6.22933L2.0986 8.24533ZM26.1808 7.36703C19.3985 5.97292 12.4005 5.98654 5.62235 7.40789C5.58077 7.41933 5.53866 7.4282 5.49625 7.4345C4.36844 7.67401 3.2468 7.95251 2.13333 8.27003V15.3813C2.13333 16.9599 2.76042 18.4738 3.87663 19.59C4.99285 20.7063 6.50676 21.3333 8.08533 21.3333H8.9727C12.1141 15.9844 19.8838 15.9844 23.0272 21.3333H23.9147C25.4932 21.3333 27.0072 20.7063 28.1234 19.59C29.2396 18.4738 29.8667 16.9599 29.8667 15.3813H29.8645V8.26942C28.8294 7.97428 27.7872 7.71287 26.7395 7.48516C26.7114 7.48692 26.6832 7.48757 26.655 7.4871C26.5131 7.48474 26.3731 7.45407 26.2432 7.3969C26.222 7.38761 26.2013 7.37764 26.1808 7.36703Z"
                  fill="currentColor"
                />
              </svg>
            </div>
          </div>
          <div class="p-0 md:p-8 mt-12 mb-6 w-1/3 md:w-2/3 ml-0 justify-center align-center">
            <img src="banner.webp">
          </div>
        </div>
      </div>
    </section>

    <footer class="fixed bottom-0 text-xs opacity-40">
      Debug:
      <nuxt-link class="ml-2 btn-outline" to="offline">
        Offline
      </nuxt-link>
      <nuxt-link class="ml-2 btn-outline" to="feedback">
        Feedback
      </nuxt-link>
    </footer>
  </div>
</template>
<script setup>
import { potreeRef } from '~/api/VAPotree'
import LocaleSwitch from '~/components/LocaleSwitch'
</script>
