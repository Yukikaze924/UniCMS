import { TextValueBadge, NumberValueBadge, EnumValueBadge, DateValueBadge } from '@/app/components/badges';
import CreateAttributeModal from '@/app/components/modals/create-attribute';
import { useModal } from '@/app/components/providers/modal';
import { withUpperCase } from '@unicms/helpers/string';
import { useEffect, useState } from 'react';
import { useCollection } from './page';
import request from '@/app/api/request';
import { useToast } from '@/app/components/providers/toast';
import UpdateAttributeModal from '@/app/components/modals/update-attribute';
import SelectPromptModal from '@/app/components/modals/prompts/select';
import { MysqlColored } from '@/app/components/svg/mysql';
import { useNavigate } from 'react-router';
import { attributeService } from '@/app/api/services';

export default function Attributes({ collection }: { collection: Collection }) {
    const [attributes, setAttributes] = useState<Attribute[]>();
    const { openModal } = useModal();
    const { addToast } = useToast();
    const { fetchCollections } = useCollection();
    const navigate = useNavigate();

    useEffect(() => {
        setAttributes(collection.attributes);
    }, [collection]);

    const handleDelete = (attributeName: string) => {
        attributeService.delete(collection.collectionName, attributeName).then((_) => {
            addToast('deleted successfully');
            fetchCollections();
        });
    };

    return (
        <>
            <div className="mt-5">
                <div className="flex justify-end items-start space-x-4">
                    <button
                        className="h-10 pr-3 py-2.5 font-medium rounded-sm text-sm text-center inline-flex items-center cursor-pointer text-gray-900 outline-none bg-white hover:bg-gray-100 border border-gray-200 focus:ring-4 focus:outline-none focus:ring-gray-100 dark:focus:ring-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700"
                        onClick={() => openModal(CreateAttributeModal, { collection, fetchCollections })}
                    >
                        <svg
                            className="ms-1.5 w-6 h-6"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <g id="SVGRepo_bgCarrier" strokeWidth={0} />
                            <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round" />
                            <g id="SVGRepo_iconCarrier">
                                <rect fill="currentColor" />
                                <path d="M12 6V18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M6 12H18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
                            </g>
                        </svg>
                        Add another attribute
                    </button>
                    <button
                        className="h-10 px-6 py-2.5 font-medium rounded-sm text-sm text-center inline-flex items-center cursor-pointer text-white outline-none bg-indigo-600 hover:bg-indigo-800"
                        onClick={() =>
                            openModal(SelectPromptModal, {
                                title: 'Open with',
                                message: 'Choose one of the Data-Visualization methods to display Collection.',
                                items: [
                                    {
                                        label: 'MySQL',
                                        onSelect() {
                                            navigate('/database');
                                        },
                                        icon: <MysqlColored className="w-4" />,
                                    },
                                    {
                                        label: 'SQLite',
                                        onSelect() {
                                            navigate('/database');
                                        },
                                    },
                                ],
                                tip: { text: 'What is Data-Visualization in UniCMS?', url: '/docs/data-visualization' },
                            })
                        }
                    >
                        Open with
                    </button>
                </div>
                <section className="mt-5 bg-white rounded-md shadow-md">
                    <div className="px-8 py-6 mx-auto">
                        <div className="flex flex-row mb-2.5 h-10 uppercase text-gray-700">
                            <div className="flex justify-start items-center p-6 w-80">Name</div>
                            <div className="flex justify-start items-center p-6 w-32">Type</div>
                        </div>
                        {attributes &&
                            attributes.map((attr, index) => {
                                const TYPE = attr.type.toUpperCase();
                                return (
                                    <div
                                        key={index}
                                        className="flex flex-row justify-between h-20 p-6 bg-white border-t border-gray-200 dark:bg-gray-800 dark:border-gray-700"
                                    >
                                        <div className="flex">
                                            <div className="flex items-center w-80 gap-5">
                                                {TYPE === 'VARCHAR' ||
                                                TYPE === 'CHAR' ||
                                                TYPE === 'LONGTEXT' ||
                                                TYPE === 'TEXT' ? (
                                                    <TextValueBadge />
                                                ) : TYPE === 'INT' || TYPE === 'FLOAT' ? (
                                                    <NumberValueBadge />
                                                ) : TYPE === 'ENUM' ? (
                                                    <EnumValueBadge />
                                                ) : TYPE === 'DATE' ? (
                                                    <DateValueBadge />
                                                ) : null}
                                                <span className="text-base font-semibold">{attr.name}</span>
                                            </div>
                                            <div className="flex justify-start items-center w-32">
                                                <span>{withUpperCase(TYPE.toLowerCase())}</span>
                                            </div>
                                        </div>
                                        {!(attr as IntAttribute).primary && index !== 0 && (
                                            <div className="flex space-x-3">
                                                <div
                                                    className="w-auto h-auto cursor-pointer"
                                                    onClick={() =>
                                                        openModal(UpdateAttributeModal, {
                                                            collectionName: collection.collectionName,
                                                            attribute: attr,
                                                            fetchCollections,
                                                        })
                                                    }
                                                >
                                                    <div className="flex-1 h-full">
                                                        <div className="flex items-center justify-center flex-1 h-full p-2 bg-white shadow rounded-lg">
                                                            <div className="relative">
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    className="h-4 w-4 text-gray-500"
                                                                    viewBox="0 0 20 20"
                                                                    fill="currentColor"
                                                                >
                                                                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                                                </svg>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div
                                                    className="w-auto h-auto cursor-pointer"
                                                    onClick={() => handleDelete(attr.name)}
                                                >
                                                    <div className="flex-1 h-full">
                                                        <div className="flex items-center justify-center flex-1 h-full p-2 bg-red-700 shadow rounded-lg">
                                                            <div className="relative">
                                                                <svg
                                                                    className="h-5 w-4 fill-red-500 stroke-gray-50"
                                                                    viewBox="0 0 24 24"
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                >
                                                                    <g id="SVGRepo_bgCarrier" strokeWidth={0} />
                                                                    <g
                                                                        id="SVGRepo_tracerCarrier"
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                    />
                                                                    <g id="SVGRepo_iconCarrier">
                                                                        <path
                                                                            d="M6 7V18C6 19.1046 6.89543 20 8 20H16C17.1046 20 18 19.1046 18 18V7M6 7H5M6 7H8M18 7H19M18 7H16M10 11V16M14 11V16M8 7V5C8 3.89543 8.89543 3 10 3H14C15.1046 3 16 3.89543 16 5V7M8 7H16"
                                                                            strokeWidth={2}
                                                                            strokeLinecap="round"
                                                                            strokeLinejoin="round"
                                                                        />
                                                                    </g>
                                                                </svg>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                    </div>
                </section>
            </div>
        </>
    );
}
