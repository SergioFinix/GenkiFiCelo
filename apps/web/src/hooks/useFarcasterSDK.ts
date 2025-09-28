"use client";

import { useEffect, useState } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';

export function useFarcasterSDK() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only initialize if not already ready
    if (isReady) return;

    const initializeSDK = async () => {
      try {
        // Check if we're in a Farcaster environment
        if (typeof window !== 'undefined' && (window as any).farcaster) {
          await sdk.actions.ready();
          console.log('Farcaster Mini App is ready');
          setIsReady(true);
        } else {
          console.log('Not in Farcaster environment, skipping SDK initialization');
          setIsReady(true);
        }
      } catch (error) {
        console.error('Error initializing Farcaster SDK:', error);
        setError(error instanceof Error ? error.message : 'Unknown error');
        setIsReady(true); // Still set ready to prevent infinite retries
      }
    };

    initializeSDK();
  }, [isReady]);

  return { isReady, error };
}