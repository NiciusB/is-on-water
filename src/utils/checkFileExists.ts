import fs from 'fs'

export default function checkFileExists(file: string) {
    return fs.promises
        .access(file, fs.constants.R_OK)
        .then(() => true)
        .catch(() => false)
}
