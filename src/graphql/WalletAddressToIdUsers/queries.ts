import { gql } from '@apollo/client';

// WalletAddressToIdUsers
export const GET_USER_ID = gql`
  query GET_USER_ID($user: String!) {
    registrations(where: { user: $user }) {
      userId
    }
  }
`;