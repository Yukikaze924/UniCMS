import { useToast } from '@/app/components/providers/toast';
import { FormEvent, useEffect, useState } from 'react';
import { useCollection } from './page';
import { useModal } from '@/app/components/providers/modal';
import ConfirmPromptModal from '@/app/components/modals/prompts/confirm';
import { collectionService } from '@/app/api/services';

type FormData = {
    collectionName: string;
    name: string;
    description: string;
    category?: InfoCategory;
};

export default function Draft({ collection }: { collection: Collection }) {
    const [formData, setFormData] = useState<FormData>({
        collectionName: '',
        name: '',
        description: '',
    });
    const { addToast } = useToast();
    const { openModal } = useModal();
    const { fetchCollections } = useCollection();

    useEffect(() => {
        setFormData({
            collectionName: collection.collectionName,
            name: collection.info.name,
            description: collection.info.description,
            category: collection.info.category ? collection.info.category : 'raw',
        });
    }, [collection]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const dto: Partial<Collection> = {
            collectionName: formData.collectionName,
            info: {
                name: formData.name,
                description: formData.description,
                category: formData.category ? formData.category : 'raw',
            },
        };
        collectionService.update(collection.collectionName, dto).then(() => {
            addToast('updated successfully');
            fetchCollections();
        });
    };

    const handleDelete = () => {
        openModal(ConfirmPromptModal, {
            type: 'warning',
            message: `Are you sure you want to delete '${collection.collectionName}' ?`,
            confirm: "Yes, I'm sure",
            cancel: 'No, cancel',
            onConfirm() {
                collectionService.delete(collection.collectionName).then(() => {
                    addToast('deleted successfully');
                    fetchCollections();
                });
            },
        });
    };

    return (
        <>
            <div className="mt-10">
                <section className="bg-white rounded-md shadow">
                    <div className="px-8 py-6 mx-auto">
                        <form onSubmit={handleSubmit}>
                            <div className="grid gap-4 mb-4 sm:grid-cols-2 sm:gap-6 sm:mb-5">
                                <div className="w-full">
                                    <label
                                        htmlFor="name"
                                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                    >
                                        Name
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg outline-none focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Display Name"
                                        required
                                    />
                                </div>
                                <div>
                                    <label
                                        htmlFor="category"
                                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                    >
                                        Category
                                    </label>
                                    <select
                                        id="category"
                                        name="category"
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg outline-none focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                        value={formData.category}
                                        onChange={handleChange}
                                    >
                                        <option value="raw">Raw Data</option>
                                        <option value="binary">Binary</option>
                                        <option value="media">Media</option>
                                    </select>
                                </div>
                                <div className="sm:col-span-2">
                                    <label
                                        htmlFor="description"
                                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                    >
                                        Description
                                    </label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        rows={8}
                                        className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg outline-none border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                        value={formData.description}
                                        onChange={handleChange}
                                        placeholder="Write a collection description here..."
                                    />
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <button
                                    type="submit"
                                    className="font-medium rounded-lg text-sm px-5 py-2.5 text-center outline-none text-white bg-indigo-600 hover:bg-indigo-800 dark:bg-indigo-600 dark:hover:bg-indigo-700 cursor-pointer"
                                >
                                    Update collection
                                </button>
                                <button
                                    type="button"
                                    className="inline-flex items-center font-medium rounded-lg text-sm px-5 py-2.5 text-center text-red-600 hover:text-white border border-red-600 hover:bg-red-600 dark:border-red-500 dark:text-red-500 dark:hover:text-white dark:hover:bg-red-600 cursor-pointer"
                                    onClick={handleDelete}
                                >
                                    <svg
                                        className="w-5 h-5 mr-1 -ml-1"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    Delete
                                </button>
                            </div>
                        </form>
                    </div>
                </section>
            </div>
        </>
    );
}
