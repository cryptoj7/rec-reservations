import { PrismaClient } from "@prisma/client";
import { Request, Response, NextFunction } from "express";
import { isDefined } from "../controllers/util";
import { ErrorMessages } from "./errorMessages";

// See https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/constructor
// for options.

declare global {
  namespace Express {
    interface Request {
      db: PrismaClient;
    }
  }
}

export function connectDatabase(url: string): PrismaClient {
  return new PrismaClient({
    datasources: {
      db: {
        url,
      },
    },
  });
}

export function attachDatabase(db: PrismaClient) {
  return (req: Request, res: Response, next: NextFunction) => {
    req.db = db;
    next();
  };
}

export function db(req: Request): PrismaClient {
  const d = req.db;
  if (!isDefined(d)) throw Error(ErrorMessages.DB_MISSING);
  return d;
}
