

# pdf-builder

用于将网页文档转换为 PDF文档的工具。

## 环境要求

- node.js环境(建议最新版本)
- ebook-convert工具

> ebook-convert工具安装方法:
> 安装[calibre 3.48.0](https://download.calibre-ebook.com/) (高版本不能保存远程图片资源), 其安装目录下, 有一个 `ebook-convert.exe`，把此文件所在的目录
> 加入系统 `path` 环境变量即可。

## 使用方法

```bash
# 以pnpm工具运行命令example
# 安装项目依赖(只需要在安装时执行)
pnpm install
# 编译项目(只需执行一次,除非修改了代码)
pnpm run build
# 启动server
pnpm run server
# 然后用浏览器打开 http://127.0.0.1:3000/
# 根据提示进行即可
```

## 目录结构说明

- src  vue3 + vite前端源码
- dist 前端编译处理后的目录
- server 后端代码(express + socket.io)
- output 制作的pdf文档输出目录

## 扩展方式

`server/projects/` 下的每个文件夹代表一个项目。

`main.js` 文档相关信息。

`fetch.js` 为在浏览器控制台下执行的抓取脚本。

