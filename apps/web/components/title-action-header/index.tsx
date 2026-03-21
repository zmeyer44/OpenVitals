"use client";

import { IconButton, Button } from "../button";
import { Button as ButtonWithChildren } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import { cn } from "../../lib/utils";
import { ArrowLeftIcon, PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ComponentProps, ReactNode } from "react";

type ButtonProps = ComponentProps<typeof Button>;

type TitleActionHeaderProps = {
  title?: string;
  titleClassName?: string;
  subtitle?: string;
  subtitleClassName?: string;
  beforeTitle?: ReactNode;
  underTitle?: ReactNode;
  under?: ReactNode;
  actions?: ReactNode;
  actionButtons?: ButtonProps[];
  showBackButton?: boolean;
  scrollableRow?: (props: unknown) => ReactNode;
  onAddButtonClick?: () => void;
  addButtonText?: string;
  onSearchButtonClick?: () => void;
  sticky?: boolean;
  className?: string;
};
export function TitleActionHeader({
  title,
  titleClassName,
  subtitle,
  subtitleClassName,
  beforeTitle,
  underTitle,
  under,
  actions,
  showBackButton = false,
  scrollableRow: ScrollableRow,
  actionButtons,
  onAddButtonClick,
  addButtonText,
  onSearchButtonClick,
  sticky,
  className,
}: TitleActionHeaderProps) {
  const router = useRouter();
  return (
    <div
      className={cn(
        "@container/title-action-header flex flex-col gap-2",
        sticky && "sticky top-0 z-10 bg-background pb-4 -mb-4 pt-4 -mt-4",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-x-4 gap-y-2 flex-wrap">
        <div className="flex items-start gap-2">
          {showBackButton && (
            <div className="flex flex-col self-stretch justify-start shrink-0">
              <IconButton
                variant="ghost"
                size="xs"
                className="shrink-0"
                onClick={() => router.back()}
                icon={<ArrowLeftIcon className="h-4 w-4" />}
              />
            </div>
          )}
          {!!beforeTitle && beforeTitle}
          <div className="flex flex-col gap-2 shrink">
            <div className="">
              {title === undefined ? (
                <Skeleton className="h-5.5 w-36 bg-muted" />
              ) : (
                <h1
                  className={cn(
                    "title font-bold text-neutral-900 text-2xl @6xl/title-action-header:text-3xl",
                    "font-display",
                    titleClassName,
                  )}
                >
                  {title}
                </h1>
              )}

              {!!subtitle && (
                <p
                  className={cn(
                    "mt-1 text-neutral-500 text-base line-clamp-2",
                    subtitleClassName,
                  )}
                >
                  {subtitle}
                </p>
              )}
              {!!underTitle && underTitle}
            </div>
          </div>
        </div>
        <div className="flex shrink-0 gap-2 flex-wrap">
          {actions ? (
            actions
          ) : actionButtons ? (
            <>
              {actionButtons.map((button, index) => (
                <Button key={index} {...button} />
              ))}
            </>
          ) : (
            <>
              {!!onSearchButtonClick && (
                <ButtonWithChildren
                  onClick={onSearchButtonClick}
                  variant="outline"
                  className={cn(
                    "relative h-9 w-full justify-start bg-muted/50 font-normal text-neutral-500 text-sm sm:pr-12 md:w-40 lg:w-56 xl:w-64",
                  )}
                >
                  <span className="hidden lg:inline-flex">
                    Search your items...
                  </span>
                  <span className="inline-flex lg:hidden">Search...</span>
                  <kbd className="pointer-events-none absolute top-[0.3rem] right-[0.3rem] hidden h-5 select-none items-center gap-1 border bg-muted px-1.5 font-medium font-mono text-[10px] opacity-100 sm:flex">
                    <span className="text-xs">⌘</span>K
                  </kbd>
                </ButtonWithChildren>
              )}
              {!!onAddButtonClick &&
                (onSearchButtonClick ? (
                  <IconButton
                    size="sm"
                    icon={<PlusIcon className="h-4 w-4" />}
                    onClick={onAddButtonClick}
                    tooltip={addButtonText}
                  />
                ) : (
                  <Button
                    text={addButtonText ?? "Add"}
                    icon={<PlusIcon className="h-4 w-4" />}
                    onClick={onAddButtonClick}
                  />
                ))}
            </>
          )}
        </div>
      </div>
      {!!ScrollableRow && (
        <div className="flex items-center gap-2">
          <div className="scrollbar-none -mx-4 flex flex-nowrap items-center gap-2 overflow-x-auto px-4">
            <ScrollableRow />
          </div>
        </div>
      )}
      {!!under && under}
    </div>
  );
}
