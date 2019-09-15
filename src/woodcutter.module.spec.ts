import { Test, TestingModule } from '@nestjs/testing';
import { WoodcutterModule } from './index';

describe('Woodcutter module', () => {
  let module: TestingModule;
  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [WoodcutterModule.forRoot()],
    }).compile();
  });
  it('should be defined', () => {
    expect(module).toBeDefined();
  });
});
