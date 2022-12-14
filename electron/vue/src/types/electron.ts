export interface FileFilter {
    name: string,
    extensions: string[],
}

export enum showOpenDialogProperty {
    openFile = 'openFile',
    openDirectory = 'openDirectory',
    multiSelections = 'multiSelections',
    showHiddenFiles = 'showHiddenFiles',
    createDirectory = 'createDirectory',
    promptToCreate = 'promptToCreate',
    noResolveAliases = 'noResolveAliases',
    treatPackageAsDirectory = 'treatPackageAsDirectory',
    dontAddToRecent = 'dontAddToRecent'
}

export interface showOpenDialogOptions {
    title?: string,
    defaultPath?: string,
    buttonLabel?: string,
    filters?: FileFilter[],
    properties?: showOpenDialogProperty[],
    message?: string,
    securityScopedBookmarks?: boolean,
}

export interface showOpenDialogResult {
    canceled: boolean,
    filePaths: string[],
    bookmarks?: string[],
}

enum Sha256PfvMode {
    COMPLETE="complete",
    COMPACT="compact",
}

export interface getSha256PfvInfoResult{
    partCount: number,
    partHashLength: number,
    mode: Sha256PfvMode,
    valid: boolean,
    error?: string,
}

export interface verifySha256PfvResult{
    result: boolean,
    valid: boolean,
    error?: string,
}

export interface computeSha256PfvResult{
    result: string,
    valid: boolean,
    error?: string,
}