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
            upgrades(
                where: { user: $referrer, matrix: 1 }
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

const isActiveLevel = (level: number, upgrades: { level: number }[]): boolean => {
    return upgrades.some((upgrade) => upgrade.level === level);
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
        const upgrades = data.upgrades || [];

        let totalProfit = 0;
        let extraUsersCount = 0;

        // Always count level 1 as active
        if (levelNumber === 1) {
            const cycles = Math.floor(newUserPlaces.length / 3);
            totalProfit += cycles * levels[levelNumber - 1].cost * 2;
            extraUsersCount = newUserPlaces.length % 3;
        } else {
            const prevLevelActive = isActiveLevel(levelNumber - 1, upgrades);
            const currentLevelActive = isActiveLevel(levelNumber, upgrades);

            if (currentLevelActive) {
                const cycles = Math.floor(newUserPlaces.length / 3);
                totalProfit += cycles * levels[levelNumber - 1].cost * 2;
                extraUsersCount = newUserPlaces.length % 3;
            } else if (prevLevelActive) {
                const usersToCount = Math.min(newUserPlaces.length, 2);
                totalProfit += usersToCount * levels[levelNumber - 2].cost;
                extraUsersCount = newUserPlaces.length - usersToCount;
            }
        }

        // Calculate profit from extra ETH dividends
        let extraDividendsProfit = 0;
        if (sentExtraEthDividends.length > 0) {
            extraDividendsProfit = sentExtraEthDividends.length * levels[levelNumber - 1].cost;
        }

        totalProfit += extraDividendsProfit;

        res.status(200).json({ levelProfit: totalProfit, extraUsers: extraUsersCount });
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
