import { Controller, Get, Injectable, Logger, Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { WoodCutter } from 'woodcutter';
import { describe, expect, it } from 'vitest';
import {
  LOGGER_OPTIONS,
  WOODCUTTER_NEST_PROVIDER,
  WOODCUTTER_PROVIDER,
  WoodcutterLogger,
  WoodcutterModule,
} from '../src/index.js';
import { captureOutput } from './capture.js';

describe('WoodcutterModule.forRoot', () => {
  it('provides the options, the woodcutter logger and the Nest logger', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [WoodcutterModule.forRoot({ level: 'debug' })],
    }).compile();

    expect(moduleRef.get(LOGGER_OPTIONS)).toEqual({ level: 'debug' });
    expect(moduleRef.get(WOODCUTTER_PROVIDER)).toBeInstanceOf(WoodCutter);
    expect(moduleRef.get(WOODCUTTER_NEST_PROVIDER)).toBeInstanceOf(WoodcutterLogger);
  });

  it('works without options', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [WoodcutterModule.forRoot()],
    }).compile();

    expect(moduleRef.get(LOGGER_OPTIONS)).toEqual({});
    expect(moduleRef.get(WOODCUTTER_NEST_PROVIDER)).toBeInstanceOf(WoodcutterLogger);
  });

  it('is global: other modules can inject the logger', async () => {
    @Injectable()
    class Service {}
    @Module({ providers: [Service] })
    class Feature {}

    const moduleRef = await Test.createTestingModule({
      imports: [WoodcutterModule.forRoot(), Feature],
    }).compile();
    const feature = moduleRef.select(Feature);

    expect(feature.get(WOODCUTTER_NEST_PROVIDER, { strict: false })).toBeInstanceOf(
      WoodcutterLogger,
    );
  });
});

describe('WoodcutterModule.forRootAsync', () => {
  it('builds the options from the injected providers', async () => {
    const CONFIG = 'CONFIG';
    @Module({
      providers: [{ provide: CONFIG, useValue: { logLevel: 'warn' } }],
      exports: [CONFIG],
    })
    class ConfigModule {}

    const moduleRef = await Test.createTestingModule({
      imports: [
        WoodcutterModule.forRootAsync({
          imports: [ConfigModule],
          inject: [CONFIG],
          useFactory: (config: { logLevel: 'warn' }) => ({ level: config.logLevel }),
        }),
      ],
    }).compile();

    expect(moduleRef.get(LOGGER_OPTIONS)).toEqual({ level: 'warn' });
    expect(moduleRef.get(WOODCUTTER_NEST_PROVIDER)).toBeInstanceOf(WoodcutterLogger);
  });

  it('supports an async factory without injected providers', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        WoodcutterModule.forRootAsync({ useFactory: () => Promise.resolve({ level: 'error' }) }),
      ],
    }).compile();

    expect(moduleRef.get(LOGGER_OPTIONS)).toEqual({ level: 'error' });
  });
});

describe('as the application logger', () => {
  it('routes Nest logs through woodcutter', async () => {
    @Controller()
    class AppController {
      private readonly logger = new Logger(AppController.name);

      @Get()
      hello() {
        this.logger.log('Hello');
        return 'ok';
      }
    }
    @Module({
      imports: [WoodcutterModule.forRoot({ colorize: false, level: 'debug' })],
      controllers: [AppController],
    })
    class AppModule {}

    const capture = captureOutput();
    try {
      const app = await NestFactory.create(AppModule, { logger: false });
      app.useLogger(app.get(WOODCUTTER_NEST_PROVIDER));
      await app.init();
      new Logger('Bootstrap').log('Ready', { port: 3000 });
      await app.close();

      const output = capture.output();
      expect(output).toMatch(/\[INFO\]\s+ \| \[Bootstrap\] Ready \{"port":3000\}/);
      expect(output).toMatch(
        /\[INFO\]\s+ \| \[NestApplication\]|\[RoutesResolver\]|\[InstanceLoader\]/,
      );
    } finally {
      capture.restore();
    }
  });
});
