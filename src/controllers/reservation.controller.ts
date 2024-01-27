import { Request } from "express";

import { Prisma } from ".prisma/client";

import { db } from "../lib/db";
import {
  optionalBooleanArgument,
  optionalDecimalArgument,
  optionalIntegerArgument,
  optionalStringArgument,
  optionalDateArgument,
  optionalStringArrayArgument,
  requiredIntegerArgument,
  requiredStringArgument,
  requiredDateArgument,
} from "../lib/arguments";
import { DURATION } from "../lib/constants";
import { handlerWrapper, APIResponse } from "../lib/handlerWrapper";
import { ErrorMessages } from "../lib/errorMessages";
import path from "path";

export const bookReservation = handlerWrapper(async (req) => {

  const eaterId = requiredIntegerArgument(req.body, "eater");
  const tableId = requiredIntegerArgument(req.body, "table");
  const time = requiredDateArgument(req.body, "time");
  const groupSize = optionalIntegerArgument(req.body, "groupSize", 1);

  // check if eater already has reservation at this time
  const resCheck = await db(req).reservation.findFirst({
    where: {
      OR: [
        {
          eaterId: eaterId,
          OR: [
            {
              time: {
                lte: time,
                gte: new Date(time.getTime() - DURATION)
              }
            },
            {
              time: {
                lte: new Date(time.getTime() + DURATION),
                gte: time
              }
            }
          ]
        },
        {
          tableId: tableId,
          OR: [
            {
              time: {
                lte: time,
                gte: new Date(time.getTime() - DURATION)
              }
            },
            {
              time: {
                lte: new Date(time.getTime() + DURATION),
                gte: time
              }
            }
          ]
        }
      ]
    }
  })

  if (resCheck) {
    if (resCheck.eaterId === eaterId) {
      return APIResponse.badArgs(ErrorMessages.EXISTING_RESERVATION);
    }
    return APIResponse.badArgs(ErrorMessages.TABLE_RESERVED);
  }

  const reservation = await db(req).reservation.create({
    data: {
      time,
      groupSize,
      duration: DURATION,
      eater: { connect: { eaterId } },
      table: { connect: { tableId } },
    },
  });
  console.info(
    `Reservation "${reservation.reservationId}" created for eater "${eaterId}"`
  );

  return APIResponse.good({
    reservationId: reservation.reservationId,
    msg: "successfully created reservation",
  });
});

const isSomeEnum =
  <T>(e: T) =>
  (token: any): token is T[keyof T] =>
    Object.values(e).includes(token as T[keyof T]);



export const getReservations = handlerWrapper(async (req: Request) => {
  const groupSize = optionalIntegerArgument(req.query, "groupSize", 1);

  const reservationTime = optionalDateArgument(req.query, "time")

  const restrictions = optionalStringArrayArgument(req.query, "restriction")
  console.log(restrictions);

  const searchString = optionalStringArgument(req.query, "searchString", "");

  const limit = optionalIntegerArgument(req.query, "limit", 100);

  const query: Prisma.RestaurantFindManyArgs = {
    where: {
      endorsements: {
        some: {
          name: {
            in: restrictions
          }
        }
      },
      tables: {
        some: {
          capacity: {
            gte: groupSize
          },
          reservations: {
            none: {
              OR: [
                {
                  time: {
                    lte: reservationTime,
                    gte: new Date(reservationTime.getTime() - DURATION)
                  }
                },
                {
                  time: {
                    lte: new Date(reservationTime.getTime() + DURATION),
                    gte: reservationTime
                  }
                }
              ]
            }
          }
        }
      }
    },
    take: limit,
    include: {
      endorsements: true
    },
  };

  if (searchString) query.where.name = { contains: searchString };

  const reservations = await db(req).restaurant.findMany(query);

  console.log(reservations)

  return APIResponse.good({
    reservations: reservations.filter(res => { // filter a small list of endorsements to match all dietary restrictions
      if (restrictions && 'endorsements' in res && Array.isArray(res.endorsements)) {  // TS compile check should always be true
        const endorsementNames = res.endorsements.map(e => e.name);
        return restrictions.every(restriction => endorsementNames.includes(restriction));
      }
      return true;
    }),
    msg: "successfully retrieved restaurants",
  });
});


export const cancelReservation = handlerWrapper(async (req: Request) => {

  const reservationId = requiredIntegerArgument(req.params, "id");

  // TODO with auth, check reservation to eaterId of active session and return error response if eater did not create reservation

  await db(req).reservation.delete({
    where: {
      reservationId: reservationId
    }
  });

  return APIResponse.good({
    reservationId: reservationId,
    msg: "successfully canceled reservation",
  });
});

