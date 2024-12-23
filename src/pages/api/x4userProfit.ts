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

const x4ActiveLevelQuery = gql`
  query x4ActiveLevel($user: String!) {
    upgrades(
      where: { user: $user, matrix: 2 }
      orderBy: user
      orderDirection: desc
    ) {
      level
    }
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
        }
    `;

    const { data } = await client.query({
        query,
        variables: { level, referrer },
    });
    return data;
};

const isLevelActive = async (user: string, level: number): Promise<boolean> => {
    try {
        const { data } = await client.query({
            query: x4ActiveLevelQuery,
            variables: { user },
        });
        return data.upgrades.some((upgrade: { level: number }) => upgrade.level === level);
    } catch (error) {
        console.error(`Error checking level ${level}:`, error);
        return false;
    }
};

export default async (req: NextApiRequest, res: NextApiResponse) => {
    const { referrer } = req.query;
    const user = referrer as string;

    if (!user || typeof user !== 'string') {
        return res.status(400).json({ error: 'User is required' });
    }

    if (!referrer || typeof referrer !== 'string') {
        return res.status(400).json({ error: 'Referrer is required' });
    }

    try {
        const activeLevels: number[] = [1]; // Level 1 is default active

        // Check active levels
        for (const { level } of levels.slice(1)) {
            const isActive = await isLevelActive(user, level);
            if (isActive) activeLevels.push(level);
        }

        const levelProfits: { level: number, profit: number }[] = [];

        for (const { level, cost } of levels) {
            const data = await fetchGraphQLData(level, referrer);
            const newUserPlaces = data.newUserPlaces || [];
            const sentExtraEthDividends = data.sentExtraEthDividends_collection || [];

            // Calculate extra dividends profit
            const extraDividendsProfit = sentExtraEthDividends.length * cost;

            // Calculate completed cycles
            const cycles = Math.floor(newUserPlaces.length / 6);
            let levelProfit = cycles * (cost * 3);

            // Calculate running cycle users in places 3, 4, and 5
            const runningCycleUsers = newUserPlaces.slice(cycles * 6).filter((place: { user: string; place: number }) => {
                return place.place === 3 || place.place === 4 || place.place === 5;
            });

            // Add running cycle users to profit
            levelProfit += runningCycleUsers.length * cost;

            // Add extra dividends profit
            levelProfit += extraDividendsProfit;

            levelProfits.push({ level, profit: levelProfit });
        }

        res.status(200).json({ levelProfits });
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
