

# pdf-builder

用于将网页文档转换为 PDF文档的工具。

## 环境要求

- node.js环境(建议最新版本)
- ebook-convert工具

> ebook-convert工具安装方法:
> 安装[calibre](https://www.calibre-ebook.com/download) 其安装目录下, 有一个 `ebook-convert.exe`，把此文件所在的目录
> 加入系统 `path` 环境变量即可。

## 使用方法

```bash
# 以pnpm工具运行命令example
# 安装项目依赖(只需要在安装时执行)
pnpm install
# 启动server
pnpm run dev
# 然后用浏览器打开 http://127.0.0.1:5173
# 根据提示进行即可
```

## 目录结构说明

- src  vue3 + vite前端源码
- dist 前端编译处理后的目录
- server 后端代码(http + socket.io)
- output 制作的pdf文档输出目录

## 扩展方式

`server/projects/` 下的每个文件夹代表一个项目。

`main.js` 文档相关信息。

`fetch.js` 为在浏览器控制台下执行的抓取脚本。

