import { potreeRef } from '~/api/VAPotree'

/**
 * Promise Tween animation
 * @param obj // obj = potreeRef.viewer
 * @param prop // prop = { edlOpacity: 0 }
 * @returns {Promise<unknown>}
 */
export const tweenToPromisify = (obj = {}, prop = {}, timeMilliSeconds = 1000) => new Promise((resolve, reject) => {
  potreeRef.animation = new TWEEN.Tween(obj).to(prop, timeMilliSeconds)

  potreeRef.animation.start()
    .onComplete(() => {
      potreeRef.animation = null
      resolve()
    })
})

export const promisifyVideo = video => new Promise((resolve, reject) => {
  video.play()
  video.addEventListener('ended', () => {
    video.pause()
    video.removeEventListener('ended', null)
    resolve()
  })
})
