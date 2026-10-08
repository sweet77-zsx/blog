---
title: Redis 集群详解（包含主从、哨兵与分片集群搭建）
description: 深入解析 Redis 高可用架构，包含主从复制原理与搭建、Sentinel 哨兵故障转移机制，以及 Cluster 分片集群实战部署
date: 2024-07-22
tags:
  - Redis
  - 集群
  - 分布式
  - 高可用
  - 架构
---

# Redis 集群详解（包含主从、哨兵与分片集群搭建）

> 对应 B 站视频学习教程：[Redis 面试篇 - 01.Redis 主从 - 搭建主从集群](https://www.bilibili.com/video/BV1S142197x7/?p=142)

## [Redis 面试篇 - 01.Redis 主从 - 搭建主从集群_哔哩哔哩_bilibili](https://www.bilibili.com/video/BV1S142197x7/?p=142&spm_id_from=333.1350.jump_directly&vd_source=b335b2fadccd59766278a0bc8aa96ab6 "Redis面试篇-01.Redis主从-搭建主从集群_哔哩哔哩_bilibili")

1.Redis 主从
----------

单节点 Redis 的并发能力是有上限的，要进一步提高 Redis 的并发能力，就需要搭建主从集群，实现读写分离。

### 1.1. 主从集群结构

下图就是一个简单的 Redis 主从集群结构：![Redis集群架构及部署图](/posts/redis-cluster/img-0.png)

如图所示，集群中有一个 master 节点、两个 slave 节点（现在叫 replica）。当我们通过 Redis 的 Java 客户端访问主从集群时，应该做好路由：

*   如果是写操作，应该访问 master 节点，master 会自动将数据同步给两个 slave 节点
    
*   如果是读操作，建议访问各个 slave 节点，从而分担并发压力
    

### 1.2. 搭建主从集群

我们会在同一个 虚拟机 中利用 3 个 Docker 容器来搭建主从集群，容器信息如下：

<table><thead><tr><th colspan="1" rowspan="1"><h6><strong>容器名</strong></h6></th><th colspan="1" rowspan="1"><h6><strong>角色</strong></h6></th><th colspan="1" rowspan="1"><h6><strong>IP</strong></h6></th><th colspan="1" rowspan="1"><h6><strong>映射</strong><strong>端口</strong></h6></th></tr></thead><tbody><tr><td colspan="1" rowspan="1"><p>r1</p></td><td colspan="1" rowspan="1"><p>master</p></td><td colspan="1" rowspan="1"><p>192.168.22.88（自己的虚拟机 ip）</p></td><td colspan="1" rowspan="1"><p>7001</p></td></tr><tr><td colspan="1" rowspan="1"><p>r2</p></td><td colspan="1" rowspan="1"><p>slave</p></td><td colspan="1" rowspan="1">192.168.22.88（自己的虚拟机 ip）</td><td colspan="1" rowspan="1"><p>7002</p></td></tr><tr><td colspan="1" rowspan="1"><p>r3</p></td><td colspan="1" rowspan="1"><p>slave</p></td><td colspan="1" rowspan="1">192.168.22.88（自己的虚拟机 ip）</td><td colspan="1" rowspan="1"><p>7003</p></td></tr></tbody></table>

#### 1.2.1. 启动多个 Redis 实例

文章结尾资料提供的 docker-compose 文件来构建主从集群：![Redis集群架构及部署图](/posts/redis-cluster/img-1.png)

文件内容如下：

```yaml
version: "3.2"

services:
  r1:
    image: redis
    container_name: r1
    network_mode: "host"
    entrypoint: ["redis-server", "--port", "7001"]
  r2:
    image: redis
    container_name: r2
    network_mode: "host"
    entrypoint: ["redis-server", "--port", "7002"]
  r3:
    image: redis
    container_name: r3
    network_mode: "host"
    entrypoint: ["redis-server", "--port", "7003"]
```

 将其上传至虚拟机的`/root/redis`目录下：![Redis集群架构及部署图](/posts/redis-cluster/img-2.png)

执行命令，运行集群：

```
# Redis5.0以前
slaveof <masterip> <masterport>
# Redis5.0以后
replicaof <masterip> <masterport>
```

 结果：

![Redis集群架构及部署图](/posts/redis-cluster/img-3.png)

 查看 docker 容器，发现都正常启动了：![Redis集群架构及部署图](/posts/redis-cluster/img-4.png)

由于采用的是 host 模式，我们看不到端口映射。不过能直接在宿主机通过 ps 命令查看到 Redis 进程：![Redis集群架构及部署图](/posts/redis-cluster/img-5.png) 

#### 1.2.2. 建立集群

虽然我们启动了 3 个 Redis 实例，但是它们并没有形成主从关系。我们需要通过命令来配置主从关系：

```
# 连接r2
docker exec -it r2 redis-cli -p 7002
# 认r1主，也就是7001
slaveof 192.168.22.88 7001
```

有临时和永久两种模式：

*   永久生效：在 redis.conf 文件中利用`slaveof`命令指定`master`节点
    
*   临时生效：直接利用 redis-cli 控制台输入`slaveof`命令，指定`master`节点
    

我们测试临时模式，首先连接`r2`，让其以`r1`为 master

```
# 连接r3
docker exec -it r3 redis-cli -p 7003
# 认r1主，也就是7001
slaveof 192.168.22.88 7001
```

然后连接`r3`，让其以`r1`为 master

```
# 连接r1
docker exec -it r1 redis-cli -p 7001
# 查看集群状态
info replication
```

然后连接`r1`，查看集群状态：

```
set key 123

get key
```

结果如下：![Redis集群架构及部署图](/posts/redis-cluster/img-6.png)

可以看到，当前节点`r1:7001`的角色是`master`，有两个 slave 与其连接：

*   `slave0`：`port`是`7002`，也就是`r2`节点
    
*   `slave1`：`port`是`7003`，也就是`r3`节点
    

#### 1.2.3. 测试

依次在`r1`、`r2`、`r3`节点上执行下面命令：

```
# 老版本DockerCompose
docker-compose down

# 新版本Docker
docker compose down
```

 你会发现，只有在`r1`这个节点上可以执行`set`命令（**写操作**），其它两个节点只能执行`get`命令（**读操作**）。也就是说读写操作已经分离了。

### 1.3. 主从同步原理

在刚才的主从测试中，我们发现`r1`上写入 Redis 的数据，在`r2`和`r3`上也能看到，这说明主从之间确实完成了数据同步。

那么这个同步是如何完成的呢？

#### 1.3.1. 全量同步

主从第一次建立连接时，会执行**全量同步**，将 master 节点的所有数据都拷贝给 slave 节点，流程：![Redis集群架构及部署图](/posts/redis-cluster/img-7.png)

这里有一个问题，`master`如何得知`salve`是否是第一次来同步呢？？

有几个概念，可以作为判断依据：

*   **`Replication Id`**：简称`replid`，是数据集的标记，replid 一致则是同一数据集。每个`master`都有唯一的`replid`，`slave`则会继承`master`节点的`replid`
    
*   **`offset`**：偏移量，随着记录在`repl_baklog`中的数据增多而逐渐增大。`slave`完成同步时也会记录当前同步的`offset`。如果`slave`的`offset`小于`master`的`offset`，说明`slave`数据落后于`master`，需要更新。
    

因此`slave`做数据同步，必须向`master`声明自己的`replication id` 和`offset`，`master`才可以判断到底需要同步哪些数据。

由于我们在执行`slaveof`命令之前，所有 redis 节点都是`master`，有自己的`replid`和`offset`。

当我们第一次执行`slaveof`命令，与`master`建立主从关系时，发送的`replid`和`offset`是自己的，与`master`肯定不一致。

`master`判断发现`slave`发送来的`replid`与自己的不一致，说明这是一个全新的 slave，就知道要做全量同步了。

`master`会将自己的`replid`和`offset`都发送给这个`slave`，`slave`保存这些信息到本地。自此以后`slave`的`replid`就与`master`一致了。

因此，**master** **判断一个节点是否是第一次同步的依据，就是看 replid 是否一致**。流程如图：![Redis集群架构及部署图](/posts/redis-cluster/img-8.png)

完整流程描述：

*   `slave`节点请求增量同步
    
*   `master`节点判断`replid`，发现不一致，拒绝增量同步
    
*   `master`将完整内存数据生成`RDB`，发送`RDB`到`slave`
    
*   `slave`清空本地数据，加载`master`的`RDB`
    
*   `master`将`RDB`期间的命令记录在`repl_baklog`，并持续将 log 中的命令发送给`slave`
    
*   `slave`执行接收到的命令，保持与`master`之间的同步
    

来看下`r1`节点的运行日志：![Redis集群架构及部署图](/posts/redis-cluster/img-9.png)

再看下`r2`节点执行`replicaof`命令时的日志：![Redis集群架构及部署图](/posts/redis-cluster/img-10.png) 与我们描述的完全一致。

#### 1.3.2. 增量同步

全量同步需要先做 RDB，然后将 RDB 文件通过网络传输个 slave，成本太高了。因此除了第一次做全量同步，其它大多数时候 slave 与 master 都是做**增量同步**。

什么是增量同步？就是只更新 slave 与 master 存在差异的部分数据。如图：![Redis集群架构及部署图](/posts/redis-cluster/img-11.png)

那么 master 怎么知道 slave 与自己的数据差异在哪里呢?

#### 1.3.3.repl_baklog 原理

master 怎么知道 slave 与自己的数据差异在哪里呢?

这就要说到全量同步时的`repl_baklog`文件了。这个文件是一个固定大小的数组，只不过数组是环形，也就是说**角标到达数组末尾后，会再次从 0 开始读写**，这样数组头部的数据就会被覆盖。

`repl_baklog`中会记录 Redis 处理过的命令及`offset`，包括 master 当前的`offset`，和 slave 已经拷贝到的`offset`：

![Redis集群架构及部署图](/posts/redis-cluster/img-12.png)

slave 与 master 的 offset 之间的差异，就是 salve 需要增量拷贝的数据了。

随着不断有数据写入，master 的 offset 逐渐变大，slave 也不断的拷贝，追赶 master 的 offset：![Redis集群架构及部署图](/posts/redis-cluster/img-13.png)

直到数组被填满：

![Redis集群架构及部署图](/posts/redis-cluster/img-14.png)

此时，如果有新的数据写入，就会覆盖数组中的旧数据。不过，旧的数据只要是绿色的，说明是已经被同步到 slave 的数据，即便被覆盖了也没什么影响。因为未同步的仅仅是红色部分：![Redis集群架构及部署图](/posts/redis-cluster/img-15.png)

但是，如果 slave 出现网络阻塞，导致 master 的`offset`远远超过了 slave 的`offset`：![Redis集群架构及部署图](/posts/redis-cluster/img-16.png)

如果 master 继续写入新数据，master 的`offset`就会覆盖`repl_baklog`中旧的数据，直到将 slave 现在的`offset`也覆盖：

![Redis集群架构及部署图](/posts/redis-cluster/img-17.png)

棕色框中的红色部分，就是尚未同步，但是却已经被覆盖的数据。此时如果 slave 恢复，需要同步，却发现自己的`offset`都没有了，无法完成增量同步了。只能做**全量同步**。

`repl_baklog`大小有上限，写满后会覆盖最早的数据。如果 slave 断开时间过久，导致尚未备份的数据被覆盖，则无法基于`repl_baklog`做增量同步，只能再次全量同步。

### 1.4. 主从同步优化

主从同步可以保证主从数据的一致性，非常重要。

可以从以下几个方面来优化 Redis 主从就集群：

*   在 master 中配置`repl-diskless-sync yes`启用无磁盘复制，避免全量同步时的磁盘 IO。
    
*   Redis 单节点上的内存占用不要太大，减少 RDB 导致的过多磁盘 IO
    
*   适当提高`repl_baklog`的大小，发现 slave 宕机时尽快实现故障恢复，尽可能避免全量同步
    
*   限制一个 master 上的 slave 节点数量，如果实在是太多 slave，则可以采用`主-从-从`链式结构，减少 master 压力
    

`主-从-从`架构图：![Redis集群架构及部署图](/posts/redis-cluster/img-18.png)

简述全量同步和增量同步区别？

*   全量同步：master 将完整内存数据生成 RDB，发送 RDB 到 slave。后续命令则记录在 repl_baklog，逐个发送给 slave。
    
*   增量同步：slave 提交自己的 offset 到 master，master 获取 repl_baklog 中从 offset 之后的命令给 slave
    

什么时候执行全量同步？

*   slave 节点第一次连接 master 节点时
    
*   slave 节点断开时间太久，repl_baklog 中的 offset 已经被覆盖时
    

什么时候执行增量同步？

*   slave 节点断开又恢复，并且在`repl_baklog`中能找到 offset 时
    

.Redis 哨兵
---------

主从结构中 master 节点的作用非常重要，一旦故障就会导致集群不可用。那么有什么办法能保证主从集群的高可用性呢？

### 2.1. 哨兵工作原理

Redis 提供了`哨兵`（`Sentinel`）机制来监控主从集群监控状态，确保集群的高可用性。

#### 2.1.1. 哨兵作用

哨兵集群作用原理图：![Redis集群架构及部署图](/posts/redis-cluster/img-19.png)

哨兵的作用如下：

*   **状态监控**：`Sentinel` 会不断检查您的`master`和`slave`是否按预期工作
    
*   **故障恢复（failover）**：如果`master`故障，`Sentinel`会将一个`slave`提升为`master`。当故障实例恢复后会成为`slave`
    
*   **状态通知**：`Sentinel`充当`Redis`客户端的服务发现来源，当集群发生`failover`时，会将最新集群信息推送给`Redis`的客户端
    

那么问题来了，`Sentinel`怎么知道一个 Redis 节点是否宕机呢？

#### 2.1.2. 状态监控

`Sentinel`基于心跳机制监测服务状态，每隔 1 秒向集群的每个节点发送 ping 命令，并通过实例的响应结果来做出判断：

*   **主观下线（sdown）**：如果某 sentinel 节点发现某 Redis 节点未在规定时间响应，则认为该节点主观下线。
    
*   **客观下线 (odown)**：若超过指定数量（通过`quorum`设置）的 sentinel 都认为该节点主观下线，则该节点客观下线。quorum 值最好超过 Sentinel 节点数量的一半，Sentinel 节点数量至少 3 台。
    

如图：![Redis集群架构及部署图](/posts/redis-cluster/img-20.png)

一旦发现 master 故障，sentinel 需要在 salve 中选择一个作为新的 master，选择依据是这样的：

*   首先会判断 slave 节点与 master 节点断开时间长短，如果超过`down-after-milliseconds * 10`则会排除该 slave 节点
    
*   然后判断 slave 节点的`slave-priority`值，越小优先级越高，如果是 0 则永不参与选举（默认都是 1）。
    
*   如果`slave-prority`一样，则判断 slave 节点的`offset`值，越大说明数据越新，优先级越高
    
*   最后是判断 slave 节点的`run_id`大小，越小优先级越高（`通过info server可以查看run_id`）。
    

对应的官方文档如下：[High availability with Redis Sentinel | Docs](https://redis.io/docs/latest/operate/oss_and_stack/management/sentinel/#replica-selection-and-priority "High availability with Redis Sentinel | Docs")

问题来了，当选出一个新的 master 后，该如何实现身份切换呢？

大概分为两步：

*   在多个`sentinel`中选举一个`leader`
    
*   由`leader`执行`failover`
    

#### 2.1.3. 选举 leader

首先，Sentinel 集群要选出一个执行`failover`的 Sentinel 节点，可以成为`leader`。要成为`leader`要满足两个条件：

*   最先获得超过半数的投票
    
*   获得的投票数不小于`quorum`值
    

而 sentinel 投票的原则有两条：

*   优先投票给目前得票最多的
    
*   如果目前没有任何节点的票，就投给自己
    

比如有 3 个 sentinel 节点，`s1`、`s2`、`s3`，假如`s2`先投票：

*   此时发现没有任何人在投票，那就投给自己。`s2`得 1 票
    
*   接着`s1`和`s3`开始投票，发现目前`s2`票最多，于是也投给`s2`，`s2`得 3 票
    
*   `s2`称为`leader`，开始故障转移
    

不难看出，**谁先****投票****，谁就会称为** **leader**，那什么时候会触发投票呢？

答案是**第一个确认** **master** **客观下线的人****会立刻发起****投票****，一定会成为** **leader**。

OK，`sentinel`找到`leader`以后，该如何完成`failover`呢？

#### 2.1.4. failover

我们举个例子，有一个集群，初始状态下 7001 为`master`，7002 和 7003 为`slave`：![Redis集群架构及部署图](/posts/redis-cluster/img-21.png)

假如 master 发生故障，slave1 当选。则故障转移的流程如下：

1）`sentinel`给备选的`slave1`节点发送`slaveof no one`命令，让该节点成为`master`

![Redis集群架构及部署图](/posts/redis-cluster/img-22.png)

 2）`sentinel`给所有其它`slave`发送`slaveof 192.168.150.101 7002` 命令，让这些节点成为新`master`，也就是`7002`的`slave`节点，开始从新的`master`上同步数据。![Redis集群架构及部署图](/posts/redis-cluster/img-23.png)

3）最后，当故障节点恢复后会接收到哨兵信号，执行`slaveof 192.168.150.101 7002`命令，成为`slave`：![Redis集群架构及部署图](/posts/redis-cluster/img-24.png)

### 2.2. 搭建哨兵集群

首先，我们停掉之前的 redis 集群：

```
sentinel announce-ip "192.168.150.101"
sentinel monitor hmaster 192.168.150.101 7001 2
sentinel down-after-milliseconds hmaster 5000
sentinel failover-timeout hmaster 60000
```

 然后找到文章结尾资料提供的 sentinel.conf 文件：

![Redis集群架构及部署图](/posts/redis-cluster/img-25.png)

其内容如下：

```yaml
version: "3.2"

services:
  r1:
    image: redis
    container_name: r1
    network_mode: "host"
    entrypoint: ["redis-server", "--port", "7001"]
  r2:
    image: redis
    container_name: r2
    network_mode: "host"
    entrypoint: ["redis-server", "--port", "7002", "--slaveof", "192.168.150.101", "7001"]
  r3:
    image: redis
    container_name: r3
    network_mode: "host"
    entrypoint: ["redis-server", "--port", "7003", "--slaveof", "192.168.150.101", "7001"]
  s1:
    image: redis
    container_name: s1
    volumes:
      - /root/redis/s1:/etc/redis
    network_mode: "host"
    entrypoint: ["redis-sentinel", "/etc/redis/sentinel.conf", "--port", "27001"]
  s2:
    image: redis
    container_name: s2
    volumes:
      - /root/redis/s2:/etc/redis
    network_mode: "host"
    entrypoint: ["redis-sentinel", "/etc/redis/sentinel.conf", "--port", "27002"]
  s3:
    image: redis
    container_name: s3
    volumes:
      - /root/redis/s3:/etc/redis
    network_mode: "host"
    entrypoint: ["redis-sentinel", "/etc/redis/sentinel.conf", "--port", "27003"]
```

说明：

*   `sentinel announce-ip "192.168.150.101"`：声明当前 sentinel 的 ip
    
*   `sentinel monitor hmaster 192.168.150.101 7001 2`：指定集群的主节点信息
    
    *   `hmaster`：主节点名称，自定义，任意写
        
    *   `192.168.150.101 7001`：主节点的 ip 和端口
        
    *   `2`：认定`master`下线时的`quorum`值
        
*   `sentinel down-after-milliseconds hmaster 5000`：声明 master 节点超时多久后被标记下线
    
*   `sentinel failover-timeout hmaster 60000`：在第一次故障转移失败后多久再次重试
    

我们在虚拟机的`/root/redis`目录下新建 3 个文件夹：`s1`、`s2`、`s3`:![Redis集群架构及部署图](/posts/redis-cluster/img-26.png)

将文章结尾资料提供的`sentinel.conf`文件分别拷贝一份到 3 个文件夹中。

接着修改`docker-compose.yaml`文件，内容如下：

```
1:X 22 Jul 2024 06:58:56.353 # Sentinel ID is 024bffcdce1c15db37b51d80201997c019f3f8ae
1:X 22 Jul 2024 06:58:56.353 # +monitor master hmaster 192.168.22.88 7001 quorum 2
1:X 22 Jul 2024 06:58:56.360 * +slave slave 192.168.22.88:7002 192.168.22.88 7002 @ hmaster 192.168.22.88 7001
1:X 22 Jul 2024 06:58:56.364 * +slave slave 192.168.22.88:7003 192.168.22.88 7003 @ hmaster 192.168.22.88 7001
1:X 22 Jul 2024 06:58:58.355 * +sentinel sentinel 91e7ebf5e5963fdf2dd184be0312632aee998c8c 192.168.22.88 27003 @ hmaster 192.168.22.88 7001
1:X 22 Jul 2024 06:58:58.367 * +sentinel sentinel 9d3e08cf2301b7c1745996e57e91be2d38c2e029 192.168.22.88 27002 @ hmaster 192.168.22.88 7001
```

 直接运行命令，启动集群：

```
# 连接7001这个master节点，通过sleep模拟服务宕机，60秒后自动恢复
docker exec -it r1 redis-cli -p 7001 DEBUG sleep 60
```

运行结果：![Redis集群架构及部署图](/posts/redis-cluster/img-27.png)

我们以 s1 节点为例，查看其运行日志：

```
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>
```

可以看到`sentinel`已经联系到了`7001`这个节点，并且与其它几个哨兵也建立了链接。哨兵信息如下：

*   `27001`：`Sentinel ID`是`024bffcdce1c15db37b51d80201997c019f3f8ae`
    
*   `27002`：`Sentinel ID`是`91e7ebf5e5963fdf2dd184be0312632aee998c8c`
    
*   `27003`：`Sentinel ID`是`9d3e08cf2301b7c1745996e57e91be2d38c2e029`
    

### 2.3. 演示 failover

接下来，我们演示一下当主节点故障时，哨兵是如何完成集群故障恢复（failover）的。

我们连接`7001`这个`master`节点，然后通过命令让其休眠 60 秒，模拟宕机：

```
spring:
  redis:
    sentinel:
      master: hmaster # 集群名
      nodes: # 哨兵地址列表
        - 192.168.150.101:27001
        - 192.168.150.101:27002
        - 192.168.150.101:27003
```

稍微等待一段时间后，会发现 sentinel 节点触发了`failover`：

![Redis集群架构及部署图](/posts/redis-cluster/img-28.png)

### 2.4. 总结

Sentinel 的三个作用是什么？

*   集群监控
    
*   故障恢复
    
*   状态通知
    

Sentinel 如何判断一个 redis 实例是否健康？

*   每隔 1 秒发送一次 ping 命令，如果超过一定时间没有相向则认为是主观下线（`sdown`）
    
*   如果大多数 sentinel 都认为实例主观下线，则判定服务客观下线（`odown`）
    

故障转移步骤有哪些？

*   首先要在`sentinel`中选出一个`leader`，由 leader 执行`failover`
    
*   选定一个`slave`作为新的`master`，执行`slaveof noone`，切换到 master 模式
    
*   然后让所有节点都执行`slaveof` 新 master
    
*   修改故障节点配置，添加`slaveof` 新 master
    

sentinel 选举 leader 的依据是什么？

*   票数超过 sentinel 节点数量 1 半
    
*   票数超过 quorum 数量
    
*   一般情况下最先发起 failover 的节点会当选
    

sentinel 从 slave 中选取 master 的依据是什么？

*   首先会判断 slave 节点与 master 节点断开时间长短，如果超过`down-after-milliseconds` `* 10`则会排除该 slave 节点
    
*   然后判断 slave 节点的`slave-priority`值，越小优先级越高，如果是 0 则永不参与选举（默认都是 1）。
    
*   如果`slave-prority`一样，则判断 slave 节点的`offset`值，越大说明数据越新，优先级越高
    
*   最后是判断 slave 节点的`run_id`大小，越小优先级越高（`通过info server可以查看run_id`）。
    

### 2.5.RedisTemplate 连接哨兵集群

分为三步：

*   1）引入依赖
    
*   2）配置哨兵地址
    
*   3）配置读写分离
    

#### 2.5.1. 引入依赖

就是 SpringDataRedis 的依赖：

```
@Bean
public LettuceClientConfigurationBuilderCustomizer clientConfigurationBuilderCustomizer(){
    return clientConfigurationBuilder -> clientConfigurationBuilder.readFrom(ReadFrom.REPLICA_PREFERRED);
}
```

#### 2.5.2. 配置哨兵地址

连接哨兵集群与传统单点模式不同，不再需要设置每一个 redis 的地址，而是直接指定哨兵地址：

```properties
port 7000
cluster-enabled yes
cluster-config-file nodes.conf
cluster-node-timeout 5000
appendonly yes
```

#### 2.5.3. 配置读写分离

最后，还要配置读写分离，让 java 客户端将写请求发送到 master 节点，读请求发送到 slave 节点。定义一个 bean 即可：

```yaml
version: "3.2"

services:
  r1:
    image: redis
    container_name: r1
    network_mode: "host"
    entrypoint: ["redis-server", "--port", "7001", "--cluster-enabled", "yes", "--cluster-config-file", "node.conf"]
  r2:
    image: redis
    container_name: r2
    network_mode: "host"
    entrypoint: ["redis-server", "--port", "7002", "--cluster-enabled", "yes", "--cluster-config-file", "node.conf"]
  r3:
    image: redis
    container_name: r3
    network_mode: "host"
    entrypoint: ["redis-server", "--port", "7003", "--cluster-enabled", "yes", "--cluster-config-file", "node.conf"]
  r4:
    image: redis
    container_name: r4
    network_mode: "host"
    entrypoint: ["redis-server", "--port", "7004", "--cluster-enabled", "yes", "--cluster-config-file", "node.conf"]
  r5:
    image: redis
    container_name: r5
    network_mode: "host"
    entrypoint: ["redis-server", "--port", "7005", "--cluster-enabled", "yes", "--cluster-config-file", "node.conf"]
  r6:
    image: redis
    container_name: r6
    network_mode: "host"
    entrypoint: ["redis-server", "--port", "7006", "--cluster-enabled", "yes", "--cluster-config-file", "node.conf"]
```

这个 bean 中配置的就是读写策略，包括四种：

*   `MASTER`：从主节点读取
    
*   `MASTER_PREFERRED`：优先从`master`节点读取，`master`不可用才读取`slave`
    
*   `REPLICA`：从`slave`节点读取
    
*   `REPLICA_PREFERRED`：优先从`slave`节点读取，所有的`slave`都不可用才读取`master`
    

3.Redis 分片集群
------------

主从模式可以解决高可用、高并发读的问题。但依然有两个问题没有解决：

*   海量数据存储
    
*   高并发写
    

要解决这两个问题就需要用到分片集群了。分片的意思，就是把数据拆分存储到不同节点，这样整个集群的存储数据量就更大了。

Redis 分片集群的结构如图：![Redis集群架构及部署图](/posts/redis-cluster/img-29.png)

分片集群特征：

*   集群中有多个 master，每个 master 保存不同分片数据 ，解决海量数据存储问题
    
*   每个 master 都可以有多个 slave 节点 ，确保高可用
    
*   master 之间通过 ping 监测彼此健康状态 ，类似哨兵作用
    
*   客户端请求可以访问集群任意节点，最终都会被转发到数据所在节点
    

### 3.1. 搭建分片集群

Redis 分片集群最少也需要 3 个 master 节点，由于我们的机器性能有限，我们只给每个 master 配置 1 个 slave，形成最小的分片集群：![Redis集群架构及部署图](/posts/redis-cluster/img-30.png)

 计划 部署 的节点信息如下：

<table><tbody><tr><td>容器名</td><td>角色</td><td>IP</td><td>映射端口</td></tr><tr><td>r1</td><td>master</td><td>192.168.150.101</td><td>7001</td></tr><tr><td>r2</td><td>master</td><td>192.168.150.101</td><td>7002</td></tr><tr><td>r3</td><td>master</td><td>192.168.150.101</td><td>7003</td></tr><tr><td>r4</td><td>slave</td><td>192.168.150.101</td><td>7004</td></tr><tr><td>r5</td><td>slave</td><td>192.168.150.101</td><td>7005</td></tr><tr><td>r6</td><td>slave</td><td>192.168.150.101</td><td>7006</td></tr></tbody></table>

#### 3.1.1. 集群配置

分片集群中的 Redis 节点必须开启集群模式，一般在配置文件中添加下面参数：

```bash
ps -ef | grep redis
# 结果：
root       4822   4743  0 14:29 ?        00:00:02 redis-server *:7002 [cluster]
root       4827   4745  0 14:29 ?        00:00:01 redis-server *:7005 [cluster]
root       4897   4778  0 14:29 ?        00:00:01 redis-server *:7004 [cluster]
root       4903   4759  0 14:29 ?        00:00:01 redis-server *:7006 [cluster]
root       4905   4775  0 14:29 ?        00:00:02 redis-server *:7001 [cluster]
root       4912   4732  0 14:29 ?        00:00:01 redis-server *:7003 [cluster]
```

其中有 3 个我们没见过的参数：

*   `cluster-enabled`：是否开启集群模式
    
*   `cluster-config-file`：集群模式的配置文件名称，无需手动创建，由集群自动维护
    
*   `cluster-node-timeout`：集群中节点之间心跳超时时间
    

一般搭建部署集群肯定是给每个节点都配置上述参数，不过考虑到我们计划用`docker-compose`部署，因此可以直接在启动命令中指定参数，偷个懒。

在虚拟机的`/root`目录下新建一个`redis-cluster`目录，然后在其中新建一个`docker-compose.yaml`文件，内容如下：

```
# 进入任意节点容器
docker exec -it r1 bash
# 然后，执行命令
redis-cli --cluster create --cluster-replicas 1 \
192.168.22.88:7001 192.168.22.88:7002 192.168.22.881:7003 \
192.168.22.88:7004 192.168.22.88:7005 192.168.22.88:7006
```

**注意**：使用 Docker 部署 Redis 集群，network 模式必须采用 host

#### 3.1.2. 启动集群

进入`/root/redis-cluster`目录，使用命令启动 redis：

```
# 进入容器
docker exec -it r1 bash
# 进入redis-cli
redis-cli -p 7001
# 测试
set user jack
```

启动成功，可以通过命令查看启动进程：

```
# 通过7001连接集群
redis-cli -c -p 7001
# 存入数据
set user jack
```

可以发现每个 redis 节点都以 cluster 模式运行。不过节点与节点之间并未建立连接。

接下来，我们使用命令创建集群：

```
# 试一下key中带{}
set user:{age} 21

# 再试一下key中不带{}
set age 20
```

命令说明：

*   `redis-cli --cluster`：代表集群操作命令
    
*   `create`：代表是创建集群
    
*   `--cluster-replicas 1` ：指定集群中每个`master`的副本个数为 1
    
    *   此时`节点总数 ÷ (replicas + 1)` 得到的就是`master`的数量`n`。因此节点列表中的前`n`个节点就是`master`，其它节点都是`slave`节点，随机分配到不同`master`
        

输入命令后控制台会弹出下面的信息：![Redis集群架构及部署图](/posts/redis-cluster/img-31.png)

这里展示了集群中`master`与`slave`节点分配情况，并询问你是否同意。节点信息如下：

*   `7001`是`master`，节点`id`后 6 位是`da134f`
    
*   `7002`是`master`，节点`id`后 6 位是`862fa0`
    
*   `7003`是`master`，节点`id`后 6 位是`ad5083`
    
*   `7004`是`slave`，节点`id`后 6 位是`391f8b`，认`ad5083`（7003）为`master`
    
*   `7005`是`slave`，节点`id`后 6 位是`e152cd`，认`da134f`（7001）为`master`
    
*   `7006`是`slave`，节点`id`后 6 位是`4a018a`，认`862fa0`（7002）为`master`
    

输入`yes`然后回车。会发现集群开始创建，并输出下列信息：![Redis集群架构及部署图](/posts/redis-cluster/img-32.png)

接着，我们可以通过命令查看集群状态：

```
spring:
  redis:
    cluster:
      nodes:
        - 192.168.150.101:7001
        - 192.168.150.101:7002
        - 192.168.150.101:7003
        - 192.168.150.101:8001
        - 192.168.150.101:8002
        - 192.168.150.101:8003
```

结果： 

![Redis集群架构及部署图](/posts/redis-cluster/img-33.png)

### 3.2. 散列插槽

数据要分片存储到不同的 Redis 节点，肯定需要有分片的依据，这样下次查询的时候才能知道去哪个节点查询。很多数据分片都会采用一致性 hash 算法。而 Redis 则是利用散列插槽（**`hash slot`**）的方式实现数据分片。

详见官方文档：[Scale with Redis Cluster | Docs](https://redis.io/docs/latest/operate/oss_and_stack/management/scaling/#redis-cluster-101 "Scale with Redis Cluster | Docs")

 在 Redis 集群中，共有 16384 个`hash slots`，集群中的每一个 master 节点都会分配一定数量的`hash slots`。具体的分配在集群创建时就已经指定了：![Redis集群架构及部署图](/posts/redis-cluster/img-34.png)

如图中所示：

*   Master[0]，本例中就是 7001 节点，分配到的插槽是 0~5460
    
*   Master[1]，本例中就是 7002 节点，分配到的插槽是 5461~10922
    
*   Master[2]，本例中就是 7003 节点，分配到的插槽是 10923~16383
    

当我们读写数据时，Redis 基于`CRC16` 算法对`key`做`hash`运算，得到的结果与`16384`取余，就计算出了这个`key`的`slot`值。然后到`slot`所在的 Redis 节点执行读写操作。

不过`hash slot`的计算也分两种情况：

*   当`key`中包含`{}`时，根据`{}`之间的字符串计算`hash slot`
    
*   当`key`中不包含`{}`时，则根据整个`key`字符串计算`hash slot`
    

例如：

*   key 是`user`，则根据`user`来计算 hash slot
    
*   key 是`user:{age}`，则根据`age`来计算 hash slot
    

我们来测试一下，先于`7001`建立连接：

 报错：

![Redis集群架构及部署图](/posts/redis-cluster/img-35.png)

提示我们`MOVED 5474`，其实就是经过计算，得出`user`这个`key`的`hash slot` 是`5474`，而`5474`是在`7002`节点，不能在`7001`上写入！！

说好的任意节点都可以读写呢？

这是因为我们连接的方式有问题，连接集群时，要加`-c`参数：

 结果如下：

可以看到，客户端自动跳转到了`5474`这个`slot`所在的`7002`节点。

![Redis集群架构及部署图](/posts/redis-cluster/img-36.png)

现在，我们添加一个新的 key，这次加上`{}`：

结果如下：![Redis集群架构及部署图](/posts/redis-cluster/img-37.png)

### 3.3. 故障转移

分片集群的节点之间会互相通过 ping 的方式做心跳检测，超时未回应的节点会被标记为下线状态。当发现 master 下线时，会将这个 master 的某个 slave 提升为 master。

我们先打开一个控制台窗口，利用命令监测集群状态：

```
watch docker exec -it r1 redis-cli -p 7001 cluster nodes
```

命令前面的 watch 可以每隔一段时间刷新执行结果，方便我们实时监控集群状态变化。

接着，我们故技重施，利用命令让某个 master 节点休眠。比如这里我们让`7002`节点休眠，打开一个新的 ssh 控制台，输入下面命令：

```bash
docker exec -it r4 redis-cli -p 7004 DEBUG sleep 30
```

可以观察到，集群发现 7004 宕机，标记为下线： ![Redis集群架构及部署图](/posts/redis-cluster/img-38.png)

过了一段时间后，7004 原本的小弟 7002 变成了`master`：![Redis集群架构及部署图](/posts/redis-cluster/img-39.png)

而 7004 被标记为`slave`，而且其`master`正好是 7002，主从地位互换。 

### 3.4. 总结

Redis 分片集群如何判断某个 key 应该在哪个实例？

*   将 16384 个插槽分配到不同的实例
    
*   根据 key 计算哈希值，对 16384 取余
    
*   余数作为插槽，寻找插槽所在实例即可
    

如何将同一类数据固定的保存在同一个 Redis 实例？

*   Redis 计算 key 的插槽值时会判断 key 中是否包含`{}`，如果有则基于`{}`内的字符计算插槽
    
*   数据的 key 中可以加入`{类型}`，例如 key 都以`{typeId}`为前缀，这样同类型数据计算的插槽一定相同
    

### 3.5.Java 客户端连接分片集群（选学）

RedisTemplate 底层同样基于 lettuce 实现了分片集群的支持，而使用的步骤与哨兵模式基本一致，参考`2.5节`：

1）引入 redis 的 starter 依赖

2）配置分片集群地址

3）配置读写分离

与哨兵模式相比，其中只有分片集群的配置方式略有差异，如下：

资料获取
----

> 链接：https://pan.baidu.com/s/1z08p65lEyWvkd7IAQ2eDyQ   
> 提取码：6666
