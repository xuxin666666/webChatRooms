

declare module 'fs' {
    export interface StreamOptions{}
}


declare namespace Express {
    interface Request {}
    interface Response {
        sendAvatar: (avatar: string) => void
        sendImage: (image: string) => void
        sendNoImage: () => void
    }
    interface Application {}
}


interface Console {
    logger: (...data: any[]) => void;
}


interface Date {
    format: (format: string) => string;
}

interface Error {
    data: {
        [key: string]: any
    }
}


declare var __rootpath: string;
