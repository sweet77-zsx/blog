---
title: Linux (CentOS) 安装 MySQL 8 数据库（图文详细教程）
description: 详细介绍在 Linux CentOS 环境下彻底卸载旧版本并完整安装、配置与远程连接 MySQL 8 数据库的图文教程
date: 2024-05-09
tags:
  - Linux
  - CentOS
  - MySQL
  - 数据库
---

# Linux (CentOS) 安装 MySQL 8 数据库（图文详细教程）

## 前言

前几天写了个 Windows 系统下安装 MySQL 的博客，收到很多小伙伴私信需要 Linux 下安装 MySQL 的教程，今天在这里和大家分享一下完整安装与配置流程，话不多说，看教程。

---

## 一、删除以前安装的 MySQL 服务

一般安装程序第一步都需要清除之前的安装痕迹，避免因版本残留或依赖冲突导致安装失败，此步骤与 MySQL 卸载流程通用。

### 1. 卸载 MySQL

查看之前是否安装过 MySQL：

```bash
rpm -qa | grep -i mysql
```

通过 `yum remove` 将查询到的相关内容逐一删除：

```bash
yum remove mysql80-community-release-el8-1.noarch
yum remove mysql-community-server-8.0.27-1.el8.x86_64
yum remove mysql-community-client-plugins-8.0.27-1.el8.x86_64
yum remove mysql-community-libs-8.0.27-1.el8.x86_64
yum remove mysql-community-client-8.0.27-1.el8.x86_64
yum remove bt-mysql57-5.7.34-1.el8.x86_64
yum remove mysql-community-common-8.0.27-1.el8.x86_64
```

检查是否卸载干净：

```bash
rpm -qa | grep -i mysql
```

查找并清理 MySQL 相关目录：

```bash
find / -name mysql
```

删除搜索出的残留目录：

```bash
rm -rf /etc/logrotate.d/mysql
rm -rf /var/lib/selinux/targeted/active/modules/100/mysql
rm -rf /var/lib/selinux/targeted/tmp/modules/100/mysql
rm -rf /var/lib/mysql
rm -rf /var/lib/mysql/mysql
rm -rf /usr/bin/mysql
rm -rf /usr/lib64/mysql
rm -rf /usr/share/selinux/targeted/default/active/modules/100/mysql
```

删除配置文件与日志文件：

```bash
rm -rf /etc/my.cnf
rm -rf /var/log/mysql/mysqld.log
```

### 2. 卸载 MariaDB

CentOS 系统自带或可能已安装了 MariaDB，该软件与 MySQL 数据库有依赖冲突，需要彻底卸载：

```bash
# 检测是否安装了 mariadb
rpm -qa | grep mariadb
```

![检测已安装的 mariadb](/posts/mysql/img-0.png)

移除 MariaDB 相关软件包：

```bash
rpm -e --nodeps mariadb-libs-5.5.68-1.el7.x86_64
```

> **提示**：如果是全新初始化的服务器，前面这些清理步骤可以直接跳过，直接进入下方的下载安装流程。

---

## 二、下载与安装 MySQL 8

