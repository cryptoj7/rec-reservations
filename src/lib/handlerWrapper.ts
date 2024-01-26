import { Request, Response } from "express";
import { ErrorMessages } from "./errorMessages";

export function handlerWrapper(fn: WrappedHandler) {
  return async (req: Request, res: Response) => {
    try {
      let result = await fn(req, res);
      if (!(result instanceof APIResponse)) {
        // default to hiding details
        result = APIResponse.ok();
      }
      console.log(result.body);
      return res.status(result.statusCode).send(result.payload);
    } catch (err: any) {
      if (!(err instanceof APIResponse)) {
        console.error("UNEXPECTED ERROR!", err, err.stack);
        err = APIResponse.unknown();
      }
      console.log(err.payload);
      return res.status(err.statusCode).send(err.payload);
    }
  };
}

// When possible, restrict the WrappedHandler's return to `Promise<APIResponse>`.
export type WrappedHandler = (req: Request, res: Response) => any;

export class APIResponse {
  constructor(readonly payload: any, readonly statusCode: number) {
    if (typeof payload === "string") this.payload = { msg: payload };
  }

  static good(payload: any): APIResponse {
    return new APIResponse(payload, payload ? 200 : 204);
  }

  static ok(): APIResponse {
    return new APIResponse(undefined, 204);
  }

  static badArgs(msg: string): APIResponse {
    return new APIResponse({ msg }, 400);
  }

  static conflict(msg: string): APIResponse {
    return new APIResponse({ msg }, 409);
  }

  static unauthorized(msg?: string): APIResponse {
    return new APIResponse(msg ? { msg } : undefined, 401);
  }

  static missing(msg?: string): APIResponse {
    return new APIResponse(msg ? { msg } : undefined, 404);
  }

  static unknown(): APIResponse {
    // hide details of unexpected errors
    return new APIResponse({ msg: ErrorMessages.SERVER_ERROR }, 500);
  }

  //
  // To match Error interface.
  //

  get name(): string {
    return "APIResponse";
  }

  get message(): string {
    return String(this.payload);
  }
}
