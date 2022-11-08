import type { Context } from "./context.ts";

export type Handler = (
  ctx: Context,
) => Promise<unknown> | unknown;

export type ErrorInit = {
  status?: number;
  message?: string;
};

export class ServerError extends Error {
  status: number;
  expose: boolean;
  constructor({
    status = 500,
    message = "An unknown error occurred.",
  }: ErrorInit) {
    super(message);
    this.status = status;
    this.expose = status < 500;
  }

  // deno-lint-ignore no-explicit-any
  static from(error: any) {
    const { status, message } = error;
    return new ServerError({ status, message });
  }

  get #message() {
    if (this.expose) return this.message;
    return "An unknown error occurred.";
  }

  serialize = () => {
    const { status } = this;
    const message = this.#message;
    return { error: { status, message } };
  };
}
