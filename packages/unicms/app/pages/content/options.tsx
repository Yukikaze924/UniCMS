import { useToast } from '@/app/components/providers/toast';
import { FormEvent, useEffect, useState } from 'react';
import { useCollection } from './page';
import { collectionService } from '@/app/api/services';

type FormData = {
    private: boolean;
};

export default function Options({ collection }: { collection: Collection }) {
    const [formData, setFormData] = useState<FormData>({
        private: false,
    });
    const { addToast } = useToast();
    const { fetchCollections } = useCollection();

    useEffect(() => {
        setFormData({
            private: collection.options?.private || false,
        });
    }, [collection]);

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const dto: Partial<Collection> = {
            options: {
                private: formData.private,
            },
        };
        collectionService.update(collection.collectionName, dto).then(() => {
            addToast('updated successfully');
            fetchCollections();
        });
    };

    return (
        <>
            <div className="mt-10">
                <section className="bg-white rounded-md shadow-md">
                    <div className="px-8 py-6 mx-auto">
                        <div className="space-y-2.5">
                            <h2 className="text-2xl font-normal tracking-wide">Visibility</h2>
                            <hr />
                        </div>
                        <form className="mt-5" onSubmit={handleSubmit}>
                            <div className="grid gap-4 mb-4 sm:grid-cols-2 sm:gap-6 sm:mb-5">
                                <div className="col-span-2">
                                    <label htmlFor="private" className="inline-flex items-center gap-3.5 mb-2">
                                        <input
                                            type="checkbox"
                                            id="private"
                                            name="private"
                                            className="sr-only peer"
                                            checked={formData.private}
                                            readOnly
                                        />
                                        <div
                                            className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600 cursor-pointer"
                                            onClick={() =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    private: !prev.private,
                                                }))
                                            }
                                        ></div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                                Make collection private
                                            </p>
                                            <p className="text-xs text-gray-700">
                                                Enabling the will hide your collection's API endpoint from public.
                                            </p>
                                        </div>
                                    </label>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <button
                                    type="submit"
                                    className="font-medium rounded-md text-sm px-4 py-1.5 text-center outline-none text-white bg-green-700 hover:bg-green-800 dark:bg-green-600 dark:hover:bg-green-700 cursor-pointer"
                                >
                                    Update
                                </button>
                            </div>
                        </form>
                    </div>
                </section>
            </div>
        </>
    );
}
