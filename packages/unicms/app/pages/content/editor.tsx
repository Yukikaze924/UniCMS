import { Editor } from '@monaco-editor/react';
import { useEffect, useState } from 'react';
import { loader } from '@monaco-editor/react';

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

function SchemaEditor({ collection }: { collection: Collection }) {
    const [codeString, setCodeString] = useState<string>('');

    useEffect(() => {
        setCodeString(JSON.stringify(collection, null, '\t'));
    }, [collection]);

    const handleSave = (value?: string) => {};

    return (
        <>
            <div className="h-screen">
                <div className="h-10 bg-neutral-50"></div>
                <div className="w-full h-[calc(100vh-40px)]">
                    <Editor
                        width="100%"
                        height="100%"
                        defaultLanguage="json"
                        value={codeString}
                        theme="vs" // 支持 vs, vs-dark, hc-black
                        onChange={handleSave}
                        options={{
                            readOnly: true,
                            readOnlyMessage: { value: 'Schema Editor is in readonly mode' },
                            minimap: { enabled: false }, // 右侧缩略图
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

export default SchemaEditor;
