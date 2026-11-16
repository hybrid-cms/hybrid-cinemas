const db=window.supabase.createClient(window.HC_SUPABASE_URL,window.HC_SUPABASE_PUBLISHABLE_KEY);
const root=document.getElementById("movieDetail");
function safe(s){try{const u=new URL(s);return ["http:","https:"].includes(u.protocol)?u.href:""}catch(e){return ""}}
function esc(s){return String(s||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
async function start(){
 const id=new URLSearchParams(location.search).get("id");
 if(!id){root.textContent="Movie ID missing.";return}
 const {data:m,error}=await db.from("movies").select("id,title,language,release_year,genre,poster_url,watch_url,description,episodes,episodes_jsonb,published").eq("id",id).eq("published",true).maybeSingle();
 if(error||!m){root.textContent="Movie not found.";return}
 document.title=m.title+" — HYBRID CINEMAS";
 const poster=safe(m.poster_url),download=safe(m.watch_url);
 const episodes=Array.isArray(m.episodes_jsonb)&&m.episodes_jsonb.length?m.episodes_jsonb:(Array.isArray(m.episodes)?m.episodes:[]);
 let ep="";
 for(const e of episodes){const link=safe(e.url);if(link)ep+='<a class="episode-link" href="'+link+'" target="_blank" rel="noopener noreferrer"><span>'+esc(e.season||"")+' '+esc(e.title||"Episode")+'</span><b>OPEN ↗</b></a>'}
 root.className="";
 root.innerHTML='<article class="detail-card"><div>'+(poster?'<img class="detail-poster" src="'+poster+'" alt="">':'')+'</div><div><p class="eyebrow">'+esc(m.language)+' · '+esc(m.release_year)+' · '+esc(m.genre)+'</p><h1>'+esc(m.title)+'</h1><p>'+esc(m.description)+'</p>'+(download?'<a class="download-hybrid" href="'+download+'" target="_blank" rel="noopener noreferrer">DOWNLOAD FROM HYBRID ↓</a>':'<p class="warning">Authorized download link not added yet.</p>')+(ep?'<section class="detail-episodes"><h2>Episodes</h2>'+ep+'</section>':"")+'</div></article>';
}
start().catch(e=>{console.error(e);root.textContent="Unable to load movie details.";});