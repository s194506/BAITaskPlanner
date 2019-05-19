const fs = require('fs');
const fsp = fs.promises;
const exec = require('child_process').exec;
const { execAsync, insertBefore, copyRecursively, modifyFileContents } = require('./__utils');

(async () => {
    await fsp.access('.')

    
    const rx = /platform=(android|ios|browser)/;
    const platform = (rx.exec((process.argv.find(a => rx.test(a)) || '')) || [])[1];

    if (!platform) {
        console.log('platform is not specified');
        return;
    }


    const progress = {
        logStart: true,
        scriptStage: '',
        deferredStages: [],
        curStageIndex: 0,
        runDeferredStages() {
            for (let deferredStageStruct of progress.deferredStages) {
                try {
                    this.curStageIndex++
                    if (this.logStart) console.log(`deferred stage ${this.curStageIndex}. ${deferredStageStruct.scriptStage}`)
                    deferredStageStruct.callback();
                } catch (e) {
                    this.stageError(e);
                }
            }
        },
        startStage(scriptStage) {
            this.curStageIndex++;
            if (this.logStart) console.log(`stage ${this.curStageIndex}. ${scriptStage}`)
            this.scriptStage = scriptStage;
        },
        addDeferredStage(scriptDeferredStage, callback) {
            this.deferredStages.push({scriptStage:scriptDeferredStage, callback});
        },
        stageError(e) {
            console.error(`Error occured on stage '${this.scriptStage}'\r\n${e}`)
        }
    }
    
    try {
        if (!process.argv.includes('--only-upload')) {
            {
                progress.startStage('making unrefined production build (npm build)');
                process.env.PUBLIC_URL = './';
                await execAsync('npm run build');
            }

            {
                progress.startStage('inserting <script src=cordova.js> in builded index.html');
                await modifyFileContents('./build/index.html', contents => insertBefore(contents/*.replace(/="\//g,'="')*/, "<script", `<script type="text/javascript" src="cordova.js"></script>`));
            }

            {
                progress.startStage('copying /build to /www');
                
                await execAsync('rmdir /Q /S www');
                await new Promise(r=>setTimeout(r,5000))
                await copyRecursively('./build','./www', (_1,fileOrDirName,_3,isDirectory) => !isDirectory || !fileOrDirName.includes('cordova-'));
            }

            {
                progress.startStage('changing config.xml to load local files');
                
                await fsp.copyFile('./config.xml', './config-tmp.xml');
                progress.addDeferredStage('restoring config.xml', async () => {
                    await fsp.copyFile('./config-tmp.xml', './config.xml');
                    await fsp.unlink('./config-tmp.xml');
                });

                await modifyFileContents( './config.xml', contents => {
                    const replaceWhat = (/<!--for-development-->[\S\s]+?<!--\/for-development-->/.exec(contents) || [])[0];
                    const replaceWith = (/<!--for-production([\S\s]+?)-->/.exec(contents) || [])[1];
                    if (!replaceWhat) throw new Error(`No 'for-development' part in config.xml`);
                    if (!replaceWith) throw new Error(`No 'for-production' part in config.xml`);
                    return contents.replace(replaceWhat, replaceWith);
                })
            }
            {
                progress.startStage(`making production cordova build (cordova build ${platform}) (may take a while)`);
                await execAsync(`cordova build ${platform}`);
            }
        }

        if (!process.argv.includes('--skip-upload')) {
            {
                progress.startStage(`uploading build to device (cordova run ${platform} --device --nobuild)`);
                await execAsync(`cordova run ${platform} --device --nobuild`);
            }
        }


    } catch(e) {
        progress.stageError(e);
    } finally {
        progress.runDeferredStages();
    }
})()

