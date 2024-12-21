'use client';

import { useQuery } from '@apollo/client';
import { GET_REGISTRATIONS } from '@/graphql/queries/registration';

export const useRegistrations = () => {
  const { data, loading, error } = useQuery(GET_REGISTRATIONS, {
    variables: { orderBy: 'blockTimestamp', orderDirection: 'desc' },
  });

  return { data, loading, error };
};
