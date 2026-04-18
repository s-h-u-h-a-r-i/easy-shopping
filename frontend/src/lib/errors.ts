import { Data } from 'effect';

export class NotFound extends Data.TaggedError('NotFound')<{
  readonly resource: string;
}> {}

export class Unauthorized extends Data.TaggedError('Unauthorized')<{
  readonly message?: string;
}> {}

export class Forbidden extends Data.TaggedError('Forbidden')<{
  readonly message?: string;
}> {}

export class NetworkError extends Data.TaggedError('NetworkError')<{
  readonly message: string;
  readonly status?: number;
}> {}

export class ValidationError extends Data.TaggedError('ValidationError')<{
  readonly message: string;
}> {}

export type AppError =
  | NotFound
  | Unauthorized
  | Forbidden
  | NetworkError
  | ValidationError;
