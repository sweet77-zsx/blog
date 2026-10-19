---
title: 【实战踩坑】Spring Boot 3.x 启动报错：Invalid value type for attribute 'factoryBeanObjectType' 解决方案
description: 详解 Spring Boot 3.x 升级过程中因 MyBatis-Plus 及 mybatis-spring 版本不兼容引发的 factoryBeanObjectType 异常根因与解决方案
date: 2026-01-04
tags:
  - Spring Boot
  - MyBatis-Plus
  - Java
  - 踩坑记录
---

# 【实战踩坑】Spring Boot 3.x 启动报错：Invalid value type for attribute 'factoryBeanObjectType' 解决方案

## 一、问题背景（真实踩坑场景）

最近在项目中将 **Spring Boot 从 2.x 升级到 3.x**，数据库层使用的是 **MyBatis-Plus**。  
升级完成后，代码**编译正常**，但在 **启动项目或运行单元测试时直接启动失败**。

控制台抛出一个看起来非常 “抽象” 的异常：

```
java.lang.IllegalArgumentException:
Invalid value type for attribute 'factoryBeanObjectType': java.lang.String
```

乍一看不像配置问题，也不像代码写错，但就是**启动不了**，非常影响开发效率。

---

## 二、错误现象（启动直接失败）

### 1. 启动时报错截图

![启动时报错堆栈信息](/posts/spring-boot/img-0.png)

> 实际项目中一般表现为 Spring Boot 启动到一半直接中断

```
***************************
APPLICATION FAILED TO START
***************************
```

紧接着就是核心异常：

```
Invalid value type for attribute 'factoryBeanObjectType'
```

### 2. 单元测试同样失败

如果你在项目中写了 Mapper 层或 Service 层测试：

```java
@SpringBootTest
class UserMapperTest {
    ...
}
```

运行测试时，也会**在加载 Spring 上下文阶段直接失败**：

```
Caused by: java.lang.IllegalArgumentException:
Invalid value type for attribute 'factoryBeanObjectType': java.lang.String
	at org.springframework.beans.factory.support.FactoryBeanRegistrySupport.getTypeForFactoryBeanFromAttributes(FactoryBeanRegistrySupport.java:82)
	at org.springframework.beans.factory.support.AbstractBeanFactory.getTypeForFactoryBean(AbstractBeanFactory.java:1718)
	at org.springframework.beans.factory.support.AbstractBeanFactory.getType(AbstractBeanFactory.java:1648)
```

---

## 三、问题本质：不是你代码的问题，而是「版本不兼容」

### 1. Spring Boot 3.x 变“严格”了

Spring Boot 3.x 底层升级到 **Spring Framework 6.x** 后，对 `FactoryBean` 做了**更严格的类型校验**：

* ❌ **不再允许** `factoryBeanObjectType` 是字符串
* ✅ **必须是**：
  * `Class`
  * 或 `ResolvableType`

### 2. MyBatis / MyBatis-Plus 旧版本还在用老实现

旧版本的 `mybatis-spring` 或 `mybatis-plus-starter` 在注册 Mapper Bean 时仍使用老实现：

```java
factoryBeanObjectType = "com.xxx.UserMapper";
```

这是一个 **String 类型**，在 Spring Boot 2.x 没问题，但在 **Spring Boot 3.x 会直接抛 IllegalArgumentException**。

参考【[mybatis-spring issues 855](https://github.com/mybatis/spring/issues/855)】得知：

![mybatis-spring 官方 issue 855](/posts/spring-boot/img-1.png)

::: tip 根因总结
**Spring Boot 3 规则升级了，但 MyBatis 生态没同步升级**
:::

---

## 四、哪些情况下必踩这个坑？

你可以对照看看是不是下面的情况：

* ✅ Spring Boot 升级到了 3.x
* ✅ 项目中使用了 MyBatis 或 MyBatis-Plus
* ✅ 没有刻意升级 mybatis-spring 版本
* ✅ 启动 / 测试时报 FactoryBean 相关异常

👉 满足 2 条以上，基本就是这个问题。

---

## 五、实战解决方案（亲测有效）

### ⭐ 方案一：升级 MyBatis-Plus + 显式指定 mybatis-spring（推荐）

这是**最稳妥、最推荐**的解决方式。

#### Maven 配置示例

```xml
<!-- MyBatis-Plus Starter -->
<dependency>
    <groupId>com.baomidou</groupId>
    <artifactId>mybatis-plus-boot-starter</artifactId>
    <version>3.5.5</version>
    <exclusions>
        <!-- 排除旧版本 mybatis-spring -->
        <exclusion>
            <groupId>org.mybatis</groupId>
            <artifactId>mybatis-spring</artifactId>
        </exclusion>
    </exclusions>
</dependency>

<!-- 引入 Spring Boot 3 兼容版本 -->
<dependency>
    <groupId>org.mybatis</groupId>
    <artifactId>mybatis-spring</artifactId>
    <version>3.0.3</version>
</dependency>
```

::: info 重点说明
* `mybatis-spring 3.0.x` 是官方适配 Spring Boot 3 的版本
* 不显式指定，很容易被 Starter 间接引入旧版本
:::

### ⭐ 方案二：统一依赖版本（多模块项目推荐）

如果是企业项目或多模块工程，建议用 `dependencyManagement`：

```xml
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>org.mybatis</groupId>
            <artifactId>mybatis-spring</artifactId>
            <version>3.0.3</version>
        </dependency>
    </dependencies>
</dependencyManagement>
```

这样可以避免不同模块依赖冲突。

---

## 六、辅助排查项（避免误判）

虽然不是根因，但也建议顺手检查：

```java
@MapperScan("com.xxx.project.mapper")
@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```

* ✅ Mapper 包路径是否正确
* ✅ 没有重复扫描
* ✅ Mapper 接口不要用原始泛型

---

## 七、修复后验证（成功标志）

### ✅ 项目启动成功

```
Started Application in 3.1 seconds
```

### ✅ 单元测试正常执行

```
Tests run: 5, Failures: 0, Errors: 0
```

到这里，说明问题**彻底解决**。

---

## 八、总结（踩坑经验）

很多人第一反应是改配置、改代码，其实方向就错了。这个错误：

* ❌ 不是 Mapper 写错
* ❌ 不是配置文件问题
* ❌ 不是 Spring Boot Bug

✅ **本质是 Spring Boot 3 与旧版 MyBatis 生态不兼容**

> **记住这条经验**：Spring Boot 大版本升级，ORM 框架一定要同步升级！
