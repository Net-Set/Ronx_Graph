import { NextApiRequest, NextApiResponse } from 'next';
import { gql } from '@apollo/client';
import client from '@/lib/apolloClient';

const levels = [
    { level: 1, cost: 0.0001 },
    { level: 2, cost: 0.0002 },
    { level: 3, cost: 0.0004 },
    { level: 4, cost: 0.0008 },
    { level: 5, cost: 0.0016 },
    { level: 6, cost: 0.0032 },
    { level: 7, cost: 0.0064 },
    { level: 8, cost: 0.0128 },
    { level: 9, cost: 0.0256 },
    { level: 10, cost: 0.0512 },
    { level: 11, cost: 0.1024 },
    { level: 12, cost: 0.2048 },
];

export const x4ActiveLevel = gql`
  query x4ActiveLevel($user: String!) {
 
  }
`;

const fetchGraphQLData = async (level: number, referrer: string) => {
    const query = gql`
        query($level: Int!, $referrer: String!) {
            newUserPlaces(
                where: { referrer: $referrer, matrix: 2, level: $level }
                orderBy: blockTimestamp
                orderDirection: asc
            ) {
                user
                place
            }

            sentExtraEthDividends_collection(
                where: { receiver: $referrer, matrix: 2, level: $level }
            ) {
                from
                receiver
                level
                matrix
            }
                   upgrades(
      where: { user: $referrer, matrix: 2 }
      orderBy: user
      orderDirection: desc
    ) {
      level
    }
        }
    `;

    const { data } = await client.query({
        query,
        variables: { level, referrer },
    });
    return data;
};

export default async (req: NextApiRequest, res: NextApiResponse) => {
    const { level, referrer } = req.query;

    if (!level) {
        return res.status(400).json({ error: 'Level is required' });
    }

    if (!referrer) {
        return res.status(400).json({ error: 'Referrer is required' });
    }

    const levelNumber = parseInt(level as string, 10);
    if (isNaN(levelNumber) || levelNumber < 1 || levelNumber > 12) {
        return res.status(400).json({ error: 'Invalid level' });
    }

    try {
        const data = await fetchGraphQLData(levelNumber, referrer as string);

        const newUserPlaces = data.newUserPlaces || [];
        const sentExtraEthDividends = data.sentExtraEthDividends_collection || [];

        // Calculate extra dividends profit
        const extraDividendsProfit = sentExtraEthDividends.length * levels[levelNumber - 1].cost;

        // Calculate completed cycles
        const cycles = Math.floor(newUserPlaces.length / 6);
        let levelProfit = cycles * (levels[levelNumber - 1].cost * 3);

        // Calculate running cycle users in places 3, 4, and 5
        interface NewUserPlace {
            user: string;
            place: number;
        }

        interface SentExtraEthDividend {
            from: string;
            receiver: string;
            level: number;
            matrix: number;
        }

        const runningCycleUsers = newUserPlaces.slice(cycles * 6).filter((place: NewUserPlace, index: number, self: NewUserPlace[]) => {
            return (place.place === 3 || place.place === 4 || place.place === 5) &&
            self.findIndex(p => p.user === place.user && (p.place === 3 || p.place === 4 || p.place === 5)) === index;
        }).slice(0, 3);

        // Add running cycle users to profit
        levelProfit += runningCycleUsers.length * levels[levelNumber - 1].cost;

        // Add extra dividends profit
        levelProfit += extraDividendsProfit;

        res.status(200).json({ levelProfit });
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
