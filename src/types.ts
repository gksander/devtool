import * as React from "react";

export type ReactSetState<T> = React.Dispatch<React.SetStateAction<T>>;
export type ValueOf<T> = T[keyof T];
