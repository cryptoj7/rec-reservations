import { Router, json } from "express";

import * as reservation from "../controllers/reservation.controller";

export default function (): Router {
  const router = Router();

  router.use(json());

  router.get("/search", reservation.getReservations);
  router.post("/book", reservation.bookReservation);
  router.delete("/:id/cancel", reservation.cancelReservation)

  return router;
}
