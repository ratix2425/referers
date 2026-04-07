export type Result<T, E = string> =
  | { ok: true; value: T }
  | { ok: false; error: E }

export const Result = {
  ok<T>(value: T): Result<T> {
    return { ok: true, value }
  },
  err<E = string>(error: E): Result<never, E> {
    return { ok: false, error }
  },
}
