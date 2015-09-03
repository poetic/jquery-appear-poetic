/*
 * jQuery appear plugin
 *
 * Copyright (c) 2012 Andrey Sidorov
 * licensed under MIT license.
 *
 * https://github.com/morr/jquery.appear/
 *
 * Version: 0.3.6
 */
(function($) {
  var selectors = [];

  var check_binded = false;
  var check_lock = false;
  var defaults = {
    interval: 250,
    force_process: false
  };
  var $window = $(window);

  var privor_visibles = [];

  function process() {
    check_lock = false;
    selectors.forEach(function (selector) {
      $(selector).each(function () {
        var element  = this

        var was_visible = $.inArray(element, privor_visibles) !== -1
        var is_visible  = $(element).is(':appeared')

        if (was_visible !== is_visible) {
          // trigger events
          $(element).trigger(is_visible ? 'appear' : 'disappear', [$(element)])

          // add / remove elements from previous_visibles
          if (is_visible) {
            privor_visibles.push(element)
          } else {
            privor_visibles = privor_visibles.filter(function (prior_visible) {
              return prior_visible !== element
            })
          }
        }
      })
    })
  };

  function add_selector(selector) {
    selectors.push(selector);
  }

  // "appeared" custom filter
  $.expr[':']['appeared'] = function(element) {
    var $element = $(element);
    if (!$element.is(':visible')) {
      return false;
    }

    var window_left = $window.scrollLeft();
    var window_top = $window.scrollTop();
    var offset = $element.offset();
    var left = offset.left;
    var top = offset.top;

    return top + $element.height() >= window_top &&
      top - ($element.data('appear-top-offset') || 0) <= window_top + $window.height() &&
      left + $element.width() >= window_left &&
      left - ($element.data('appear-left-offset') || 0) <= window_left + $window.width()
  };

  $.fn.extend({
    // watching for element's appearance in browser viewport
    appear: function(options) {
      var opts = $.extend({}, defaults, options || {});
      var selector = this.selector || this;
      if (!check_binded) {
        var on_check = function() {
          if (check_lock) {
            return;
          }
          check_lock = true;

          setTimeout(process, opts.interval);
        };

        $(window).scroll(on_check).resize(on_check);
        check_binded = true;
      }

      if (opts.force_process) {
        setTimeout(process, opts.interval);
      }
      add_selector(selector);
      return $(selector);
    }
  });

  $.extend({
    // force elements's appearance check
    force_appear: function() {
      if (check_binded) {
        process();
      }
      return check_binded;
    }
  });
})(function() {
  if (typeof module !== 'undefined') {
    // Node
    return require('jquery');
  } else {
    return jQuery;
  }
}());
