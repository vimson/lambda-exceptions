import { PromiseHandler } from '../types/common.type';
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from 'aws-lambda';

class GenericError extends Error {
  statusCode: number;
  message: string;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
  }
}

const httpErrorHandler =
  (logger?: Function) =>
  (
    handler: PromiseHandler<APIGatewayProxyEvent, APIGatewayProxyResult>
  ): PromiseHandler<APIGatewayProxyEvent, APIGatewayProxyResult> =>
  async (
    event: APIGatewayProxyEvent,
    context: Context
  ): Promise<APIGatewayProxyResult> => {
    try {
      return await handler(event, context);
    } catch (error: unknown) {
      let statusCode = 500;
      let errorMessage = 'Internal Server Error';
      let errorStack = error;

      if (error instanceof GenericError) {
        statusCode = error.statusCode;
        errorStack = errorMessage = error.message ?? errorMessage;
      }

      if (logger) {
        logger(errorMessage);
      } else {
        console.log(errorMessage);
      }

      return {
        statusCode: statusCode,
        body: JSON.stringify({ message: errorMessage }),
      };
    }
  };

export { httpErrorHandler, GenericError };
