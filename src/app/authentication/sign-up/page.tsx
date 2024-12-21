'use client'
import React from 'react';
import Logo from '@/components/ui/logo';
import Image from '@/components/ui/image';
import SignUpForm from '@/components/auth/sign-up-form';
import AnchorLink from '@/components/ui/links/anchor-link';
import BitcoinImg from '@/assets/images/Login Section Image.jpg';
import { RetroHeader2 } from '@/layouts/header/header';

import routes from '@/config/routes';

const SignUp: React.FC = () => {

  return (
    <>
      <RetroHeader2 />
      <div className="flex flex-col lg:flex-row min-h-screen bg-[#0F172A] text-white">
        {/* Left section for registration form */}
        <div className="flex flex-col items-center justify-center w-full lg:w-3/5 p-8">
          <div className="w-full max-w-md">
            {/* Logo */}
            <div className="flex justify-center lg:justify-start mb-8">
              <Logo className="w-24" />
            </div>

            {/* Heading */}
            <div className="text-center lg:text-left mb-6">
              <h2 className="text-2xl font-semibold uppercase">Registration in Ronx BUSD</h2>

            </div>

            <SignUpForm />

            {/* Already have an account */}
            <div className="mt-4 text-center lg:text-left">
              <p className="text-sm text-gray-400">
                Already have an account?
                <AnchorLink href={routes.minimal} className="ml-2 font-medium underline text-blue-500">
                  Login
                </AnchorLink>
              </p>
            </div>


          </div>
        </div>

        {/* Right section for image */}
        <div className="hidden lg:flex items-center justify-center w-full lg:w-2/5 bg-gray-900 relative">
          <Image src={BitcoinImg} alt="Sign Up" fill className="object-cover" />
        </div>
      </div>
    </>
  );
};


export default SignUp;
