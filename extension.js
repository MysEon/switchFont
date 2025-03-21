const vscode = require('vscode');
const fontList = require('font-list');

/**
 * 当扩展被激活时调用
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    console.log('插件 "switchfont" 已激活');

    // 注册命令
    let disposable = vscode.commands.registerCommand('switchfont.switchFont', async function () {
        try {
            // 获取系统字体列表
            const fonts = await getFontList();
            
            // 定义可修改的字体配置项
            const fontSettings = [
                { label: '编辑器字体', settingName: 'editor.fontFamily', current: getCurrentSetting('editor.fontFamily') },
                { label: '终端字体', settingName: 'terminal.integrated.fontFamily', current: getCurrentSetting('terminal.integrated.fontFamily') }
            ].filter(item => item.settingName !== null);

            
            // 让用户选择要修改的字体设置
            const selectedSetting = await vscode.window.showQuickPick(
                fontSettings.map(item => ({
                    label: item.label,
                    description: item.current ? `当前: ${item.current}` : '未设置'
                })),
                { placeHolder: '选择要修改的字体设置' }
            );

            if (!selectedSetting) return;

            const setting = fontSettings.find(item => item.label === selectedSetting.label);

            // 创建带有字体预览的字体选择项
            const fontItems = fonts.map(font => ({
                label: font,
                description: '系统字体',
                detail: `样例: AaBbCcDdEe 123456789 ${font}`
            }));

            // 添加搜索框让用户可以快速查找字体
            const selectedFont = await vscode.window.showQuickPick(
                fontItems,
                { 
                    placeHolder: `为${selectedSetting.label}选择一个字体 (输入以搜索)`,
                    matchOnDescription: true,
                    matchOnDetail: true
                }
            );

            if (!selectedFont) return;

            // 应用所选字体
            await updateFontSetting(setting.settingName, selectedFont.label);
            
            vscode.window.showInformationMessage(`已将${selectedSetting.label}设置为: ${selectedFont.label}`);
        } catch (error) {
            vscode.window.showErrorMessage(`设置字体时出错: ${error.message}`);
        }
    });

    // 注册一键设置所有字体的命令
    let switchAllFontsDisposable = vscode.commands.registerCommand('switchfont.switchAllFonts', async function () {
        try {
            // 获取系统字体列表
            const fonts = await getFontList();
            
            // 定义所有可修改的字体配置项
            const fontSettings = [
                { label: '编辑器字体', settingName: 'editor.fontFamily' },
                { label: '终端字体', settingName: 'terminal.integrated.fontFamily' }
            ].filter(item => item.settingName !== null);

            // 创建带有字体预览的字体选择项
            const fontItems = fonts.map(font => ({
                label: font,
                description: '系统字体',
                detail: `样例: AaBbCcDdEe 123456789 ${font}`
            }));

            // 让用户选择一个字体
            const selectedFont = await vscode.window.showQuickPick(
                fontItems,
                { 
                    placeHolder: '选择一个字体应用到所有区域 (输入以搜索)',
                    matchOnDescription: true,
                    matchOnDetail: true
                }
            );

            if (!selectedFont) return;

            // 应用所选字体到所有区域
            for (const setting of fontSettings) {
                await updateFontSetting(setting.settingName, selectedFont.label);
            }
            
            vscode.window.showInformationMessage(`已将${selectedFont.label}应用到所有区域`);
        } catch (error) {
            vscode.window.showErrorMessage(`设置字体时出错: ${error.message}`);
        }
    });

    // 注册调整字体大小的命令
    let adjustFontSizeDisposable = vscode.commands.registerCommand('switchfont.adjustFontSize', function () {
        const panel = vscode.window.createWebviewPanel(
            'fontSizeAdjuster',
            '调整编辑区字体大小',
            vscode.ViewColumn.One,
            {
                enableScripts: true
            }
        );

        // 获取当前字体大小设置
        const config = vscode.workspace.getConfiguration();
        const currentFontSize = config.get('editor.fontSize') || 14; // 默认值为14px

        // 设置WebView的HTML内容
        panel.webview.html = getWebviewContent(currentFontSize);

        // 处理WebView中的消息
        panel.webview.onDidReceiveMessage(
            async message => {
                if (message.command === 'updateFontSize') {
                    try {
                        const fontSize = message.fontSize;
                        const config = vscode.workspace.getConfiguration();
                        await config.update('editor.fontSize', fontSize, vscode.ConfigurationTarget.Global);
                    } catch (error) {
                        vscode.window.showErrorMessage(`调整字体大小时出错: ${error.message}`);
                    }
                }
            },
            undefined,
            context.subscriptions
        );
    });

    context.subscriptions.push(disposable, switchAllFontsDisposable, adjustFontSizeDisposable);
}

/**
 * 获取系统安装的字体列表
 * @returns {Promise<string[]>}
 */
