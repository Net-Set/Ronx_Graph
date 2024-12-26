// src/pages/api/overTakex3.ts
import { NextApiRequest, NextApiResponse } from "next";

const url = "https://api.studio.thegraph.com/query/98082/test1/version/latest";
const apiKey = "c06debab9d6ac949da928b1a4cefe090";

async function fetchGraphQL(query: string, variables: Record<string, any> = {}) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
  return response.json();
}

const GET_REGISTRATIONS_AND_MY_LEVELS = `
  query RegistrationsAndMyLevels($referrer: String!) {
    registrations(
      orderBy: blockTimestamp
      orderDirection: asc
      where: { referrer: $referrer }
    ) {
      user
      userId
    }
    mylevels: upgrades(
      where: { user: $referrer }
      orderBy: blockTimestamp
      orderDirection: asc
    ) {
      level
      matrix
    }
  }
`;

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

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { referrer } = req.query;

  if (!referrer || typeof referrer !== "string") {
    return res.status(400).json({ error: "Missing or invalid referrer address" });
  }

  try {
    const regAndLevelsData = await fetchGraphQL(GET_REGISTRATIONS_AND_MY_LEVELS, { referrer });
    if (regAndLevelsData.errors) {
      return res.status(500).json({ error: regAndLevelsData.errors });
    }

    const registrations = regAndLevelsData.data.registrations || [];
    const myLevels = regAndLevelsData.data.mylevels || [];

    const downlineUsers = registrations.map((reg: { user: string }) => reg.user);
    if (downlineUsers.length === 0) {
      return res.status(200).json({ message: "No downline users found." });
    }

    const downlineUpgradesData = await fetchGraphQL(GET_DOWNLINE_UPGRADES, { downlineUsers });
    if (downlineUpgradesData.errors) {
      return res.status(500).json({ error: downlineUpgradesData.errors });
    }

    const downlineUpgrades = downlineUpgradesData.data.upgrades || [];

    const myActiveLevels: Record<string, Set<number>> = {};
    myLevels.forEach(({ level, matrix }: { level: number; matrix: string }) => {
      if (!myActiveLevels[matrix]) {
        myActiveLevels[matrix] = new Set();
      }
      myActiveLevels[matrix].add(level);
    });

    const overtakingUsers: { user: string; matrix: string; level: number }[] = [];
    downlineUpgrades.forEach(({ user, level, matrix }: { user: string; level: number; matrix: string }) => {
      if (
        (!myActiveLevels[matrix] || !myActiveLevels[matrix].has(level)) &&
        !overtakingUsers.find((u) => u.user === user && u.matrix === matrix && u.level === level)
      ) {
        overtakingUsers.push({ user, matrix, level });
      }
    });

    if (overtakingUsers.length > 0) {
      const result = overtakingUsers.map(({ user, matrix, level }) => {
        return `User ${user} overtook in Matrix ${matrix}, Level ${level}`;
      });
      return res.status(200).json({ message: result });
    } else {
      return res.status(200).json({ message: "No users have overtaken." });
    }
  } catch (error) {
    console.error(`Error fetching overtaking data for ${referrer}:`, error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export default handler;
