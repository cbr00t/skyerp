(function() {

  // html模板
  var SELECTBOX = '\
    <div class="SelectBox" {{disabled}} {{readonly}} {{multiple}} style="{{style}}" >\
      {{TMP}}\
      <i class="icon"></i>\
    </div>\
  ';

  // 工具函数
  var utils = {
    // 字符串模板替换
    tpl: function(tpls, data) {
      return tpls.replace(/{{(.*?)}}/g, function($1, $2) {
        return data[$2] === undefined ? $1 : data[$2];
      });
    },
    // 字符串模板替换, 属性替换, 比如disabled属性, true就添加,false就移除
    tplForAttr: function(tpls, data) {
      return tpls.replace(/{{(.*?)}}/g, function($1, $2) {
        return data[$2] ? $1.replace(/({{)|(}})/g, '') : '';
      });
    },
    // 是否为数组
    isArray: function(obj) {
      return Object.prototype.toString.call(obj) === '[object Array]';
    },
    // 添加/移除 属性
    attr: function(elements, name, isAdd) {
      if (isAdd) {
        elements.attr(name, '');
      } else {
        elements.removeAttr(name);
      }
    },
    // 获取窗口剩余高度
    getAvailabHeight: function(element) {
      return ($(window).height() + $(window).scrollTop()) - (element.offset().top + element.outerHeight());
    },
    // 获取窗口剩余顶部
    getAvailabTop: function(element) {
      return element.offset().top;
    },
    // 提取数组特定字段生成数组字符串
    fieldToArrayStr: function(array, field, notBrackets) {
      if (!utils.isArray(array)) {
        return array ? array[field] : '';
      }
      if (array.length === 0) {
        return '请选择';
      }
      var arr = [];
      for (var i = 0; i < array.length; ++i) {
        arr.push(array[i][field]);
      }
      return notBrackets ? arr.toString() : '[' + arr.toString() + ']';
    },
    // 获取option元素数据
    optionToData: function(option) {
      var data = {
        type: 'option',
        label: option.text(),
        value: option.val(),
        selected: option.get(0).selected,
        disabled: option.attr('disabled') !== undefined,
        inGroup: option.parent().is('optgroup'),
        option: option
      };
      return data;
    },
    // 获取元素文档位置
    offset: function(ele) {
      var p = ele.offset();
      return {
        top: p.top + ele.outerHeight(),
        left: p.left
      };
    },
    /**
     * 根据索引获取option
     * @param  {Object} select select元素
     * @param  {Number} index  索引
     * @return {Object}        索引元素
     */
     getOptionForIndex: function(select, index) {
      index = index === undefined ? select[0].selectedIndex : parseInt(index);
      return select.find('option').eq(index);
     },
    /**
     * 根据value获取option
     * @param  {Object} select select元素
     * @param  {String} value  值
     * @return {Object}        索引元素
     */
     getOptionForValue: function(select, value) {
      var option = select.find('option[value="' + value + '"]');
      return option.length == 0 ? select.find('option').eq(select[0].selectedIndex) : option;
     }
  };

  //判断:当前元素是否是被筛选元素的子元素或者本身 
  jQuery.fn.isChildAndSelfOf = function(b){
    return (this.closest(b).length > 0); 
  };

  var SelectBox = function(select, opt) {
    if (select[0].selectBox) {
      select[0].selectBox.destroy();
    }
    var options = {
      // select模板, 由2个值参数 {{value}},{{label}}
      selectTmp: '<div class="inner" value="{{value}}" title="{{label}}" >{{label}}</div>',
      // option模板, 由2个值参数 {{value}},{{label}}, 3个属性参数{{inGroup}},{{selected}},{{disabled}}
      optionTmp: '<dd class="option {{inGroup}}" {{selected}} {{disabled}} value="{{value}}" >{{label}}</dd>'
    };

    this.select = select;
    this.status = {
      readonly: false,
      disabled: false,
      multiple: false,
      style: ''
    };
    // 参数
    this.opt = $.extend({}, options, opt);
    // 当前选中项
    this.current = null;
    // 虚拟selextbox
    this.selectBox = null;
    // 虚拟dropdown
    this.dropdown = null;
    // dropdown是否显示
    this.isShow = false;
    // 加入管理器
    SelectBox.add(this);
    // 创建selextbox
    this.renderSelectBox();
    select[0].selectBox = this;
  };

  // 原型
  SelectBox.prototype = {
    get readonly() {
      return this.status.readonly;
    },
    set readonly(readonly) {
      var select = $(this.select).add(this.selectBox);
      this.status.readonly = readonly;
      utils.attr(select, 'readonly', readonly);
    },
    get disabled() {
      return this.status.disabled;
    },
    set disabled(disabled) {
      var select = $(this.select).add(this.selectBox);
      this.select[0].disabled = disabled;
      this.status.disabled = disabled;
      utils.attr(select, 'disabled', disabled);
    },
    get multiple() {
      return this.status.multiple;
    },
    set multiple(multiple) {
      var select = $(this.select).add(this.selectBox);
      this.select[0].multiple = multiple;
      this.status.multiple = multiple;
      utils.attr(select, 'multiple', multiple);
      this.renderSelectBox();
    },
    set options(data) {
      if (!utils.isArray(data) || data.length <= 0)
        return;

      var defaultOpt = {
        disabled: false,
        inGroup: false,
        selected: false,
        type: 'option',
        label: '',
        value: ''
      };

      // 确保数据结构完整
      $.each(data, function(i) {
        var option = this;
        if (option.hasOwnProperty('value')) {
          // 一个option
          data[i] = $.extend({}, defaultOpt, option);
        } else {
          // 一个group
          data[i] = $.extend({}, {label: ''}, option);
        }
      });

      // 注入数据
      this.inject(data);
    },
    // 销毁
    destroy: function() {
      this.hide();
      this.selectBox.remove();
      this.selectBox = null;
      this.select.show();
      SelectBox.remove(this);
    },
    // 提取options数据
    extract: function() {
      return SelectBox.extract(this.select);
    },
    // 注入数据到select
    inject: function(data) {
      var options = $();
      var lastGroup = null;
      // 创建option
      $.each(data, function() {
        var item = this;
        if (item.type === 'option') {
          var option = $(utils.tpl('<option value="{{value}}">{{label}}</option>', item));
          if (item.selected)
            option[0].selected = true;
          if (item.disabled)
            option[0].disabled = true;
          if (item.inGroup && lastGroup) {
            lastGroup.append(option);
          } else {
            // 出了group组
            lastGroup = null;
            options = options.add(option);
          }
        } else {
          var group = $(utils.tpl('<optgroup label="{{label}}"></optgroup>', item));
          options = options.add(group);
          lastGroup = group;
        }

      })

      // 设置原始select
      this.select.html(options);
      this.renderSelectBox();
    },
    // 映射select状态/属性
    mapping: function() {
      var select = this.select;
      var status = this.status;
      status.disabled = select[0].disabled;
      status.multiple = select[0].multiple;
      status.readonly = select.attr('readonly') !== undefined;
      status.style = select.attr('style');
    },
    // 获取选中项
    getCurrent: function() {
      var self = this;
      var current = this.multiple ? [] : null;
      var selectOption = this.select.find('option').filter(function(i) {
        return this.selected;
      });
      selectOption.each(function() {
        var data = utils.optionToData($(this));
        if (self.multiple) {
          current.push(data);
        } else {
          current = data;
        }
      });
      return current;
    },
    // 创建selectBox
    create_selectBox: function() {
      // 获取当前选中项
      this.current = this.getCurrent();
      var select = this.select;
      var current = {
        value: utils.fieldToArrayStr(this.current, 'value'),
        label: utils.fieldToArrayStr(this.current, 'label', true),
        style: this.status.style
      };

      var html = utils.tpl(SELECTBOX, {
        'TMP': this.opt.selectTmp
      });

      // 值替换
      html = utils.tpl(html, current);
      // 属性替换
      html = utils.tplForAttr(html, this.status);
      // 创建元素
      var selectBox = $(html);

      select.show(0);
      selectBox.css({
        'width': select.outerWidth(),
      });
      selectBox.get(0).tabIndex = select.get(0).tabIndex;
      return selectBox.show(0);
    },
    // 创建dropdown
    create_dropdown: function() {
      var self = this;
      // 获取options数据
      var data = this.extract();
      // 根据option数据创建虚拟dom
      var dropdown = $('<div class="SelectBox-dropdown"></div>');
      var options = $('<dl class="SelectBox-options"></dl>');

      // 根据options数组数据创建虚拟option
      $.each(data, function() {
        var item = this;
        var option = null;

        if (item.type === 'option') {
          var optionHTML = self.opt.optionTmp;
          // 替换值
          optionHTML = utils.tpl(optionHTML, {value: item.value, label: item.label});
          // 替换属性
          optionHTML = utils.tplForAttr(optionHTML, item);
          // 创建元素
          option = $(optionHTML);
        } else {
          option = $(utils.tpl('<dt class="optgroup">{{label}}</dt>', item));
        }
        option.attr('title', item.label);
        options.append(option);
      });

      dropdown.append(options);
      return dropdown.css('min-width', this.selectBox.css('width'));
    },
    // 显示下拉列表
    show: function(event) {
      if (this.readonly || this.disabled)
        return;
      // 销毁之前dropdown
      if (this.dropdown !== null)
        this.dropdown.remove();

      var self = this;
      // 创建虚拟dropdown
      var dropdown = this.create_dropdown();
      var selectBox = this.selectBox.addClass('open');

      // 绑定事件
      $('dd', dropdown).bind('click', function(event) {
        self.selectForValue($(this).attr('value'));
      })


      // selectBox坐标
      var pos = utils.offset(selectBox);
      // 上剩余高度
      var above = utils.getAvailabTop(selectBox);
      // 下剩余高度
      var below = utils.getAvailabHeight(selectBox);


      // 插入dom
      $(document.body).append(dropdown);
      dropdown.show(0);

      // 实际高度
      var realHeight = dropdown.outerHeight();
      // 获取单条高度
      var itemHeight = $('.option', dropdown).outerHeight();
      // 最多显示条数
      var maxCount = 6;
      // 计算最大高度
      var maxHeight = 6 * itemHeight;

      // 使用更多剩余的一方来显示
      if (above > below && below <= dropdown.height()) {
        var maxHeight = above > maxHeight ? maxHeight : above - 10;
        // maxHeight 高度可能不是下拉列表的高度, 实际高度可能比maxHeight高度小, 这个时候 top: above - 实际高度
        // console.log('上方显示: ', '剩余高度: ', above, '下拉列表高度:', maxHeight, 'top:', above - maxHeight);
        dropdown.css({
          position: 'absolute',
          top: above - Math.min(maxHeight, realHeight),
          left: pos.left,
          'max-height': maxHeight,
          'overflow-y': 'auto'
        });
      } else {
        dropdown.css({
          position: 'absolute',
          top: pos.top,
          left: pos.left,
          'max-height': below > maxHeight ? maxHeight : below - 10,
          'overflow-y': 'auto'
        });
      }

      dropdown.addClass('open');
      this.dropdown = dropdown;
      this.isShow = true;
      if (event)
        event.stopPropagation();
    },
    // 隐藏下拉列表
    hide: function() {
      var dropdown = this.dropdown;
      this.selectBox.removeClass('open');
      this.isShow = false;
      if (dropdown === null)
        return;

      dropdown.removeClass('open').addClass('close');
      setTimeout(function() { dropdown.remove(); }, 200);
    },
    // 通过option选中
    selectForOption: function(option, noHide) {
      // || (!this.multiple && option.get(0).selected)
      if (option.attr('disabled') !== undefined || option.length === 0)
        return;

      if (this.multiple) {
        option.get(0).selected = !option.get(0).selected;
      } else {
        option.get(0).selected = true;
      }

      this.renderSelectBox(true);
      this.select.trigger('change', this);
      if (!noHide)
        this.hide();
    },
    // 通过索引选中
    selectForIndex: function(index, noHide) {
      this.selectForOption(utils.getOptionForIndex(this.select, index), noHide);
    },
    // 通过value选中
    selectForValue: function(value) {
      this.selectForOption(utils.getOptionForValue(this.select, value));
    },
    // 渲染selectBox
    renderSelectBox: function() {
      var self = this;
      var select = this.select;
      var selectBox = this.selectBox;
      
      // 映射select状态/属性
      this.mapping();
      // 根据状态创建虚拟select
      var virtualSelect = this.create_selectBox();

      // 渲染到虚拟select
      select.hide();
      if (selectBox == null) {
        // 初次创建
        select.after(virtualSelect);
      } else {
        // 重新替换渲染
        selectBox.replaceWith(virtualSelect);
        if (selectBox.is(':focus'))
          virtualSelect.addClass('focus').focus();
      }

      // 绑定虚拟select事件
      virtualSelect.click(function() {
        if (self.isShow) { self.hide(); } else { self.show(); }
      });
      // 支持focus事件
      virtualSelect.keyup(function(event) {
        var key = event.keyCode;
        // 当前选中项作为基准索引
        var index = select.get(0).selectedIndex;
        // 所有option
        var options = $('.option', self.dropdown);
        // 跳转激活项
        var jump = function(i) {
          // 越界检测
          if (i < 0 || i >= options.length)
            return;
          options.eq(i).addClass('active').siblings().removeClass('active');
          options.eq(i)[0].scrollIntoView(false);
          //self.selectForIndex(i, true);
          select.get(0).selectedIndex = i;
          event.stopPropagation();
        };


        if (self.isShow) {
          if (key === 38) {
            jump(index - 1);
            return;
          }
          if (key === 40) {
            jump(index + 1);
            return;
          }
        }

        if (key === 13) {
          if (self.isShow) { 
            self.selectForIndex(index);
           } else { self.show(); }
          event.stopPropagation();
          return false;
        }
      });

      this.selectBox = virtualSelect;
    }
  };

  // 静态
  SelectBox.selects = [];
  SelectBox.add = function(select) {
    SelectBox.selects.push(select);
  };
  SelectBox.remove = function(select) {
    var index = -1;
    $.each(SelectBox.selects, function(i) {
      if (this === select)
        index = i;
    });
    if (index !== -1)
      SelectBox.selects.splice(index, 1);

  };
  SelectBox.hander_click = function(event) {
    var target = $(event.target);
    $.each(SelectBox.selects, function() {
      if (!target.isChildAndSelfOf(this.selectBox) && !target.isChildAndSelfOf(this.dropdown)) {
        this.hide();
      }
    });
  };
  SelectBox.extract = function(select) {
    var data = [];
    $('option,optgroup', select).each(function() {
      var option = $(this);
      if (option.is('optgroup')) {
        data.push({label: this.label});
      } else {
        data.push(utils.optionToData(option));
      }
    });
    return data;
  };

  $(document.body).click(SelectBox.hander_click);
  window.SelectBox = SelectBox;

  $.fn.SelectBox = function(opt) {
    return this.each(function(i, select) {
      new SelectBox($(select), opt);
    });
  };

  $.fn.selectForIndex = function(index) {
    return this.each(function(i, select) {
      if (!select.selectBox)
        return;
      select.selectBox.selectForIndex(index);
    });
  };

  // select[0].selectedIndex
  // 获取当前选中option
  $.fn.currentOption = function() {
    var select = this;
    var index = select[0].selectedIndex;
    return select.find('option').eq(index);
  };


  $.fn.findOptionForVal = function(val) {
    var select = this;
    return utils.getOptionForValue($(select), val);
  };


  $.fn.renderSelectBox = function() {
    this.each(function() {
      var selectBox = this.selectBox;
      if (!selectBox)
        return;
      selectBox.renderSelectBox();
    });
    return this;
  };

  $.fn.selectForValue = function(value) {
    return this.each(function(i, select) {
      if (select.selectBox) {
        select.selectBox.selectForValue(value);
      } else {
        var option = utils.getOptionForValue($(select), value).get(0);
        if (option)
          option.selected = true;
      }
      
    });
  };
})();