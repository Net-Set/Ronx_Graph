import { gql } from '@apollo/client';


// TransactionTableDatax3 fetch useing walletAddress matrix and level 
export const GETLEVELTRANSACTION= ( referrer: string , matrix: number,level: number) => gql`
 {
  newUserPlaces(
    where: {referrer: "${referrer}", matrix: ${matrix}, level: ${level}} 
    orderBy: blockTimestamp
    orderDirection: desc
  ) {
    user
    matrix
    level
    place
    transactionHash
    blockTimestamp
  }
}
`;