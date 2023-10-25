import * as React from "react";
import { clsx } from "clsx";
type SectionTitleProps = React.HTMLAttributes<HTMLHeadingElement>;

export function SectionTitle({
  className,
  ...rest
}: React.PropsWithChildren<SectionTitleProps>) {
  return (
    <h2
      className={clsx("font-bold text-lg text-gray-700", className)}
      {...rest}
    ></h2>
  );
}
