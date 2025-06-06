import { useEffect, useRef, useState } from 'react';
import { getExtension } from '@unicms/helpers/string';
import { getFileTypeIcon } from '../common/file-icons';

export default function ItemInEdit({
    type,
    defaultValue,
    onEnter,
    onCancel,
}: {
    type: FileSystemItem;
    defaultValue: string;
    onEnter: (str: string) => void;
    onCancel: () => void;
}) {
    const [contentEditing, setContentEditing] = useState<string>(defaultValue);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            onEnter(contentEditing);
        } else if (e.key === 'Escape') {
            onCancel();
        }
    };

    useEffect(() => {
        if (inputRef && inputRef.current) {
            inputRef.current.focus();
        }
    }, [inputRef]);

    return (
        <>
            <div
                className="fixed inset-0 z-40"
                onClick={() => {
                    if (!contentEditing) {
                        onCancel();
                    } else {
                        onEnter(contentEditing);
                    }
                }}
            ></div>
            <div className="z-50 block relative w-full max-w-[324px]">
                <div className="block">
                    <div className="aspect-video rounded-xl border shadow overflow-hidden bg-gray-50">
                        {getFileTypeIcon(type, getExtension(contentEditing) || '')}
                    </div>
                    <div className="p-2 space-y-1">
                        <div className="flex items-start justify-between gap-4">
                            <div className="relative w-full">
                                <input
                                    ref={inputRef}
                                    className="peer w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
                                    onChange={(e) => setContentEditing(e.target.value)}
                                    defaultValue={defaultValue}
                                    onKeyDown={handleKeyDown}
                                />
                            </div>
                        </div>
                        <p className="text-sm text-gray-500"></p>
                    </div>
                </div>
            </div>
        </>
    );
}
