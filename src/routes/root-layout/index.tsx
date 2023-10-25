import * as React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command.tsx";
import { TOOLS } from "@/tools.ts";
import { ReactSetState } from "@/types.ts";
import { RootLayoutHeader } from "@/routes/root-layout/header.tsx";

export function RootLayout() {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <React.Fragment>
      <div className="dark:text-white w-screen h-screen overflow-hidden flex flex-col">
        <RootLayoutHeader setIsOpen={setIsOpen} />
        <main className="flex-1 overflow-hidden">
          <Outlet />
        </main>
      </div>
      <SearchModal isOpen={isOpen} setIsOpen={setIsOpen} />
    </React.Fragment>
  );
}

function SearchModal({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: ReactSetState<boolean>;
}) {
  const navigate = useNavigate();

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((v) => !v);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <React.Fragment>
      {isOpen ? (
        <CommandDialog open={isOpen} onOpenChange={setIsOpen}>
          <CommandInput placeholder="Type a command or search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Tools">
              {Object.values(TOOLS).map((tool) => (
                <CommandItem
                  key={tool.name}
                  onSelect={() => {
                    navigate(`/tools/${tool.path}`);
                    setIsOpen(false);
                  }}
                >
                  {tool.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </CommandDialog>
      ) : null}
    </React.Fragment>
  );
}
