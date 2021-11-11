import { VAOrientedImageControls } from './VAOrientedImageControls.js'
import { potreeRef } from '~/api/VAPotree'

// https://support.pix4d.com/hc/en-us/articles/205675256-How-are-yaw-pitch-roll-defined
// https://support.pix4d.com/hc/en-us/articles/202558969-How-are-omega-phi-kappa-defined

const { Potree, THREE } = window

function createMaterial () {
  const vertexShader = `
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
  }
  `

  const fragmentShader = `
  uniform sampler2D tColor;
  uniform float uOpacity;
  varying vec2 vUV;
  varying vec4 vDebug;
  void main(){
    vec4 color = texture2D(tColor, vUV);
    gl_FragColor = color;
    gl_FragColor.a = uOpacity;
  }
  `
  const material = new THREE.ShaderMaterial({
    uniforms: {
      // time: { value: 1.0 },
      // resolution: { value: new THREE.Vector2() }
      tColor: { value: new THREE.Texture() },
      uNear: { value: 0.0 },
      uOpacity: { value: 1.0 }
    },
    vertexShader,
    fragmentShader,
    side: THREE.DoubleSide
  })

  material.side = THREE.DoubleSide
  material.transparent = true

  return material
}

const planeGeometry = new THREE.PlaneGeometry(1, 1)
const lineGeometry = new THREE.Geometry()

lineGeometry.vertices.push(
  new THREE.Vector3(-0.5, -0.5, 0),
  new THREE.Vector3(0.5, -0.5, 0),
  new THREE.Vector3(0.5, 0.5, 0),
  new THREE.Vector3(-0.5, 0.5, 0),
  new THREE.Vector3(-0.5, -0.5, 0)
)

export class VAOrientedImage {
  constructor (id) {
    this.id = id
    this.fov = 1.0
    this.position = new THREE.Vector3()
    this.rotation = new THREE.Vector3()
    this.width = 0
    this.height = 0
    this.fov = 1.0

    const material = createMaterial()
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x00FF00 })
    this.mesh = new THREE.Mesh(planeGeometry, material)
    this.line = new THREE.Line(lineGeometry, lineMaterial)
    this.texture = null

    this.mesh.orientedImage = this
  }

  set (position, rotation, dimension, fov) {
    const radians = rotation.map(THREE.Math.degToRad)

    this.position.set(...position)
    this.mesh.position.set(...position)

    this.rotation.set(...radians)
    this.mesh.rotation.set(...radians);

    [this.width, this.height] = dimension
    this.mesh.scale.set(this.width / this.height, 1, 1)

    this.fov = fov

    this.updateTransform()
  }

  updateTransform () {
    const { mesh, line, fov } = this

    mesh.updateMatrixWorld()
    const dir = mesh.getWorldDirection()

    const alpha = THREE.Math.degToRad(fov / 2)
    const d = -0.5 / Math.tan(alpha)

    // console.log('d value is: ' + d)

    const move = dir.clone().multiplyScalar(d)
    mesh.position.add(move)

    line.position.copy(mesh.position)
    line.scale.copy(mesh.scale)
    line.rotation.copy(mesh.rotation)
  }

  setPosition (activeCamera, offset) {
    // const radians = activeCamera.rotation.map(THREE.Math.degToRad)

    this.position.copy(activeCamera.position)
    this.mesh.position.copy(activeCamera.position)

    this.rotation.copy(activeCamera.rotation)
    this.mesh.rotation.copy(activeCamera.rotation)

    this.updateTransformOffset(offset)
  }

  updateTransformOffset (offset) {
    const { mesh, line } = this

    mesh.updateMatrixWorld()
    const dir = mesh.getWorldDirection()
    const move = dir.clone().multiplyScalar(offset)
    mesh.position.add(move)

    line.position.copy(mesh.position)
    line.scale.copy(mesh.scale)
    line.rotation.copy(mesh.rotation)
  }
}

export class VAOrientedImages extends Potree.EventDispatcher {
  constructor () {
    super()

    this.node = null
    this.cameraParams = null
    this.imageParams = null
    this.images = null
    this._visible = true
  }

  set visible (visible) {
    if (this._visible === visible) {
      return
    }

    for (const image of this.images) {
      image.mesh.visible = visible
      image.line.visible = visible
    }

    this._visible = visible
  }

