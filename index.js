const vm = require('vm')
const fs = require('fs')
const path = require('path')
const { JSDOM } = require('jsdom')
const React = require('react')
const ReactDOM = require('react-dom')
const ReactDOMServer = require('react-dom/server')

const { document } = new JSDOM().window

function loadUMDModule(filePath) {
  // 读取 UMD 文件内容
  const umdCode = fs.readFileSync(filePath, 'utf-8');

  // 创建一个新的上下文
  const context = {
    window: {},
    document,
    React,
    ReactDOM,
    module: { exports: {} },
    exports: {},
    require: (id) => {
      if (id === 'react') return require('react')
      if (id === 'react-dom') return require('react-dom')
    }
  };

  vm.runInNewContext(umdCode, context)

  console.log(`context: ${context}`);
  console.log('====================');

  return {
    component: context.module.exports.default,
    styles: context.document.head.innerHTML
  }
}

const { component, styles } = loadUMDModule('./oversea_ainvest-aime@1.0.1-beta.4.js');

console.log(`component: ${component}`);
console.log('====================');
console.log(`styles: ${styles}`);
console.log('====================');

// 使用 ReactDOMServer 渲染组件
const renderedComponent = ReactDOMServer.renderToString(React.createElement(component, {
  label: 'Hello SSR!',
}));

console.log(`renderedComponent: ${renderedComponent}`);
console.log('====================');

// 输出渲染结果到 HTML 文件
const outputPath = path.join(__dirname, 'output.html');
const htmlContent = `
  <!DOCTYPE html>
  <html lang="zh">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>UMD React Component</title>
      ${styles}
  </head>
  <body>
    <div id="root">${renderedComponent}</div>
  </body>
  </html>
  `;

fs.writeFileSync(outputPath, htmlContent);
console.log('结果已输出到 output.html');