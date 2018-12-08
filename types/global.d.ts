

interface Window {
    // Allow us to put arbitrary objects in window
    [key: string]: any;
}

declare function artModule(): string;

declare module '*art' {
    export default artModule
}
declare module '*.svg' {
    export default string
}
