import { db } from "../db";
import { users } from "@db/schema";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function createAdmin() {
  const hashedPassword = await hashPassword("admin123");
  
  await db.insert(users).values({
    username: "admin",
    password: hashedPassword,
    email: "admin@example.com",
    role: "admin"
  });
  
  console.log("Admin user created successfully");
}

createAdmin().catch(console.error);
