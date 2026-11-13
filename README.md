# Neo4j CRUD REST API — Node.js and Express

An educational REST API showing how a Node.js service connects to a **Neo4j graph database** through the `neo4j-driver` package.

## Endpoints in the current implementation

| Method | Route | Operation |
| --- | --- | --- |
| GET | `/` | List `User` nodes |
| GET | `/:id` | Find a user by `_id` |
| POST | `/` | Create a user |
| PUT | `/:id` | Update user properties |
| DELETE | `/:id` | Delete a user |

## Run locally

1. Install Node.js and a local Neo4j database.
2. Run `npm install`.
3. Create your own configuration: `cp .env.example .env`. Replace the placeholder password with a **local** Neo4j credential.
4. Run `npm start`; the application listens on the `PORT` defined in `.env` (example: `8001`).

The app reads `url`, `db_username`, `db_password` and `database` from its environment.

## Security warning

**This repository contains prototype code and should not be deployed publicly as-is.** The original model implementation interpolates input into Cypher query strings, which can enable Cypher injection; it also models a plaintext password property and has limited validation and error handling. Use **parameterized Cypher queries**, appropriate authentication, password hashing, and response filtering before production use.

The tracked `.env.example` has been changed to local placeholders. If any previously committed credentials were real, rotate them; replacing the current example does **not** remove older Git commits.

## Author

**Abishek Paudel** · [Portfolio](https://abishekpaudel.com.np) · [LinkedIn](https://www.linkedin.com/in/abishekpaudel/)
