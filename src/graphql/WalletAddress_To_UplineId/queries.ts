import { gql } from '@apollo/client';

export const GET_WALLET_ADDRESS_TO_UPLINE_ID = gql`
    query GET_WALLET_ADDRESS_TO_UPLINE_ID($walletAddress: String!) {
        registrations(where: {user: $walletAddress}) {
            referrer
            referrerId
        }
    }
`;