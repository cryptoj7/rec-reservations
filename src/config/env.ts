import { isDefined } from "../controllers/util";

export const ADMIN_KEY: string = process.env.ADMIN_KEY;
/*if (!isDefined(ADMIN_KEY))
  throw Error('must specify "ADMIN_KEY" environment variable');*/

export const PORT: number = Number(process.env.PORT) || 3000;

export const HOSTNAME: string = process.env.HOSTNAME || "localhost"; // use "0.0.0.0" for non-local

export const CORS_ORIGIN: string =
  process.env.CORS_ORIGIN || "http://localhost:5173";

export const DATABASE_URL = process.env.DATABASE_URL || "file:~/worldhaus.db";

function required(envvar: string): string {
  const value = process.env[envvar];
  if (value === undefined)
    throw Error(`must specify ${envvar} environment variable`);
  return value;
}
