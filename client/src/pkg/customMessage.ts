import { message } from 'antd'


message.config({
    maxCount: 5,
    rtl: false
})


interface CusTomMessage {
    success: {
        (content: string | number): void;
        (content: string | number, duration: number): void;
        (content: string | number, key: string): void;
        (content: string | number, duration: number, key: string): void;
    };
    info: {
        (content: string | number): void;
        (content: string | number, duration: number): void;
        (content: string | number, key: string): void;
        (content: string | number, duration: number, key: string): void;
    };
    warn: {
        (content: string | number): void;
        (content: string | number, duration: number): void;
        (content: string | number, key: string): void;
        (content: string | number, duration: number, key: string): void;
    };
    error: {
        (content: string | number): void;
        (content: string | number, duration: number): void;
        (content: string | number, key: string): void;
        (content: string | number, duration: number, key: string): void;
    };
}

const customMessage: CusTomMessage = {
    success(content: string | number, duration?: any, key?: any) {
        if (typeof duration === "string" && (typeof key === 'undefined')) {
            key = duration
            duration = null
        }
        message.open({
            type: 'success',
            className: 'msgSuccess',
            content: content,
            duration: duration || 2,
            key: key
        })
    },
    info(content: string | number, duration?: any, key?: any) {
        if (typeof duration === "string" && (typeof key === 'undefined')) {
            key = duration
            duration = null
        }
        message.open({
            type: 'info',
            className: 'msgSuccess',
            content: content,
            duration: duration || 2,
            key: key
        })
    },
    warn(content: string | number, duration?: any, key?: any) {
        if (typeof duration === "string" && (typeof key === 'undefined')) {
            key = duration
            duration = null
        }
        message.open({
            type: 'warning',
            className: 'msgSuccess',
            content: content,
            duration: duration || 2,
            key: key
        })
    },
    error(content: string | number, duration?: any, key?: any) {
        if (typeof duration === "string" && (typeof key === 'undefined')) {
            key = duration
            duration = null
        }
        message.open({
            type: 'error',
            className: 'msgSuccess',
            content: content,
            duration: duration || 2,
            key: key
        })
    }
}

export default customMessage