const client=window.supabase.createClient(window.HC_SUPABASE_URL,window.HC_SUPABASE_PUBLISHABLE_KEY);
const $=id=>document.getElementById(id);
let currentUser=null;
function esc(s=""){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function status(message){$("saveStatus").textContent=message}
function showAdmin(){ $("loginView").classList.add("hidden");$("adminView").classList.remove("hidden");renderList();renderRequests() }
function showLogin(message=""){ $("adminView").classList.add("hidden");$("loginView").classList.remove("hidden");$("loginError").textContent=message }
async function signIn(e){e.preventDefault();$("loginError").textContent="Signing in…";const {data,error}=await client.auth.signInWithPassword({email:$("email").value.trim(),password:$("password").value});if(error){showLogin(error.message);return}currentUser=data.user;showAdmin()}
$("loginForm").addEventListener("submit",signIn);
async function init(){const {data}=await client.auth.getSession();if(data.session){currentUser=data.session.user;showAdmin()}else showLogin()}
init();
$("logout").addEventListener("click",async()=>{await client.auth.signOut();currentUser=null;showLogin("You have signed out.")});
function reset(){$("movieForm").reset();$("movieId").value="";$("published").checked=true;$("formTitle").textContent="Add a movie";status("")}
$("resetForm").addEventListener("click",reset);
let adminMovies=[];
function filterAdminMovies(){
 const q=($("movieSearch")?.value||"").trim().toLowerCase();
 const filtered=adminMovies.filter(m=>[m.title,m.language,m.release_year,m.genre].some(v=>String(v||"").toLowerCase().includes(q)));
 const list=$("adminList");
 list.innerHTML=filtered.length?filtered.map(m=>`<div class="admin-row"><div><strong>${esc(m.title)}</strong><br><small>${esc(m.language)} · ${esc(m.release_year||"Year not set")} · ${m.published?"Published":"Unpublished"} · ${Array.isArray(m.episodes)?m.episodes.length:0} episodes</small></div><div class="admin-actions"><button class="plain-btn secondary" data-edit="${m.id}">Edit</button><button class="plain-btn secondary" data-delete="${m.id}">Delete</button></div></div>`).join(""):"<p class='warning'>No matching movies found.</p>";
 $("movieSearchCount").textContent=q?`Showing ${filtered.length} of ${adminMovies.length} movies`:`${adminMovies.length} movies in library`;
 list.querySelectorAll("[data-edit]").forEach(b=>b.addEventListener("click",()=>editMovie(b.dataset.edit)));
 list.querySelectorAll("[data-delete]").forEach(b=>b.addEventListener("click",()=>deleteMovie(b.dataset.delete)));
}

async function renderRequests(){
 const box=$("requestList");if(!box||!currentUser)return;
 box.innerHTML="<p class='warning'>Loading requests…</p>";
 const {data,error}=await client.from("movie_requests").select("*").order("created_at",{ascending:false});
 if(error){box.innerHTML=`<p class="warning">${esc(error.message)}. Run supabase-movie-requests.sql in Supabase SQL Editor.</p>`;return}
 if(!data?.length){box.innerHTML="<p class='warning'>No movie requests yet.</p>";return}
 box.innerHTML=data.map(r=>`<article class="request-admin-row"><div><strong>${esc(r.movie_title)}</strong><p>${esc(r.language)} · ${esc(r.requester_name||"Anonymous")} · ${new Date(r.created_at).toLocaleString()}</p>${r.message?`<p class="request-message">${esc(r.message)}</p>`:""}</div><div class="request-admin-actions"><select data-request-status="${r.id}" aria-label="Request status"><option ${r.status==="Pending"?"selected":""}>Pending</option><option ${r.status==="Reviewed"?"selected":""}>Reviewed</option><option ${r.status==="Added"?"selected":""}>Added</option><option ${r.status==="Unavailable"?"selected":""}>Unavailable</option></select><button class="plain-btn secondary" data-request-delete="${r.id}" type="button">Delete</button></div></article>`).join("");
 box.querySelectorAll("[data-request-status]").forEach(s=>s.addEventListener("change",async()=>{const {error}=await client.from("movie_requests").update({status:s.value}).eq("id",s.dataset.requestStatus);if(error){alert("Could not update request: "+error.message);renderRequests()}}));
 box.querySelectorAll("[data-request-delete]").forEach(b=>b.addEventListener("click",async()=>{if(!confirm("Delete this movie request?"))return;const {error}=await client.from("movie_requests").delete().eq("id",b.dataset.requestDelete);if(error){alert("Could not delete request: "+error.message);return}renderRequests()}));
}
async function renderList(){
 const list=$("adminList");if(!list||!currentUser)return;
 list.innerHTML="<p class='warning'>Loading movies…</p>";
 const {data,error}=await client.from("movies").select("*").order("created_at",{ascending:false});
 if(error){list.innerHTML=`<p class="warning">${esc(error.message)}</p>`;return}
 adminMovies=(data||[]).map(m=>({...m,episodes:Array.isArray(m.episodes)?m.episodes:[]}));
 filterAdminMovies();
}
$("movieSearch")?.addEventListener("input",filterAdminMovies);
async function editMovie(id){const {data,error}=await client.from("movies").select("*").eq("id",id).single();if(error){status(error.message);return}$("movieId").value=data.id;$("title").value=data.title;$("language").value=data.language;$("year").value=data.release_year||"";$("genre").value=data.genre||"";$("poster").value=data.poster_url||"";$("videoUrl").value=data.watch_url||"";$("episodes").value=(Array.isArray(data.episodes)?data.episodes:[]).map(e=>`${e.season||"Season 1"} | ${e.title||"Episode"} | ${e.url||""}`).join("\n");$("description").value=data.description||"";$("published").checked=!!data.published;$("formTitle").textContent="Edit movie";window.scrollTo({top:0,behavior:"smooth"})}
async function deleteMovie(id){if(!confirm("Delete this movie from the shared catalogue?"))return;const {error}=await client.from("movies").delete().eq("id",id);if(error){status(error.message);return}status("Movie deleted.");renderList()}
$("movieForm").addEventListener("submit",async e=>{e.preventDefault();if(!currentUser){showLogin("Please sign in again.");return}const episodes=[];for(const [i,line] of $("episodes").value.split("\n").entries()){if(!line.trim())continue;const parts=line.split("|").map(x=>x.trim());if(parts.length!==3||!parts[0]||!parts[1]||!/^https?:\/\//i.test(parts[2])){status(`Episode line ${i+1} is invalid. Use: Season 1 | Episode 1 | https://...`);return}episodes.push({season:parts[0],title:parts[1],url:parts[2]})}const item={title:$("title").value.trim(),language:$("language").value,release_year:$("year").value?Number($("year").value):null,genre:$("genre").value.trim()||null,poster_url:$("poster").value.trim()||null,watch_url:$("videoUrl").value.trim()||null,episodes,description:$("description").value.trim()||null,published:$("published").checked};const id=$("movieId").value;status("Saving…");const result=id?await client.from("movies").update(item).eq("id",id):await client.from("movies").insert(item);if(result.error){status("Could not save: "+result.error.message);return}reset();status("Movie saved to the shared catalogue.");await renderList()});