/**
 * @Author: wangrui
 * 炫景 - Dazzling Scene
 * @Date: 2022-06-15 16:45:45
 */
import * as Three from 'three'
import modules from './modules'
/**
 * 初始化库
 * @type {{author: string, version: string, threeJSLoaded: boolean}}
 */
const DS = {
  version: '1.0.0',
  author: 'mrfoxWang',
  threeJSLoaded: false
}

/**
 * 初始化函数
 * @param callback 资源加载完毕
 * @constructor
 */
DS.Ready = (callback) => {
  if (DS.threeJSLoaded) {
    callback && callback()
  } else {
    DS.threeJSLoaded = true
    DS.THREE = Three
    console.log(modules)
    // 挂接对象属性
    for (const k in modules) {
      console.log(k)
      DS[k] = modules[k]
    }
    callback && callback()
  }
}

/**
 * 返回UUID
 * @returns {string}
 */
DS.uuid = () => {
  const S4 = function () {
    return ((1 + Math.random()) * 0X10000 | 0).toString(16).substring(1)
  }
  return (S4() + S4() + '-' + S4() + '-' + S4() + '-' + S4() + '-' + S4() + S4() + S4())
}

export default DS
