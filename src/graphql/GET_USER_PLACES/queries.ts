const GET_USER_PLACES = `
query GetUserPlaces($referrer: String!, $matrix: Int!, $level: Int!) {
  newUserPlaces(
    where: { referrer: $referrer, matrix: $matrix, level: $level }
    orderBy: blockTimestamp
    orderDirection: asc
  ) {
    user
    place
    referrer
  }
}
`;

export default GET_USER_PLACES;