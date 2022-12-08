import Viewer from './Viewer'
import SkyBoxs from './SkyBoxs'
import ModelLoder from './ModelLoder'
import DsModel from './DsModel'
import Weather from './Weather'
import AnimatedTracks from './AnimatedTracks'
import Lights from './Lights'
import MouseEvent from './MouseEvent'
import Labels from './Labels'
import PathLine from './PathLine'
import Floors from './Floors'
import EffectComposer from './EffectComposer'

const modules = {
  Viewer, // 场景初始化
  SkyBoxs, // 天空盒
  ModelLoder, // 模型加载，现在主要是针对Gltf或者glb
  DsModel, // 模型功能,
  Lights, // 灯光管理
  Weather, // 天气控制
  AnimatedTracks, // 模型动画
  MouseEvent, // 鼠标事件
  Labels, // 场景标签
  PathLine, // 路线标签
  Floors, // 场景地板
  EffectComposer, // 后期处理
}

export default modules
