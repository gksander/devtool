import { Input, InputProps } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { clsx } from "clsx";

type LabeledInputProps = InputProps & {
  containerClassName?: string;
  label: string;
};

export function LabeledInput({
  containerClassName,
  label,
  name,
  ...rest
}: LabeledInputProps) {
  return (
    <div className={clsx("flex flex-col gap-y-2", containerClassName)}>
      <Label htmlFor={name}>{label}</Label>
      <Input name={name} {...rest} />
    </div>
  );
}
