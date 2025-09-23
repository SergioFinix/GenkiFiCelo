"use client";

import React, { useState } from "react";
import { useActiveAccount } from "thirdweb/react";
import { readContract, getContract } from "thirdweb";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { CONTRACT_ADDRESSES, GENKIFI_CORE_ABI, CONTRACT_STATUS } from "@/lib/thirdweb/contracts";
import { defaultChain, client } from "@/lib/thirdweb/client";

export function ContractTest() {
  const account = useActiveAccount();
  const [testResults, setTestResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const testContractCalls = async () => {
    setIsLoading(true);
    setTestResults(null);

    try {
      console.log("=== CONTRACT TEST START ===");
      
      // Create contract instance
      const contract = getContract({
        client,
        chain: defaultChain,
        address: CONTRACT_ADDRESSES.GENKIFI_CORE,
        abi: GENKIFI_CORE_ABI,
      });

      console.log("Contract instance:", contract);
      console.log("Contract address:", CONTRACT_ADDRESSES.GENKIFI_CORE);
      console.log("Chain:", defaultChain.name, "(ID:", defaultChain.id, ")");

      const results: any = {};

      // Test 1: Get total circles
      try {
        console.log("Testing getTotalCircles...");
        const totalCircles = await readContract({
          contract,
          method: "getTotalCircles",
          params: []
        });
        results.totalCircles = totalCircles;
        console.log("✅ Total circles:", totalCircles);
      } catch (error) {
        results.totalCirclesError = error;
        console.error("❌ Total circles error:", error);
      }

      // Test 2: Get total users
      try {
        console.log("Testing getTotalUsers...");
        const totalUsers = await readContract({
          contract,
          method: "getTotalUsers",
          params: []
        });
        results.totalUsers = totalUsers;
        console.log("✅ Total users:", totalUsers);
      } catch (error) {
        results.totalUsersError = error;
        console.error("❌ Total users error:", error);
      }

      // Test 3: Get contract balance
      try {
        console.log("Testing getContractBalance...");
        const contractBalance = await readContract({
          contract,
          method: "getContractBalance",
          params: []
        });
        results.contractBalance = contractBalance;
        console.log("✅ Contract balance:", contractBalance);
      } catch (error) {
        results.contractBalanceError = error;
        console.error("❌ Contract balance error:", error);
      }

      // Test 4: Try to get circle info for circle 1 (if it exists)
      try {
        console.log("Testing getCircleInfo for circle 1...");
        const circleInfo = await readContract({
          contract,
          method: "getCircleInfo",
          params: [BigInt(1)]
        });
        results.circle1Info = circleInfo;
        console.log("✅ Circle 1 info:", circleInfo);
      } catch (error) {
        results.circle1Error = error;
        console.error("❌ Circle 1 error:", error);
      }

      // Test 5: Try to get user circles (if account is connected)
      if (account?.address) {
        try {
          console.log("Testing getUserCircles for:", account.address);
          const userCircles = await readContract({
            contract,
            method: "getUserCircles",
            params: [account.address]
          });
          results.userCircles = userCircles;
          console.log("✅ User circles:", userCircles);
        } catch (error) {
          results.userCirclesError = error;
          console.error("❌ User circles error:", error);
        }
      }

      setTestResults(results);
      console.log("=== CONTRACT TEST COMPLETE ===");

    } catch (error) {
      console.error("Contract test failed:", error);
      setTestResults({ error: error });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card variant="glass" className="p-6">
      <CardHeader>
        <CardTitle className="text-white">Contract Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-white/60 text-sm">
          <p><strong>Contract Status:</strong> {CONTRACT_STATUS.GENKIFI_CORE_DEPLOYED ? "✅ Deployed" : "❌ Not Deployed"}</p>
          <p><strong>Contract Address:</strong> {CONTRACT_ADDRESSES.GENKIFI_CORE}</p>
          <p><strong>Chain:</strong> {defaultChain.name} (ID: {defaultChain.id})</p>
          <p><strong>Account:</strong> {account?.address || "Not connected"}</p>
        </div>

        <Button 
          onClick={testContractCalls} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? "Testing..." : "Test Contract Calls"}
        </Button>

        {testResults && (
          <div className="space-y-2">
            <h4 className="text-white font-semibold">Test Results:</h4>
            <pre className="text-xs text-white/80 bg-black/20 p-3 rounded overflow-auto max-h-64">
              {JSON.stringify(testResults, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
