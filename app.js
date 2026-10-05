const $=id=>document.getElementById(id);
const STORE={host:"fbhost",interval:"refreshInterval",history:"sensorHistory"};
let host="",timer=null,temperature=[],humidity=[],times=[];

function loadSettings(){
  try{
    host=localStorage.getItem(STORE.host)||"";
    const interval=parseInt(localStorage.getItem(STORE.interval)||"3",10);
    return {interval:Number.isFinite(interval)?interval:3};
  }catch(e){return {interval:3}}
}
function saveHistory(){
  try{localStorage.setItem(STORE.history,JSON.stringify({temperature,humidity,times}))}catch(e){}
}
function loadHistory(){
  try{
    const x=JSON.parse(localStorage.getItem(STORE.history)||"{}");
    temperature=Array.isArray(x.temperature)?x.temperature:[];
    humidity=Array.isArray(x.humidity)?x.humidity:[];
    times=Array.isArray(x.times)?x.times:[];
  }catch(e){temperature=[];humidity=[];times=[]}
}
function setConnection(online,text){
  document.querySelectorAll(".dot").forEach(d=>d.classList.toggle("online",online));
  const a=$("connectionText"),b=$("sideStatus");
  if(a)a.textContent=text;
  if(b)b.textContent=text;
}
function updateValues(t,h,time){
  if($("temperature"))$("temperature").textContent=Number(t).toFixed(1);
  if($("humidity"))$("humidity").textContent=Number(h).toFixed(1);
  if($("temperatureTime"))$("temperatureTime").textContent=time;
  if($("humidityTime"))$("humidityTime").textContent=time;
}
function drawChart(){
  const c=$("chart");if(!c)return;
  const dpr=devicePixelRatio||1,w=c.clientWidth,h=c.clientHeight;
  c.width=w*dpr;c.height=h*dpr;
  const x=c.getContext("2d");x.setTransform(dpr,0,0,dpr,0,0);x.clearRect(0,0,w,h);
  if(!temperature.length)return;
  const all=temperature.concat(humidity),min=Math.min(...all),max=Math.max(...all);
  const pad=2,range=(max-min)||1,mn=min-pad,mx=max+pad;
  const line=(arr,color)=>{
    x.beginPath();x.strokeStyle=color;x.lineWidth=2.5;
    arr.forEach((v,i)=>{const px=arr.length>1?i*w/(arr.length-1):w/2,py=h-(v-mn)/(mx-mn)*h;i?x.lineTo(px,py):x.moveTo(px,py)});
    x.stroke();
  };
  line(temperature,"#e5533d");line(humidity,"#2f7de1");
}
function renderTable(){
  const tb=$("historyTable");if(!tb)return;
  if($("readingCount"))$("readingCount").textContent=temperature.length;
  if(!temperature.length){tb.innerHTML='<tr><td colspan="3" class="empty">No readings yet.</td></tr>';return}
  tb.innerHTML=temperature.map((v,i)=>`<tr><td>${times[i]||"--"}</td><td>${v.toFixed(1)} °C</td><td>${Number(humidity[i]).toFixed(1)} %</td></tr>`).reverse().join("");
}
async function poll(){
  if(!host){setConnection(false,"Not connected");return}
  try{
    const r=await fetch("https://"+host+"/.json",{cache:"no-store"});
    if(!r.ok)throw new Error("HTTP "+r.status);
    const d=await r.json();
    if(!d||d.temperature==null||d.humidity==null)throw new Error("Aucune donnée");
    const t=Number(d.temperature),h=Number(d.humidity),now=new Date().toLocaleTimeString();
    updateValues(t,h,now);setConnection(true,"Connected");
    temperature.push(t);humidity.push(h);times.push(now);
    if(temperature.length>60){temperature.shift();humidity.shift();times.shift()}
    saveHistory();drawChart();renderTable();
    const m=$("connectionMessage");if(m){m.textContent="Connexion réussie. Dernière mise à jour : "+now;m.className="message ok"}
    const err=$("errorBox");if(err)err.classList.add("hidden");
  }catch(e){
    setConnection(false,"Connection error");
    const err=$("errorBox");if(err){err.textContent="Firebase : "+e.message;err.classList.remove("hidden")}
    const m=$("connectionMessage");if(m){m.textContent="Erreur : "+e.message;m.className="message error"}
  }
}
function start(){
  clearInterval(timer);
  const s=loadSettings();
  if($("refreshValue"))$("refreshValue").textContent=s.interval;
  if(host){poll();timer=setInterval(poll,s.interval*1000)}else setConnection(false,"Not connected");
}
document.addEventListener("DOMContentLoaded",()=>{
  const s=loadSettings();loadHistory();
  if($("host"))$("host").value=host;
  if($("refreshInterval"))$("refreshInterval").value=String(s.interval);
  if(temperature.length){
    const last=temperature.length-1;updateValues(temperature[last],humidity[last],times[last]||"");
  }
  drawChart();renderTable();

  $("saveConnection")?.addEventListener("click",()=>{
    host=$("host").value.trim().replace(/^https?:\/\//,"").replace(/\/$/,"");
    try{localStorage.setItem(STORE.host,host)}catch(e){}
    if(!host){$("connectionMessage").textContent="Please enter a Firebase host.";return}
    temperature=[];humidity=[];times=[];saveHistory();start();
  });
  $("saveSettings")?.addEventListener("click",()=>{
    const v=parseInt($("refreshInterval").value,10)||3;
    try{localStorage.setItem(STORE.interval,String(v))}catch(e){}
    $("settingsMessage").textContent="Settings saved.";
    start();
  });
  $("clearHistory")?.addEventListener("click",()=>{
    temperature=[];humidity=[];times=[];saveHistory();drawChart();renderTable();
  });
  $("resetSettings")?.addEventListener("click",()=>{
    try{localStorage.removeItem(STORE.host);localStorage.removeItem(STORE.interval);localStorage.removeItem(STORE.history)}catch(e){}
    location.reload();
  });
  addEventListener("resize",drawChart);
  start();
});
