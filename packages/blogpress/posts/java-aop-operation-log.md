---
title: Java 利用 AOP 切面记录操作日志（注解方式）
description: 通过 Spring AOP 结合自定义注解优雅实现系统用户操作日志与异常日志记录实战教程
date: 2024-05-20
tags:
  - Java
  - Spring Boot
  - AOP
  - 系统设计
---

# Java 利用 AOP 切面记录操作日志（注解方式）

前提需求
----

* * *

之前收到一个新需求，要求对已有的系统上新增一个记录操作日志的功能，对于这 类 功能大家应该也看的很多了，必然是 **AOP** 进行解决，方便快捷，就是需要一个个方法加注释比较麻烦，说到 **AOP**，就先粗略的介绍下 AOP

### AOP 的概念

* * *

#### 1.1 什么是 AOP?

AOP（Aspect Oriented Programming）：**⾯向切⾯编程**，它是⼀种思想，它是对某⼀类事情的 集中处理。

#### 1.2 什么是 SpringAOP?

⽽ AOP 是⼀种思想，⽽ Spring AOP 是⼀个框架，提供了⼀种对 AOP 思想的实现，它们的关系和 IoC 与 DI 类似。

#### 1.3 为什要⽤ AOP?

> 在开发中，我们对于公共方法的处理分为三个阶段：
> 
> 1.  每个方法都去实现（初级）
> 2.  抽取公共方法（中级）
> 3.  采用 AOP 的方式，对代码进行无侵入是实现（高级）

因此，对于这种功能统⼀，且使⽤的地⽅较多的功能，在之前我们会抽取公共方法去实现，但是现在有更好的一个办法来处理这个问题，就是 AOP。

也就是使⽤ AOP 可以扩充多个对象的某个能⼒，所以 AOP 可以说是 OOP（Object Oriented Programming，⾯向对象编程）的补充和完善。

#### 1.4 AOP 的作用？

提供声明式事务；允许用户自定义切面

开始敲代码利用 AOP 实现这个需求功能
--------------------

* * *

####  1. 添加 Spring AOP 框架⽀持。

首先我们建立一个新的 Springboot 项目，在配置文件中添加 AOP 框架。

```xml
<dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-aop</artifactId>
 </dependency>
```

#### 2. 自定义注解

```java
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Mapping
@Documented
public @interface LogRecord {

    /**
     * 操作具体某个功能的描述
     * @return
     */
    String desc() default "";

    /**
     * 操作类型
     * @return
     */
    int type() default 1;
}
```

#### 3. 定义一个切面： 

