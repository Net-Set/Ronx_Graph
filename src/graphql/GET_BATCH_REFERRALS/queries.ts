
const GET_BATCH_REFERRALS = `
    query GetBatchReferrals($referrers: [String!]!) {
        registrations(
            where: { referrer_in: $referrers }
            orderBy: user
        ) {
            referrer
            user
        }
    }
`;

export default GET_BATCH_REFERRALS;