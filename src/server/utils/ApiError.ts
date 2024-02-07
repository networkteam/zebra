import { ApiErrors } from 'src/types';

export default class ApiError extends Error {
  constructor(
    public readonly errorMessage: string,
    public readonly status: number,
    public readonly url: string,
    public readonly errors?: ApiErrors['errors'],
    public readonly responseBody?: string
  ) {
    super(`${errorMessage}, status: ${status}, url: ${url}` + (errors ? `, errors: ${errors.join(',')}` : ''));
    this.errorMessage = errorMessage;
    this.status = status;
    this.url = url;
    this.errors = errors;
    this.responseBody = responseBody;
  }
}
