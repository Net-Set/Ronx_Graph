const GET_DOWNLINE_UPGRADES = `
  query DownlineUpgrades($downlineUsers: [String!]) {
    upgrades(
      where: { user_in: $downlineUsers }
      orderBy: blockTimestamp
      orderDirection: asc
    ) {
      level
      matrix
      user
    }
  }
`;

export default GET_DOWNLINE_UPGRADES;