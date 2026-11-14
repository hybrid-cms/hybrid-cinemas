const KEY="hybrid_cinemas_movies_v1";
// DEMO ONLY: this client-side password is visible in source and is NOT real security.
// Replace this prototype with server-side authentication before public deployment.
const DEMO_PASSWORD="change-this-before-deploy";
const $=id=>document.getElementById(id);
function movies(){try{return JSON.parse(localStorage.getItem(KEY))||[]}catch{return []}}
function save(items){localStorage.setItem(KEY,JSON.stringify(items))}
function esc(s=""){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function showAdmin(){$("loginView").classList.add("hidden");$("adminView").classList.remove("hidden");renderList()}
$("loginForm").addEventListener("submit",e=>{e.preventDefault();if($("password").value===DEMO_PASSWORD){sessionStorage.setItem("hc_demo_admin","yes");showAdmin()}else{$("loginError").textContent="Incorrect demo password."}});
if(sessionStorage.getItem("hc_demo_admin")==="yes")showAdmin();
$("logout").addEventListener("click",()=>{sessionStorage.removeItem("hc_demo_admin");$("adminView").classList.add("hidden");$("loginView").classList.remove("hidden");$("password").value=""});
function reset(){$("movieForm").reset();$("movieId").value="";$("published").checked=true;$("formTitle").textContent="Add a movie"}
$("resetForm").addEventListener("click",reset);
$("movieForm").addEventListener("submit",e=>{e.preventDefault();const items=movies();const id=$("movieId").value||("m"+Date.now());const item={id,title:$("title").value.trim(),language:$("language").value,year:$("year").value,genre:$("genre").value.trim(),poster:$("poster").value.trim(),videoUrl:$("videoUrl").value.trim(),description:$("description").value.trim(),published:$("published").checked,featured:$("featured").checked};const i=items.findIndex(x=>x.id===id);if(i>=0)items[i]=item;else items.unshift(item);save(items);reset();renderList();alert("Movie saved in this browser.")});
function renderList(){const list=$("adminList");if(!list)return;const items=movies();list.innerHTML=items.length?items.map(m=>`<div class="admin-row"><div><strong>${esc(m.title)}</strong><br><small>${esc(m.language)} · ${esc(m.year||"Year not set")} · ${m.published===false?"Unpublished":"Published"}</small></div><div class="admin-actions"><button class="plain-btn secondary" onclick="editMovie('${esc(m.id)}')">Edit</button><button class="plain-btn secondary" onclick="deleteMovie('${esc(m.id)}')">Delete</button></div></div>`).join(""):"<p class='warning'>No movies yet. Add your first authorized title above.</p>"}
window.editMovie=id=>{const m=movies().find(x=>x.id===id);if(!m)return;$("movieId").value=m.id;$("title").value=m.title;$("language").value=m.language;$("year").value=m.year||"";$("genre").value=m.genre||"";$("poster").value=m.poster||"";$("videoUrl").value=m.videoUrl||"";$("description").value=m.description||"";$("published").checked=m.published!==false;$("featured").checked=!!m.featured;$("formTitle").textContent="Edit movie";window.scrollTo({top:0,behavior:"smooth"})};
window.deleteMovie=id=>{if(!confirm("Delete this movie from this browser?"))return;save(movies().filter(x=>x.id!==id));renderList()};