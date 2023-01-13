/**
 * Represents a type that may or may not be a promise
 */
declare type Awaitable<T> = PromiseLike<T> | T;

/**
 * Lazy is a wrapper around a value that is computed lazily. It is useful for
 * cases where the value is expensive to compute and the computation may not
 * be needed at all.
 *
 * @param cb - The callback to lazily evaluate
 * @typeParam T - The type of the value
 * @example
 * ```ts
 * const value = lazy(() => computeExpensiveValue());
 * ```
 */
declare function lazy<T>(cb: () => T): () => T;

/**
 * Yields the numbers in the given range as an array
 *
 * @param start - The start of the range
 * @param end - The end of the range (inclusive)
 * @param step - The amount to increment between each number
 * @example
 * Basic range
 * ```ts
 * range(3, 5); // [3, 4, 5]
 * ```
 * @example
 * Range with a step
 * ```ts
 * range(3, 10, 2); // [3, 5, 7, 9]
 * ```
 */
declare function range(start: number, end: number, step?: number): number[];

/**
 * Represents an object capable of representing itself as a JSON object
 *
 * @typeParam T - The JSON type corresponding to {@link JSONEncodable.toJSON} outputs.
 */
interface JSONEncodable<T> {
    /**
     * Transforms this object to its JSON format
     */
    toJSON(): T;
}
/**
 * Indicates if an object is encodable or not.
 *
 * @param maybeEncodable - The object to check against
 */
declare function isJSONEncodable(maybeEncodable: unknown): maybeEncodable is JSONEncodable<unknown>;

/**
 * Represents a structure that can be checked against another
 * given structure for equality
 *
 * @typeParam T - The type of object to compare the current object to
 */
interface Equatable<T> {
    /**
     * Whether or not this is equal to another structure
     */
    equals(other: T): boolean;
}
/**
 * Indicates if an object is equatable or not.
 *
 * @param maybeEquatable - The object to check against
 */
declare function isEquatable(maybeEquatable: unknown): maybeEquatable is Equatable<unknown>;

export { Awaitable, Equatable, JSONEncodable, isEquatable, isJSONEncodable, lazy, range };
