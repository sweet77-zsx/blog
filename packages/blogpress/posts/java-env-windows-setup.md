---
title: Java 系统环境配置（Windows 环境）
description: 超详细 Windows 系统下 JDK 8 安装与 JAVA_HOME、CLASSPATH、Path 环境变量完整配置图文教程
date: 2024-04-15
tags:
  - Java
  - Windows
  - 环境配置
  - JDK
---

# Java 系统环境配置（Windows 环境）

#### 一、首先判断系统上是否已经存在 Java 环境

· 首先在键盘上按下 win+R 输入 cmd，打开 win 下的命令行界面  
![环境配置步骤截图](/posts/java-env/img-0.png)  
 然后输入 java，如果出现'java' 不是内部或外部命令，也不是可运行的程序 或批处理文件时表示本地没有安装 Java，那么就进行下载安装环节。

![环境配置步骤截图](/posts/java-env/img-1.png)

#### 二、下载安装 Java

##### 官网下载 JDK

输入下面网址进入 Oracle 官网下载，选择 X64 Installer 安装程序下载。我这里安装的是比较常用的 JDK8。  
官网下载地址：[Java Downloads | Oracle 中国](https://www.oracle.com/cn/java/technologies/javase/javase8u211-later-archive-downloads.html "Java Downloads | Oracle 中国")

![环境配置步骤截图](/posts/java-env/img-2.png)

##### 安装 JDK

下载好 JDK 一直点击下一步即可安装，可以选择安装路径，这个安装路径需要记住，后面配置环境变量还需要使用到，我这里安装到 D 盘下。

![环境配置步骤截图](/posts/java-env/img-3.png)

后面需要安装 JRE, 最好和刚刚的 JDK 的文件夹放一起，文件夹选择完成后进行下一步就可以了。

![环境配置步骤截图](/posts/java-env/img-4.png)

#### 三、配置 Java 的环境变量

右键点击此电脑，点击属性打开

![环境配置步骤截图](/posts/java-env/img-5.png)

点击高级系统设置

![环境配置步骤截图](/posts/java-env/img-6.png)

找到高级，点击环境变量

![环境配置步骤截图](/posts/java-env/img-7.png)

在下面 系统变量 里新建 **JAVA_HOME** 和 **CLASSPATH** 变量

**JAVA_HOME** 的变量值为 Java 的安装目录

```ini
变量名：JAVA_HOME
变量值：D:\Java\jdk1.8.0_361
```

```ini
变量名：CLASSPATH
变量值：.;%JAVA_HOME%\lib\dt.jar;%JAVA_HOME%\lib\tools.jar
```

![环境配置步骤截图](/posts/java-env/img-8.png)

找到系统变量里 PATH 变量，点击编辑如下以下地址

```bat
%JAVA_HOME%\bin
%JAVA_HOME%\jre\bin
```

![环境配置步骤截图](/posts/java-env/img-9.png)

![环境配置步骤截图](/posts/java-env/img-10.png)

#### 四、检查是否配置成功

在键盘上按下 win+r 输入 cmd，打开命令行输入 **java -version**;

出现结果如图所示一样的话，就说明安装成功。

![环境配置步骤截图](/posts/java-env/img-11.png)
