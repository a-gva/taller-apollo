Code challenge

Title: Build and Test a Simple GraphQL API with Automated Test Suite

Description:
You are tasked with creating a minimal GraphQL API server and an automated test suite to validate its functionality, performance, and security aspects. This challenge focuses on your ability to design GraphQL schemas, implement resolvers, and write robust automated tests using TypeScript and Node.js.

Requirements:
GraphQL API Implementation:

Create a simple GraphQL API with the following schema:
Query type with:
getUser(id: ID!): User
listUsers(limit: Int): [User!]!
User type with fields:
id: ID!
name: String!
email: String!
age: Int

Implement resolvers with in-memory data (an array of users).

Ensure the getUser query returns the user by ID or null if not found.

The listUsers query returns a list of users, limited by the optional limit argument.

Automated Testing:

Write automated tests using a testing framework (e.g., Jest) in TypeScript.

Tests should cover:

Valid queries returning expected data.

Handling of invalid queries or missing users.

Basic performance test: measure and assert that a query resolves within 100ms.

Security test: ensure that querying a non-existent field returns an error.

Constraints:
Use TypeScript and Node.js.

Use any open-source GraphQL server library (e.g., apollo-server, graphql-yoga).

Use Jest or any other popular testing framework.

No external database is required; use in-memory data.

The entire challenge should be solvable within 30 minutes.

No cloud deployment is required for this challenge, but containerization is mandatory.

Deliverables:
GraphQL API server code (TypeScript).

Automated test suite code.
