import { Console } from 'console';
import picocolors from 'picocolors';

const TRACE = 10;
const DEBUG = 20;
const INFO = 30;
const WARN = 40;
const ERROR = 50;
const FATAL = 60;

const LEVEL_NAMES = {
  10: 'TRACE',
  20: 'DEBUG',
  30: 'INFO ',
  40: 'WARN ',
  50: 'ERROR',
  60: 'FATAL'
};

const LEVEL_COLORS = {
  10: 'gray',
  20: 'gray',
  30: 'green',
  40: 'bgYellow',
  50: 'bgRed',
  60: 'bgRed'
};

function applyColor(str: string, color: string) {
  switch (color) {
    case 'gray':
      return picocolors.gray(str);
    case 'green':
      return picocolors.green(str);
    case 'bgYellow':
      return picocolors.bgYellow(str);
    case 'bgRed':
      return picocolors.bgRed(str);
    case 'yellow':
      return picocolors.yellow(str);
    default:
      return str;
  }
}

const console = new Console({
  stdout: process.stdout,
  stderr: process.stderr,
  colorMode: false
});

interface Options {
  debug?: boolean;
  silent?: boolean;
}

type ConsoleArgs = any[];

type writeLogF = (...args: ConsoleArgs) => void;

class Logger {
  _silent: boolean;
  _debug: boolean;
  level: number;
  d: writeLogF;
  i: writeLogF;
  w: writeLogF;
  e: writeLogF;
  log: writeLogF;

  constructor({ debug = false, silent = false }: Options = {}) {
    this._silent = silent || false;
    this._debug = debug || false;

    this.level = INFO;

    if (silent) {
      this.level = FATAL + 10;
    }

    if (this._debug) {
      this.level = TRACE;
    }
  }

  _writeLogOutput(level: number, consoleArgs: ConsoleArgs) {
    let errArg;
    if (typeof consoleArgs[0] === 'object') {
      errArg = consoleArgs.shift();
      if (errArg.err && errArg.err instanceof Error) {
        errArg = errArg.err;
      }
    }

    if (this._debug) {
      const str = new Date().toISOString().substring(11, 23) + ' ';
      const coloredStr = applyColor(str, LEVEL_COLORS[DEBUG]);
      if (level === TRACE || level >= WARN) {
        process.stderr.write(coloredStr);
      } else {
        process.stdout.write(coloredStr);
      }
    }

    if (level >= this.level) {
      const levelStr = applyColor(LEVEL_NAMES[level], LEVEL_COLORS[level]) + ' ';
      if (level === TRACE || level >= WARN) {
        process.stderr.write(levelStr);
      } else {
        process.stdout.write(levelStr);
      }

      if (level === TRACE) {
        console.trace(...consoleArgs);
      } else if (level < INFO) {
        console.debug(...consoleArgs);
      } else if (level < WARN) {
        console.info(...consoleArgs);
      } else if (level < ERROR) {
        console.warn(...consoleArgs);
      } else {
        console.error(...consoleArgs);
      }

      if (errArg) {
        const err = errArg.stack || errArg.message;
        if (err) {
          const errStr = applyColor(err, 'yellow') + '\n';
          if (level === TRACE || level >= WARN) {
            process.stderr.write(errStr);
          } else {
            process.stdout.write(errStr);
          }
        }
      }
    }
  }

  trace(...args: ConsoleArgs) {
    this._writeLogOutput(TRACE, args);
  }

  debug(...args: ConsoleArgs) {
    this._writeLogOutput(DEBUG, args);
  }

  info(...args: ConsoleArgs) {
    this._writeLogOutput(INFO, args);
  }

  warn(...args: ConsoleArgs) {
    this._writeLogOutput(WARN, args);
  }

  error(...args: ConsoleArgs) {
    this._writeLogOutput(ERROR, args);
  }

  fatal(...args: ConsoleArgs) {
    this._writeLogOutput(FATAL, args);
  }
}

export default function createLogger(options: Options = {}) {
  const logger = new Logger(options);

  logger.d = logger.debug;
  logger.i = logger.info;
  logger.w = logger.warn;
  logger.e = logger.error;
  logger.log = logger.info;

  return logger;
}

export const logger = (option: Options = {}) => createLogger(option);
