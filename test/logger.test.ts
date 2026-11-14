import { describe, expect, it } from 'vitest';
import type { WoodCutter } from 'woodcutter';
import { WoodcutterLogger } from '../src/index.js';
import { captureOutput } from './capture.js';

function setup() {
  const calls: { level: string; args: unknown[] }[] = [];
  const record =
    (level: string) =>
    (...args: unknown[]) => {
      calls.push({ level, args });
    };
  const fake = {
    error: record('error'),
    warn: record('warn'),
    info: record('info'),
    verbose: record('verbose'),
    debug: record('debug'),
  } as unknown as WoodCutter;
  return { calls, logger: new WoodcutterLogger(fake) };
}

describe('WoodcutterLogger', () => {
  it.each([
    ['log', 'info'],
    ['warn', 'warn'],
    ['debug', 'debug'],
    ['verbose', 'verbose'],
    ['error', 'error'],
    ['fatal', 'error'],
  ] as const)('%s writes at the %s level', (method, level) => {
    const { calls, logger } = setup();
    logger[method]('hello');
    expect(calls).toEqual([{ level, args: ['hello'] }]);
  });

  it('prefixes the context, given as the last string', () => {
    const { calls, logger } = setup();
    logger.log('hello', 'AppController');
    expect(calls[0]?.args).toEqual(['[AppController] hello']);
  });

  it('does not print "undefined" without a context', () => {
    const { calls, logger } = setup();
    logger.warn('careful');
    expect(calls[0]?.args).toEqual(['careful']);
  });

  it('passes metadata through to woodcutter', () => {
    const { calls, logger } = setup();
    logger.log('listening', { port: 3000 }, 'Bootstrap');
    expect(calls[0]?.args).toEqual(['[Bootstrap] listening', { port: 3000 }]);
  });

  it('appends the stack of an error on its own line', () => {
    const { calls, logger } = setup();
    logger.error('boom', 'Error: boom\n    at x', 'Service');
    expect(calls[0]?.args).toEqual(['[Service] boom\nError: boom\n    at x']);
  });

  it('treats a lone string after an error message as the context', () => {
    const { calls, logger } = setup();
    logger.error('boom', 'Service');
    expect(calls[0]?.args).toEqual(['[Service] boom']);
  });

  it('serializes object and Error messages', () => {
    const { calls, logger } = setup();
    logger.log({ a: 1 });
    const error = new Error('bad');
    logger.error(error);
    expect(calls[0]?.args).toEqual(['{"a":1}']);
    expect(String(calls[1]?.args[0])).toContain('Error: bad');
  });

  it('survives circular objects and non-string values', () => {
    const { calls, logger } = setup();
    const circular: Record<string, unknown> = {};
    circular.self = circular;
    logger.log(circular);
    logger.log(42);
    expect(calls[0]?.args).toEqual(['[unserializable object]']);
    expect(calls[1]?.args).toEqual(['42']);
  });

  it('forwards to a real woodcutter logger', async () => {
    const { WoodCutter } = await import('woodcutter');
    const capture = captureOutput();
    try {
      new WoodcutterLogger(new WoodCutter({ colorize: false })).log('hi', 'Ctx');
      const output = capture.output();
      expect(output).toMatch(/\[INFO\]\s+ \| \[Ctx\] hi/);
    } finally {
      capture.restore();
    }
  });
});
