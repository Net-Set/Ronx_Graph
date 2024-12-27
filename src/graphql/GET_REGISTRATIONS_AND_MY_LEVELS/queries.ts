const GET_REGISTRATIONS_AND_MY_LEVELS = `
  query RegistrationsAndMyLevels($referrer: String!) {
    registrations(
      orderBy: blockTimestamp
      orderDirection: asc
      where: { referrer: $referrer }
    ) {
      user
      userId
    }
    mylevels: upgrades(
      where: { user: $referrer }
      orderBy: blockTimestamp
      orderDirection: asc
    ) {
      level
      matrix
    }
  }
`;
export default GET_REGISTRATIONS_AND_MY_LEVELS;
