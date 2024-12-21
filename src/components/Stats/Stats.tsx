'use client';
import React, { useEffect, useState } from 'react';
import {
  useTable,
  useResizeColumns,
  useFlexLayout,
  useSortBy,
  usePagination,
  Column,
} from 'react-table';
import Button from '@/components/ui/button';
import Scrollbar from '@/components/ui/scrollbar';
import { ChevronDown } from '@/components/icons/chevron-down';
import { LongArrowRight } from '@/components/icons/long-arrow-right';
import { LongArrowLeft } from '@/components/icons/long-arrow-left';
import client from '@/lib/apolloClient';
import { GET_STATS_DATA } from '@/graphql/Get_Stats_Data/queries';
import { useWallet } from '@/app/context/WalletContext';
import { ExternalLinkIcon, CopyIcon } from '@chakra-ui/icons';
import Image from 'next/image';
import Person from '@/assets/icons/profile.png';
import Recycle from '@/assets/icons/recycle_icon.jpg';


interface TransactionData {
  type: string;
  date: string;
  id: string;
  program: string;
  level: number;
  wallet: string;
  profit: string;
}
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


const COLUMNS: Column<TransactionData>[] = [
  {
    Header: 'Type',
    accessor: 'type',
    minWidth: 100,
    maxWidth: 150,
  },
  {
    Header: 'Date',
    accessor: 'date',
    minWidth: 160,
    maxWidth: 220,
  },
  {
    Header: 'ID',
    accessor: 'id',
    minWidth: 100,
    maxWidth: 150,
  },
  {
    Header: 'Program',
    accessor: 'program',
    minWidth: 100,
    maxWidth: 150,
  },
  {
    Header: 'Level',
    accessor: 'level',
    minWidth: 60,
    maxWidth: 80,
  },
  {
    Header: 'Wallet',
    accessor: 'wallet',
    minWidth: 220,
    maxWidth: 280,
    Cell: ({ value }) => (
      <div className="flex items-center">
        <a
          href={`https://testnet.bscscan.com/address/${value}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:text-blue-700 flex items-center"
        >
            {value.slice(0, 6) + '.....' + value.slice(-8)}<ExternalLinkIcon className="ml-1" />
        </a>
        <button
          onClick={() => navigator.clipboard.writeText(value)}
          className="ml-2 text-white hover:text-blue-700"
        >
          <CopyIcon />
        </button>
      </div>
    ),
  },
  {
    Header: 'BUSD / BNB profit',
    accessor: 'profit',
    minWidth: 100,
    maxWidth: 150,
  },
];
export default function StatsComponent() {
  const walletAddress = useWallet();
  const staticAddress = walletAddress ? walletAddress.walletAddress : null;
  const userWalletAddress = staticAddress;
  const [data, setData] = useState<TransactionData[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await client.query({
          query: GET_STATS_DATA,
          variables: { walletAddress: userWalletAddress },
        });
        console.log('data', data);
        // Transform the data to match the required format
        const transformedData = data.newUserPlaces.map((item: any) => ({
          type: item.place === 3 ? (
            <Image src={Recycle} alt="Recycle" width={20} height={20} />
          ) : (
            <Image src={Person} alt="Person" width={20} height={20} />
          ),
          date: new Date(parseInt(item.blockTimestamp) * 1000).toLocaleString(),
          id: item.user.slice(0, 6) + '...' + item.user.slice(-4),
          program: item.matrix === 1 ? 'x3' : 'x4',
          level: item.level,
          wallet: item.user,
          profit: levels.find(level => level.level === item.level)?.cost || 0,
        }));
        setData(transformedData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user stats:', error);
        setLoading(false);
      }
    };
    if (userWalletAddress) {
      fetchData();
    }
  }, [userWalletAddress]);
  const columns = React.useMemo(() => COLUMNS, []);
  const {
    getTableProps,
    getTableBodyProps,
    canPreviousPage,
    canNextPage,
    pageOptions,
    state,
    headerGroups,
    page,
    nextPage,
    previousPage,
    prepareRow,
  } = useTable(
    {
      columns,
      data,
      initialState: { pageSize: 5 },
    },
    useSortBy,
    useResizeColumns,
    useFlexLayout,
    usePagination
  );
  const { pageIndex } = state;
  return (
    <div className="">
      <div className="rounded-tl-lg rounded-tr-lg bg-white px-4 pt-6 dark:bg-light-dark md:px-8 md:pt-8">
        <div className="flex flex-col items-center justify-between border-b border-dashed border-gray-200 pb-5 dark:border-gray-700 md:flex-row">
          <h2 className="mb-3 shrink-0 text-lg font-medium uppercase text-black dark:text-green sm:text-xl md:mb-0 md:text-2xl bg-grey-500 text-white p-2 rounded-lg shadow-lg">
     Stats
          </h2>
        </div>
      </div>
      <div className="-mx-0.5 dark:[&_.os-scrollbar_.os-scrollbar-track_.os-scrollbar-handle:before]:!bg-white/50">
        <Scrollbar style={{ width: '100%' }} autoHide="never">
          <div className="px-0.5">
            <table
              {...getTableProps()}
              className="transaction-table w-full border-separate border-0"
            >
              <thead className="text-sm text-gray-500 dark:text-gray-300">
                {headerGroups.map((headerGroup, idx) => (
                  <tr {...headerGroup.getHeaderGroupProps()} key={idx}>
                    {headerGroup.headers.map((column, idx) => (
                      <th
                        {...column.getHeaderProps(column.getSortByToggleProps())}
                        key={idx}
                        className="group  bg-white px-2 py-5 font-normal first:rounded-bl-lg last:rounded-br-lg ltr:first:pl-8 ltr:last:pr-8 rtl:first:pr-8 rtl:last:pl-8 dark:bg-light-dark md:px-4"
                      >
                        <div className="flex items-center">
                          {column.render('Header')}
                          {column.canResize && (
                            <div
                              {...column.getResizerProps()}
                              className={`resizer ${column.isResizing ? 'isResizing' : ''}`}
                            />
                          )}
                          <span className="ltr:ml-1 rtl:mr-1">
                            {column.isSorted ? (
                              column.isSortedDesc ? (
                                <ChevronDown />
                              ) : (
                                <ChevronDown className="rotate-180" />
                              )
                            ) : (
                              <ChevronDown className="rotate-180 opacity-0 transition group-hover:opacity-50" />
                            )}
                          </span>
                        </div>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody
                {...getTableBodyProps()}
                className="text-xs font-medium text-gray-900 dark:text-white 3xl:text-sm"
              >
                {page.map((row, idx) => {
                  prepareRow(row);
                  return (
                    <tr
                      {...row.getRowProps()}
                      key={idx}
                      className="mb-3 items-center rounded-lg bg-white uppercase shadow-card last:mb-0 dark:bg-light-dark"
                    >
                      {row.cells.map((cell, idx) => {
                        return (
                          <td
                            {...cell.getCellProps()}
                            key={idx}
                            className="px-2 py-4 tracking-[1px] ltr:first:pl-4 ltr:last:pr-4 rtl:first:pr-8 rtl:last:pl-8 md:px-4 md:py-6 md:ltr:first:pl-8 md:ltr:last:pr-8 3xl:py-5"
                          >
                            {cell.render('Cell')}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Scrollbar>
      </div>
      <div className="mt-3 flex items-center justify-center rounded-lg bg-white px-5 py-4 text-sm shadow-card dark:bg-light-dark lg:py-6">
        <div className="flex items-center gap-5">
          <Button
            onClick={() => previousPage()}
            disabled={!canPreviousPage}
            title="Previous"
            shape="circle"
            variant="transparent"
            size="small"
            className="text-gray-700 disabled:text-gray-400 dark:text-white disabled:dark:text-gray-400"
          >
            <LongArrowLeft className="h-auto w-4 rtl:rotate-180" />
          </Button>
          <div>
            Page{' '}
            <strong className="font-semibold">
              {pageIndex + 1} of {pageOptions.length}
            </strong>{' '}
          </div>
          <Button
            onClick={() => nextPage()}
            disabled={!canNextPage}
            title="Next"
            shape="circle"
            variant="transparent"
            size="small"
            className="text-gray-700 disabled:text-gray-400 dark:text-white disabled:dark:text-gray-400"
          >
            <LongArrowRight className="h-auto w-4 rtl:rotate-180 " />
          </Button>
        </div>
      </div>
    </div>
  );
}