# Neo4j CRUD REST API — Node.js and Express

Educational REST API showing how an Express service connects to Neo4j using `neo4j-driver`.

## Endpoints

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/` | List users (excludes credential fields) |
| GET | `/:id` | Get user by ID (404 when absent) |
| POST | `/` | Create user with name, email, password |
| PUT | `/:id` | Update name, email or password |
| DELETE | `/:id` | Delete user; returns remaining users |

## Run locally

1. Install Node.js and Neo4j.
2. Run `npm install`.
3. Copy `cp .env.example .env` and set a **local** Neo4j username/password.
4. Run `npm start`. The app listens on the `PORT` environment variable (example: 8001).

Required variables: `url`, `db_username`, `db_password`, `database`, `PORT`.

## Security improvements proposed in this branch

- Parameterize all user input in Cypher queries rather than interpolating it.
- Hash newly written passwords using Node.js `scrypt` and unique random salts.
- Exclude credential fields from API output.
- Use short-lived database sessions and close each after the query.
- Return controlled errors instead of internal database stack traces.

### Important compatibility and security limitations

- **Prototype only; not production-ready.** Routes still lack authentication, authorization, access controls, account/email uniqueness, request rate limiting and complete automated tests.
- Existing rows created before this change may have a plaintext `password` property; **this branch does not automatically migrate or delete that data**. Review/migrate any test database before deployment.
- Writing new `passwordHash` and `passwordSalt` fields changes stored schema expectations.
- Previously published example credentials should be rotated if any were real. Replacing the current `.env.example` does not erase historical Git commits.
- Before merging, test against a **throwaway Neo4j database** and review the new query semantics. No live database test has been run.

## Author

**Abishek Paudel** — [Portfolio](https://abishekpaudel.com.np) · [LinkedIn](https://www.linkedin.com/in/abishekpaudel/)
