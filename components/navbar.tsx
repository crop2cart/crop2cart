import { MenuIcon, XIcon } from "lucide-react";
import { Logo } from "./logo";
import { NavMenu } from "./nav-menu";
import { LanguageToggle } from "./language-toggle";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

export function Navbar() {
  return (
    <div className="px-6 max-w-(--breakpoint-xl) mx-auto">
      <nav className="h-20 flex items-center justify-between w-full">
        <Logo />

        {/* Desktop navigation menu */}
        <div className="hidden md:flex items-center gap-4">
          <NavMenu />
          <LanguageToggle />
        </div>

        {/* Mobile navigation menu */}
        <Popover modal>
          <PopoverTrigger className="group md:hidden">
            <MenuIcon className="group-data-[state=open]:hidden" />
            <XIcon className="hidden group-data-[state=open]:block" />
          </PopoverTrigger>
          <PopoverContent
            sideOffset={28}
            className="bg-background h-[calc(100svh-3rem)] w-screen !animate-none rounded-none border-none flex flex-col"
          >
            <NavMenu orientation="vertical" />
            <div className="mt-4 border-t pt-4">
              <LanguageToggle />
            </div>
          </PopoverContent>
        </Popover>
      </nav>
    </div>
  );
}
