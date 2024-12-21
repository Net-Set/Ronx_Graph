import { gql } from '@apollo/client';

// Grixdx3Level_Partner_and_Cycle_Count
export const getUserPlacesQuery = gql`
    query GetUserPlaces($walletAddress: String!) {
            upgrades(
      where: { user: $walletAddress, matrix: 2 }
      orderBy: user
      orderDirection: desc
    ) {
      level
    }   
    

    }
`;
