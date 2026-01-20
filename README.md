# Stab - 极简智能新标签页 (Minimalist Intelligent New Tab)

Stab 是一个基于 React + Vite + TypeScript 构建的 Chrome 新标签页扩展。它主打极简设计、智能网络环境检测和高度可定制化。

## ✨ 主要功能

### 1. 🎯 极简与美观
- **毛玻璃 UI 设计**：现代化的视觉体验，适应各种壁纸。
- **自定义壁纸**：支持上传本地图片或使用网络图片作为背景。
- **右键菜单**：在桌面任意位置右键即可呼出快捷菜单，进行个性化设置。

### 2. 🌐 智能网络环境切换
- **自动检测**：利用 Chrome 后台服务（Background Worker）自动检测当前网络环境（如内网/公网）。
- **多环境配置**：
  - 支持配置多个网络环境（内网、外网等）。
  - 可自定义检测 URL 和检测超时时间。
  - 支持拖拽排序网络环境优先级。
- **智能应用显示**：根据当前网络环境，自动高亮可用应用或切换应用链接。

### 3. 📱 应用管理
- **快捷添加**：轻松添加常用网站快捷方式。
- **图标自动获取**：提供三种图标获取策略，解决图标获取难题：
  - **Google Favicon**：使用 Google 服务获取。
  - **Direct /favicon.ico**：直接尝试获取网站根目录图标。
  - **Chrome Favicon API**：利用 Chrome 扩展权限获取（权限更广）。
- **拖拽排序**：自由拖拽调整应用图标位置。

### 4. 🧩 实用小组件
- **天气组件**：实时显示当地天气。
- **倒计时组件**：重要日期提醒。
- **网络状态组件**：实时显示当前网络延迟和环境。
- **快捷复制**：一键复制常用文本。

## 🚀 如何安装到 Chrome

1. **构建项目**：
   确保你已经安装了 Node.js，然后在项目根目录运行：
   ```bash
   npm install
   npm run build
   ```
   这将生成 `dist` 目录。

2. **加载扩展**：
   - 打开 Chrome 浏览器，访问 `chrome://extensions/`
   - 打开右上角的 **"开发者模式" (Developer mode)** 开关。
   - 点击左上角的 **"加载已解压的扩展程序" (Load unpacked)**。
   - ⚠️ **重要**：选择项目目录下的 **`dist`** 文件夹（例如 `F:\Documents\project\stab\dist`）。

## 🛠️ 开发指南

### 环境要求
- Node.js >= 16
- npm or yarn or pnpm

### 常用命令

- **启动开发服务器** (Web 预览模式):
  ```bash
  npm run dev
  ```
  *注意：Web 预览模式下，部分 Chrome 扩展特有 API（如 `chrome.runtime`）不可用，网络检测功能可能受限。*

- **构建生产版本**:
  ```bash
  npm run build
  ```
  每次修改代码后，都需要重新运行此命令，并在 Chrome 扩展页面点击刷新按钮。

### 项目结构

- `src/components`: React 组件
- `src/hooks`: 自定义 Hooks (如 `useNetworkStatus`)
- `public/background.js`: Chrome 扩展后台脚本 (处理网络检测等跨域任务)
- `public/manifest.json`: Chrome 扩展配置文件

## 📝 常见问题

**Q: 为什么网络检测在开发预览模式下报错？**
A: 真正的网络检测使用了 Chrome Extension 的 Background Service Worker 来绕过 CORS 限制，这在普通的 Web 页面（`npm run dev`）中无法运行。请构建后在 Chrome 扩展环境中测试。

**Q: 图标显示不出来怎么办？**
A: 编辑应用时，尝试点击 "Chrome API" 或 "Google" 按钮来尝试不同的图标获取源。
