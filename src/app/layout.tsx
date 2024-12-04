import { Suspense } from 'react';
import { Fira_Code } from 'next/font/google';
import cn from 'classnames';
// Import context and providers
import { QueryClientProvider } from '@/app/shared/query-client-provider';
import { ThemeProvider } from '@/app/shared/theme-provider';
import WagmiConfig from '@/app/shared/wagmi-config';
import { WalletProvider } from '@/app/context/WalletContext';
import { SmartContractProvider } from '@/components/SmartContract/SmartContractProvider';
import { WriteSmartContractProvider } from '@/components/SmartContract/WriteSmartContractProvider';
// Import UI components
import ModalsContainer from '@/components/modal-views/container';
import DrawersContainer from '@/components/drawer-views/container';
import SettingsButton from '@/components/settings/settings-button';
import SettingsDrawer from '@/components/settings/settings-drawer';
// Import base CSS files
import 'overlayscrollbars/overlayscrollbars.css';
import 'swiper/css';
import 'swiper/css/pagination';
import '@/assets/css/scrollbar.css';
import '@/assets/css/globals.css';
import '@/assets/css/range-slider.css';
// Import fetch polyfill
require('isomorphic-fetch');
// Apply Fira_Code font
const fira_code = Fira_Code({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
});
// Define metadata for the page
export const metadata = {
  title: 'Ronx',
  description: 'Ronx - React Next Web3 NFT Crypto Dashboard Template',
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" className={cn('dark', fira_code.className)}>
      <head>
        {/* Prevent iOS auto zooming on input focus */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1"
        />
      </head>
      <body>
        <QueryClientProvider>
          <ThemeProvider>
            <WagmiConfig>
              {/* WalletProvider wraps SmartContractProvider to make them available globally */}
              <WalletProvider>
                <WriteSmartContractProvider>
                <SmartContractProvider>
                  {/* Settings and UI components */}
                  <SettingsButton />
                  <SettingsDrawer />
                  {/* Suspense to load modals and drawers asynchronously */}
                  <Suspense fallback={null}>
                    <ModalsContainer />
                    <DrawersContainer />
                  </Suspense>
                  {/* Main content */}
                  {children}
                </SmartContractProvider>
                </WriteSmartContractProvider>
              </WalletProvider>
            </WagmiConfig>
          </ThemeProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}







