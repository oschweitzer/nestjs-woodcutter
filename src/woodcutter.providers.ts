import { LoggerService, Provider } from '@nestjs/common';
import { WoodCutter } from 'woodcutter';
import { ConfigurationInterface } from 'woodcutter/dist/lib/interfaces/configuration.interface';
import {
  LOGGER_OPTIONS,
  WOODCUTTER_NEST_PROVIDER,
  WOODCUTTER_PROVIDER,
} from './woodcutter.constants';

class WoodCutterLogger implements LoggerService {
  constructor(private readonly logger: WoodCutter) {}

  public log(message: any, context?: string) {
    return this.logger.info(message, `(${context})`);
  }

  public error(message: any, trace?: string, context?: string): any {
    return this.logger.error(message, trace, `(${context})`);
  }

  public warn(message: any, context?: string): any {
    return this.logger.warn(message, `(${context})`);
  }

  public debug?(message: any, context?: string): any {
    return this.logger.debug(message, `(${context})`);
  }

  public verbose?(message: any, context?: string): any {
    return this.logger.verbose(message, `(${context})`);
  }
}

export function createWoodcutterProviders(loggerOptions): Provider[] {
  return [
    {
      provide: LOGGER_OPTIONS,
      useValue: loggerOptions,
    },
    {
      provide: WOODCUTTER_PROVIDER,
      useFactory: (options: ConfigurationInterface) => {
        return new WoodCutter(options);
      },
      inject: [LOGGER_OPTIONS],
    },
    {
      provide: WOODCUTTER_NEST_PROVIDER,
      useFactory: (logger: WoodCutter) => {
        return new WoodCutterLogger(logger);
      },
      inject: [WOODCUTTER_PROVIDER],
    },
  ];
}
