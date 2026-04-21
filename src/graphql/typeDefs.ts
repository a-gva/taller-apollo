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
  
  type Comment {
    id: String!
    content: String!
    userId: String!
  }

  input CommentInput {
    content: String!
    userId: String!
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
    comments(options: ListOptions): [Comment!]!
    comment(id: String!): Comment
  }

  type Mutation {
    userCreate(input: UserModifyInput!): User!
    userDelete(id: String!): Boolean!
    userPatch(id: String!, input: UserModifyInput!): User!
    commentCreate(input: CommentInput!): Comment!
    commentDelete(id: String!): Boolean!
    commentPatch(id: String!, input: CommentInput!): Comment!
  }

  type Subscription {
    userCreated: User!
    userDeleted: String!
    userPatched: User!
  }
`;