  get visible () {
    return this._visible
  }
}

export class VAOrientedImageLoader {
  static async loadCameraParams (path) {
    const res = await fetch(path)
    const text = await res.text()

    const parser = new DOMParser()
    const doc = parser.parseFromString(text, 'application/xml')

    const width = parseInt(doc.getElementsByTagName('width')[0].textContent)
    const height = parseInt(doc.getElementsByTagName('height')[0].textContent)
    const f = parseFloat(doc.getElementsByTagName('f')[0].textContent)

    const a = height / 2 / f
    const fov = 2 * THREE.Math.radToDeg(Math.atan(a))

    const params = {
      path,
      width,
      height,
      f,
      fov
    }

    return params
  }

  static async loadImageParams (path) {
    const response = await fetch(path)
    if (!response.ok) {
      console.error(`failed to load ${path}`)
      return
    }

    const content = await response.text()
    const lines = content.split(/\r?\n/)
    const imageParams = []

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]

      if (line.startsWith('#')) {
        continue
      }

      const tokens = line.split(/\s+/)

      if (tokens.length < 6) {
        continue
      }

      const params = {
        id: tokens[0],
        x: Number.parseFloat(tokens[1]),
        y: Number.parseFloat(tokens[2]),
        z: Number.parseFloat(tokens[3]),
        omega: Number.parseFloat(tokens[4]),
        phi: Number.parseFloat(tokens[5]),
        kappa: Number.parseFloat(tokens[6])
      }

