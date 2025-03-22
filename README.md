# Switch Font (字体切换器)

这是一个轻松切换VS Code中各种字体设置的插件。

## 功能特点

- 自动读取系统中已安装的所有字体
- 支持切换多种不同场景的字体设置，包括：
  - 编辑器字体
  - 终端字体
- 支持一键设置所有区域的字体
- 提供滑块控件实时调整编辑区字体大小
- 支持一键设置所有区域的字体
- 测试测试测试测试测试的是测试

## 使用方法

1. 按下 `Ctrl+Shift+P`（Windows/Linux）或 `Cmd+Shift+P`（Mac）打开命令面板
2. 输入 "Switch Font" 找到以下命令：

   - "Switch Font: 切换字体" - 单独设置某个区域的字体
   - "Switch Font: 一键设置所有字体" - 一次性设置所有区域的字体
   - "Switch Font: 调整编辑区字体大小" - 通过滑块实时调整字体大小
3. 从列表中选择一个系统已安装的字体，或使用滑块调整字体大小
4. 555

## 扩展设置

此扩展直接修改以下VSCode设置：

- `editor.fontFamily`
- `terminal.integrated.fontFamily`
- `editor.fontSize`

## 本地开发

1. 克隆此仓库
2. 运行 `npm install`
3. 按下 F5 启动调试会话

## 持续集成/部署

该项目使用 GitHub Actions 进行自动化构建和发布：

- 推送到 `master` 分支时，会自动打包扩展并创建 GitHub Release
- 当 Release 创建后，会自动发布到 VS Code 扩展市场

## 许可证

MIT
