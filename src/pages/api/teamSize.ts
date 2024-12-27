import { NextPage } from 'next';
import { useState } from 'react';
import GET_BATCH_REFERRALS from '@/graphql/GET_BATCH_REFERRALS/queries';
const url = process.env.GRAPHQL_API_URL || '';
const apiKey = process.env.GRAPHQL_API_KEY || '';



class RateLimiter {
  private queue: (() => Promise<any>)[] = [];
  private requestsPerSecond: number;
  private lastRequestTime: number = 0;

  constructor(requestsPerSecond = 10) {
    this.requestsPerSecond = requestsPerSecond;
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    const minDelay = 1000 / this.requestsPerSecond;

    if (timeSinceLastRequest < minDelay) {
      await new Promise((resolve) => setTimeout(resolve, minDelay - timeSinceLastRequest));
    }

    this.lastRequestTime = Date.now();
    return fn();
  }
}

class SimpleTeamCalculator {
  private rateLimiter = new RateLimiter(10);
  private processedAddresses = new Set<string>();
  private startTime: number = Date.now();
  private totalProcessed = 0;

  private async fetchGraphQLWithRetry(referrers: string[], retries = 3): Promise<any> {
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        return await this.rateLimiter.execute(async () => {
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': apiKey,
            },
            body: JSON.stringify({
              query: GET_BATCH_REFERRALS,
              variables: { referrers },
            }),
          });

          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }

          return response.json();
        });
      } catch (error) {
        if (attempt === retries - 1) throw error;
        await new Promise((resolve) => setTimeout(resolve, 2000 * Math.pow(2, attempt)));
      }
    }
  }

  private async fetchReferralsForBatch(referrers: string[]): Promise<Map<string, string[]>> {
    try {
      const response = await this.fetchGraphQLWithRetry(referrers);
      const registrations = response.data.registrations;
      const results = new Map<string, Set<string>>();

      for (const reg of registrations) {
        if (!results.has(reg.referrer)) {
          results.set(reg.referrer, new Set());
        }
        results.get(reg.referrer)?.add(reg.user);
      }

      const finalResults = new Map<string, string[]>();
      results.forEach((referrals, referrer) => {
        finalResults.set(referrer, Array.from(referrals));
      });

      return finalResults;
    } catch (error) {
      console.error('Error fetching batch:', error);
      return new Map();
    }
  }

  private logProgress() {
    const elapsed = (Date.now() - this.startTime) / 1000;
    const rate = this.totalProcessed / elapsed;
    console.log(`Processed ${this.totalProcessed.toLocaleString()} members | ${elapsed.toFixed(1)}s | Rate: ${rate.toFixed(1)} members/s`);
  }

  async calculateTeamSize(rootAddress: string): Promise<string[]> {
    const teamMembers = new Set<string>();
    const toProcess = [rootAddress];
    const BATCH_SIZE = 25;

    while (toProcess.length > 0) {
      const currentBatch = toProcess.splice(0, BATCH_SIZE);
      const newAddresses = currentBatch.filter((addr) => !this.processedAddresses.has(addr));

      if (newAddresses.length === 0) continue;

      console.log(`\nProcessing new batch of ${newAddresses.length} addresses...`);
      const batchResults = await this.fetchReferralsForBatch(newAddresses);

      for (const [referrer, referrals] of batchResults) {
        this.processedAddresses.add(referrer);
        for (const referral of referrals) {
          if (!teamMembers.has(referral)) {
            teamMembers.add(referral);
            toProcess.push(referral);
            this.totalProcessed++;

            if (this.totalProcessed % 1000 === 0) {
              this.logProgress();
            }
          }
        }
      }
    }

    return Array.from(teamMembers);
  }
}


export default SimpleTeamCalculator;
