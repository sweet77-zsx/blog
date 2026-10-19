---
title: Windows 下 Nginx 下载安装部署教程（实测有效）
description: Windows 环境下 Nginx 稳定版下载、解压安装、命令行启动验证与常见端口冲突排查教程
date: 2024-04-23
tags:
  - Windows
  - Nginx
  - Web服务器
  - 部署
---

# Windows 下 Nginx 下载安装部署教程（实测有效）

### 前言

* * *

> **什么是 Nginx?（详细介绍）**  
> NGINX 是一个开源的 Web 服务器和反向代理服务器，它使用 Nginx 作为 Web 服务器和反向代理服务器的原因是它拥有高性能、可扩展性和可靠性。它可以处理大量的并发连接，并且可以缓存 HTTP 请求以提高性能。

**Nginx 具有以下功能:** 

> 1.  **高并发处理能力**：Nginx 采用异步非阻塞的事件驱动架构，可以支持大量并发连接，快速响应客户端请求。
> 2.  **反向代理功能**：Nginx 可以作为反向代理服务器，接受 Internet 上的连接请求，然后将请求转发到内部网络上的服务器，并将结果返回给请求的客户端。这使得外部网络无法直接访问真实的服务器，增加了安全性。
> 3.  **负载均衡器**：Nginx 能够在多个 Web 服务器之间进行负载均衡，提高系统的可靠性和可用性。通过多种负载均衡策略，Nginx 可以将流量合理分配到后端服务器，防止单点过载。
> 4.  **低资源消耗**：Nginx 在运行时占用的内存资源较少，适合在硬件资源有限的环境下部署，有助于降低硬件成本。
> 5.  **HTTP 缓存**：Nginx 可以缓存静态文件，如图片、CSS 和 JavaScript 文件，从而减少对后端服务器的请求，加快网页加载速度。
> 6.  **SSL/TLS 加密**：Nginx 支持 SSL/TLS 协议，可以为网站提供安全的 HTTPS 服务，保障数据传输的安全性。
> 7.  **灵活的配置**：Nginx 具有高度模块化的设计，用户可以根据需要灵活配置，满足不同的应用场景需求。
> 8.  **社区支持**：Nginx 拥有一个活跃的开发和用户社区，提供丰富的文档和第三方模块，方便用户扩展和定制功能。

**Nginx 具有以下优点:**

> **高性能：**NGINX 可以处理大量的并发连接，并且可以将请求缓存以提高性能。  
> **可扩展性：**NGINX 可以轻松地扩展以处理更多的请求，并且支持多种插件和模块。
> 
> **可靠性：**NGINX 具有高可靠性，可以在没有管理员干预的情况下自动处理故障和恢复。  
> **易于配置：**NGINX 的配置非常简单，并且提供了丰富的文档和教程来帮助用户快速上手。

综上所述，Nginx 以其高性能、稳定性、低资源消耗和丰富的功能，成为许多互联网公司和网站的首选 服务器 软件。无论是作为 Web 服务器直接提供服务，还是作为反向代理和负载均衡器辅助其他服务器处理请求，Nginx 都能提供优秀的性能和可靠的服务。

### **下载并安装**

* * *

#### Windows 环境下载

###### 1. 打开 nginx 官网并点击右侧的 download，[nginx](http://nginx.org/en/index.html "nginx")

![Windows Nginx 安装部署截图](/posts/windows-nginx/img-0.png)

######  2. 选择稳定版本（windows） 

![Windows Nginx 安装部署截图](/posts/windows-nginx/img-1.png)

###### 3. 下载完成后解析到指定的文件夹，这里推荐不要放在 C 盘，我本人一般放在 D 盘。

![Windows Nginx 安装部署截图](/posts/windows-nginx/img-2.png)

### 启动 nginx 服务器

* * *

windows 下有多种启动的方式，这里举例比较常用的两种。

**1. 使用命令行启动**

打开 nginx 的安装目录，见上图，然后双击文件地址，输入 cmd，这样可以快捷进行 文件路径 的 cmd 界面。

![Windows Nginx 安装部署截图](/posts/windows-nginx/img-3.png)

输入 start nginx.exe(注意：回车确认是会出现一闪，这是正常现象）

![Windows Nginx 安装部署截图](/posts/windows-nginx/img-4.png)

**2. 直接点击 nginx.exe 文件**

点击完同样会出现一闪而过，正常现象。

![Windows Nginx 安装部署截图](/posts/windows-nginx/img-5.png)

* * *

### 验证 Nginx 是否启动成功

###### 打开我们的浏览器访问 nginx 默认的 http://localhost:80 或 127.0.0.1:80，默认端口号是 80，出现 Welcome to nginx! 就说明部署成功了！ 

![Windows Nginx 安装部署截图](/posts/windows-nginx/img-6.png)
