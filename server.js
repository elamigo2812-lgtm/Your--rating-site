// Simple consent-based selfie upload server.
// Requires Node.js 18+. Photos are stored in ./uploads.
// Deploy only with HTTPS, and tell visitors who receives and keeps their photos.
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const root = __dirname;
const uploads = path.join(root, 'uploads');
fs.mkdirSync(uploads, {recursive:true});
const MAX = 8 * 1024 * 1024;

const server = http.createServer((req,res)=>{
  const send=(status,body,type='text/plain; charset=utf-8')=>{
    res.writeHead(status,{'Content-Type':type,'X-Content-Type-Options':'nosniff','Cache-Control':'no-store'});
    res.end(body);
  };
  if(req.method==='GET' && (req.url==='/' || req.url==='/index.html')){
    fs.readFile(path.join(root,'index.html'),(err,data)=>err?send(500,'Page unavailable'):send(200,data,'text/html; charset=utf-8'));
    return;
  }
  if(req.method==='POST' && req.url==='/upload'){
    const chunks=[];let size=0;
    req.on('data',chunk=>{
      size+=chunk.length;
      if(size>MAX){send(413,'Photo too large');req.destroy();return;}
      chunks.push(chunk);
    });
    req.on('end',()=>{
      const body=Buffer.concat(chunks);
      const boundaryMatch=(req.headers['content-type']||'').match(/boundary=(?:"([^"]+)"|([^;]+))/);
      if(!boundaryMatch) return send(400,'Invalid upload');
      const boundary=Buffer.from('--'+(boundaryMatch[1]||boundaryMatch[2]));
      let start=body.indexOf(boundary);
      let saved=null;
      while(start!==-1){
        let headStart=start+boundary.length+2;
        let headEnd=body.indexOf(Buffer.from('\r\n\r\n'),headStart);
        if(headEnd<0) break;
        const headers=body.slice(headStart,headEnd).toString('utf8');
        let dataStart=headEnd+4;
        let end=body.indexOf(boundary,dataStart);
        if(end<0) break;
        let dataEnd=end-2;
        if(/name="selfie"/.test(headers)){
          const mime=(headers.match(/Content-Type:\s*([^\r\n]+)/i)||[])[1]||'';
          if(!mime.toLowerCase().startsWith('image/')) return send(415,'Image required');
          const image=body.slice(dataStart,dataEnd);
          // Only accept JPEG/PNG/WebP magic bytes, regardless of supplied filename.
          const jpeg=image.length>3 && image[0]===0xff && image[1]===0xd8 && image[2]===0xff;
          const png=image.length>8 && image.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
          const webp=image.length>12 && image.toString('ascii',0,4)==='RIFF' && image.toString('ascii',8,12)==='WEBP';
          if(!(jpeg||png||webp)) return send(415,'Unsupported image');
          const id=crypto.randomBytes(8).toString('hex');
          const ext=jpeg?'.jpg':png?'.png':'.webp';
          fs.writeFileSync(path.join(uploads,id+ext),image,{flag:'wx'});
          saved=id+ext;break;
        }
        start=end;
      }
      if(!saved) return send(400,'No selfie found');
      send(200,JSON.stringify({id:saved}), 'application/json; charset=utf-8');
    });
    return;
  }
  send(404,'Not found');
});
const port=process.env.PORT||3000;
server.listen(port,'0.0.0.0',()=>console.log(`Selfie Rating running on port ${port}`));
