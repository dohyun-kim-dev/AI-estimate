export declare const Validators: {
    id: (value: string) => boolean;
    password: (value: string) => boolean;
    match: (value: string, compare: string) => boolean;
    email: (value: string) => boolean;
    phone: (value: string) => boolean;
    required: (value: string) => boolean;
};
