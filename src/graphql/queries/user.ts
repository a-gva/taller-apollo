import { gql } from '@apollo/client/core';

export const USERS_QUERY = gql`
  query Users {
    users {
      id
      name
      email
    }
  }
`;
