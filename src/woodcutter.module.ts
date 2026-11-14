import {
  type DynamicModule,
  type FactoryProvider,
  Global,
  Module,
  type ModuleMetadata,
} from '@nestjs/common';
import type { ConfigurationInterface } from 'woodcutter';
import { LOGGER_OPTIONS } from './woodcutter.constants.js';
import { createLoggerProviders, createWoodcutterProviders } from './woodcutter.providers.js';

export interface WoodcutterModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  /** Providers to inject into `useFactory`. */
  inject?: FactoryProvider['inject'];
  /** Build the woodcutter options, possibly from other providers such as `ConfigService`. */
  useFactory: FactoryProvider<
    ConfigurationInterface | Promise<ConfigurationInterface>
  >['useFactory'];
}

@Global()
@Module({})
export class WoodcutterModule {
  /** Register the logger with static options. */
  static forRoot(loggerOptions?: ConfigurationInterface): DynamicModule {
    const providers = createWoodcutterProviders(loggerOptions);
    return { module: WoodcutterModule, providers, exports: providers };
  }

  /** Register the logger with options that are computed when the app starts. */
  static forRootAsync(options: WoodcutterModuleAsyncOptions): DynamicModule {
    const providers = [
      {
        provide: LOGGER_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject ?? [],
      },
      ...createLoggerProviders(),
    ];
    return {
      module: WoodcutterModule,
      imports: options.imports ?? [],
      providers,
      exports: providers,
    };
  }
}
