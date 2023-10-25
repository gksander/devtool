import { Button } from "@/components/ui/button.tsx";
import { ReactSetState } from "@/types";
import { Link } from "react-router-dom";
import { Github, Home, Settings2 } from "lucide-react";
import { TooltipButton } from "@/components/ui/tooltip-button.tsx";

type RootLayoutHeaderProps = {
  setIsOpen: ReactSetState<boolean>;
};

export function RootLayoutHeader({ setIsOpen }: RootLayoutHeaderProps) {
  return (
    <header className="flex justify-between items-center p-2 border-b">
      <div className="flex gap-x-1">
        <TooltipButton tooltip="Home" asChild>
          <Link to="/" className="block">
            <Home className="w-4 h-4" />
          </Link>
        </TooltipButton>
      </div>
      <div className="flex gap-x-1">
        <Button onClick={() => setIsOpen(true)}>
          Search
          <kbd className="ml-2 rounded bg-gray-50 text-gray-600 px-2 py-0.5">
            ⌘K
          </kbd>
        </Button>
        <TooltipButton tooltip="Settings" asChild>
          <Link to="/settings">
            <Settings2 className="w-4 h-4" />
          </Link>
        </TooltipButton>
        <TooltipButton tooltip="Project repo page" asChild>
          <a href="https://github.com" target="_blank" rel="noreferrer">
            <Github className="w-4 h-4" />
          </a>
        </TooltipButton>
      </div>
    </header>
  );
}
