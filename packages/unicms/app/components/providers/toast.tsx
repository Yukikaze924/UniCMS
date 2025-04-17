'use client';

import { createContext, useContext, useState } from 'react';
import SuccessToast from '../toasts/success-toast';
import ErrorToast from '../toasts/error-toast';

type ToastType = 'success' | 'warn' | 'error' | 'none';
type ToastData = { id: number; type: ToastType; message: string; duration: number; isShow: boolean; close: () => void };
type ToastContext = {
    addToast: (message: string, type?: ToastType, duration?: number) => void;
};

const ToastContext = createContext<ToastContext>({
    addToast() {
        throw new Error("'addToast' is not defined.");
    },
});

export const useToast = () => useContext(ToastContext);

export default function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<ToastData[]>([]);

    const addToast = (message: string, type: ToastType = 'success', duration: number = 3000) => {
        const id = Date.now();
        const closeToast = () => {
            setToasts((prev) => prev.filter((toast) => toast.id !== id));
        };
        setToasts((prev) => [...prev, { id, type, message, duration, isShow: true, close: closeToast }]);
        // setTimeout(() => {
        //     closeToast();
        // }, duration);
    };

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            {toasts.length > 0 ? (
                <div className="fixed right-7 top-7 w-72">
                    <div className="flex flex-col gap-4">
                        {toasts.map((toast) => {
                            if (toast.type === 'success')
                                return (
                                    <SuccessToast
                                        key={toast.id}
                                        message={toast.message}
                                        duration={toast.duration}
                                        isShow={toast.isShow}
                                        close={toast.close}
                                    />
                                );
                            else if (toast.type === 'error')
                                return (
                                    <ErrorToast
                                        key={toast.id}
                                        message={toast.message}
                                        duration={toast.duration}
                                        isShow={toast.isShow}
                                        close={toast.close}
                                    />
                                );
                        })}
                    </div>
                </div>
            ) : null}
        </ToastContext.Provider>
    );
}
