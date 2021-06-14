import React, { FC, useEffect } from 'react';
import { useDb } from '~hooks';

const useAA_Test = () => {
  const db = useDb();

  useEffect(() => {
    const aa_test = async () => {
      const results = [];

      results.push(
        await db.query(
          `
        SELECT 1
        `
        )
      );

      console.log('-------------------------------------------');
      console.log('results');
      console.log(JSON.stringify(results, null, 2));
      console.log('-------------------------------------------');
    };

    aa_test();
  }, [db]);
};

export const DevContainer: FC = ({ children }) => {
  useAA_Test();

  return <>{children}</>;
};
