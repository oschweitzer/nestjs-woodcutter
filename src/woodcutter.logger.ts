import type { LoggerService } from '@nestjs/common';
import type { WoodCutter } from 'woodcutter';

/** Turn anything Nest may pass as a message into text. */
function stringify(message: unknown): string {
  if (typeof message === 'string') {
    return message;
  }
  if (message instanceof Error) {
    return message.stack ?? `${message.name}: ${message.message}`;
  }
  if (typeof message === 'object' && message !== null) {
    try {
      return JSON.stringify(message);
    } catch {
      return '[unserializable object]';
    }
  }
  return String(message);
}

/**
 * Nest `LoggerService` that writes through a woodcutter logger.
 *
 * Nest passes the context (usually the class name) as the last string argument.
 * It is printed first, in brackets: `[AppController] Hello`.
 * Any other extra argument is handled by woodcutter (a trailing object is appended as JSON).
 */
export class WoodcutterLogger implements LoggerService {
  constructor(private readonly logger: WoodCutter) {}

  public log(message: unknown, ...optionalParams: unknown[]): void {
    this.write('info', message, optionalParams);
  }

  public error(message: unknown, ...optionalParams: unknown[]): void {
    this.write('error', message, optionalParams, true);
  }

  public warn(message: unknown, ...optionalParams: unknown[]): void {
    this.write('warn', message, optionalParams);
  }

  public debug(message: unknown, ...optionalParams: unknown[]): void {
    this.write('debug', message, optionalParams);
  }

  public verbose(message: unknown, ...optionalParams: unknown[]): void {
    this.write('verbose', message, optionalParams);
  }

  /** Woodcutter has no fatal level: fatal messages are logged as errors. */
  public fatal(message: unknown, ...optionalParams: unknown[]): void {
    this.write('error', message, optionalParams, true);
  }

  private write(
    level: 'error' | 'warn' | 'info' | 'verbose' | 'debug',
    message: unknown,
    params: unknown[],
    withStack = false,
  ): void {
    const rest = [...params];
    const last = rest[rest.length - 1];
    const context = typeof last === 'string' ? last : undefined;
    if (context !== undefined) {
      rest.pop();
    }

    let text = stringify(message);
    if (withStack && typeof rest[0] === 'string') {
      // Nest calls `error(message, stack, context)`.
      text += `\n${rest.shift() as string}`;
    }
    if (context !== undefined) {
      text = `[${context}] ${text}`;
    }
    this.logger[level](text, ...rest);
  }
}