**下载网址**：[MySQL 官网下载地址](https://dev.mysql.com/downloads/)

![MySQL 官网下载页](/posts/mysql/img-1.png)

选择对应版本（页面默认是最新版）。如需下载之前的历史版本，可点击旁边的 **Archives** 查找，建议下载 **RPM Bundle** 完整包：

![下载 RPM Bundle 版本](/posts/mysql/img-2.png)

可以下载完成后使用 Xftp 等工具上传至服务器指定目录，或者在服务器中直接使用 `wget` 下载：

```bash
mkdir -p /usr/local/mysql/
cd /usr/local/mysql/
wget https://dev.mysql.com/get/Downloads/MySQL-8.0/mysql-8.0.16-2.el7.x86_64.rpm-bundle.tar
```

解压文件：

```bash
tar -xvf mysql-8.0.16-2.el7.x86_64.rpm-bundle.tar
```

![解压 RPM Bundle](/posts/mysql/img-3.png)

### 使用 RPM 安装

::: tip 注意事项
必须严格按照以下顺序执行安装命令，否则会出现依赖错误报错。
:::

**CentOS 7 / MySQL 8.0.16 顺序：**

```bash
rpm -ivh mysql-community-common-8.0.16-1.el7.x86_64.rpm
rpm -ivh mysql-community-libs-8.0.16-1.el7.x86_64.rpm
rpm -ivh mysql-community-client-8.0.16-1.el7.x86_64.rpm
rpm -ivh mysql-community-devel-8.0.16-1.el7.x86_64.rpm
rpm -ivh mysql-community-server-8.0.16-1.el7.x86_64.rpm
```

**若是 8.0.20 及以上高版本（如 CentOS 8 / 8.0.35），按照以下顺序执行：**

```bash
rpm -ivh mysql-community-common-8.0.35-1.el8.x86_64.rpm
rpm -ivh mysql-community-client-plugins-8.0.35-1.el8.x86_64.rpm
rpm -ivh mysql-community-libs-8.0.35-1.el8.x86_64.rpm
rpm -ivh mysql-community-client-8.0.35-1.el8.x86_64.rpm
rpm -ivh mysql-community-icu-data-files-8.0.35-1.el8.x86_64.rpm
rpm -ivh mysql-community-devel-8.0.35-1.el8.x86_64.rpm
rpm -ivh mysql-community-server-8.0.35-1.el8.x86_64.rpm
```

查看已安装的 MySQL 版本：

```bash
mysql --version
```

![查看 MySQL 版本](/posts/mysql/img-4.png)

### 配置大小写敏感（可选）

如果后期业务需要不区分大小写，可以在初始化前修改 `/etc/my.cnf`：

> **注意**：MySQL 8.0 默认区分表名大小写。如需不区分表名，需要在初始化时加入 `lower_case_table_names=1`，后续修改较为繁琐。

```bash
vi /etc/my.cnf
```

![配置 my.cnf](/posts/mysql/img-5.png)

### 启动服务与状态检查

常用 systemctl 管理命令：

```bash
# 设置开机自启
systemctl enable mysqld

# 启动 MySQL 服务
systemctl start mysqld

# 查看服务状态
systemctl status mysqld

# 重启服务
systemctl restart mysqld

# 停止服务
systemctl stop mysqld

# 关闭开机自启
systemctl disable mysqld
```

看到绿色的 `active (running)` 说明服务启动成功：

![MySQL 运行状态](/posts/mysql/img-6.png)

---

## 三、MySQL 的初始化与使用

### 1. 获取 root 用户的初始密码

MySQL 首次启动后会在日志中生成一个临时密码：

```bash
cat /var/log/mysqld.log | grep root@localhost
```

![查看初始密码](/posts/mysql/img-7.png)

### 2. 使用 root 登录服务

```bash
mysql -u root -p
```

输入刚才查询到的初始临时密码进入 MySQL 控制台：

![登录 MySQL 数据库](/posts/mysql/img-8.png)

### 3. 修改 root 密码

由于 MySQL 8 默认启用了密码强度策略，密码需要包含大小写字母、数字及特殊字符：

```sql
alter user root@localhost identified by 'Abu123456.';
```

### 4. 开放远程访问权限

配置允许远程客户端连接数据库：

```sql
-- 选择 mysql 系统库
use mysql;

-- 设置 root 用户允许任意主机连接
update user set host='%' where user='root';

-- 刷新权限使其生效
flush privileges;
```

### 5. 远程连接测试

此时可以使用 Navicat、DBeaver、DataGrip 等数据库管理工具测试远程连接：

![远程连接测试成功](/posts/mysql/img-9.png)

> **故障排查**：如果连接失败或超时，请排查云服务器安全组以及 Linux 本地防火墙的 `3306` 端口是否已经开放：
> ```bash
> # 开放 3306 端口
> firewall-cmd --zone=public --add-port=3306/tcp --permanent
> # 重新加载防火墙规则
> firewall-cmd --reload
> ```
