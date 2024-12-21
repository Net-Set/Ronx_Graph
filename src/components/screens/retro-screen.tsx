"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useWallet } from "@/app/context/WalletContext";
import TransactionTable from "@/components/transaction/transaction-table";
import Program from "@/components/program/program";
import Dashboard from "@/components/dashboard/dashboard";
import PriceFeedSlider from "@/components/ui/live-price-feed";
import { priceFeedData } from "@/data/static/price-feed-retro";
import Image from "@/components/ui/image";
import ActivitySection from '@/components/landingpage/components/ActivitySection';
import { authorData } from "@/data/static/author";
import ComparisonChart from "@/components/ui/chats/retro-comparision-chart";

import Profile from "@/components/profile/profile";
import Avatar from "@/components/ui/avatar";

export default function RetroScreen() {
 

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="relative h-36 w-full overflow-hidden rounded-lg sm:h-44 md:h-64 xl:h-80 2xl:h-96 3xl:h-[448px]">
        <Image
          src={authorData?.cover_image?.thumbnail}
          placeholder="blur"
          quality={100}
          className="!h-full w-full !object-cover"
          alt="Cover Image"
        />
      </div>
      <div className="mx-auto flex w-full shrink-0 flex-col md:px-4 xl:px-6 3xl:max-w-[1700px] 3xl:px-12">
       
        <Profile />
      </div>
      <Dashboard />
      <Program />
      <ActivitySection />
    </Suspense>
  );
}
