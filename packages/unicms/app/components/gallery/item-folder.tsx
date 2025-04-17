import { useState } from 'react';
import ItemInEdit from './item-in-edit';
import { FolderColored } from '../svg/file-types';
import { useContextMenu } from '../providers/menu';
import { fileSystemService } from '@/app/api/services';

export default function ItemFolder({
    content,
    onClick,
    onRefresh,
}: {
    content: any;
    onClick: () => void;
    onRefresh: () => void;
}) {
    const [inEditing, setInEditing] = useState(false);
    const { showContextMenu, hideContextMenu } = useContextMenu();

    const openContextMenu = (event: React.MouseEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        showContextMenu(
            [
                {
                    label: 'Open',
                    action: handleInteract,
                },
                {
                    label: 'Rename...',
                    action: handleRename,
                },
                {
                    label: 'Delete',
                    action: handleDelete,
                    icon: (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="size-4"
                        >
                            <path
                                fillRule="evenodd"
                                d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-.355 5.945a.75.75 0 1 0-1.5.058l.347 9a.75.75 0 1 0 1.499-.058l-.346-9Zm5.48.058a.75.75 0 1 0-1.498-.058l-.347 9a.75.75 0 0 0 1.5.058l.345-9Z"
                                clipRule="evenodd"
                            />
                        </svg>
                    ),
                },
            ],
            { x: event.clientX, y: event.clientY }
        );
    };

    const handleInteract = () => {
        hideContextMenu();
        onClick();
    };

    const handleRename = () => {
        hideContextMenu();
        setInEditing(true);
    };

    const handleDelete = () => {
        hideContextMenu();
        fileSystemService.remove(content.path).then(onRefresh);
    };

    return (
        <>
            {!inEditing ? (
                <>
                    <div
                        className="block relative transition hover:scale-105 hover:-rotate-1 w-full max-w-[324px] cursor-pointer"
                        onClick={handleInteract}
                        onContextMenu={openContextMenu}
                    >
                        <div className="block">
                            <div className="aspect-video rounded-xl border shadow overflow-hidden bg-white">
                                <FolderColored />
                            </div>
                            <div className="p-2 space-y-1">
                                <div className="flex items-start justify-between gap-4">
                                    <h3 className="flex-1 text-base font-medium overflow-hidden text-ellipsis text-nowrap text-gray-900">
                                        {content.name}
                                    </h3>
                                </div>
                                <p className="text-sm text-gray-500"></p>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <ItemInEdit
                    type="folder"
                    defaultValue={content.name}
                    onEnter={(str: string) => {
                        hideContextMenu();
                        setInEditing(false);
                        if (str) {
                            const newSegments: string[] = content.path.split(/[/\\]+/).filter(Boolean);
                            newSegments.pop();
                            newSegments.push(str);
                            const newPath = newSegments.join('/');
                            fileSystemService.rename(content.path, newPath);
                        }
                    }}
                    onCancel={() => {
                        setInEditing(false);
                    }}
                />
            )}
        </>
    );
}
