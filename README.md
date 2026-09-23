# RayForge · 光线锻造炉

<p align="center">
  <a href="https://github.com/CJX0712/ray-forge/actions/workflows/ci.yml"><img src="https://github.com/CJX0712/ray-forge/actions/workflows/ci.yml/badge.svg" alt="ci"></a>
  <a href="https://github.com/CJX0712/ray-forge/releases"><img src="https://img.shields.io/github/v/release/CJX0712/ray-forge?sort=semver" alt="release"></a>
  <a href="https://github.com/CJX0712/ray-forge/blob/main/LICENSE"><img src="https://img.shields.io/github/license/CJX0712/ray-forge" alt="license"></a>
  <img src="https://img.shields.io/badge/author-%E6%99%A8%E6%98%9F-1f6feb" alt="author">
</p>

单文件离线光线追踪器。3 个漫反射球体 + 灰色地面 + 1 个方向光（含阴影），逐像素投射光线求交、Lambert 漫反射着色。相机沿 Y 轴环绕旋转，可实时观看。

> 没有 WebGL、没有外部库——纯 JavaScript 算每个像素的颜色。

## 功能

- **逐像素光线追踪**：球面/地面平面解析求交，最近命中着色
- **光照模型**：Lambert 漫反射 + 环境光 + 球体阴影（遮挡检测）
- **3 球体 + 地面场景**，相机 Y 轴环绕旋转（拖动或自动播放）
- **内置自检**：浏览器内一键验证相交几何与光照正确性

## 引擎验证（无头）

引擎逻辑抽离为纯函数，`_smoke.js` 在 Node 下做不变量校验，**11/11 全绿**：

- 球面相交距离：center(0,0,0) r=1，相机(0,0,5) 向前 → t=4
- 未命中 → Infinity
- 多球取最近（t=4 < t=7）
- 法线朝外（命中正面 N≈(0,0,1)）
- 光照：正面命中亮度 > 环境底色
- 地面平面相交：t=6
- 背景无命中返回底色
- 确定性：同场景同角度渲染像素完全一致
- 像素值域：全部 0..255
- 构图：中心比角落亮（球在画面中部）
- 旋转：不同角度 → 不同图像

```bash
node _smoke.js      # 引擎不变量测试
node _probe.js      # 生成 ASCII 灰度预览到 _probe.txt
```

## 使用

直接用浏览器打开 `index.html` 即可，零外部依赖、可离线运行。

## 许可

MIT — 见 [LICENSE](LICENSE)。
