import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader'

export default class MouseEvent {
  constructor (_viewer, _isSelect, _callback, _type = 'click') {
    this.viewer = _viewer
    this.isSelect = _isSelect
    this.callback = _callback
    this.type = _type
    this.composer = new EffectComposer(this.viewer.renderer)
    const renderPass = new RenderPass(this.viewer.scene, this.viewer.camera)
    this.composer.addPass(renderPass)
    this.outlinePass = new OutlinePass(new THREE.Vector2(this.viewer.renderer.domElement.clientWidth, this.viewer.renderer.domElement.clientHeight), this.viewer.scene, this.viewer.camera)
    this.outlinePass.edgeStrength = 10.0 // 边框的亮度
    this.outlinePass.edgeGlow = 1// 光晕[0,1]
    this.outlinePass.edgeThickness = 3.0 // 边框宽度
    this.outlinePass.downSampleRatio = 1 // 边框弯曲度
    this.outlinePass.pulsePeriod = 5 // 呼吸闪烁的速度
    this.outlinePass.visibleEdgeColor.set(0xff0000) // 呼吸颜色
    this.outlinePass.hiddenEdgeColor = new THREE.Color(255, 0, 0) // 被遮挡呼吸颜色
    this.composer.addPass(this.outlinePass)
    const effectFXAA = new ShaderPass(FXAAShader)
    effectFXAA.uniforms.resolution.value.set(1 / this.viewer.renderer.domElement.clientWidth, 1 / this.viewer.renderer.domElement.clientHeight)
    this.composer.addPass(effectFXAA)
    return this
  }

  animate (composer) {
    composer.render()
  }

  startSelect (isSelect = true) {
    if (isSelect) {
      // 开始执行动画
      this.composerObject = {
        fun: this.animate,
        content: this.composer
      }
      this.viewer.addAnimate(this.composerObject) // 添加到全局动画
    }
    // 开始绑定点击事件
    this.stopSelect()
    this.bingEvent = this._event.bind(this, this) // 会是一个新的函数，第一个this与第二个this不一样
    this.viewer.renderer.domElement.addEventListener(this.type, this.bingEvent)
  }

  /**
   * 关闭鼠标事件
   */
  stopSelect () {
    this.viewer.renderer.domElement.removeEventListener(this.type, this.bingEvent)// 第一个this与第二个this不一样
  }

  _event (that, e) {
    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()
    that.outlinePass.selectedObjects = []
    mouse.x = (e.offsetX / that.viewer.renderer.domElement.clientWidth) * 2 - 1
    mouse.y = -(e.offsetY / that.viewer.renderer.domElement.clientHeight) * 2 + 1
    raycaster.setFromCamera(mouse, that.viewer.camera)
    const intersects = raycaster.intersectObject(that.viewer.scene, true)
    if (intersects.length > 0 && intersects[0]) {
      // if (intersects[0].object.children.length === 0) that.outlinePass.selectedObjects = [intersects[0].object.parent]
      // else that.outlinePass.selectedObjects = [intersects[0].object]
      if (this.isSelect) that.outlinePass.selectedObjects = [intersects[0].object]
      intersects[0] && that.callback(intersects[0].object, intersects[0].point)
    }
  }

  _selectParent (object) {
    // if(object.parent)

  }
}
