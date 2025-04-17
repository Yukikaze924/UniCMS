import { useContext, useEffect, useState } from 'react';
import { truncateWithEllipsis } from '@unicms/helpers/string';
import copy from 'copy-to-clipboard';
import { useToast } from '@/app/components/providers/toast';
import { databaseService } from '@/app/api/services';
import { ButtonsContext } from './page';
import { useModal } from '@/app/components/providers/modal';
import ConfirmPromptModal from '@/app/components/modals/prompts/confirm';

export default function MysqlTable({ table }: { table: string }) {
    return <Table table={table} />;
}

function Table({ table }) {
    const { exportBtn, deleteBtn } = useContext(ButtonsContext)!;

    const [columns, setColumns] = useState<any[]>();
    const [rows, setRows] = useState<any[]>();
    const [selectAll, setSelectAll] = useState(false);
    const [selectedRowMap, setSelectedRowMap] = useState<{ [key: number]: boolean }>({});
    const { addToast } = useToast();
    const { openModal } = useModal();

    const fetchRows = () => databaseService.find(table, {}).then((rows) => setRows(rows));

    useEffect(() => {
        databaseService.showColumnFrom(table).then((columns) => setColumns(columns));
        fetchRows();
    }, [table]);

    useEffect(() => {
        if (rows) {
            for (let i = 0; i < rows.length; i++) {
                setSelectedRowMap((prev) => ({ ...prev, [i]: false }));
            }
        }
    }, [rows]);

    useEffect(() => {
        if (rows) {
            if (selectAll === true) {
                for (let i = 0; i < rows.length; i++) {
                    setSelectedRowMap((prev) => ({ ...prev, [i]: true }));
                }
            } else if (selectAll === false) {
                for (let i = 0; i < rows.length; i++) {
                    setSelectedRowMap((prev) => ({ ...prev, [i]: false }));
                }
            }
        }
    }, [selectAll]);

    useEffect(() => {
        if (exportBtn && exportBtn.current) {
            exportBtn.current.addEventListener('click', copyToClipboard);
        }
        if (deleteBtn && deleteBtn.current) {
            deleteBtn.current.addEventListener('click', deleteSelectedRows);
        }

        return () => {
            if (exportBtn && exportBtn.current) {
                exportBtn.current.removeEventListener('click', copyToClipboard);
            }
            if (deleteBtn && deleteBtn.current) {
                deleteBtn.current.removeEventListener('click', deleteSelectedRows);
            }
        };
    }, [exportBtn, deleteBtn, rows, selectedRowMap]);

    const copyToClipboard = (_e: MouseEvent) => {
        const selectedRows = getSelectedRows(selectedRowMap);
        if (rows) {
            if (selectedRows && selectedRows.length > 0) {
                copy(JSON.stringify(selectedRows, null, 4));
                addToast('copied to clipboard', 'success', 1500);
            } else {
                addToast('no items selected', 'error', 1500);
            }
        }
    };

    const deleteSelectedRows = (_e: MouseEvent) => {
        const selectedRows = getSelectedRows(selectedRowMap);
        if (rows && selectedRows && selectedRows.length > 0) {
            openModal(ConfirmPromptModal, {
                type: 'warning',
                message: `Are you sure you want to delete selected rows ? \n\nDirectly deleting selected rows may disrupt the auto-increment sequence integrity.\n\n`,
                confirm: "Yes, I'm sure",
                cancel: 'No, cancel',
                onConfirm() {
                    let _count: number = 0;
                    selectedRows.forEach((row) => {
                        _count += 1;
                        databaseService.delete(table, row);
                    });
                    addToast('deleted successfully' + `(${_count} items)`, 'success', 1500);
                    fetchRows();
                },
            });
        } else {
            addToast('no items selected', 'error', 1500);
        }
    };

    const getSelectedRows = (selectedRowMap) => {
        const objectArray = Object.keys(selectedRowMap);
        let selectedRowsArray: any[] = [];
        for (let i = 0; i < objectArray.length; i++) {
            const value = selectedRowMap[i];
            if (value === true) {
                selectedRowsArray.push(rows![i]);
            } else continue;
        }
        return selectedRowsArray;
    };

    return (
        <>
            <div className="relative h-[50vh] xl:h-[65vh] 2xl:h-[70vh] overflow-x-auto shadow-md sm:rounded-lg bg-white">
                <table className="relative w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                    <thead className="sticky top-0 text-xs text-gray-700 uppercase bg-neutral-100 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="p-4">
                                <div className="flex items-center">
                                    <input
                                        id="checkbox-all-search"
                                        type="checkbox"
                                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 focus:outline-none"
                                        checked={selectAll}
                                        onChange={(e) => setSelectAll(e.target.checked)}
                                    />
                                    <label htmlFor="checkbox-all-search" className="sr-only">
                                        checkbox
                                    </label>
                                </div>
                            </th>
                            <th scope="col" className="p-4"></th>
                            {columns?.map((col, index) => {
                                if (index < 8)
                                    return (
                                        <th key={index} scope="col" className="px-6 py-4">
                                            {col.Field}
                                        </th>
                                    );
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        {rows?.map((row, index) => {
                            return (
                                <tr
                                    key={index}
                                    className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600"
                                >
                                    <td className="w-4 p-4">
                                        <div className="flex items-center">
                                            <input
                                                id="checkbox-table-search-1"
                                                type="checkbox"
                                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                                                checked={selectedRowMap[index] || false}
                                                onChange={(e) =>
                                                    setSelectedRowMap((prev) => ({
                                                        ...prev,
                                                        [index]: e.target.checked,
                                                    }))
                                                }
                                            />
                                            <label htmlFor="checkbox-table-search-1" className="sr-only">
                                                checkbox
                                            </label>
                                        </div>
                                    </td>
                                    <td className="w-4 h-4 text-center text-gray-950">{index + 1}</td>
                                    {Object.values(row).map((item: any, index: number) => {
                                        if (index < 8)
                                            return (
                                                <td key={index} className="px-6 py-4">
                                                    {truncateWithEllipsis(
                                                        typeof item === 'string'
                                                            ? item
                                                            : typeof item === 'number' || typeof item === 'boolean'
                                                              ? item.toString()
                                                              : '',
                                                        columns?.length! > 7 ? 15 : 20
                                                    )}
                                                </td>
                                            );
                                    })}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </>
    );
}

function SkeletonTable() {
    return (
        <>
            <div className="py-6 bg-gray-50 dark:bg-gray-700 dark:text-gray-400"></div>
            <div
                role="status"
                className="w-full space-y-5 rounded border-gray-200 divide-y divide-gray-200 dark:divide-gray-700 dark:border-gray-700"
            >
                {Array.from({ length: 10 }).map((_, index) => (
                    <div key={index} className="flex items-center justify-between pt-5 animate-pulse">
                        <div>
                            <div className="w-2/3 h-2.5 mb-2.5 bg-gray-300 rounded-full dark:bg-gray-600" />
                            <div className="w-96 h-2 bg-gray-200 rounded-full dark:bg-gray-700" />
                        </div>
                        <div className="w-12 h-2.5 bg-gray-300 rounded-full dark:bg-gray-700" />
                    </div>
                ))}
                <span className="sr-only">Loading...</span>
            </div>
        </>
    );
}
