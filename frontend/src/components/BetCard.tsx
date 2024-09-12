"use client";
import { useState } from "react";
import { z } from "zod";
import { formatEther } from "viem";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

interface BetCardProps {
  bet: {
    id: bigint;
    title: string;
    threshold: bigint;
    totalPoolForExceed: bigint;
    totalPoolForNotExceed: bigint;
    epochEnded: boolean;
  };
  onPlaceBet: (betId: number, betForExceed: boolean, amount: string) => void;
  onEndEpoch: (betId: number) => void;
}

const formSchema = z.object({
  amount: z.string().min(1, "Amount is required"),
  betForExceed: z.boolean(),
});

const BetCard = ({ bet, onPlaceBet, onEndEpoch }: BetCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: "",
      betForExceed: false,
    },
  });

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      await onPlaceBet(Number(bet.id), data.betForExceed, data.amount);
      toast.success("Bet placed successfully!");
      form.reset();
      setIsExpanded(false);
    } catch (err: any) {
      toast.error("Failed to place bet: " + err.message);
    }
  };

  return (
    <Card className="w-full bg-gradient-to-br from-gray-800 to-gray-900 text-white shadow-xl hover:shadow-2xl transition-all duration-300">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">{bet.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-2">Threshold: {formatEther(bet.threshold)} ETH</p>
        <p className="mb-2">
          Total Pool (Exceed): {formatEther(bet.totalPoolForExceed)} ETH
        </p>
        <p className="mb-2">
          Total Pool (Not Exceed): {formatEther(bet.totalPoolForNotExceed)} ETH
        </p>
        <p className="mb-4">Status: {bet.epochEnded ? "Ended" : "Active"}</p>

        {!bet.epochEnded && (
          <Button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full bg-blue-500 hover:bg-blue-600 transition-colors duration-300"
          >
            {isExpanded ? "Cancel" : "Place Bet"}
          </Button>
        )}

        {isExpanded && (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4 mt-4"
            >
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount (ETH)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="0.1"
                        {...field}
                        className="bg-gray-700 text-white border-gray-600"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="betForExceed"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Bet will exceed</FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full bg-green-500 hover:bg-green-600 transition-colors duration-300"
              >
                Confirm Bet
              </Button>
            </form>
          </Form>
        )}
      </CardContent>
      <CardFooter>
        {!bet.epochEnded && (
          <Button
            onClick={() => onEndEpoch(Number(bet.id))}
            className="w-full bg-red-500 hover:bg-red-600 transition-colors duration-300"
          >
            End Epoch
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default BetCard;
