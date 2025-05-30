import path from 'path'
import fs from 'fs-extra'

import { shell } from 'electron'

import type { Dirent } from 'fs'
import type { UncheckedLabwareFile } from '@opentrons/app/src/redux/custom-labware/types'

const RE_JSON_EXT = /\.json$/i

export function readLabwareDirectory(dir: string): Promise<string[]> {
  const absoluteName = (e: Dirent): string => path.join(dir, e.name)

  return fs.readdir(dir, { withFileTypes: true }).then((entries: Dirent[]) => {
    const jsonFiles = entries
      .filter(e => e.isFile() && RE_JSON_EXT.test(e.name))
      .map(absoluteName)

    const getNestedFiles = Promise.all(
      entries
        .filter(e => e.isDirectory())
        .map(absoluteName)
        .map(readLabwareDirectory)
    )

    return getNestedFiles.then(nested => {
      const nestedFiles: string[] = nested.flat()
      return [...jsonFiles, ...nestedFiles]
    })
  })
}

export function parseLabwareFiles(
  filesOrContent: string | string[]
): Promise<UncheckedLabwareFile[]> {
  if (typeof filesOrContent === 'string') {
    return new Promise((resolve, reject) => {
      try {
        const data = JSON.parse(filesOrContent)
        const modified = Date.now()
        const filename = `${data.parameters?.loadName}.json` ?? 'unknown_file'

        resolve([{ filename, modified, data }])
      } catch (error) {
        reject(error)
      }
    })
  } else if (Array.isArray(filesOrContent)) {
    const tasks = filesOrContent.map(f => {
      const readTask = fs.readJson(f, { throws: false })
      const statTask = fs.stat(f)

      return Promise.all([readTask, statTask]).then(([data, stats]) => ({
        filename: f,
        modified: stats.mtimeMs,
        data,
      }))
    })

    return Promise.all(tasks)
  } else {
    return Promise.reject(
      new Error(
        'Invalid input: expected an inported file or data from App Labware Creator'
      )
    )
  }
}

// get a filename, adding an incrementor to avoid collisions
const getFileName = (
  dir: string,
  base: string,
  ext: string,
  count = 0
): Promise<string> => {
  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  const basename = `${base}${count || ''}${ext}`
  const name = path.join(dir, basename)

  return fs
    .pathExists(name)
    .then((exists: boolean) =>
      exists ? getFileName(dir, base, ext, count + 1) : name
    )
}

export function addLabwareFile(file: string, dir: string): Promise<void> {
  const extname = path.extname(file)
  const basename = path.basename(file, extname)

  return getFileName(dir, basename, extname).then(destName =>
    fs.readJson(file).then(data => fs.outputJson(destName, data))
  )
}

export function addLabwareFileFromCreator(
  fileContent: string,
  dir: string,
  fileName: string
): Promise<void> {
  const extname = path.extname(fileName)
  const basename = path.basename(fileName, extname)

  return getFileName(dir, basename, extname).then(destName => {
    const data = JSON.parse(fileContent)
    return fs.outputJson(destName, data)
  })
}

export function removeLabwareFile(file: string): Promise<void> {
  return shell.trashItem(file).catch(() => fs.unlink(file))
}
