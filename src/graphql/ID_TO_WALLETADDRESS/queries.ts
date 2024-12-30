import { gql } from '@apollo/client';

// ID_TO_WALLETADDRESS

export const GET_WALLET_ADDRESS = gql`
    query GET_WALLET_ADDRESS($userId: String!) {
        registrations(where: {userId: $userId}) {
            user
        }
    }
`;