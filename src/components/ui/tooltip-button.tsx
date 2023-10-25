import { Button, ButtonProps } from "@/components/ui/button.tsx";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip.tsx";

export interface TooltipButtonProps extends ButtonProps {
  tooltip: string;
}

export function TooltipButton({ tooltip, ...props }: TooltipButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button {...props} />
      </TooltipTrigger>
      <TooltipContent>
        <p className="text-sm">{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );
}
