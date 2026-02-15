# 2026 丙午马年跨年倒计时与祈福 Web 项目

## 项目概括
本项目旨在开发一个极具视觉冲击力的现代 Web 页面，用于 2026 年（丙午马年）的跨年倒计时与在线祈福。项目融合了高性能 Canvas 粒子烟花特效、极致的 Glassmorphism（毛玻璃）UI 风格以及精确的倒计时逻辑，为用户提供沉浸式的迎新体验。

## 技术选型
- **核心语言**: HTML5, CSS3, JavaScript (ES6+)
- **样式框架**: Tailwind CSS (CDN 引入) + 自定义 CSS (处理复杂视觉特效)
- **动画引擎**: GSAP (GreenSock Animation Platform, CDN 引入)
- **图形渲染**: Native Canvas API (高性能 2D 上下文)
- **字体/图标**: 系统默认无衬线字体，配合 Emoji 或 SVG

## 项目结构 / 模块划分
- `root`
  - `index.html`: 项目入口，DOM 结构，CDN 资源引入
  - `styles.css`: 全局样式，Tailwind 补充样式，毛玻璃特效，动画关键帧
  - `FireworksEngine.js`: 独立的高性能 Canvas 烟花粒子引擎类 (Core Module 1)
  - `main.js`: 业务逻辑入口，倒计时管理，UI 交互绑定，初始化 (Core Module 3)

## 核心功能 / 模块详解
- **FireworksEngine (视觉核心)**
  - 高性能粒子池 (Object Pooling) 支持 2000+ 粒子同屏。
  - 多点发射机制，形成“烟花森林”。
  - 国潮配色：赤金 (#D4AF37)、朱砂红 (#FF4500)、琉璃金。
  - 交互特效：点击爆破 (Click to Burst)、鼠标跟随火星轨迹 (Mouse Trail)。
  
- **UI & UX (界面体验)**
  - 深邃红黑渐变背景。
  - 极致 Glassmorphism 卡片设计 (Blur 16px, 1px 高光描边)。
  - GSAP 驱动的平滑进场与交互动画。
  - 响应式布局，确保文字在绚烂背景下的可读性。

- **Countdown & Logic (业务逻辑)**
  - 目标时间：2026 年 2 月 17 日 00:00:00 (农历正月初一)。
  - 实时倒计时 (天/时/分/秒)，通过 GSAP 实现数字跳动缩放。
  - **迎新彩蛋**: 倒计时归零时触发“全屏狂欢模式”及文案变更。
  - **互动抽签**: “点燃好运”按钮，随机展示马年祝福语并触发庆祝烟花。

## 技术实现细节
- **Canvas 粒子引擎**: 采用对象池（Object Pool）模式，预分配 3000 个粒子对象，避免频繁 GC 导致的掉帧。使用 `rgba(0,0,0,0.15)` 覆盖层实现丝滑的粒子拖尾。
- **视觉层级**: Z-index 0 为 Canvas 层，Z-index 10 为 UI 层。UI 层通过 `pointer-events: none` 允许交互穿透到 Canvas，同时内部按钮通过 `pointer-events: auto` 找回交互。
- **跨年逻辑**: 使用原生 `Date` 对象计算差值，GSAP 负责数字跳动时的 `scale` 和 `opacity` 插值，增加打击感。
- **响应式布局**: 结合 Tailwind 的 `clamp` 字号和 Flexbox 适配各种屏幕尺寸。

## 开发状态跟踪
| 模块/功能 | 状态 | 负责人 | 计划完成日期 | 实际完成日期 | 备注 |
|---|---|---|---|---|---|
| 基础文件结构 (index.html, styles.css) | 已完成 | AI | 2026-02-16 | 2026-02-16 | 样式已锁定 Glassmorphism |
| FireworksEngine.js (粒子引擎) | 已完成 | AI | 2026-02-16 | 2026-02-16 | 支持 3000+ 粒子 |
| main.js (倒计时与交互逻辑) | 已完成 | AI | 2026-02-16 | 2026-02-16 | 包含马年祝福语池 |
| 整体集成与视觉微调 | 已完成 | AI | 2026-02-16 | 2026-02-16 | 最终调优完毕 |

## 代码检查与问题记录
[暂无]
