export const typeDefs = `#graphql
  type User {
    id: String!
    name: String!
    email: String!
    age: Int
    comments(limit: Int): [Comment!]!
  }

  input UserModifyInput {
    id: String
    name: String!
    email: String!
    age: Int
  }
  
  enum SortOrder {
    ASC
    DESC
  }

  input ListOptions {
    limit: Int
    offset: Int
    sortOrder: SortOrder = DESC
  }

  type Query {
    listUsers(options: ListOptions): [User!]!
    getUser(id: String!): User
  }

  type Mutation {
    userCreate(input: UserModifyInput!): User!
    userDelete(id: String!): Boolean!
    userPatch(id: String!, input: UserModifyInput!): User!
  }
`;
