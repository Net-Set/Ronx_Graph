'use client';

import Logo from '@/components/ui/logo';
import cn from 'classnames';
import { FlashIcon } from '@/components/icons/flash';
import SearchButton from '@/components/search/button';
import ActiveLink from '@/components/ui/links/active-link';
import Hamburger from '@/components/ui/hamburger';
import WalletConnect from '@/components/nft/wallet-connect';
import { MenuItems } from '@/layouts/sidebar/_layout-menu';
import { useIsMounted } from '@/lib/hooks/use-is-mounted';
import { useBreakpoint } from '@/lib/hooks/use-breakpoint';
import { useDrawer } from '@/components/drawer-views/context';
import { useWindowScroll } from '@/lib/hooks/use-window-scroll';
import { useLayout } from '@/lib/hooks/use-layout';
import routes from '@/config/routes';
import { LAYOUT_OPTIONS } from '@/lib/constants';
import full_banner from '@/assets/images/full-banner.png'
import { Box, Button, Flex, Link, Text, useDisclosure } from '@chakra-ui/react';
import {Header} from '@/layouts/minimal/components/Header'; 



function NotificationButton() {
  const isMounted = useIsMounted();
  const { layout } = useLayout();
  return (
    isMounted && (
      <ActiveLink
        href={
          '/' +
          (layout === LAYOUT_OPTIONS.MODERN ? '' : layout) +
          routes.notification
        }
      >
        <div className="relative flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-gray-100 bg-white text-brand shadow-main transition-all hover:-translate-y-0.5 hover:shadow-large focus:-translate-y-0.5 focus:shadow-large focus:outline-none dark:border-gray-700 dark:bg-light-dark dark:text-white sm:h-12 sm:w-12">
          <FlashIcon className="h-auto w-3 sm:w-auto" />
          <span className="absolute right-0 top-0 h-2.5 w-2.5 rounded-full bg-brand shadow-light dark:bg-white sm:h-3 sm:w-3" />
        </div>
      </ActiveLink>
    )
  );
}


export default function MinimalLayout({
  children,
}: React.PropsWithChildren<{}>) {
  return (
    <>
      <div className="bg-light-100 dark:bg-dark-100 mt-8 flex min-h-screen flex-col gap-6 px-4 sm:px-6 lg:px-8 3xl:px-10"  style={{
             backgroundImage: `url(${full_banner.src})`,
             backgroundSize: 'cover',
             backgroundPosition: 'center',
            
             backgroundRepeat: 'no-repeat',
          
            }}>
        <main className="mx-auto mb-9 flex w-full max-w-[2160px] flex-grow flex-col @container">
          {children}
        </main>
      </div>
    </>
  );
}