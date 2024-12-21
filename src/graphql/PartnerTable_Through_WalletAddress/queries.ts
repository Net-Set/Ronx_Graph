import { gql } from '@apollo/client';

export const GET_PARTNER_TABLE = gql`
query GetPartnerTable($walletAddress: String!) {
  registrations(
    where: {referrer: $walletAddress}
    orderBy: blockTimestamp
    orderDirection: desc
  ) {
    user
    userId
    blockTimestamp
    transactionHash
  }
  
 
}
`;

export const x3_Partner_level_active = gql`
query Getx3_Partner_level_active($walletAddress: String!) {
  upgrades(
      where: { user: $walletAddress, matrix: 1 }
      orderBy: user 
      orderDirection: desc
    ) {
      level
    }
}
`;


export const x4_Partner_level_active = gql`
query Getx4_Partner_level_active($walletAddress: String!) {
   upgrades(
      where: { user: $walletAddress, matrix: 2 }
      orderBy: user
      orderDirection: desc
    ) {
      level
    }
}
`;