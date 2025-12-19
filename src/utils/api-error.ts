export class ApiError<TBody = unknown> extends Error {
  readonly status: number;
  readonly body?: TBody;

  constructor(status: number, message: string, body?: TBody) {
    super(message);
    this.status = status;
    this.body = body;
  }
}
