"use client";

import Link from "next/link";
import * as React from "react";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

export const NavMenu = ({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenu>) => {
  const { orientation } = props;
  const triggerStyle = cn(navigationMenuTriggerStyle(), {
    "text-xl": orientation === "vertical",
  });

  return (
    <NavigationMenu viewport={false} {...props}>
      <NavigationMenuList
        className={cn({
          "flex-col items-start gap-4": orientation === "vertical",
        })}
      >
        <NavigationMenuItem>
          <NavigationMenuLink asChild className={triggerStyle}>
            <Link href="/home">Products</Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
};
