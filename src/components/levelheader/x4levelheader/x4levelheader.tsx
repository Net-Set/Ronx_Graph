// components/LevelHeader.tsx
import React from 'react';

interface LevelHeaderProps {
  userid: string;
  level: number;
  uplineId: string;
}

const LevelHeader: React.FC<LevelHeaderProps> = ({userid, level, uplineId }) => {
  return (
    <div className="flex flex-col ">
      <div className="text-white text-sm mb-2">
        ID {userid}/ Ronx x4 / <span className="text-gray-400">level {level}</span>
      </div>
      <div className="text-white text-4xl font-bold mb-4">
        level {level}
      </div>
      <div className="flex items-center justify-center w-4/6 m-auto bg-gray-800 text-white p-4 rounded-lg">
        <span className="mr-2">Upline</span>
        <a href={`/upline/${uplineId}`} className="bg-gray-700 text-white p-2 rounded-full hover:bg-gray-600 transition-colors">
          ID {uplineId}
        </a>
      </div>
    </div>
  );
};

export default LevelHeader;