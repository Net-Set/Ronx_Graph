import { gql } from '@apollo/client';

export const GET_WALLET_ADDRESS_TO_ID = gql`
  query GetWalletAddressToId($wallet: String!) {
   
  registrations(where: {user: $wallet}) {
    userId
  }

  }
`;