import {
  Cache,
  WebGLRenderer,
  PlaneGeometry,
  ACESFilmicToneMapping,
  PCFSoftShadowMap,
  sRGBEncoding,
  PerspectiveCamera,
  Scene,
  GridHelper,
  MeshPhongMaterial,
  Mesh,
  Vector3,
  Color,
  TextureLoader,
  Clock
} from 'three'
import * as THREE from 'three'
import { CSS2DObject, CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer'
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import Stats from 'three/examples/jsm/libs/stats.module.js'
import { Reflector } from 'three/examples/jsm/objects/Reflector.js' // 镜面
import MouseEvent from '../MouseEvent'
import { Water } from 'three/examples/jsm/objects/Water.js'

export default class Viewer {
  /**
   * 构造函数
   * @param id 场景窗体div
   */
  constructor (id) {
    Cache.enabled = true // 开启缓存
    this.divID = id
    this.renderer = undefined
    this.scene = undefined
    this.camera = undefined
    this.controls = undefined
    this.statsControls = undefined
    this.animateEventList = []
    this.onInitRenderer(id, innerWidth, innerHeight)
  }

  /**
   * 添加状态监测
   */
  addStats () {
    if (!this.statsControls) this.statsControls = new Stats()
    this.statsControls.dom.style.position = 'absolute'
    document.getElementById(this.divID).appendChild(this.statsControls.dom)
    // 添加到动画
    this.statsUpdateObject = {
      fun: this._statsUpdate,
      content: this.statsControls
    }
    this.addAnimate(this.statsUpdateObject)
  }

  /**
   * 状态更新
   * @param statsControls
   */
  _statsUpdate (statsControls) {
    statsControls.update()
  }

  /**
   * 移除状态检测
   */
  removeStats () {
    if (this.statsControls) document.getElementById(this.divID).removeChild(this.statsControls.dom)
    // 添加到动画
    this.statsUpdateObject = {
      fun: this._statsUpdate,
      content: this.statsControls
    }
    this.removeAnimate(this.statsUpdateObject)
  }

  /**
   * 创建初始化场景界面
   */
  onInitRenderer (id, innerWidth = window.innerWidth, innerHeight = window.innerHeight) {
    // 初始化渲染器
    this.renderer = new WebGLRenderer({
      logarithmicDepthBuffer: true,
      antialias: true, // true/false表示是否开启反锯齿
      alpha: true, // true/false 表示是否可以设置背景色透明
      precision: 'highp', // highp/mediump/lowp 表示着色精度选择
      premultipliedAlpha: true, // true/false 表示是否可以设置像素深度（用来度量图像的分辨率）
      preserveDrawingBuffer: true // true/false 表示是否保存绘图缓冲
    })
    // 获取画布dom
    this.domThree = document.getElementById(id)
    // 默认情况下，js的光强数值不真实。为了使得光强更趋于真实值，应该把渲染器的physicallyCorrectLights属性设为true
    console.log(innerWidth, 'innerWidth')
    this.renderer.physicallyCorrectLights = true
    // this.renderer.setSize(innerWidth, innerHeight)
    this.renderer.setSize(innerWidth, innerHeight)
    this.renderer.setPixelRatio(window.devicePixelRatio)// 设置设备像素比
    this.renderer.toneMapping = ACESFilmicToneMapping // 尽管我们的贴图不是HDR，但使用tone mapping可以塑造更真实的效果。
    this.renderer.shadowMap.enabled = true// 场景中的阴影自动更新
    this.renderer.shadowMap.type = PCFSoftShadowMap // 设置渲染器开启阴影贴图，并将类型设为PCFSoftShadowMap
    this.renderer.outputEncoding = sRGBEncoding// 这下我们可以看到更亮的材质，同时这也影响到环境贴图。
    // 设置样式
    this.renderer.domElement.style.position = 'absolute'
    this.renderer.domElement.style.top = 0
    this.renderer.domElement.style.bottom = 0
    this.renderer.domElement.style.left = 0
    this.renderer.domElement.style.right = 0
    this.domThree.appendChild(this.renderer.domElement)// 一个canvas，渲染器在其上绘制输出。
    // 网页标签
    this.labelRenderer = new CSS2DRenderer()
    this.labelRenderer.setSize(innerWidth, innerHeight)
    this.labelRenderer.domElement.style.position = 'absolute'
    this.labelRenderer.domElement.style.top = 0
    this.labelRenderer.domElement.style.bottom = 0
    this.labelRenderer.domElement.style.left = 0
    this.labelRenderer.domElement.style.right = 0
    this.labelRenderer.domElement.style.pointerEvents = 'none'
    this.domThree.appendChild(this.labelRenderer.domElement)

    // 渲染相机
    this.camera = new PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 20000)
    this.camera.position.set(0, 5, 30)
    this.camera.lookAt(0, 0, 0)
    // window.addEventListener('resize', () => {
    //   this.camera.aspect = innerWidth / innerHeight//摄像机视锥体的长宽比，通常是使用画布的宽/画布的高
    //   this.camera.updateProjectionMatrix()//更新摄像机投影矩阵。在任何参数被改变以后必须被调用,来使得这些改变生效
    //   this.renderer.setSize(innerWidth, innerHeight)
    //   this.renderer.setPixelRatio(window.devicePixelRatio)//设置设备像素比
    //   //标签
    //   this.labelRenderer.setSize(innerWidth, innerHeight);
    // })
    // 渲染场景
    this.scene = new Scene()
    // 背景颜色
    this.scene.background = new Color('rgb(5,24,38)')
    // 控制器
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.enableDamping = true
    this.controls.maxPolarAngle = Math.PI * 0.46// 垂直轨道多远 上限
    this.controls.minPolarAngle = Math.PI * 0.3// 你可以垂直轨道多远，下限
    this.controls.screenSpacePanning = false // 定义平移时如何平移相机的位置 控制不上下移动
    // 全局调试器
    const that = this
    let num = 0

    // 模型批量动画
    this.mixer = new THREE.AnimationMixer(this.scene)
    this.clock = new Clock()
    this.isAnimate = true

    // 添加标签页

    function animate () {
      requestAnimationFrame(animate)
      // 跳过动画帧
      if (num % 30 === 0) {
        TWEEN.update() // 全局動畫
        that.controls.update()
        that.renderer.render(that.scene, that.camera)
        that.labelRenderer.render(that.scene, that.camera)
        // 模型动画
        if (that.isAnimate) that.mixer.update(that.clock.getDelta())// 动画更新 获取自 oldTime 设置后到当前的秒数
        // 全局的公共动画函数，添加函数可同步执行
        that.animateEventList.forEach(event => {
          event && event.fun(event.content)
        })
      } else {
        num++
      }
    }

    animate()
  }

  /**
   * 绘制一个2D效果的标签
   * @param text 显示内容
   * @param position 显示位置
   */
  addCssLabel (text) {
    const div = document.createElement('div')
    // div.style.visibility = 'show';
    div.innerHTML = text
    div.style.padding = '4px 10px'
    div.style.color = '#e31414'
    div.style.fontSize = '16px'
    div.style.position = 'absolute'
    div.style.top = '-20px'
    // div.style.backgroundColor = 'rgba(25,25,25,0.5)';
    div.style.borderRadius = '5px'
    div.style.pointerEvents = 'none'// 避免HTML标签遮挡三维场景的鼠标事件
    // div元素包装成为css2模型对象CSS2DObject
    const label = new CSS2DObject(div)
    // 设置HTML元素标签在three.js世界坐标中位置
    // label.position.set({ ...position });    // this.scene.add(label)
    return label
  }

  beforeDestroy () {
    this.scene.traverse((child) => {
      if (child.material) {
        child.material.dispose()
      }
      if (child.geometry) {
        child.geometry.dispose()
      }
      child = null
    })
    this.renderer.forceContextLoss()
    this.renderer.dispose()
    this.scene.clear()
  }

  /**
   * 添加全局的动画事件
   * @param animate 函数加参数对象
   * 传入对象 = {
            fun: 函数名称,
            content: 函数参数
        }
   */
  addAnimate (animate) {
    this.animateEventList.push(animate)
  }

  /**
   * 移除全局的动画事件
   * @param animate 函数加参数对象
   * 传入对象 = {
            fun: 函数名称,
            content: 函数参数
        }
   */
  removeAnimate (animate) {
    this.animateEventList.map((val, i) => {
      if (val === animate) this.animateEventList.splice(i, 1)
    })
  }

  createGrid () {
    // Grid
    const grid = new GridHelper(20, 20, 0xFF4500, 0x444444)
    grid.position.set(0, -3, 0)
    this.scene.add(grid)
  }

  createReflector () {
    // 创建圆形水平镜面，用于将胶囊体、甜圈圈、多面体小球映射到地面上
    const geometry = new PlaneGeometry(10000, 10000)
    const groundMirror = new Reflector(geometry, {
      clipBias: 0.00001
    })
    groundMirror.rotateX(-Math.PI / 2)
    this.scene.add(groundMirror)
  }

  createPlane () {
    const waterGeometry = new PlaneGeometry(1000, 1000)
    // 水平、垂直重复次数*
    const material = new MeshPhongMaterial({
      color: 0xFFFFFF
    })
    const mesh = new Mesh(waterGeometry, material)
    mesh.castShadow = true
    mesh.receiveShadow = true
    mesh.rotation.x = -Math.PI / 2
    this.scene.add(mesh)
  }

  createWater (size = [10000, 10000], position = [0, 0, 0], speed = 1) {
    const waterGeometry = new PlaneGeometry(size[0], size[1])
    this.water = new Water(
      waterGeometry, {
        textureWidth: 512,
        textureHeight: 512,
        waterNormals: new TextureLoader().load('/resources/textures/waternormals.jpg', function (texture) {
          texture.wrapS = texture.wrapT = THREE.RepeatWrapping
        }),
        waterColor: 0x001e0f,
        distortionScale: 3.7
      }
    )
    this.water.rotation.x = -Math.PI / 2
    this.water.position.set(position[0], position[1], position[2])
    this.water.material.uniforms.sunDirection.value.normalize()
    this.scene.add(this.water)
    this.addAnimate({
      fun: function run (water) {
        water.material.uniforms.time.value += speed / 1000
      },
      content: this.water
    })
  }

  /**
   * 转换点坐标为屏幕坐标
   * @param position Vector3点
   * @returns {{x: number, y: number}} 返回屏幕坐标
   * @constructor
   */
  WorldToScreen (position) {
    const worldVector = new Vector3(position.x, position.y, position.z)
    const vector = worldVector.project(this.camera)
    const halfWidth = innerWidth / 2
    const halfHeight = innerHeight / 2
    return {
      x: Math.round(vector.x * halfWidth + halfWidth),
      y: Math.round(-vector.y * halfHeight + halfHeight)
    }
  }

  startSelectEvent (isSelect, callback) {
    if (!this.mouseEvent) this.mouseEvent = new MouseEvent(this)
    this.mouseEvent.startSelect(this.renderer.domElement, isSelect, callback)
  }
}
