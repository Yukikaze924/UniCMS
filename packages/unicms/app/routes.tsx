import { JSX, useEffect, useState } from "react";
import { createBrowserRouter, RouterProvider } from "react-router";

const ROUTES = import.meta.glob('/app/pages/**/page.tsx');
const PRESERVED = import.meta.glob('/app/pages/(layout|404).(jsx|tsx)', { eager: true });

const parsePreserved = () => Object.keys(PRESERVED).reduce((acc, file) => {
    const key = file.replace(/\/app\/pages\/|\.(jsx|tsx)$/g, '');
    acc[key] = (PRESERVED as any)[file].default;
    return acc;
}, {});

const getRawRoutes = async () => {
    const routes: any[] = [];
    const preserved = parsePreserved();

    for (const route in ROUTES) {
        const PageModule = await ROUTES[route]() as any;
        const PageComponent = PageModule.default as () => JSX.Element;
        const PageNotFound = preserved['404'] as () => JSX.Element;

        const path = route
            .replace(/\/app\/pages|page|\.(jsx|tsx)$/g, '')
            .replace(/\[\.{3}.+\]/, '*')
            .replace(/\[(.+)\]/, ':\$1');

        routes.push({
            path,
            element: PageComponent,
            errorElement: <PageNotFound />,
            props: {
                mod: ROUTES[route],
                filepath: route,
            }
        });
    }

    return routes;
};

function buildRouterTree(routes: any[]) {
    const rootRoute = routes.find(route => route.path === '/');
    const root = {
        path: '/',
        Component: rootRoute.element,
        errorElement: rootRoute.errorElement,
        children: []
    } as any;
    const map = {};

    map['/'] = root;

    routes.forEach(item => {
        const path = item.path as string;
        const segments = path.split('/').filter(Boolean) as string[];
        const element = item.element as () => JSX.Element;

        let current = root;

        segments.forEach((segment, index) => {
            const isLast = index === segments.length - 1;
            const currentPath = '/' + segments.slice(0, index + 1).join('/');

            if (!map[currentPath]) {
                const newNode = {
                    path: segment,
                    Component: isLast ? element : undefined,
                    errorElement: item.errorElement,
                    children: [],
                    __props__: item.props
                };
                map[currentPath] = newNode;
                current.children.push(newNode);
            } else {
                if (isLast) {
                    map[currentPath].Component = element;
                    map[currentPath].errorElement = item.errorElement;
                    map[currentPath].__props__ = item.props;
                }
            }

            current = map[currentPath];
        });
    });

    return root;
}

const loadRoutes = async () => {
    const routes = await getRawRoutes();
    const tree = buildRouterTree(routes);
    return [tree];
}

const ViteRouter = () => {
    const [routes, setRoutes] = useState<any[]>();

    useEffect(() => {
        const init = async () => {
            const r = await loadRoutes();
            setRoutes(r);

            document.title = "UniCMS - Open Source Node.js Headless CMS 🚀";
        }

        init();
    }, []);

    if (routes)
    return (
        <>
            <RouterProvider router={createBrowserRouter(routes)} />
        </>
    )
}

export default ViteRouter;
