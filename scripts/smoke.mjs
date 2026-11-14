// Loads the built package both ways, as a consumer would, and boots a real Nest app with it.
import { execFileSync } from 'node:child_process';

const run = (args) =>
  execFileSync(process.execPath, args, {
    encoding: 'utf8',
    env: { ...process.env, NO_COLOR: '1' },
  });

const body = `
  const app = await Test.createTestingModule({
    imports: [WoodcutterModule.forRoot({ level: 'debug' })],
  }).compile();
  app.get(WOODCUTTER_NEST_PROVIDER).log('hello', 'Smoke');
`;
const viaImport = run([
  '--input-type=module',
  '-e',
  `import 'reflect-metadata';
   import { Test } from '@nestjs/testing';
   import { WoodcutterModule, WOODCUTTER_NEST_PROVIDER } from 'nestjs-woodcutter';
   ${body}`,
]);
const viaRequire = run([
  '-e',
  `require('reflect-metadata');
   const { Test } = require('@nestjs/testing');
   const { WoodcutterModule, WOODCUTTER_NEST_PROVIDER } = require('nestjs-woodcutter');
   (async () => { ${body} })();`,
]);

const line = /^\d{4}-\d\d-\d\d \d\d:\d\d:\d\d - \[INFO\]\s+ \| \[Smoke\] hello\n$/;
for (const [name, out] of [
  ['import', viaImport],
  ['require', viaRequire],
]) {
  if (!line.test(out)) {
    console.error(`smoke test failed (${name}): ${JSON.stringify(out)}`);
    process.exit(1);
  }
}
console.log('smoke test OK (import and require)');
