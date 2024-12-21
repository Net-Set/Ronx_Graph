import { gql } from '@apollo/client';

export const x3ActiveLevel = gql`
  query x3ActiveLevel($user: String!) {
    upgrades(
      where: { user: $user, matrix: 1 }
      orderBy: user
      orderDirection: desc
    ) {
      level
    }
  }
`;