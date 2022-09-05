import { SetStateAction } from "react";

export interface FormField {
    name: string,
    value: string;
    setValue: React.Dispatch<SetStateAction<string | undefined>>,
    isRequired: boolean;
    isValid: boolean;
    render: (props: any) => JSX.Element;
}
