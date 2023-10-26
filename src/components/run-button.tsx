import { Button, ButtonProps } from "@/components/ui/button.tsx";
import { Play } from "lucide-react";

type RunButtonProps = Omit<ButtonProps, "children"> & {
  title?: string;
};

export function RunButton({ title = "Run", ...props }: RunButtonProps) {
  return (
    <Button variant="default" {...props}>
      {title} <Play className="w-4 h-4 ml-2" />
    </Button>
  );
}
