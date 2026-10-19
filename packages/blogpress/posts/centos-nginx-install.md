---
title: Linux 系统 (CentOS) 下安装配置 Nginx 超详细图文教程
description: CentOS 系统下 Nginx 源码编译安装、依赖环境配置、常用启停管理命令与防火墙放行超详细图文教程
date: 2024-05-08
tags:
  - Linux
  - CentOS
  - Nginx
  - 运维部署
---

# Linux 系统 (CentOS) 下安装配置 Nginx 超详细图文教程

## ###  **一、下载并安装**

* * *

#### 1. 打开 nginx 官网并点击右侧的 download，[Nginx 官网下载地址](https://nginx.org/en/download.html "Nginx官网下载地址")

![Nginx安装配置截图](/posts/linux-nginx/img-2.png)

######  2. 选择稳定版本

![Nginx安装配置截图](/posts/linux-nginx/img-3.png)

我放在 **/usr/local/nginx/** 下，新建文件夹

```bash
mkdir /usr/local/nginx/

```

通过 xftp 传输到 Linux 的服务器上，这里方法不过多复述。

![Nginx安装配置截图](/posts/linux-nginx/img-4.png)

 或者如果 Linux 联网，直接在 Linux 服务上使用 wget 命令把 Nginx 安装包下载到 **/usr/local/nginx/** 目录中

```bash
wget -c http://nginx.org/download/nginx-1.24.0.tar.gz
```

二、安装 Nginx 
-----------

#### 2.1、安装 Nginx 相关依赖

使用 yum 命令安装

```bash
yum install -y gcc-c++	zlib zlib-devel	openssl openssl-devel pcre pcre-devel
```

#### 2.2、安装 Nginx

找到 Nginx 的安装包进行解压

```bash
tar -zxvf nginx-1.24.0.tar.gz
```

解压后的文件目录 

![Nginx安装配置截图](/posts/linux-nginx/img-5.png)

在此目录下执行配置脚本，--prefix 是指定安装目录

```bash
./configure --prefix=/usr/local/nginx
```

**如果遇到报错 “./configure: error: C compiler cc is not found”，如下图**

![Nginx安装配置截图](/posts/linux-nginx/img-6.png)

解决：

```bash
yum -y install gcc gcc-c++ autoconf automake make

```

#### 编译安装

####  2.3、启动 Nginx

进入到 nginx 安装目录下，注意是上面 2.2 步骤里面 --prefix 指定的目录：

![Nginx安装配置截图](/posts/linux-nginx/img-7.png)

常用的启动命令：

```
# /usr/local/nginx/sbin/nginx

/usr/local/nginx/sbin/nginx -c /usr/local/nginx/conf/nginx.conf

/usr/local/nginx/sbin/nginx -s stop

/usr/local/nginx/sbin/nginx -s reload

/usr/local/nginx/sbin/nginx -s quit
```

查询 nginx 是否启动：

```bash
ps -ef | grep nginx

```

访问 nginx 页面：

在浏览器中输入 ip + 端口号访问（端口默认 80）

出现这个页面就是安装成功了。

![Nginx安装配置截图](/posts/linux-nginx/img-8.png)

如果浏览器访问不通，请检查是否开启防火墙限制，将防火墙关闭或将端口加入到防火墙白名单中，这里 nginx 的默认端口为 80。

```
#将80端口加入到防火墙放行白名单中，并重载防火墙
```

或者直接关闭防火墙 

```bash
systemctl stop firewalld.service

systemctl disable firewalld.service
```

设置 nginx 的开机启动

```bash
/usr/local/nginx/sbin/nginx
```
