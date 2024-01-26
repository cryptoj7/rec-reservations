
//
// TypeScript
//

export function isDefined<T>(x: T | undefined): x is T {
  return x !== undefined;
}

export function isInteger(x: number): boolean {
  return x % 1 == 0;
}

//
// Error Handling
// Prevent errors from crashing the server.
//
