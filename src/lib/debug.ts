import { Response } from "supertest";

// Debug has useful callbacks for `expect` calls when using supertest.
export namespace Debug {
  export function all(res: Response) {
    console.log(JSON.stringify(res, null, 2));
  }

  export function body(res: Response) {
    console.log(JSON.stringify(res.body, null, 2));
  }

  export function headers(res: Response) {
    console.log(JSON.stringify(res.headers, null, 2));
  }
}
