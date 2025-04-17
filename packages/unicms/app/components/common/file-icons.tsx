import { FolderColored, UnknownFileColored, JsonFileColored, TextFileColored } from '../svg';

const fileTypesToIcon = {
    folder: FolderColored,
    unknown: UnknownFileColored,
    js: JsonFileColored,
    json: JsonFileColored,
    txt: TextFileColored,
    md: TextFileColored,
};

function getFileTypeIcon(type: FileSystemItem, extension: string) {
    let FileIcon: React.ComponentType | null = null;
    if (type === 'folder') {
        FileIcon = fileTypesToIcon.folder;
    } else if (type === 'file' && extension !== 'folder') {
        FileIcon = fileTypesToIcon[extension] || fileTypesToIcon.unknown;
    }
    return FileIcon ? <FileIcon /> : null;
}

export { fileTypesToIcon, getFileTypeIcon };
