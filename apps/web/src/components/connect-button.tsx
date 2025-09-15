"use client";

import { ConnectButton as ThirdwebConnectButton } from "thirdweb/react";
import { client } from "@/lib/thirdweb-client";

export function ConnectButton() {
  return (
    <ThirdwebConnectButton 
      client={client}
      theme="dark"
      connectModal={{
        size: "compact",
        title: "Connect to GenkiFi",
        titleIcon: "https://genkifi.com/icon.png",
      }}
    />
  );
}