"use client";
import { useEffect } from "react";
import { wagerAbi, wagerAddress } from "@/constants";
import { toast } from "sonner";
import { parseEther } from "viem";
import { EvmPriceServiceConnection } from "@pythnetwork/pyth-evm-js";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  useWaitForTransactionReceipt,
  useWriteContract,
  useReadContract,
} from "wagmi";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import BetCard from "@/components/BetCard";

interface BetInfo {
  id: bigint;
  title: string;
  threshold: bigint;
  totalPoolForExceed: bigint;
  totalPoolForNotExceed: bigint;
  epochEnded: boolean;
}

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  threshold: z.string().min(1, "Threshold is required"),
});

export default function Home() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: "", threshold: "" },
  });

  const {
    data: hash,
    error,
    isPending,
    writeContractAsync,
  } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isPending) toast.loading("Transaction Pending");
    if (isConfirmed)
      toast.success("Transaction Successful", {
        action: {
          label: "View on Etherscan",
          onClick: () =>
            window.open(`https://explorer-holesky.morphl2.io/tx/${hash}`),
        },
      });
    if (error) toast.error("Transaction Failed");
  }, [isConfirming, isConfirmed, error, hash]);

  const { data: allBets } = useReadContract({
    abi: wagerAbi,
    address: wagerAddress,
    functionName: "getAllBets",
  }) as { data: BetInfo[] | undefined };

  const handleTransaction = async (action: () => Promise<void>) => {
    try {
      await action();
    } catch (err: any) {
      toast.error("Transaction Failed: " + err.message);
      console.error(err);
    }
  };

  const createBet = (data: z.infer<typeof formSchema>) =>
    handleTransaction(async () => {
      await writeContractAsync({
        address: wagerAddress,
        abi: wagerAbi,
        functionName: "createBet",
        args: [data.title, data.threshold],
      });
    });

  const placeBet = (betId: number, betForExceed: boolean, betAmount: string) =>
    handleTransaction(async () => {
      await writeContractAsync({
        address: wagerAddress,
        abi: wagerAbi,
        functionName: "placeBet",
        args: [betId, betForExceed],
        value: parseEther(betAmount),
      });
    });

  const endEpoch = (betId: number) =>
    handleTransaction(async () => {
      const connection = new EvmPriceServiceConnection(
        "https://hermes.pyth.network"
      );
      const priceFeedUpdateData = await connection.getPriceFeedsUpdateData([
        "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace",
      ]);
      await writeContractAsync({
        address: wagerAddress,
        abi: wagerAbi,
        functionName: "endEpoch",
        args: [betId, priceFeedUpdateData as any],
        value: parseEther("0.01"),
      });
    });

  return (
    <div className="min-h-screen  text-white p-8">
      <h1 className="text-4xl font-extrabold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-blue-500">
        ETH Betting DApp
      </h1>

      <div className="max-w-3xl mx-auto bg-white/10 backdrop-blur-lg rounded-xl shadow-2xl p-8 mb-12">
        <h2 className="text-2xl font-semibold mb-6">Create a New Bet</h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(createBet)} className="space-y-6">
            {[
              { name: "title", label: "Title" },
              { name: "threshold", label: "Threshold" },
            ].map(({ name, label }) => (
              <FormField
                key={name}
                control={form.control}
                name={name as "title" | "threshold"}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">{label}</FormLabel>
                    <FormControl>
                      <Input
                        className="bg-white/5 border-white/10 text-white rounded-lg"
                        placeholder={`Enter ${label.toLowerCase()}...`}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
            <Button
              className="w-full bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white font-bold py-3 rounded-lg transition duration-300"
              size="lg"
              disabled={isConfirming}
              type="submit"
            >
              {isConfirming ? "Creating wager..." : "Create Wager"}
            </Button>
          </form>
        </Form>
      </div>

      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6">All Bets</h2>
        {allBets ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allBets.map((bet) => (
              <BetCard
                bet={bet}
                key={bet.id.toString()}
                onPlaceBet={placeBet}
                onEndEpoch={endEpoch}
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-400">Loading bets...</p>
        )}
      </div>
    </div>
  );
}
