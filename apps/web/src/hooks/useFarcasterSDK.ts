"use client";

import { useEffect } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';

export function useFarcasterSDK() {
  useEffect(() => {
    // Call ready() when the app is fully loaded
    const initializeSDK = async () => {
      try {
        await sdk.actions.ready();
        console.log('Farcaster Mini App is ready');
      } catch (error) {
        console.error('Error initializing Farcaster SDK:', error);
      }
    };

    initializeSDK();
  }, []);
}