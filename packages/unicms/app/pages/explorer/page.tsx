'use client';

import ItemFolder from '@components/gallery/item-folder';
import { useEffect, useRef, useState } from 'react';
import ItemInEdit from '@components/gallery/item-in-edit';
import ItemFile from '@components/gallery/item-file';
import NavToTop from '@components/buttons/nav-to-top';
import { fileSystemService, processService } from '@/app/api/services';
import { useContextMenu } from '@/app/components/providers/menu';
import { useNavigate } from 'react-router';
import { useExplorerSettings } from '@/lib/zustand/useExplorerSettings';

export default function Page() {
    const nav = useNavigate();
    const { settings, toggleHiddenItems } = useExplorerSettings();

    const [homeDir, setHomeDir] = useState<string>();
    const [contents, setContents] = useState<any[]>([]);
    const [workingDir, setWorkingDir] = useState<string>();
    const [pathSegments, setPathSegments] = useState<string[]>();
    const { showContextMenu, hideContextMenu } = useContextMenu();
    const [isFolderEditing, setIsFolderEditing] = useState(false);
    const [isFileEditing, setIsFileEditing] = useState(false);
    const [scrollTop, setScrollTop] = useState(0);
    const scrollArea = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetch = async () => {
            const env = await processService.env();
            setHomeDir(window.unicms.appConfigs.runtimeDir);
            setWorkingDir(env.UNICMS_DIR);
        };
        fetch();
    }, []);

    useEffect(() => {
        homeDir && fetchContents(homeDir);
    }, [homeDir]);

    useEffect(() => {
        if (homeDir && workingDir) {
            fileSystemService.relativePath(homeDir, workingDir).then((result) => {
                setPathSegments(result.split(/[/\\]+/).filter(Boolean));
            });
        }
    }, [workingDir]);

    const fetchContents = async (dir: string) => {
        try {
            const data = await fileSystemService.readDir(dir);
            setContents(data);
        } catch (error) {
            setContents([]);
        }
    };

    const handleDirectoryChange = (dir: string) => {
        fetchContents(dir);
        setWorkingDir(dir);
    };

    const openContextMenu = (event: React.MouseEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        showContextMenu(
            [
                {
                    label: 'Refresh',
                    action: handleRefresh,
                },
                {
                    label: 'Create',
                    children: [
                        {
                            label: 'New File...',
                            action: handleNewFile,
                        },
                        {
                            label: 'New Folder...',
                            action: handleNewFolder,
                        },
                    ],
                },
            ],
            { x: event.clientX, y: event.clientY }
        );
    };

    const handleRefresh = () => {
        hideContextMenu();
        setContents([]);
        fetchContents(workingDir!);
    };

    const handleNewFile = () => {
        hideContextMenu();
        setIsFileEditing(true);
    };

    const handleNewFolder = () => {
        hideContextMenu();
        setIsFolderEditing(true);
    };

    const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
        console.log(e.currentTarget.scrollTop);
        setScrollTop(e.currentTarget.scrollTop);
    };

    const scrollToTop = () => {
        if (scrollArea && scrollArea.current) scrollArea.current.scrollTop = 0;
    };

    return (
        <>
            <div
                ref={scrollArea}
                className="h-[calc(100vh-112px)] md:h-screen px-6 py-6 overflow-y-scroll"
                onContextMenu={openContextMenu}
                onScroll={onScroll}
            >
                <nav
                    className="flex w-full px-5 py-3 text-gray-800 border border-gray-100 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700"
                    aria-label="Breadcrumb"
                >
                    <ol className="inline-flex items-center space-x-1 md:space-x-2">
                        <li
                            className="inline-flex items-center cursor-pointer"
                            onClick={() => handleDirectoryChange(homeDir!)}
                        >
                            <span className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white">
                                <svg
                                    className="w-4 h-4 mr-2 text-gray-800 dark:text-white"
                                    aria-hidden="true"
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M3 6a2 2 0 0 1 2-2h5.532a2 2 0 0 1 1.536.72l1.9 2.28H3V6Zm0 3v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9H3Z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                home
                            </span>
                        </li>
                        {pathSegments?.map((item, index) => {
                            return (
                                <li
                                    key={index}
                                    onClick={() => {
                                        const path = pathSegments.slice(0, index + 1).join('/');
                                        fileSystemService
                                            .resolvePath(homeDir!, path)
                                            .then((path) => handleDirectoryChange(path));
                                    }}
                                >
                                    <div className="flex items-center">
                                        <svg
                                            className="rtl:rotate-180 block w-3 h-3 mx-1 text-gray-400 "
                                            aria-hidden="true"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 6 10"
                                        >
                                            <path
                                                stroke="currentColor"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="m1 9 4-4-4-4"
                                            />
                                        </svg>
                                        <span className="ms-1 cursor-pointer text-sm font-medium text-gray-700 hover:text-blue-600 md:ms-2 dark:text-gray-400 dark:hover:text-white">
                                            {item}
                                        </span>
                                    </div>
                                </li>
                            );
                        })}
                    </ol>
                </nav>

                <div className="lg:max-w-screen-2xl xl:max-w-full lg:mx-auto mt-5 md:mt-10 p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-8 justify-items-center overflow-hidden">
                    {contents.map((content: any) => {
                        if (content.type === 'directory' || content.type === 'schema') {
                            return (
                                <ItemFolder
                                    key={content.name}
                                    content={content}
                                    onClick={() => handleDirectoryChange(content.path)}
                                    onRefresh={handleRefresh}
                                />
                            );
                        } else if (content.type === 'file') {
                            return (
                                <ItemFile
                                    key={content.name}
                                    content={content}
                                    onClick={() => nav(`/editor?path=${content.path}`)}
                                    onRefresh={handleRefresh}
                                />
                            );
                        }
                    })}
                    {isFolderEditing ? (
                        <>
                            <ItemInEdit
                                type="folder"
                                defaultValue="New Folder"
                                onEnter={(str) => {
                                    setIsFolderEditing(false);
                                    fileSystemService.joinPath(workingDir!, str).then((dir) => {
                                        fileSystemService.mkdir(dir).then(handleRefresh);
                                    });
                                }}
                                onCancel={() => {
                                    setIsFolderEditing(false);
                                }}
                            />
                        </>
                    ) : null}
                    {isFileEditing ? (
                        <>
                            <ItemInEdit
                                type="file"
                                defaultValue="New File"
                                onEnter={(str) => {
                                    setIsFileEditing(false);
                                    fileSystemService.joinPath(workingDir!, str).then((path) => {
                                        fileSystemService.writeFile(path, '\n').then(handleRefresh);
                                    });
                                }}
                                onCancel={() => {
                                    setIsFileEditing(false);
                                }}
                            />
                        </>
                    ) : null}
                </div>

                <NavToTop scrollTop={scrollTop} scrollToTop={scrollToTop} />
            </div>
        </>
    );
}
