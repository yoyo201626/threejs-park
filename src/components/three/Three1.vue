<template>
  <div class="scene">
    <div id="jindu-text-con">
      正在加载模型请稍等：<span id="jindu-text"></span>
      <div class="jindu-con">
        <div id="jindu"></div>
      </div>
    </div>
    <video id="videoContainer" style="position:absolute;top:0px;left:0px;z-index:100;visibility: hidden"></video>
    <div class="scene" id="viewer-container"></div>
  </div>

</template>

<script>
import modules from "./modules/index.js";
import * as dat from 'dat.gui';
import * as THREE from "three";
import gsap from "gsap";
import fragment from "./shaders/fragment.js";
import fragmentGress from "./shaders/fragmentGress.js";
import vertex from "./shaders/vertex.js";

const gui = new dat.GUI();
export default {
  name: "Three",
  mounted() {
    this.init();
  },
  destroyed() {
    console.log(1111333)
  },
  methods: {
    init() {
      let jindu_text_con = document.getElementById('jindu-text-con');
      let jindu_text = document.getElementById('jindu-text');
      let jindu = document.getElementById('jindu');

      let model
      let viewer = new modules.Viewer('viewer-container') //初始化场景
      // viewer.scene.overrideMaterial = new THREE.MeshLambertMaterial({color : 0xF39600,wireframe:true });
      viewer.addAxis()
      let labels = new modules.Labels(viewer) //初始化场景
      let skyBoxs = new modules.SkyBoxs(viewer)//添加天空盒和雾化效果
      skyBoxs.addSkybox(0)
      viewer.camera.position.set(17, 10, 46) //设置相机位置
      let lights = new modules.Lights(viewer)
      let ambientLight = lights.addAmbientLight()
      lights.addDirectionalLight() //添加平行光
      let modeloader = new modules.ModelLoder(viewer)
      let uniforms = {
        iTime: {value: 1.0},
        iResolution: {
          value: new THREE.Vector2(1, 1)
        }
      }
      let texture1 = new THREE.TextureLoader().load('hongqi.png');
      modeloader.loadModelToScene('city1.glb', _model => {
        model = _model
        model.openCastShadow()
        model.openReceiveShadow()
        console.log(model)
        model.forEach(item => {
          item.material = new THREE.MeshPhongMaterial({
            side: THREE.DoubleSide,
            map: texture1,
          })
          //添加着色器材质
          // item.material = new THREE.ShaderMaterial({
          //   vertexShader: vertex,
          //   fragmentShader: fragment,
          //   uniforms: uniforms,
          //   side: THREE.DoubleSide,
          //   transparent: true, // 设置为true，opacity才会生效
          //   opacity: 0.1,
          //   depthWrite: false, // 不遮挡后面的模型\
          //   depthTest: true,
          //   renderDepth: -2,
          //   alphaTest:false
          // })
          // viewer.addAnimate({
          //   fun: (uniforms) => {
          //     uniforms.iTime.value += 0.1;
          //   },
          //   content: item.material.uniforms
          // })
        })
      }, (progress) => {
        progress = Math.floor(progress * 100)
        jindu_text.innerText = progress + '%';
        jindu.style.width = progress + '%'
        if (progress === 100) {
          jindu_text_con.style.display = 'none'
        }
      }, (error) => {
        console.log(error)
      })

      //创建球
      let sphere = new THREE.Mesh(
        new THREE.SphereGeometry(10, 32, 32),
        new THREE.MeshBasicMaterial({
          side: THREE.DoubleSide,
          map: texture1
        })
      );
      viewer.addAnimate({
        fun: (uniforms) => {
          uniforms.iTime.value += 0.1;
        },
        content: sphere.material.uniforms
      })
      console.log(sphere)
      sphere.castShadow = true;
      sphere.position.set(0, 10, 0);
      viewer.scene.add(sphere);
    },
  },
}
</script>

<style>
.scene {
  width: 100%;
  height: 100%;
}

.label {
  padding: 20px;
  background: rgba(18, 213, 139, 0.54);
  color: aliceblue;
  border-radius: 5px;
}

/*创建动画*/
@keyframes myfirst {
  0% {
    transform: translateX(0px);
  }
  100% {
    transform: translateX(300px);
  }
}

.jindu-con {
  width: 300px;
  height: 10px;
  border-radius: 50px;
  background-color: white;
  margin-top: 10px;
  overflow: hidden;
}

#jindu {
  height: inherit;
  background-color: #007bff;
  width: 0;
}

#jindu-text-con {
  width: 300px;
  position: absolute;
  left: 0;
  right: 0;
  margin: 0 auto;
  top: 15%;
  text-align: center;
  background-color: rgba(255, 255, 255, .5);
  padding: 10px;
}
</style>
