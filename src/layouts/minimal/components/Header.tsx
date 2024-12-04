'use client';
import { useEffect, useState } from 'react';
import Logo from '@/components/ui/logo';
import cn from 'classnames';
import { FlashIcon } from '@/components/icons/flash';
import SearchButton from '@/components/search/button';
import ActiveLink from '@/components/ui/links/active-link';
import Hamburger from '@/components/ui/hamburger';
import WalletConnect from '@/components/nft/wallet-connect';
import { MenuItems } from '@/layouts/sidebar/_layout-menu';
import { useBreakpoint } from '@/lib/hooks/use-breakpoint';
import { useDrawer } from '@/components/drawer-views/context';
import { useWindowScroll } from '@/lib/hooks/use-window-scroll';
import { useLayout } from '@/lib/hooks/use-layout';
import routes from '@/config/routes';
import { LAYOUT_OPTIONS } from '@/lib/constants';
import { Box, Button, Flex } from '@chakra-ui/react';

// Component to handle notifications
function NotificationButton() {
  const [isMounted, setIsMounted] = useState(false);
  const { layout } = useLayout();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    isMounted && (
      <ActiveLink
        href={
          '/' + (layout === LAYOUT_OPTIONS.MODERN ? '' : layout) + routes.notification
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

// Right section of the header
function HeaderRightArea() {
  const [isMounted, setIsMounted] = useState(false);
  const breakpoint = useBreakpoint();
  const { openDrawer, isOpen } = useDrawer();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="order-last flex shrink-0 items-center">
      {/* Mobile search button */}
      <div className="ltr:mr-3.5 rtl:ml-3.5 ltr:sm:mr-5 rtl:sm:ml-5 xl:hidden">
        <SearchButton
          color="white"
          className="shadow-main dark:border dark:border-solid dark:border-gray-700 dark:bg-light-dark dark:text-white"
        />
      </div>

      {/* Desktop view elements */}
      <div className="hidden gap-6 lg:flex 2xl:gap-8">
        {isMounted && ['xs', 'sm', 'md', 'lg'].indexOf(breakpoint) === -1 && (
          <SearchButton variant="transparent" className="dark:text-white" />
        )}
        <NotificationButton />
        <Flex
          direction="column"
          alignItems="center"
          justifyContent="center"
          w="full"
          maxW="200px"
          mx="auto"
        >
          <WalletConnect />
        </Flex>
      </div>

      {/* Mobile hamburger menu */}
      <div className="flex items-center lg:hidden">
        <NotificationButton />
        <Hamburger
          isOpen={isOpen}
          onClick={() => openDrawer('DRAWER_MENU')}
          color="white"
          className="shadow-main ltr:ml-3.5 rtl:mr-3.5 dark:border dark:border-solid dark:border-gray-700 dark:bg-light-dark dark:text-white ltr:sm:ml-5 rtl:sm:mr-5"
        />
      </div>
    </div>
  );
}
// Main Header component
export function Header() {
  const [isMounted, setIsMounted] = useState(false);
  const breakpoint = useBreakpoint();
  const windowScroll = useWindowScroll();
  const { openDrawer, isOpen } = useDrawer();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full z-50 bg-black text-white p-4 flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0 shadow-lg">
      {/* Left side with Logo */}
      <div className="flex justify-between items-center w-full lg:w-auto">
        <Logo />
        {/* Mobile hamburger menu */}
        <div className="flex items-center lg:hidden">
          <Hamburger
            isOpen={isOpen}
            onClick={() => openDrawer('DRAWER_MENU')}
            color="white"
            className="shadow-main ltr:ml-3.5 rtl:mr-3.5 dark:border dark:border-solid dark:border-gray-700 dark:bg-light-dark dark:text-white ltr:sm:ml-5 rtl:sm:mr-5"
          />
        </div>
      </div>
      {/* Right side with HeaderRightArea */}
      <div className="flex justify-between items-center w-full lg:w-auto">
        <HeaderRightArea />
      </div>
    </div>
  );
}