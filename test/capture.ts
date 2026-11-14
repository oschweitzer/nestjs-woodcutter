import { vi } from 'vitest';

// winston's console transport writes through `console._stdout`, which Vitest replaces.
const consoleStdout = (console as unknown as { _stdout: NodeJS.WriteStream })._stdout;

/** Capture what the console transport prints until `restore` is called. */
export function captureOutput() {
  const written: string[] = [];
  const capture = (chunk: string | Uint8Array): boolean => {
    written.push(String(chunk));
    return true;
  };
  const spies = [
    vi.spyOn(process.stdout, 'write').mockImplementation(capture),
    vi.spyOn(consoleStdout, 'write').mockImplementation(capture),
  ];
  return {
    output: () => written.join(''),
    restore: () => {
      spies.forEach((spy) => {
        spy.mockRestore();
      });
    },
  };
}
