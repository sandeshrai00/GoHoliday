require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@libsql/client');
const { drizzle } = require('drizzle-orm/libsql');
const { sqliteTable, text, integer, real } = require('drizzle-orm/sqlite-core');
const { eq } = require('drizzle-orm');

const categoriesSchema = sqliteTable('categories', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull(),
    slug: text('slug').notNull().unique(),
});

const tourCategoriesSchema = sqliteTable('tour_categories', {
    tour_id: integer('tour_id').notNull(),
    category_id: integer('category_id').notNull(),
});

async function runTest() {
    const client = createClient({
        url: process.env.TURSO_DATABASE_URL,
        authToken: process.env.TURSO_AUTH_TOKEN,
    });
    const db = drizzle(client);

    try {
        console.log("1. Testing Category Insert...");
        const [newCat] = await db.insert(categoriesSchema).values({
            name: "Test Cat",
            slug: "test-" + Date.now()
        }).returning();
        console.log("Success! Returned:", newCat);

        console.log("2. Testing Tour Categories Insert...");
        await db.insert(tourCategoriesSchema).values([{
            tour_id: 1, // Assume tour 1 exists
            category_id: newCat.id
        }]);
        console.log("Success! Assigned category to tour.");

        console.log("3. Testing Tour Categories Delete...");
        await db.delete(tourCategoriesSchema).where(eq(tourCategoriesSchema.tour_id, 1));
        console.log("Success! Deleted associations.");

    } catch (err) {
        console.error("Error caught:", err);
    }
}

runTest();
