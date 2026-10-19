---
title: Linux 下 Redis 下载及安装教程（实测有效）
description: 在 Linux 系统下从源码编译安装 Redis 6.2.11、配置 gcc 依赖、设置后台运行与远程连接权限完整指南
date: 2024-05-07
tags:
  - Linux
  - Redis
  - 中间件
  - 数据库
---

# Linux 下 Redis 下载及安装教程（实测有效）

##  一、配置 gcc
---------

由于 Redis 是基于 c 语言编写的需要安装依赖, 需要 安装 gcc ，在 Linux 系统里需要存在 C 语言的编译环境，一般的 Linux 系统安装的时候会自动安装，由于我是最小安装模式，所以我需要自己再另外安装一下。

> 判断系统是否安装 gcc，输入命令 gcc --version, 如果显示未找到命令，则需要安装。

![Redis安装配置流程](/posts/linux-redis/img-0.png)

> 未安装的话输入命令安装 yum install gcc

> 安装完成后再次输入 gcc --version 进行验证 

![Redis安装配置流程](/posts/linux-redis/img-1.png)

二、下载 Redis
----------

#### 1. 安装前需要先准备 redis 安装包，这里示范所选择安装的 redis 版本为 6.2.11

[Redis 官网链接](https://redis.io/download/ "Redis官网链接")

[redis-6.2.11 直接下载地址](https://download.redis.io/releases/redis-6.2.11.tar.gz "redis-6.2.11直接下载地址")

#### 2. 下载后通过 xftp 传输到 Linux 上

新建一个 redis 的 文件夹 ，我放在 usr/local/redis / 下

```bash
mkdir /usr/local/redis/
```

通过 xftp 传输到 Linux 上

![Redis安装配置流程](/posts/linux-redis/img-2.png)

![Redis安装配置流程](/posts/linux-redis/img-3.png)

三、在 Linux 上安装 Redis
-------------------

#### 1. 解压 redis 安装包

解压 redis 安装包

```bash
tar -zxvf redis-6.2.11.tar.gz
```

#### 2. 查看目录结构

![Redis安装配置流程](/posts/linux-redis/img-4.png)

#### 3.make 编译

> 到 redis 文件夹下输入命令 make

![Redis安装配置流程](/posts/linux-redis/img-5.png)

注意：如果执行 make 命令这里报错: cc not found (cc 未找到命令), 原因就是因为 Linux 上缺少 gcc, 执行命令进行安装即可:

```bash
yum install gcc
```

等待一会即可编译完成。

![Redis安装配置流程](/posts/linux-redis/img-6.png)

#### 4. 安装 redis

执行下面命令安装 redis, 并指定安装目录

```bash
make install PREFIX=/usr/local/redis/redis-6.2.11
```

安装成功

![Redis安装配置流程](/posts/linux-redis/img-7.png)

* * *

 四、配置 redis 服务
--------------

#### 1. 启动 redis 服务

进入刚刚 make install 的 redis 安装目录, 并执行下面命令启动 redis 服务

```bash
./bin/redis-server redis.conf
```

![Redis安装配置流程](/posts/linux-redis/img-8.png)

#### 2. 修改 redis 配置文件  
注意: 以上面这种启动方法启动 redis 不能退出控制台, 如果退出, 那么 redis 服务也会停止。

如果想要让 redis 以后台的方式运行，需要修改 redis 中的配置文件：redis.conf

将该配置文件中的 daemonize no 改为 yes 即可。

```bash
vim redis.conf
```

![Redis安装配置流程](/posts/linux-redis/img-9.png)

![Redis安装配置流程](/posts/linux-redis/img-10.png)修改完配置文件后, 重新启动一下 redis 服务

```bash
./bin/redis-server redis.conf
```

这个时候就不会一直处在运行界面上，而是后台运行了。

![Redis安装配置流程](/posts/linux-redis/img-11.png)

注意: 如果需要在其他主机连接 redis，利用使用桌面软件连接 redis 时, 记得要修改 redis.conf 配置文件, 要注释掉 , 即配置了允许所有主机连接。

找到 bind 127.0.0.1 将这一行注掉，新加一行 bind 0.0.0.0，为了能够远程连接 redis。

![Redis安装配置流程](/posts/linux-redis/img-12.png)

修改完后记得重启 redis 服务使配置文件生效。

3. 测试 redis 服务

进行 redis 客户端模式，并进行测试。

![Redis安装配置流程](/posts/linux-redis/img-13.png)

可以看到测试成功, 至此 redis 服务器就正式安装好了。
