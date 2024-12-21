import { gql } from '@apollo/client';

export const GET_TOTAL_PARTNER = gql`
    query GetTotalPartner($referrer: String!) {
        registrations(where: { referrer: $referrer }) {
            userId
        }
    }
`;