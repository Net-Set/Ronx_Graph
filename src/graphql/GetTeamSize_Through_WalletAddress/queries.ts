import { gql } from '@apollo/client';


export const GET_DIRECT_REFERRALS = gql`
  query GetDirectReferrals($referrer: String!) {
    registrations(where: { referrer: $referrer }) {
      user
    }
  }
`;


