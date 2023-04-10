/*!
 * js-logger - http://github.com/jonnyreeves/js-logger
 * Jonny Reeves, http://jonnyreeves.co.uk/
 * js-logger may be freely distributed under the MIT license.
 */
(function (global) {
  // Top level module for the global, static logger instance.
  const Logger = {};

  // For those that are at home that are keeping score.
  Logger.VERSION = '1.6.1';

  // Function which handles all incoming log messages.
  let logHandler;

  // Map of ContextualLogger instances by name; used by Logger.get() to return the same named instance.
  const contextualLoggersByNameMap = {};

  // Polyfill for ES5's Function.bind.
  const bind = function (scope, func) {
    return function () {
      return func.apply(scope, arguments);
    };
  };

  // Super exciting object merger-matron 9000 adding another 100 bytes to your download.
  const merge = function () {
    const args = arguments;
    const target = args[0];
    let key;
    let i;
    for (i = 1; i < args.length; i++) {
      for (key in args[i]) {
        if (!(key in target) && args[i].hasOwnProperty(key)) {
          target[key] = args[i][key];
        }
      }
    }
    return target;
  };

  // Helper to define a logging level object; helps with optimisation.
  const defineLogLevel = function (value, name) {
    return { value, name };
  };

  // Predefined logging levels.
  Logger.TRACE = defineLogLevel(1, 'TRACE');
  Logger.DEBUG = defineLogLevel(2, 'DEBUG');
  Logger.INFO = defineLogLevel(3, 'INFO');
  Logger.TIME = defineLogLevel(4, 'TIME');
  Logger.WARN = defineLogLevel(5, 'WARN');
  Logger.ERROR = defineLogLevel(8, 'ERROR');
  Logger.OFF = defineLogLevel(99, 'OFF');

  // Inner class which performs the bulk of the work; ContextualLogger instances can be configured independently
  // of each other.
  const ContextualLogger = function (defaultContext) {
    this.context = defaultContext;
    this.setLevel(defaultContext.filterLevel);
    this.log = this.info; // Convenience alias.
  };

  ContextualLogger.prototype = {
    // Changes the current logging level for the logging instance.
    setLevel(newLevel) {
      // Ensure the supplied Level object looks valid.
      if (newLevel && 'value' in newLevel) {
        this.context.filterLevel = newLevel;
      }
    },

    // Gets the current logging level for the logging instance
    getLevel() {
      return this.context.filterLevel;
    },

    // Is the logger configured to output messages at the supplied level?
    enabledFor(lvl) {
      const { filterLevel } = this.context;
      return lvl.value >= filterLevel.value;
    },

    trace() {
      this.invoke(Logger.TRACE, arguments);
    },

    debug() {
      this.invoke(Logger.DEBUG, arguments);
    },

    info() {
      this.invoke(Logger.INFO, arguments);
    },

    warn() {
      this.invoke(Logger.WARN, arguments);
    },

    error() {
      this.invoke(Logger.ERROR, arguments);
    },

    time(label) {
      if (typeof label === 'string' && label.length > 0) {
        this.invoke(Logger.TIME, [label, 'start']);
      }
    },

    timeEnd(label) {
      if (typeof label === 'string' && label.length > 0) {
        this.invoke(Logger.TIME, [label, 'end']);
      }
    },

    // Invokes the logger callback if it's not being filtered.
    invoke(level, msgArgs) {
      if (logHandler && this.enabledFor(level)) {
        logHandler(msgArgs, merge({ level }, this.context));
      }
    },
  };

  // Protected instance which all calls to the to level `Logger` module will be routed through.
  const globalLogger = new ContextualLogger({ filterLevel: Logger.OFF });

  // Configure the global Logger instance.
  (function () {
    // Shortcut for optimisers.
    const L = Logger;

    L.enabledFor = bind(globalLogger, globalLogger.enabledFor);
    L.trace = bind(globalLogger, globalLogger.trace);
    L.debug = bind(globalLogger, globalLogger.debug);
    L.time = bind(globalLogger, globalLogger.time);
    L.timeEnd = bind(globalLogger, globalLogger.timeEnd);
    L.info = bind(globalLogger, globalLogger.info);
    L.warn = bind(globalLogger, globalLogger.warn);
    L.error = bind(globalLogger, globalLogger.error);

    // Don't forget the convenience alias!
    L.log = L.info;
  }());

  // Set the global logging handler.  The supplied function should expect two arguments, the first being an arguments
  // object with the supplied log messages and the second being a context object which contains a hash of stateful
  // parameters which the logging function can consume.
  Logger.setHandler = function (func) {
    logHandler = func;
  };

  // Sets the global logging filter level which applies to *all* previously registered, and future Logger instances.
  // (note that named loggers (retrieved via `Logger.get`) can be configured independently if required).
  Logger.setLevel = function (level) {
    // Set the globalLogger's level.
    globalLogger.setLevel(level);

    // Apply this level to all registered contextual loggers.
    for (const key in contextualLoggersByNameMap) {
      if (contextualLoggersByNameMap.hasOwnProperty(key)) {
        contextualLoggersByNameMap[key].setLevel(level);
      }
    }
  };

  // Gets the global logging filter level
  Logger.getLevel = function () {
    return globalLogger.getLevel();
  };

  // Retrieve a ContextualLogger instance.  Note that named loggers automatically inherit the global logger's level,
  // default context and log handler.
  Logger.get = function (name) {
    // All logger instances are cached so they can be configured ahead of use.
    return (
      contextualLoggersByNameMap[name]
      || (contextualLoggersByNameMap[name] = new ContextualLogger(
        merge({ name }, globalLogger.context)
      ))
    );
  };

  // CreateDefaultHandler returns a handler function which can be passed to `Logger.setHandler()` which will
  // write to the window's console object (if present); the optional options object can be used to customise the
  // formatter used to format each log message.
  Logger.createDefaultHandler = function (options) {
    options = options || {};

    options.formatter = options.formatter
      || function defaultMessageFormatter(messages, context) {
        // Prepend the logger's name to the log message for easy identification.
        if (context.name) {
          messages.unshift('[' + context.name + ']');
        }
      };

    // Map of timestamps by timer labels used to track `#time` and `#timeEnd()` invocations in environments
    // that don't offer a native console method.
    const timerStartTimeByLabelMap = {};

    // Support for IE8+ (and other, slightly more sane environments)
    const invokeConsoleMethod = function (hdlr, messages) {
      Function.prototype.apply.call(hdlr, console, messages);
    };

    // Check for the presence of a logger.
    if (typeof console === 'undefined') {
      return function () {
        /* no console */
      };
    }

    return function (messages, context) {
      // Convert arguments object to Array.
      messages = Array.prototype.slice.call(messages);

      let hdlr = console.log;
      let timerLabel;

      if (context.level === Logger.TIME) {
        timerLabel = (context.name ? '[' + context.name + '] ' : '') + messages[0];

        if (messages[1] === 'start') {
          if (console.time) {
            console.time(timerLabel);
          } else {
            timerStartTimeByLabelMap[timerLabel] = new Date().getTime();
          }
        } else if (console.timeEnd) {
          console.timeEnd(timerLabel);
        } else {
          invokeConsoleMethod(hdlr, [
            timerLabel
                + ': '
                + (new Date().getTime() - timerStartTimeByLabelMap[timerLabel])
                + 'ms',
          ]);
        }
      } else {
        // Delegate through to custom warn/error loggers if present on the console.
        if (context.level === Logger.WARN && console.warn) {
          hdlr = console.log;
        } else if (context.level === Logger.ERROR && console.error) {
          hdlr = console.log;
        } else if (context.level === Logger.INFO && console.info) {
          hdlr = console.log;
        } else if (context.level === Logger.DEBUG && console.debug) {
          hdlr = console.log;
        } else if (context.level === Logger.TRACE && console.trace) {
          hdlr = console.log;
        }

        options.formatter(messages, context);
        invokeConsoleMethod(hdlr, messages);
      }
    };
  };

  // Configure and example a Default implementation which writes to the `window.console` (if present).  The
  // `options` hash can be used to configure the default logLevel and provide a custom message formatter.
  Logger.useDefaults = function (options) {
    Logger.setLevel((options && options.defaultLevel) || Logger.DEBUG);
    Logger.setHandler(Logger.createDefaultHandler(options));
  };

  // Createa an alias to useDefaults to avoid reaking a react-hooks rule.
  Logger.setDefaults = Logger.useDefaults;

  // Export to popular environments boilerplate.
  if (typeof define === 'function' && define.amd) {
    define(Logger);
  } else if (typeof module !== 'undefined' && module.exports) {
    module.exports = Logger;
  } else {
    Logger._prevLogger = global.Logger;

    Logger.noConflict = function () {
      global.Logger = Logger._prevLogger;
      return Logger;
    };

    global.Logger = Logger;
  }
}(this));
