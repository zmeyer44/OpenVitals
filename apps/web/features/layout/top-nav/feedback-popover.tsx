"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc/client";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const RATINGS = [
  { value: "TERRIBLE", emoji: "😡" },
  { value: "BAD", emoji: "😕" },
  { value: "OKAY", emoji: "😐" },
  { value: "GOOD", emoji: "😊" },
  { value: "AMAZING", emoji: "🤩" },
] as const;

type Rating = (typeof RATINGS)[number]["value"];

export function FeedbackPopover() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState<Rating | null>(null);

  const createFeedback = trpc.feedback.create.useMutation({
    onSuccess: () => {
      toast.success("Thanks for your feedback!");
      setMessage("");
      setRating(null);
      setOpen(false);
    },
    onError: () => {
      toast.error("Failed to send feedback. Please try again.");
    },
  });

  const handleSubmit = () => {
    if (!message.trim()) return;
    createFeedback.mutate({
      message: message.trim(),
      rating,
      page: pathname,
    });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "hidden md:flex items-center gap-1.5 px-2.5 py-1.5 text-[13px] font-medium transition-colors",
            "text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50"
          )}
        >
          <MessageSquare className="h-3.5 w-3.5" />
          <span className="hidden lg:inline whitespace-nowrap min-w-0">
            Feedback
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80">
        <div className="space-y-3">
          <p className="text-sm font-medium">Send us feedback</p>

          <div className="flex justify-between">
            {RATINGS.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setRating(rating === r.value ? null : r.value)}
                className={cn(
                  "text-2xl p-1.5 transition-colors",
                  rating === r.value
                    ? "bg-accent-100 ring-1 ring-accent-300"
                    : "hover:bg-neutral-100"
                )}
              >
                {r.emoji}
              </button>
            ))}
          </div>

          <Textarea
            placeholder="What's on your mind?"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            className="resize-none"
          />

          <Button
            onClick={handleSubmit}
            disabled={!message.trim() || createFeedback.isPending}
            className="w-full"
            size="sm"
          >
            {createFeedback.isPending ? "Sending..." : "Send feedback"}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
