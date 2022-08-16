/**
 *
 */
export function projectListDir(): string {
    return "./server/projects";
}

/**
 *
 * @param projectName
 */
export function projectDir(projectName: string): string {
    return projectListDir() + "/" + projectName;
}

/**
 *
 * @param projectName
 */
export function projectDistDir(projectName: string): string {
    return projectDir(projectName) + "/dist";
}

/**
 *
 * @param projectName
 */
export function projectPdfPath(projectName: string): string {
    return "./output/" + projectName + ".pdf";
}
