import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const tours = sqliteTable('tours', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    title: text('title').notNull(),
    description: text('description').notNull(),
    price: real('price').notNull(),
    currency: text('currency').default('USD'),
    duration: text('duration').notNull(),
    dates: text('dates').notNull(),
    location: text('location').notNull(),
    banner_image: text('banner_image'),
    image_urls: text('image_urls').default('[]'),
    video_urls: text('video_urls').default('[]'),
    title_en: text('title_en'),
    title_th: text('title_th'),
    title_zh: text('title_zh'),
    description_en: text('description_en'),
    description_th: text('description_th'),
    description_zh: text('description_zh'),
    location_en: text('location_en'),
    location_th: text('location_th'),
    location_zh: text('location_zh'),
    created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`),
    updated_at: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
    is_discount_active: integer('is_discount_active').default(0),
    discount_percentage: real('discount_percentage')
});

export const announcements = sqliteTable('announcements', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    message: text('message').notNull(),
    is_active: integer('is_active').default(0),
    type: text('type').default('banner'),
    popup_type: text('popup_type').default('general'),
    discount_tour_id: integer('discount_tour_id'),
    discount_percentage: real('discount_percentage'),
    image_url: text('image_url'),
    message_en: text('message_en'),
    message_th: text('message_th'),
    message_zh: text('message_zh'),
    created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`)
});

export const admins = sqliteTable('admins', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    email: text('email').notNull().unique(),
    password_hash: text('password_hash').notNull(),
    created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`)
});

export const bookings = sqliteTable('bookings', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    tour_id: integer('tour_id').notNull(),
    user_id: text('user_id'),
    reference_code: text('reference_code').unique(),
    name: text('name').notNull(),
    email: text('email').notNull(),
    phone: text('phone').notNull(),
    contact_method: text('contact_method').notNull(),
    message: text('message'),
    guests: integer('guests').default(1),
    total_price: real('total_price').default(0),
    status: text('status').default('pending'),
    admin_note: text('admin_note'),
    created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`),
    updated_at: text('updated_at').default(sql`CURRENT_TIMESTAMP`)
});

export const categories = sqliteTable('categories', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull(),
    name_en: text('name_en'),
    name_th: text('name_th'),
    name_zh: text('name_zh'),
    slug: text('slug').notNull().unique(),
    created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`)
});

export const tour_categories = sqliteTable('tour_categories', {
    tour_id: integer('tour_id').notNull(),
    category_id: integer('category_id').notNull(),
});
