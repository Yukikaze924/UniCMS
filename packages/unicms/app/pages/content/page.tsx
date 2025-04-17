import { withUpperCase } from '@unicms/helpers/string';
import { createContext, useContext, useEffect, useState } from 'react';
import Draft from './draft';
import Options from './options';
import Attributes from './attributes';
import { useModal } from '@/app/components/providers/modal';
import CreateCollectionModal from '@/app/components/modals/create-collection';
import SchemaEditor from './editor';
import { collectionService } from '@/app/api/services';

const CollectionContext = createContext<any>(undefined);

export const useCollection = () => useContext(CollectionContext);

export default function Page() {
    const [collections, setCollections] = useState<Collection[]>();
    const [selectedCollection, setSelectedCollection] = useState<string>();
    const [collection, setCollection] = useState<Collection>();
    const [selectedTab, setSelectedTab] = useState<string>('draft');
    const { openModal } = useModal();
    const [inEditor, setInEditor] = useState<boolean>(false);

    useEffect(() => {
        if (!collections) fetchCollections();
    }, []);

    useEffect(() => {
        setInEditor(false);
        setCollection(collections?.find((item) => item.collectionName === selectedCollection));
    }, [selectedCollection, collections]);

    const fetchCollections = () => {
        collectionService.findAll().then((data) => setCollections(data));
    };

    return (
        <>
            <div className="flex flex-row h-screen">
                <div className="max-xl:hidden w-80 bg-white">
                    <div className="flex-shrink-0 w-full h-full shadow-md">
                        <div className="h-20 p-6">
                            <h2 className="text-xl font-bold tracking-tight text-blue-950">Content</h2>
                        </div>
                        <div className="mb-2 px-6">
                            <h2 className="text-xs font-semibold tracking-tighter uppercase text-neutral-400">
                                Collections ({collections?.length || 0})
                            </h2>
                        </div>
                        <nav aria-label="Main" className="flex flex-col h-full">
                            {/* Links */}
                            <div className={`flex-1 text-sm font-semibold overflow-hidden hover:overflow-auto`}>
                                {collections?.map((collection, index) => {
                                    return (
                                        <div
                                            key={index}
                                            className={`${selectedCollection === collection.collectionName ? 'flex items-center px-4 py-3 w-full space-x-2 cursor-pointer text-indigo-600 bg-indigo-50 border-r-2 border-indigo-600' : 'flex items-center px-4 py-3 space-x-2 cursor-pointer text-neutral-800 transition-colors hover:bg-neutral-100'}`}
                                            onClick={() => setSelectedCollection(collection.collectionName)}
                                        >
                                            <span className="ms-8 font-semibold">
                                                {withUpperCase(collection.collectionName)}
                                            </span>
                                        </div>
                                    );
                                })}
                                <div
                                    className="flex items-center px-4 py-3 space-x-2 cursor-pointer text-neutral-800 transition-colors hover:bg-neutral-100"
                                    onClick={() => {
                                        openModal(CreateCollectionModal, {
                                            onConfirm(collectionName) {
                                                fetchCollections();
                                                setSelectedCollection(collectionName);
                                            },
                                        });
                                    }}
                                >
                                    <span className="flex flex-row items-center font-semibold text-indigo-700">
                                        <svg
                                            className="ms-6 me-0.5 w-6 h-6"
                                            viewBox="0 0 24 24"
                                            fill="currentColor"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <g id="SVGRepo_bgCarrier" strokeWidth={0} />
                                            <g
                                                id="SVGRepo_tracerCarrier"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                            <g id="SVGRepo_iconCarrier">
                                                <rect fill="currentColor" />
                                                <path
                                                    d="M12 6V18"
                                                    stroke="currentColor"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                                <path
                                                    d="M6 12H18"
                                                    stroke="currentColor"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </g>
                                        </svg>
                                        Create new collection
                                    </span>
                                </div>
                            </div>
                        </nav>
                    </div>
                </div>

                {inEditor ? (
                    <div className="w-full h-screen px-px overflow-y-auto">
                        <SchemaEditor collection={collection!} />
                    </div>
                ) : (
                    <div className="w-full p-6 md:px-20 md:py-10 h-screen overflow-y-auto">
                        {!(selectedCollection && collection) ? null : (
                            <>
                                <div
                                    className="inline-flex flex-row items-center gap-1.5 -ml-2 px-4 py-2 text-blue-600 hover:bg-neutral-100 rounded-lg cursor-pointer"
                                    onClick={() => setSelectedCollection(void 0)}
                                >
                                    <svg
                                        className="w-6 h-6 text-blue-600"
                                        aria-hidden="true"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            stroke="currentColor"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M5 12h14M5 12l4-4m-4 4 4 4"
                                        />
                                    </svg>
                                    Back
                                </div>
                                <div className="inline-flex w-full mt-5">
                                    <div className="block w-full">
                                        <h1 className="text-3xl font-semibold">{collection.info.name}</h1>
                                        <p className="mt-2 text-base text-gray-500">{collection.info.description}</p>
                                    </div>
                                    <div className="hidden sm:flex w-full justify-end items-start space-x-4">
                                        <button
                                            className="h-10 px-3 py-2.5 font-medium rounded-sm text-sm text-center inline-flex items-center cursor-pointer text-gray-900 outline-none bg-white hover:bg-gray-100 border border-gray-200 focus:ring-4 focus:outline-none focus:ring-gray-100 dark:focus:ring-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700"
                                            onClick={() => setInEditor(true)}
                                        >
                                            Open in Editor
                                            <svg
                                                className="ms-2 w-4 h-4 text-gray-800 dark:text-white"
                                                aria-hidden="true"
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="24"
                                                height="24"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    stroke="currentColor"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="m9 5 7 7-7 7"
                                                />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                                <div className="mt-2.5">
                                    {collection.options?.private ? (
                                        <span className="text-md font-medium inline-flex items-center px-3.5 py-0.5 rounded-sm bg-red-100 text-red-800 border border-red-400">
                                            Private
                                        </span>
                                    ) : (
                                        <span className="text-md font-medium inline-flex items-center px-3.5 py-0.5 rounded-sm bg-green-100 text-green-800 border border-green-400">
                                            Public
                                        </span>
                                    )}
                                </div>
                                <div className="mt-5">
                                    <div className="text-sm font-medium text-center text-gray-500 border-gray-200 dark:text-gray-400 dark:border-gray-700">
                                        <ul className="flex -mb-px">
                                            {['draft', 'attributes', 'options'].map((tab) => (
                                                <li key={tab} className="md:me-px">
                                                    <button
                                                        className={`${'inline-block p-3 w-28 text-xs font-semibold uppercase cursor-pointer rounded-t-lg border-b-2'} ${
                                                            selectedTab === tab
                                                                ? 'text-blue-600 border-blue-600 dark:text-blue-500 dark:border-blue-500'
                                                                : 'border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'
                                                        }`}
                                                        onClick={() => setSelectedTab(tab)}
                                                    >
                                                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                                <CollectionContext.Provider value={{ fetchCollections }}>
                                    {selectedTab === 'draft' ? (
                                        <Draft collection={collection} />
                                    ) : selectedTab === 'attributes' ? (
                                        <Attributes collection={collection} />
                                    ) : selectedTab === 'options' ? (
                                        <Options collection={collection} />
                                    ) : (
                                        <></>
                                    )}
                                </CollectionContext.Provider>
                            </>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}
