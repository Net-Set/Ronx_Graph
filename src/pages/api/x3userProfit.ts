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

const x3ActiveLevelQuery = gql`
  query x3ActiveLevel($user: String!) {
    upgrades(
      where: { user: $user, matrix: 1 }
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
                where: { referrer: $referrer, matrix: 1, level: $level }
                orderBy: blockTimestamp
                orderDirection: asc
            ) {
                user
                place
            }

            sentExtraEthDividends_collection(
                where: { receiver: $referrer, matrix: 1, level: $level }
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
            query: x3ActiveLevelQuery,
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
            const newUserPlaces = data.newUserPlaces;
            const sentExtraEthDividends = data.sentExtraEthDividends_collection;

            let extraDividendsProfit = 0;
            if (sentExtraEthDividends.length > 0) {
                extraDividendsProfit = sentExtraEthDividends.length * cost;
            }

            const cycles = Math.floor(newUserPlaces.length / 3);
            let levelProfit = 0;

            if (!activeLevels.includes(level)) {
                // If level is not active, consider only the first two users from the previous level
                const prevLevel = level - 1;
                if (activeLevels.includes(prevLevel)) {
                    const previousLevelData = await fetchGraphQLData(prevLevel, referrer);
                    const prevUsers = previousLevelData.newUserPlaces.slice(0, 2);
                    levelProfit += prevUsers.length * levels[prevLevel - 1].cost * 2;
                }
            } else {
                // If level is active, calculate full cycles profit
                for (let i = 0; i < cycles; i++) {
                    levelProfit += cost * 2;
                }
                // Add extra users profit
                const extraUsers = newUserPlaces.slice(cycles * 3);
                levelProfit += extraUsers.length * cost;
            }

            // Add extraDividendsProfit to levelProfit
            levelProfit += extraDividendsProfit;
            levelProfits.push({ level, profit: levelProfit });
        }

        res.status(200).json({ levelProfits });
    } catch (error) {
        console.error('Error calculating profit:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
