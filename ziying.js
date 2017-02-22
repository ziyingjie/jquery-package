/**
 * Created by Ziying on 2015/10/21.
 */
(function (window, undefined) {

    /* ----- 接口函数Ziying ---- */
    function Ziying(html) {
        return new Ziying.fn.init(html);
    }



    /* ----- Ziying原型 ---- */
    //设置原型引用地址 fn
    Ziying.fn = Ziying.prototype = {
        constructor: Ziying,

        length: 0,
        selector: '',
        type: 'Ziying',

        //初始化事件对象
        events: {},

        init: function (html) {
            // html 是 null,''
            if (html === null || html === '') {
                return;
            }

            // html 是 function
            if (typeof html == 'function') {
                // 重设 onload 方法
                var oldFn = onload;
                // oldFn 是 function
                if (typeof oldFn === 'function') {
                    onload = function () {
                        oldFn();
                        html();
                    };
                }
                else {
                    onload = html;
                }
                return;
            }

            //html 是 string
            if (Ziying.isString(html)) {
                // html 字符串
                if (/^\</.test(html)) {
                    // 将select查询到的html标签 添加到实例中
                    push.apply(this, parseHTML(html))
                }
                else {
                    // 选择器 字符串
                    push.apply(this, Ziying.select(html));
                    // 将选择器字符串存储在selector属性中
                    this.selector = html;
                }
            }

            //html 是 Ziying对象
            if (html && html.type === 'Ziying') {

                //  实例继承传入对象的所有成员
                push.apply(this, html);
                this.selector = html.selector;
                // 给实例绑定html可能绑定的事件
                this.events = html.events;
            }

            // html 是 DOM对象
            if (html && html.nodeType) {
                [].push.call(this, html);
            }
        }

    };

    // 传递Ziying.fn引用地址给init.prototype
    Ziying.fn.init.prototype = Ziying.fn;

    // 添加extend成员
    Ziying.extend = Ziying.fn.extend = function (obj) {
        for (var k in obj) {
            this[k] = obj[k];
        }
    };

    /* ----  parseHTML 字符串转换为dom对象 ---- */
    var parseHTML = (function () {
        // 在函数外部生成div，避免每次调用都重新创建，浪费资源
        var div = document.createElement('div');
        function parseHTML(html) {
            div.innerHTML = html;
            var res = [];
            for (var i = 0; i < div.childNodes.length; i++) {
                res.push(div.childNodes[i]);
            }
            // 用完销毁，防止内存泄漏
            div.innerHTML = '';
            return res;
        }
        return parseHTML;
    })();

    /* ---- select 核心选择器引擎 ---- */
    var select = (function () {

        /* ---- 能力检测模块 ---- */

        // { [ native code ] } 方法定义检测正则
        var rnative = /\{\s*\[native/;

        // 通过support的值来进行判断，是否在低版本IE中能够使用
        var support = {};

        //  document.querySelectorAll
        support.qsa = rnative.test(document.querySelectorAll + '');

        //  getElementsByClassName
        support.getElementsByClassName = rnative.test(document.querySelectorAll + '');

        //  trim
        support.trim = rnative.test(String.prototype.trim + '');

        //  indexOf
        support.indexOf = rnative.test(Array.prototype.indexOf + '');

        // 清除字符串两端空格
        var rtrim = /^\s+|\s+$/g;

        // 选择器筛选
        // -----------------------    id   -----  类名  --- * --- tag ---
        var rbaseselector = /^(?:\#([\w\-]+)|\.([\w\-]+)|(\*)|(\w+))$/;

        //  push
        var push = Array.prototype.push;

        try {
            // 构造环境进行浏览器检测是否支持伪数组借调 push 方法
            var div = document.createElement('div');
            div.innerHTML = '<p>test</p>';
            var t = [];
            push.apply(t, div.getElementsByTagName('p'));
        }
        catch (e) {
            push = {
                apply: function (arr1, arr2) {
                    for (var i = 0; i < arr2.length; i++) {
                        arr1[arr1.length] = arr2[i];
                    }
                }
            };
        }

        /* ---- 处理trim方法的兼容性  myTrim ---- */
        function myTrim(str) {
            if (support.trim) {
                return str.trim();
            }
            else {
                return str.replace(rtrim, '');
            }
        }

        /* ---- 处理indexOf方法的兼容性  myIndexOf  ---- */
        function myIndexOf(arr, obj, startIndex) {
            startIndex = startIndex || 0;
            if (support.indexOf) {
                return arr.indexOf(obj, startIndex);
            }
            else {
                for (var i = startIndex; i < arr.length; i++) {
                    if (arr[i] == obj) {
                        return i;
                    }
                }
                return -1;
            }
        }

        /* ---- 元素去重  unique ---- */
        function unique(arr) {
            var tempArr = [];
            for (var i = 0; i < arr.length; i++) {
                if (myIndexOf(tempArr, arr[i]) == -1) {
                    tempArr.push(arr[i]);
                }
            }
            return tempArr;
        }

        /* ---- 处理getElementsByClassName的兼容性  getByClassName ----
        *   参数说明
        *   @className: 类名字符串
        *   @node: caller
        * */
        function getByClassName(className, node) {
            var allEle,
                res = [],
                i;
            node = node || document;

            // 方法能力检测
            if (support.getElementsByClassName) {
                return node.getElementsByClassName(className);
            }
            else {
                allEle = node.getElementsByTagName('*');
                for (i = 0; i < allEle.length; i++) {
                    if ((' ' + allEle.className + ' ').indexOf(' ' + className + ' ') > -1) {
                        res.push(allElem[i]);
                    }
                }
                return res;
            }
        }

        /* ---- basicSelect 基本选择器引擎  ---- */
        function basicSelect(selector, node) {
            node = node || document;
            var m,
                res;
            if (m = rbaseselector.exec(selector)) {

                // id选择器
                if (m[1]) {
                    // 模拟 jQuery 的id选择器特点:如果没有该对象则返回一个空数组
                    res = node.getElementById(m[1]);
                    if (res) {
                        return [res];
                    }
                    else {
                        return [];
                    }
                }

                // 类名选择器
                else if (m[2]) {
                    return getByClassName(m[2], node);
                }

                // 通配符选择器
                else if (m[3]) {
                    return node.getElementsByTagName(m[3]);
                }

                // 普通标签选择器
                else if (m[4]) {
                    return node.getElementsByTagName(m[4]);
                }
            }
            return [];
        }

        /* ---- descendant 后代选择器引擎  ---- */
        function descendant(selector, results) {
            results = results || [];
            selector = myTrim(selector);
            var selectors = selector.split(" ");
            var arr = [],
                node = [document];
            for (var i = 0; i < selectors.length; i++) {
                for (var j = 0; j < node.length; j++) {
                    push.apply(arr, basicSelect(selectors[i], node[j]));
                }
                node = arr;
                arr = [];
            }
            push.apply(results, node);
            return unique(results);
        }


        /* ---- select 复合选择器引擎 ---- */
        //  将basicSelect 和 descendant组装
        function select(selector, results) {
            results = results || [];
            var selectors, subSelector;

            // selector 是 string
            if (typeof selector != 'string') {
                return [];
            }
            // 如果querySelectorAll存在，则直接调用 document.querySelectorAll
            if (support.qsa) {
                push.apply(results, document.querySelectorAll(selector));
            }

            // 进入自定义选择器引擎
            else {
                selectors = selector.split(",");
                for (var i = 0; i < selectors.length; i++) {

                    //  去除每一项两端的空格
                    subSelector = myTrim(selectors[i]);

                    // 是基本选择器
                    if (rbaseselector.test(subSelector)) {
                        push.apply(results, basicSelect(subSelector));
                    }

                    // 是后代选择器
                    else {
                        descendant(subSelector, results);
                    }
                }
            }
            return unique(results);
        }
        return select;
    })();

    // 这里是库加载，将自定义select引擎添加给Ziying
    Ziying.select = select;

    /* ---- 数组方法模块 ---- */
    Ziying.extend({

        // isString 检测是否为字符串
        isString: function (data) {
            return typeof data === 'string';
        },

        // each
        each: function (arr, func) {
            var i;
            if (arr instanceof Array || arr.length >= 0) {
                for (i = 0; i < arr.length; i++) {
                    func.call(arr[i], i, arr[i]);
                }
            }
            else {
                for (var k in arr) {
                    func.call(arr[k], k, arr[k]);
                }
            }
            return arr;
        },

        // map
        map: function (arr, func) {
            var res = [], temp;
            if (arr instanceof Array || arr.length >= 0) {
                for (var i = 0; i < arr.length; i++) {
                    temp = func.call(arr[i], i, arr[i]);

                    // 不管func函数的执行结果如何，都作为map映射的结果存储到res中
                    if (temp != null) {
                        res.push(temp);
                    }
                }
            }
            else {
                for (var k in arr) {
                    temp = func.call(arr[k], k, arr[k]);
                    if (temp != null) {
                        res.push(temp);
                    }
                }
            }
            return res;
        },

        // prependChild
        prependChild: function (parent, element) {
            var first = parent.firstChild;
            parent.insertBefore(element, first);
        }
    });

    /*---- DOM操作模块 ----*/
    Ziying.fn.extend({
        // appendTo
        appendTo: function (selector) {

            // 初始化为Ziying对象
            var iObj = this.constructor(selector);

            var newObj = this.constructor();
            for (var i = 0; i < this.length; i++) {
                for (var j = 0; j < iObj.length; j++) {
                    var temp = j == iObj.length - 1
                        ? this[i]
                        : this[i].cloneNode(true);
                    Array.prototype.push.call(newObj, temp);
                    iObj[j].appendChild(temp);
                }
            }
            return newObj;
        },

        // append
        append: function (selector) {
            L(selector).appendTo(this);
            return this;
        },

        // prependTo
        prependTo: function (selector) {
            // selector是父容器
            var iObj = this.constructor(selector);
            var newObj = this.constructor();
            for (var i = 0; i < this.length; i++) {
                for (var j = 0; j < iObj.length; j++) {
                    var temp = j == iObj.length - 1
                        ? this[i]
                        : this[i].cloneNode(true);
                    push.call(newObj, temp);
                    Ziying.prependChild(iObj[j], temp);
                }
            }
            return newObj;
        },

        // prepend
        prepend: function (selector) {
            this.constructor(selector).prependTo(this);
            return this;
        },

        // toArray
        toArray: function () {
            var res = [];
            for (var i = 0; i < this.length; i++) {
                res.push(this[i]);
            }
            return res;
        },

        // get
        get: function (index) {
            if (index === undefined) {
                return this.toArray();
            }
            return this[index];
        },

        // eq
        eq: function (num) {
            // 可能为dom对象
            var dom;
            if (num >= 0) {
                dom = this.get(num);
            }
            else {
                dom = this.get(this.length + num);
            }
            return this.constructor(dom);
        },

        // each
        each: function (func) {
            return Ziying.each(this, func);
        },

        //map
        map: function (func) {
            return Ziying.map(this, func);
        }
    });


    /*---- 事件模块 ----*/
    Ziying.fn.extend({

        //  on
        on: function (type, fn) {
            if (!this.events[type]) {
                this.events[type] = [];
                // 给当前dom元素添加 处理事件

                //this是Ziying对象
                var that = this;
                this.each(function () {

                    //this是dom对象，因为在each里
                    var f = function (e) {
                        for (var i = 0; i < that.events[type].length; i++) {
                            that.events[type][i].call(this, e);
                        }
                    };
                    if (this.addEventListener) {
                        this.addEventListener(type, f);
                    }
                    //兼容ie低版本
                    else {
                        this.attachEvent('on' + type, f);
                    }
                });
            }
            this.events[type].push(fn);
            return this;
        },

        //  off
        off: function (type, fn) {
            //删除某些事件
            //遍历数组，从数组中删除函数
            var arr = this.events[type];
            if (arr) {
                for (var i = 0; i < arr.length; i++) {
                    if (arr[i] == fn) {
                        break;
                    }
                }
                if (i != arr.length) {
                    arr.splice(i, 1);
                }
            }
        }
    });


    /* ---- 混入事件类型 ---- */
    Ziying.each(( "blur focus focusin focusout load resize scroll unload click dblclick " +
    "mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
    "change select submit keydown keypress keyup error contextmenu" )
        .split(' '),
        function (i, v) {
            Ziying.fn[v] = function (fn) {
                this.on(v, fn);
                return this;
            };
        }
    );


    /* ---- class操作模块 ---- */
    Ziying.fn.extend({

        // addClass
        addClass: function (name) {
            this.each(function (k, v) {
                var classTxt = this.className;
                if (classTxt) {
                    // 判断是否含有该类样式
                    if ((' ' + classTxt + ' ').indexOf(' ' + name + ' ') == -1) {
                        v.className += ' ' + name;
                    }
                }
                else {
                    this.className = name;
                }
            });
            return this;
        },

        // removeClass
        removeClass: function (name) {
            return this.each(function () {
                var classTxt = ' ' + this.className + ' ';
                var rclassName = new RegExp(' ' + name + ' ', 'g');
                this.className = classTxt
                    .replace(rclassName, ' ')
                    .replace(/\s+/g, ' ')
                    .trim();
            });
        },

        // hasClass
        hasClass: function (name) {
            for (var i = 0; i < this.length; i++) {
                if ((' ' + this[i].className + ' ').indexOf(' ' + name + ' ') != -1) {
                    return true;
                }
            }
            return false;
        },

        // toggleClass
        toggleClass: function (name) {
            if (this.hasClass(name)) {
                this.removeClass(name);
            }
            else {
                this.addClass(name);
            }
            return this;
        }
    });

    /* ---- css样式模块 ---- */
    Ziying.extend({

        // getStyle 获取样式属性
        getStyle: function (o, name) {
            if (o.currentStyle) {
                return o.currentStyle[name];
            }
            else {
                return window.getComputedStyle(o)[name];
            }
        },

        // getTxt 获取文本节点
        getTxt: function (node, list) {
            var arr = node.childNodes;
            for (var i = 0; i < arr.length; i++) {
                //如果是文本节点
                if (arr[i].nodeType === 3) {
                    list.push(arr[i]);
                }
                //如果是元素节点，递归
                if (arr[i].nodeType === 1) {
                    getTxt(arr[i], list);
                }
            }
        }
    });
    Ziying.fn.extend({
        // css
        css: function (option) {
            var len = arguments.length,
                args = arguments;

            // css(key, value)
            if (len === 2) {
                //判断键值
                if (Ziying.isString(args[0]) && Ziying.isString(args[1])) {
                    return this.each(function () {
                        this.style[args[0]] = args[1];
                    })
                }
            }

            // css( {key: value} )   / css( key )
            else if (len === 1) {

                // css( key )
                if (Ziying.isString(option)) {
                    return this[0].style[option] || Ziying.getStyle(this[0], option);
                }

                // css( {key: value, key: value} )
                else if (typeof option == 'object') {
                    return this.each(function () {
                        for (var k in option) {
                            this.style[k] = option[k];
                        }
                    })
                }
            }
        },

        // hover
        hover: function (f1, f2) {
            return this.mouseover(f1).mouseout(f2);
        },

        // toggle
        toggle: function () {
            var i = 0;
            var args = arguments;
            this.on('click', function (e) {
                args[i % args.length].call(this, e);
                i++;
            })
        }
    });

    /* ---- 属性操作模块 ---- */
    Ziying.fn.extend({

        // attr
        attr: function (name, value) {

            // attr对应的是setAttribute方法
            if (value) {
                // 传递两个参数
                if (Ziying.isString(name) && Ziying.isString(value)) {
                    return this.each(function (k, v) {
                        this.setAttribute(name, value);
                    })
                }
            }

            //prop对应的是.name
            else {
                if (Ziying.isString(name)) {
                    return this[0].getAttribute(name);
                }
            }
            return this;
        },

        // prop
        prop: function (name, value) {
            if (value) {
                if (Ziying.isString(name) && Ziying.isString(value)) {
                    return this.each(function (k, v) {
                        this[name] = value;
                    })
                }
            }
            else {
                if (Ziying.isString(name)) {
                    return this[0][name];
                }
            }
            return this;
        },

        // val
        val: function (value) {
            if (value) {
                return this.attr('value', value);
            }
            else {
                return this.attr('value');
            }
        }
    });

    /* ---- html，text 模块 ---- */
    Ziying.fn.extend({

        // html
        html: function (html) {
            return this.prop('innerHTML', html);
        },

        // text
        text: function (txt) {
            if (txt) {
                //保持链式
                return this.each(function () {
                    this.innerHTML = '';
                    this.appendChild(document.createTextNode(txt + ''))
                });
            }
            else {
                var arr = [];
                Ziying.getTxt(this[0], arr);
                return arr.join(' ');
            }
        }
    });

    /* ---- 暴露接口 ---- */
    //给window对象添加成员 Ziying, L, 成员的值是Ziying框架对象
    window.Ziying = window.L = Ziying;
})(window);
