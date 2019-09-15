<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo_text.svg" width="320" alt="Nest Logo" /></a>
</p>

A [Nest](https://nestjs.com/) module wrapper for [woodcutter](https://www.npmjs.com/package/woodcutter) logger.

## Description

[Nest](https://github.com/nestjs/nest) Typescript wrapper for [woodcutter](https://www.npmjs.com/package/woodcutter
) logger.



## Installation

```bash
$ npm install -S nestjs-woodcutter woodcutter
```

## Usage

Import `WoodcutterModule` into the root `AppModule` and use the `forRoot` method to configure it.

```typescript
import { Module } from '@nestjs/common';
import { WoodcutterModule } from 'nestjs-woodcutter';
import { LogLevel } from 'woodcutter';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [WoodcutterModule.forRoot({
    level: LogLevel.INFO,
    timestampFormat: 'YYYY-MM-DD HH:mm:ss'
  })],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

Then in your `bootstrap` function:

```typescript
import { NestFactory } from '@nestjs/core';
import { WOODCUTTER_NEST_PROVIDER } from 'nestjs-woodcutter';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: false,
  });
  app.useLogger(app.get(WOODCUTTER_NEST_PROVIDER));
  await app.listen(3000);
}
bootstrap();
```

To use the logger, simply instantiate it:

```typescript
import { Controller, Get, Logger } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    this.logger.debug('Hello controller', this.getHello.name);
    this.logger.error('Cannot say hello',
      new Error('Something went wrong').stack);

    return this.appService.getHello();
  }
}
```

## Stay in touch

- Author - [Olivier Schweitzer](https://www.oschweitzer.dev/)
- Twitter - [@Oli_Schweitzer](https://twitter.com/Oli_Schweitzer)

## License

  nestjs-woodcutter is [MIT licensed](LICENSE).
