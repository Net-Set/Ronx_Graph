import {gql} from'@apollo/client';




export const GET_STATS_DATA = gql`
query MyQuery($walletAddress: String!) {
  newUserPlaces(
    orderBy: blockNumber
    orderDirection: desc
    where: {referrer: $walletAddress, matrix: 1}
  ) {
    blockTimestamp
    user
    matrix
    level
    place
    transactionHash
  }
}`;