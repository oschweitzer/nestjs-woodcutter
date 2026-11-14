# nestjs-woodcutter

[![CI](https://github.com/oschweitzer/nestjs-woodcutter/actions/workflows/ci.yml/badge.svg)](https://github.com/oschweitzer/nestjs-woodcutter/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/nestjs-woodcutter)](https://www.npmjs.com/package/nestjs-woodcutter)
[![license](https://img.shields.io/npm/l/nestjs-woodcutter)](LICENSE)

A [NestJS](https://nestjs.com/) module that sends the logs of your application through
[woodcutter](https://github.com/oschweitzer/woodcutter), a small typed console logger built on
[winston](https://github.com/winstonjs/winston): one line per message, with a timestamp, the level,
the Nest context and optional JSON metadata, colored by level.

```
2026-11-14 14:30:30 - [DEBUG]   | [AppController] Hello controller
2026-11-14 14:30:30 - [INFO]    | [AppController] Server started {"port":3000}
2026-11-14 14:30:30 - [WARN]    | [AppController] This is a warning
2026-11-14 14:30:30 - [ERROR]   | [AppController] Cannot say hello
Error: boom
    at ...
```

## Install

```bash
npm install nestjs-woodcutter woodcutter
```

| Requirement      | Version             |
| ---------------- | ------------------- |
| Node.js          | 20.19 or later      |
| `@nestjs/common` | 11 or 12            |
| `woodcutter`     | 3 (peer dependency) |

The package ships ES modules and CommonJS, with types. It is tested against Nest 11 and Nest 12 on
Node.js 20, 22 and 24.

## Usage

Import `WoodcutterModule` once, in the root module. It is global, so the logger can be injected anywhere.

```typescript
import { Module } from '@nestjs/common';
import { WoodcutterModule } from 'nestjs-woodcutter';

@Module({
  imports: [WoodcutterModule.forRoot({ level: 'debug' })],
})
export class AppModule {}
```

Then make it the logger of the application:

```typescript
import { NestFactory } from '@nestjs/core';
import { WOODCUTTER_NEST_PROVIDER } from 'nestjs-woodcutter';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(WOODCUTTER_NEST_PROVIDER));
  await app.listen(3000);
}
bootstrap();
```

`bufferLogs: true` keeps the startup logs of Nest until the logger is set, so they go through
woodcutter too. Every `Logger` from `@nestjs/common` now writes through it:

```typescript
import { Controller, Get, Logger } from '@nestjs/common';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  @Get()
  hello(): string {
    this.logger.debug('Hello controller');
    this.logger.log('Saying hello', { user: 42 }); // a trailing object is appended as JSON
    this.logger.warn('This is a warning');
    this.logger.error('Cannot say hello', new Error('boom').stack);
    return 'Hello';
  }
}
```

### Options

The options are the ones of woodcutter's [`WoodCutter`](https://github.com/oschweitzer/woodcutter#options):

| Option            | Default               | Description                                                                         |
| ----------------- | --------------------- | ----------------------------------------------------------------------------------- |
| `level`           | `info`                | Most verbose level to emit: `error`, `warn`, `info`, `verbose`, `debug` or `silly`. |
| `timestampFormat` | `YYYY-MM-DD HH:mm:ss` | Local time. Tokens: `YYYY YY MM M DD D HH H mm m ss s SSS`.                         |
| `colorize`        | `true`                | Color the lines by level. Off when `NO_COLOR` is set.                               |

### Options computed at startup

Use `forRootAsync` to read the options from another provider, such as `ConfigService`:

```typescript
import { ConfigModule, ConfigService } from '@nestjs/config';

WoodcutterModule.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    level: config.get('LOG_LEVEL', 'info'),
  }),
});
```

### Use woodcutter directly

The module also provides the underlying woodcutter logger, for code that does not go through Nest's `Logger`:

```typescript
import { Inject, Injectable } from '@nestjs/common';
import { WOODCUTTER_PROVIDER } from 'nestjs-woodcutter';
import type { WoodCutter } from 'woodcutter';

@Injectable()
export class BillingService {
  constructor(@Inject(WOODCUTTER_PROVIDER) private readonly logger: WoodCutter) {}
}
```

## How Nest logs are mapped

| Nest method | woodcutter level                        |
| ----------- | --------------------------------------- |
| `log`       | `info`                                  |
| `warn`      | `warn`                                  |
| `debug`     | `debug`                                 |
| `verbose`   | `verbose`                               |
| `error`     | `error`                                 |
| `fatal`     | `error` (woodcutter has no fatal level) |

- The context (the last string argument, usually the class name) is printed first, in brackets.
- A stack passed to `error(message, stack, context)` is printed on the lines below the message.
- Objects and errors given as the message are serialized; other extra arguments are handled by woodcutter.

## API

| Export                                 | Description                                                        |
| -------------------------------------- | ------------------------------------------------------------------ |
| `WoodcutterModule.forRoot(options?)`   | Global module with static options.                                 |
| `WoodcutterModule.forRootAsync({...})` | Global module with options from `useFactory`, `inject`, `imports`. |
| `WoodcutterLogger`                     | The Nest `LoggerService` backed by a woodcutter logger.            |
| `WOODCUTTER_NEST_PROVIDER`             | Token of the `WoodcutterLogger` instance.                          |
| `WOODCUTTER_PROVIDER`                  | Token of the woodcutter `WoodCutter` instance.                     |
| `LOGGER_OPTIONS`                       | Token of the options object.                                       |
| `WoodcutterOptions`                    | Type of the options.                                               |

## Migrating from 0.x

See the [changelog](CHANGELOG.md#100). In short: Node.js 20.19+, Nest 11 or 12, woodcutter 3, and
the context is now printed as `[Context]` before the message instead of `(Context)` after it.

## Development

```bash
npm ci
npm run lint        # ESLint
npm run typecheck   # TypeScript
npm test            # Vitest
npm run build       # ES modules and CommonJS in dist/
npm run test:smoke  # load the built package with import and require, and boot a Nest app
```

## License

[MIT](LICENSE)
