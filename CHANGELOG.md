# Changelog

## 1.0.0

### Changed (breaking)

- Requires Node.js 20.19 or later.
- Supports NestJS 11 and 12 (was 6). `@nestjs/common` is now a peer dependency.
- Requires [woodcutter](https://github.com/oschweitzer/woodcutter) 3 (was exactly 2.1.2). It is a peer dependency.
- The context is printed before the message, in brackets (`[AppController] Hello`). It used to be
  passed as an extra argument and printed after the message, in parentheses, with the text
  `(undefined)` when there was none.
- The stack given to `error(message, stack, context)` is printed on the lines below the message.
- `@nestjs/core`, `@nestjs/platform-express`, `reflect-metadata`, `rxjs` and `rimraf` are no longer
  runtime dependencies; they were never needed by the package.
- Rewritten in strict TypeScript 6, shipped as ES modules and CommonJS with an `exports` map.
- Tooling: Vitest, ESLint (flat config) and Prettier 3 replace Jest, TSLint and Prettier 1; GitHub Actions
  (Node 20, 22 and 24 against Nest 11 and 12) replaces Travis CI.

### Added

- `WoodcutterModule.forRootAsync`, to compute the options when the app starts.
- `WoodcutterLogger`, the Nest `LoggerService`, now exported. It implements `fatal` (logged as an error).
- `WoodcutterOptions` type.
- Tests for the logger, the module and a real Nest application, and a smoke test of the built package.

### Fixed

- Messages that are objects or errors are serialized instead of printed as `[object Object]`.
- No more `(undefined)` when a message has no context.
- The `license` and `author` fields no longer expose an email address.

## 0.0.4

Last release of the 0.x line (NestJS 6, woodcutter 2.1.2).
