import type { IHttpClient } from '../utils/http/types';

export class NotFoundError extends Error {
  constructor(message = 'Resource not found') {
    super(message);
    this.name = 'NotFoundError';
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class ValidationError extends Error {
  constructor(message = 'Validation failed') {
    super(message);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export interface BaseErrorResponse {
  code?: string;
  message: string;
  status?: number;
}

export abstract class BaseRepository {
  protected readonly httpClient: IHttpClient;

  constructor(httpClient: IHttpClient) {
    this.httpClient = httpClient;
  }

  protected handleError(error: unknown): Error {
    if (error instanceof Error) return error;
    return new Error('Unknown error');
  }
}