      imageParams.push(params)
    }

    return imageParams
  }

  static async load (cameraParams, imageParams, viewer) {
    // const tStart = performance.now()

    // const [cameraParams, imageParams] = await Promise.all([
    //   VAOrientedImageLoader.loadCameraParams(cameraParamsPath),
    //   VAOrientedImageLoader.loadImageParams(imageParamsPath)
    // ])
    // console.log('🎹', cameraParams, imageParams)
    const orientedImageControls = new VAOrientedImageControls(viewer)
    const raycaster = new THREE.Raycaster()

    // const tEnd = performance.now()
    // console.log(tEnd - tStart)

    const { width, height } = cameraParams
    const orientedImages = []
    const sceneNode = new THREE.Object3D()
    sceneNode.name = 'oriented_images'

    // for (const params of imageParams) {
    const { x, y, z, omega, phi, kappa } = imageParams
    const orientedImage = new VAOrientedImage(imageParams.id)
    const position = [x, y, z]
    const rotation = [omega, phi, kappa]
    const dimension = [width, height]
    orientedImage.set(position, rotation, dimension, cameraParams.fov)
    sceneNode.add(orientedImage.mesh)
    sceneNode.add(orientedImage.line)
    orientedImages.push(orientedImage)
    // }

    let hoveredElement = null
    // const clipVolume = null

    const onMouseMove = (evt) => {
      if (hoveredElement) {
        hoveredElement.line.material.color.setRGB(0, 1, 0)
        document.body.style.cursor = 'pointer'
      } else {
        document.body.style.cursor = 'default'
      }
      // evt.preventDefault()

      // var array = getMousePosition( container, evt.clientX, evt.clientY );
      const rect = viewer.renderer.domElement.getBoundingClientRect()
      const [x, y] = [evt.clientX, evt.clientY]
      const array = [
        (x - rect.left) / rect.width,
        (y - rect.top) / rect.height
      ]
      const onClickPosition = new THREE.Vector2(...array)
      // const intersects = getIntersects(onClickPosition, scene.children);
      const camera = viewer.scene.getActiveCamera()
      const mouse = new THREE.Vector3(
        +(onClickPosition.x * 2) - 1,
        -(onClickPosition.y * 2) + 1
      )
      const objects = orientedImages.map(i => i.mesh)
      raycaster.setFromCamera(mouse, camera)
      const intersects = raycaster.intersectObjects(objects)
      // let selectionChanged = false

      if (intersects.length > 0) {
        // console.log(intersects);
        const intersection = intersects[0]
        const orientedImage = intersection.object.orientedImage
        orientedImage.line.material.color.setRGB(1, 0, 0)
        // selectionChanged = hoveredElement !== orientedImage
        hoveredElement = orientedImage
      } else {
        hoveredElement = null
      }

      // const shouldAddClipVolume = clipVolume === null && hoveredElement !== null

      // if (
      //   clipVolume !== null &&
      //   (hoveredElement === null || selectionChanged)
      // ) {
      //   // remove existing
      //   viewer.scene.removePolygonClipVolume(clipVolume)
      //   clipVolume = null
      // }

      // if (shouldAddClipVolume || selectionChanged) {
      //   const img = hoveredElement
      //   const fov = cameraParams.fov
      //   const aspect = cameraParams.width / cameraParams.height
      //   const near = 1.0
      //   const far = 1000 * 1000
      //   const camera = new THREE.PerspectiveCamera(fov, aspect, near, far)
      //   camera.rotation.order = viewer.scene.getActiveCamera().rotation.order
      //   camera.rotation.copy(img.mesh.rotation)
      //   {
      //     const mesh = img.mesh
      //     const dir = mesh.getWorldDirection()
      //     const pos = mesh.position
      //     const alpha = THREE.Math.degToRad(fov / 2)
      //     const d = 0.5 / Math.tan(alpha)
      //     const newCamPos = pos.clone().add(dir.clone().multiplyScalar(d))
      //     camera.position.copy(newCamPos)
      //   }
      //   const volume = new Potree.PolygonClipVolume(camera)
      //   const m0 = new THREE.Mesh()
      //   const m1 = new THREE.Mesh()
      //   const m2 = new THREE.Mesh()
      //   const m3 = new THREE.Mesh()
      //   m0.position.set(-1, -1, 0)
      //   m1.position.set(1, -1, 0)
      //   m2.position.set(1, 1, 0)
      //   m3.position.set(-1, 1, 0)
      //   volume.markers.push(m0, m1, m2, m3)
      //   volume.initialized = true

      //   viewer.scene.addPolygonClipVolume(volume)
      //   clipVolume = volume
      // }
    }

    const moveToImage = (image) => {
      console.log('move to image ' + image.id)

      const mesh = image.mesh
      const newCamPos = image.position.clone()
      const newCamTarget = mesh.position.clone()

      viewer.scene.view.setView(newCamPos, newCamTarget, 500, () => {
        orientedImageControls.capture(image)
        orientedImageControls.release()
      })

      if (image.texture === null) {
        const target = image

        // const tmpImagePath = `${Potree.resourcePath}/images/loading.jpg`
        // new THREE.TextureLoader().load(tmpImagePath, (texture) => {
        //   if (target.texture === null) {
        //     target.texture = texture
        //     target.mesh.material.uniforms.tColor.value = texture
        //     mesh.material.needsUpdate = true
        //   }
        // })

        new THREE.TextureLoader().load(imageParams.path, (texture) => {
          target.texture = texture
          target.mesh.material.uniforms.tColor.value = texture
          mesh.material.needsUpdate = true
        })
      }
      viewer.dispatchEvent({
        type: 'image clicked',
        image
      })
    }

    const onMouseClick = (evt) => {
      if (orientedImageControls.hasSomethingCaptured()) {
        return
      }

      if (hoveredElement) {
        moveToImage(hoveredElement)
      }
    }

    viewer.renderer.domElement.addEventListener(
      'mousemove',
      onMouseMove,
      false
    )
    viewer.renderer.domElement.addEventListener(
      'mousedown',
      onMouseClick,
      false
    )

    viewer.addEventListener('update', () => {
      for (const image of orientedImages) {
        const { width, height } = image
        const aspect = width / height

        const camera = viewer.scene.getActiveCamera()

        const imgPos = image.mesh.getWorldPosition(new THREE.Vector3())
        const camPos = camera.position
        const d = camPos.distanceTo(imgPos)

        const minSize = 1 // in degrees of fov
        const a = THREE.Math.degToRad(minSize)
        let r = d * Math.tan(a)
        r = Math.max(r, 1)

        image.mesh.scale.set(r * aspect, r, 1)
        image.line.scale.set(r * aspect, r, 1)

        image.mesh.material.uniforms.uNear.value = camera.near
      }
    })

    const images = new VAOrientedImages()
    images.node = sceneNode
    images.cameraParams = cameraParams
    images.imageParams = imageParams
    images.images = orientedImages

    Potree.debug.moveToImage = moveToImage

    return [images, orientedImageControls]
  }
}
