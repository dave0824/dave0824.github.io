---
layout: post
title:  "阻塞队列详解"
data: 2020年6月2日15:15:05
categories: java
tags:  java BlockQueue
author: dave
---

* content
{:toc}

## 前言
本文为对阻塞队列的总结




## 什么是阻塞队列？
阻塞队列,顾名思义,首先它是一个队列,而一个阻塞队列在数据结构中所起的作用大致如图所示:
![BlockingQueue](https://github.com/dave0824/dave0824.github.io/blob/master/asset/juc/BlockingQueue.jpg?raw=true)

- 当阻塞队列是空时,从队列中获取元素的操作将会被阻塞。
- 当阻塞队列是满时,往队列中添加元素的操作将会被阻塞。
- 同样的，当试图往已满的阻塞队列中添加新元素的线程同样也会被阻塞,直到其他线程从队列中移除一个或者多个元素或者全清空队列后使队列重新变得空闲起来并后续新增。

## 阻塞队列的用处
在多线程领域中，所谓的阻塞,在某些情况下会挂起线程(即线程阻塞),一旦条件满足,被挂起的线程优先被自动唤醒。
在concurrent包 发布以前,在多线程环境下,我们每个程序员都必须自己去控制线程的阻塞与唤醒,尤其还要兼顾效率和线程安全,而这会给我们的程序带来不小的复杂度。使用BlockingQueue后，我们不需要关心什么时候需要阻塞线程,什么时候需要唤醒线程,因为BlockingQueue都一手给你包办好了。

## BlockingQueue的核心方法

![BlockingQueue-method](https://github.com/dave0824/dave0824.github.io/blob/master/asset/juc/BlockingQueue-method.bmp?raw=true)

- 抛出异常
当阻塞队列满时,再往队列里面add插入元素会抛IllegalStateException: Queue full
当阻塞队列空时,再往队列Remove元素时候回抛出NoSuchElementException
- 特殊值	
插入方法,成功返回true 失败返回false
移除方法,成功返回元素,队列里面没有就返回null
- 一直阻塞
当阻塞队列满时,生产者继续往队列里面put元素,队列会一直阻塞直到put数据or响应中断退出。
当阻塞队列空时,消费者试图从队列take元素,队列会一直阻塞消费者线程直到队列可用。
- 超时退出
当阻塞队列满时,队列会阻塞生产者线程一定时间,超过后限时后生产者线程就会退出。

## BlockingQueue实现类

BlockingQueue的继承接口与实现类架构图

![BlockingQueue-class-image](https://github.com/dave0824/dave0824.github.io/blob/master/asset/juc/BlockingQueue-class-image.bmp?raw=true)

1. ArrayBlockingQueue ：一个由数组结构组成的有界阻塞队列。
2. LinkedBlockingQueue ：一个由链表结构组成的有界阻塞队列。
3. PriorityBlockingQueue ：一个支持优先级排序的无界阻塞队列。
4. DelayQueue：一个使用优先级队列实现的无界阻塞队列。
5. SynchronousQueue：一个不存储元素的阻塞队列。
6. LinkedTransferQueue：一个由链表结构组成的无界阻塞队列。
7. LinkedBlockingDeque：一个由链表结构组成的双向阻塞队列

## ArrayBolckingQueue 和 LinkedBlockingQueue

ArrayBlockingQueue和LinkedBlockingQueue是最为常用的阻塞队列，前者使用一个有边界的数组来作为存储介质，而后者使用了一个没有边界的链表来存储数据。

### ArrayBlockingQueue

ArrayBlockingQueue需要你提供数组的大小，下面是ArrayBlockingQueue提供的三个构造函数：

```java

public ArrayBlockingQueue(int capacity): // 初始化数组大小，构造函数内部会默认将ReentrantLock设置为不公平锁。

public ArrayBlockingQueue(int capacity, boolean fair): //初始化数组大小，并且将ReentrantLock设定是否为公平锁
 
public ArrayBlockingQueue(int capacity, boolean fair, Collection<? extends E> c) //初始化数组大小，设置ReentrantLock是否是为公平锁，然后使用一个集合初始化阻塞队列

```
其中的capacity是设置的初始容量，fair是设置ReentrantLock是否为公平锁。阻塞队列的内部实现是采用ReentrantLock加锁的。

ArrayBlockingQueue类中的主要成员变量
```java

    /** The queued items */
    final Object[] items;

    /** items index for next take, poll, peek or remove */
    int takeIndex;

    /** items index for next put, offer, or add */
    int putIndex;

    /** Number of elements in the queue */
    int count;

    /*
     * Concurrency control uses the classic two-condition algorithm
     * found in any textbook.
     */

    /** Main lock guarding all access */
    final ReentrantLock lock;

    /** Condition for waiting takes */
    private final Condition notEmpty;

    /** Condition for waiting puts */
    private final Condition notFull;

```
ArrayBlockingQueue使用了ReentrantLock来做同步，使用两个Condition来做插入同步和获取同步。下面是两个重要的方法，一个用于将一个元素插入队列中去，一个用于从队列中获取一个元素，并且从队列中删除：
```java
	
    private void enqueue(E x) {
        // assert lock.getHoldCount() == 1;
        // assert items[putIndex] == null;
        final Object[] items = this.items;
        items[putIndex] = x;
        if (++putIndex == items.length)
            putIndex = 0;
        count++;
        notEmpty.signal(); // 唤醒任意一个等待在notEmpty这个条件变量上的线程
    }

```
notEmpty这个条件变量用于表示队列是否有数据，插入数据势必会让队列不为空，而在插入数据之前，可能会有线程已经尝试来获取数据了，那么就会等待在这个条件变量上面，那么当插入数据之后，需要唤醒这些线程，为了减少不必要的麻烦，这个条件变量在插入一个数据之后仅仅唤醒一个等待在这个条件变量上的线程。

还有一点需要注意，这个数组的使用配合了两个游标变量：takeIndex和putIndex，配合这两个变量之后数组的使用就像是一个环形队列一样了。注意，可能有人担心会有一种情况，队列满了之后没有消费线程，再次插入第一个队列的元素会被覆盖吗？这就多虑了，具体我们看下面的代码：
```java

    public void put(E e) throws InterruptedException {
        checkNotNull(e);
        final ReentrantLock lock = this.lock;
        lock.lockInterruptibly();
        try {
            while (count == items.length)
                notFull.await();
            enqueue(e);
        } finally {
            lock.unlock();
        }
    }


       private E dequeue() {
        // assert lock.getHoldCount() == 1;
        // assert items[takeIndex] != null;
        final Object[] items = this.items;
        @SuppressWarnings("unchecked")
        E x = (E) items[takeIndex];
        items[takeIndex] = null;
        if (++takeIndex == items.length)
            takeIndex = 0;
        count--;
        if (itrs != null)
            itrs.elementDequeued();
        notFull.signal();
        return x;
    }

```
上面的代码展示了put操作的细节，可以很明显的看到，当数组中的元素数量达到设定的容量之后就会在notFull这个条件变量上等待，而不会再次调用enqueue这个方法来插入，所以不会出现上面的那种情况。

上面的代码展示了获取一个队列元素的方法细节。依然需要关注的是notFull.signal()，这句话的意思是：唤醒一个等待在notFull这个条件变量上的线程。具体的语义是什么呢？就是，有可能有线程在进行插入操作的时候会发现队列被用完了，那么就会阻塞到notFull这个条件变量上，当某个线程获取了一个元素之后，队列就有空闲的空间可以插入了，那么就可以唤醒一个等待在这个条件变量上的线程了，具体就是唤醒一个等待插入的线程开始活动。
下面具体分析一下几个重要的方法：
1. put（o）
该方法是一个阻塞方法，在操作不能立刻得到执行的时候会阻塞等待。具体的就是，如果发现队列使用的数组没有可用的容量了，那么就等待在一个条件变量上，而这个条件变量需要在有空闲空间的时候唤醒等待在他上面的线程。

2. offer(e)
该方法在插入操作不能立即执行的时候就会返回false，否则会返回true代表插入成功了。具体的细节见下面的代码：
```java

  public boolean offer(E e) {
        checkNotNull(e);
        final ReentrantLock lock = this.lock;
        lock.lock();
        try {
            if (count == items.length)
                return false;
            else {
                enqueue(e);
                return true;
            }
        } finally {
            lock.unlock();
        }
    }
```
3. offer(e, timeout, unit)
和offer（e）一样在操作不能执行的时候就会返回特殊值，不同的是会等待一段时间，然后再返回。

4. take()
take操作会在获取元素失败的时候阻塞直达有线程唤醒它。下面是具体的细节：
```java

    public E take() throws InterruptedException {
        final ReentrantLock lock = this.lock;
        lock.lockInterruptibly();
        try {
            while (count == 0)
                notEmpty.await();
            return dequeue();
        } finally {
            lock.unlock();
        }
    }
```
5. poll()
poll和offer类似，只是poll从队列中获取数据，而offer插入数据。

6. poll(timeout, unit)
和offer(o, timeout, unit) 类似

7. peek()
```java

    public E peek() {
        final ReentrantLock lock = this.lock;
        lock.lock();
        try {
            return itemAt(takeIndex); // null when queue is empty
        } finally {
            lock.unlock();
        }
    }

```
peek操作会取得队列头的内容，但是不会将其从队列中删除，下次peek还是同样的内容。

8. remove（e）方法
队列可以插入，可以获取，当然还可以删除，remove（e）方法只会删除第一个匹配的元素，remove(e)方法借助removeAt（index）方法来删除一个元素，在删除成功的时候会返回true，否则会返回false。下面具体分析一下removeAt（index）这个方法:
```java

    void removeAt(final int removeIndex) {
        // assert lock.getHoldCount() == 1;
        // assert items[removeIndex] != null;
        // assert removeIndex >= 0 && removeIndex < items.length;
        final Object[] items = this.items;
        if (removeIndex == takeIndex) {
            // removing front item; just advance
            items[takeIndex] = null;
            if (++takeIndex == items.length)
                takeIndex = 0;
            count--;
            if (itrs != null)
                itrs.elementDequeued();
        } else {
            // an "interior" remove

            // slide over all others up through putIndex.
            final int putIndex = this.putIndex;
            for (int i = removeIndex;;) {
                int next = i + 1;
                if (next == items.length)
                    next = 0;
                if (next != putIndex) {
                    items[i] = items[next];
                    i = next;
                } else {
                    items[i] = null;
                    this.putIndex = i;
                    break;
                }
            }
            count--;
            if (itrs != null)
                itrs.removedAt(removeIndex);
        }
        notFull.signal();
    }
```
删除的思路就是：和删除数组中的元素一样，需要移动数组，所以这个操作是比较耗时的，在删除一个元素完成后，有可能有线程等待在插入元素的条件变量上，而现在有空闲的空间可以插入元素了，所以需要唤醒一个等待的线程让他插入元素。

### LinkedBlockingQueue

LinkedBlockingQueue使用链表来作为队列的数据结构，下面就是链表节点的数据结构：
```java
    static class Node<E> {
        E item;

        /**
         * One of:
         * - the real successor Node
         * - this Node, meaning the successor is head.next
         * - null, meaning there is no successor (this is the last node)
         */
        Node<E> next;

        Node(E x) { item = x; }
    }
```
下面展示了LinkedBlockingQueue的关键成员变量：
```java

/** The capacity bound, or Integer.MAX_VALUE if none */
    private final int capacity;

    /** Current number of elements */
    private final AtomicInteger count = new AtomicInteger();

    /**
     * Head of linked list.
     * Invariant: head.item == null
     */
    transient Node<E> head;

    /**
     * Tail of linked list.
     * Invariant: last.next == null
     */
    private transient Node<E> last;

    /** Lock held by take, poll, etc */
    private final ReentrantLock takeLock = new ReentrantLock();

    /** Wait queue for waiting takes */
    private final Condition notEmpty = takeLock.newCondition();

    /** Lock held by put, offer, etc */
    private final ReentrantLock putLock = new ReentrantLock();

    /** Wait queue for waiting puts */
    private final Condition notFull = putLock.newCondition();
```
需要注意的是，LinkedBlockingQueue的插入操作和获取数据的操作使用了不同的锁。


### 总结

LinkedBlockingQueue和ArrayBlockingQueue是一样的，只是ArrayBlockingQueue使用数组做队列，而LinkedBlockingQueue使用链表做队列。如何选择哪种阻塞队列和如何选择数组和链表这两种数据结构的思路是一样的，对于频繁进行队列元素获取操作的场景下，首选ArrayBlockingQueue，而在需要频繁进行队列元素删除、添加的场景下首选LinkedBlockingQueue。














