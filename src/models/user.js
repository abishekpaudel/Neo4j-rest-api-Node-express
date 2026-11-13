import { nanoid } from "nanoid";
import neo4j from "neo4j-driver";
import { randomBytes, scrypt } from "node:crypto";
import { promisify } from "node:util";
import * as dotenv from "dotenv";

dotenv.config();

const { url, db_username, db_password, database } = process.env;

if (!url || !db_username || !db_password || !database) {
  throw new Error("Set url, db_username, db_password and database in your environment");
}

const driver = neo4j.driver(url, neo4j.auth.basic(db_username, db_password));
const scryptAsync = promisify(scrypt);

const withoutSecrets = "u { ._id, .name, .email } AS user";

async function run(query, params = {}) {
  const session = driver.session({ database });
  try {
    return await session.run(query, params);
  } finally {
    await session.close();
  }
}

function assertText(value, name) {
  if (typeof value !== "string" || !value.trim()) {
    const error = new Error(name + " is required");
    error.status = 400;
    throw error;
  }
  return value.trim();
}

function publicUsers(result) {
  return result.records.map((record) => record.get("user"));
}

async function hashPassword(password) {
  if (typeof password !== "string" || password.length < 8) {
    const error = new Error("Password must have at least 8 characters");
    error.status = 400;
    throw error;
  }
  const salt = randomBytes(16).toString("hex");
  const hash = (await scryptAsync(password, salt, 64)).toString("hex");
  return { passwordHash: hash, passwordSalt: salt };
}

const findAll = async () => {
  const result = await run("MATCH (u:User) RETURN " + withoutSecrets);
  return publicUsers(result);
};

const findById = async (id) => {
  const result = await run(
    "MATCH (u:User { _id: $id }) RETURN " + withoutSecrets + " LIMIT 1",
    { id: assertText(id, "id") }
  );
  return publicUsers(result)[0] ?? null;
};

const create = async (user = {}) => {
  const name = assertText(user.name, "name");
  const email = assertText(user.email, "email");
  const credentials = await hashPassword(user.password);
  const result = await run(
    "CREATE (u:User { _id: $id, name: $name, email: $email, passwordHash: $passwordHash, passwordSalt: $passwordSalt }) RETURN " + withoutSecrets,
    { id: nanoid(8), name, email, ...credentials }
  );
  return publicUsers(result)[0];
};

const findByIdAndUpdate = async (id, user = {}) => {
  const updates = {};
  if (Object.prototype.hasOwnProperty.call(user, "name")) {
    updates.name = assertText(user.name, "name");
  }
  if (Object.prototype.hasOwnProperty.call(user, "email")) {
    updates.email = assertText(user.email, "email");
  }
  if (Object.prototype.hasOwnProperty.call(user, "password")) {
    Object.assign(updates, await hashPassword(user.password));
  }
  if (!Object.keys(updates).length) {
    const error = new Error("At least one allowed field must be provided");
    error.status = 400;
    throw error;
  }
  const result = await run(
    "MATCH (u:User { _id: $id }) SET u += $updates RETURN " + withoutSecrets,
    { id: assertText(id, "id"), updates }
  );
  return publicUsers(result)[0] ?? null;
};

const findByIdAndDelete = async (id) => {
  await run("MATCH (u:User { _id: $id }) DELETE u", { id: assertText(id, "id") });
  return findAll();
};

export default { findAll, findById, create, findByIdAndUpdate, findByIdAndDelete };
