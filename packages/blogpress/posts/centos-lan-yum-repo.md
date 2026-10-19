---
title: 内网环境福音：CentOS 局域网 YUM 源搭建全指南（有外网 / 无外网双方案）
description: 本文介绍在有外网和无外网环境下搭建 CentOS 局域网 YUM 源的完整方案，涵盖 HTTP 共享仓库与本地离线部署方法，解决内网服务器软件安装与系统更新难题，提升企业 Linux 运维效率。
date: 2025-12-09
tags:
  - CentOS
  - Linux
  - 运维
  - YUM
---

# 内网环境福音：CentOS 局域网 YUM 源搭建全指南（有外网 / 无外网双方案）

在企业级 Linux 运维场景中，很多现场服务器处于纯内网环境，无法直接访问外网 YUM 源，导致系统包更新、软件安装等操作举步维艰；即便部分服务器能连通外网，也可能因官方源速度慢、版本老旧影响运维效率。针对这些痛点，本文整理了一套完整的**局域网 YUM 源搭建方案**，分别适配“有外网”和“无外网”两种场景，帮助运维人员实现内网服务器的高效包管理。

---

## 一、前期准备：关闭 SELINUX（必做步骤）

无论是哪种搭建场景，首先需要关闭 SELINUX，避免其对后续操作产生权限限制：

1. **查询 SELINUX 状态**
   ```bash
   getenforce
   ```

2. **临时关闭**（无需重启，立即生效）
   ```bash
   setenforce 0
   ```

3. **永久关闭**（修改配置文件，需重启服务器生效）
   ```bash
   vim /etc/selinux/config
   ```
   将配置项 `SELINUX=enforcing` 改为 `SELINUX=disabled`，保存后重启服务器即可永久关闭。

---

## 二、场景一：有外网服务器搭建局域网 YUM 源

此方案适用于有一台可连通外网的服务器，可通过同步外网源包搭建内网 YUM 仓库，供其他内网服务器使用。

### 1. 配置国内 YUM 源（提升同步速度）

1. **先备份历史 YUM 源，避免冲突**
   ```bash
   sudo mv /etc/yum.repos.d/* /root/
   ```

2. **下载阿里云 CentOS 7 YUM 源**（无 wget 可换 curl）
   ```bash
   wget -O /etc/yum.repos.d/CentOS-Base.repo https://mirrors.aliyun.com/repo/Centos-7.repo
   # 或 curl 命令
   curl -o /etc/yum.repos.d/CentOS-Base.repo https://mirrors.aliyun.com/repo/Centos-7.repo
   ```

3. **清理并生成缓存**
   ```bash
   yum clean all && yum makecache
   ```

### 2. 安装并配置 httpd 服务（提供仓库访问）

1. **先更新 YUM 源，再安装 httpd**
   ```bash
   yum update -y
   yum install -y httpd
   ```

2. **修改端口**（默认 80 端口，若被占用可改为 8080）
   ```bash
   vim /etc/httpd/conf/httpd.conf
   ```
   将 `Listen 80` 改为 `Listen 8080`，保存退出。

3. **启动 httpd 并设置开机自启**
   ```bash
   systemctl start httpd
   systemctl enable httpd
   ```

4. **配置防火墙**（建议直接关闭，简化操作）
   ```bash
   systemctl stop firewalld
   systemctl disable firewalld
   ```

### 3. 同步外网源包，创建 YUM 仓库

1. **创建仓库目录，用于存放同步的 RPM 包**
   ```bash
   mkdir -p /var/www/html/repo
   ```

2. **过滤架构**（可选，节省磁盘空间）
   编辑 `/etc/yum.repos.d/CentOS-Base.repo`，在 `[base]`、`[updates]`、`[extras]` 段下添加过滤配置，只同步 x86_64 架构包：
   ```ini
   exclude=*.i?86 *.athlon *.ppc* *.sparc*
   arch=x86_64
   ```

3. **安装同步工具并拉取 RPM 包**
   ```bash
   yum install -y createrepo yum-utils
   reposync -a x86_64 -l -d -m -n -p /var/www/html/repo --download-metadata
   ```

4. **生成仓库元数据**（让 YUM 能识别仓库）
   ```bash
   createrepo -p /var/www/html/repo/base
   createrepo -p /var/www/html/repo/updates
   createrepo -p /var/www/html/repo/extras
   ```

5. **测试访问**：浏览器打开 `http://服务器IP:8080/repo`，能看到仓库目录即配置成功。

### 4. 配置内网客户端服务器

在需要使用局域网 YUM 源的内网服务器（如 192.168.101.102）上创建 repo 文件：

```bash
vim /etc/yum.repos.d/Base.repo
```

写入以下内容（替换为实际仓库服务器 IP）：

```ini
[base]
name=base
baseurl=http://192.168.101.150:8080/repo/base
enabled=1
gpgcheck=0

[updates]
name=updates
baseurl=http://192.168.101.150:8080/repo/updates
enabled=1
gpgcheck=0

[extras]
name=extras
baseurl=http://192.168.101.150:8080/repo/extras
enabled=1
gpgcheck=0
```

清理并重建缓存后，即可测试安装软件：

```bash
yum clean all && yum makecache
yum install -y wget
```

---

## 三、场景二：无外网环境搭建本地 YUM 源

若所有服务器均无外网访问权限，可通过“外网提前同步包 + 内网迁移”的方式搭建 YUM 源。

### 1. 提前在外网服务器同步 RPM 包

在有外网的 Linux 服务器上，按场景一的步骤同步阿里云源包，然后打包为 `repo.tar.gz`，通过 U 盘、内网传输工具等方式迁移到内网 YUM 源服务器（如 192.168.101.150）。

### 2. 内网服务器创建本地仓库

1. **解压迁移的包并生成元数据**
   ```bash
   tar -zxvf repo.tar.gz -C /home
   createrepo -p /home/repo/base
   createrepo -p /home/repo/updates
   createrepo -p /home/repo/extras
   ```

2. **创建本地 repo 配置文件**
   ```bash
   vim /etc/yum.repos.d/Base.repo
   ```
   写入本地仓库路径：
   ```ini
   [base]
   name=base
   baseurl=file:///home/repo/base
   enabled=1
   gpgcheck=0

   [updates]
   name=updates
   baseurl=file:///home/repo/updates
   enabled=1
   gpgcheck=0

   [extras]
   name=extras
   baseurl=file:///home/repo/extras
   enabled=1
   gpgcheck=0
   ```

3. **清理缓存并测试安装**
   ```bash
   yum clean all && yum makecache
   yum install -y wget
   ```

### 3. 扩展为局域网共享仓库（可选）

若需供多台内网服务器使用，可安装 httpd 服务（步骤同场景一），然后将本地仓库迁移到 httpd 目录：

```bash
mkdir -p /var/www/html/repo
mv /home/repo/* /var/www/html/repo
```

内网客户端服务器按场景一的客户端配置方式，使用 `http://仓库IP:8080/repo` 作为源地址即可。

---

## 四、总结

无论是有外网还是无外网场景，搭建局域网 YUM 源的核心都是“**仓库目录 + 元数据 + 客户端配置**”三步。有外网时可直接同步外网源，效率更高；无外网时通过离线迁移包也能实现内网包管理。该方案解决了内网服务器软件安装、系统更新的痛点，大幅提升企业内网 Linux 运维的便捷性和稳定性。
