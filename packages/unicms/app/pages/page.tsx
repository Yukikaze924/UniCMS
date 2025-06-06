import { Outlet, useLocation, useNavigate } from 'react-router';
import Header from '../components/common/header';
import Sidebar from '../components/common/sidebar';
import { useEffect } from 'react';

export default function Page() {
    const { pathname } = useLocation();
    const nav = useNavigate();

    useEffect(() => {
        if (pathname === '/') nav('/dashboard');
    }, [pathname]);

    return (
        <>
            <div className="antialiased font-[Inter]">
                <div className="flex flex-row w-screen h-screen overflow-x-auto overflow-y-hidden xl:overflow-hidden">
                    <Header />
                    <Sidebar />
                    <main className="w-full pt-16 md:pt-0 h-[calc(100vh-64px)] md:h-screen bg-neutral-50">
                        <Outlet />
                    </main>
                </div>
            </div>
        </>
    );
}
