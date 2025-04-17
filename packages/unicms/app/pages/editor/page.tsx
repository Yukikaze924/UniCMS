import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import Editor from '@monaco-editor/react';
import { loader } from '@monaco-editor/react';
import { fileSystemService } from '@/app/api/services';

import * as monaco from 'monaco-editor';
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';

loader.config({
    monaco,
});

self.MonacoEnvironment = {
    getWorker(_, label) {
        if (label === 'json') {
            return new jsonWorker();
        }
        if (label === 'css' || label === 'scss' || label === 'less') {
            return new cssWorker();
        }
        if (label === 'html' || label === 'handlebars' || label === 'razor') {
            return new htmlWorker();
        }
        if (label === 'typescript' || label === 'javascript') {
            return new tsWorker();
        }
        return new editorWorker();
    },
};

export default function Page() {
    const [filePath, setFilePath] = useState<string>();
    const [language, setLanguage] = useState<string>('plaintext');
    const [fileString, setFileString] = useState<string>('');
    const [newString, setNewString] = useState<string | undefined>(undefined);
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const filepath = searchParams.get('path');
        if (filepath) {
            setFilePath(filepath);
        }
    }, []);

    useEffect(() => {
        if (filePath) {
            const ext = filePath.split('.').pop() || '';
            setLanguage(extToLanguage(ext));
            fileSystemService.readFile(filePath).then((data) => setFileString(data));
        }
    }, [filePath]);

    const handleSave = async (value?: string) => {
        setNewString(value);
    };

    if (filePath && language && fileString)
        return (
            <>
                <div className="h-screen">
                    <div className="h-10 bg-neutral-50"></div>
                    <div className="w-full h-[calc(100vh-40px)]">
                        <Editor
                            width="100%"
                            height="100vh"
                            defaultLanguage={language}
                            value={fileString}
                            theme="vs" // 支持 vs, vs-dark, hc-black
                            onChange={handleSave}
                            options={{
                                minimap: { enabled: true }, // 右侧缩略图
                                lineNumbers: 'on', // 行号
                                roundedSelection: false,
                                scrollBeyondLastLine: false,
                                automaticLayout: true, // 自动调整布局
                                cursorBlinking: 'smooth', // 光标动画
                                tabSize: 4, // 缩进空格
                                autoClosingBrackets: 'always',
                                find: {
                                    addExtraSpaceOnTop: false,
                                },
                            }}
                        />
                    </div>
                </div>
            </>
        );
}

// 扩展名到语言映射
function extToLanguage(ext: string): string {
    const mapping: Record<string, string> = {
        js: 'javascript',
        ts: 'typescript',
        py: 'python',
        java: 'java',
        go: 'go',
        rs: 'rust',
        html: 'html',
        css: 'css',
        json: 'json',
        // 添加更多类型...
    };
    return mapping[ext] || 'plaintext';
}
