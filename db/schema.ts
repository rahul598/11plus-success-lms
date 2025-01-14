import { serial, text, timestamp, pgTable } from 'drizzle-orm/pg-core';

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  email: text('email').notNull().unique(),
  role: text('role').notNull().default('user'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Base schema setup - we'll add more tables as we implement features
