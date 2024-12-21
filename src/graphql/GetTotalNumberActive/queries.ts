import { gql } from '@apollo/client';

export const GET_ACTIVE_USER = gql`
{
  registrations(orderBy: blockTimestamp, orderDirection: desc) {
    blockTimestamp
    user
    userId
  }

}
`;