import request from '@/app/api/request';
import { FormEvent, useEffect, useState } from 'react';
import { useToast } from '../providers/toast';
import TypeOptions from '../common/type-options';
import { attributeService } from '@/app/api/services';

function UpdateAttributeModal({
    open,
    onClose,
    collectionName,
    attribute,
    fetchCollections,
}: {
    open: boolean;
    onClose: () => void;
    collectionName: string;
    attribute: Attribute;
    fetchCollections: () => void;
}) {
    if (!open) return null;

    const [formData, setFormData] = useState<any>();
    const { addToast } = useToast();

    useEffect(() => {
        setFormData({
            ...attribute,
            type: attribute.type.toUpperCase() as AttributeType,
        });
    }, [attribute]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const obj = { ...formData } as DefaultAttribute;
        if (!obj.name || !obj.type) {
            return;
        }

        const TYPE: AttributeType = obj.type;
        if (TYPE === 'VARCHAR' || TYPE === 'CHAR') {
            obj.length = 255;
        } else {
            delete obj.length;
        }

        attributeService.update(collectionName, attribute.name, obj).then((_) => {
            addToast('updated successfully');
            onClose();
            fetchCollections();
        });
    };

    if (formData)
        return (
            <>
                <div className="overflow-y-auto overflow-x-hidden fixed top-0 left-0 right-0 bottom-0 z-40 flex justify-center items-center w-full md:inset-0 md:h-full">
                    <div className="fixed inset-0 bg-black opacity-50" onClick={onClose}></div>
                    <div className="relative p-4 w-full max-w-2xl h-full md:h-auto">
                        {/* Modal content */}
                        <div className="relative p-4 bg-white rounded-lg shadow dark:bg-gray-800 sm:p-5">
                            {/* Modal header */}
                            <div className="flex justify-between items-center pb-4 mb-4 rounded-t border-b sm:mb-5 dark:border-gray-600">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Attribute - {formData.name}
                                </h3>
                                <button
                                    type="button"
                                    className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
                                    onClick={onClose}
                                >
                                    <svg
                                        aria-hidden="true"
                                        className="w-5 h-5"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    <span className="sr-only">Close modal</span>
                                </button>
                            </div>
                            {/* Modal body */}
                            <form onSubmit={handleSubmit}>
                                <div className="grid gap-4 mb-7.5 sm:grid-cols-2">
                                    <div className="col-span-1">
                                        <label
                                            htmlFor="name"
                                            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                        >
                                            Attribute Name
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            id="name"
                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg outline-none focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="Type attribute name"
                                            required
                                        />
                                    </div>
                                    <div className="col-span-1">
                                        <label
                                            htmlFor="type"
                                            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                        >
                                            Type
                                        </label>
                                        <select
                                            id="type"
                                            name="type"
                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg outline-none focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                            value={formData.type}
                                            onChange={handleChange}
                                        >
                                            <TypeOptions />
                                        </select>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <button
                                        type="submit"
                                        className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                                    >
                                        Update
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </>
        );
}

export default UpdateAttributeModal;
