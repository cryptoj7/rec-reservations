import * as dotenv from "dotenv";
dotenv.config();

import express, { Response } from "express";
import cors from "cors";

import {
  PORT,
  HOSTNAME,
  CORS_ORIGIN,
  DATABASE_URL,
} from "./config/env";
import { attachDatabase, connectDatabase } from "./lib/db";

//import auth from "./routes/auth.routes";
import reservation from "./routes/reservation.routes";
////import user from "./routes/user.routes";

export async function setupApp({
  corsOrigin = CORS_ORIGIN,
  databaseURL = DATABASE_URL,
}: {
  corsOrigin?: string;
  databaseURL?: string;
} = {}) {
  const app = express();

  app.use(cors({ origin: corsOrigin }));

  app.use(attachDatabase(connectDatabase(databaseURL)));

  app.use("/api/reservation", reservation());
  return app;
}

if (require.main === module) {
  setupApp().then(app => {
    app.listen(PORT, HOSTNAME, () => {
      console.log(`Express is listening at http://${HOSTNAME}:${PORT}`);
      console.log(JSON.stringify({ DATABASE_URL, CORS_ORIGIN }, null, 2));
    });
  });

}
