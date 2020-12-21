declare const _default: {
    chkSignal: (signalName: string, signals: any, opt: any) => any;
    COMPARS: {
        WrapStyle: string;
        ftc: string;
        srs: number;
    };
    setSyncParams: (hash: any) => void;
    getFormBody: (par: any) => string;
    getJson: (queue: any) => Promise<{
        url: any;
        queue: any;
        load: boolean;
        res: any;
    } | {
        url: any;
        queue: any;
        load: boolean;
        error: any;
    }>;
};
export default _default;
