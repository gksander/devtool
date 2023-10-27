import * as React from "react";
import { clsx } from "clsx";

type TitleProps = React.HTMLAttributes<HTMLHeadingElement>;

export function Title({ className, ...rest }: TitleProps) {
  return <h1 className={clsx("text-3xl font-bold", className)} {...rest} />;
}
