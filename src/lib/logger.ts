enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

type LogContext = Record<string, unknown>;

class Logger {
  private level: LogLevel;

  constructor(level: LogLevel = LogLevel.INFO) {
    this.level = level;
  }

  debug(message: string, context?: LogContext) {
    if (this.level <= LogLevel.DEBUG) {
      console.debug(`[DEBUG] ${message}`, context || "");
    }
  }

  info(message: string, context?: LogContext) {
    if (this.level <= LogLevel.INFO) {
      console.info(`[INFO] ${message}`, context || "");
    }
  }

  warn(message: string, context?: LogContext) {
    if (this.level <= LogLevel.WARN) {
      console.warn(`[WARN] ${message}`, context || "");
    }
  }

  error(message: string, error?: Error | unknown, context?: LogContext) {
    if (this.level <= LogLevel.ERROR) {
      const errorStack = error instanceof Error ? error.stack : String(error);
      console.error(`[ERROR] ${message}`, { error: errorStack, ...context });
    }
  }
}

export const logger = new Logger(
  process.env.NODE_ENV === "production" ? LogLevel.INFO : LogLevel.DEBUG
);
