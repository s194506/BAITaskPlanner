const fs = require('fs');
const fsp = fs.promises;
const exec = require('child_process').exec;


module.exports = {
  stealThings,
  copyRecursively,
  getExt,
  getFilename,
  execAsync,
  insertBefore,
  modifyFileContents
}


/**
 * @param {({from:string, to:string, filterCB?: (fileOrDirPath:string, fileOrDirName:string, ext:string, isDirectory:boolean) => boolean})[]} whatToSteal 
 */
async function stealThings(whatToSteal) {
  if (!Array.isArray(whatToSteal)) whatToSteal = [whatToSteal];
  
  for (const stealDeal of whatToSteal) {
    await copyRecursively(stealDeal.from, stealDeal.to, stealDeal.filterCB)
  }
}

/**
 * Copies a directory recursively or a file
 * 
 * @param {string} from 
 * @param {string} to 
 * @param {(fileOrDirPath:string, fileOrDirName:string, ext:string, isDirectory:boolean) => boolean} filterCB 
 */
async function copyRecursively(from, to, filterCB = () => true) {
  const stats = (await fsp.stat(from));

  if (stats.isDirectory()) {
    await fsp.mkdir(to, {recursive:true});

    const list = await fsp.readdir(from);
    for (const fileOrDir of list) {
      if (filterCB(`${from}/${fileOrDir}`, fileOrDir, '', true)) 
        await copyRecursively(`${from}/${fileOrDir}`, `${to}/${fileOrDir}`, filterCB);
    }
  } else {
    if (filterCB(from, getFilename(from), getExt(from), false)) 
      await fsp.copyFile(from, to)
  }
  
  // const list = await fsp.readdir(from);
  // for (const fileOrDir of list) {
  //   if ((await fsp.stat(fileOrDirFromPath)).isDirectory()) {
  //     console.log(`copying dir ${fileOrDirFromPath} to ${fileOrDirToPath}`)
  //   } else {
  //     console.log(`copying ${fileOrDirFromPath} to ${fileOrDirToPath}`)
  //   }
  // }
}

/**
 * 
 * @param {string} filePath 
 * @returns {string}
 */
function getExt(filePath) {
  return ((/\.([a-zA-Z0-9]+)$/.exec(filePath) || [])[1] || '').toLowerCase();
}

/**
 * 
 * @param {string} filePath 
 * @returns {string}
 */
function getFilename(filePath) {
  return (/(?:^|\/)([^\/]*)$/.exec(filePath) || [])[1] || '';
}

function execAsync(command) {
  return new Promise( (resolve,reject) => {
    exec(command, (err,stdout,stderr) => {
      if (err) {
        reject(err);
        return;
      }
      if (stderr && stderr.toLowerCase().includes('error')) {
        reject(stderr);
        return;
      }
      resolve(resolve);
    }) 
  });
}

/**
 * 
 * @param {string} fullContent 
 * @param {string} beforeWhat 
 * @param {string} newContent 
 * @param {boolean} addNewLines 
 */
function insertBefore(fullContent, beforeWhat, newContent, addNewLines = false) {
  const position = fullContent.indexOf(beforeWhat);
  return fullContent.slice(0, position) + (addNewLines ? '\r\n' : '') + newContent + (addNewLines ? '\r\n' : '') + fullContent.slice(position);
}


/**
 * 
 * @param {string} filePath
 * @param {(contents:string) => string} callback
 */
async function modifyFileContents(filePath, callback) {
  const contents = await fsp.readFile(filePath);
  await fsp.writeFile(filePath, callback(contents.toString()));
}