import WebSocket, { WebSocketServer } from 'ws';
import fs from "node:fs"
import { discoverPrinters, getPrinterStatus, getAvailableLabels, print } from './printer_interface.js';
function initServer() {
    const wss = new WebSocketServer({
        port: 8000,
        perMessageDeflate: {
          zlibDeflateOptions: {
            // See zlib defaults.
            chunkSize: 1024,
            memLevel: 7,
            level: 3
          },
          zlibInflateOptions: {
            chunkSize: 10 * 1024
          },
          // Other options settable:
          clientNoContextTakeover: true, // Defaults to negotiated value.
          serverNoContextTakeover: true, // Defaults to negotiated value.
          serverMaxWindowBits: 10, // Defaults to negotiated value.
          // Below options specified as default values.
          concurrencyLimit: 10, // Limits zlib concurrency for perf.
          threshold: 1024 // Size (in bytes) below which messages
          // should not be compressed if context takeover is disabled.
        }
      });
      wss.on('connection', async (ws) => {
        ws.emit("success","Connection success!");
        console.log("Connection initiated")
        ws.emit("printers",await JSON.stringify(discoverPrinters()))
        ws.on('status request', async (pid) => {
            ws.emit("status",await getPrinterStatus(pid))
        });
        print("usb://0x04f9:0x209b/000D3G609949","Max Bakery and.bmp","QL-800",62,200,{rotation: 90})
        ws.on('available labels request',() => {
            ws.emit('available labels', getAvailableLabels());
        })
        ws.on('print request', (pid,filename,model,width,copies,options) => {
            options.ws = ws;
            print(pid,filename,model,width,copies,options)
        } );
        })
}

export {initServer}
