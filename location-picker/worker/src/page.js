// 与 location-picker/server.js 的 PAGE 保持一致（地图选点 UI）
export const PAGE = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
<meta name="referrer" content="strict-origin-when-cross-origin">
<title>Location Picker</title>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha384-sHL9NAb7lN7rfvG5lfHpm643Xkcjzp4jFvuavGOndn6pjVqS6ny56CAt3nsEVT4H" crossorigin="anonymous">
<style>
  html,body{margin:0;height:100%;font-family:-apple-system,BlinkMacSystemFont,sans-serif;display:flex;flex-direction:column;overflow:hidden}
  .bar{padding:8px;display:flex;gap:6px;box-sizing:border-box;flex-shrink:0}
  .bar input{flex:1;padding:10px;font-size:16px;border:1px solid #ccc;border-radius:8px}
  .bar button{padding:10px 14px;font-size:16px;border:0;border-radius:8px;background:#007aff;color:#fff}
  .bar button:disabled{opacity:.55}
  .results{margin:0 8px;border:1px solid #e2e2e2;border-radius:8px;max-height:34vh;overflow:auto;display:none;position:relative;z-index:200;background:#fff}
  .results.show{display:block}
  .rrow{padding:10px 12px;font-size:14px;border-bottom:1px solid #eee;color:#222;display:flex;align-items:center;gap:8px}
  .rrow:last-child{border-bottom:0}
  .rrow:active{background:#f0f6ff}
  .rrow .fname{flex:1;min-width:0}
  .rrow .fdel{padding:6px 10px;font-size:13px;border:0;border-radius:6px;background:#ff3b30;color:#fff;flex-shrink:0}
  #map{height:42vh;flex-shrink:0;z-index:10;box-shadow:0 2px 5px rgba(0,0,0,0.1)}
  #info{padding:8px 10px;font-size:13px;line-height:1.4;flex-shrink:0}
  .coord-bar{padding:6px 10px 8px;display:flex;flex-direction:column;gap:8px;}
  .coord-row{display:flex;gap:8px;align-items:flex-end;width:100%;}
  .coord-row label{flex:1;min-width:0;font-size:13px;color:#444;display:flex;flex-direction:column;gap:4px;margin:0;}
  .action-row{display:flex;gap:8px;width:100%;}
  #coord, #jumpbtn, .action-row button{
    height:42px !important;
    min-height:42px !important;
    max-height:42px !important;
    box-sizing:border-box !important;
    margin:0 !important;
    border-radius:8px !important;
    -webkit-appearance:none;
    -moz-appearance:none;
    appearance:none;
    vertical-align:middle;
  }
  #coord{
    width:100%;
    padding:0 12px;
    font-size:15px;
    line-height:40px;
    border:1px solid #ccc !important;
    background:#fff;
    color:#222;
    outline:none;
  }
  #jumpbtn{
    padding:0 18px;
    font-size:15px;
    font-weight:600;
    line-height:40px;
    border:1px solid transparent !important;
    background:#007aff;
    color:#fff;
    cursor:pointer;
    display:inline-flex;
    align-items:center;
    justify-content:center;
    flex-shrink:0;
  }
  .action-row button{
    flex:1;
    font-size:18px;
    line-height:40px;
    border:1px solid transparent !important;
    color:#fff;
    cursor:pointer;
    display:inline-flex;
    align-items:center;
    justify-content:center;
  }
  #pastebtn{background:#5ac8fa;}
  #savebtn{background:#34c759;}
  #checkpointbtn2{background:#ff9500;}
  #favadd{display:none !important;}
  #restorebtn{padding:10px 14px;font-size:14px;border:0;border-radius:8px;background:#8e8e93;color:#fff;cursor:pointer;}
  @media (min-width: 600px) {
    .coord-bar{flex-direction:row;align-items:flex-end;}
    .coord-row{flex:1;}
    .action-row{width:auto;}
    .action-row button{flex:none;min-width:44px;padding:0 14px;}
  }
  .toast{position:fixed;bottom:16px;left:50%;transform:translateX(-50%);
    background:rgba(0,0,0,.85);color:#fff;padding:10px 16px;border-radius:8px;
    font-size:14px;opacity:0;transition:opacity .3s;pointer-events:none;z-index:9999}
  .toast.show{opacity:1}
</style>
</head>
<body>
<div class="bar" style="display:none">
  <input id="q" placeholder="Search location (preview only, does not change location)">
  <button id="locatebtn" disabled>Current Location</button>
  <button id="btn">Search</button>
</div>
<div class="results" id="results"></div>
<div id="map"></div>
<div id="info">Loading...</div>
<div style="flex:1;overflow-y:auto;padding-bottom:20px;">
<div class="coord-bar">
  <div class="coord-row">
    <label style="flex:1;min-width:0;font-size:13px;color:#444;display:flex;flex-direction:column;gap:4px;margin:0;">
      <span>Lat, Lng</span>
      <input id="coord" placeholder="35.46436,139.62461">
    </label>
    <button id="jumpbtn" type="button" title="Go (tự động paste nếu clipboard có tọa độ)">Go</button>
  </div>
  <div class="action-row">
    <button id="pastebtn" type="button" title="Paste clipboard & Go" aria-label="Paste & Go">📋</button>
    <button id="savebtn" type="button" title="Save Location" aria-label="Save Location">💾</button>
    <button id="checkpointbtn2" type="button" title="Mark Checkpoint" aria-label="Mark Checkpoint">⏱</button>
    <button id="favadd" type="button" style="display:none"></button>
    <button id="favlistbtn" type="button" style="display:none"></button>
  </div>
</div>
<details style="margin:0 8px 8px;padding:8px 10px;border:1px solid #e2e2e2;border-radius:8px;background:#fafafa;">
  <summary style="cursor:pointer;font-size:13px;font-weight:600;color:#555;user-select:none;">⚙️ Advanced (Altitude, Accuracy, Real Location)</summary>
  <div style="display:flex;flex-wrap:wrap;gap:8px;align-items:flex-end;margin-top:8px;">
    <label style="font-size:13px;color:#444;display:flex;flex-direction:column">Altitude (m)<input id="alt" type="number" inputmode="numeric" style="width:88px;padding:8px;font-size:15px;border:1px solid #ccc;border-radius:6px;margin-top:2px"></label>
    <label style="font-size:13px;color:#444;display:flex;flex-direction:column">H. Accuracy<input id="hacc" type="number" inputmode="numeric" style="width:88px;padding:8px;font-size:15px;border:1px solid #ccc;border-radius:6px;margin-top:2px"></label>
    <label style="font-size:13px;color:#444;display:flex;flex-direction:column">V. Accuracy<input id="vacc" type="number" inputmode="numeric" style="width:88px;padding:8px;font-size:15px;border:1px solid #ccc;border-radius:6px;margin-top:2px"></label>
    <button id="restorebtn" type="button" style="padding:10px 14px;font-size:14px;border:0;border-radius:8px;background:#8e8e93;color:#fff;cursor:pointer">Restore Real Location</button>
  </div>
</details>
<div id="cooldowncard" style="margin:8px;padding:10px;border:1px solid #e2e2e2;border-radius:8px;background:#fafafa;">
  <div style="font-weight:600;font-size:14px;margin-bottom:6px;display:flex;justify-content:space-between;align-items:center;">
    <div style="display:flex;align-items:center;gap:6px;">
      <span>⚡ Pokemon GO Cooldown</span>
      <span style="font-size:11px;color:#007aff;background:#e5f1ff;padding:2px 6px;border-radius:4px;font-weight:500;">+1m an toàn</span>
    </div>
    <div style="display:flex;gap:6px">
      <button id="checkpointbtn" type="button" title="Mark Checkpoint" aria-label="Mark Checkpoint" style="padding:4px 10px;font-size:16px;border:0;border-radius:6px;background:#ff9500;color:#fff;cursor:pointer">⏱</button>
      <button id="clearcheckpointbtn" type="button" style="padding:4px 8px;font-size:12px;border:0;border-radius:6px;background:#8e8e93;color:#fff;cursor:pointer">Reset</button>
    </div>
  </div>
  <div id="cooldowninfo" style="font-size:13px;color:#333;line-height:1.5;background:#fff;padding:8px 10px;border-radius:6px;border:1px solid #eee;">
    No checkpoint set. Enter/pick location and click <b>Mark Checkpoint</b>.
  </div>
</div>
<div id="favsection" style="margin:8px;padding:10px;border:1px solid #e2e2e2;border-radius:8px;background:#fafafa;">
  <div style="font-weight:600;font-size:14px;margin-bottom:6px;display:flex;justify-content:space-between;align-items:center;">
    <span>My Bookmarks</span>
    <button id="favadd2" type="button" title="Bookmark Spot" aria-label="Bookmark Spot" style="padding:4px 10px;font-size:16px;border:0;border-radius:6px;background:#5856d6;color:#fff;cursor:pointer">⭐</button>
  </div>
  <div id="favs" style="border:1px solid #e2e2e2;border-radius:8px;background:#fff;max-height:24vh;overflow-y:auto;"></div>
</div>
<div style="margin:8px;padding:10px;border:1px solid #e2e2e2;border-radius:8px;background:#fafafa;">
  <div style="font-weight:600;font-size:14px;margin-bottom:6px;display:flex;justify-content:space-between;align-items:center;">
    <span>Batch Location Input</span>
    <button id="clearbatchbtn" type="button" style="padding:4px 10px;font-size:12px;border:0;border-radius:6px;background:#ff3b30;color:#fff;cursor:pointer">Clear All</button>
  </div>
  <textarea id="batchinput" rows="4" placeholder="Paste multiple lines of lat,lng here:&#10;34.39769,132.47633&#10;35.72880,139.71917&#10;36.57922,136.64985" style="width:100%;box-sizing:border-box;padding:8px;font-size:13px;border:1px solid #ccc;border-radius:6px;font-family:monospace;resize:vertical"></textarea>
  <div style="margin-top:6px;display:flex;gap:6px">
    <button id="parsebatchbtn" type="button" style="padding:8px 14px;font-size:14px;border:0;border-radius:6px;background:#007aff;color:#fff;font-weight:600;cursor:pointer">Generate List</button>
  </div>
  <div id="batchlist" style="margin-top:8px"></div>
</div>
</div>
<div class="toast" id="toast"></div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha384-cxOPjt7s7Iz04uaHJceBmS+qpjv2JkIHNVcuOrM+YHwZOmJGBXI00mdUXEq65HTH" crossorigin="anonymous"></script>
<script>
var token = new URLSearchParams(location.search).get("token") || "";
var currentUserName = "";
function escapeHtml(s){
  return String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

var GCJ = (function(){
  var PI = Math.PI, a = 6378245.0, ee = 0.00669342162296594323;
  function outOfChina(lat,lng){return (lng<72.004||lng>137.8347)||(lat<0.8293||lat>55.8271);}
  function tLat(x,y){
    var r=-100.0+2.0*x+3.0*y+0.2*y*y+0.1*x*y+0.2*Math.sqrt(Math.abs(x));
    r+=(20.0*Math.sin(6.0*x*PI)+20.0*Math.sin(2.0*x*PI))*2.0/3.0;
    r+=(20.0*Math.sin(y*PI)+40.0*Math.sin(y/3.0*PI))*2.0/3.0;
    r+=(160.0*Math.sin(y/12.0*PI)+320*Math.sin(y*PI/30.0))*2.0/3.0;return r;
  }
  function tLng(x,y){
    var r=300.0+x+2.0*y+0.1*x*x+0.1*x*y+0.1*Math.sqrt(Math.abs(x));
    r+=(20.0*Math.sin(6.0*x*PI)+20.0*Math.sin(2.0*x*PI))*2.0/3.0;
    r+=(20.0*Math.sin(x*PI)+40.0*Math.sin(x/3.0*PI))*2.0/3.0;
    r+=(150.0*Math.sin(x/12.0*PI)+300*Math.sin(x/30.0*PI))*2.0/3.0;return r;
  }
  function wgs2gcj(lat,lng){
    if(outOfChina(lat,lng))return [lat,lng];
    var dLat=tLat(lng-105.0,lat-35.0), dLng=tLng(lng-105.0,lat-35.0);
    var radLat=lat/180.0*PI, m=Math.sin(radLat); m=1-ee*m*m; var sm=Math.sqrt(m);
    dLat=(dLat*180.0)/((a*(1-ee))/(m*sm)*PI);
    dLng=(dLng*180.0)/(a/sm*Math.cos(radLat)*PI);
    return [lat+dLat,lng+dLng];
  }
  function gcj2wgs(lat,lng){ // 迭代反解，往返误差 <0.001 米
    if(outOfChina(lat,lng))return [lat,lng];
    var wlat=lat, wlng=lng;
    for(var i=0;i<3;i++){ var g=wgs2gcj(wlat,wlng); wlat+=lat-g[0]; wlng+=lng-g[1]; }
    return [wlat,wlng];
  }
  return {wgs2gcj:wgs2gcj, gcj2wgs:gcj2wgs};
})();

var map, marker;
var WGS = {lat:0, lng:0};
var datum = "gcj";
var saved = true;
var enabledState = true;  // true=spoofing; false=real location restored (script passthrough)

function $(id){return document.getElementById(id);}
function toast(t){var e=$("toast");e.textContent=t;e.classList.add("show");setTimeout(function(){e.classList.remove("show");},1800);}
function numOrNull(id){var v=$(id).value.trim();return v===""?null:Number(v);}
// Leaflet longitude normalization for repeated world maps.
function wrapLng(lng){return ((((Number(lng)+180)%360)+360)%360)-180;}

function setLocateBusy(busy){
  var b=$("locatebtn");
  b.disabled=!!busy;
  b.textContent=busy?"Locating...":"Current Location";
}

function geolocationErrorMessage(err){
  if(err&&err.code===1)return "Location permission denied. Please allow location in Safari settings.";
  if(err&&err.code===2)return "Unable to fetch current location right now.";
  if(err&&err.code===3)return "Location request timed out. Please try again outdoors.";
  return "Failed to get current location.";
}

var FAV_KEY="lp_favs_v1";
var FAV_MAX=50;
function loadFavs(){
  try{
    var raw=localStorage.getItem(FAV_KEY);
    var a=raw?JSON.parse(raw):[];
    return Array.isArray(a)?a:[];
  }catch(e){return [];}
}
function saveFavs(list){
  try{localStorage.setItem(FAV_KEY,JSON.stringify(list.slice(0,FAV_MAX)));}catch(e){}
}
function applyFavorite(it){
  var lat=Number(it.lat), lng=wrapLng(it.lng);
  if(!Number.isFinite(lat)||!Number.isFinite(lng)){toast("Invalid bookmarked coordinates");return;}
  WGS={lat:lat,lng:lng};
  saved=false;
  if(it.alt!=null&&it.alt!=="")$("alt").value=it.alt;
  if(it.hacc!=null&&it.hacc!=="")$("hacc").value=it.hacc;
  if(it.vacc!=null&&it.vacc!=="")$("vacc").value=it.vacc;
  var p=dispPos();
  marker.setLatLng(p);
  map.setView(p,15);
  $("coord").value=WGS.lat.toFixed(5)+","+WGS.lng.toFixed(5);
  info();
  updateCooldownUI();
  toast("Bookmark loaded. Click Save Location to apply."); // toast("已加载收藏，确认后保存");
}
function moveFav(fromIdx, toIdx){
  var list=loadFavs();
  if(toIdx < 0 || toIdx >= list.length) return;
  var it=list.splice(fromIdx, 1)[0];
  list.splice(toIdx, 0, it);
  saveFavs(list);
  renderFavs();
}
function renderFavs(){
  var box=$("favs");
  if(!box)return;
  var list=loadFavs();
  box.innerHTML="";
  if(!list.length){
    box.innerHTML="<div style='padding:10px 12px;font-size:13px;color:#8e8e93;text-align:center;'>No bookmarks saved yet</div>";
    return;
  }
  list.forEach(function(it,idx){
    var row=document.createElement("div");
    row.className="rrow";
    var name=document.createElement("span");
    name.className="fname";
    name.style.cursor="pointer";
    name.textContent=it.name||(Number(it.lat).toFixed(5)+","+Number(it.lng).toFixed(5));
    name.addEventListener("click",function(){
      $("results").classList.remove("show");
      applyFavorite(it);
    });

    var actions=document.createElement("div");
    actions.style.cssText="display:flex;align-items:center;gap:4px;flex-shrink:0;";

    var upBtn=document.createElement("button");
    upBtn.type="button";
    upBtn.textContent="↑";
    upBtn.title="Move Up";
    upBtn.style.cssText="padding:4px 8px;font-size:12px;border:1px solid #ccc;border-radius:4px;background:#f8f9fa;color:#333;cursor:pointer;" + (idx === 0 ? "opacity:0.3;pointer-events:none;" : "");
    upBtn.addEventListener("click",function(e){
      e.stopPropagation();
      moveFav(idx, idx - 1);
    });

    var downBtn=document.createElement("button");
    downBtn.type="button";
    downBtn.textContent="↓";
    downBtn.title="Move Down";
    downBtn.style.cssText="padding:4px 8px;font-size:12px;border:1px solid #ccc;border-radius:4px;background:#f8f9fa;color:#333;cursor:pointer;" + (idx === list.length - 1 ? "opacity:0.3;pointer-events:none;" : "");
    downBtn.addEventListener("click",function(e){
      e.stopPropagation();
      moveFav(idx, idx + 1);
    });

    var del=document.createElement("button");
    del.className="fdel";
    del.type="button";
    del.textContent="Del";
    del.addEventListener("click",function(e){
      e.stopPropagation();
      var itName = it.name || (Number(it.lat).toFixed(5) + "," + Number(it.lng).toFixed(5));
      if (!window.confirm('Delete bookmark "' + itName + '"?')) return;
      var next=loadFavs();
      next.splice(idx,1);
      saveFavs(next);
      renderFavs();
      toast("Bookmark deleted");
    });

    actions.appendChild(upBtn);
    actions.appendChild(downBtn);
    actions.appendChild(del);

    row.appendChild(name);
    row.appendChild(actions);
    box.appendChild(row);
  });
}
function addFavorite(){
  if(!Number.isFinite(WGS.lat)||!Number.isFinite(WGS.lng)){toast("Current coordinates invalid");return;}
  var def=$("q").value.trim()||(WGS.lat.toFixed(4)+","+WGS.lng.toFixed(4));
  var name=window.prompt("Bookmark Name",def);
  if(name===null)return;
  name=String(name).trim()||def;
  var list=loadFavs().filter(function(it){
    return Math.abs(Number(it.lat)-WGS.lat)>1e-5||Math.abs(Number(it.lng)-WGS.lng)>1e-5;
  });
  list.unshift({
    name:name,
    lat:WGS.lat,
    lng:WGS.lng,
    alt:numOrNull("alt"),
    hacc:numOrNull("hacc"),
    vacc:numOrNull("vacc"),
    ts:Date.now()
  });
  saveFavs(list);
  renderFavs();
  toast("Bookmarked successfully");
}
function toggleFavs(){
  var sec=$("favsection");
  if(sec){sec.scrollIntoView({behavior:"smooth"});}
}

var CHECKPOINT_KEY = "lp_pogo_cp_v1";
var POGO_SAFETY_BUFFER_MIN = 1;

var POGO_COOLDOWNS = [
  [1, 1],
  [2, 2],
  [3, 2],
  [4, 6],
  [5, 6],
  [6, 7],
  [8, 8],
  [10, 8],
  [12, 9],
  [15, 11],
  [20, 13],
  [25, 15],
  [30, 18],
  [40, 22],
  [50, 24],
  [60, 25],
  [70, 26],
  [80, 27],
  [90, 28],
  [100, 30],
  [125, 33],
  [150, 36],
  [200, 42],
  [250, 46],
  [300, 50],
  [400, 56],
  [500, 64],
  [600, 72],
  [700, 79],
  [800, 86],
  [900, 93],
  [1000, 100],
  [1100, 108],
  [1200, 115],
  [1300, 120]
];

function getHaversineDistKm(lat1, lon1, lat2, lon2){
  var R = 6371;
  var dLat = (lat2 - lat1) * Math.PI / 180;
  var dLon = (lon2 - lon1) * Math.PI / 180;
  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
          Math.sin(dLon/2) * Math.sin(dLon/2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function getPogoCooldownMin(distKm){
  if (distKm <= 0.05) return 0;
  for (var i = 0; i < POGO_COOLDOWNS.length; i++) {
    if (distKm <= POGO_COOLDOWNS[i][0]) {
      return POGO_COOLDOWNS[i][1] + POGO_SAFETY_BUFFER_MIN;
    }
  }
  return 120 + POGO_SAFETY_BUFFER_MIN;
}

function formatHours(min){
  if (min < 60) return min + " min";
  var h = Math.floor(min / 60);
  var m = min % 60;
  return min + " min (" + h + " hr" + (m > 0 ? " " + m + " min" : "") + ")";
}

function getCheckpoint(){
  try{
    var raw = localStorage.getItem(CHECKPOINT_KEY);
    return raw ? JSON.parse(raw) : null;
  }catch(e){ return null; }
}

function saveCheckpoint(cp){
  try{
    if (cp) localStorage.setItem(CHECKPOINT_KEY, JSON.stringify(cp));
    else localStorage.removeItem(CHECKPOINT_KEY);
  }catch(e){}
}

function setCheckpoint(){
  var lat = WGS.lat;
  var lng = WGS.lng;
  var raw = $("coord") ? $("coord").value.trim() : "";
  if (raw) {
    var parts = raw.replace(/^["'\\s(]+|["'\\s)]+$/g, '').split(/[,;\\s\\/]+/);
    if (parts.length >= 2) {
      var pLat = Number(parts[0]), pLng = Number(parts[1]);
      if (Number.isFinite(pLat) && Number.isFinite(pLng) && pLat >= -90 && pLat <= 90 && pLng >= -180 && pLng <= 180) {
        lat = pLat; lng = pLng;
      }
    }
  }
  var cp = { lat: lat, lng: lng, time: Date.now() };
  saveCheckpoint(cp);
  updateCooldownUI();
  var d = new Date(cp.time);
  var timeStr = d.toLocaleTimeString ? d.toLocaleTimeString() : d.toTimeString().split(" ")[0];
  toast("Checkpoint marked: " + lat.toFixed(5) + ", " + lng.toFixed(5) + " (" + timeStr + ")");
}

function clearCheckpoint(){
  saveCheckpoint(null);
  updateCooldownUI();
  toast("Checkpoint reset");
}

function getMaxSafeDistanceKm(elapsedMinutes){
  if (elapsedMinutes < 1 + POGO_SAFETY_BUFFER_MIN) return 0;
  if (elapsedMinutes >= 120 + POGO_SAFETY_BUFFER_MIN) return Infinity;
  var maxDist = 0;
  for (var i = 0; i < POGO_COOLDOWNS.length; i++) {
    var dist = POGO_COOLDOWNS[i][0];
    var reqCd = POGO_COOLDOWNS[i][1] + POGO_SAFETY_BUFFER_MIN;
    if (elapsedMinutes >= reqCd) {
      if (dist > maxDist) maxDist = dist;
    }
  }
  return maxDist;
}

function getNextMilestone(elapsedSec){
  var elapsedMinutes = elapsedSec / 60;
  if (elapsedMinutes >= 120 + POGO_SAFETY_BUFFER_MIN) return null;
  var nextDist = null;
  var nextCdSec = null;
  for (var i = 0; i < POGO_COOLDOWNS.length; i++) {
    var dist = POGO_COOLDOWNS[i][0];
    var reqCdSec = (POGO_COOLDOWNS[i][1] + POGO_SAFETY_BUFFER_MIN) * 60;
    if (reqCdSec > elapsedSec) {
      if (nextCdSec === null) {
        nextCdSec = reqCdSec;
        nextDist = dist;
      } else if (reqCdSec === nextCdSec) {
        nextDist = dist;
      } else {
        break;
      }
    }
  }
  if (nextDist !== null && nextCdSec !== null) {
    return { dist: nextDist, waitSec: nextCdSec - elapsedSec };
  }
  return null;
}

function formatWaitShort(sec){
  var m = Math.floor(sec / 60);
  var s = sec % 60;
  if (m > 0) return m + "m " + (s < 10 ? "0" : "") + s + "s";
  return s + "s";
}

function jumpToCheckpoint(){
  var cp = getCheckpoint();
  if(!cp || !Number.isFinite(cp.lat) || !Number.isFinite(cp.lng)) return;
  setWgsLocation(cp.lat, cp.lng);
  toast("Map centered to checkpoint (" + cp.lat.toFixed(5) + ", " + cp.lng.toFixed(5) + ")");
}

var cpMarker = null;
var cpLine = null;

function updateCpMapLayer(){
  if (!map) return;
  var cp = getCheckpoint();
  if (!cp || !Number.isFinite(cp.lat) || !Number.isFinite(cp.lng) || !cp.time) {
    if (cpMarker) { map.removeLayer(cpMarker); cpMarker = null; }
    if (cpLine) { map.removeLayer(cpLine); cpLine = null; }
    return;
  }

  var cpPos = dispPos(cp.lat, cp.lng);
  var curPos = dispPos(WGS.lat, WGS.lng);

  if (!cpMarker) {
    var cpIcon = L.divIcon({
      className: "custom-cp-marker",
      html: '<div style="background:#ff9500;color:#fff;border:2px solid #fff;border-radius:50%;width:26px;height:26px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.35);font-size:13px;cursor:pointer;user-select:none;" title="Checkpoint: Bấm để đưa map về đây">⏱</div>',
      iconSize: [26, 26],
      iconAnchor: [13, 13]
    });
    cpMarker = L.marker(cpPos, { icon: cpIcon, zIndexOffset: 500 }).addTo(map);
    cpMarker.on("click", function(){
      jumpToCheckpoint();
    });
  } else {
    cpMarker.setLatLng(cpPos);
  }

  if (!cpLine) {
    cpLine = L.polyline([cpPos, curPos], {
      color: "#ff3b30",
      weight: 2.5,
      dashArray: "6, 6",
      opacity: 0.85
    }).addTo(map);
  } else {
    cpLine.setLatLngs([cpPos, curPos]);
  }
}

function updateCooldownUI(){
  updateCpMapLayer();
  var box = $("cooldowninfo");
  if (!box) return;
  var cp = getCheckpoint();
  if (!cp || !Number.isFinite(cp.lat) || !Number.isFinite(cp.lng) || !cp.time) {
    box.innerHTML = '<span style="color:#8e8e93">No checkpoint set. Enter/pick location and click <b>⏱</b> to start tracking.</span>';
    return;
  }

  var curLat = WGS.lat;
  var curLng = WGS.lng;
  var distKm = getHaversineDistKm(cp.lat, cp.lng, curLat, curLng);
  var reqMin = getPogoCooldownMin(distKm);
  var reqSec = reqMin * 60;

  var elapsedSec = Math.max(0, Math.floor((Date.now() - cp.time) / 1000));
  var remainSec = Math.max(0, reqSec - elapsedSec);

  var cpDate = new Date(cp.time);
  var cpTimeStr = cpDate.toLocaleTimeString ? cpDate.toLocaleTimeString() : cpDate.toTimeString().split(" ")[0];

  var distStr = distKm < 1 ? Math.round(distKm * 1000) + " m" : distKm.toFixed(2) + " km";
  var reqStr = formatHours(reqMin);
  var safeNote = POGO_SAFETY_BUFFER_MIN > 0 && reqMin > 0 ? ' <span style="font-size:11px;color:#007aff;font-weight:normal;" title="Đã tự động cộng 1 phút đệm an toàn">(+1m an toàn)</span>' : '';

  var elapM = Math.floor(elapsedSec / 60);
  var elapS = elapsedSec % 60;
  var elapStr = elapM + "m " + (elapS < 10 ? "0" : "") + elapS + "s";

  var maxSafeKm = getMaxSafeDistanceKm(elapsedSec / 60);
  var nextM = getNextMilestone(elapsedSec);
  var maxSafeHtml = "";
  if (maxSafeKm === 0) {
    var nextHint = nextM ? " (chờ " + formatWaitShort(nextM.waitSec) + " để đi " + nextM.dist + " km)" : "";
    maxSafeHtml = '<b style="color:#ff9500">0 km</b>' + (nextHint ? '<span style="font-size:11.5px;color:#666;font-weight:normal">' + nextHint + '</span>' : "");
  } else if (!Number.isFinite(maxSafeKm) || maxSafeKm >= 1300) {
    maxSafeHtml = '<b style="color:#34c759">1,300+ km (Toàn cầu / Không giới hạn)</b>';
  } else {
    var nextHint = nextM ? " (chờ " + formatWaitShort(nextM.waitSec) + " để đi " + nextM.dist + " km)" : "";
    maxSafeHtml = '<b style="color:#007aff">' + maxSafeKm.toLocaleString() + ' km</b>' + (nextHint ? '<span style="font-size:11.5px;color:#666;font-weight:normal">' + nextHint + '</span>' : "");
  }

  var statusBadge = "";
  if (remainSec <= 0) {
    statusBadge = '<span style="display:inline-block;padding:2px 8px;border-radius:4px;background:#34c759;color:#fff;font-weight:700;font-size:13px;">✅ Ready (0 min wait)</span>';
  } else {
    var remH = Math.floor(remainSec / 3600);
    var remM = Math.floor((remainSec % 3600) / 60);
    var remS = remainSec % 60;
    var remFormatted = "";
    if (remH > 0) {
      remFormatted = remH + "h " + remM + "m " + (remS < 10 ? "0" : "") + remS + "s";
    } else if (remM > 0) {
      remFormatted = remM + "m " + (remS < 10 ? "0" : "") + remS + "s";
    } else {
      remFormatted = remS + "s";
    }
    var remTotalMin = Math.ceil(remainSec / 60);
    statusBadge = '<span style="display:inline-block;padding:2px 8px;border-radius:4px;background:#ff3b30;color:#fff;font-weight:700;font-size:13px;">⏳ Wait ' + remFormatted + ' (~' + remTotalMin + ' min)</span>';
  }

  box.innerHTML = 
    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;flex-wrap:wrap;gap:4px;">' +
      '<div>' + statusBadge + '</div>' +
      '<div style="font-size:13px;color:#1c1c1e;">Distance: <b>' + distStr + '</b></div>' +
    '</div>' +
    '<div style="margin:6px 0;padding:7px 10px;background:#f0f7ff;border:1px solid #d0e5ff;border-radius:6px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:4px;font-size:13px;">' +
      '<span style="color:#0051ba;font-weight:600;">🚀 Đi xa nhất lúc này (Max Range):</span>' +
      '<div>' + maxSafeHtml + '</div>' +
    '</div>' +
    '<div style="display:flex;flex-wrap:wrap;align-items:center;gap:6px 14px;font-size:12px;color:#555;">' +
      '<span onclick="jumpToCheckpoint()" style="cursor:pointer;padding:2px 7px;border-radius:5px;background:#eef5ff;border:1px solid #c8e1ff;color:#0051ba;display:inline-flex;align-items:center;gap:4px;user-select:none;" title="Bấm để đưa map về checkpoint này">' +
        '📍 Checkpoint: <b style="text-decoration:underline;text-underline-offset:2px;">' + cp.lat.toFixed(5) + ', ' + cp.lng.toFixed(5) + '</b> <span style="font-size:11px;opacity:0.8">🔍</span>' +
      '</span>' +
      '<span>(' + cpTimeStr + ')</span>' +
      '<span>⏱ Required: <b>' + reqStr + '</b>' + safeNote + '</span>' +
      '<span>⌛ Elapsed: <b>' + elapStr + '</b></span>' +
    '</div>';
}

function info(){
  var userTag = currentUserName ? "　👤 <b>" + escapeHtml(currentUserName) + "</b>" : "";
  if(!enabledState){
    $("info").innerHTML = "<b style='color:#ff9500'>Real Location Restored · Script Passthrough</b>" + userTag + " (Toggle Location Services to apply)";
    return;
  }
  var tag = saved ? "Saved ✓" : "Not Saved · Click 'Save Location' to apply";
  $("info").innerHTML = "<b style='color:"+(saved?"#34c759":"#ff9500")+"'>"+tag+"</b>" + userTag + "　WGS-84 "+
    WGS.lat.toFixed(5)+", "+WGS.lng.toFixed(5)+"　Alt "+($("alt").value||"?")+"m";
}

// Toggle button state: Spoofing (gray button "Restore Real Location") / Restored (orange button "Re-enable Spoofing")
function updateEnabledUI(){
  var b=$("restorebtn");
  if(enabledState){ b.textContent="Restore Real Location"; b.style.background="#8e8e93"; }
  else { b.textContent="● Re-enable Spoofing"; b.style.background="#ff9500"; }
  info();
}

// Toggle spoofing / real location
function toggleEnabled(){
  var want = !enabledState;
  fetch("/enable?token="+encodeURIComponent(token),{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({enabled:want})})
    .then(function(r){
      if(r.ok){ enabledState=want; updateEnabledUI();
        toast(want ? "Spoofing enabled. Toggle Location Services to apply." : "Real location restored. Toggle Location Services to apply."); }
      else toast("Toggle failed "+r.status);
    })
    .catch(function(){ toast("Network error"); });
}

function dispPos(lat, lng){
  var aLat = lat !== undefined ? lat : WGS.lat;
  var aLng = lng !== undefined ? lng : WGS.lng;
  return datum === "gcj" ? GCJ.wgs2gcj(aLat, aLng) : [aLat, aLng];
}
function toWgs(lat,lng){lng=wrapLng(lng);return datum==="gcj"?GCJ.gcj2wgs(lat,lng):[lat,lng];}

function fetchElevation(lat,lng){
  lng=wrapLng(lng);
  return fetch("https://api.open-meteo.com/v1/elevation?latitude="+lat+"&longitude="+lng)
    .then(function(r){return r.json();})
    .then(function(d){return (d&&d.elevation&&d.elevation.length)?d.elevation[0]:null;})
    .catch(function(){return null;});
}

function movePin(dispLat,dispLng){
  dispLng=wrapLng(dispLng);
  var w=toWgs(dispLat,dispLng);
  WGS={lat:w[0], lng:wrapLng(w[1])};
  saved=false;
  marker.setLatLng([dispLat,dispLng]);
  if(document.activeElement !== $("coord")){
    $("coord").value = WGS.lat.toFixed(5) + "," + WGS.lng.toFixed(5);
  }
  info();
  updateCooldownUI();
  fetchElevation(WGS.lat,WGS.lng).then(function(el){ if(el!==null)$("alt").value=Math.round(el); info(); });
}

function setWgsLocation(lat,lng){
  lat=Number(lat);
  lng=wrapLng(Number(lng));
  if(!Number.isFinite(lat)||!Number.isFinite(lng)||lat<-90||lat>90||lng<-180||lng>180){
    toast("Invalid lat,lng (e.g. 35.46436,139.62461)");
    return false;
  }
  WGS={lat:lat,lng:lng};
  saved=false;
  var p=dispPos();
  marker.setLatLng(p);
  map.setView(p,15);
  $("coord").value=WGS.lat.toFixed(5)+","+WGS.lng.toFixed(5);
  info();
  updateCooldownUI();
  fetchElevation(WGS.lat,WGS.lng).then(function(el){ if(el!==null)$("alt").value=Math.round(el); info(); });
  toast("Moved to "+WGS.lat.toFixed(5)+", "+WGS.lng.toFixed(5));
  return true;
}

function jumpToCoord(raw){
  var str = (raw != null ? String(raw) : $("coord").value).trim();
  if(!str) return false;
  str = str.replace(/^["'\s(]+|["'\s)]+$/g, '');
  var parts = str.split(/[,;\s\/]+/);
  if(parts.length < 2) return false;
  var lat = Number(parts[0]);
  var lng = Number(parts[1]);
  if(isNaN(lat) || isNaN(lng)) return false;
  return setWgsLocation(lat, lng);
}

function commit(){
  var payload={lat:WGS.lat, lng:WGS.lng,
    altitude:numOrNull("alt"), horizontalAccuracy:numOrNull("hacc"), verticalAccuracy:numOrNull("vacc")};
  fetch("/set?token="+encodeURIComponent(token),{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)})
    .then(function(r){
      if(r.ok){
        r.json().then(function(d){ if(d && d.userName){ currentUserName = d.userName; info(); } }).catch(function(){});
        saved=true; enabledState=true; updateEnabledUI(); toast("Saved ✓ Takes effect in Loon/Shadowrocket within 60s");
      } else { toast("Save failed "+r.status); }
    })
    .catch(function(){ toast("Network error"); });
}

var BATCH_KEY = "lp_batch_v2";

function getBatchData(){
  try {
    var raw = localStorage.getItem(BATCH_KEY);
    var a = raw ? JSON.parse(raw) : [];
    return Array.isArray(a) ? a : [];
  } catch(e){ return []; }
}

function saveBatchData(list){
  try { localStorage.setItem(BATCH_KEY, JSON.stringify(list)); } catch(e){}
}

function renderBatchList(){
  var container = $("batchlist");
  if (!container) return;
  var list = getBatchData();
  container.innerHTML = "";
  if (!list.length) return;

  list.forEach(function(item, idx){
    var row = document.createElement("div");
    row.style.cssText = "padding:8px 10px;margin-bottom:6px;border:1px solid "+(item.checked?"#90caf9":"#eee")+";border-radius:6px;background:"+(item.checked?"#e3f2fd":"#fff")+";display:flex;align-items:center;gap:8px;";

    var text = document.createElement("span");
    text.style.cssText = "flex:1;font-size:13px;font-family:monospace;" + (item.checked ? "font-weight:bold;color:#1565c0;" : "color:#333;");
    text.textContent = (idx + 1) + ". " + Number(item.lat).toFixed(5) + ", " + Number(item.lng).toFixed(5);

    var goBtn = document.createElement("button");
    goBtn.type = "button";
    goBtn.textContent = "Go";
    goBtn.style.cssText = "padding:6px 12px;font-size:13px;border:0;border-radius:6px;background:#007aff;color:#fff;cursor:pointer;font-weight:600;";
    goBtn.addEventListener("click", function(){
      setWgsLocation(item.lat, item.lng);
    });

    var checkBtn = document.createElement("button");
    checkBtn.type = "button";
    checkBtn.textContent = item.checked ? "✓ Checked" : "Check";
    checkBtn.style.cssText = "padding:6px 12px;font-size:13px;border:0;border-radius:6px;background:" + (item.checked ? "#34c759" : "#8e8e93") + ";color:#fff;cursor:pointer;";
    checkBtn.addEventListener("click", function(){
      var current = getBatchData();
      if (current[idx]) {
        current[idx].checked = !current[idx].checked;
        saveBatchData(current);
        renderBatchList();
      }
    });

    row.appendChild(text);
    row.appendChild(goBtn);
    row.appendChild(checkBtn);
    container.appendChild(row);
  });
}

function parseAndGenerateBatch(){
  var inputEl = $("batchinput");
  if (!inputEl) return;
  var raw = inputEl.value.trim();
  if (!raw) {
    toast("Please enter or paste lat,lng lines first");
    return;
  }
  var lines = raw.split(/\\r?\\n/);
  var newList = [];
  lines.forEach(function(line){
    line = line.trim();
    if (!line) return;
    var m = line.match(/([+-]?\\d+(?:\\.\\d+)?)\\s*[,;\\s\\/]\\s*([+-]?\\d+(?:\\.\\d+)?)/);
    if (m) {
      var lat = Number(m[1]);
      var lng = Number(m[2]);
      if (Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        newList.push({ lat: lat, lng: lng, checked: false });
      }
    }
  });

  if (newList.length > 0) {
    saveBatchData(newList);
    renderBatchList();
    toast("Generated list with " + newList.length + " locations");
  } else {
    toast("No valid lat,lng coordinates found in input");
  }
}

function clearAllBatch(){
  saveBatchData([]);
  if ($("batchinput")) $("batchinput").value = "";
  renderBatchList();
  toast("Batch list cleared");
}

function locateCurrent(){
  if(enabledState){
    toast("Please restore real location and refresh Location Services first");
    return;
  }
  if(!navigator.geolocation){
    toast("Current browser does not support geolocation");
    return;
  }

  setLocateBusy(true);
  navigator.geolocation.getCurrentPosition(
    function(pos){
      var lat=Number(pos&&pos.coords&&pos.coords.latitude);
      var lng=wrapLng(pos&&pos.coords&&pos.coords.longitude);
      if(!Number.isFinite(lat)||!Number.isFinite(lng)){
        toast("Failed to get current location");
        setLocateBusy(false);
        return;
      }

      WGS={lat:lat,lng:lng};
      saved=false;
      var p=dispPos();
      marker.setLatLng(p);
      map.setView(p,16);
      info();
      fetchElevation(WGS.lat,WGS.lng).then(function(el){
        if(el!==null)$("alt").value=Math.round(el);
        info();
      });
      toast("Located to current position. Click Save Location to confirm.");
      setLocateBusy(false);
    },
    function(err){
      toast(geolocationErrorMessage(err));
      setLocateBusy(false);
    },
    {enableHighAccuracy:true,maximumAge:0,timeout:12000}
  );
}

function search(){
  var q=$("q").value.trim(); if(!q) return;
  if(jumpToCoord(q)){
    $("results").classList.remove("show");
    return;
  }
  fetch("https://nominatim.openstreetmap.org/search?format=json&addressdetails=0&limit=8&q="+encodeURIComponent(q))
    .then(function(r){return r.json();})
    .then(function(a){
      var box=$("results"); box.innerHTML="";
      if(!a||!a.length){ box.classList.remove("show"); toast("No results found"); return; }
      a.forEach(function(it){
        var row=document.createElement("div");
        row.className="rrow";
        row.textContent=it.display_name;
        row.addEventListener("click",function(){
          box.classList.remove("show"); box.innerHTML="";
          var la=+it.lat, lo=+it.lon;
          var p = datum==="gcj"?GCJ.wgs2gcj(la,lo):[la,lo];
          map.setView(p,15);
          toast("Map centered. Tap on map to place pin.");
        });
        box.appendChild(row);
      });
      box.classList.add("show");
    })
    .catch(function(){toast("Search failed");});
}

function load(){
  fetch("/loc.json?token="+encodeURIComponent(token)).then(function(r){return r.json();}).then(function(d){
    if(d && d.userName) currentUserName = d.userName;
    WGS={lat:d.latitude, lng:d.longitude};
    saved=true;
    enabledState=(d.enabled!==false);
    $("alt").value=(d.altitude!==undefined?d.altitude:"");
    $("hacc").value=(d.horizontalAccuracy!==undefined?d.horizontalAccuracy:39);
    $("vacc").value=(d.verticalAccuracy!==undefined?d.verticalAccuracy:1000);

    var amapVec=L.tileLayer("https://wprd0{s}.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scl=1&style=7",{subdomains:"1234",maxZoom:18,attribution:"Amap"});
    amapVec.datum="gcj";
    var amapSat=L.layerGroup([
      L.tileLayer("https://webst0{s}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}",{subdomains:"1234",maxZoom:18}),
      L.tileLayer("https://wprd0{s}.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scl=1&style=8",{subdomains:"1234",maxZoom:18})
    ]);
    amapSat.datum="gcj";
    var osm=L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19,attribution:"© OpenStreetMap"});
    osm.datum="wgs";
    var carto=L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",{subdomains:"abcd",maxZoom:20,attribution:"© OpenStreetMap, © CARTO"});
    carto.datum="wgs";
    var google=L.tileLayer("https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",{subdomains:"0123",maxZoom:20,attribution:"Google"});
    google.datum="wgs";
    var googleSat=L.tileLayer("https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",{subdomains:"0123",maxZoom:20,attribution:"Google"});
    googleSat.datum="wgs";

    var baseLayers={
      "Google Map": google,
      "Google Satellite": googleSat,
      "OSM (CARTO)": carto,
      "OSM Standard": osm,
      "Amap Map": amapVec,
      "Amap Satellite": amapSat
    };

    var savedLayerName="Google Map";
    try {
      var storedLayer=localStorage.getItem("lp_map_layer_v1");
      if(storedLayer && baseLayers[storedLayer]){
        savedLayerName=storedLayer;
      }
    } catch(e){}

    var activeLayer=baseLayers[savedLayerName] || google;

    map=L.map("map");
    activeLayer.addTo(map); datum=activeLayer.datum||"wgs";
    map.setView(dispPos(),13);
    L.control.layers(baseLayers,null,{collapsed:false}).addTo(map);

    marker=L.marker(dispPos(),{draggable:true}).addTo(map);
    $("coord").value = WGS.lat.toFixed(5) + "," + WGS.lng.toFixed(5);
    updateEnabledUI();
    setLocateBusy(false);

    map.on("baselayerchange",function(e){
      try { localStorage.setItem("lp_map_layer_v1", e.name); } catch(err){}
      datum=e.layer.datum||"wgs"; var p=dispPos(); marker.setLatLng(p); map.setView(p,map.getZoom());
      updateCpMapLayer();
      info();
    });
    map.on("click",function(e){movePin(e.latlng.lat,e.latlng.lng);});
    marker.on("dragend",function(){var p=marker.getLatLng(); movePin(p.lat,p.lng);});
  }).catch(function(){$("info").textContent="Load failed. Check if token is correct";});
}

var coordUserTyped = false;
$("coord").addEventListener("input", function(){ coordUserTyped = true; });

async function pasteClipboardAndGo(){
  if (navigator.clipboard && navigator.clipboard.readText) {
    try {
      var clip = await navigator.clipboard.readText();
      if (clip && typeof clip === "string") {
        var str = clip.trim().replace(/^["'\\s(]+|["'\\s)]+$/g, '');
        var parts = str.split(/[,;\\s\\/]+/);
        if (parts.length >= 2) {
          var cLat = Number(parts[0]), cLng = Number(parts[1]);
          if (Number.isFinite(cLat) && Number.isFinite(cLng) && cLat >= -90 && cLat <= 90 && cLng >= -180 && cLng <= 180) {
            $("coord").value = clip.trim();
            coordUserTyped = false;
            if (setWgsLocation(cLat, cLng)) {
              toast("Pasted & Moved: " + cLat.toFixed(5) + ", " + cLng.toFixed(5));
              return true;
            }
          }
        }
      }
    } catch(err){}
  }
  return false;
}

async function handleGoClick(){
  if (!coordUserTyped) {
    var ok = await pasteClipboardAndGo();
    if (ok) return;
  }
  coordUserTyped = false;
  if (!jumpToCoord()) toast("Enter lat,lng e.g. 35.46436,139.62461");
}

$("btn").addEventListener("click",search);
$("q").addEventListener("keydown",function(e){if(e.key==="Enter")search();});
$("jumpbtn").addEventListener("click",handleGoClick);
if($("pastebtn")) $("pastebtn").addEventListener("click", async function(){
  var ok = await pasteClipboardAndGo();
  if(!ok) toast("Clipboard has no valid coordinates");
});
$("coord").addEventListener("keydown",function(e){if(e.key==="Enter"){e.preventDefault();coordUserTyped=true;if(!jumpToCoord())toast("Enter lat,lng e.g. 35.46436,139.62461");}});
$("locatebtn").addEventListener("click",locateCurrent);
$("savebtn").addEventListener("click",commit);
$("restorebtn").addEventListener("click",toggleEnabled);
if($("checkpointbtn")) $("checkpointbtn").addEventListener("click",setCheckpoint);
if($("checkpointbtn2")) $("checkpointbtn2").addEventListener("click",setCheckpoint);
if($("clearcheckpointbtn")) $("clearcheckpointbtn").addEventListener("click",clearCheckpoint);
$("favadd").addEventListener("click",addFavorite);
if($("favadd2")) $("favadd2").addEventListener("click",addFavorite);
if($("favlistbtn")) $("favlistbtn").addEventListener("click",toggleFavs);
$("parsebatchbtn").addEventListener("click",parseAndGenerateBatch);
$("clearbatchbtn").addEventListener("click",clearAllBatch);
load();
renderFavs();
renderBatchList();
updateCooldownUI();
setInterval(updateCooldownUI,1000);
</script>
</body>
</html>`;
