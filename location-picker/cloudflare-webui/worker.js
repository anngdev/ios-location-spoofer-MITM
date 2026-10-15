// 与 location-picker/server.js 的 PAGE 保持一致（地图选点 UI）
// ⚠️ 本文件由 worker/src/page.js + worker/src/admin-page.js + worker/src/index.js 合并生成，请勿手改；
//    要改逻辑请改 worker/src/ 再重新合并，避免多份副本漂移。

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


export const ADMIN_PAGE = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
<meta name="referrer" content="strict-origin-when-cross-origin">
<title>Admin Dashboard — iOS Location Spoofer</title>
<style>
  :root {
    --bg-main: #090d16;
    --bg-card: #111827;
    --bg-card-hover: #172033;
    --bg-glass: rgba(17, 24, 39, 0.75);
    --border: rgba(255, 255, 255, 0.08);
    --border-hover: rgba(99, 102, 241, 0.4);
    --text-main: #f8fafc;
    --text-muted: #94a3b8;
    --primary: #6366f1;
    --primary-hover: #4f46e5;
    --accent: #06b6d4;
    --success: #10b981;
    --success-bg: rgba(16, 185, 129, 0.12);
    --danger: #ef4444;
    --danger-bg: rgba(239, 68, 68, 0.12);
    --warning: #f59e0b;
    --font: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, Helvetica, Arial, sans-serif;
    --radius-sm: 8px;
    --radius-md: 12px;
    --radius-lg: 18px;
    --shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5);
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    background-color: var(--bg-main);
    color: var(--text-main);
    font-family: var(--font);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    overflow-x: hidden;
    position: relative;
  }

  /* Ambient glowing backgrounds */
  body::before {
    content: "";
    position: fixed;
    top: -150px;
    left: -100px;
    width: 450px;
    height: 450px;
    background: radial-gradient(circle, rgba(99, 102, 241, 0.15), transparent 70%);
    pointer-events: none;
    z-index: 0;
  }
  body::after {
    content: "";
    position: fixed;
    bottom: -150px;
    right: -100px;
    width: 500px;
    height: 500px;
    background: radial-gradient(circle, rgba(6, 182, 212, 0.12), transparent 70%);
    pointer-events: none;
    z-index: 0;
  }

  .container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 24px 20px 60px;
    position: relative;
    z-index: 1;
  }

  /* Navigation Header */
  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 24px;
    border-bottom: 1px solid var(--border);
    margin-bottom: 28px;
    flex-wrap: wrap;
    gap: 16px;
  }
  .brand {
    display: flex;
    align-items: center;
    gap: 14px;
  }
  .brand-logo {
    width: 44px;
    height: 44px;
    border-radius: var(--radius-md);
    background: linear-gradient(135deg, #6366f1, #06b6d4);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 0 20px rgba(99, 102, 241, 0.4);
    flex-shrink: 0;
  }
  .brand-logo svg {
    width: 24px;
    height: 24px;
    fill: none;
    stroke: #fff;
    stroke-width: 2.2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  .brand-text h1 {
    font-size: 20px;
    font-weight: 700;
    letter-spacing: -0.02em;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .brand-badge {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    padding: 2px 8px;
    border-radius: 20px;
    background: rgba(99, 102, 241, 0.2);
    color: #a5b4fc;
    border: 1px solid rgba(99, 102, 241, 0.4);
  }
  .brand-subtitle {
    font-size: 13px;
    color: var(--text-muted);
    margin-top: 2px;
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  /* Stats Grid */
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 16px;
    margin-bottom: 28px;
  }
  .stat-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    padding: 20px;
    position: relative;
    overflow: hidden;
    transition: transform 0.2s, border-color 0.2s;
  }
  .stat-card:hover {
    transform: translateY(-2px);
    border-color: var(--border-hover);
  }
  .stat-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }
  .stat-title {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }
  .stat-icon {
    width: 32px;
    height: 32px;
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.05);
  }
  .stat-icon svg {
    width: 18px;
    height: 18px;
    stroke: var(--text-muted);
    stroke-width: 2;
    fill: none;
  }
  .stat-value {
    font-size: 32px;
    font-weight: 700;
    letter-spacing: -0.03em;
    color: #fff;
  }
  .stat-desc {
    font-size: 12px;
    color: var(--text-muted);
    margin-top: 4px;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .stat-pill {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    display: inline-block;
  }
  .stat-pill.active { background: var(--success); box-shadow: 0 0 8px var(--success); }

  /* Toolbar */
  .toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    margin-bottom: 20px;
    flex-wrap: wrap;
  }
  .search-wrap {
    flex: 1;
    min-width: 260px;
    position: relative;
  }
  .search-icon {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    width: 18px;
    height: 18px;
    stroke: var(--text-muted);
    stroke-width: 2;
    fill: none;
    pointer-events: none;
  }
  .search-input {
    width: 100%;
    height: 44px;
    padding: 0 16px 0 42px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    color: var(--text-main);
    font-size: 14px;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .search-input:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
  }
  .filter-select {
    height: 44px;
    padding: 0 36px 0 14px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    color: var(--text-main);
    font-size: 14px;
    outline: none;
    cursor: pointer;
    appearance: none;
    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: right 12px center;
    background-size: 16px;
  }

  /* Buttons */
  .btn {
    height: 44px;
    padding: 0 18px;
    border-radius: var(--radius-md);
    font-size: 14px;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    border: 1px solid transparent;
    cursor: pointer;
    transition: all 0.2s;
    text-decoration: none;
    color: #fff;
    white-space: nowrap;
  }
  .btn svg {
    width: 18px;
    height: 18px;
    stroke-width: 2;
    stroke: currentColor;
    fill: none;
  }
  .btn-primary {
    background: linear-gradient(135deg, var(--primary), var(--accent));
    box-shadow: 0 4px 15px rgba(99, 102, 241, 0.35);
  }
  .btn-primary:hover {
    background: linear-gradient(135deg, var(--primary-hover), #0891b2);
    box-shadow: 0 6px 20px rgba(99, 102, 241, 0.5);
    transform: translateY(-1px);
  }
  .btn-secondary {
    background: var(--bg-card);
    border-color: var(--border);
    color: var(--text-main);
  }
  .btn-secondary:hover {
    background: var(--bg-card-hover);
    border-color: var(--border-hover);
  }
  .btn-sm {
    height: 34px;
    padding: 0 12px;
    font-size: 13px;
    border-radius: var(--radius-sm);
  }
  .btn-danger {
    background: var(--danger-bg);
    color: var(--danger);
    border-color: rgba(239, 68, 68, 0.3);
  }
  .btn-danger:hover {
    background: var(--danger);
    color: #fff;
  }

  /* User List Grid */
  .users-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
    gap: 18px;
  }
  .user-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 22px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    position: relative;
    transition: all 0.25s ease;
  }
  .user-card:hover {
    border-color: var(--border-hover);
    box-shadow: var(--shadow);
    transform: translateY(-2px);
  }
  .user-card.disabled-user {
    opacity: 0.65;
    border-style: dashed;
  }

  .user-card-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
  }
  .user-identity {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
  }
  .user-avatar {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    font-weight: 700;
    color: #fff;
    flex-shrink: 0;
    text-transform: uppercase;
    box-shadow: 0 4px 10px rgba(0,0,0,0.3);
  }
  .user-info {
    min-width: 0;
  }
  .user-name {
    font-size: 16px;
    font-weight: 700;
    color: #fff;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .user-note {
    font-size: 13px;
    color: var(--text-muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-top: 2px;
  }

  .status-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    flex-shrink: 0;
  }
  .status-badge.active {
    background: var(--success-bg);
    color: #34d399;
    border: 1px solid rgba(16, 185, 129, 0.3);
  }
  .status-badge.disabled {
    background: rgba(148, 163, 184, 0.12);
    color: #94a3b8;
    border: 1px solid rgba(148, 163, 184, 0.25);
  }

  /* Token Row inside Card */
  .token-box {
    background: rgba(0, 0, 0, 0.25);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: var(--radius-sm);
    padding: 8px 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }
  .token-label {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    color: var(--text-muted);
  }
  .token-value {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 13px;
    color: #cbd5e1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
    text-align: right;
  }
  .token-actions {
    display: flex;
    gap: 4px;
    flex-shrink: 0;
  }
  .icon-btn {
    width: 28px;
    height: 28px;
    border-radius: 6px;
    border: 0;
    background: transparent;
    color: var(--text-muted);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s;
  }
  .icon-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
  }
  .icon-btn svg {
    width: 15px;
    height: 15px;
    stroke: currentColor;
    stroke-width: 2;
    fill: none;
  }

  /* Location Info in Card */
  .loc-panel {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 10px 14px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .loc-status-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 12px;
  }
  .loc-tag {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-weight: 600;
  }
  .loc-coords {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 13px;
    font-weight: 600;
    color: #38bdf8;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .loc-coords svg {
    width: 14px;
    height: 14px;
    stroke: #38bdf8;
    stroke-width: 2;
    fill: none;
  }
  .loc-metrics {
    display: flex;
    gap: 12px;
    font-size: 11px;
    color: var(--text-muted);
    margin-top: 2px;
  }

  /* Card Actions footer */
  .card-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: auto;
    padding-top: 10px;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    flex-wrap: wrap;
  }

  /* Empty State */
  .empty-state {
    grid-column: 1 / -1;
    text-align: center;
    padding: 60px 20px;
    background: var(--bg-card);
    border: 1px dashed var(--border);
    border-radius: var(--radius-lg);
  }
  .empty-icon {
    width: 56px;
    height: 56px;
    margin: 0 auto 16px;
    border-radius: 50%;
    background: rgba(99, 102, 241, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .empty-icon svg {
    width: 28px;
    height: 28px;
    stroke: var(--primary);
    stroke-width: 2;
    fill: none;
  }
  .empty-title {
    font-size: 18px;
    font-weight: 700;
    margin-bottom: 6px;
  }
  .empty-desc {
    color: var(--text-muted);
    font-size: 14px;
    max-width: 400px;
    margin: 0 auto 20px;
  }

  /* Modal System */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.75);
    backdrop-filter: blur(6px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 16px;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s ease;
  }
  .modal-overlay.show {
    opacity: 1;
    pointer-events: auto;
  }
  .modal {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    width: 100%;
    max-width: 520px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: var(--shadow);
    transform: scale(0.95) translateY(10px);
    transition: transform 0.2s ease;
    display: flex;
    flex-direction: column;
  }
  .modal-overlay.show .modal {
    transform: scale(1) translateY(0);
  }
  .modal-head {
    padding: 20px 24px;
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .modal-title {
    font-size: 18px;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .modal-close {
    background: transparent;
    border: 0;
    color: var(--text-muted);
    cursor: pointer;
    width: 32px;
    height: 32px;
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .modal-close:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
  }
  .modal-close svg {
    width: 18px;
    height: 18px;
    stroke: currentColor;
    stroke-width: 2;
    fill: none;
  }
  .modal-body {
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .modal-foot {
    padding: 18px 24px;
    border-top: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 10px;
    background: rgba(0, 0, 0, 0.15);
  }

  /* Form Controls */
  .form-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .form-label {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-muted);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .form-input, .form-textarea {
    width: 100%;
    padding: 10px 14px;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    color: #fff;
    font-size: 14px;
    font-family: inherit;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .form-input:focus, .form-textarea:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
  }
  .input-with-action {
    display: flex;
    gap: 8px;
  }

  /* Preset Pills */
  .preset-row {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 4px;
  }
  .preset-pill {
    padding: 6px 12px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid var(--border);
    border-radius: 20px;
    font-size: 12px;
    color: #cbd5e1;
    cursor: pointer;
    transition: all 0.15s;
  }
  .preset-pill:hover {
    background: rgba(99, 102, 241, 0.2);
    border-color: var(--primary);
    color: #fff;
  }

  /* Code Snippet Block */
  .code-block {
    background: #090d16;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 12px 14px;
    position: relative;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 12px;
    color: #e2e8f0;
    word-break: break-all;
    line-height: 1.5;
  }
  .copy-code-btn {
    position: absolute;
    top: 8px;
    right: 8px;
    padding: 4px 8px;
    font-size: 11px;
    background: rgba(255, 255, 255, 0.1);
    border: 0;
    border-radius: 4px;
    color: #cbd5e1;
    cursor: pointer;
  }
  .copy-code-btn:hover {
    background: var(--primary);
    color: #fff;
  }

  /* Toast Notification */
  .toast {
    position: fixed;
    bottom: 24px;
    right: 24px;
    background: #1e293b;
    border: 1px solid rgba(255, 255, 255, 0.15);
    box-shadow: 0 10px 25px rgba(0,0,0,0.5);
    color: #fff;
    padding: 12px 20px;
    border-radius: var(--radius-md);
    font-size: 14px;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 10px;
    z-index: 2000;
    transform: translateY(100px);
    opacity: 0;
    transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .toast.show {
    transform: translateY(0);
    opacity: 1;
  }

  /* Login Card View */
  .login-view {
    display: none;
    min-height: 80vh;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }
  .login-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow);
    width: 100%;
    max-width: 420px;
    padding: 36px 30px;
    text-align: center;
    position: relative;
    overflow: hidden;
  }
  .login-card::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, var(--primary), var(--accent));
  }
  .login-icon {
    width: 60px;
    height: 60px;
    border-radius: var(--radius-md);
    background: linear-gradient(135deg, #6366f1, #06b6d4);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 20px;
    box-shadow: 0 0 25px rgba(99, 102, 241, 0.45);
  }
  .login-icon svg {
    width: 32px;
    height: 32px;
    stroke: #fff;
    stroke-width: 2.2;
    fill: none;
  }
  .login-title {
    font-size: 22px;
    font-weight: 700;
    margin-bottom: 8px;
  }
  .login-subtitle {
    font-size: 14px;
    color: var(--text-muted);
    margin-bottom: 26px;
    line-height: 1.4;
  }

  /* Responsive tweaks */
  @media (max-width: 640px) {
    .container { padding: 16px 12px 40px; }
    .brand-text h1 { font-size: 18px; }
    .stats-grid { grid-template-columns: 1fr; }
    .users-grid { grid-template-columns: 1fr; }
    .toolbar { flex-direction: column; align-items: stretch; }
    .header-actions { width: 100%; justify-content: flex-end; }
  }
</style>
</head>
<body>

<div class="container" id="appContainer">
  <!-- Top Navigation Header -->
  <header>
    <div class="brand">
      <div class="brand-logo">
        <svg viewBox="0 0 24 24"><path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"></path><circle cx="12" cy="10" r="3"></circle></svg>
      </div>
      <div class="brand-text">
        <h1>Location Spoofer <span class="brand-badge">Admin</span></h1>
        <div class="brand-subtitle" id="serverStatusText">Multi-user Management Console</div>
      </div>
    </div>
    <div class="header-actions">
      <button class="btn btn-secondary btn-sm" id="refreshBtn" title="Refresh Users">
        <svg viewBox="0 0 24 24"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path></svg>
        Refresh
      </button>
      <button class="btn btn-primary" id="openAddUserBtn">
        <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        Add User
      </button>
      <button class="btn btn-secondary btn-sm" id="logoutBtn" title="Sign Out">
        <svg viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
      </button>
    </div>
  </header>

  <!-- Metric Stat Cards -->
  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-top">
        <div class="stat-title">Total Users</div>
        <div class="stat-icon">
          <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
        </div>
      </div>
      <div class="stat-value" id="statTotalUsers">0</div>
      <div class="stat-desc">Registered proxy devices</div>
    </div>

    <div class="stat-card">
      <div class="stat-top">
        <div class="stat-title">Active Tokens</div>
        <div class="stat-icon">
          <svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
        </div>
      </div>
      <div class="stat-value" id="statActiveUsers">0</div>
      <div class="stat-desc"><span class="stat-pill active"></span> Allowed to fetch & spoof</div>
    </div>

    <div class="stat-card">
      <div class="stat-top">
        <div class="stat-title">Spoofing Active</div>
        <div class="stat-icon">
          <svg viewBox="0 0 24 24"><polygon points="3 11 22 2 13 21 11 13 3 11"></polygon></svg>
        </div>
      </div>
      <div class="stat-value" id="statSpoofingActive">0</div>
      <div class="stat-desc">Locations currently intercepted</div>
    </div>

    <div class="stat-card">
      <div class="stat-top">
        <div class="stat-title">Passthrough Mode</div>
        <div class="stat-icon">
          <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 14 14"></polyline></svg>
        </div>
      </div>
      <div class="stat-value" id="statPassthrough">0</div>
      <div class="stat-desc">Restoring real GPS location</div>
    </div>
  </div>

  <!-- Filter & Search Toolbar -->
  <div class="toolbar">
    <div class="search-wrap">
      <svg class="search-icon" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
      <input type="text" class="search-input" id="userSearchInput" placeholder="Filter by user name, token, note, or coordinates...">
    </div>
    <select class="filter-select" id="statusFilterSelect">
      <option value="all">All Users</option>
      <option value="active">Active Only</option>
      <option value="disabled">Disabled Only</option>
      <option value="spoofing">Spoofing Enabled</option>
    </select>
  </div>

  <!-- Users Grid Section -->
  <div class="users-grid" id="usersListContainer">
    <!-- Populated by JavaScript -->
  </div>
</div>

<!-- Login View (When unauthenticated) -->
<div class="login-view" id="loginView">
  <div class="login-card">
    <div class="login-icon">
      <svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
    </div>
    <h2 class="login-title">Admin Authentication</h2>
    <p class="login-subtitle">Enter your Admin Secret Token to manage users and proxy endpoints.</p>
    <form id="loginForm">
      <div class="form-group" style="text-align: left; margin-bottom: 20px;">
        <label class="form-label" for="adminTokenInput">Admin Secret Token</label>
        <input type="password" class="form-input" id="adminTokenInput" placeholder="Paste your ADMIN_TOKEN here..." required autocomplete="current-password">
      </div>
      <button type="submit" class="btn btn-primary" style="width: 100%; height: 46px;" id="loginSubmitBtn">
        Authenticate & Enter
      </button>
    </form>
  </div>
</div>

<!-- Modal: Add User -->
<div class="modal-overlay" id="addUserModal">
  <div class="modal">
    <div class="modal-head">
      <div class="modal-title">
        <svg viewBox="0 0 24 24" style="width:20px;height:20px;stroke:var(--primary);stroke-width:2;fill:none;"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
        Create New User Token
      </div>
      <button class="modal-close" data-close="addUserModal">&times;</button>
    </div>
    <form id="addUserForm">
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">User / Device Name *</label>
          <input type="text" class="form-input" id="newUserName" placeholder="e.g. Alice — iPhone 15 Pro" required>
        </div>
        <div class="form-group">
          <label class="form-label">Description / Note</label>
          <input type="text" class="form-input" id="newUserNote" placeholder="e.g. Personal device, iOS 18">
        </div>
        <div class="form-group">
          <label class="form-label">
            Access Token
            <span style="font-weight: normal; font-size: 11px;">(Auto-generated secure hex)</span>
          </label>
          <div class="input-with-action">
            <input type="text" class="form-input" id="newUserToken" placeholder="Leave blank to auto-generate..." style="font-family: monospace; font-size: 12px;">
            <button type="button" class="btn btn-secondary btn-sm" id="genRandomTokenBtn" title="Generate Random Hex">
              <svg viewBox="0 0 24 24"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path></svg>
              Random
            </button>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Initial Location Preset</label>
          <div class="preset-row">
            <button type="button" class="preset-pill" data-lat="37.3349" data-lng="-122.00902" data-alt="530">Apple Park (CA)</button>
            <button type="button" class="preset-pill" data-lat="35.68124" data-lng="139.76712" data-alt="35">Tokyo Station</button>
            <button type="button" class="preset-pill" data-lat="40.75889" data-lng="-73.98513" data-alt="45">Times Square (NYC)</button>
            <button type="button" class="preset-pill" data-lat="51.50073" data-lng="-0.12462" data-alt="15">Big Ben (London)</button>
            <button type="button" class="preset-pill" data-lat="21.02851" data-lng="105.85444" data-alt="20">Hanoi Old Quarter</button>
          </div>
        </div>
      </div>
      <div class="modal-foot">
        <button type="button" class="btn btn-secondary" data-close="addUserModal">Cancel</button>
        <button type="submit" class="btn btn-primary" id="saveNewUserBtn">Create User</button>
      </div>
    </form>
  </div>
</div>

<!-- Modal: Edit User -->
<div class="modal-overlay" id="editUserModal">
  <div class="modal">
    <div class="modal-head">
      <div class="modal-title">Edit User Details</div>
      <button class="modal-close" data-close="editUserModal">&times;</button>
    </div>
    <form id="editUserForm">
      <input type="hidden" id="editUserId">
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">User / Device Name</label>
          <input type="text" class="form-input" id="editUserName" required>
        </div>
        <div class="form-group">
          <label class="form-label">Description / Note</label>
          <input type="text" class="form-input" id="editUserNote">
        </div>
        <div class="form-group">
          <label class="form-label">Account Status</label>
          <select class="form-input" id="editUserActive">
            <option value="true">Active (Allowed to spoof)</option>
            <option value="false">Disabled (Blocked / 403)</option>
          </select>
        </div>
      </div>
      <div class="modal-foot">
        <button type="button" class="btn btn-secondary" data-close="editUserModal">Cancel</button>
        <button type="submit" class="btn btn-primary">Save Changes</button>
      </div>
    </form>
  </div>
</div>

<!-- Modal: Setup URLs & Integration Snippets -->
<div class="modal-overlay" id="configModal">
  <div class="modal" style="max-width: 650px;">
    <div class="modal-head">
      <div class="modal-title" id="configModalTitle">User Proxy Setup & URLs</div>
      <button class="modal-close" data-close="configModal">&times;</button>
    </div>
    <div class="modal-body" style="gap: 20px;">
      <!-- Web Picker URL -->
      <div class="form-group">
        <label class="form-label">
          Map Picker Web Page URL
          <span style="font-weight: normal; font-size: 11px;">(Open in Safari to pick & save location)</span>
        </label>
        <div class="code-block" id="cfgMapUrl">
          Loading...
          <button class="copy-code-btn" data-copy-target="cfgMapUrl">Copy</button>
        </div>
      </div>

      <!-- Config JSON URL -->
      <div class="form-group">
        <label class="form-label">
          Proxy Config URL (loc.json)
          <span style="font-weight: normal; font-size: 11px;">(Read by Shadowrocket / Loon / Surge)</span>
        </label>
        <div class="code-block" id="cfgJsonUrl">
          Loading...
          <button class="copy-code-btn" data-copy-target="cfgJsonUrl">Copy</button>
        </div>
      </div>

      <!-- Loon & Shadowrocket Argument Snippet -->
      <div class="form-group">
        <label class="form-label">
          Shadowrocket / Loon Module Argument
          <span style="font-weight: normal; font-size: 11px;">(Append to module argument=)</span>
        </label>
        <div class="code-block" id="cfgArgSnippet">
          Loading...
          <button class="copy-code-btn" data-copy-target="cfgArgSnippet">Copy</button>
        </div>
      </div>
    </div>
    <div class="modal-foot">
      <a href="#" target="_blank" class="btn btn-secondary btn-sm" id="cfgOpenMapBtn">Open Map Picker</a>
      <button type="button" class="btn btn-primary btn-sm" data-close="configModal">Done</button>
    </div>
  </div>
</div>

<!-- Modal: Delete Confirmation -->
<div class="modal-overlay" id="deleteModal">
  <div class="modal" style="max-width: 440px;">
    <div class="modal-head">
      <div class="modal-title" style="color: var(--danger);">Confirm Delete User</div>
      <button class="modal-close" data-close="deleteModal">&times;</button>
    </div>
    <div class="modal-body">
      <p style="font-size: 14px; line-height: 1.5; color: #cbd5e1;">
        Are you sure you want to delete user <strong id="deleteUserNameText" style="color:#fff;"></strong>?
      </p>
      <p style="font-size: 13px; color: var(--text-muted); line-height: 1.4;">
        This action will permanently revoke their access token and erase their saved location coordinates.
      </p>
    </div>
    <div class="modal-foot">
      <button type="button" class="btn btn-secondary" data-close="deleteModal">Cancel</button>
      <button type="button" class="btn btn-danger" id="confirmDeleteBtn">Delete User</button>
    </div>
  </div>
</div>

<!-- Floating Toast -->
<div class="toast" id="toast"></div>

<script>
(function() {
  var ADMIN_TOKEN_KEY = "lp_admin_token";
  var currentAdminToken = "";
  var allUsers = [];
  var userToDelete = null;

  function $(id) { return document.getElementById(id); }

  function showToast(msg) {
    var t = $("toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(t._tm);
    t._tm = setTimeout(function() {
      t.classList.remove("show");
    }, 2800);
  }

  function getAvatarColor(str) {
    var colors = [
      "linear-gradient(135deg, #6366f1, #06b6d4)",
      "linear-gradient(135deg, #ec4899, #8b5cf6)",
      "linear-gradient(135deg, #10b981, #059669)",
      "linear-gradient(135deg, #f59e0b, #d97706)",
      "linear-gradient(135deg, #3b82f6, #1d4ed8)",
      "linear-gradient(135deg, #84cc16, #10b981)"
    ];
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }

  function getInitials(name) {
    if (!name) return "U";
    var parts = name.trim().split(/\\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  }

  function timeAgo(ts) {
    if (!ts) return "Never";
    var diff = Math.floor((Date.now() - Number(ts)) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) return Math.floor(diff / 60) + "m ago";
    if (diff < 86400) return Math.floor(diff / 3600) + "h ago";
    return Math.floor(diff / 86400) + "d ago";
  }

  function generateHexToken(len) {
    var bytes = new Uint8Array(len || 24);
    if (window.crypto && window.crypto.getRandomValues) {
      window.crypto.getRandomValues(bytes);
    } else {
      for (var i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
    }
    return Array.from(bytes).map(function(b) { return b.toString(16).padStart(2, "0"); }).join("");
  }

  function copyText(text, successMsg) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function() {
        showToast(successMsg || "Copied to clipboard!");
      }).catch(function() {
        fallbackCopy(text, successMsg);
      });
    } else {
      fallbackCopy(text, successMsg);
    }
  }

  function fallbackCopy(text, successMsg) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
      showToast(successMsg || "Copied to clipboard!");
    } catch(e) {
      showToast("Failed to copy. Please copy manually.");
    }
    document.body.removeChild(ta);
  }

  // API Call helper
  function adminFetch(path, options) {
    options = options || {};
    options.headers = options.headers || {};
    options.headers["X-Admin-Token"] = currentAdminToken;
    if (options.body && typeof options.body === "object") {
      options.headers["Content-Type"] = "application/json";
      options.body = JSON.stringify(options.body);
    }
    return fetch(path, options).then(function(res) {
      if (res.status === 401 || res.status === 403) {
        showLoginView();
        throw new Error("Authentication failed");
      }
      return res.json();
    });
  }

  function showLoginView() {
    $("appContainer").style.display = "none";
    $("loginView").style.display = "flex";
  }

  function showAppView() {
    $("loginView").style.display = "none";
    $("appContainer").style.display = "block";
  }

  function initAuth() {
    // Check url search params for ?token= or ?admin_token=
    var params = new URLSearchParams(window.location.search);
    var urlToken = params.get("token") || params.get("admin_token");
    if (urlToken) {
      currentAdminToken = urlToken;
      try { localStorage.setItem(ADMIN_TOKEN_KEY, urlToken); } catch(e){}
    } else {
      try { currentAdminToken = localStorage.getItem(ADMIN_TOKEN_KEY) || ""; } catch(e){}
    }

    if (!currentAdminToken) {
      showLoginView();
      return;
    }

    // Verify token with backend
    adminFetch("/api/admin/info").then(function(data) {
      if (data && data.ok) {
        showAppView();
        loadUsers();
      } else {
        showLoginView();
      }
    }).catch(function() {
      showLoginView();
    });
  }

  // Load and render users
  function loadUsers() {
    adminFetch("/api/admin/users").then(function(data) {
      if (data && data.ok) {
        allUsers = data.users || [];
        updateStats();
        renderUsersList();
      }
    }).catch(function(err) {
      showToast("Error loading users: " + err.message);
    });
  }

  function updateStats() {
    var total = allUsers.length;
    var active = 0;
    var spoofing = 0;
    var passthrough = 0;

    allUsers.forEach(function(u) {
      if (u.active !== false) active++;
      var loc = u.location || {};
      if (loc.enabled) spoofing++;
      else passthrough++;
    });

    $("statTotalUsers").textContent = total;
    $("statActiveUsers").textContent = active;
    $("statSpoofingActive").textContent = spoofing;
    $("statPassthrough").textContent = passthrough;
  }

  function renderUsersList() {
    var container = $("usersListContainer");
    container.innerHTML = "";

    var q = ($("userSearchInput").value || "").trim().toLowerCase();
    var filter = $("statusFilterSelect").value;

    var filtered = allUsers.filter(function(u) {
      if (filter === "active" && u.active === false) return false;
      if (filter === "disabled" && u.active !== false) return false;
      if (filter === "spoofing" && (!u.location || !u.location.enabled)) return false;

      if (!q) return true;
      var nameMatch = (u.name || "").toLowerCase().indexOf(q) !== -1;
      var noteMatch = (u.note || "").toLowerCase().indexOf(q) !== -1;
      var tokenMatch = (u.token || "").toLowerCase().indexOf(q) !== -1;
      var coordMatch = u.location ? (u.location.latitude + "," + u.location.longitude).indexOf(q) !== -1 : false;
      return nameMatch || noteMatch || tokenMatch || coordMatch;
    });

    if (filtered.length === 0) {
      container.innerHTML = [
        '<div class="empty-state">',
        '  <div class="empty-icon"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="8" y1="12" x2="16" y2="12"></line></svg></div>',
        '  <h3 class="empty-title">No Users Found</h3>',
        '  <p class="empty-desc">No proxy users match the current filter. Create a new user token to get started!</p>',
        '  <button class="btn btn-primary" onclick="document.getElementById(\\'openAddUserBtn\\').click()">Create First User</button>',
        '</div>'
      ].join("");
      return;
    }

    filtered.forEach(function(u) {
      var card = document.createElement("div");
      card.className = "user-card" + (u.active === false ? " disabled-user" : "");

      var loc = u.location || { enabled: true, latitude: 37.3349, longitude: -122.00902 };
      var isSpoofing = loc.enabled !== false;
      var lastUpdated = loc.updatedAt || u.updatedAt || u.createdAt;

      var tokenShort = u.token ? (u.token.slice(0, 6) + "••••••••" + u.token.slice(-6)) : "";

      card.innerHTML = [
        '<div class="user-card-head">',
        '  <div class="user-identity">',
        '    <div class="user-avatar" style="background: ' + getAvatarColor(u.name || u.id) + '">' + getInitials(u.name) + '</div>',
        '    <div class="user-info">',
        '      <div class="user-name" title="' + escapeHtml(u.name) + '">' + escapeHtml(u.name) + '</div>',
        '      <div class="user-note" title="' + escapeHtml(u.note || "No notes") + '">' + escapeHtml(u.note || "No device notes") + '</div>',
        '    </div>',
        '  </div>',
        '  <div class="status-badge ' + (u.active !== false ? 'active' : 'disabled') + '">',
        '    ' + (u.active !== false ? '● Active' : '✕ Disabled'),
        '  </div>',
        '</div>',

        '<div class="token-box">',
        '  <div class="token-label">Token:</div>',
        '  <div class="token-value" id="tokval_' + u.id + '" data-full="' + u.token + '" data-short="' + tokenShort + '">' + tokenShort + '</div>',
        '  <div class="token-actions">',
        '    <button class="icon-btn" title="Toggle Show/Hide" data-action="toggle-token" data-id="' + u.id + '">',
        '      <svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>',
        '    </button>',
        '    <button class="icon-btn" title="Copy Token" data-action="copy-token" data-token="' + u.token + '">',
        '      <svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>',
        '    </button>',
        '  </div>',
        '</div>',

        '<div class="loc-panel">',
        '  <div class="loc-status-row">',
        '    <span class="loc-tag" style="color: ' + (isSpoofing ? 'var(--success)' : 'var(--text-muted)') + '">',
        '      <span class="stat-pill ' + (isSpoofing ? 'active' : '') + '"></span>',
        '      ' + (isSpoofing ? 'Spoofing Enabled' : 'Real GPS Passthrough'),
        '    </span>',
        '    <span style="font-size: 11px; color: var(--text-muted);">' + timeAgo(lastUpdated) + '</span>',
        '  </div>',
        '  <div class="loc-coords" title="Click to copy coordinates" data-action="copy-coords" data-coords="' + Number(loc.latitude).toFixed(5) + ',' + Number(loc.longitude).toFixed(5) + '" style="cursor: pointer;">',
        '    <svg viewBox="0 0 24 24"><path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"></path><circle cx="12" cy="10" r="3"></circle></svg>',
        '    ' + Number(loc.latitude).toFixed(5) + ', ' + Number(loc.longitude).toFixed(5),
        '  </div>',
        '  <div class="loc-metrics">',
        '    <span>Alt: ' + (loc.altitude != null ? loc.altitude + 'm' : 'Auto') + '</span>',
        '    <span>H-Acc: ' + (loc.horizontalAccuracy || 39) + 'm</span>',
        '  </div>',
        '</div>',

        '<div class="card-actions">',
        '  <a href="/?token=' + encodeURIComponent(u.token) + '" target="_blank" class="btn btn-secondary btn-sm" title="Open Map Picker in New Tab">',
        '    <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><polygon points="12 8 8 12 12 16 12 8"></polygon></svg>',
        '    Map',
        '  </a>',
        '  <button class="btn btn-secondary btn-sm" data-action="show-config" data-id="' + u.id + '" title="View Integration URLs">',
        '    <svg viewBox="0 0 24 24"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>',
        '    Config',
        '  </button>',
        '  <button class="btn btn-secondary btn-sm" data-action="edit-user" data-id="' + u.id + '" title="Edit Name & Status">',
        '    <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>',
        '    Edit',
        '  </button>',
        '  <button class="btn btn-secondary btn-sm" data-action="reset-token" data-id="' + u.id + '" title="Regenerate Token">',
        '    <svg viewBox="0 0 24 24"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path></svg>',
        '  </button>',
        '  <button class="btn btn-danger btn-sm" data-action="delete-user" data-id="' + u.id + '" title="Delete User">',
        '    <svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>',
        '  </button>',
        '</div>'
      ].join("");

      container.appendChild(card);
    });
  }

  function escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // Delegated events for cards
  $("usersListContainer").addEventListener("click", function(e) {
    var btn = e.target.closest("[data-action]");
    if (!btn) return;
    var action = btn.dataset.action;

    if (action === "toggle-token") {
      var id = btn.dataset.id;
      var el = $("tokval_" + id);
      if (el) {
        if (el.textContent === el.dataset.short) {
          el.textContent = el.dataset.full;
        } else {
          el.textContent = el.dataset.short;
        }
      }
    } else if (action === "copy-token") {
      copyText(btn.dataset.token, "Token copied!");
    } else if (action === "copy-coords") {
      copyText(btn.dataset.coords, "Coordinates copied: " + btn.dataset.coords);
    } else if (action === "show-config") {
      var u = allUsers.find(function(x) { return x.id === btn.dataset.id; });
      if (u) openConfigModal(u);
    } else if (action === "edit-user") {
      var u = allUsers.find(function(x) { return x.id === btn.dataset.id; });
      if (u) openEditModal(u);
    } else if (action === "reset-token") {
      var u = allUsers.find(function(x) { return x.id === btn.dataset.id; });
      if (u) {
        if (confirm("Regenerate token for " + u.name + "? Existing proxy connections using the old token will be disconnected.")) {
          adminFetch("/api/admin/users/reset-token", {
            method: "POST",
            body: { id: u.id }
          }).then(function(res) {
            if (res.ok) {
              showToast("New token generated for " + u.name);
              loadUsers();
            }
          });
        }
      }
    } else if (action === "delete-user") {
      var u = allUsers.find(function(x) { return x.id === btn.dataset.id; });
      if (u) {
        userToDelete = u;
        $("deleteUserNameText").textContent = u.name;
        openModal("deleteModal");
      }
    }
  });

  // Modal helpers
  function openModal(id) {
    var m = $(id);
    if (m) m.classList.add("show");
  }
  function closeModal(id) {
    var m = $(id);
    if (m) m.classList.remove("show");
  }

  document.querySelectorAll("[data-close]").forEach(function(el) {
    el.addEventListener("click", function() {
      closeModal(el.dataset.close);
    });
  });

  // Config Modal Setup
  function openConfigModal(u) {
    var host = window.location.origin;
    var mapUrl = host + "/?token=" + encodeURIComponent(u.token);
    var jsonUrl = host + "/loc.json?token=" + encodeURIComponent(u.token);
    var argSnippet = "&configUrl=" + jsonUrl;

    $("configModalTitle").textContent = "Integration URLs — " + u.name;
    $("cfgMapUrl").firstChild.textContent = mapUrl + "\\n";
    $("cfgJsonUrl").firstChild.textContent = jsonUrl + "\\n";
    $("cfgArgSnippet").firstChild.textContent = argSnippet + "\\n";
    $("cfgOpenMapBtn").href = mapUrl;

    openModal("configModal");
  }

  // Copy code blocks
  document.querySelectorAll(".copy-code-btn").forEach(function(btn) {
    btn.addEventListener("click", function() {
      var targetId = btn.dataset.copyTarget;
      var el = $(targetId);
      if (el) {
        var text = el.firstChild.textContent.trim();
        copyText(text, "Copied snippet!");
      }
    });
  });

  // Edit Modal Setup
  function openEditModal(u) {
    $("editUserId").value = u.id;
    $("editUserName").value = u.name || "";
    $("editUserNote").value = u.note || "";
    $("editUserActive").value = u.active !== false ? "true" : "false";
    openModal("editUserModal");
  }

  $("editUserForm").addEventListener("submit", function(e) {
    e.preventDefault();
    var id = $("editUserId").value;
    var name = $("editUserName").value.trim();
    var note = $("editUserNote").value.trim();
    var active = $("editUserActive").value === "true";

    adminFetch("/api/admin/users/update", {
      method: "POST",
      body: { id: id, name: name, note: note, active: active }
    }).then(function(res) {
      if (res.ok) {
        showToast("User updated successfully");
        closeModal("editUserModal");
        loadUsers();
      }
    });
  });

  // Add User Setup
  $("openAddUserBtn").addEventListener("click", function() {
    $("addUserForm").reset();
    $("newUserToken").value = generateHexToken(24);
    openModal("addUserModal");
  });

  $("genRandomTokenBtn").addEventListener("click", function() {
    $("newUserToken").value = generateHexToken(24);
  });

  // Location presets
  var selectedPreset = null;
  document.querySelectorAll(".preset-pill").forEach(function(pill) {
    pill.addEventListener("click", function() {
      document.querySelectorAll(".preset-pill").forEach(function(p) { p.style.borderColor = ""; });
      pill.style.borderColor = "var(--primary)";
      selectedPreset = {
        lat: Number(pill.dataset.lat),
        lng: Number(pill.dataset.lng),
        altitude: Number(pill.dataset.alt || 50)
      };
    });
  });

  $("addUserForm").addEventListener("submit", function(e) {
    e.preventDefault();
    var name = $("newUserName").value.trim();
    var note = $("newUserNote").value.trim();
    var token = $("newUserToken").value.trim() || generateHexToken(24);

    var payload = {
      name: name,
      note: note,
      token: token
    };

    if (selectedPreset) {
      payload.location = {
        enabled: true,
        latitude: selectedPreset.lat,
        longitude: selectedPreset.lng,
        altitude: selectedPreset.altitude,
        horizontalAccuracy: 39,
        verticalAccuracy: 1000
      };
    }

    adminFetch("/api/admin/users", {
      method: "POST",
      body: payload
    }).then(function(res) {
      if (res.ok) {
        showToast("User " + name + " created!");
        closeModal("addUserModal");
        loadUsers();
      } else {
        showToast(res.error || "Failed to create user");
      }
    });
  });

  // Delete User Confirmation
  $("confirmDeleteBtn").addEventListener("click", function() {
    if (!userToDelete) return;
    adminFetch("/api/admin/users/delete", {
      method: "POST",
      body: { id: userToDelete.id }
    }).then(function(res) {
      if (res.ok) {
        showToast("User deleted");
        closeModal("deleteModal");
        loadUsers();
      }
    });
  });

  // Search & Filter change events
  $("userSearchInput").addEventListener("input", renderUsersList);
  $("statusFilterSelect").addEventListener("change", renderUsersList);
  $("refreshBtn").addEventListener("click", function() {
    loadUsers();
    showToast("Refreshed user list");
  });

  // Login Form
  $("loginForm").addEventListener("submit", function(e) {
    e.preventDefault();
    var t = $("adminTokenInput").value.trim();
    if (!t) return;
    currentAdminToken = t;
    adminFetch("/api/admin/info").then(function(data) {
      if (data && data.ok) {
        try { localStorage.setItem(ADMIN_TOKEN_KEY, t); } catch(e){}
        showAppView();
        loadUsers();
        showToast("Signed in successfully");
      } else {
        showToast("Invalid Admin Token");
      }
    }).catch(function() {
      showToast("Authentication rejected");
    });
  });

  // Logout
  $("logoutBtn").addEventListener("click", function() {
    try { localStorage.removeItem(ADMIN_TOKEN_KEY); } catch(e){}
    currentAdminToken = "";
    showLoginView();
    showToast("Signed out");
  });

  // Boot
  initAuth();
})();
</script>
</body>
</html>`;


/**
 * iOS Location Picker — Cloudflare Worker
 *
 * Multi-user API:
 *   GET  /loc.json?token=      → 读取指定用户的坐标 JSON（Loon / Shadowrocket / Surge）
 *   POST /set?token=           → 保存指定用户的坐标
 *   POST /enable?token=        → 一键开启/关闭指定用户的伪造定位
 *   GET  /?token=              → 指定用户的地图选点网页
 *   GET  /admin                → 管理后台网页（管理用户与 Token）
 *   ALL  /api/admin/*          → 管理后台 API 接口
 *   GET  /health               → 服务健康检测
 */


const KV_USERS_LIST = "lp_users_v1";
const KV_USER_DATA_PREFIX = "lp_user:";
const KV_LEGACY_LOC = "loc";

const DEFAULT = {
  enabled: true, // false = 脚本放行原始响应（恢复真实定位）
  latitude: 37.3349,
  longitude: -122.00902,
  altitude: 530,
  horizontalAccuracy: 39,
  verticalAccuracy: 1000,
};

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Admin-Token",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Content-Type-Options": "nosniff",
};

const PAGE_CSP = [
  "default-src 'none'",
  "script-src https://unpkg.com 'unsafe-inline'",
  "style-src https://unpkg.com 'unsafe-inline'",
  "img-src 'self' https: data:",
  "connect-src 'self' https://unpkg.com https://api.open-meteo.com https://nominatim.openstreetmap.org",
  "base-uri 'none'",
  "form-action 'none'",
  "frame-ancestors 'none'",
].join("; ");

const ADMIN_CSP = [
  "default-src 'none'",
  "script-src 'unsafe-inline'",
  "style-src 'unsafe-inline'",
  "img-src 'self' data:",
  "connect-src 'self'",
  "base-uri 'none'",
  "form-action 'none'",
  "frame-ancestors 'none'",
].join("; ");

function jsonResponse(body, status = 200) {
  return new Response(typeof body === "string" ? body : JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      ...CORS,
    },
  });
}

function textResponse(body, contentType, status = 200) {
  return new Response(body, {
    status,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "no-store",
      ...CORS,
    },
  });
}

function unauthorized(message = "bad token", status = 403) {
  return jsonResponse({ error: message }, status);
}

// 常量时间比较，避免通过响应时延逐字节爆破 token
function safeEqual(a, b) {
  if (a == null || b == null) return false;
  const enc = new TextEncoder();
  const ab = enc.encode(String(a));
  const bb = enc.encode(String(b));
  if (ab.length !== bb.length) {
    return false;
  }
  let diff = 0;
  for (let i = 0; i < ab.length; i += 1) {
    diff |= ab[i] ^ bb[i];
  }
  return diff === 0;
}

function getKV(env) {
  return env.KV_BINDING || null;
}

function getAdminToken(env) {
  return env.ADMIN_TOKEN || env.TOKEN || "";
}

function extractAdminToken(request) {
  const url = new URL(request.url);
  const qToken = url.searchParams.get("admin_token") || url.searchParams.get("token");
  const authHeader = request.headers.get("Authorization") || "";
  const hToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
  const customHeaderToken = request.headers.get("X-Admin-Token") || "";
  return customHeaderToken || hToken || qToken || "";
}

function checkAdminToken(request, env) {
  const configured = getAdminToken(env);
  if (!configured) {
    return { ok: false, error: "Server misconfigured: ADMIN_TOKEN secret not set" };
  }
  const token = extractAdminToken(request);
  if (!token) {
    return { ok: false, error: "Missing admin token" };
  }
  if (!safeEqual(token, configured)) {
    return { ok: false, error: "Bad admin token" };
  }
  return { ok: true };
}

function extractUserToken(request) {
  const url = new URL(request.url);
  const qToken = url.searchParams.get("token");
  if (qToken) return qToken;
  const authHeader = request.headers.get("Authorization") || "";
  if (authHeader.startsWith("Bearer ")) return authHeader.slice(7).trim();
  return "";
}

async function readLegacyLoc(env) {
  const kv = getKV(env);
  if (!kv) return { ...DEFAULT };
  try {
    const raw = await kv.get(KV_LEGACY_LOC);
    if (!raw) return { ...DEFAULT };
    return { ...DEFAULT, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT };
  }
}

async function getUsersList(env) {
  const kv = getKV(env);
  if (!kv) return [];
  try {
    const raw = await kv.get(KV_USERS_LIST);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {}

  // 自动迁移 / 兜底初始单用户
  if (env.TOKEN) {
    const defaultUser = {
      id: "usr_default",
      name: "Default User",
      token: env.TOKEN,
      active: true,
      note: "Primary user (migrated from env.TOKEN)",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    try {
      await kv.put(KV_USERS_LIST, JSON.stringify([defaultUser]));
      const loc = await readLegacyLoc(env);
      await kv.put(KV_USER_DATA_PREFIX + env.TOKEN, JSON.stringify({
        ...defaultUser,
        location: loc,
      }));
    } catch {}
    return [defaultUser];
  }

  return [];
}

async function saveUsersList(env, list) {
  const kv = getKV(env);
  if (!kv) throw new Error("KV binding missing (expected KV_BINDING)");
  await kv.put(KV_USERS_LIST, JSON.stringify(list));
}

async function getUserDataByToken(env, token) {
  if (!token) return null;
  const kv = getKV(env);
  if (!kv) return null;

  try {
    const raw = await kv.get(KV_USER_DATA_PREFIX + token);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {}

  // 兼容逻辑：如果传的是 env.TOKEN
  if (env.TOKEN && safeEqual(token, env.TOKEN)) {
    const loc = await readLegacyLoc(env);
    const legacyUser = {
      id: "usr_default",
      name: "Default User",
      token: env.TOKEN,
      active: true,
      note: "Primary user (migrated from env.TOKEN)",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      location: loc,
    };
    try {
      await kv.put(KV_USER_DATA_PREFIX + token, JSON.stringify(legacyUser));
      const list = await getUsersList(env);
      if (!list.some(u => u.token === token)) {
        list.unshift({
          id: legacyUser.id,
          name: legacyUser.name,
          token: legacyUser.token,
          active: legacyUser.active,
          note: legacyUser.note,
          createdAt: legacyUser.createdAt,
          updatedAt: legacyUser.updatedAt,
        });
        await saveUsersList(env, list);
      }
    } catch {}
    return legacyUser;
  }

  return null;
}

async function saveUserData(env, token, userData) {
  const kv = getKV(env);
  if (!kv) throw new Error("KV binding missing (expected KV_BINDING)");
  await kv.put(KV_USER_DATA_PREFIX + token, JSON.stringify(userData));

  // 如果此 token 为 legacy env.TOKEN，同步更新原有的 loc 键
  if (env.TOKEN && safeEqual(token, env.TOKEN) && userData.location) {
    try {
      await kv.put(KV_LEGACY_LOC, JSON.stringify(userData.location));
    } catch {}
  }
}

async function deleteUserData(env, token) {
  const kv = getKV(env);
  if (!kv) return;
  await kv.delete(KV_USER_DATA_PREFIX + token);
}

function setInt(target, key, value) {
  if (
    value !== undefined &&
    value !== null &&
    value !== "" &&
    Number.isFinite(Number(value))
  ) {
    target[key] = Math.round(Number(value));
  }
}

function wrapLng(lng) {
  const n = Number(lng);
  if (n >= -180 && n <= 180) return n;
  return ((((n + 180) % 360) + 360) % 360) - 180;
}

function generateRandomHex(bytesCount = 24) {
  const bytes = new Uint8Array(bytesCount);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS });
    }

    const url = new URL(request.url);

    // ==========================================
    // 1. 管理后台页面与 API (/admin & /api/admin/*)
    // ==========================================

    if (url.pathname === "/admin" && request.method === "GET") {
      return new Response(ADMIN_PAGE, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "no-store",
          "Content-Security-Policy": ADMIN_CSP,
          ...CORS,
        },
      });
    }

    if (url.pathname.startsWith("/api/admin/")) {
      const adminAuth = checkAdminToken(request, env);
      if (!adminAuth.ok) {
        return unauthorized(adminAuth.error || "bad admin token", 401);
      }

      // 获取系统概览与统计
      if (url.pathname === "/api/admin/info" && request.method === "GET") {
        const users = await getUsersList(env);
        return jsonResponse({
          ok: true,
          totalUsers: users.length,
          activeUsers: users.filter(u => u.active !== false).length,
          kvConnected: !!getKV(env),
          hasAdminToken: !!getAdminToken(env),
          hasLegacyToken: !!env.TOKEN,
        });
      }

      // 获取所有用户完整列表（包含坐标与状态）
      if (url.pathname === "/api/admin/users" && request.method === "GET") {
        const list = await getUsersList(env);
        const fullUsers = await Promise.all(
          list.map(async (u) => {
            const data = await getUserDataByToken(env, u.token);
            return {
              id: u.id,
              name: u.name,
              token: u.token,
              active: u.active !== false,
              note: u.note || "",
              createdAt: u.createdAt || 0,
              updatedAt: u.updatedAt || 0,
              location: data && data.location ? data.location : { ...DEFAULT },
            };
          })
        );
        return jsonResponse({ ok: true, users: fullUsers });
      }

      // 创建新用户
      if (url.pathname === "/api/admin/users" && request.method === "POST") {
        let body;
        try {
          body = await request.json();
        } catch {
          return jsonResponse({ error: "bad json" }, 400);
        }

        const name = String(body.name || "").trim();
        if (!name) {
          return jsonResponse({ error: "User name is required" }, 400);
        }

        let token = String(body.token || "").trim();
        if (!token) {
          token = generateRandomHex(24);
        }

        // 避免 token 冲突
        const list = await getUsersList(env);
        if (list.some(u => safeEqual(u.token, token))) {
          return jsonResponse({ error: "Token already in use by another user" }, 400);
        }
        if (safeEqual(token, getAdminToken(env))) {
          return jsonResponse({ error: "Token cannot be the same as ADMIN_TOKEN" }, 400);
        }

        const now = Date.now();
        const userId = "usr_" + now.toString(36) + "_" + Math.random().toString(36).slice(2, 7);
        const newUserSummary = {
          id: userId,
          name: name,
          token: token,
          active: true,
          note: String(body.note || "").trim(),
          createdAt: now,
          updatedAt: now,
        };

        const initialLoc = body.location ? { ...DEFAULT, ...body.location } : { ...DEFAULT };
        const newUserData = {
          ...newUserSummary,
          location: initialLoc,
        };

        await saveUserData(env, token, newUserData);
        list.unshift(newUserSummary);
        await saveUsersList(env, list);

        return jsonResponse({ ok: true, user: newUserData });
      }

      // 更新用户（名称、备注、启用状态）
      if (url.pathname === "/api/admin/users/update" && request.method === "POST") {
        let body;
        try {
          body = await request.json();
        } catch {
          return jsonResponse({ error: "bad json" }, 400);
        }

        const id = String(body.id || "").trim();
        const list = await getUsersList(env);
        const userSummary = list.find(u => u.id === id);
        if (!userSummary) {
          return jsonResponse({ error: "User not found" }, 404);
        }

        const data = await getUserDataByToken(env, userSummary.token);
        if (!data) {
          return jsonResponse({ error: "User data missing" }, 404);
        }

        if (body.name !== undefined) {
          const name = String(body.name).trim();
          if (name) {
            userSummary.name = name;
            data.name = name;
          }
        }
        if (body.note !== undefined) {
          userSummary.note = String(body.note).trim();
          data.note = userSummary.note;
        }
        if (body.active !== undefined) {
          userSummary.active = body.active === true;
          data.active = userSummary.active;
        }

        userSummary.updatedAt = Date.now();
        data.updatedAt = userSummary.updatedAt;

        await saveUserData(env, userSummary.token, data);
        await saveUsersList(env, list);

        return jsonResponse({ ok: true, user: data });
      }

      // 重置 / 更换用户 Token
      if (url.pathname === "/api/admin/users/reset-token" && request.method === "POST") {
        let body;
        try {
          body = await request.json();
        } catch {
          return jsonResponse({ error: "bad json" }, 400);
        }

        const id = String(body.id || "").trim();
        const list = await getUsersList(env);
        const userSummary = list.find(u => u.id === id);
        if (!userSummary) {
          return jsonResponse({ error: "User not found" }, 404);
        }

        const oldToken = userSummary.token;
        const oldData = await getUserDataByToken(env, oldToken);
        const newToken = String(body.newToken || "").trim() || generateRandomHex(24);

        if (list.some(u => u.id !== id && safeEqual(u.token, newToken))) {
          return jsonResponse({ error: "New token already in use" }, 400);
        }
        if (safeEqual(newToken, getAdminToken(env))) {
          return jsonResponse({ error: "Token cannot be the same as ADMIN_TOKEN" }, 400);
        }

        await deleteUserData(env, oldToken);

        const updatedData = {
          ...(oldData || {}),
          id: userSummary.id,
          name: userSummary.name,
          token: newToken,
          active: userSummary.active !== false,
          note: userSummary.note || "",
          updatedAt: Date.now(),
          location: oldData && oldData.location ? oldData.location : { ...DEFAULT },
        };

        userSummary.token = newToken;
        userSummary.updatedAt = updatedData.updatedAt;

        await saveUserData(env, newToken, updatedData);
        await saveUsersList(env, list);

        return jsonResponse({ ok: true, user: updatedData });
      }

      // 删除用户
      if (url.pathname === "/api/admin/users/delete" && request.method === "POST") {
        let body;
        try {
          body = await request.json();
        } catch {
          return jsonResponse({ error: "bad json" }, 400);
        }

        const id = String(body.id || "").trim();
        const list = await getUsersList(env);
        const idx = list.findIndex(u => u.id === id);
        if (idx === -1) {
          return jsonResponse({ error: "User not found" }, 404);
        }

        const userToDelete = list[idx];
        await deleteUserData(env, userToDelete.token);
        list.splice(idx, 1);
        await saveUsersList(env, list);

        return jsonResponse({ ok: true });
      }

      // 后台直接调整用户坐标
      if (url.pathname === "/api/admin/users/set-location" && request.method === "POST") {
        let body;
        try {
          body = await request.json();
        } catch {
          return jsonResponse({ error: "bad json" }, 400);
        }

        const id = String(body.id || "").trim();
        const list = await getUsersList(env);
        const userSummary = list.find(u => u.id === id);
        if (!userSummary) {
          return jsonResponse({ error: "User not found" }, 404);
        }

        const data = await getUserDataByToken(env, userSummary.token);
        if (!data) {
          return jsonResponse({ error: "User data missing" }, 404);
        }

        data.location = data.location || { ...DEFAULT };
        if (body.lat !== undefined && body.lng !== undefined) {
          const la = Number(body.lat);
          const lo = Number(body.lng);
          if (Number.isFinite(la) && Number.isFinite(lo) && la >= -90 && la <= 90) {
            data.location.latitude = la;
            data.location.longitude = wrapLng(lo);
          }
        }
        setInt(data.location, "altitude", body.altitude);
        setInt(data.location, "horizontalAccuracy", body.horizontalAccuracy);
        setInt(data.location, "verticalAccuracy", body.verticalAccuracy);
        if (body.enabled !== undefined) {
          data.location.enabled = body.enabled === true;
        }
        data.location.updatedAt = Date.now();
        data.updatedAt = Date.now();

        await saveUserData(env, userSummary.token, data);
        return jsonResponse({ ok: true, location: data.location });
      }

      return jsonResponse({ error: "admin endpoint not found" }, 404);
    }

    // ==========================================
    // 2. 多用户定位交互 API (/loc.json, /set, /enable)
    // ==========================================

    const token = extractUserToken(request);

    // Shadowrocket / Loon / Surge 读取指定用户的坐标配置
    if (url.pathname === "/loc.json" && request.method === "GET") {
      if (!token) {
        return unauthorized("missing token", 401);
      }
      const userData = await getUserDataByToken(env, token);
      if (!userData) {
        return unauthorized("bad token", 403);
      }
      if (userData.active === false) {
        return unauthorized("user disabled", 403);
      }
      const loc = userData.location || { ...DEFAULT };
      return jsonResponse({
        ...loc,
        userName: userData.name,
      });
    }

    // 保存选点位置
    if (url.pathname === "/set" && request.method === "POST") {
      if (!token) {
        return unauthorized("missing token", 401);
      }
      const userData = await getUserDataByToken(env, token);
      if (!userData) {
        return unauthorized("bad token", 403);
      }
      if (userData.active === false) {
        return unauthorized("user disabled", 403);
      }

      let j;
      try {
        const bodyText = await request.text();
        if (bodyText.length > 10000) {
          return jsonResponse({ error: "payload too large" }, 413);
        }
        j = JSON.parse(bodyText);
      } catch {
        return jsonResponse({ error: "bad json" }, 400);
      }

      const la = Number(j.lat);
      const loRaw = Number(j.lng);
      if (
        !Number.isFinite(la) ||
        !Number.isFinite(loRaw) ||
        la < -90 ||
        la > 90
      ) {
        return jsonResponse({ error: "bad coords" }, 400);
      }

      try {
        const lo = wrapLng(loRaw);
        userData.location = userData.location || { ...DEFAULT };
        userData.location.enabled = true; // 保存新位置即开启伪造
        userData.location.latitude = la;
        userData.location.longitude = lo;
        setInt(userData.location, "altitude", j.altitude);
        setInt(userData.location, "horizontalAccuracy", j.horizontalAccuracy);
        setInt(userData.location, "verticalAccuracy", j.verticalAccuracy);
        userData.location.updatedAt = Date.now();
        userData.updatedAt = Date.now();

        await saveUserData(env, token, userData);
        return jsonResponse({
          ...userData.location,
          userName: userData.name,
        });
      } catch (err) {
        return jsonResponse({ error: err.message || "failed to save" }, 500);
      }
    }

    // 一键切换：伪造 / 恢复真实定位
    if (url.pathname === "/enable" && request.method === "POST") {
      if (!token) {
        return unauthorized("missing token", 401);
      }
      const userData = await getUserDataByToken(env, token);
      if (!userData) {
        return unauthorized("bad token", 403);
      }
      if (userData.active === false) {
        return unauthorized("user disabled", 403);
      }

      let j;
      try {
        const bodyText = await request.text();
        if (bodyText.length > 10000) {
          return jsonResponse({ error: "payload too large" }, 413);
        }
        j = JSON.parse(bodyText);
      } catch {
        return jsonResponse({ error: "bad json" }, 400);
      }

      try {
        userData.location = userData.location || { ...DEFAULT };
        userData.location.enabled = j.enabled !== false;
        userData.location.updatedAt = Date.now();
        userData.updatedAt = Date.now();

        await saveUserData(env, token, userData);
        return jsonResponse({
          ...userData.location,
          userName: userData.name,
        });
      } catch (err) {
        return jsonResponse({ error: err.message || "failed to update" }, 500);
      }
    }

    // 地图选点前端页面 (/)
    if (
      (url.pathname === "/" || url.pathname === "") &&
      request.method === "GET"
    ) {
      if (!token) {
        return unauthorized("missing token: add ?token=<TOKEN> to URL", 401);
      }

      // 如果传的是管理员口令且没有对应的普通用户，直接重定向到管理页面
      const adminTok = getAdminToken(env);
      if (adminTok && safeEqual(token, adminTok)) {
        const directUser = await getUserDataByToken(env, token);
        if (!directUser) {
          return Response.redirect(`${url.origin}/admin?token=${encodeURIComponent(token)}`, 302);
        }
      }

      const userData = await getUserDataByToken(env, token);
      if (!userData) {
        return unauthorized("bad token", 403);
      }
      if (userData.active === false) {
        return unauthorized("user disabled: contact administrator", 403);
      }

      // 如果客户端请求 JSON（例如在 Loon/Shadowrocket 中误填了 / 而非 /loc.json）
      const acceptHeader = request.headers.get("Accept") || "";
      if (acceptHeader.includes("application/json") && !acceptHeader.includes("text/html")) {
        const loc = userData.location || { ...DEFAULT };
        return jsonResponse({
          ...loc,
          userName: userData.name,
        });
      }

      return new Response(PAGE, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "no-store",
          "Content-Security-Policy": PAGE_CSP,
          ...CORS,
        },
      });
    }

    // 健康检测
    if (url.pathname === "/health") {
      return jsonResponse({
        ok: true,
        kv: !!getKV(env),
        tokenConfigured: !!env.TOKEN,
        adminTokenConfigured: !!getAdminToken(env),
        multiUser: true,
      });
    }

    if (url.pathname === "/favicon.ico") {
      return new Response(null, { status: 204, headers: CORS });
    }

    return textResponse("not found", "text/plain", 404);
  },
};
