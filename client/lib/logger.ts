/**
 * Server-side structured logging utility.
 * Use this for logging API errors, background jobs, and system events.
 * Currently logs to console, but designed to be easily swapped with Sentry, Winston, or Datadog in production.
 */

type LogLevel = "info" | "warn" | "error" | "debug";

interface LogPayload {
  message: string;
  context?: Record<string, unknown>;
  error?: unknown;
}

class Logger {
  private maskPII(data: Record<string, unknown>): Record<string, unknown> {
    const masked = { ...data };
    const piiKeys = ['email', 'user', 'name', 'phone', 'address', 'token', 'password', 'id', 'userId'];
    
    for (const key of Object.keys(masked)) {
      if (piiKeys.some(pii => key.toLowerCase().includes(pii))) {
        masked[key] = '[REDACTED]';
      } else if (typeof masked[key] === 'object' && masked[key] !== null) {
        masked[key] = this.maskPII(masked[key] as Record<string, unknown>);
      }
    }
    return masked;
  }

  private formatLog(level: LogLevel, payload: LogPayload) {
    const timestamp = new Date().toISOString();
    const safeContext = payload.context ? this.maskPII(payload.context) : undefined;
    
    const logData = {
      timestamp,
      level: level.toUpperCase(),
      message: payload.message,
      context: safeContext,
      error: payload.error instanceof Error ? {
        name: payload.error.name,
        message: payload.error.message,
        stack: payload.error.stack,
      } : payload.error,
    };

    // In production, you might want to stringify this and send it to a logging service.
    // For now, we output structured JSON to the console for easier parsing by log aggregators.
    const output = process.env.NODE_ENV === "production" 
      ? JSON.stringify(logData) 
      : `${timestamp} [${level.toUpperCase()}] ${payload.message}`;

    switch (level) {
      case "info":
        console.info(output, process.env.NODE_ENV !== "production" ? payload.context || "" : "");
        break;
      case "warn":
        console.warn(output, process.env.NODE_ENV !== "production" ? payload.context || "" : "");
        break;
      case "error":
        console.error(output, process.env.NODE_ENV !== "production" ? payload.error || payload.context || "" : "");
        break;
      case "debug":
        if (process.env.NODE_ENV !== "production") {
          console.debug(output, payload.context || "");
        }
        break;
    }
  }

  info(message: string, context?: Record<string, unknown>) {
    this.formatLog("info", { message, context });
  }

  warn(message: string, context?: Record<string, unknown>) {
    this.formatLog("warn", { message, context });
  }

  error(message: string, error?: unknown, context?: Record<string, unknown>) {
    this.formatLog("error", { message, error, context });
  }

  debug(message: string, context?: Record<string, unknown>) {
    this.formatLog("debug", { message, context });
  }
}

export const logger = new Logger();
