import React, { useState } from 'react';

const API_URL = "https://api.studio.thegraph.com/query/98082/test1/version/latest";
const API_KEY = "57a0da610aba88df199b239c85d04a46";

interface UserPlace {
  user: string;
  place: number;
  referrer: string;
}

interface Cycle {
  user: string;
  spot: number;
  place: number;
}

const CyclesCalculator: React.FC = () => {
  const [referrer, setReferrer] = useState("0xD733B8fDcFaFf240c602203D574c05De12ae358C");
  const [matrix, setMatrix] = useState(1);
  const [level, setLevel] = useState(1);
  const [cycles, setCycles] = useState<Cycle[][]>([]);
  const [currentCycleIndex, setCurrentCycleIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const fetchGraphQL = async (query: string, variables: Record<string, any>) => {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
      },
      body: JSON.stringify({ query, variables }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
  };

  const GET_USER_PLACES = `
    query GetUserPlaces($referrer: String!, $matrix: Int!, $level: Int!) {
      newUserPlaces(
        where: { referrer: $referrer, matrix: $matrix, level: $level }
        orderBy: blockTimestamp
        orderDirection: asc
      ) {
        user
        place
        referrer
      }
    }
  `;

  const calculateCycles = async () => {
    try {
      setError(null);
      const data = await fetchGraphQL(GET_USER_PLACES, { referrer, matrix, level });
      const userPlaces: UserPlace[] = data.data.newUserPlaces;
      const cycleSize = matrix === 1 ? 3 : 6;
      const calculatedCycles: Cycle[][] = [];
      const currentCycle: Cycle[] = [];
      const spotTracker = new Set<number>();

      userPlaces.forEach((entry) => {
        let actualSpot = entry.place;
        while (spotTracker.has(actualSpot)) {
          actualSpot++;
          if (actualSpot > cycleSize) actualSpot = 1;
        }
        currentCycle.push({ user: entry.user, spot: actualSpot, place: entry.place });
        spotTracker.add(actualSpot);

        if (currentCycle.length === cycleSize) {
          calculatedCycles.push([...currentCycle]);
          currentCycle.length = 0;
          spotTracker.clear();
        }
      });

      if (currentCycle.length > 0) {
        calculatedCycles.push([...currentCycle]);
      }

      setCycles(calculatedCycles);
      setCurrentCycleIndex(0);
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleCycleChange = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentCycleIndex > 0) {
      setCurrentCycleIndex(currentCycleIndex - 1);
    } else if (direction === 'next' && currentCycleIndex < cycles.length - 1) {
      setCurrentCycleIndex(currentCycleIndex + 1);
    }
  };

  return (
    <div>
      <h2>Cycles Calculator</h2>
      <div>
        <label>
          Referrer Address:
          <input
            type="text"
            value={referrer}
            onChange={(e) => setReferrer(e.target.value)}
          />
        </label>
        <label>
          Matrix:
          <input
            type="number"
            value={matrix}
            onChange={(e) => setMatrix(Number(e.target.value))}
          />
        </label>
        <label>
          Level:
          <input
            type="number"
            value={level}
            onChange={(e) => setLevel(Number(e.target.value))}
          />
        </label>
      </div>
      <button onClick={calculateCycles}>Calculate Cycles</button>
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      {cycles.length > 0 && (
        <div>
          <h3>Cycle {currentCycleIndex + 1} of {cycles.length}</h3>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => handleCycleChange('prev')}
              className={`p-2 rounded-full transition-all duration-200 ease-in-out ${currentCycleIndex === 0 ? 'bg-gray-600 cursor-not-allowed' : 'bg-gray-700 hover:bg-gray-600'}`}
              disabled={currentCycleIndex === 0}
            >
              ←
            </button>
            {Array.from({ length: matrix === 1 ? 3 : 6 }).map((_, i) => {
              const entry = cycles[currentCycleIndex].find(e => e.spot === i + 1);
              return (
              <div key={i} className="flex flex-col items-center">
                <div className={`relative w-24 h-24 rounded-full ${entry ? 'bg-blue-600' : 'bg-gray-400'}`}>
                <span className="absolute inset-0 flex justify-center items-center text-sm text-white">
                  {entry ? entry.user.slice(-4) : 'N/A'}
                </span>
                </div>
              </div>
              );
            })}
            <button
              onClick={() => handleCycleChange('next')}
              className={`p-2 rounded-full transition-all duration-200 ease-in-out ${currentCycleIndex === cycles.length - 1 ? 'bg-gray-600 cursor-not-allowed' : 'bg-gray-700 hover:bg-gray-600'}`}
              disabled={currentCycleIndex === cycles.length - 1}
            >
              →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CyclesCalculator;
