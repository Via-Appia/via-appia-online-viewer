/**
 * Promise Tween animation
 * @param obj // obj = potreeRef.viewer
 * @param prop // prop = { edlOpacity: 0 }
 * @returns {Promise<unknown>}
 */
export const tweenToPromisify = (obj = {}, prop = {}, timeMilliSeconds = 1000) => new Promise((resolve, reject) => {
  new TWEEN.Tween(obj).to(prop, timeMilliSeconds).start()
    .onComplete(() => {
      resolve()
    })
})

export const promisifyVideo = video => new Promise((resolve, reject) => {
  video.play()
  video.addEventListener('ended', () => {
    video.pause()
    resolve()
    video.removeEventListener('ended', null)
  })
})
