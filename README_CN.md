# 重点

#如果前端编译前一点要先修改服务地址

**修改位置：**
```AEN_mobile\src\services\serverBase.js
  // 若未进入上面两种情况，则使用默认后端地址（直接访问，不使用代理）
  const DEFAULT_BASE = 'http://eqsuijiang.wicp.vip:47778';
  return DEFAULT_BASE;
}
```

```AEN_mobile\src\setupproxy.js
    const rawTarget = process.env.REACT_APP_SERVER_BASE || 'http://eqsuijiang.wicp.vip:47778';
```
# 使用 Create React App 入门

此项目是使用 [Create React App](https://github.com/facebook/create-react-app) 引导创建的。

## 可用脚本

在项目目录中，你可以运行以下命令：

### `npm start`

以开发模式运行应用程序。\
在浏览器中打开 [http://localhost:3000](http://localhost:3000) 查看。

当你进行更改时，页面会自动重新加载。\
你还可以在控制台中看到任何 lint 错误。

### `npm test`

以交互式监视模式启动测试运行器。\
有关更多信息，请参阅 [运行测试](https://facebook.github.io/create-react-app/docs/running-tests) 部分。

### `npm run build`

为生产环境构建应用程序到 `build` 文件夹。\
它会在生产模式下正确地打包 React，并优化构建以获得最佳性能。

构建是经过压缩的，文件名中包含哈希值。\
你的应用程序已准备好部署！

有关更多信息，请参阅 [部署](https://facebook.github.io/create-react-app/docs/deployment) 部分。

### `npm run eject`

**注意：这是一个单向操作。一旦你运行了 `eject`，就无法回退！**

如果你对构建工具和配置选项不满意，可以随时运行 `eject`。此命令会将所有配置文件和依赖项（如 Webpack、Babel、ESLint 等）复制到你的项目中，以便你完全控制它们。除了 `eject` 之外的所有命令仍然可以运行，但它们将指向复制的脚本，因此你可以根据需要进行调整。从这一点开始，你需要自己维护这些配置。

你不必使用 `eject`。推荐的功能集适用于小型和中型部署，你不需要在准备好之前使用此功能。然而，我们理解如果无法自定义配置，这个工具可能会显得不够实用。

## 了解更多

你可以在 [Create React App 文档](https://facebook.github.io/create-react-app/docs/getting-started) 中了解更多信息。

要学习 React，请查看 [React 文档](https://reactjs.org/)。

### 代码分割

此部分已移至：[https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### 分析包大小

此部分已移至：[https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### 制作渐进式 Web 应用程序

此部分已移至：[https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### 高级配置

此部分已移至：[https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### 部署

此部分已移至：[https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` 无法压缩

此部分已移至：[https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)