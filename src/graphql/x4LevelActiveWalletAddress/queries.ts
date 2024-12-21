import { gql } from '@apollo/client';

export const x4ActiveLevel = gql`
  query x4ActiveLevel($user: String!) {
    upgrades(
      where: { matrix: 2, user: $user }
      orderBy: user
      orderDirection: desc
    ) {
      level
    }
  }
`;