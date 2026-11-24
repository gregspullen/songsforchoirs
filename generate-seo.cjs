const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(process.argv[2]||'.');
const ctx={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'data.js'),'utf8'),ctx,{timeout:1000});
const pieces=ctx.window.PIECES, base='https://www.songsforchoirs.com';
const esc=x=>String(x??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#x27;');
const files=fs.readdirSync(root).filter(x=>/^(opus|set)-.*\.html$/.test(x)).sort();
const output=[];
for(const file of files){
 let s=fs.readFileSync(path.join(root,file),'utf8'); const slug=file.replace(/^(opus|set)-/,'').replace(/\.html$/,''); const p=pieces[slug], url=base+'/'+file;
 if(!p){if(!['harvest-time','your-monster-is-your-friend'].includes(slug))throw Error('Missing catalogue entry: '+file);s=s.replaceAll('https://songsforchoirs.com/'+file,url);output.push([file,s]);continue;}
 const set=file.startsWith('set-');if(set!==(p.type==='bundle'))throw Error('Wrong page type '+file);
 const title=p.metaTitle||`${p.title}${set?' — ':' | '}Songs for Choirs`, desc=p.description, cover=base+'/images/Cover_png/'+slug+'.png';if(!desc||!p.title)throw Error('Missing metadata '+file);
 const tags=[`<title>${esc(title)}</title>`,`<meta name="description" content="${esc(desc)}">`,`<link rel="canonical" href="${url}">`,...Object.entries({'og:type':'website','og:site_name':'Songs for Choirs','og:title':title,'og:description':desc,'og:image':cover,'og:url':url}).map(([k,v])=>`<meta property="${k}" content="${esc(v)}">`),...Object.entries({'twitter:card':'summary_large_image','twitter:title':title,'twitter:description':desc,'twitter:image':cover}).map(([k,v])=>`<meta name="${k}" content="${esc(v)}">`)];
 // Only edit the head before the first script, never matching script strings.
 const cut=s.indexOf('<script');if(cut<0)throw Error('Missing script '+file);let head=s.slice(0,cut),tail=s.slice(cut);
 head=head.replace(/^[ \t]*<!-- (?:Default SEO \(populated by JavaScript\)|Composition-specific SEO, generated from data\.js|Catalogue SEO generated from data\.js|Open Graph|Twitter) -->\r?\n/gm,'').replace(/^[ \t]*<title>[^<]*<\/title>\r?\n/gm,'').replace(/^[ \t]*<(?:meta\s+(?:name="(?:description|twitter:[^"]+)"|property="og:[^"]+")|link\s+rel="canonical")[^>]*>\r?\n/gm,'');
 head=head.replace(/(<meta name="viewport"[^>]*>)/,(_,m)=>m+'\n  <!-- Catalogue SEO generated from data.js -->\n  '+tags.join('\n  '));s=head+tail;
 const replace=(re,fn)=>{if(!re.test(s))throw Error('Template mismatch '+file+' '+re);s=s.replace(re,fn);};
 replace(/(<p class="tagline" id="page-tagline">)[\s\S]*?(<\/p>)/,(_,a,b)=>a+esc(p.title)+b);
 if(set){
 const contents='<div class="set-heading">Contents</div>'+p.pieces.map(k=>{if(!pieces[k])throw Error('Missing set member '+k);return `<div>– <a href="opus-${esc(k)}.html">${esc(pieces[k].title)}</a></div>`;}).join('');
 replace(/(<div id="set-links" class="set-links">)[\s\S]*?(?=\s*<\/div>\s*<\/div>\s*<figure)/,(_,a)=>a+contents);
 replace(/if \(container && piece\.pieces\) \{(?:\s*container\.replaceChildren\(\);)?/,()=> 'if (container && piece.pieces) {\n  container.replaceChildren();');
 replace(/<img id="opus-preview-page"[^>]*>/,()=>`<img id="opus-preview-page" src="/images/Cover_png/${slug}.png" alt="${esc(p.title)} cover">`);
 }else{
 replace(/const canonical\s*=\s*[^;]+;/,()=>`const canonical =\n    "${url}";`);s=s.replaceAll('https://songsforchoirs.com/images/Cover_png/','https://www.songsforchoirs.com/images/Cover_png/');
 const glance=p.atAGlance?'<h3>At a glance</h3>'+p.atAGlance.map(i=>`<div class="glance-row"><span class="glance-label">${esc(i.label)}</span><span class="glance-value">${esc(i.value)}</span></div>`).join(''):'';
 replace(/(<div id="atAGlance" class="info-card">)[\s\S]*?(?=<\/div>\s*<audio)/,(_,a)=>a+glance);
 replace(/(<div id="fromComposer" class="info-card">)[\s\S]*?(?=<\/div>\s*<\/div>)/,(_,a)=>a+(p.fromComposer?'<h3>...from the composer</h3><p>'+p.fromComposer+'</p>':''));
 replace(/<source id="audioSrc"[^>]*>/,()=>`<source id="audioSrc" type="audio/mpeg" src="/mp3/${slug}.mp3">`);
 }
 output.push([file,s]);
}
for(const [f,s] of output)fs.writeFileSync(path.join(root,f),s);console.log(`Generated ${output.length} pages (including 2 standalone canonical updates).`);
