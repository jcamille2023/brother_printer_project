
import { execSync, exec } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
function getPrinterStatus(pid) {
    let status;
    let stdout = String(execSync(`brother_ql -p ${pid} status`));
    let match = stdout.match(/Phase: (?<status>.+)/,);
    let match2 = stdout.match(/Media size: (?<width>[0-9]+) x (?<length>[0-9]+) mm/)
    if(match != null) status = {status: match.groups.status, width:match2.groups.width,length:match2.groups.length};
    else status = null;
    return status
}
async function getAvailableLabels() {
    return readdirSync("../../labels")
}
async function discoverPrinters() {
    let matches = [];
    await exec("brother_ql discover",(error,stdout,stderr) => {
        if(error != null) {matches = null; return;}
        let data = String(stdout)
        
         data.split("\n").forEach(async (item) => {
            let match = item.match(/Found a label printer at: (?<id>.+) \((?<model>.+)\)/)
            if(match != null) {
                matches.push({model:match.groups.model,id:match.groups.id,status:getPrinterStatus(match.groups.id)});
                console.log(matches)
            }
        });
        console.log(stdout)
        
        
    });
    return matches
}

function print(pid, filename, model, width, copies, options) {
    try {
        for(let i = 0; i < copies; i++) {
            if(options.ws) {
                ws.emit("printing event","copy #" + i+1)
            }
            execSync(`brother_ql -m "${model}" -p "${pid}" print "../../labels/${filename}" -l "${width}" ${options.rotation ? "-r " + options.rotation : null}`)
            if(options.ws) {
                ws.emit("success","printing copy #" + i+1)
            }
        }
    } catch(error) {
        console.error(error)
    }
}

export {discoverPrinters, getPrinterStatus, getAvailableLabels, print}