'use client';

import React, { useState } from 'react';

interface StatsFiltersProps {
  onApplyFilters: (filters: { program: string; level: string; searchValue: string }) => void;
}

export default function StatsFilters({ onApplyFilters }: StatsFiltersProps) {
  const [program, setProgram] = useState('');
  const [level, setLevel] = useState('');
  const [searchValue, setSearchValue] = useState('');

  const handleApplyFilters = () => {
    onApplyFilters({ program, level, searchValue });
  };

  const handleResetFilters = () => {
    setProgram('');
    setLevel('');
    setSearchValue('');
    onApplyFilters({ program: '', level: '', searchValue: '' });
  };

  return (
      <div className="p-6 rounded-lg">
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3"> 
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Program</label>
              <select
                value={program}
                onChange={(e) => setProgram(e.target.value)}
                className="w-full bg-[#3A3A3A] border-0 p-2 rounded text-white"
              >
                <option value="" disabled>
                  Select program
                </option>
                <option value="">X3</option>
                <option value="2">X4</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-400">Level</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full bg-[#3A3A3A] border-0 p-2 rounded text-white"
              >
                <option value="" disabled>
                  Select level
                </option>
                <option value="1">Level 1</option>
                <option value="2">Level 2</option>
                <option value="3">Level 3</option>
                <option value="4">Level 4</option>
                <option value="5">Level 5</option>
                <option value="6">Level 6</option>
                <option value="7">Level 7</option>
                <option value="8">Level 8</option>
                <option value="9">Level 9</option>
                <option value="10">Level 10</option>
                <option value="11">Level 11</option>
                <option value="12">Level 12</option>
                <option value="13">Level 13</option>
                <option value="14">Level 14</option>
                <option value="15">Level 15</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-400">Search ID / address</label>
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Enter ID / wallet"
                className="w-full bg-[#3A3A3A] border-0 p-2 rounded text-white"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleApplyFilters}
              className="w-full bg-[#4B7BF7] hover:bg-[#4B7BF7]/90 text-white py-2 rounded"
            >
              Apply filters
            </button>
            <button
              onClick={handleResetFilters}
              className="w-full bg-[#3A3A3A] border-0 text-white hover:bg-[#3A3A3A]/90 py-2 rounded"
            >
              Reset filters
            </button>
          </div>
        </div>
      </div>
  );
}
