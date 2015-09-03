/*
 * jQuery appear plugin
 *
 * Copyright (c) 2012 Andrey Sidorov
 * licensed under MIT license.
 *
 * https://github.com/morr/jquery.appear/
 *
 * Version: 0.3.7
 */
(function($) {
  var $window = $(window);
  var selectors = [];
  var privor_visibles = [];
  var defaults = {
    interval: 250,
    force_process: false
  };
  var throttle_interval = 250

  function process () {
    selectors.forEach(function (selector) {
      $(selector).each(function () {
        var element  = this

        var was_visible = $.inArray(element, privor_visibles) !== -1
        var is_visible  = $(element).is(':appeared')

        if (was_visible !== is_visible) {
          // trigger events
          $(element).trigger(is_visible ? 'appear' : 'disappear', [$(element)])

          // add / remove elements from privor_visibles
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
  }

  var throttled_process = throttle(process, throttle_interval)

  function throttle (callback, limit) {
    var wait = false;                 // Initially, we're not waiting
    return function () {              // We return a throttled function
      if (!wait) {                  // If we're not waiting
        callback.call();          // Execute users function
        wait = true;              // Prevent future invocations
        setTimeout(function () {  // After a period of time
          wait = false;         // And allow future invocations
        }, limit);
      }
    }
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

  $.extend({
    // watching for element's appearance in browser viewport
    appear: function(selector, options) {
      var opts = $.extend({}, defaults, options || {});

      if (!$.inArray(selectors, selector)) {
        selectors.push(selector);
      }

      once(function () {
        $(window).scroll(throttled_process).resize(throttled_process);
      })()

      if (opts.force_process) {
        throttled_process();
      }

      return $(selector);
    }
  });

  $.extend({
    // force elements's appearance check
    force_appear: function() {
      var hasSelectors = !!selectors.length
      if (hasSelectors) {
        process();
      }
      return hasSelectors;
    },
    set_appear_throttle_interval: function (interval) {
      throttle_interval = interval
    },
  });

  $.extend({
    appear_privor_visibles: function () {
      return privor_visibles
    }
  })

  var once = function (fn) {
    var called = false;
    return function () {
      if (called) {
        return
      }

      called = true;
      fn();
    }
  }

  // garbage collection every 30mins
  setInterval(function () {
    privor_visibles.forEach(function (element, index) {
      if (!$.contains(document.body, element)) {
        privor_visibles.splice(index, 1)
      }
    })
  }, 1000 * 60 * 30)

})(function() {
  if (typeof module !== 'undefined') {
    // Node
    return require('jquery');
  } else {
    return jQuery;
  }
}());
