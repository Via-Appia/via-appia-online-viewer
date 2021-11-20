/**
 * @author mschuetz / http://mschuetz.at
 *
 * adapted from THREE.OrbitControls by
 *
 * @author qiao / https://github.com/qiao
 * @author mrdoob / http://mrdoob.com
 * @author alteredq / http://alteredqualia.com/
 * @author WestLangley / http://github.com/WestLangley
 * @author erich666 / http://erichaines.com
 *
 *
 *
 */

import { potreeRef } from '~/api/VAPotree'

const { Potree, THREE } = window

export class VAFirstPersonControls extends Potree.EventDispatcher {
  constructor (viewer) {
    super()

    this.viewer = viewer
    this.renderer = viewer.renderer

    this.scene = null
    this.sceneControls = new THREE.Scene()

    this.rotationSpeed = 200
    this.moveSpeed = 10
    this.lockElevation = false

    this.keys = {
      FORWARD: ['W'.charCodeAt(0), 38],
      BACKWARD: ['S'.charCodeAt(0), 40],
      LEFT: ['A'.charCodeAt(0), 37],
      RIGHT: ['D'.charCodeAt(0), 39],
      UP: ['E'.charCodeAt(0), 33],
      DOWN: ['F'.charCodeAt(0), 34]
    }

    this.fadeFactor = 50
    this.yawDelta = 0
    this.pitchDelta = 0
    this.translationDelta = new THREE.Vector3(0, 0, 0)
    this.translationWorldDelta = new THREE.Vector3(0, 0, 0)

    this.tweens = []

    this.objectsRegisteredForUpdate = []

    const drag = (e) => {
      if (e.drag.object !== null) {
        return
      }

      if (e.drag.startHandled === undefined) {
        e.drag.startHandled = true

        this.dispatchEvent({ type: 'start' })
      }

      const moveSpeed = this.viewer.getMoveSpeed()

      const ndrag = {
        x: e.drag.lastDrag.x / this.renderer.domElement.clientWidth,
        y: e.drag.lastDrag.y / this.renderer.domElement.clientHeight
      }

      if (e.drag.mouse === Potree.MOUSE.LEFT) {
        this.yawDelta += ndrag.x * this.rotationSpeed
        this.pitchDelta += ndrag.y * this.rotationSpeed
      } else if (e.drag.mouse === Potree.MOUSE.RIGHT) {
        this.translationDelta.x -= ndrag.x * moveSpeed * 100
        this.translationDelta.z += ndrag.y * moveSpeed * 100
      }
    }

    const drop = (e) => {
      this.dispatchEvent({ type: 'end' })
    }

    const scroll = (e) => {
      let speed = this.viewer.getMoveSpeed()

      if (speed >= 40) {
        speed = 40
      }
      if (e.delta < 0) {
        speed = speed * 0.9
      } else if (e.delta > 0) {
        speed = speed / 0.9
      }
      // Round to 0.1 decimal
      speed = Math.max(speed, 0.1)

      this.viewer.setMoveSpeed(speed)
      potreeRef.props.moveSpeed = Math.round(speed * 10) / 10
    }

    const dblclick = (e) => {
      this.zoomToLocation(e.mouse)
    }

    this.addEventListener('drag', drag)
    this.addEventListener('drop', drop)
    this.addEventListener('mousewheel', scroll)
    this.addEventListener('dblclick', dblclick)
  }

  setScene (scene) {
    this.scene = scene
  }

  stop () {
    this.yawDelta = 0
    this.pitchDelta = 0
    this.translationDelta.set(0, 0, 0)
  }

  zoomToLocation (mouse) {
    const camera = this.scene.getActiveCamera()

    const I = Potree.Utils.getMousePointCloudIntersection(
      mouse,
      camera,
      this.viewer,
      this.scene.pointclouds)

    if (I === null) {
      return
    }

    let targetRadius = 0
    {
      const minimumJumpDistance = 0.2

      const domElement = this.renderer.domElement
      const ray = Potree.Utils.mouseToRay(mouse, camera, domElement.clientWidth, domElement.clientHeight)

      const nodes = I.pointcloud.nodesOnRay(I.pointcloud.visibleNodes, ray)
      const lastNode = nodes[nodes.length - 1]
      const radius = lastNode.getBoundingSphere(new THREE.Sphere()).radius
      targetRadius = Math.min(this.scene.view.radius, radius)
      targetRadius = Math.max(minimumJumpDistance, targetRadius)
    }

    const d = this.scene.view.direction.multiplyScalar(-1)
    const cameraTargetPosition = new THREE.Vector3().addVectors(I.location, d.multiplyScalar(targetRadius))
    // TODO Unused: let controlsTargetPosition = I.location;

    const animationDuration = 600
    const easing = Potree.TWEEN.Easing.Quartic.Out

    { // animate
      const value = { x: 0 }
      const tween = new Potree.TWEEN.Tween(value).to({ x: 1 }, animationDuration)
      tween.easing(easing)
      this.tweens.push(tween)

      const startPos = this.scene.view.position.clone()
      const targetPos = cameraTargetPosition.clone()
      const startRadius = this.scene.view.radius
      const targetRadius = cameraTargetPosition.distanceTo(I.location)

      tween.onUpdate(() => {
        const t = value.x
        this.scene.view.position.x = (1 - t) * startPos.x + t * targetPos.x
        this.scene.view.position.y = (1 - t) * startPos.y + t * targetPos.y
        this.scene.view.position.z = (1 - t) * startPos.z + t * targetPos.z

        this.scene.view.radius = (1 - t) * startRadius + t * targetRadius
        this.viewer.setMoveSpeed(this.scene.view.radius / 2.5)
      })

      tween.onComplete(() => {
        this.tweens = this.tweens.filter(e => e !== tween)
      })

      tween.start()
    }
  }

