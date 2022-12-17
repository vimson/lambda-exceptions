import { Context } from 'aws-lambda';

type PromiseHandler<TEvent = any, TResult = any> = (
  event: TEvent,
  context: Context
) => Promise<TResult>;

export { PromiseHandler };
