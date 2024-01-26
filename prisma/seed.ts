import { PrismaClient, Prisma } from '@prisma/client';
import { createReadStream } from 'fs';
import { parse } from 'csv-parse';

const prisma = new PrismaClient();

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
async function seedDiners(filePath: string) {
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
async function seedRestaurants(filePath: string) {
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

async function main() {
    await seedDiners('./prisma/diners.csv');
    await seedRestaurants('./prisma/restaurants.csv');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });