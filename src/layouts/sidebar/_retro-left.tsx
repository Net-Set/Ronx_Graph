'use client';

import { useEffect, useState } from 'react';
import cn from 'classnames';
import AuthorCard from '@/components/ui/author-card';
import Logo from '@/components/ui/logo';
import { MenuItem } from '@/components/ui/collapsible-menu';

import Button from '@/components/ui/button';
import { useDrawer } from '@/components/drawer-views/context';
import { Close } from '@/components/icons/close';
import { defaultMenuItems } from '@/layouts/sidebar/_menu-items';
//images

import { LAYOUT_OPTIONS } from '@/lib/constants';
import { useWallet } from '@/app/context/WalletContext';
import { useAuthor } from '@/app/context/AuthorContext';

interface User {  
  profilePic: string;
  username: string;
  userId: string;
}

export default function Sidebar({ className }: { className?: string }) {
  const { user, loading, error, refetchUser } = useAuthor();

  const { closeDrawer } = useDrawer();
  const walletAddress  = useWallet();
  const address = useWallet();

  // Access the `address` field within the object, or handle undefined
  const staticAddress = walletAddress ? walletAddress.walletAddress : '';

    const layoutOption = '';
  const [username, setusername] = useState<string | null>(null);

  const [profileImage, setProfileImage] = useState<string | null>(null);  
  const [userids, setuserids] = useState<string | null>(null);

  useEffect(() => {
    if(user!==null){
      setProfileImage(user.profilePic);
      setusername(user.username);
      setuserids(user.userId);
    } 
  }, [user]);

  const retroMenu = defaultMenuItems.map((item) => ({
    name: item.name,
    icon: item.icon,
    href: '/' + LAYOUT_OPTIONS.RETRO + (item.href === '/' ? '' : item.href),
    ...(item.dropdownItems && {
      dropdownItems: item?.dropdownItems?.map((dropdownItem: any) => ({
        name: dropdownItem.name,
        ...(dropdownItem?.icon && { icon: dropdownItem.icon }),
        href:
          item.name === 'Authentication'
            ? layoutOption + dropdownItem.href
            : '/' + LAYOUT_OPTIONS.RETRO + dropdownItem.href,
      })),
    }),
  }));

  return (
    <aside
      className={cn(
        'top-0 z-40 h-full w-full max-w-full border-dashed border-gray-200 bg-body ltr:left-0 ltr:border-r rtl:right-0 rtl:border-l dark:border-gray-700 dark:bg-dark xs:w-80 xl:fixed  xl:w-72 2xl:w-80',
        className,
      )}
    >
      <div className="relative flex h-24 items-center justify-between overflow-hidden px-6 py-4 2xl:px-8">
        <Logo />
        <div className="md:hidden">
          <Button
            title="Close"
            color="white"
            shape="circle"
            variant="transparent"
            size="small"
            onClick={closeDrawer}
          >
            <Close className="h-auto w-2.5" />
          </Button>
        </div>
      </div>

      <div className="custom-scrollbar h-[calc(100%-98px)] overflow-hidden overflow-y-auto">
        <div className="px-6 pb-5 2xl:px-8">
          <AuthorCard
            image={profileImage || "/public/uploads/default_pic.jpg" }
            name={username || "Demo User"}
            role={userids || "User ID"}
          />

          <div className="mt-12">
            {retroMenu.map((item, index) => (
              <MenuItem
          key={`retro-left-${index}`}
          name={item.name}
          href={item.href}
          icon={item.icon}
          dropdownItems={item.dropdownItems}
              />
            ))}
          </div>
         
        </div>
      </div>
    </aside>
  );
}
