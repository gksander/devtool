import * as React from "react";

type ContainerProps = {};

export function PageContainer({
  children,
}: React.PropsWithChildren<ContainerProps>) {
  return (
    <div className="container py-8 h-full overflow-hidden">{children}</div>
  );
}