```java
@Aspect
@Component
@Order(100)
public class LogAop {

    @Value("${customer.name}")
    private String customerName;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private BuLogMapper buLogMapper;

@Autowired
private BuErrorLogServiceImpl buErrorLogService;

    @Autowired
    private RedisUtils redisUtils;
    @Pointcut("@annotation(com.maizhiyu.yzt.annotation.LogRecord)")
    public void logAop() {
    }

    @Around("logAop()")
    public Object around(ProceedingJoinPoint joinPoint) throws Throwable {
        Object result = null;
        BuLog buLog =new BuLog();
            // 获取request对象
            HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.getRequestAttributes()).getRequest();
            String networkIp = getIpAddr(request);
            networkIp = "0:0:0:0:0:0:0:1".equals(networkIp) ? InetAddress.getLocalHost().getHostAddress() : networkIp;
            String ip =  InetAddress.getLocalHost().getHostAddress();
            String path = request.getRequestURL().toString();
            String string1 = request.getRequestURI().toString();
            String mac = NetUtil.getMacAddress(InetAddress.getLocalHost());
            MethodSignature signature = (MethodSignature) joinPoint.getSignature();
            Method method = signature.getMethod();
            String interfaceName = method.getName();
            String name = joinPoint.getSignature().getName();
            Object[] args = joinPoint.getArgs();
            String para = new String();
            if (ObjectUtil.isNotEmpty(args)) {
                if (args[0] instanceof MultipartFile) {
                    para = ((MultipartFile) joinPoint.getArgs()[0]).getOriginalFilename();
                } else {
                    if ((args[0].getClass().isArray() && args[0].getClass().getComponentType() == MultipartFile.class)) {
                        StringBuffer asd = new StringBuffer();
                        for (MultipartFile file : (MultipartFile[]) joinPoint.getArgs()[0]) {
                            if (asd == null) asd.append(file.getOriginalFilename());
                            else asd.append("," + file.getOriginalFilename());
                        }
                        para = asd.toString();
                    } else {
                        para = JSONArray.toJSONString(Arrays.stream(args).filter(e->!(e instanceof BindingResult)).toArray());
                    }
                }
                String idcard = "\\d{18}";
                String phone = "\\d{11}";
                String password = "password";
                Pattern phoneC = Pattern.compile(phone);
                Pattern idcardC = Pattern.compile(idcard);
                if (para.contains(password)) {
                    int i = para.indexOf('"', para.indexOf(password) + 11);
                    String substring = para.substring(para.indexOf(password) + 11, i);
                    para = para.replace(substring, "***");
                    System.out.println(i);
                }
                ;
                Matcher idcardM = idcardC.matcher(para);
                if (idcardM.find()) {
                    para = para.replace(idcardM.group(), IdcardUtil.hide(idcardM.group(), 6, 14));
                }
                ;
                Matcher phoneM = phoneC.matcher(para);
                if (phoneM.find()) {
                    para = para.replace(phoneM.group(), PhoneUtil.hideBetween(phoneM.group()));
                };
            }
        buLog.setReqPara(para);
        buLog.setIp(ip);
        buLog.setMac(mac);
        buLog.setReqUrl(path);
        LogRecord anno = signature.getMethod().getAnnotation(LogRecord.class);
        buLog.setType(anno.type());
        buLog.setOperateTime(new Date());
        BuErrorLog log = new BuErrorLog();
        try {
            result = joinPoint.proceed();
            if (!result.toString().contains("请输入正确的")&&!result.toString().contains("您的账户被锁定，请稍后尝试")){
                HsUser currentUser = jwtUtil.getCurrentUser();
                log.setCustomerId(currentUser.getCustomerId());
                buLog.setUserId(jwtUtil.getCurrentUser().getId().toString());
                buLog.setUserName(jwtUtil.getCurrentUser().getRealName());
                buLog.setCustomerId(jwtUtil.getCurrentUser().getCustomerId());
                buLog.setOperateInfor(jwtUtil.getCurrentUser().getRealName()+"进行了"+anno.desc());
            }else buLog.setOperateInfor("登陆失败");
        } catch (Throwable e) {
                log.setCustomerName(customerName);
                log.setClassName(joinPoint.getTarget().getClass().getName());
                log.setMethodName(method.getName());
                log.setErrorName(e.getClass().getName());
                log.setErrorMessage(e.getMessage());
                log.setErrorStack(stackTraceToString(e.getClass().getName(), e.getMessage(), e.getStackTrace()));
                log.setReqUrl(request.getRequestURL().toString());
                log.setReqPara(para);
                log.setIsDel(0);
                log.setCustomerId(jwtUtil.getCurrentUser().getCustomerId());
                log.setCreateTime(new Date());
                log.setUpdateTime(log.getCreateTime());
                buErrorLogService.save(log);
                buLog.setErrInformation(log.getId().toString());
                throw new RuntimeException(e);
        }finally {
            buLogMapper.insert(buLog);
        }
        return result;
    }

    /**
     * 获取请求IP
     * @param request
     * @return
     */
    public static String getIpAddr(HttpServletRequest request) {
        if (request.getHeader("x-forwarded-for") == null) {
            return request.getRemoteAddr();
        }
        String ip = request.getHeader("x-forwarded-for");
        if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("HTTP_CLIENT_IP");
        }
        if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("HTTP_X_FORWARDED_FOR");
        }
        if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        return ip;
    }

    public Map<String, String> converMap(Map<String, String[]> paramMap) {
        Map<String, String> rtnMap = new HashMap<String, String>();
        for (String key : paramMap.keySet()) {
            rtnMap.put(key, paramMap.get(key)[0]);
        }
        return rtnMap;
    }

    public String stackTraceToString(String exceptionName, String exceptionMessage, StackTraceElement[] elements) {
        StringBuffer strbuff = new StringBuffer();
        for (StackTraceElement stet : elements) {
            if(stet.getClassName().contains("com.maizhiyu.yzt"))
                strbuff.append(stet + "<br/>");
        }
        String message = exceptionName + ":" + exceptionMessage + "<br/>" + strbuff.toString();
        return message;
    }
```

#### 4. 使用注解

```java
    @ApiOperation(value = "增加用户", notes = "增加用户")
    @PostMapping("/addUser")
    @LogRecord(type = LogTypeConstant.XZ,desc = "增加用户")
    public Result addUser(@RequestBody HsUser user) {
        Integer res = service.addUser(user);
        return Result.success(user);
    }
```

#### 5. 执行后结果，成功记录

![日志表成功记录示例](/posts/java-aop/img-0.png)
