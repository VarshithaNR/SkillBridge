/**
 * Mimics enough of a Mongoose Query to support the two calling patterns used
 * in auth.service.ts: `await Model.findOne(...)` (awaited directly) and
 * `await Model.findOne(...).select('+field')` (chained then awaited).
 * Keeps our tests independent of a real MongoDB connection.
 */
interface MockQuery<T> {
  select: jest.Mock<MockQuery<T>, unknown[]>;
  then: (resolve: (value: T) => void, reject?: (reason: unknown) => void) => Promise<void>;
}

export function mockQuery<T>(result: T): MockQuery<T> {
  const query: MockQuery<T> = {
    select: jest.fn(() => query),
    then: (
      resolve: (value: T) => void,
      reject?: (reason: unknown) => void
    ): Promise<void> => Promise.resolve(result).then(resolve, reject),
  };
  return query;
}
