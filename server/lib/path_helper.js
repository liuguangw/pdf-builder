/**
 *
 * @return {string}
 */
export function projectListDir() {
    return "./server/projects";
}

/**
 *
 * @param {string} projectName
 * @return {string}
 */
export function projectDir(projectName) {
    return projectListDir() + "/" + projectName;
}

/**
 *
 * @param {string} projectName
 * @return {string}
 */
export function projectDistDir(projectName) {
    return projectDir(projectName) + "/dist";
}

/**
 *
 * @param {string} projectName
 * @return {string}
 */
export function projectPdfPath(projectName) {
    return "./output/" + projectName + ".pdf";
}
