export interface FormField {
    name: string,
    value: string;
    isRequired: boolean;
    isValid: boolean;
    render: (props: any) => JSX.Element;
}
