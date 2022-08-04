/**
 *
 * @param {string} projectName
 * @return {string}
 */
export function projectDir(projectName) {
    return "./server/projects/" + projectName;
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
