/**
 * Created by josh on 1/10/17.
 */
var fs = require('fs');
var paths = require("path");

var BUILD = "build";

Promise.all([
    //rmdir(BUILD),
    mkdir(BUILD),
    copyFilesTo(["demo.html"],BUILD),
    copyFilesTo(["css","imgs",'js'],BUILD),
    //copyFilesTo(['js'],BUILD),
]).then(()=>{
    copyFilesTo(["node_modules/csshake/dist/csshake.css"],paths.join(BUILD,'css'), {flatten:true});
    copyFilesTo(["node_modules/pubnub/dist/web/pubnub.js"],paths.join(BUILD,'js'), {flatten:true});
}).catch((e)=>{
    console.log("error",e);
}).then(()=>{
    console.log("finished with the build");
});



function mkdir(str) {
    return new Promise((res,rej)=>{
        console.log("doing mkdir",str);
        try {
            fs.mkdirSync(str);
        } catch(e) {
            console.log(e.message);
        }
        res();
    });
}

function copyFilesTo(files, outdir,options) {
    if(!options) {
        options = { flatten: false};
    }
    return Promise.all(files.map((file)=>{
        return copyPath('./',file,outdir,options);
    }));
}

function copyPath(prefix, path, outdir, options) {
    console.log("checking",prefix,path,outdir);
    if(fs.statSync(paths.join(prefix,path)).isDirectory()) {
        return copyDir(prefix,path,outdir,options);
    } else {
        return new Promise((res,rej) => {
            var src = paths.join(prefix,path);
            var dst = paths.join(outdir,prefix,path);
            if(options && options.flatten === true) {
                console.log("do a flatten");
                dst = paths.join(outdir,paths.basename(path));
            }
            console.log("copy",src,'to',dst);
            fs.createReadStream(src).pipe(fs.createWriteStream(dst)).on('close',res);
        })
    }

}

function copyDir(prefix,path,outdir,options) {
    return new Promise((res,rej)=>{
        fs.readdir(paths.join(prefix,path),(err,files)=>{
            console.log("mkdir",paths.join(outdir,prefix,path));
            try { fs.mkdirSync(paths.join(outdir,prefix,path)) } catch (e) { console.log(e.message)}
            return Promise.all(files.map((file)=>{
                return copyPath(paths.join(prefix,path), file, paths.join(outdir),options);
            })).then(res);
        });
    });
}




//copyPath(".","css","build").then(()=>{
//    console.log("we are done");
//});