async function getFontList() {
    try {
        const fonts = await fontList.getFonts();
        // 清理字体名称
        return fonts.map(font => font.replace(/"/g, '').trim());
    } catch (error) {
        console.error('获取字体列表错误:', error);
        throw new Error('无法获取系统字体列表');
    }
}

/**
 * 获取当前设置值
 * @param {string} settingName 设置名称
 * @returns {string|null} 当前设置值
 */
function getCurrentSetting(settingName) {
    const config = vscode.workspace.getConfiguration();
    return config.get(settingName);
}

/**
 * 更新特定的字体设置
 * @param {string} settingName 设置名称
 * @param {string} fontFamily 字体名称
 */
async function updateFontSetting(settingName, fontFamily) {
    const config = vscode.workspace.getConfiguration();
    await config.update(settingName, fontFamily, vscode.ConfigurationTarget.Global);
}

/**
 * 生成WebView的HTML内容
 * @param {number} currentFontSize 当前字体大小
 * @returns {string} HTML内容
 */
function getWebviewContent(currentFontSize) {
    return `<!DOCTYPE html>
    <html lang="zh-CN">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>调整字体大小</title>
        <style>
            body {
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 20px;
                font-family: var(--vscode-font-family);
                color: var(--vscode-foreground);
                background-color: var(--vscode-editor-background);
            }
            .container {
                width: 100%;
                max-width: 500px;
            }
            h1 {
                margin-bottom: 20px;
                text-align: center;
            }
            .control-group {
                margin-bottom: 30px;
                display: flex;
                flex-direction: column;
                align-items: center;
            }
            .slider-container {
                width: 100%;
                display: flex;
                align-items: center;
                margin-bottom: 10px;
            }
            input[type="range"] {
                flex: 1;
                height: 10px;
            }
            .value-display {
                width: 50px;
                text-align: center;
                margin-left: 15px;
                font-size: 16px;
                font-weight: bold;
            }
            .preview {
                padding: 20px;
                border: 1px solid var(--vscode-panel-border);
                margin-top: 20px;
                background-color: var(--vscode-editor-background);
                color: var(--vscode-editor-foreground);
                border-radius: 5px;
            }
            button {
                margin-top: 20px;
                padding: 8px 16px;
                background-color: var(--vscode-button-background);
                color: var(--vscode-button-foreground);
                border: none;
                border-radius: 2px;
                cursor: pointer;
            }
            button:hover {
                background-color: var(--vscode-button-hoverBackground);
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>调整编辑区字体大小</h1>
            <div class="control-group">
                <label>拖动滑块调整字体大小：</label>
                <div class="slider-container">
                    <input type="range" id="fontSizeSlider" min="6" max="72" value="${currentFontSize}" step="1">
                    <div class="value-display" id="fontSizeValue">${currentFontSize}px</div>
                </div>
                <div class="preview" id="preview" style="font-size: ${currentFontSize}px;">
                    这是预览文本，展示实际的字体大小效果。<br>
                    The quick brown fox jumps over the lazy dog.<br>
                    0123456789<br>
                    public class Main { public static void main(String[] args) { } }
                </div>
            </div>
        </div>

        <script>
            const vscode = acquireVsCodeApi();
            const fontSizeSlider = document.getElementById('fontSizeSlider');
            const fontSizeValue = document.getElementById('fontSizeValue');
            const preview = document.getElementById('preview');

            // 更新预览和显示的值
            function updatePreview() {
                const fontSize = fontSizeSlider.value;
                fontSizeValue.textContent = fontSize + 'px';
                preview.style.fontSize = fontSize + 'px';
                
                // 发送消息给扩展
                vscode.postMessage({
                    command: 'updateFontSize',
                    fontSize: parseInt(fontSize)
                });
            }

            // 添加事件监听器
            fontSizeSlider.addEventListener('input', updatePreview);
            
            // 初始化预览
            updatePreview();
        </script>
    </body>
    </html>`;
}

/**
 * 当扩展被停用时调用
 */
function deactivate() {}

module.exports = {
    activate,
    deactivate
}; 