# pdf-builder
用于将网页文档转换为 PDF文档的工具,目前已经包含了`vue`、`laravel`、`webpack`中文PDF文档的构建demo。

## 环境要求

- node.js环境(建议最新版本)
- ebook-convert工具

> ebook-convert工具安装方法:
> 安装[calibre](https://calibre-ebook.com/download) , 其安装目录下, 有一个 `ebook-convert.exe`，把此文件所在的目录
> 加入系统 `path` 环境变量即可。
>

## 使用方法

```bash
# 安装项目依赖(只需要在安装时执行)
npm install
# 编译项目(只需执行一次,除非修改了代码)
npm run build
# 启动server
npm run serve
# 然后用浏览器打开 http://localhost:5006/
# 根据提示进行即可
```

## 扩展方式

`tool/project/` 下的每个文件夹代表一个项目。

`fetch.js` 为在浏览器控制台下执行的抓取脚本

`main.js` 为服务端保存文档的node模块

