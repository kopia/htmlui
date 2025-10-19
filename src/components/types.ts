import { Component } from "react";

export type ChangeEventHandle = (event: React.ChangeEvent<any>, valueGetter?: (x: any) => any) => void;

export type ComponentChangeHandling = Component & {
  handleChange: ChangeEventHandle;
};
