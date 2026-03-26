"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Cable, LogOut, Settings } from "lucide-react";
import { authClient } from "@/lib/auth/client";
import { Avatar } from "@/components/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Logo } from "./logo";
import { PrimaryNav } from "./primary-nav";
import { MoreDropdown } from "./more-dropdown";
import { NavSearch } from "./nav-search";
import { MobileNav } from "./mobile-nav";
import { FeedbackPopover } from "./feedback-popover";
import { CornerEdge } from "@/components/decorations/corner-cross";

export function TopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = authClient.useSession();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-neutral-200">
      <div className="max-w-[1400px] h-(--top-nav-height) mx-auto px-4">
        <div className="flex h-full items-center justify-between gap-4">
          {/* Logo + Navigation */}
          <div className="flex items-center gap-6 md:ml-2">
            <Logo />
            <PrimaryNav pathname={pathname} />
            <MoreDropdown pathname={pathname} />
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <NavSearch />
            <FeedbackPopover />

            {/* User menu */}
            <div className="ml-2 flex items-center gap-2 pl-3 border-l border-neutral-200">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="relative size-8 bg-neutral-200 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-accent-500 border-0">
                    <Avatar
                      hideOutline={true}
                      className="size-8 bg-transparent text-accent-500 rounded-none border-0"
                      name={session?.user?.name ?? ""}
                      src={session?.user?.image ?? undefined}
                    />
                    <CornerEdge />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 card">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {session?.user?.name ?? "User"}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {session?.user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/settings">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/integrations">
                      <Cable className="mr-2 h-4 w-4" />
                      Integrations
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={async () => {
                      await authClient.signOut();
                      router.push("/login");
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile navigation */}
      <MobileNav pathname={pathname} pendingCount={0} />
    </header>
  );
}
