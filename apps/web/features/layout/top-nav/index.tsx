"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
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
import { secondaryNav } from "./nav-config";
import { Logo } from "./logo";
import { PrimaryNav } from "./primary-nav";
import { NavSearch } from "./nav-search";
import { MobileNav } from "./mobile-nav";

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
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <NavSearch />

            {/* Secondary nav icons */}
            {secondaryNav.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[13px] font-medium transition-colors",
                  pathname.startsWith(item.href)
                    ? "text-accent-700 bg-accent-50"
                    : "text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50",
                )}
              >
                <item.icon className="h-3.5 w-3.5" />
                <span className="hidden lg:inline whitespace-nowrap min-w-0">
                  {item.name}
                </span>
              </Link>
            ))}

            {/* User menu */}
            <div className="ml-2 flex items-center gap-2 pl-3 border-l border-neutral-200">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="cursor-pointer rounded-full outline-none focus-visible:ring-2 focus-visible:ring-accent-500">
                    <Avatar
                      className="size-8 rounded-full bg-neutral-200"
                      name={session?.user?.name ?? ""}
                      src={session?.user?.image ?? undefined}
                    />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
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