  update (delta) {
    const view = this.scene.view

    { // cancel move animations on user input
      const changes = [this.yawDelta,
        this.pitchDelta,
        this.translationDelta.length(),
        this.translationWorldDelta.length()]
      const changeHappens = changes.some(e => Math.abs(e) > 0.001)
      if (changeHappens && this.tweens.length > 0) {
        this.tweens.forEach(e => e.stop())
        this.tweens = []
      }
    }

    { // accelerate while input is given
      const ih = this.viewer.inputHandler

      const moveForward = this.keys.FORWARD.some(e => ih.pressedKeys[e])
      const moveBackward = this.keys.BACKWARD.some(e => ih.pressedKeys[e])
      const moveLeft = this.keys.LEFT.some(e => ih.pressedKeys[e])
      const moveRight = this.keys.RIGHT.some(e => ih.pressedKeys[e])
      const moveUp = this.keys.UP.some(e => ih.pressedKeys[e])
      const moveDown = this.keys.DOWN.some(e => ih.pressedKeys[e])

      if (this.lockElevation) {
        const dir = view.direction
        dir.z = 0
        dir.normalize()

        if (moveForward && moveBackward) {
          this.translationWorldDelta.set(0, 0, 0)
        } else if (moveForward) {
          this.translationWorldDelta.copy(dir.multiplyScalar(this.viewer.getMoveSpeed()))
        } else if (moveBackward) {
          this.translationWorldDelta.copy(dir.multiplyScalar(-this.viewer.getMoveSpeed()))
        }
      } else if (moveForward && moveBackward) {
        this.translationDelta.y = 0
      } else if (moveForward) {
        this.translationDelta.y = this.viewer.getMoveSpeed()
      } else if (moveBackward) {
        this.translationDelta.y = -this.viewer.getMoveSpeed()
      }

      if (moveLeft && moveRight) {
        this.translationDelta.x = 0
      } else if (moveLeft) {
        this.translationDelta.x = -this.viewer.getMoveSpeed()
      } else if (moveRight) {
        this.translationDelta.x = this.viewer.getMoveSpeed()
      }

      if (moveUp && moveDown) {
        this.translationWorldDelta.z = 0
      } else if (moveUp) {
        this.translationWorldDelta.z = this.viewer.getMoveSpeed()
      } else if (moveDown) {
        this.translationWorldDelta.z = -this.viewer.getMoveSpeed()
      }
    }

    // apply rotation
    let yaw = view.yaw
    let pitch = view.pitch

    yaw -= this.yawDelta * delta
    pitch -= this.pitchDelta * delta

    view.yaw = yaw
    view.pitch = pitch

    // apply translation
    view.translate(
      this.translationDelta.x * delta,
      this.translationDelta.y * delta,
      this.translationDelta.z * delta
    )

    view.translateWorld(
      this.translationWorldDelta.x * delta,
      this.translationWorldDelta.y * delta,
      this.translationWorldDelta.z * delta
    )

    // set view target according to speed
    view.radius = 3 * this.viewer.getMoveSpeed()

    // decelerate over time
    const attenuation = Math.max(0, 1 - this.fadeFactor * delta)
    this.yawDelta *= attenuation
    this.pitchDelta *= attenuation
    this.translationDelta.multiplyScalar(attenuation)
    this.translationWorldDelta.multiplyScalar(attenuation)

    if (this.objectsRegisteredForUpdate.length > 0) {
      this.objectsRegisteredForUpdate.forEach((element) => {
        element.update()
      })
    }
  }

  registerForUpdate (object) {
    this.objectsRegisteredForUpdate.push(object)
  }

  deRegisterForUpdate (object) {
    const index = this.objectsRegisteredForUpdate.indexOf(object)
    if (index > -1) {
      this.objectsRegisteredForUpdate.splice(index, 1)
    }
  }
};
