import { createContext, useContext, useState } from 'react';
import ContextMenu, { MenuItem } from '../context-menu';

type ContextMenuContextType = {
    showContextMenu: (items: MenuItem[], pos: { x: number; y: number }) => void;
    hideContextMenu: () => void;
};

const MenuContext = createContext<ContextMenuContextType>({
    showContextMenu: () => {},
    hideContextMenu: () => {},
});

const useContextMenu = () => useContext(MenuContext);

const MenuProvider = ({ children }) => {
    const [contextMenu, setContextMenu] = useState<{
        items: MenuItem[];
        x: number;
        y: number;
        visible: boolean;
    }>({ items: [], x: 0, y: 0, visible: false });

    const showContextMenu = (items: MenuItem[], pos: { x: number; y: number }) => {
        setContextMenu({ items, x: pos.x, y: pos.y, visible: true });
    };

    const hideContextMenu = () => {
        setContextMenu((prev) => ({ ...prev, visible: false }));
    };

    return (
        <MenuContext.Provider value={{ showContextMenu, hideContextMenu }}>
            {children}
            <ContextMenu
                x={contextMenu.x}
                y={contextMenu.y}
                visible={contextMenu.visible}
                items={contextMenu.items}
                onClose={hideContextMenu}
            />
        </MenuContext.Provider>
    );
};

export { useContextMenu };
export default MenuProvider;
