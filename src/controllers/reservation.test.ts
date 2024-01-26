import { config as ChaiConfig, expect, use as ChaiUse } from "chai";
import ChaiAsPromised from "chai-as-promised";
import request from "supertest";

import { setupApp } from "../app";
import { Debug } from "../lib/debug";
import { DATE_TIME_REGEX } from "../lib/httpTesting";
import { makeTestBaseDatabase } from "../lib/testdb";
import { PrismaClient } from "@prisma/client";
import { createReadStream } from 'fs';
import { parse } from 'csv-parse';
import { setTimeout } from "timers/promises";

ChaiUse(ChaiAsPromised);

// Utility function to read CSV file
async function readCSV(filePath: string): Promise<any[]> {
  var results: string[] = [];
  return new Promise((resolve, reject) => {
      createReadStream(filePath)
          .pipe(parse({delimiter: ',', columns: true}))
          .on('data', (data) => results.push(data))
          .on('end', () => resolve(results))
          .on('error', (error) => reject(error));
  });
}

// Seeding function for Diners
async function seedDiners(prisma: PrismaClient, filePath: string) {
  const diners = await readCSV(filePath);

  for (const diner of diners) {
      console.log(diner)
      await prisma.eater.create({
          data: {
              name: diner['Name'],
              //  dietaryRestrictions is an array of restriction names separated by commas
              dietaryRestrictions: {
                  create: diner['Dietary Restrictions'].split(',').map((restriction) => ({
                      dietaryRestriction: { create: { name: restriction.trim().split('-')[0] } }
                  }))
              }
          }
      });
  }
}

// Seeding function for Restaurants
async function seedRestaurants(prisma: PrismaClient, filePath: string) {
  const restaurantsData = await readCSV(filePath);

  for (const data of restaurantsData) {
      console.log(data)
      const endorsements = data.Endorsements.split(',').map(name => name.trim().split('-')[0]); // make endorsement values equal restrictions

      /*const endorsementsData: Prisma.EndorsementCreateInput = endorsements.map(name => ({
          name
      }));*/

      var i = 0;
      var tables: any[] = []
      while (i < parseInt(data['No. of two-top tables'])) {
          tables.push(2)
          i = i + 1
      }

      i = 0

      while (i < parseInt(data['No. of four-top tables'])) {
          tables.push(4)
          i = i + 1
      }

      i = 0

      while (i < parseInt(data['No. of six-top tables'])) {
          tables.push(6)
          i = i + 1
      }

      await prisma.restaurant.create({
          data: {
              name: data.Name,
              endorsements: {
                  create: endorsements.map(endorsement => ({
                          name: endorsement.replace(/\s/g, "-").split('-')[0], 
                          fullName: endorsement
                      }
                  ))
              },
              tables: {
                  create: tables.map(capacity => ({
                      capacity: capacity 
                  }))
              }
          }
      });
  }
}

describe("Reservation Controller", function () {
  ChaiConfig.includeStack = true;
  ChaiConfig.showDiff = true;

  let app: Express.Application;
  beforeEach("book", async function () {
    const databaseURL = await makeTestBaseDatabase(this.test)
    app = await setupApp({
      databaseURL: databaseURL,
      corsOrigin: 'http://localhost:8000'
    });
    //app.listen(0);
    // seed test db
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: databaseURL
        }
      }
    })

    await seedDiners(prisma, './prisma/diners.csv');
    await seedRestaurants(prisma, './prisma/restaurants.csv');

    await prisma.$disconnect();
  });

  const reservation = {
    time: "2024-01-26 18:45:00",
    eater: "1",
    groupSize: "2",
    table: "10",
  };

  describe("book", function () {
    it("success", async function () {
      console.log(app)
      await request(app)
        .post("/api/reservation/book")
        .field("json", JSON.stringify({ reservation }))
        .expect(Debug.body)
        .expect(200)
        .expect({
          reservationId: 1,
          msg: "successfully created reservation",
        });
    });

    it("already reserved", function () {
      return request(app)
        .post("/api/reservation/book")
        .field("json", JSON.stringify({ ...reservation, table: "12" }))
        .expect(Debug.body)
        .expect(400)
        .expect({
          msg: "you already have a reservation for this time",
        });
    });

    it("table taken", function () {
      return request(app)
        .post("/api/reservation/book")
        .field("json", JSON.stringify({ ...reservation, eater: "3" }))
        .expect(Debug.body)
        .expect(400)
        .expect({
          msg: "this table is already reserved",
        });
    });

    it("cancel", function () {
      return request(app)
        .delete("/api/reservation/1/cancel")
        .expect(Debug.body)
        .expect(200)
        .expect({
          reservationId: 1,
          msg: "successfully canceled reservation",
        });
    });

  });

  describe("has restaurants", function () {
    const reservations = [
      reservation,
      {
        time: "2024-01-27 18:45:00",
        eater: "2",
        groupSize: "2",
        table: "10",
      },
    ];

    describe("get restaurants", function () {
      it("no args", function () {
        return request(app)
          .get("/api/reservation/search?time=2024-01-26 18:45:00")
          .send()
          .expect(200)
          .expect(function (res) {
            expect(res.body, "body").to.exist;
            expect(res.body.msg, "msg").to.equal(
              "successfully retrieved restaurants"
            );

            expect(res.body.restaurants).to.have.length(5);
            const r = res.body.restaurants[0];

            expect(r, "restaurant").to.exist;
            expect(r.restaurantId, "id").to.equal(1);
          });
      });

    });
  });
});
