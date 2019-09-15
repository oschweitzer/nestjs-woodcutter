import { DynamicModule, Global, Module } from '@nestjs/common';
import { createWoodcutterProviders } from './woodcutter.providers';

@Global()
@Module({})
export class WoodcutterModule {
  static forRoot(loggerOptions): DynamicModule {
    const providers = createWoodcutterProviders(loggerOptions);
    return {
      module: WoodcutterModule,
      providers,
      exports: providers,
    };
  }
}
