import { DynamicModule, Global, Module } from '@nestjs/common';
import { ConfigurationInterface } from 'woodcutter';
import { createWoodcutterProviders } from './woodcutter.providers';

@Global()
@Module({})
export class WoodcutterModule {
  static forRoot(loggerOptions?: ConfigurationInterface): DynamicModule {
    const providers = createWoodcutterProviders(loggerOptions);
    return {
      module: WoodcutterModule,
      providers,
      exports: providers,
    };
  }
}
