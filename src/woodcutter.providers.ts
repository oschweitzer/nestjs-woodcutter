import type { Provider } from '@nestjs/common';
import { type ConfigurationInterface, WoodCutter } from 'woodcutter';
import {
  LOGGER_OPTIONS,
  WOODCUTTER_NEST_PROVIDER,
  WOODCUTTER_PROVIDER,
} from './woodcutter.constants.js';
import { WoodcutterLogger } from './woodcutter.logger.js';

/** The providers that build the logger from the `LOGGER_OPTIONS` provider. */
export function createLoggerProviders(): Provider[] {
  return [
    {
      provide: WOODCUTTER_PROVIDER,
      useFactory: (options: ConfigurationInterface) => new WoodCutter(options),
      inject: [LOGGER_OPTIONS],
    },
    {
      provide: WOODCUTTER_NEST_PROVIDER,
      useFactory: (logger: WoodCutter) => new WoodcutterLogger(logger),
      inject: [WOODCUTTER_PROVIDER],
    },
  ];
}

export function createWoodcutterProviders(loggerOptions: ConfigurationInterface = {}): Provider[] {
  return [{ provide: LOGGER_OPTIONS, useValue: loggerOptions }, ...createLoggerProviders()];
}
