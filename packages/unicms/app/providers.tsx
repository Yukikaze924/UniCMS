import MenuProvider from './components/providers/menu';
import ModalProvider from './components/providers/modal';
import ToastProvider from './components/providers/toast';

const Providers = ({ children }) => {
    return (
        <>
            <ToastProvider>
                <ModalProvider>
                    <MenuProvider>{children}</MenuProvider>
                </ModalProvider>
            </ToastProvider>
        </>
    );
};

export default Providers;
