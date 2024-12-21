import { gql } from '@apollo/client';

export const GET_REGISTRATIONS = gql`
  query GetRegistrations($orderBy: String!, $orderDirection: String!) {
    registrations(orderBy: $orderBy, orderDirection: $orderDirection) {
      blockTimestamp
      user
      userId
    }
  }
`;
