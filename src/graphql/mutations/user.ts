import { gql } from '@apollo/client/core';

export const USER_CREATE_MUTATION = gql`
  mutation UserCreate($input: UserModifyInput!) {
    userCreate(input: $input) {
      id
      email
      name
    }
  }
`;

export const USER_PATCH_MUTATION = gql`
  mutation UserPatch($userPatchId: String!, $input: UserModifyInput!) {
    userPatch(id: $userPatchId, input: $input) {
      name
      id
      email
    }
  }
`;

export const USER_DELETE_MUTATION = gql`
  mutation UserDelete($userDeleteId: String!) {
    userDelete(id: $userDeleteId)
  }
`;
