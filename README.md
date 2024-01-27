# rec-reservations

## Description

Simple Restaurant Booking API that allows users to do the following: with a group of friends, find a restaurant that fits the dietary restrictions of the whole group, with an available table at a specific time, and then create a reservation for that group and time.

## Getting Started

This is designed to be able to use any SQL database using Prisma.  A simple SQLite db was setup locally for testing.  The schema is defined in the schama.prisma file.  I have provide a script to seed the database with the provided test data in prisma/seed.ts.  Follow these steps after creating your db.  

````bash
npx prisma db push
npx prisma generate
npm install
npm run seed
npm run start
````

### Prisma

Prisma is a Typescript ORM with a focus on developer ergonomics.

- Generated migrations from schema file changes
- Generated type-safe client library (located at `node_modules/.prisma/PrismaClient`)

#### Prisma Workflow

1. Configure `DATABASE_URL` environment variable

   `export DATABASE_URL=mysql://user:password@localhost:3306/dev`

2. If this is a fresh DB instance create the schema
   `npx prisma db push`

#### Schema Changes

1. Modify Prisma schema file `prisma/schema.prisma`

   ```diff
    model User {
        userId    Int      @id @default(autoincrement())
        email     String   @unique @db.VarChar(100)
        password  String
        firstName String?  @map("first_name")
        lastName  String?  @map("last_name")
        createdAt DateTime @default(now())
        updatedAt DateTime @updatedAt
   +    isActive  Boolean  @default(true)
        }
   ```

2. Create a migration to add the column

   ```shell
   yarn prsima migrate dev --name add_isActive_to_user





## API Usage
There are 3 API endopoints \
POST /api/reservation/book \
GET /api/reservation/search \
DELETE api/reservation/{reservationId}/cancel

Examples:
```sh
curl --location --request POST 'http://localhost:3000/api/reservation/book' \
--header 'Content-Type: application/json' \
--data-raw '{
    "time": "2024-01-27 18:45:00",
    "groupSize": 2,
    "eater": 3,
    "table": 10
}'
```

```sh
curl --location --request DELETE 'http://localhost:3000/api/reservation/5/cancel'
```

```sh
curl --location --request GET 'http://localhost:3000/api/reservation/search?time=2024-01-26 18:45:00&groupSize=4&restriction=Vegetarian&restriction=Gluten'
```



## Testing
Local testing can be done through POSTMAN.  There are also some unit tests that bring up and bring down a sqlite db.  To run those use
````bash
npm run test

````
if it fails, you might have to run npm run clean-tests to reset the dbs
