import { useEffect, useState } from 'react';

const COLLAPSED_DELAY = 500;

type MousePosition = 'on-menu' | 'on-parent' | 'on-child-menu' | 'off-hover';

export interface MenuItem {
    label: string;
    action?: () => void;
    icon?: React.ReactNode;
    children?: MenuItem[];
}

export default function ContextMenu({
    x,
    y,
    visible,
    items,
    onClose,
}: {
    x: number;
    y: number;
    visible: boolean;
    items: MenuItem[];
    onClose: () => void;
}) {
    const [openedSubmenu, setOpenedSubmenu] = useState<number>(-1);
    const [mousePosition, setMousePosition] = useState<MousePosition>('off-hover');

    const invokeSubmenuOpen = (serial: number) => {
        setOpenedSubmenu(serial);
    };

    useEffect(() => {
        let timer;
        if (openedSubmenu >= 0 && mousePosition === 'off-hover') {
            timer = setTimeout(() => {
                invokeSubmenuOpen(-1);
            }, COLLAPSED_DELAY);
        } else if (openedSubmenu < 0 && mousePosition === 'off-hover') {
            timer = setTimeout(() => {
                onClose();
            }, COLLAPSED_DELAY);
        }

        return () => {
            if (timer) {
                clearTimeout(timer);
            }
        };
    }, [openedSubmenu, mousePosition]);

    return (
        <>
            {/* 透明遮罩层 */}
            <div className={`${!visible ? 'hidden ' : ''}fixed inset-0 z-40`} onClick={onClose}></div>
            {/* 菜单 */}
            <div
                className={`${!visible ? 'hidden ' : ''}absolute z-50 flex flex-col rounded-lg bg-white shadow-sm border border-slate-200`}
                style={{ left: x, top: y }}
                onMouseEnter={() => setMousePosition('on-menu')}
                onMouseLeave={() => setMousePosition('off-hover')}
            >
                <nav className="relative flex w-[200px] flex-col gap-1 p-1.5">
                    {/* {items.map((item, index) => {
                        return (
                            <ContextMenuItem
                                key={`${item.label}-${index}`}
                                index={index}
                                item={item}
                                openedSubmenu={openedSubmenu}
                                invokeSubmenuOpen={invokeSubmenuOpen}
                                invokeMousePosition={setMousePosition}
                            />
                        );
                    })} */}
                    {(() => {
                        let newIndex = 0;
                        return items.map((item, originalIndex) => {
                            if (item.label === 'divider') {
                                return <div key={`divider-${originalIndex}`} className="h-px w-full bg-gray-200"></div>;
                            } else {
                                const currentIndex = newIndex;
                                newIndex++;
                                return (
                                    <ContextMenuItem
                                        key={`${item.label}-${originalIndex}`}
                                        index={originalIndex}
                                        item={item}
                                        parentItems={items}
                                        openedSubmenu={openedSubmenu}
                                        invokeSubmenuOpen={invokeSubmenuOpen}
                                        invokeMousePosition={setMousePosition}
                                    />
                                );
                            }
                        });
                    })()}
                </nav>
            </div>
        </>
    );
}

function ContextMenuItem({
    index,
    item,
    parentItems,
    openedSubmenu,
    invokeSubmenuOpen,
    invokeMousePosition,
}: {
    index: number;
    item: MenuItem;
    parentItems: MenuItem[];
    openedSubmenu: number;
    invokeSubmenuOpen: (serial: number) => void;
    invokeMousePosition: (pos: MousePosition) => void;
}) {
    return (
        <>
            {item.children && item.children.length > 0 ? (
                <div
                    role="button"
                    className="flex w-full pl-3 items-center rounded-md transition-all text-sm text-slate-800 hover:bg-slate-100 focus:bg-slate-100 active:bg-slate-100"
                    onMouseEnter={() => {
                        invokeSubmenuOpen(index);
                        invokeMousePosition('on-parent');
                    }}
                >
                    <span className="cursor-default">{item.label}</span>
                    <div className="ml-auto grid place-items-center justify-self-end">
                        <div className="p-2 text-center text-sm transition-all text-slate-600 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none">
                            <svg
                                className="w-4 h-4 text-gray-800 dark:text-white"
                                aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="1.5"
                                    d="m9 5 7 7-7 7"
                                />
                            </svg>
                        </div>
                    </div>
                    {item.children && item.children.length > 0 && (
                        <SubMenu
                            index={index}
                            visible={openedSubmenu === index}
                            items={item.children}
                            parentItems={parentItems}
                            invokeMousePosition={invokeMousePosition}
                        />
                    )}
                </div>
            ) : (
                <div
                    role="button"
                    className="flex w-full pl-3 items-center rounded-md transition-all text-sm text-slate-800 hover:bg-slate-100 focus:bg-slate-100 active:bg-slate-100"
                    onClick={item.action}
                    onMouseEnter={() => {
                        invokeSubmenuOpen(index);
                        invokeMousePosition('on-menu');
                    }}
                >
                    <span className="cursor-default">{item.label}</span>
                    <div className="ml-auto grid place-items-center justify-self-end">
                        <div className="p-2 text-center text-sm transition-all text-slate-600 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none">
                            {item.icon ? (
                                item.icon
                            ) : (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                    className="w-4 h-4"
                                ></svg>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

function SubMenu({
    index,
    visible,
    items,
    parentItems,
    invokeMousePosition,
}: {
    index: number;
    visible: boolean;
    items: MenuItem[];
    parentItems: MenuItem[];
    invokeMousePosition: (pos: MousePosition) => void;
}) {
    const [openedSubmenu, setOpenedSubmenu] = useState<number>(-1);

    const invokeSubmenuOpen = (serial: number) => {
        setOpenedSubmenu(serial);
    };

    const currentItem = index + 1;
    const itemCount = parentItems.filter((item, _index) => _index < currentItem && item.label !== 'divider').length;
    const divCount = parentItems.filter((item, _index) => _index < currentItem && item.label === 'divider').length;

    const itemTotal = (itemCount - 1) * 32 + (itemCount - 1) * 4;
    const divTotal = divCount * (8 + 1);

    const pixelFromTop = `${6 + itemTotal + divTotal - 1 - 6}px`;

    return (
        <>
            <div
                style={{ top: pixelFromTop }}
                className={`${!visible ? 'hidden ' : ''}absolute z-50 translate-x-[203px] left-auto right-0 flex flex-col rounded-lg bg-white shadow-sm border border-slate-200`}
                onMouseEnter={() => invokeMousePosition('on-child-menu')}
                onMouseLeave={() => invokeMousePosition('off-hover')}
            >
                <nav className="relative flex w-[200px] flex-col gap-1 p-1.5">
                    {items.map((item, index) => {
                        return (
                            <ContextMenuItem
                                key={index}
                                index={index}
                                item={item}
                                parentItems={items}
                                openedSubmenu={openedSubmenu}
                                invokeSubmenuOpen={invokeSubmenuOpen}
                                invokeMousePosition={() => null}
                            />
                        );
                    })}
                </nav>
            </div>
        </>
    );
}
