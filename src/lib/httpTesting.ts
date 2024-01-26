import { expect } from "chai";
import { isDefined } from "../controllers/util";

export function missingHeader(header: string) {
  return (res: Response) => {
    expect(!isDefined(res.headers[header]));
  };
}

export const DATE_TIME_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;