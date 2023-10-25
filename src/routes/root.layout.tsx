import * as React from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button.tsx";
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

export function RootLayout() {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <React.Fragment>
      <div className="dark:text-white w-screen h-screen overflow-hidden flex flex-col">
        <header className="flex justify-between items-center p-1">
          <div className="flex gap-x-1">
            <Button asChild>
              <Link to="/" className="px-3 py-1 rounded">
                Home
              </Link>
            </Button>

            <Button variant="outline" onClick={() => setIsOpen(true)}>
              Search
              <kbd className="ml-2 rounded bg-gray-50 text-gray-600 px-2 py-0.5">
                ⌘K
              </kbd>
            </Button>
          </div>
        </header>
        <main className="flex-grow">
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
