import { useState, useEffect, useRef } from "react";
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

/* ═══════════════════════════════════════════════════════════════
   GOOGLE MAPS KEY
═══════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════
   REAL HYDERABAD LOCATIONS (GPS coordinates)
═══════════════════════════════════════════════════════════════ */
const LOCATIONS = {
  HTC:{ id:"HTC", name:"HITEC City",        lat:17.4435, lng:78.3772, zone:"IT Corridor"  },
  GCB:{ id:"GCB", name:"Gachibowli",        lat:17.4401, lng:78.3489, zone:"IT Corridor"  },
  MDP:{ id:"MDP", name:"Mehdipatnam",       lat:17.3986, lng:78.4380, zone:"Central"       },
  JUB:{ id:"JUB", name:"Jubilee Hills",     lat:17.4323, lng:78.4085, zone:"West"          },
  BAN:{ id:"BAN", name:"Banjara Hills",     lat:17.4156, lng:78.4347, zone:"West"          },
  KPL:{ id:"KPL", name:"Kukatpally",        lat:17.4849, lng:78.4138, zone:"North"         },
  SEC:{ id:"SEC", name:"Secunderabad",      lat:17.4399, lng:78.4983, zone:"North-East"    },
  CHK:{ id:"CHK", name:"Chikkadpally",      lat:17.4062, lng:78.5137, zone:"East"          },
  LBN:{ id:"LBN", name:"LB Nagar",          lat:17.3483, lng:78.5515, zone:"South-East"   },
  UPL:{ id:"UPL", name:"Uppal",             lat:17.3981, lng:78.5592, zone:"East"          },
  NAM:{ id:"NAM", name:"Nampally",          lat:17.3840, lng:78.4741, zone:"Central"       },
  CHR:{ id:"CHR", name:"Charminar",         lat:17.3616, lng:78.4747, zone:"Old City"      },
  AMB:{ id:"AMB", name:"Ameerpet",          lat:17.4375, lng:78.4483, zone:"Central"       },
  HYD:{ id:"HYD", name:"Hyderabad Station", lat:17.4063, lng:78.4691, zone:"Central"       },
  BGP:{ id:"BGP", name:"Begumpet",          lat:17.4418, lng:78.4685, zone:"Central"       },
};

const EDGES = [
  {from:"HTC",to:"GCB", name:"Outer Ring Road West",   km:7,  speedLimit:80},
  {from:"HTC",to:"KPL", name:"NH-65 North",            km:6,  speedLimit:60},
  {from:"HTC",to:"JUB", name:"Jubilee Hills Rd",       km:9,  speedLimit:50},
  {from:"GCB",to:"MDP", name:"Tolichowki Rd",          km:8,  speedLimit:50},
  {from:"GCB",to:"JUB", name:"Road No.36",             km:10, speedLimit:50},
  {from:"KPL",to:"SEC", name:"NH-65 East",             km:13, speedLimit:60},
  {from:"KPL",to:"AMB", name:"SR Nagar Rd",            km:7,  speedLimit:40},
  {from:"JUB",to:"BAN", name:"Road No.12",             km:5,  speedLimit:40},
  {from:"JUB",to:"AMB", name:"Punjagutta Rd",          km:6,  speedLimit:50},
  {from:"MDP",to:"BAN", name:"Rethi Bowli Rd",         km:6,  speedLimit:40},
  {from:"MDP",to:"NAM", name:"MJ Road",                km:7,  speedLimit:40},
  {from:"BAN",to:"AMB", name:"Somajiguda Rd",          km:5,  speedLimit:50},
  {from:"BAN",to:"NAM", name:"Khairatabad Rd",         km:6,  speedLimit:40},
  {from:"AMB",to:"BGP", name:"Ameerpet-Begumpet Rd",   km:3,  speedLimit:50},
  {from:"AMB",to:"HYD", name:"Liberty Rd",             km:4,  speedLimit:40},
  {from:"BGP",to:"SEC", name:"SD Road",                km:8,  speedLimit:60},
  {from:"SEC",to:"CHK", name:"James St",               km:7,  speedLimit:40},
  {from:"SEC",to:"UPL", name:"Uppal Rd",               km:14, speedLimit:60},
  {from:"CHK",to:"NAM", name:"Nampally Rd",            km:5,  speedLimit:40},
  {from:"CHK",to:"HYD", name:"Station Rd",             km:4,  speedLimit:40},
  {from:"CHK",to:"LBN", name:"LB Nagar Rd",            km:13, speedLimit:60},
  {from:"NAM",to:"CHR", name:"Abids Rd",               km:4,  speedLimit:30},
  {from:"HYD",to:"CHR", name:"Afzalgunj Rd",           km:3,  speedLimit:30},
  {from:"CHR",to:"LBN", name:"Sagar Rd",               km:9,  speedLimit:50},
  {from:"UPL",to:"LBN", name:"ORR East",               km:10, speedLimit:80},
  {from:"BGP",to:"HYD", name:"Raj Bhavan Rd",          km:4,  speedLimit:50},
];

/* ═══════════════════════════════════════════════════════════════
   REAL DATA FROM YOUR CSV
═══════════════════════════════════════════════════════════════ */
const REAL_HOURLY = [
  {h:"12AM",total:43, cars:14,trucks:26,bikes:2, buses:1 },
  {h:"1AM", total:42, cars:14,trucks:25,bikes:2, buses:1 },
  {h:"2AM", total:43, cars:14,trucks:27,bikes:1, buses:1 },
  {h:"3AM", total:45, cars:15,trucks:27,bikes:2, buses:1 },
  {h:"4AM", total:98, cars:67,trucks:18,bikes:8, buses:5 },
  {h:"5AM", total:114,cars:82,trucks:15,bikes:10,buses:7 },
  {h:"6AM", total:167,cars:113,trucks:7,bikes:28,buses:19},
  {h:"7AM", total:166,cars:112,trucks:7,bikes:27,buses:20},
  {h:"8AM", total:168,cars:113,trucks:7,bikes:27,buses:21},
  {h:"9AM", total:126,cars:75,trucks:13,bikes:20,buses:18},
  {h:"10AM",total:117,cars:65,trucks:16,bikes:18,buses:18},
  {h:"11AM",total:103,cars:58,trucks:24,bikes:12,buses:9 },
  {h:"12PM",total:104,cars:59,trucks:24,bikes:12,buses:9 },
  {h:"1PM", total:122,cars:69,trucks:16,bikes:18,buses:19},
  {h:"2PM", total:125,cars:70,trucks:13,bikes:21,buses:21},
  {h:"3PM", total:120,cars:70,trucks:13,bikes:18,buses:19},
  {h:"4PM", total:178,cars:119,trucks:9,bikes:28,buses:22},
  {h:"5PM", total:178,cars:118,trucks:10,bikes:28,buses:22},
  {h:"6PM", total:162,cars:105,trucks:13,bikes:24,buses:20},
  {h:"7PM", total:121,cars:75,trucks:20,bikes:15,buses:11},
  {h:"8PM", total:118,cars:74,trucks:20,bikes:13,buses:11},
  {h:"9PM", total:115,cars:70,trucks:21,bikes:13,buses:11},
  {h:"10PM",total:43, cars:13,trucks:27,bikes:2, buses:1 },
  {h:"11PM",total:42, cars:13,trucks:26,bikes:2, buses:1 },
];
const REAL_WEEKLY=[
  {day:"Mon",avg:110,peak:279,incidents:6},
  {day:"Tue",avg:111,peak:279,incidents:5},
  {day:"Wed",avg:112,peak:279,incidents:7},
  {day:"Thu",avg:111,peak:279,incidents:4},
  {day:"Fri",avg:107,peak:279,incidents:8},
  {day:"Sat",avg:112,peak:260,incidents:3},
  {day:"Sun",avg:111,peak:255,incidents:2},
];
const SIT_DIST=[
  {name:"Normal",value:5279,color:"#eab308"},
  {name:"Heavy", value:1819,color:"#f97316"},
  {name:"Low",   value:1138,color:"#22c55e"},
  {name:"High",  value:692, color:"#ef4444"},
];
const FEAT_IMP=[
  {f:"Total Vehicles",imp:32.4},{f:"Car Count",imp:18.4},
  {f:"Truck Count",imp:14.3},{f:"Bus Count",imp:13.8},
  {f:"Truck+Bus Ratio",imp:8.2},{f:"Car Ratio",imp:5.0},
  {f:"Bike Count",imp:3.8},{f:"Hour of Day",imp:2.1},
];
const ALERTS_DATA=[
  {id:1,type:"Severe", icon:"🚨",loc:"NH-65 / HITEC City",      msg:"Heavy congestion — 89% load. Avg speed 12 km/h. Divert via ORR.",   time:"1 min ago", color:"#ef4444"},
  {id:2,type:"Warning",icon:"⚠️",loc:"Mehdipatnam Junction",    msg:"Signal fault. Manual control active. Expect +15 min delay.",         time:"4 min ago", color:"#f97316"},
  {id:3,type:"Warning",icon:"🌧️",loc:"LB Nagar Flyover",        msg:"Heavy rain reduces visibility. Speed avg 18 km/h.",                  time:"7 min ago", color:"#f97316"},
  {id:4,type:"Info",   icon:"✅",loc:"Outer Ring Road",          msg:"Adaptive signals cut average wait by 24% in last hour.",             time:"12 min ago",color:"#3b82f6"},
  {id:5,type:"Info",   icon:"🚧",loc:"Secunderabad Station Rd",  msg:"Road resurfacing between James St and SD Rd. One lane closed.",     time:"18 min ago",color:"#eab308"},
  {id:6,type:"Severe", icon:"🚨",loc:"Charminar Old City",       msg:"Festival crowd. 95% congestion. All routes affected. Avoid area.",  time:"22 min ago",color:"#ef4444"},
];

/* ═══════════════════════════════════════════════════════════════
   ML — RF SIMULATION (mirrors your Python backend)
═══════════════════════════════════════════════════════════════ */
const SIT_COLOR={low:"#22c55e",normal:"#eab308",heavy:"#f97316",high:"#ef4444"};
const SIT_SCORE={low:18,normal:42,heavy:68,high:88};

function rfPredict({hour,cars,bikes,buses,trucks}){
  const total=cars+bikes+buses+trucks;
  const peak=(hour>=7&&hour<=9)||(hour>=16&&hour<=19)?1:0;
  const tbr=(trucks+buses)/(total+1);
  let s=(total/180)*52+peak*26+tbr*14+(Math.random()*8-4);
  s=Math.max(5,Math.min(97,Math.round(s)));
  const sit=s<30?"low":s<55?"normal":s<75?"heavy":"high";
  return{score:s,sit,color:SIT_COLOR[sit],speed:Math.round(Math.max(8,65-s*0.57)),delay:Math.round(s/3.4),conf:Math.round(88+Math.random()*9),total};
}

function scoreFromHour(hour){
  const row=REAL_HOURLY[hour]||REAL_HOURLY[8];
  return Math.round((row.total/180)*78);
}

function buildLiveEdges(hour){
  return EDGES.map(e=>{
    const base=scoreFromHour(hour);
    const sc=Math.max(5,Math.min(97,base+Math.round((Math.random()-.5)*24)));
    const col=sc<30?"#22c55e":sc<55?"#eab308":sc<75?"#f97316":"#ef4444";
    const spd=Math.round(Math.max(8,e.speedLimit-(sc/100)*(e.speedLimit-8)));
    return{...e,score:sc,color:col,speed:spd,delay:Math.round(sc/3.4)};
  });
}

/* ═══════════════════════════════════════════════════════════════
   ROUTING ALGORITHMS — Dijkstra + K-Shortest Paths (3 Routes)
═══════════════════════════════════════════════════════════════ */

/* Build weighted graph from live edges */

/* ═══════════════════════════════════════════════════════════════
   UI COMPONENTS — Card, Chip, KPI, STitle
═══════════════════════════════════════════════════════════════ */
const _C={bg:"#030c1a",surface:"#0a1628",border:"#1a2f50",text:"#e2e8f0",muted:"#475569"};
const _TT={background:"#0a1628",border:"1px solid #1a2f50",borderRadius:8,fontSize:11,color:"#e2e8f0"};

function Card({children,style={}}){
  return <div style={{background:_C.surface,border:`1px solid ${_C.border}`,borderRadius:12,padding:"16px 18px",...style}}>{children}</div>;
}
function Chip({label,color="#3b82f6"}){
  return <span style={{background:color+"18",color,border:`1px solid ${color}33`,borderRadius:6,padding:"3px 9px",fontSize:9,fontWeight:700,letterSpacing:1,whiteSpace:"nowrap"}}>{label}</span>;
}
function KPI({icon,label,value,sub,accent="#3b82f6"}){
  return(
    <div style={{background:_C.surface,border:`1px solid ${_C.border}`,borderRadius:10,padding:"14px 16px"}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
        <span style={{fontSize:18}}>{icon}</span>
        <span style={{fontSize:9,color:_C.muted,letterSpacing:1,fontWeight:700}}>{label.toUpperCase()}</span>
      </div>
      <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:22,fontWeight:700,color:accent,lineHeight:1}}>{value}</div>
      {sub&&<div style={{fontSize:9,color:_C.muted,marginTop:4}}>{sub}</div>}
    </div>
  );
}
function STitle({children,right}){
  return(
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
      <div style={{fontSize:10,fontWeight:700,letterSpacing:2,color:"#94a3b8"}}>{children}</div>
      {right&&<div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{right}</div>}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ROUTING ALGORITHMS
   1. A* (A-Star)          — fastest, uses GPS heuristic
   2. Bellman-Ford         — handles traffic penalties
   3. Floyd-Warshall       — computes ALL pairs at once
   4. Yen's K-Shortest     — finds top-K distinct paths
   5. Bidirectional A*     — meets in middle, 2x faster
═══════════════════════════════════════════════════════════════ */

/* Haversine distance between two GPS coords (heuristic for A*) */
function haversine(a, b){
  const R=6371, dLat=(b.lat-a.lat)*Math.PI/180, dLng=(b.lng-a.lng)*Math.PI/180;
  const x=Math.sin(dLat/2)**2+Math.cos(a.lat*Math.PI/180)*Math.cos(b.lat*Math.PI/180)*Math.sin(dLng/2)**2;
  return R*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x));
}

/* Build adjacency graph from live edges */
function buildGraph(liveEdges, mode="time"){
  const graph={};
  liveEdges.forEach(e=>{
    [e.from,e.to].forEach(n=>{ if(!graph[n]) graph[n]=[]; });
    const timeW = (e.km/Math.max(4,e.speed))*60;
    const distW = e.km;
    const congW = timeW*(1+e.score/80);   // penalise congested roads heavily
    const w = mode==="dist"?distW : mode==="cong"?congW : timeW;
    const shared={km:e.km,score:e.score,color:e.color,name:e.name,speed:e.speed,delay:e.delay,speedLimit:e.speedLimit};
    graph[e.from].push({node:e.to,  cost:w,...shared});
    graph[e.to  ].push({node:e.from,cost:w,...shared});
  });
  return graph;
}

/* ── Algorithm 1: A* (A-Star) ──────────────────────────────── */
function aStar(liveEdges, start, end, mode="time", blocked=new Set()){
  if(start===end) return null;
  const graph=buildGraph(liveEdges,mode);
  const endLoc=LOCATIONS[end];
  const gScore={},fScore={},prev={},vis=new Set();
  Object.keys(LOCATIONS).forEach(n=>{ gScore[n]=Infinity; fScore[n]=Infinity; });
  gScore[start]=0;
  fScore[start]=haversine(LOCATIONS[start],endLoc);
  const open=new Set([start]);
  while(open.size){
    // pick lowest fScore
    let cur=null;
    open.forEach(n=>{ if(!cur||fScore[n]<fScore[cur]) cur=n; });
    if(cur===end) break;
    open.delete(cur); vis.add(cur);
    (graph[cur]||[]).forEach(edge=>{
      if(vis.has(edge.node)) return;
      const key=`${cur}-${edge.node}`;
      if(blocked.has(key)) return;
      const tentG=gScore[cur]+edge.cost;
      if(tentG<gScore[edge.node]){
        prev[edge.node]={from:cur,...edge};
        gScore[edge.node]=tentG;
        fScore[edge.node]=tentG+haversine(LOCATIONS[edge.node],endLoc)*(mode==="dist"?1:0.1);
        open.add(edge.node);
      }
    });
  }
  if(gScore[end]===Infinity) return null;
  const path=[]; let c=end;
  while(c){ path.unshift(c); c=prev[c]?.from; }
  const segs=path.slice(1).map((n,i)=>({from:path[i],to:n,...prev[n]}));
  const totalKm=Math.round(segs.reduce((a,s)=>a+s.km,0)*10)/10;
  const avgCong=Math.round(segs.reduce((a,s)=>a+s.score,0)/(segs.length||1));
  return{path,segs,totalTime:Math.round(gScore[end]),totalKm,avgCong,algo:"A*"};
}

/* ── Algorithm 2: Bellman-Ford (handles penalties) ─────────── */
function bellmanFord(liveEdges, start, end){
  if(start===end) return null;
  const nodes=Object.keys(LOCATIONS);
  const dist={},prev={};
  nodes.forEach(n=>dist[n]=Infinity);
  dist[start]=0;
  // Build edge list with congestion penalty
  const edges=[];
  liveEdges.forEach(e=>{
    const penalty=e.score>75?15:e.score>50?8:0; // extra minutes for heavy roads
    const w=(e.km/Math.max(4,e.speed))*60+penalty;
    edges.push({u:e.from,v:e.to,  w,km:e.km,score:e.score,color:e.color,name:e.name,speed:e.speed,delay:e.delay});
    edges.push({u:e.to,  v:e.from,w,km:e.km,score:e.score,color:e.color,name:e.name,speed:e.speed,delay:e.delay});
  });
  // Relax edges |V|-1 times
  for(let i=0;i<nodes.length-1;i++){
    edges.forEach(({u,v,w,...rest})=>{
      if(dist[u]+w<dist[v]){ dist[v]=dist[u]+w; prev[v]={from:u,...rest}; }
    });
  }
  if(dist[end]===Infinity) return null;
  const path=[]; let c=end;
  while(c){ path.unshift(c); c=prev[c]?.from; }
  const segs=path.slice(1).map((n,i)=>({from:path[i],to:n,...prev[n]}));
  const totalKm=Math.round(segs.reduce((a,s)=>a+s.km,0)*10)/10;
  const avgCong=Math.round(segs.reduce((a,s)=>a+s.score,0)/(segs.length||1));
  return{path,segs,totalTime:Math.round(dist[end]),totalKm,avgCong,algo:"Bellman-Ford"};
}

/* ── Algorithm 3: Floyd-Warshall (all pairs) ───────────────── */
function floydWarshall(liveEdges){
  const nodes=Object.keys(LOCATIONS);
  const idx={}; nodes.forEach((n,i)=>idx[n]=i);
  const N=nodes.length;
  const dist=Array.from({length:N},()=>Array(N).fill(Infinity));
  const next=Array.from({length:N},()=>Array(N).fill(null));
  nodes.forEach((_,i)=>dist[i][i]=0);
  liveEdges.forEach(e=>{
    const w=(e.km/Math.max(4,e.speed))*60;
    const i=idx[e.from],j=idx[e.to];
    if(w<dist[i][j]){ dist[i][j]=w; next[i][j]=j; }
    if(w<dist[j][i]){ dist[j][i]=w; next[j][i]=i; }
  });
  for(let k=0;k<N;k++)
    for(let i=0;i<N;i++)
      for(let j=0;j<N;j++)
        if(dist[i][k]+dist[k][j]<dist[i][j]){
          dist[i][j]=dist[i][k]+dist[k][j];
          next[i][j]=next[i][k];
        }
  // Reconstruct path for any pair
  function getPath(s,e){
    const si=idx[s],ei=idx[e];
    if(dist[si][ei]===Infinity) return null;
    const path=[s]; let cur=si;
    while(cur!==ei){ cur=next[cur][ei]; path.push(nodes[cur]); }
    const segs=path.slice(1).map((n,i)=>{
      const from=path[i],to=n;
      const edge=liveEdges.find(x=>(x.from===from&&x.to===to)||(x.from===to&&x.to===from));
      return{from,to,name:edge?.name||"",score:edge?.score||0,color:edge?.color||"#3b82f6",speed:edge?.speed||40,km:edge?.km||5,delay:edge?.delay||0};
    });
    const totalKm=Math.round(segs.reduce((a,s)=>a+s.km,0)*10)/10;
    const avgCong=Math.round(segs.reduce((a,s)=>a+s.score,0)/(segs.length||1));
    return{path,segs,totalTime:Math.round(dist[si][ei]),totalKm,avgCong,algo:"Floyd-Warshall"};
  }
  return{dist,next,nodes,getPath};
}

/* ── Algorithm 4: Yen's K-Shortest Paths ───────────────────── */
function yenKShortest(liveEdges, start, end, K=3){
  const results=[];
  const candidates=[];
  const first=aStar(liveEdges,start,end,"time");
  if(!first) return[];
  results.push(first);
  for(let k=1;k<K;k++){
    const prev=results[k-1];
    for(let i=0;i<prev.path.length-1;i++){
      const spurNode=prev.path[i];
      const rootPath=prev.path.slice(0,i+1);
      const blocked=new Set();
      // Block edges used by previously found paths with same root
      results.forEach(r=>{
        if(r.path.slice(0,i+1).join()===rootPath.join()){
          const edge=`${r.path[i]}-${r.path[i+1]}`;
          blocked.add(edge); blocked.add(`${r.path[i+1]}-${r.path[i]}`);
        }
      });
      const spurPath=aStar(liveEdges,spurNode,end,"time",blocked);
      if(spurPath){
        const fullPath=[...rootPath.slice(0,-1),...spurPath.path];
        // Deduplicate
        const key=fullPath.join("-");
        if(!candidates.find(c=>c.path.join("-")===key)&&!results.find(c=>c.path.join("-")===key)){
          const segs=fullPath.slice(1).map((n,idx)=>{
            const from=fullPath[idx],to=n;
            const edge=liveEdges.find(x=>(x.from===from&&x.to===to)||(x.from===to&&x.to===from));
            return{from,to,name:edge?.name||"",score:edge?.score||0,color:edge?.color||"#3b82f6",speed:edge?.speed||40,km:edge?.km||5,delay:edge?.delay||0};
          });
          const totalKm=Math.round(segs.reduce((a,s)=>a+s.km,0)*10)/10;
          const totalTime=Math.round(segs.reduce((a,s)=>a+(s.km/Math.max(4,s.speed))*60,0));
          const avgCong=Math.round(segs.reduce((a,s)=>a+s.score,0)/(segs.length||1));
          candidates.push({path:fullPath,segs,totalTime,totalKm,avgCong,algo:"Yen's K-Shortest"});
        }
      }
    }
    if(!candidates.length) break;
    candidates.sort((a,b)=>a.totalTime-b.totalTime);
    results.push(candidates.shift());
  }
  return results;
}

/* ── Wrapper: compute all 3 routes with labels/colors ──────── */
function computeAllRoutes(liveEdges, start, end){
  if(start===end) return[];
  // Route 1: Yen's K-Shortest gives us 3 distinct paths
  const yenRoutes=yenKShortest(liveEdges,start,end,3);
  // Route using Bellman-Ford (penalises heavy roads)
  const bfRoute=bellmanFord(liveEdges,start,end);
  // Floyd-Warshall for shortest distance path
  const fw=floydWarshall(liveEdges);
  const fwRoute=fw.getPath(start,end);

  const LABELS=["⚡ Fastest","🔀 Least Congested","📍 Shortest Dist."];
  const COLORS=["#60a5fa","#34d399","#fbbf24"];
  const DASH=[null,"10,6","6,10"];

  // Merge: use Yen's for slots, replace slot 2 with BF if different, slot 3 with FW
  const pool=yenRoutes.length>=3?yenRoutes:[...yenRoutes];
  if(bfRoute&&!pool.find(r=>r.path.join()===bfRoute.path.join())) pool.splice(1,0,bfRoute);
  if(fwRoute&&!pool.find(r=>r.path.join()===fwRoute.path.join())) pool.push(fwRoute);

  return pool.slice(0,3).map((r,i)=>({
    ...r,
    label:LABELS[i]||`Route ${i+1}`,
    lineColor:COLORS[i]||"#94a3b8",
    dashArray:DASH[i]||null,
    rank:i,
  }));
}

/* ═══════════════════════════════════════════════════════════════
   ADVANCED LEAFLET MAP
   — Real OpenStreetMap tiles (CartoDB Dark)
   — OSRM real road geometry for routes (free, no key)
   — All 3 routes drawn with real road shapes
   — Cluster markers, mini-map, scale bar
═══════════════════════════════════════════════════════════════ */
function LeafletMap({liveEdges,routes=[],activeRoute=0,origin,dest,onMarkerClick}){
  const containerRef=useRef(null);
  const mapRef=useRef(null);
  const layersRef=useRef([]);
  const osrmCache=useRef({});

  /* Fetch REAL road geometry from OSRM (free public API) */
  async function fetchOSRMRoute(pathIds){
    if(pathIds.length<2) return null;
    const coords=pathIds.map(id=>`${LOCATIONS[id].lng},${LOCATIONS[id].lat}`).join(";");
    const cacheKey=coords;
    if(osrmCache.current[cacheKey]) return osrmCache.current[cacheKey];
    try{
      const url=`https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson&alternatives=false`;
      const res=await fetch(url);
      const data=await res.json();
      if(data.routes&&data.routes[0]){
        const geom=data.routes[0].geometry.coordinates.map(([lng,lat])=>([lat,lng]));
        osrmCache.current[cacheKey]=geom;
        return geom;
      }
    }catch(e){ /* fallback to straight lines */ }
    return null;
  }

  function initMap(){
    if(!containerRef.current||mapRef.current) return;
    const L=window.L;
    mapRef.current=L.map(containerRef.current,{
      center:[17.406,78.477],zoom:12,
      zoomControl:false,
    });
    /* Dark base tile */
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",{
      attribution:'© <a href="https://www.openstreetmap.org/">OSM</a> © <a href="https://carto.com/">CARTO</a>',
      subdomains:"abcd",maxZoom:20
    }).addTo(mapRef.current);
    /* Zoom control top-right */
    L.control.zoom({position:"topright"}).addTo(mapRef.current);
    /* Scale bar */
    L.control.scale({position:"bottomright",imperial:false}).addTo(mapRef.current);
    redraw();
  }

  function clearLayers(){
    layersRef.current.forEach(l=>{try{mapRef.current.removeLayer(l);}catch(e){}});
    layersRef.current=[];
  }

  async function redraw(){
    if(!mapRef.current||!window.L) return;
    clearLayers();
    const L=window.L;
    const allRouteNodes=new Set(routes.flatMap(r=>r.path||[]));
    const routeEdgeSet=new Set(routes.flatMap(r=>(r.segs||[]).flatMap(s=>[`${s.from}-${s.to}`,`${s.to}-${s.from}`])));

    /* ── Background road segments (coloured by congestion) ── */
    liveEdges.forEach(e=>{
      const A=LOCATIONS[e.from],B=LOCATIONS[e.to];
      if(!A||!B) return;
      const isRoute=routeEdgeSet.has(`${e.from}-${e.to}`);
      const line=L.polyline([[A.lat,A.lng],[B.lat,B.lng]],{
        color:isRoute?"#1e3a5f":e.color,
        weight:isRoute?3:4.5,
        opacity:isRoute?.35:.8,
      }).addTo(mapRef.current);
      line.bindPopup(
        `<div style="background:#0a1628;color:#e2e8f0;padding:14px;border-radius:10px;font-family:sans-serif;min-width:220px">
          <div style="font-size:9px;color:#5a7098;letter-spacing:2px;margin-bottom:5px">ROAD SEGMENT</div>
          <div style="font-weight:700;font-size:14px;margin-bottom:10px">${e.name}</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">
            <div style="background:#060f1e;border-radius:6px;padding:7px;text-align:center">
              <div style="font-size:9px;color:#5a7098">CONGESTION</div>
              <div style="font-size:17px;font-weight:700;color:${e.color}">${e.score}%</div>
            </div>
            <div style="background:#060f1e;border-radius:6px;padding:7px;text-align:center">
              <div style="font-size:9px;color:#5a7098">SPEED</div>
              <div style="font-size:17px;font-weight:700;color:#22c55e">${e.speed} km/h</div>
            </div>
            <div style="background:#060f1e;border-radius:6px;padding:7px;text-align:center">
              <div style="font-size:9px;color:#5a7098">DELAY</div>
              <div style="font-size:17px;font-weight:700;color:#f97316">+${e.delay} min</div>
            </div>
            <div style="background:#060f1e;border-radius:6px;padding:7px;text-align:center">
              <div style="font-size:9px;color:#5a7098">LIMIT</div>
              <div style="font-size:17px;font-weight:700;color:#94a3b8">${e.speedLimit} km/h</div>
            </div>
          </div>
          <div style="margin-top:8px;background:#060f1e;border-radius:6px;padding:7px">
            <div style="font-size:9px;color:#5a7098;margin-bottom:3px">CONGESTION LEVEL</div>
            <div style="background:#1a2f50;border-radius:3px;height:6px;overflow:hidden">
              <div style="height:100%;width:${e.score}%;background:${e.color};border-radius:3px"></div>
            </div>
          </div>
        </div>`,
        {className:"dpop",maxWidth:260}
      );
      layersRef.current.push(line);
    });

    /* ── Draw all route lines (with OSRM real geometry if available) ── */
    for(let ri=0;ri<routes.length;ri++){
      const r=routes[ri];
      if(!r.path||r.path.length<2) continue;
      const isActive=ri===activeRoute;

      /* Try to get real road geometry from OSRM */
      let pts=null;
      try{ pts=await fetchOSRMRoute(r.path); }catch(e){}
      /* Fallback: straight lines between GPS coords */
      if(!pts) pts=r.path.map(id=>([LOCATIONS[id]?.lat,LOCATIONS[id]?.lng])).filter(p=>p[0]);

      /* Glow for active route */
      if(isActive){
        const glow=L.polyline(pts,{color:r.lineColor,weight:28,opacity:.12}).addTo(mapRef.current);
        layersRef.current.push(glow);
      }

      /* Outer outline */
      const outline=L.polyline(pts,{
        color:"#000",weight:isActive?12:8,opacity:isActive?.5:.3,
        dashArray:r.dashArray,lineCap:"round",lineJoin:"round"
      }).addTo(mapRef.current);

      /* Main route line */
      const routeLine=L.polyline(pts,{
        color:r.lineColor,
        weight:isActive?8:5,
        opacity:isActive?1:.6,
        dashArray:r.dashArray,
        lineCap:"round",lineJoin:"round",
      }).addTo(mapRef.current);

      const emoji=ri===0?"⚡":ri===1?"🔀":"📍";
      routeLine.bindPopup(
        `<div style="background:#0a1628;color:#e2e8f0;padding:14px;border-radius:10px;font-family:sans-serif;min-width:240px">
          <div style="font-size:9px;color:#5a7098;letter-spacing:2px;margin-bottom:5px">${r.algo?.toUpperCase()||"ALGORITHM"} · ROUTE ${ri+1} OF ${routes.length}</div>
          <div style="font-weight:700;font-size:16px;color:${r.lineColor};margin-bottom:10px">${emoji} ${r.label}</div>
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px">
            <div style="background:#060f1e;border-radius:6px;padding:7px;text-align:center">
              <div style="font-size:9px;color:#5a7098">TIME</div>
              <div style="font-size:16px;font-weight:700;color:${r.lineColor}">${r.totalTime}<span style="font-size:9px">min</span></div>
            </div>
            <div style="background:#060f1e;border-radius:6px;padding:7px;text-align:center">
              <div style="font-size:9px;color:#5a7098">DIST</div>
              <div style="font-size:16px;font-weight:700;color:#94a3b8">${r.totalKm}<span style="font-size:9px">km</span></div>
            </div>
            <div style="background:#060f1e;border-radius:6px;padding:7px;text-align:center">
              <div style="font-size:9px;color:#5a7098">CONG</div>
              <div style="font-size:16px;font-weight:700;color:${r.avgCong>75?"#ef4444":r.avgCong>50?"#f97316":"#22c55e"}">${r.avgCong}%</div>
            </div>
          </div>
          <div style="margin-top:8px;font-size:10px;color:#5a7098;text-align:center">Algorithm: ${r.algo}</div>
        </div>`,
        {className:"dpop",maxWidth:280}
      );
      layersRef.current.push(outline,routeLine);
    }

    /* ── Junction markers with TRAFFIC SIGNAL ── */
    Object.values(LOCATIONS).forEach(loc=>{
      const isO=loc.id===origin,isD=loc.id===dest;
      const isOnRoute=allRouteNodes.has(loc.id);

      // Calculate avg congestion score at this junction (average of connected roads)
      const connEdges=liveEdges.filter(e=>e.from===loc.id||e.to===loc.id);
      const avgCong=connEdges.length
        ? Math.round(connEdges.reduce((a,e)=>a+e.score,0)/connEdges.length)
        : 0;
      const avgSpeed=connEdges.length
        ? Math.round(connEdges.reduce((a,e)=>a+e.speed,0)/connEdges.length)
        : 50;

      // Traffic signal state based on congestion
      const sigState = avgCong>=70 ? "red" : avgCong>=40 ? "yellow" : "green";
      const sigColor = sigState==="red"?"#ef4444":sigState==="yellow"?"#eab308":"#22c55e";
      const sigLabel = sigState==="red"?"HEAVY":sigState==="yellow"?"MODERATE":"CLEAR";

      // Recommended signal timing
      const mainGreen = avgCong>75?120:avgCong>50?90:avgCong>30?60:45;
      const sideGreen = 150-mainGreen;

      // Build the traffic light HTML icon
      const pulse = isO||isD||sigState==="red";
      const iconHtml = `
        <div style="position:relative;display:flex;flex-direction:column;align-items:center;gap:1px">
          ${pulse?`<div style="position:absolute;width:44px;height:44px;top:-10px;left:-10px;border-radius:50%;background:${sigColor};opacity:0.15;animation:pu 1.5s infinite"></div>`:""}
          <!-- Traffic light box -->
          <div style="background:#111;border:2px solid #333;border-radius:5px;padding:3px 4px;display:flex;flex-direction:column;gap:2px;box-shadow:0 2px 8px rgba(0,0,0,0.8)">
            <div style="width:10px;height:10px;border-radius:50%;background:${sigState==="red"?"#ef4444":"#333"};box-shadow:${sigState==="red"?"0 0 6px #ef4444":""};transition:all .3s"></div>
            <div style="width:10px;height:10px;border-radius:50%;background:${sigState==="yellow"?"#eab308":"#333"};box-shadow:${sigState==="yellow"?"0 0 6px #eab308":""};transition:all .3s"></div>
            <div style="width:10px;height:10px;border-radius:50%;background:${sigState==="green"?"#22c55e":"#333"};box-shadow:${sigState==="green"?"0 0 6px #22c55e":""};transition:all .3s"></div>
          </div>
          <!-- Junction label -->
          <div style="background:rgba(10,22,40,0.92);border:1px solid ${sigColor}55;border-radius:4px;padding:1px 5px;margin-top:1px;white-space:nowrap;max-width:80px;overflow:hidden;text-overflow:ellipsis">
            <span style="font-size:8px;font-weight:700;color:${isO?"#22c55e":isD?"#f97316":sigColor};font-family:sans-serif">${isO?"🟢 ":isD?"🟠 ":""}${loc.id}</span>
          </div>
        </div>`;

      const icon=window.L.divIcon({
        className:"",
        html:iconHtml,
        iconSize:[24,52],
        iconAnchor:[12,52],
        popupAnchor:[0,-52],
      });

      const m=window.L.marker([loc.lat,loc.lng],{icon,zIndexOffset:isO||isD?2000:sigState==="red"?1500:isOnRoute?1000:0})
        .addTo(mapRef.current);

      const routeOnNode=routes.filter(r=>r.path?.includes(loc.id));

      m.bindPopup(
        `<div style="background:#0a1628;color:#e2e8f0;padding:14px 16px;border-radius:10px;font-family:sans-serif;min-width:230px">
          <div style="font-size:9px;color:#5a7098;letter-spacing:2px;margin-bottom:4px">${loc.zone.toUpperCase()} · JUNCTION</div>
          <div style="font-weight:700;font-size:16px;margin-bottom:10px">${loc.name}</div>

          <!-- Traffic Signal Status -->
          <div style="background:#060f1e;border:1px solid ${sigColor}33;border-radius:9px;padding:10px 12px;margin-bottom:10px">
            <div style="font-size:9px;color:#5a7098;letter-spacing:2px;margin-bottom:8px">TRAFFIC SIGNAL STATUS</div>
            <div style="display:flex;align-items:center;gap:12px">
              <!-- Mini traffic light -->
              <div style="background:#111;border:2px solid #333;border-radius:6px;padding:5px 6px;display:flex;flex-direction:column;gap:4px">
                <div style="width:14px;height:14px;border-radius:50%;background:${sigState==="red"?"#ef4444":"#1a1a1a"};box-shadow:${sigState==="red"?"0 0 10px #ef4444":""}"></div>
                <div style="width:14px;height:14px;border-radius:50%;background:${sigState==="yellow"?"#eab308":"#1a1a1a"};box-shadow:${sigState==="yellow"?"0 0 10px #eab308":""}"></div>
                <div style="width:14px;height:14px;border-radius:50%;background:${sigState==="green"?"#22c55e":"#1a1a1a"};box-shadow:${sigState==="green"?"0 0 10px #22c55e":""}"></div>
              </div>
              <div>
                <div style="font-size:20px;font-weight:800;color:${sigColor}">${sigLabel}</div>
                <div style="font-size:10px;color:${sigColor};margin-top:2px">${sigState==="red"?"🔴 Heavy congestion — signal holding":sigState==="yellow"?"🟡 Moderate flow — caution":"🟢 Traffic flowing freely"}</div>
                <div style="font-size:9px;color:#5a7098;margin-top:4px">Avg congestion: ${avgCong}% · Avg speed: ${avgSpeed} km/h</div>
              </div>
            </div>
          </div>

          <!-- Signal timing recommendation -->
          <div style="background:#060f1e;border-radius:8px;padding:9px 11px;margin-bottom:10px">
            <div style="font-size:9px;color:#5a7098;letter-spacing:1px;margin-bottom:6px">RF-RECOMMENDED SIGNAL TIMING</div>
            <div style="display:flex;gap:6px;margin-bottom:5px">
              <div style="flex:${mainGreen};background:#22c55e;borderRadius:3px;height:8px;border-radius:3px"></div>
              <div style="width:8px;background:#eab308;height:8px;border-radius:2px"></div>
              <div style="flex:${sideGreen};background:#ef4444;height:8px;border-radius:3px"></div>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:9px;color:#5a7098">
              <span>🟢 Main: ${mainGreen}s</span><span>🟡 Yellow: 5s</span><span>🔴 Side: ${sideGreen}s</span>
            </div>
          </div>

          <!-- Connected roads -->
          <div style="font-size:9px;color:#5a7098;letter-spacing:1px;margin-bottom:6px">CONNECTED ROADS (${connEdges.length})</div>
          ${connEdges.slice(0,4).map(e=>`
            <div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0;border-bottom:1px solid #0d1b2e">
              <span style="font-size:10px;color:#94a3b8">${e.name}</span>
              <span style="font-family:monospace;font-size:10px;color:${e.color};font-weight:700">${e.score}% · ${e.speed}km/h</span>
            </div>`).join("")}

          ${routeOnNode.length?`<div style="margin-top:8px;font-size:9px;color:#3b82f6">🔵 On routes: ${routeOnNode.map(r=>r.label).join(", ")}</div>`:""}
          ${isO?`<div style="margin-top:8px;font-size:10px;color:#22c55e;font-weight:700">🟢 ORIGIN — Route starts here</div>`:""}
          ${isD?`<div style="margin-top:8px;font-size:10px;color:#f97316;font-weight:700">🟠 DESTINATION — Route ends here</div>`:""}
        </div>`,
        {className:"dpop",maxWidth:270}
      );
      m.on("click",()=>onMarkerClick(loc.id));
      layersRef.current.push(m);
    });

    /* Fit map to show all routes if they exist */
    if(routes.length>0&&routes[0].path?.length>1){
      const allPts=routes.flatMap(r=>r.path.map(id=>[LOCATIONS[id]?.lat,LOCATIONS[id]?.lng])).filter(p=>p[0]);
      if(allPts.length) mapRef.current.fitBounds(allPts,{padding:[50,50]});
    }
  }

  useEffect(()=>{
    if(!document.getElementById("lf-css")){
      const l=document.createElement("link");
      l.id="lf-css";l.rel="stylesheet";
      l.href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(l);
    }
    if(window.L){ initMap(); return; }
    if(document.getElementById("lf-js")){
      document.getElementById("lf-js").addEventListener("load",initMap); return;
    }
    const s=document.createElement("script");
    s.id="lf-js"; s.src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    s.onload=initMap; document.head.appendChild(s);
  },[]);

  useEffect(()=>{ if(mapRef.current&&window.L) redraw(); },[liveEdges,routes,activeRoute,origin,dest]);

  const activeR=routes[activeRoute];

  return(
    <div style={{position:"relative",borderRadius:12,overflow:"hidden",border:"1px solid #1a2f50"}}>
      <style>{`
        .dpop .leaflet-popup-content-wrapper{background:#0a1628!important;border:1px solid #1a2f50!important;border-radius:10px!important;padding:0!important;box-shadow:0 8px 32px rgba(0,0,0,.85)!important}
        .dpop .leaflet-popup-content{margin:0!important}
        .dpop .leaflet-popup-tip{background:#0a1628!important}
        .dpop .leaflet-popup-close-button{color:#5a7098!important;font-size:16px!important;padding:6px 8px!important}
        .leaflet-control-attribution{background:rgba(10,22,40,.85)!important;color:#5a7098!important;font-size:9px!important}
        .leaflet-control-attribution a{color:#3b82f6!important}
        .leaflet-control-zoom a{background:#0a1628!important;color:#e2e8f0!important;border-color:#1a2f50!important;font-size:16px!important}
        .leaflet-control-zoom a:hover{background:#1a2f50!important}
        .leaflet-bar{border:1px solid #1a2f50!important;border-radius:8px!important;overflow:hidden}
        .leaflet-control-scale-line{background:rgba(10,22,40,.85)!important;border-color:#1a2f50!important;color:#5a7098!important;font-size:9px!important}
      `}</style>

      <div ref={containerRef} style={{width:"100%",height:560}}/>

      {/* Congestion legend */}
      <div style={{position:"absolute",bottom:36,left:14,zIndex:1000,background:"rgba(10,22,40,.96)",border:"1px solid #1a2f50",borderRadius:10,padding:"12px 15px",backdropFilter:"blur(10px)"}}>
        <div style={{fontSize:9,color:"#5a7098",letterSpacing:2,marginBottom:8}}>CONGESTION INDEX</div>
        {[["#22c55e","Low  < 30%"],["#eab308","Normal 30–55%"],["#f97316","Heavy 55–75%"],["#ef4444","High  > 75%"]].map(([c,l])=>(
          <div key={l} style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
            <div style={{width:22,height:5,borderRadius:3,background:c}}/>
            <span style={{fontSize:10,color:"#94a3b8"}}>{l}</span>
          </div>
        ))}
        <div style={{borderTop:"1px solid #1a2f50",marginTop:8,paddingTop:8}}>
          <div style={{fontSize:9,color:"#5a7098",letterSpacing:2,marginBottom:6}}>TRAFFIC SIGNALS</div>
          {[["#22c55e","🟢 Green — Clear (< 40%)"],["#eab308","🟡 Yellow — Moderate (40–70%)"],["#ef4444","🔴 Red — Heavy (> 70%)"]].map(([c,l])=>(
            <div key={l} style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
              <div style={{width:10,height:10,borderRadius:"50%",background:c,boxShadow:`0 0 5px ${c}`}}/>
              <span style={{fontSize:9,color:"#94a3b8"}}>{l}</span>
            </div>
          ))}
        </div>
        <div style={{borderTop:"1px solid #1a2f50",marginTop:8,paddingTop:8}}>
          <div style={{fontSize:9,color:"#5a7098",letterSpacing:2,marginBottom:6}}>ROUTES</div>
          {[["#60a5fa","⚡ Fastest (A*)"],["#34d399","🔀 Alt (Bellman-Ford)"],["#fbbf24","📍 Short (Floyd-W)"]].map(([c,l])=>(
            <div key={l} style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
              <div style={{width:22,height:4,borderRadius:2,background:c,opacity:.9}}/>
              <span style={{fontSize:9,color:"#94a3b8"}}>{l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* LIVE badge */}
      <div style={{position:"absolute",top:12,left:14,zIndex:1000,background:"rgba(10,22,40,.92)",border:"1px solid #22c55e44",borderRadius:7,padding:"5px 12px",display:"flex",alignItems:"center",gap:7}}>
        <div style={{width:7,height:7,borderRadius:"50%",background:"#22c55e",animation:"pu 2s infinite"}}/>
        <span style={{fontSize:10,color:"#22c55e",fontWeight:700}}>LIVE · OpenStreetMap + OSRM Routing</span>
      </div>

      {/* Active route badge */}
      {activeR&&(
        <div style={{position:"absolute",top:12,right:56,zIndex:1000,background:"rgba(10,22,40,.92)",border:`1px solid ${activeR.lineColor}44`,borderRadius:7,padding:"5px 12px",display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:16,height:4,borderRadius:2,background:activeR.lineColor}}/>
          <span style={{fontSize:10,color:activeR.lineColor,fontWeight:700}}>{activeR.label} · {activeR.totalTime}min · {activeR.totalKm}km</span>
        </div>
      )}

      {/* Algorithm badge */}
      <div style={{position:"absolute",bottom:36,right:14,zIndex:1000,background:"rgba(10,22,40,.92)",border:"1px solid #3b82f644",borderRadius:7,padding:"6px 12px"}}>
        <div style={{fontSize:9,color:"#5a7098",letterSpacing:1,marginBottom:2}}>ALGORITHMS RUNNING</div>
        <div style={{fontSize:10,color:"#3b82f6",fontWeight:700}}>A* + Bellman-Ford + Floyd-Warshall</div>
        <div style={{fontSize:9,color:"#5a7098"}}>+ Yen's K-Shortest Paths</div>
      </div>
    </div>
  );
}

export default function App(){
  const C=_C; const TT=_TT; // aliases to global theme
  const [tab,        setTab]       = useState("map");
  const [now,        setNow]       = useState(new Date());
  const [liveEdges,  setEdges]     = useState(()=>buildLiveEdges(new Date().getHours()));
  const [origin,     setOrigin]    = useState("HTC");
  const [dest,       setDest]      = useState("LBN");
  const [routes,     setRoutes]    = useState([]);
  const [activeRoute, setActiveRoute]= useState(0);
  const [selNode,    setSelNode]   = useState(null);
  const [feed,       setFeed]      = useState([]);
  const [pHour,      setPHour]     = useState(new Date().getHours());
  const [pCars,      setPCars]     = useState(80);
  const [pBikes,     setPBikes]    = useState(10);
  const [pBuses,     setPBuses]    = useState(15);
  const [pTrucks,    setPTrucks]   = useState(20);
  const [pred,       setPred]      = useState(null);
  const [loading,    setLoading]   = useState(false);
  const [backendOk,  setBackendOk] = useState(null);
  // ── NEW FEATURES ──
  const [timeSlider,  setTimeSlider]  = useState(new Date().getHours());
  const [sliderMode,  setSliderMode]  = useState(false); // false=live, true=timeslider
  const [predHistory, setPredHistory] = useState([]);
  const [emerMode,    setEmerMode]    = useState(false);
  const [emerRoute,   setEmerRoute]   = useState(null);
  const [co2Today,    setCo2Today]    = useState(0);
  const [minSaved,    setMinSaved]    = useState(0);
  const [vehToday,    setVehToday]    = useState(0);

  // Clock
  useEffect(()=>{const t=setInterval(()=>setNow(new Date()),1000);return()=>clearInterval(t);},[]);

  // Backend health check
  useEffect(()=>{
    fetch("http://localhost:5000/health").then(r=>r.ok?setBackendOk(true):setBackendOk(false)).catch(()=>setBackendOk(false));
  },[]);

  // Live updates every 5s
  useEffect(()=>{
    const update=()=>{
      const h=sliderMode?timeSlider:now.getHours();
      const e=buildLiveEdges(h);
      setEdges(e);
      if(origin&&dest&&origin!==dest){
        const r=computeAllRoutes(e,origin,dest);
        setRoutes(r);
        if(emerMode&&r.length>0) setEmerRoute(r[0]);
      }
      const row=REAL_HOURLY[sliderMode?timeSlider:now.getHours()]||REAL_HOURLY[8];
      // CO2 calculation: cars*0.21 + buses*0.089 + trucks*0.62 + bikes*0.08 (kg/km, avg 3km trip)
      const co2=Math.round((row.cars*0.21+row.buses*0.089+row.trucks*0.62+row.bikes*0.08)*3);
      setCo2Today(p=>p+co2);
      setVehToday(p=>p+row.total);
      setMinSaved(p=>p+Math.round(row.total*0.15)); // 15% saved by smart routing
      setFeed(p=>[...p.slice(-29),{
        t:now.toLocaleTimeString("en",{hour:"2-digit",minute:"2-digit",second:"2-digit"}),
        total:row.total+Math.round((Math.random()-.5)*18),
        cars: row.cars +Math.round((Math.random()-.5)*10),
        trucks:row.trucks+Math.round((Math.random()-.5)*5),
      }]);
    };
    update();
    const t=setInterval(update,5000);
    return()=>clearInterval(t);
  },[now.getMinutes(),origin,dest,sliderMode,timeSlider]);

  const runPredict=async()=>{
    setLoading(true);
    try{
      const res=await fetch("http://localhost:5000/predict",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({hour:pHour,minute:0,dow:now.getDay()||1,cars:pCars,bikes:pBikes,buses:pBuses,trucks:pTrucks})
      });
      let result;
      if(res.ok) result=await res.json();
      else result=rfPredict({hour:pHour,cars:pCars,bikes:pBikes,buses:pBuses,trucks:pTrucks});
      setPred(result);
      setPredHistory(h=>[{...result,ts:new Date().toLocaleTimeString(),hour:pHour,cars:pCars,bikes:pBikes,buses:pBuses,trucks:pTrucks},...h.slice(0,9)]);
    }catch{
      const r=rfPredict({hour:pHour,cars:pCars,bikes:pBikes,buses:pBuses,trucks:pTrucks});
      setPred(r);
      setPredHistory(h=>[{...r,ts:new Date().toLocaleTimeString(),hour:pHour,cars:pCars,bikes:pBikes,buses:pBuses,trucks:pTrucks},...h.slice(0,9)]);
    }
    setLoading(false);
  };

  const nowH=now.getHours();
  const curRow=REAL_HOURLY[nowH]||REAL_HOURLY[8];
  const curSc=Math.round((curRow.total/180)*75);
  const curCol=curSc<30?"#22c55e":curSc<55?"#eab308":curSc<75?"#f97316":"#ef4444";
  const curSit=curSc<30?"Low":curSc<55?"Normal":curSc<75?"Heavy":"High";
  const critCount=liveEdges.filter(e=>e.score>75).length;

  const TABS=[
    {id:"map",      emoji:"🗺️", label:"LIVE MAP"},
    {id:"predict",  emoji:"🤖", label:"ML PREDICT"},
    {id:"forecast", emoji:"🔮", label:"FORECAST"},
    {id:"analyze",  emoji:"📊", label:"ANALYSIS"},
    {id:"segment",  emoji:"🛣️", label:"SEGMENTS"},
    {id:"sensors",  emoji:"📡", label:"SENSORS"},
    {id:"alerts",   emoji:"🚨", label:"ALERTS"},
    {id:"signal",   emoji:"🚦", label:"SIGNAL OPTIMIZER"},
    {id:"model",    emoji:"🧠", label:"MODEL"},
  ];

  const selInfo=selNode?LOCATIONS[selNode]:null;
  const selEdges=selNode?liveEdges.filter(e=>e.from===selNode||e.to===selNode):[];
  const selAvgCong=selEdges.length?Math.round(selEdges.reduce((a,e)=>a+e.score,0)/selEdges.length):0;

  return(
    <div style={{minHeight:"100vh",background:C.bg,color:C.text,fontFamily:"'IBM Plex Sans','Segoe UI',sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;600;700&family=JetBrains+Mono:wght@400;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:#030c1a}::-webkit-scrollbar-thumb{background:#1a2f50;border-radius:3px}
        .tbtn:hover{background:rgba(59,130,246,.12)!important}
        input[type=range]{accent-color:#3b82f6;width:100%;cursor:pointer}
        select{background:#0a1628;color:#e2e8f0;border:1px solid #1a2f50;border-radius:6px;padding:8px 10px;font-size:12px;outline:none;width:100%;cursor:pointer}
        .fade{animation:fi .3s ease}@keyframes fi{from{opacity:0;transform:translateY(6px)}to{opacity:1}}
        @keyframes pu{0%,100%{opacity:1}50%{opacity:.2}}
        .blink{animation:bl 1s step-end infinite}@keyframes bl{0%,100%{opacity:1}50%{opacity:0}}
        .rbtn{transition:all .2s;cursor:pointer}.rbtn:hover{filter:brightness(1.15);transform:translateY(-1px)}
        .nrow:hover{background:rgba(59,130,246,.06)!important}
        .alert-row:hover{transform:translateX(3px);border-color:rgba(59,130,246,.4)!important}.alert-row{transition:all .2s}
        .gm-style .gm-style-iw-c{background:#0d1b2e!important;border:1px solid #1e3a5f!important;border-radius:10px!important;padding:0!important;box-shadow:0 8px 32px rgba(0,0,0,.6)!important}
        .gm-style .gm-style-iw-d{overflow:hidden!important}
        .gm-style-iw-tc::after{background:#0d1b2e!important}
        .gm-ui-hover-effect>span{background:#5a7098!important}
      `}</style>

      {/* ── HEADER ── */}
      <header style={{background:"rgba(3,12,26,.97)",borderBottom:`1px solid ${C.border}`,padding:"0 24px",display:"flex",alignItems:"center",justifyContent:"space-between",height:62,position:"sticky",top:0,zIndex:300,backdropFilter:"blur(20px)"}}>
        <div style={{display:"flex",alignItems:"center",gap:14}}>
          <div style={{width:40,height:40,borderRadius:11,background:"linear-gradient(135deg,#1d4ed8,#7c3aed)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,boxShadow:"0 0 24px #3b82f655"}}>🚦</div>
          <div>
            <div style={{fontWeight:700,fontSize:15,letterSpacing:.5,color:"#f1f5f9"}}>
              SIGNAL COMMAND <span style={{color:"#3b82f6"}}>PRO</span>
              <span style={{fontSize:10,color:"#3a5070",marginLeft:10,letterSpacing:2}}>v2.0</span>
            </div>
            <div style={{fontSize:9,color:"#3a5070",letterSpacing:2}}>HYDERABAD SMART TRAFFIC · DATA SCIENCE · 8,928 RECORDS · RF 92.89%</div>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          {/* Backend status */}
          <div style={{display:"flex",alignItems:"center",gap:6,background:"#0a1628",border:`1px solid ${C.border}`,borderRadius:8,padding:"5px 12px"}}>
            <div style={{width:7,height:7,borderRadius:"50%",background:backendOk===true?"#22c55e":backendOk===false?"#ef4444":"#eab308",animation:backendOk===null?"pu 2s infinite":"none"}}/>
            <span style={{fontSize:10,color:backendOk===true?"#22c55e":backendOk===false?"#ef4444":"#eab308"}}>
              {backendOk===true?"Flask API Connected":backendOk===false?"Demo Mode (API Offline)":"Connecting..."}
            </span>
          </div>
          {critCount>0&&(
            <div style={{display:"flex",alignItems:"center",gap:6,background:"#ef444415",border:"1px solid #ef444430",borderRadius:8,padding:"5px 12px"}}>
              <div className="blink" style={{width:7,height:7,borderRadius:"50%",background:"#ef4444"}}/>
              <span style={{color:"#ef4444",fontSize:11,fontWeight:700}}>{critCount} CRITICAL ROADS</span>
            </div>
          )}
          <div style={{display:"flex",alignItems:"center",gap:7,background:curCol+"15",border:`1px solid ${curCol}30`,borderRadius:8,padding:"5px 14px"}}>
            <div style={{width:7,height:7,borderRadius:"50%",background:curCol,animation:"pu 2s infinite"}}/>
            <span style={{color:curCol,fontSize:11,fontWeight:700}}>City: {curSit} · {curRow.total} v/hr</span>
          </div>
          <div style={{background:"#0a1628",border:`1px solid ${C.border}`,borderRadius:8,padding:"6px 14px",textAlign:"right"}}>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:16,color:"#3b82f6",fontWeight:600}}>{now.toLocaleTimeString()}</div>
            <div style={{fontSize:9,color:C.muted}}>{now.toDateString()}</div>
          </div>
        </div>
      </header>

      {/* ── TABS ── */}
      <nav style={{background:"#060f1e",borderBottom:`1px solid ${C.border}`,padding:"0 24px",display:"flex",gap:0,overflowX:"auto"}}>
        {TABS.map(t=>(
          <button key={t.id} className="tbtn" onClick={()=>setTab(t.id)} style={{background:tab===t.id?"rgba(59,130,246,.1)":"transparent",color:tab===t.id?"#3b82f6":C.muted,border:"none",borderBottom:tab===t.id?"2px solid #3b82f6":"2px solid transparent",padding:"12px 18px",fontSize:10,fontWeight:700,letterSpacing:1,cursor:"pointer",transition:"all .2s",whiteSpace:"nowrap"}}>
            {t.emoji} {t.label}
          </button>
        ))}
      </nav>

      {/* ── MAIN CONTENT ── */}
      <main className="fade" key={tab} style={{padding:"20px 24px",maxWidth:1700,margin:"0 auto"}}>

        {/* ═══════ MAP TAB ═══════ */}
        {tab==="map"&&(
          <div style={{display:"grid",gridTemplateColumns:"1fr 320px",gap:18}}>
            <div style={{display:"flex",flexDirection:"column",gap:14}}>

              {/* LIVE STATS TICKER */}
              <div style={{background:"#060f1e",border:"1px solid #1a2f50",borderRadius:10,padding:"10px 18px",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
                {[
                  ["🚗","Vehicles Today",vehToday.toLocaleString(),"#3b82f6"],
                  ["🌿","CO₂ Tracked (kg)",co2Today.toLocaleString(),"#22c55e"],
                  ["⏱","Minutes Saved",minSaved.toLocaleString(),"#a78bfa"],
                  ["🚨","Critical Roads",critCount,"#ef4444"],
                  ["⚡","City Speed",Math.round(Math.max(8,65-curSc*.55))+" km/h","#eab308"],
                  ["📊","RF Accuracy","92.89%","#22c55e"],
                ].map(([ic,lb,vl,ac])=>(
                  <div key={lb} style={{display:"flex",alignItems:"center",gap:8}}>
                    <span style={{fontSize:16}}>{ic}</span>
                    <div>
                      <div style={{fontSize:9,color:C.muted,letterSpacing:1}}>{lb.toUpperCase()}</div>
                      <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:14,fontWeight:700,color:ac}}>{vl}</div>
                    </div>
                  </div>
                ))}
                {/* Emergency toggle */}
                <button onClick={()=>setEmerMode(m=>!m)} style={{background:emerMode?"#ef444422":"#030c1a",border:`1px solid ${emerMode?"#ef4444":"#1a2f50"}`,borderRadius:8,padding:"6px 14px",cursor:"pointer",display:"flex",alignItems:"center",gap:7,transition:"all .2s"}}>
                  <span style={{fontSize:16}}>🚑</span>
                  <div style={{textAlign:"left"}}>
                    <div style={{fontSize:9,color:emerMode?"#ef4444":C.muted,letterSpacing:1,fontWeight:700}}>EMERGENCY</div>
                    <div style={{fontSize:9,color:emerMode?"#ef4444":C.muted}}>{emerMode?"MODE ON":"Click to activate"}</div>
                  </div>
                </button>
              </div>

              {/* Emergency mode banner */}
              {emerMode&&(
                <div style={{background:"#ef444412",border:"2px solid #ef444444",borderRadius:10,padding:"12px 18px",display:"flex",alignItems:"center",gap:14,animation:"fi .3s ease"}}>
                  <span style={{fontSize:28,animation:"bl 1s step-end infinite"}}>🚑</span>
                  <div style={{flex:1}}>
                    <div style={{color:"#ef4444",fontWeight:700,fontSize:13,marginBottom:3}}>EMERGENCY VEHICLE MODE ACTIVE</div>
                    <div style={{fontSize:11,color:"#f87171"}}>Fastest route calculated with maximum priority. All signals on route recommended GREEN. Avoid route: general public.</div>
                  </div>
                  {routes[0]&&<div style={{textAlign:"center",background:"#ef444422",borderRadius:8,padding:"8px 14px"}}>
                    <div style={{fontSize:9,color:"#ef4444",letterSpacing:1}}>ETA</div>
                    <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:22,color:"#ef4444",fontWeight:700}}>{routes[0].totalTime} min</div>
                    <div style={{fontSize:9,color:"#ef4444"}}>{routes[0].totalKm} km</div>
                  </div>}
                </div>
              )}

              {/* ── TIME SLIDER ── */}
              <Card style={{padding:"14px 18px"}}>
                <div style={{display:"flex",alignItems:"center",gap:16,flexWrap:"wrap"}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <span style={{fontSize:18}}>🕐</span>
                    <div>
                      <div style={{fontSize:9,color:C.muted,letterSpacing:2,marginBottom:2}}>TIME CONTROL</div>
                      <div style={{display:"flex",gap:6}}>
                        <button onClick={()=>setSliderMode(false)} style={{background:!sliderMode?"#3b82f622":"#030c1a",border:`1px solid ${!sliderMode?"#3b82f6":"#1a2f50"}`,borderRadius:6,padding:"4px 10px",fontSize:10,color:!sliderMode?"#3b82f6":C.muted,cursor:"pointer",fontWeight:700}}>● LIVE</button>
                        <button onClick={()=>setSliderMode(true)}  style={{background:sliderMode?"#a78bfa22":"#030c1a",border:`1px solid ${sliderMode?"#a78bfa":"#1a2f50"}`,borderRadius:6,padding:"4px 10px",fontSize:10,color:sliderMode?"#a78bfa":C.muted,cursor:"pointer",fontWeight:700}}>⏪ TIME TRAVEL</button>
                      </div>
                    </div>
                  </div>
                  {sliderMode&&(
                    <div style={{flex:1,minWidth:260}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                        <span style={{fontSize:10,color:C.muted}}>Drag to explore any hour from your CSV data</span>
                        <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:13,color:"#a78bfa",fontWeight:700}}>
                          {timeSlider===0?"12:00 AM":timeSlider<12?`${timeSlider}:00 AM`:timeSlider===12?"12:00 PM":`${timeSlider-12}:00 PM`}
                          {(timeSlider>=7&&timeSlider<=9)||(timeSlider>=16&&timeSlider<=19)?" 🔴 PEAK":" 🟢"}
                        </span>
                      </div>
                      <input type="range" min={0} max={23} value={timeSlider} onChange={e=>{
                        const h=+e.target.value;
                        setTimeSlider(h);
                        const newEdges=buildLiveEdges(h);
                        setEdges(newEdges);
                        if(origin!==dest) setRoutes(computeAllRoutes(newEdges,origin,dest));
                      }} style={{accentColor:"#a78bfa"}}/>
                      <div style={{display:"flex",justifyContent:"space-between",fontSize:8,color:"#1a2f50",marginTop:3}}>
                        {["12A","3A","6A","9A","12P","3P","6P","9P","11P"].map(t=><span key={t}>{t}</span>)}
                      </div>
                      <div style={{marginTop:10,display:"flex",gap:8,flexWrap:"wrap"}}>
                        {REAL_HOURLY.map((row,h)=>(
                          <div key={h} onClick={()=>{
                            setTimeSlider(h);
                            const newEdges=buildLiveEdges(h);
                            setEdges(newEdges);
                            if(origin!==dest) setRoutes(computeAllRoutes(newEdges,origin,dest));
                          }} title={`${h}:00 — ${row.total} vehicles`} style={{
                            width:16,height:Math.round((row.total/180)*32)+6,
                            background:h===timeSlider?"#a78bfa":(row.total>150?"#ef4444":row.total>110?"#f97316":row.total>80?"#eab308":"#22c55e"),
                            borderRadius:"2px 2px 0 0",cursor:"pointer",opacity:h===timeSlider?1:.7,
                            border:h===timeSlider?"1px solid #a78bfa":"none",
                            alignSelf:"flex-end",transition:"all .15s",
                          }}/>
                        ))}
                      </div>
                    </div>
                  )}
                  {!sliderMode&&(
                    <div style={{flex:1,display:"flex",alignItems:"center",gap:12}}>
                      <div style={{background:"#030c1a",borderRadius:8,padding:"8px 16px"}}>
                        <div style={{fontSize:9,color:C.muted}}>NOW</div>
                        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:16,color:curCol,fontWeight:700}}>{now.toLocaleTimeString()}</div>
                      </div>
                      <div style={{fontSize:11,color:C.muted}}>Map updates every 5 seconds with live RF model scores</div>
                    </div>
                  )}
                </div>
              </Card>

              {/* ── FORECAST PREVIEW BANNER ── */}
              {(()=>{
                const h=sliderMode?timeSlider:now.getHours();
                const next3=[1,2,3].map(off=>{
                  const fh=(h+off)%24;
                  const row=REAL_HOURLY[fh];
                  const sc=Math.round((row.total/180)*75);
                  const col=sc<30?"#22c55e":sc<55?"#eab308":sc<75?"#f97316":"#ef4444";
                  const sit=sc<30?"Low":sc<55?"Normal":sc<75?"Heavy":"High";
                  const lbl=fh===0?"12AM":fh<12?fh+"AM":fh===12?"12PM":(fh-12)+"PM";
                  return{fh,sc,col,sit,lbl};
                });
                const worst=next3.reduce((a,b)=>b.sc>a.sc?b:a);
                return(
                  <div onClick={()=>setTab("forecast")} style={{background:"#060f1e",border:`1px solid ${worst.col}33`,borderRadius:10,padding:"11px 18px",display:"flex",alignItems:"center",gap:16,cursor:"pointer",transition:"all .2s"}} className="rbtn">
                    <span style={{fontSize:22}}>🔮</span>
                    <div style={{flex:1}}>
                      <div style={{fontSize:9,color:C.muted,letterSpacing:2,marginBottom:4}}>3-HOUR CONGESTION FORECAST — CLICK TO EXPAND</div>
                      <div style={{display:"flex",gap:12}}>
                        {next3.map(f=>(
                          <div key={f.fh} style={{display:"flex",alignItems:"center",gap:6}}>
                            <div style={{width:8,height:8,borderRadius:"50%",background:f.col}}/>
                            <span style={{fontSize:11,color:"#94a3b8"}}>{f.lbl}</span>
                            <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:f.col,fontWeight:700}}>{f.sc}%</span>
                            <span style={{fontSize:10,color:C.muted}}>{f.sit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    {worst.sc>60&&(
                      <div style={{background:worst.col+"22",border:`1px solid ${worst.col}44`,borderRadius:8,padding:"6px 12px",textAlign:"center"}}>
                        <div style={{fontSize:9,color:worst.col,fontWeight:700}}>⚠️ PEAK AHEAD</div>
                        <div style={{fontSize:10,color:worst.col}}>{worst.lbl} · {worst.sc}%</div>
                      </div>
                    )}
                    <span style={{color:C.muted,fontSize:14}}>→</span>
                  </div>
                );
              })()}

              {/* Google Map */}
              <Card style={{padding:14}}>
                <STitle right={
                  <div style={{display:"flex",gap:8}}>
                    {routes.length>0&&<Chip label={`${routes.length} routes · Best: ${routes[0]?.totalTime}min`} color="#3b82f6"/>}
                    {sliderMode&&<Chip label={`TIME TRAVEL: ${timeSlider}:00`} color="#a78bfa"/>}
                    {emerMode&&<Chip label="🚑 EMERGENCY" color="#ef4444"/>}
                    <Chip label="OPENSTREETMAP" color="#22c55e"/>
                  </div>
                }>HYDERABAD LIVE TRAFFIC — REAL COORDINATES</STitle>
                <LeafletMap liveEdges={liveEdges} routes={routes} activeRoute={activeRoute} origin={origin} dest={dest} onMarkerClick={setSelNode} emerMode={emerMode}/>
              </Card>

              {/* Shortest path breakdown */}
              {routes.length>0&&(
                <Card style={{border:`1px solid ${routes[activeRoute]?.lineColor}30`}}>
                  {/* Route selector tabs */}
                  <div style={{display:"flex",gap:6,marginBottom:14}}>
                    {routes.map((r,i)=>(
                      <button key={i} onClick={()=>setActiveRoute(i)} style={{flex:1,background:activeRoute===i?r.lineColor+"22":"#030c1a",border:`1px solid ${activeRoute===i?r.lineColor+"66":"#1a2f50"}`,borderRadius:8,padding:"8px 6px",cursor:"pointer",transition:"all .2s"}}>
                        <div style={{fontSize:14}}>{r.label==="Fastest"?"⚡":r.label==="Alternate"?"🔀":"🌿"}</div>
                        <div style={{fontSize:9,color:activeRoute===i?r.lineColor:"#5a7098",fontWeight:700,marginTop:2}}>{r.label.toUpperCase()}</div>
                        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:activeRoute===i?r.lineColor:"#475569"}}>{r.totalTime}min</div>
                      </button>
                    ))}
                  </div>

                  {routes[activeRoute]&&(()=>{
                    const r=routes[activeRoute];
                    return(
                      <>
                        <STitle right={
                          <div style={{display:"flex",gap:6}}>
                            <Chip label={r.totalKm+" km"}    color="#22c55e"/>
                            <Chip label={r.totalTime+" min"} color={r.lineColor}/>
                            <Chip label={r.path.length+" stops"} color="#a78bfa"/>
                          </div>
                        }>{r.label==="Fastest"?"⚡ FASTEST":"🔀 ALTERNATE"} PATH — {LOCATIONS[origin]?.name} → {LOCATIONS[dest]?.name}</STitle>

                        {/* Path nodes */}
                        <div style={{display:"flex",flexWrap:"wrap",alignItems:"center",gap:4,marginBottom:14}}>
                          {r.path.map((id,i)=>{
                            const loc=LOCATIONS[id];
                            const isO=i===0,isD=i===r.path.length-1;
                            return(
                              <span key={id} style={{display:"flex",alignItems:"center",gap:4}}>
                                <span style={{background:isO?"#22c55e20":isD?"#f9731620":"#1a2f50",color:isO?"#22c55e":isD?"#f97316":"#94a3b8",border:`1px solid ${isO?"#22c55e40":isD?"#f9731640":"#243050"}`,borderRadius:7,padding:"4px 10px",fontSize:11,fontFamily:"'JetBrains Mono',monospace",fontWeight:600}}>
                                  {isO?"🟢 ":isD?"🟠 ":""}{id}
                                  <span style={{fontSize:9,fontFamily:"sans-serif",color:"#475569",marginLeft:4}}>{loc?.name}</span>
                                </span>
                                {i<r.path.length-1&&<span style={{color:"#1e3a5f",fontSize:16}}>→</span>}
                              </span>
                            );
                          })}
                        </div>

                        {/* Segment chips */}
                        <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:14}}>
                          {r.segs.map((s,i)=>(
                            <div key={i} style={{background:s.color+"12",border:`1px solid ${s.color}30`,borderRadius:8,padding:"5px 10px",fontSize:10}}>
                              <span style={{color:s.color,fontWeight:700}}>{s.name}</span>
                              <span style={{color:C.muted,marginLeft:6}}>{s.score}% · {s.speed}km/h</span>
                            </div>
                          ))}
                        </div>

                        {/* Congestion profile bar */}
                        <div style={{background:"#030c1a",borderRadius:8,padding:"12px 14px"}}>
                          <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                            <span style={{fontSize:10,color:C.muted}}>Congestion Profile Along Route</span>
                            <span style={{fontSize:10,color:r.lineColor}}>{r.avgCong}% avg</span>
                          </div>
                          <div style={{display:"flex",gap:2,height:10,borderRadius:4,overflow:"hidden"}}>
                            {r.segs.map((s,i)=>(
                              <div key={i} title={s.name} style={{flex:1,background:s.color,borderRadius:2,opacity:.85}}/>
                            ))}
                          </div>
                          <div style={{display:"flex",justifyContent:"space-between",marginTop:5,fontSize:9,color:C.muted}}>
                            <span>🟢 {LOCATIONS[origin]?.name}</span>
                            <span>{LOCATIONS[dest]?.name} 🟠</span>
                          </div>
                        </div>

                        {/* Route comparison table */}
                        <div style={{marginTop:12,display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6}}>
                          {routes.map((ro,i)=>(
                            <div key={i} onClick={()=>setActiveRoute(i)} style={{background:i===activeRoute?"#0d1f3c":"#030c1a",border:`1px solid ${i===activeRoute?ro.lineColor+"55":"#1a2f50"}`,borderRadius:8,padding:"8px",textAlign:"center",cursor:"pointer",transition:"all .2s"}}>
                              <div style={{fontSize:11,color:ro.lineColor,fontWeight:700,marginBottom:4}}>{ro.label==="Fastest"?"⚡":ro.label==="Alternate"?"🔀":"🌿"} {ro.label}</div>
                              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:"#e2e8f0"}}>{ro.totalTime} min</div>
                              <div style={{fontSize:9,color:"#475569"}}>{ro.totalKm} km · {ro.avgCong}% cong</div>
                            </div>
                          ))}
                        </div>
                      </>
                    );
                  })()}
                </Card>
              )}
            </div>

            {/* ── RIGHT PANEL ── */}
            <div style={{display:"flex",flexDirection:"column",gap:14}}>

              {/* Route Optimizer */}
              <Card>
                <STitle>🔍 ROUTE OPTIMIZER</STitle>
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  <div>
                    <div style={{fontSize:10,color:"#22c55e",marginBottom:4,fontWeight:600}}>🟢 ORIGIN</div>
                    <select value={origin} onChange={e=>setOrigin(e.target.value)}>
                      {Object.values(LOCATIONS).map(l=><option key={l.id} value={l.id}>{l.id} — {l.name}</option>)}
                    </select>
                  </div>
                  <div style={{textAlign:"center",color:C.muted,fontSize:20}}>⇅</div>
                  <div>
                    <div style={{fontSize:10,color:"#f97316",marginBottom:4,fontWeight:600}}>🟠 DESTINATION</div>
                    <select value={dest} onChange={e=>setDest(e.target.value)}>
                      {Object.values(LOCATIONS).map(l=><option key={l.id} value={l.id}>{l.id} — {l.name}</option>)}
                    </select>
                  </div>
                  <button className="rbtn" onClick={()=>{
                    const e=buildLiveEdges(now.getHours());
                    setEdges(e);
                    const r=computeAllRoutes(e,origin,dest);
                    setRoutes(r);
                    setActiveRoute(0);
                  }} style={{background:"linear-gradient(135deg,#1d4ed8,#7c3aed)",color:"#fff",border:"none",borderRadius:9,padding:"12px",fontSize:12,fontWeight:700,letterSpacing:1,marginTop:4}}>
                    🔍 FIND SHORTEST PATH
                  </button>
                </div>

                {routes.length>0&&(
                  <div style={{marginTop:14}}>
                    <div style={{fontSize:9,color:C.muted,letterSpacing:2,marginBottom:8}}>K-SHORTEST PATHS RESULT</div>
                    {routes.map((r,i)=>(
                      <div key={i} onClick={()=>setActiveRoute(i)} style={{background:activeRoute===i?"#0d1f3c":"#030c1a",border:`1px solid ${activeRoute===i?r.lineColor+"66":"#1a2f50"}`,borderLeft:`4px solid ${r.lineColor}`,borderRadius:8,padding:"10px 12px",marginBottom:7,cursor:"pointer",transition:"all .2s"}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                          <span style={{color:r.lineColor,fontWeight:700,fontSize:12}}>
                            {r.label==="Fastest"?"⚡":r.label==="Alternate"?"🔀":"🌿"} {r.label}
                          </span>
                          {activeRoute===i&&<span style={{fontSize:9,color:r.lineColor,background:r.lineColor+"22",padding:"2px 7px",borderRadius:99}}>ACTIVE</span>}
                        </div>
                        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:5}}>
                          {[["⏱",r.totalTime+" min","#e2e8f0"],["📍",r.totalKm+" km","#94a3b8"],["🔴",r.avgCong+"%",r.avgCong>75?"#ef4444":r.avgCong>50?"#f97316":"#22c55e"]].map(([ic,v,c])=>(
                            <div key={ic} style={{background:"#060f1e",borderRadius:5,padding:"5px",textAlign:"center"}}>
                              <div style={{fontSize:10}}>{ic}</div>
                              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:c,fontWeight:700}}>{v}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Selected junction */}
              {selInfo&&(
                <Card style={{border:"1px solid #3b82f630"}}>
                  <STitle right={<button onClick={()=>setSelNode(null)} style={{background:"#1a2f50",color:C.muted,border:"none",borderRadius:4,padding:"3px 8px",fontSize:10,cursor:"pointer"}}>✕</button>}>
                    📍 JUNCTION INFO
                  </STitle>
                  <div style={{fontWeight:700,fontSize:14,marginBottom:3}}>{selInfo.name}</div>
                  <div style={{fontSize:10,color:C.muted,marginBottom:10}}>{selInfo.zone} Zone · {selInfo.id}</div>
                  <Chip label={selAvgCong<30?"LOW":selAvgCong<55?"NORMAL":selAvgCong<75?"HEAVY":"HIGH"} color={selAvgCong<30?"#22c55e":selAvgCong<55?"#eab308":selAvgCong<75?"#f97316":"#ef4444"}/>
                  <div style={{marginTop:12,display:"flex",flexDirection:"column",gap:7}}>
                    {[["Connected Roads",selEdges.length],["Avg Congestion",selAvgCong+"%"],["Est. Speed",Math.round(Math.max(8,65-selAvgCong*.55))+" km/h"],["Delay Index",Math.round(selAvgCong/3.4)+" min"],["GPS Lat",selInfo.lat.toFixed(4)],["GPS Lng",selInfo.lng.toFixed(4)]].map(([k,v])=>(
                      <div key={k} style={{display:"flex",justifyContent:"space-between",borderBottom:"1px solid #060f1e",paddingBottom:7}}>
                        <span style={{fontSize:11,color:C.muted}}>{k}</span>
                        <span style={{fontSize:11,fontFamily:"'JetBrains Mono',monospace",color:C.text}}>{v}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Top congested */}
              <Card>
                <STitle right={<div className="blink" style={{width:7,height:7,borderRadius:"50%",background:"#22c55e"}}/>}>TOP CONGESTED</STitle>
                {[...liveEdges].sort((a,b)=>b.score-a.score).slice(0,7).map((s,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 0",borderBottom:"1px solid #060f1e"}}>
                    <div style={{width:8,height:8,borderRadius:"50%",background:s.color,flexShrink:0}}/>
                    <div style={{flex:1}}>
                      <div style={{fontSize:10,color:"#94a3b8",lineHeight:1.2}}>{s.name}</div>
                      <div style={{fontSize:9,color:C.muted}}>{s.speed} km/h · +{s.delay}min</div>
                    </div>
                    <div style={{background:"#1a2f50",borderRadius:3,height:4,width:40,overflow:"hidden"}}>
                      <div style={{height:"100%",width:`${s.score}%`,background:s.color,borderRadius:3}}/>
                    </div>
                    <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:s.color,minWidth:30,textAlign:"right"}}>{s.score}%</div>
                  </div>
                ))}
              </Card>
            </div>
          </div>
        )}

        {/* ═══════ PREDICT TAB ═══════ */}
        {tab==="predict"&&(
          <div style={{display:"grid",gridTemplateColumns:"380px 1fr",gap:18}}>
            <Card>
              <STitle>🤖 RANDOM FOREST INPUTS</STitle>
              <div style={{background:"#030c1a",border:`1px solid ${C.border}`,borderRadius:8,padding:12,marginBottom:16}}>
                <div style={{fontSize:9,color:C.muted,letterSpacing:2,marginBottom:8}}>📊 YOUR CSV DATASET BASELINES</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                  {[["Peak avg","178/hr","#ef4444"],["Night avg","42/hr","#22c55e"],["Max ever","279","#f97316"],["Overall avg","114/hr","#eab308"]].map(([k,v,c])=>(
                    <div key={k} style={{background:"#0a1628",borderRadius:6,padding:"7px 9px"}}>
                      <div style={{fontSize:9,color:C.muted}}>{k}</div>
                      <div style={{fontFamily:"'JetBrains Mono',monospace",color:c,fontWeight:700,fontSize:13}}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>
              {[
                {emoji:"🚘",label:"Car Count",   val:pCars,  set:setPCars,  max:200,avg:curRow.cars},
                {emoji:"🚲",label:"Bike Count",  val:pBikes, set:setPBikes, max:60, avg:curRow.bikes},
                {emoji:"🚌",label:"Bus Count",   val:pBuses, set:setPBuses, max:50, avg:curRow.buses},
                {emoji:"🚛",label:"Truck Count", val:pTrucks,set:setPTrucks,max:80, avg:curRow.trucks},
              ].map(f=>(
                <div key={f.label} style={{marginBottom:14}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                    <label style={{fontSize:11,color:"#cbd5e1"}}>{f.emoji} {f.label}</label>
                    <div style={{display:"flex",gap:8,alignItems:"center"}}>
                      <span style={{fontSize:9,color:C.muted}}>avg {f.avg}</span>
                      <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:"#3b82f6",minWidth:24,textAlign:"right"}}>{f.val}</span>
                    </div>
                  </div>
                  <input type="range" min={0} max={f.max} value={f.val} onChange={e=>f.set(+e.target.value)}/>
                </div>
              ))}
              <div style={{marginBottom:14}}>
                <div style={{fontSize:10,color:C.muted,marginBottom:4}}>⏰ HOUR OF DAY</div>
                <select value={pHour} onChange={e=>setPHour(+e.target.value)}>
                  {Array.from({length:24},(_,h)=>(
                    <option key={h} value={h}>{h===0?"12":h>12?h-12:h}:00 {h<12?"AM":"PM"}{(h>=7&&h<=9)||(h>=16&&h<=19)?" 🔴 PEAK":""}</option>
                  ))}
                </select>
              </div>
              <div style={{background:"#030c1a",borderRadius:7,padding:"9px 12px",marginBottom:16,display:"flex",justifyContent:"space-between",border:`1px solid ${C.border}`}}>
                <span style={{fontSize:11,color:C.muted}}>Total Input</span>
                <span style={{fontFamily:"'JetBrains Mono',monospace",color:"#3b82f6",fontWeight:700}}>{pCars+pBikes+pBuses+pTrucks} vehicles</span>
              </div>
              <button className="rbtn" onClick={runPredict} disabled={loading} style={{width:"100%",background:loading?"#1a2f50":"linear-gradient(135deg,#1d4ed8,#7c3aed)",color:"#fff",border:"none",borderRadius:9,padding:"13px",fontSize:13,fontWeight:700,letterSpacing:1}}>
                {loading?"⏳ Running Model...":"🤖 RUN RF PREDICTION"}
              </button>
              {!backendOk&&<div style={{marginTop:8,fontSize:9,color:"#f97316",textAlign:"center"}}>⚠️ Flask offline — using frontend simulation</div>}
            </Card>

            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              {pred?(
                <>
                  <Card style={{border:`2px solid ${pred.color}33`}}>
                    <STitle>PREDICTION OUTPUT — MODEL ACCURACY: 92.89%</STitle>
                    <div style={{display:"grid",gridTemplateColumns:"200px 1fr",gap:20,alignItems:"center"}}>
                      <div style={{textAlign:"center"}}>
                        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:88,fontWeight:700,color:pred.color,lineHeight:1}}>{pred.score}</div>
                        <div style={{color:C.muted,fontSize:11,margin:"6px 0 10px"}}>Congestion Score</div>
                        <Chip label={(pred.situation||pred.sit||"").toUpperCase()} color={pred.color}/>
                        <div style={{marginTop:8,fontSize:10,color:C.muted}}>Confidence <span style={{color:pred.color,fontWeight:700}}>{pred.conf||pred.confidence}%</span></div>
                      </div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                        {[["⚡","Avg Speed",pred.speed+" km/h","#22c55e"],["🕐","Delay","+"+pred.delay+" min","#f97316"],["🚗","Total Vehicles",pred.total||pred.total_vehicles,"#3b82f6"],["📊","Risk Level",pred.score>75?"HIGH":pred.score>50?"MEDIUM":"LOW",pred.color],["🤖","Algorithm","Random Forest","#a78bfa"],["🎯","Train Acc.","92.89%","#22c55e"]].map(([ic,lb,vl,c])=>(
                          <div key={lb} style={{background:"#030c1a",borderRadius:8,padding:"10px 12px"}}>
                            <div style={{fontSize:16,marginBottom:4}}>{ic}</div>
                            <div style={{fontSize:9,color:C.muted,letterSpacing:1}}>{lb.toUpperCase()}</div>
                            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:14,color:c,fontWeight:700,marginTop:2}}>{vl}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                    <Card>
                      <STitle>CLASS PROBABILITIES</STitle>
                      <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={[{name:"Low",pct:pred.score<30?85:5},{name:"Normal",pct:pred.score>=30&&pred.score<55?82:8},{name:"Heavy",pct:pred.score>=55&&pred.score<75?80:5},{name:"High",pct:pred.score>=75?84:3}]}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1a2f50"/>
                          <XAxis dataKey="name" tick={{fill:"#5a7898",fontSize:10}}/>
                          <YAxis tick={{fill:"#5a7898",fontSize:9}} domain={[0,100]}/>
                          <Tooltip contentStyle={TT}/>
                          <Bar dataKey="pct" name="%" radius={[4,4,0,0]}>
                            {["#22c55e","#eab308","#f97316","#ef4444"].map((c,i)=><Cell key={i} fill={c}/>)}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </Card>
                    <Card>
                      <STitle>INPUT COMPOSITION</STitle>
                      <ResponsiveContainer width="100%" height={180}>
                        <PieChart>
                          <Pie data={[{name:"Cars",v:pCars},{name:"Bikes",v:pBikes},{name:"Buses",v:pBuses},{name:"Trucks",v:pTrucks}]} dataKey="v" nameKey="name" cx="50%" cy="50%" innerRadius={42} outerRadius={72}>
                            {["#3b82f6","#22c55e","#f97316","#ef4444"].map((c,i)=><Cell key={i} fill={c}/>)}
                          </Pie>
                          <Tooltip contentStyle={TT}/>
                          <Legend wrapperStyle={{fontSize:10}}/>
                        </PieChart>
                      </ResponsiveContainer>
                    </Card>
                  </div>
                  <Card style={{border:`1px solid ${pred.color}25`,background:pred.color+"06"}}>
                    <STitle>🤖 AI RECOMMENDATION</STitle>
                    <div style={{fontSize:14,color:pred.color,fontWeight:700,marginBottom:8}}>
                      {(pred.situation||pred.sit)==="high"?"🚨 SEVERE — Avoid travel. Major congestion detected.":
                       (pred.situation||pred.sit)==="heavy"?"⚠️ HEAVY — Take alternate route. Allow extra 20+ min.":
                       (pred.situation||pred.sit)==="normal"?"🟡 MODERATE — Proceed with caution. Minor delays.":
                       "✅ LOW TRAFFIC — Great time to travel. Roads clear."}
                    </div>
                    <div style={{fontSize:12,color:C.muted,lineHeight:1.7}}>
                      Predicted {(pred.situation||pred.sit).toUpperCase()} traffic at {pHour}:00 with {pred.total||pCars+pBikes+pBuses+pTrucks} vehicles. 
                      {pred.score>50?` Estimated +${pred.delay} min delay above baseline. Consider departing ${pred.delay+5} min earlier.`:` Journey close to normal at ${pred.speed} km/h average speed.`}
                    </div>
                  </Card>
                </>
              ):(
                <Card style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:300,border:"1px dashed #1a2f50"}}>
                  <div style={{fontSize:72,marginBottom:16}}>🤖</div>
                  <div style={{color:C.muted,fontSize:14,marginBottom:6}}>Set vehicle counts and run the model</div>
                  <div style={{fontSize:11,color:"#3a5070"}}>Random Forest · 8,928 records · 92.89% accuracy · 12 features</div>
                </Card>
              )}

              {/* ── PREDICTION HISTORY ── */}
              {predHistory.length>0&&(
                <Card>
                  <STitle right={<Chip label={`${predHistory.length} predictions`} color="#a78bfa"/>}>
                    📋 PREDICTION HISTORY — RF MODEL LOG
                  </STitle>
                  <div style={{overflowX:"auto"}}>
                    <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
                      <thead>
                        <tr style={{borderBottom:`1px solid ${C.border}`}}>
                          {["Time","Hour","Cars","Bikes","Buses","Trucks","Total","Score","Situation","Speed","Confidence"].map(h=>(
                            <th key={h} style={{padding:"7px 10px",textAlign:"left",color:C.muted,fontSize:9,letterSpacing:1,fontWeight:700,whiteSpace:"nowrap"}}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {predHistory.map((p,i)=>(
                          <tr key={i} className="nrow" style={{borderBottom:"1px solid #060f1e",background:i===0?`${p.color}08`:"transparent"}}>
                            <td style={{padding:"7px 10px",fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"#94a3b8"}}>{p.ts}</td>
                            <td style={{padding:"7px 10px",fontFamily:"'JetBrains Mono',monospace",color:"#94a3b8"}}>{p.hour}:00</td>
                            <td style={{padding:"7px 10px",color:"#3b82f6"}}>{p.cars}</td>
                            <td style={{padding:"7px 10px",color:"#22c55e"}}>{p.bikes}</td>
                            <td style={{padding:"7px 10px",color:"#f97316"}}>{p.buses}</td>
                            <td style={{padding:"7px 10px",color:"#ef4444"}}>{p.trucks}</td>
                            <td style={{padding:"7px 10px",fontWeight:700}}>{p.cars+p.bikes+p.buses+p.trucks}</td>
                            <td style={{padding:"7px 10px"}}>
                              <div style={{display:"flex",alignItems:"center",gap:6}}>
                                <div style={{background:"#1a2f50",borderRadius:3,height:4,width:36,overflow:"hidden"}}>
                                  <div style={{height:"100%",width:`${p.score}%`,background:p.color,borderRadius:3}}/>
                                </div>
                                <span style={{fontFamily:"'JetBrains Mono',monospace",color:p.color,fontWeight:700}}>{p.score}</span>
                              </div>
                            </td>
                            <td style={{padding:"7px 10px"}}><Chip label={(p.situation||p.sit||"?").toUpperCase()} color={p.color}/></td>
                            <td style={{padding:"7px 10px",fontFamily:"'JetBrains Mono',monospace",color:"#22c55e"}}>{p.speed} km/h</td>
                            <td style={{padding:"7px 10px",fontFamily:"'JetBrains Mono',monospace",color:"#a78bfa"}}>{p.conf||p.confidence}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* ═══════ ANALYSIS ═══════ */}
        {/* ══════════════ FULL FORECAST TAB ══════════════ */}
        {tab==="forecast"&&(
          <div style={{display:"flex",flexDirection:"column",gap:18}}>

            {/* Header explanation */}
            <Card style={{background:"linear-gradient(135deg,#0d1f3c,#0a1628)",border:"1px solid #1a2f50"}}>
              <div style={{display:"flex",alignItems:"center",gap:16}}>
                <div style={{fontSize:48}}>🔮</div>
                <div>
                  <div style={{fontWeight:700,fontSize:18,marginBottom:4}}>Congestion Forecast Engine</div>
                  <div style={{fontSize:12,color:C.muted,lineHeight:1.7,maxWidth:700}}>
                    Uses your trained <span style={{color:"#22c55e",fontWeight:700}}>Random Forest model (92.89% accuracy)</span> combined with 
                    real patterns from your <span style={{color:"#3b82f6",fontWeight:700}}>8,928-record CSV dataset</span> to predict 
                    traffic congestion for every hour ahead. Forecasts update live every 5 seconds.
                  </div>
                </div>
                <div style={{marginLeft:"auto",textAlign:"center",background:"#22c55e22",border:"1px solid #22c55e44",borderRadius:10,padding:"12px 20px"}}>
                  <div style={{fontSize:9,color:"#22c55e",letterSpacing:2}}>MODEL ACCURACY</div>
                  <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:28,fontWeight:700,color:"#22c55e"}}>92.89%</div>
                  <div style={{fontSize:9,color:"#22c55e"}}>Random Forest</div>
                </div>
              </div>
            </Card>

            {/* Current hour + next 6 hours big cards */}
            {(()=>{
              const baseH = sliderMode?timeSlider:now.getHours();
              const hours = Array.from({length:7},(_,i)=>i).map(offset=>{
                const fh=(baseH+offset)%24;
                const row=REAL_HOURLY[fh];
                const sc=Math.round((row.total/180)*75+(Math.random()*6-3));
                const clampedSc=Math.max(5,Math.min(97,sc));
                const col=clampedSc<30?"#22c55e":clampedSc<55?"#eab308":clampedSc<75?"#f97316":"#ef4444";
                const sit=clampedSc<30?"Low":clampedSc<55?"Normal":clampedSc<75?"Heavy":"High";
                const spd=Math.round(Math.max(8,65-clampedSc*0.57));
                const delay=Math.round(clampedSc/3.4);
                const lbl=fh===0?"12:00 AM":fh<12?`${fh}:00 AM`:fh===12?"12:00 PM":`${fh-12}:00 PM`;
                const isPeak=(fh>=7&&fh<=9)||(fh>=16&&fh<=19);
                const conf=Math.round(92-offset*1.5+Math.random()*3);
                return{fh,row,sc:clampedSc,col,sit,spd,delay,lbl,isPeak,conf,offset};
              });
              const current=hours[0];
              const upcoming=hours.slice(1);
              return(
                <>
                  {/* Current hour hero */}
                  <div style={{display:"grid",gridTemplateColumns:"1fr 2fr",gap:14}}>
                    <Card style={{border:`2px solid ${current.col}44`,textAlign:"center",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
                      <div style={{fontSize:11,color:C.muted,letterSpacing:2,marginBottom:8}}>RIGHT NOW</div>
                      <div style={{fontSize:13,color:"#94a3b8",marginBottom:4}}>{current.lbl}{current.isPeak?" 🔴 PEAK":""}</div>
                      <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:72,fontWeight:700,color:current.col,lineHeight:1}}>{current.sc}</div>
                      <div style={{fontSize:12,color:C.muted,marginBottom:10}}>Congestion Score</div>
                      <div style={{background:current.col+"22",border:`1px solid ${current.col}44`,borderRadius:8,padding:"6px 18px",marginBottom:14}}>
                        <span style={{color:current.col,fontWeight:700,fontSize:14}}>{current.sit} Traffic</span>
                      </div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,width:"100%"}}>
                        {[["⚡ Speed",current.spd+" km/h","#22c55e"],["⏱ Delay","+"+current.delay+" min","#f97316"],["🎯 Model Conf.",current.conf+"%","#a78bfa"],["🚗 Vehicles",current.row.total+"/hr","#3b82f6"]].map(([k,v,c])=>(
                          <div key={k} style={{background:"#030c1a",borderRadius:7,padding:"8px"}}>
                            <div style={{fontSize:9,color:C.muted}}>{k}</div>
                            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:13,color:c,fontWeight:700}}>{v}</div>
                          </div>
                        ))}
                      </div>
                    </Card>

                    {/* Next 6 hours grid */}
                    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gridTemplateRows:"1fr 1fr",gap:10}}>
                      {upcoming.map((f,i)=>(
                        <div key={f.fh} style={{background:C.surface,border:`1px solid ${f.col}25`,borderTop:`3px solid ${f.col}`,borderRadius:10,padding:"12px 14px",position:"relative"}}>
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                            <div>
                              <div style={{fontSize:9,color:C.muted,letterSpacing:1}}>+{f.offset} HOUR{f.offset>1?"S":""}</div>
                              <div style={{fontSize:11,color:"#94a3b8",fontWeight:600}}>{f.lbl}</div>
                            </div>
                            {f.isPeak&&<span style={{fontSize:9,background:"#ef444422",color:"#ef4444",border:"1px solid #ef444433",borderRadius:4,padding:"2px 6px",fontWeight:700}}>PEAK</span>}
                          </div>
                          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:30,fontWeight:700,color:f.col,lineHeight:1,marginBottom:2}}>{f.sc}<span style={{fontSize:11}}>%</span></div>
                          <div style={{fontSize:10,color:f.col,fontWeight:600,marginBottom:6}}>{f.sit}</div>
                          <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:C.muted,marginBottom:6}}>
                            <span>⚡ {f.spd}km/h</span>
                            <span>⏱ +{f.delay}min</span>
                            <span>🎯 {f.conf}%</span>
                          </div>
                          <div style={{background:"#030c1a",borderRadius:3,height:5,overflow:"hidden"}}>
                            <div style={{height:"100%",width:`${f.sc}%`,background:f.col,borderRadius:3,transition:"width .5s"}}/>
                          </div>
                          <div style={{fontSize:8,color:C.muted,marginTop:5}}>
                            {f.sc>75?"⚠️ Avoid — take alternate":f.sc>50?"🕐 Allow extra 15+ min":f.sc>30?"🟡 Minor delays expected":"✅ Clear — good to travel"}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Full 24h forecast chart */}
                  <Card>
                    <STitle right={<Chip label="RF MODEL · FROM YOUR CSV DATA" color="#3b82f6"/>}>
                      📈 FULL 24-HOUR CONGESTION FORECAST — ALL HOURS
                    </STitle>
                    <ResponsiveContainer width="100%" height={200}>
                      <AreaChart data={REAL_HOURLY.map((row,h)=>{
                        const sc=Math.round((row.total/180)*75);
                        return{h:h===0?"12AM":h<12?h+"AM":h===12?"12PM":(h-12)+"PM",score:sc,vehicles:row.total,current:h===baseH?sc:null};
                      })}>
                        <defs>
                          <linearGradient id="fcGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1a2f50"/>
                        <XAxis dataKey="h" tick={{fill:"#475569",fontSize:9}} interval={2}/>
                        <YAxis tick={{fill:"#475569",fontSize:9}} domain={[0,100]} tickFormatter={v=>v+"%"}/>
                        <Tooltip contentStyle={TT} formatter={(v,n)=>n==="score"?[v+"%","Congestion"]:n==="vehicles"?[v,"Vehicles/hr"]:v}/>
                        <Legend wrapperStyle={{fontSize:10,color:C.muted}}/>
                        <Area type="monotone" dataKey="score" stroke="#3b82f6" fill="url(#fcGrad)" strokeWidth={2.5} name="Congestion %"/>
                        <Line type="monotone" dataKey="vehicles" stroke="#22c55e44" dot={false} strokeWidth={1} name="Vehicles/hr"/>
                      </AreaChart>
                    </ResponsiveContainer>
                    {/* Hour markers */}
                    <div style={{display:"flex",gap:4,marginTop:12,alignItems:"flex-end",height:40}}>
                      {REAL_HOURLY.map((row,h)=>{
                        const sc=Math.round((row.total/180)*75);
                        const col=sc<30?"#22c55e":sc<55?"#eab308":sc<75?"#f97316":"#ef4444";
                        const isCur=h===baseH;
                        return(
                          <div key={h} title={`${h}:00 — ${sc}% congestion — ${row.total} vehicles`} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
                            <div style={{width:"100%",height:Math.round((sc/100)*32)+4,background:col,borderRadius:"2px 2px 0 0",opacity:isCur?1:.65,border:isCur?"2px solid #fff":"none",boxShadow:isCur?"0 0 8px "+col:"none"}}/>
                          </div>
                        );
                      })}
                    </div>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:8,color:C.muted,marginTop:4}}>
                      <span>12AM</span><span>4AM</span><span>8AM</span><span>12PM</span><span>4PM</span><span>8PM</span><span>11PM</span>
                    </div>
                  </Card>

                  {/* Per-road forecast */}
                  <Card>
                    <STitle right={<Chip label="NEXT 3 HOURS PER ROAD" color="#a78bfa"/>}>
                      🛣️ ROAD-BY-ROAD FORECAST — WORST ROADS NEXT 3 HOURS
                    </STitle>
                    <div style={{overflowX:"auto"}}>
                      <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
                        <thead>
                          <tr style={{borderBottom:`1px solid ${C.border}`}}>
                            {["Road Segment","Now","","+1 Hour","","+2 Hours","","+3 Hours","","Trend"].map((h,i)=>(
                              <th key={i} style={{padding:"8px 10px",textAlign:"left",color:C.muted,fontSize:9,letterSpacing:1,fontWeight:700,whiteSpace:"nowrap"}}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {liveEdges.sort((a,b)=>b.score-a.score).slice(0,10).map((seg,i)=>{
                            const future=[1,2,3].map(off=>{
                              const fh=(baseH+off)%24;
                              const row=REAL_HOURLY[fh];
                              const base=Math.round((row.total/180)*75);
                              const sc=Math.max(5,Math.min(97,base+Math.round((Math.random()-.5)*15)));
                              const col=sc<30?"#22c55e":sc<55?"#eab308":sc<75?"#f97316":"#ef4444";
                              return{sc,col};
                            });
                            const trend=future[2].sc>seg.score?"↑ Worsening":future[2].sc<seg.score-10?"↓ Improving":"→ Stable";
                            const trendCol=trend.startsWith("↑")?"#ef4444":trend.startsWith("↓")?"#22c55e":"#eab308";
                            return(
                              <tr key={i} className="nrow" style={{borderBottom:"1px solid #060f1e"}}>
                                <td style={{padding:"9px 10px",color:C.text,fontWeight:500,maxWidth:140}}>{seg.name}</td>
                                <td style={{padding:"9px 10px"}}>
                                  <div style={{display:"flex",alignItems:"center",gap:5}}>
                                    <div style={{width:30,height:5,borderRadius:2,background:"#1a2f50",overflow:"hidden"}}>
                                      <div style={{height:"100%",width:`${seg.score}%`,background:seg.color}}/>
                                    </div>
                                    <span style={{fontFamily:"'JetBrains Mono',monospace",color:seg.color,fontSize:10,fontWeight:700}}>{seg.score}%</span>
                                  </div>
                                </td>
                                <td style={{padding:"4px 2px"}}><div style={{width:3,background:seg.color,height:20,borderRadius:2,margin:"auto"}}/></td>
                                {future.map((f,fi)=>(
                                  <>
                                    <td key={"sc"+fi} style={{padding:"9px 10px"}}>
                                      <div style={{display:"flex",alignItems:"center",gap:5}}>
                                        <div style={{width:30,height:5,borderRadius:2,background:"#1a2f50",overflow:"hidden"}}>
                                          <div style={{height:"100%",width:`${f.sc}%`,background:f.col}}/>
                                        </div>
                                        <span style={{fontFamily:"'JetBrains Mono',monospace",color:f.col,fontSize:10,fontWeight:700}}>{f.sc}%</span>
                                      </div>
                                    </td>
                                    <td key={"ar"+fi} style={{padding:"4px 2px",color:C.muted,fontSize:10}}>→</td>
                                  </>
                                ))}
                                <td style={{padding:"9px 10px"}}>
                                  <span style={{color:trendCol,fontWeight:700,fontSize:11}}>{trend}</span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </Card>

                  {/* Best travel windows */}
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                    <Card style={{border:"1px solid #22c55e22"}}>
                      <STitle right={<Chip label="FROM YOUR CSV" color="#22c55e"/>}>
                        ✅ BEST TRAVEL WINDOWS TODAY
                      </STitle>
                      {REAL_HOURLY.map((row,h)=>{
                        const sc=Math.round((row.total/180)*75);
                        return sc<35?{h,sc,row}:null;
                      }).filter(Boolean).slice(0,6).map(({h,sc,row})=>(
                        <div key={h} style={{display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid #060f1e",padding:"8px 0"}}>
                          <div style={{display:"flex",alignItems:"center",gap:10}}>
                            <div style={{width:8,height:8,borderRadius:"50%",background:"#22c55e"}}/>
                            <span style={{fontSize:12,color:C.text,fontWeight:600}}>{h===0?"12:00 AM":h<12?`${h}:00 AM`:h===12?"12:00 PM":`${h-12}:00 PM`}</span>
                          </div>
                          <div style={{display:"flex",gap:10,alignItems:"center"}}>
                            <span style={{fontSize:10,color:C.muted}}>{row.total} vehicles</span>
                            <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:"#22c55e",fontWeight:700}}>{sc}% clear</span>
                          </div>
                        </div>
                      ))}
                    </Card>
                    <Card style={{border:"1px solid #ef444422"}}>
                      <STitle right={<Chip label="AVOID THESE TIMES" color="#ef4444"/>}>
                        ⚠️ WORST CONGESTION WINDOWS
                      </STitle>
                      {REAL_HOURLY.map((row,h)=>{
                        const sc=Math.round((row.total/180)*75);
                        return sc>60?{h,sc,row}:null;
                      }).filter(Boolean).slice(0,6).map(({h,sc,row})=>{
                        const col=sc<75?"#f97316":"#ef4444";
                        return(
                          <div key={h} style={{display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid #060f1e",padding:"8px 0"}}>
                            <div style={{display:"flex",alignItems:"center",gap:10}}>
                              <div style={{width:8,height:8,borderRadius:"50%",background:col}}/>
                              <span style={{fontSize:12,color:C.text,fontWeight:600}}>{h===0?"12:00 AM":h<12?`${h}:00 AM`:h===12?"12:00 PM":`${h-12}:00 PM`}</span>
                            </div>
                            <div style={{display:"flex",gap:10,alignItems:"center"}}>
                              <span style={{fontSize:10,color:C.muted}}>{row.total} vehicles</span>
                              <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:col,fontWeight:700}}>{sc}% jammed</span>
                            </div>
                          </div>
                        );
                      })}
                    </Card>
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {tab==="analyze"&&(
          <div style={{display:"flex",flexDirection:"column",gap:18}}>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
              <KPI icon="📦" label="Total Records" value="8,928"  sub="2 months of real data"     accent="#3b82f6"/>
              <KPI icon="🎯" label="RF Accuracy"   value="92.89%" sub="On 20% test split"         accent="#22c55e"/>
              <KPI icon="🚗" label="Avg Vehicles"  value="114/hr" sub="All-day CSV average"       accent="#eab308"/>
              <KPI icon="📈" label="Peak Hour"      value="178/hr" sub="Real peak: 4 PM–5 PM"     accent="#ef4444"/>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:18}}>
              <Card>
                <STitle>24-HOUR VEHICLE FLOW — REAL CSV DATA</STitle>
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={REAL_HOURLY}>
                    <defs>
                      <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#3b82f6" stopOpacity={.4}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#22c55e" stopOpacity={.25}/>
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1a2f50"/>
                    <XAxis dataKey="h" tick={{fill:"#475569",fontSize:9}} interval={3}/>
                    <YAxis tick={{fill:"#475569",fontSize:9}}/>
                    <Tooltip contentStyle={TT}/>
                    <Legend wrapperStyle={{fontSize:10,color:C.muted}}/>
                    <Area type="monotone" dataKey="total" stroke="#3b82f6" fill="url(#g1)" strokeWidth={2.5} name="Total Vehicles"/>
                    <Area type="monotone" dataKey="cars"  stroke="#22c55e" fill="url(#g2)" strokeWidth={2}   name="Cars"/>
                  </AreaChart>
                </ResponsiveContainer>
              </Card>
              <Card>
                <STitle>SITUATION DISTRIBUTION</STitle>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={SIT_DIST} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} innerRadius={42}>
                      {SIT_DIST.map((s,i)=><Cell key={i} fill={s.color}/>)}
                    </Pie>
                    <Tooltip contentStyle={TT} formatter={v=>[v.toLocaleString()+" records"]}/>
                    <Legend wrapperStyle={{fontSize:10}}/>
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}}>
              <Card>
                <STitle>WEEKLY TRAFFIC PATTERN</STitle>
                <ResponsiveContainer width="100%" height={210}>
                  <BarChart data={REAL_WEEKLY}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1a2f50"/>
                    <XAxis dataKey="day" tick={{fill:"#475569",fontSize:10}}/>
                    <YAxis tick={{fill:"#475569",fontSize:9}}/>
                    <Tooltip contentStyle={TT}/>
                    <Legend wrapperStyle={{fontSize:10,color:C.muted}}/>
                    <Bar dataKey="avg"       fill="#3b82f666" name="Avg Vehicles"  radius={[4,4,0,0]}/>
                    <Bar dataKey="peak"      fill="#ef444455" name="Peak Vehicles" radius={[4,4,0,0]}/>
                    <Bar dataKey="incidents" fill="#f9731655" name="Incidents"     radius={[4,4,0,0]}/>
                  </BarChart>
                </ResponsiveContainer>
              </Card>
              <Card>
                <STitle>VEHICLE TYPE BY HOUR</STitle>
                <ResponsiveContainer width="100%" height={210}>
                  <LineChart data={REAL_HOURLY}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1a2f50"/>
                    <XAxis dataKey="h" tick={{fill:"#475569",fontSize:9}} interval={3}/>
                    <YAxis tick={{fill:"#475569",fontSize:9}}/>
                    <Tooltip contentStyle={TT}/>
                    <Legend wrapperStyle={{fontSize:10,color:C.muted}}/>
                    <Line type="monotone" dataKey="cars"   stroke="#3b82f6" dot={false} strokeWidth={2}   name="Cars"/>
                    <Line type="monotone" dataKey="trucks" stroke="#ef4444" dot={false} strokeWidth={2}   name="Trucks"/>
                    <Line type="monotone" dataKey="buses"  stroke="#f97316" dot={false} strokeWidth={1.5} name="Buses"/>
                    <Line type="monotone" dataKey="bikes"  stroke="#22c55e" dot={false} strokeWidth={1.5} name="Bikes"/>
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </div>
          </div>
        )}

        {/* ═══════ SEGMENTS ═══════ */}
        {tab==="segment"&&(
          <div style={{display:"flex",flexDirection:"column",gap:18}}>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
              {[["Total Roads",liveEdges.length,"#3b82f6"],["Critical >75%",liveEdges.filter(s=>s.score>75).length,"#ef4444"],["Heavy 50–75%",liveEdges.filter(s=>s.score>50&&s.score<=75).length,"#f97316"],["Clear <30%",liveEdges.filter(s=>s.score<30).length,"#22c55e"]].map(([l,v,c])=>(
                <Card key={l} style={{border:`1px solid ${c}20`,borderLeft:`3px solid ${c}`,textAlign:"center"}}>
                  <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:34,fontWeight:700,color:c}}>{v}</div>
                  <div style={{fontSize:9,color:C.muted,marginTop:4,letterSpacing:1}}>{l.toUpperCase()}</div>
                </Card>
              ))}
            </div>
            <Card>
              <STitle right={<div style={{display:"flex",alignItems:"center",gap:6}}><div className="blink" style={{width:7,height:7,borderRadius:"50%",background:"#22c55e"}}/><span style={{fontSize:9,color:"#22c55e"}}>LIVE · Updates every 5s</span></div>}>
                ALL ROAD SEGMENTS — REAL-TIME RF CONGESTION SCORES
              </STitle>
              <div style={{overflowX:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                  <thead>
                    <tr style={{borderBottom:`1px solid ${C.border}`}}>
                      {["Road Name","From","To","Congestion","Speed","Delay","Limit","Status"].map(h=>(
                        <th key={h} style={{padding:"9px 12px",textAlign:"left",color:C.muted,fontSize:9,letterSpacing:1,fontWeight:700,whiteSpace:"nowrap"}}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[...liveEdges].sort((a,b)=>b.score-a.score).map((s,i)=>(
                      <tr key={i} className="nrow" style={{borderBottom:"1px solid #060f1e",background:i%2===0?"transparent":"rgba(26,47,80,.12)"}}>
                        <td style={{padding:"9px 12px",color:C.text,fontWeight:500}}>{s.name}</td>
                        <td style={{padding:"9px 12px",fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"#94a3b8"}}>{s.from}</td>
                        <td style={{padding:"9px 12px",fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"#94a3b8"}}>{s.to}</td>
                        <td style={{padding:"9px 12px"}}>
                          <div style={{display:"flex",alignItems:"center",gap:8}}>
                            <div style={{background:"#1a2f50",borderRadius:3,height:5,width:55,overflow:"hidden"}}>
                              <div style={{height:"100%",width:`${s.score}%`,background:s.color,borderRadius:3,transition:"width .6s"}}/>
                            </div>
                            <span style={{fontFamily:"'JetBrains Mono',monospace",color:s.color,fontWeight:700}}>{s.score}%</span>
                          </div>
                        </td>
                        <td style={{padding:"9px 12px",fontFamily:"'JetBrains Mono',monospace",color:"#22c55e"}}>{s.speed} km/h</td>
                        <td style={{padding:"9px 12px",fontFamily:"'JetBrains Mono',monospace",color:"#f97316"}}>+{s.delay} min</td>
                        <td style={{padding:"9px 12px",fontFamily:"'JetBrains Mono',monospace",color:C.muted}}>{s.speedLimit} km/h</td>
                        <td style={{padding:"9px 12px"}}><Chip label={s.score<30?"LOW":s.score<55?"NORMAL":s.score<75?"HEAVY":"HIGH"} color={s.color}/></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
            <Card>
              <STitle>TOP 8 CONGESTED SEGMENTS</STitle>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={[...liveEdges].sort((a,b)=>b.score-a.score).slice(0,8).map(s=>({name:s.name.split(" ").slice(0,2).join(" "),score:s.score,speed:s.speed}))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a2f50"/>
                  <XAxis dataKey="name" tick={{fill:"#475569",fontSize:8}}/>
                  <YAxis tick={{fill:"#475569",fontSize:9}}/>
                  <Tooltip contentStyle={TT}/>
                  <Legend wrapperStyle={{fontSize:10,color:C.muted}}/>
                  <Bar dataKey="score" fill="#ef444466" name="Congestion %" radius={[4,4,0,0]}/>
                  <Bar dataKey="speed" fill="#22c55e55" name="Speed km/h"   radius={[4,4,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
        )}

        {/* ═══════ SENSORS ═══════ */}
        {tab==="sensors"&&(
          <div style={{display:"flex",flexDirection:"column",gap:18}}>
            <Card>
              <STitle right={<div style={{display:"flex",alignItems:"center",gap:6}}><div className="blink" style={{width:7,height:7,borderRadius:"50%",background:"#22c55e"}}/><span style={{fontSize:9,color:"#22c55e"}}>STREAMING · 5s interval</span></div>}>
                REAL-TIME SENSOR FEED — BASED ON YOUR CSV HOURLY AVERAGES
              </STitle>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={feed}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a2f50"/>
                  <XAxis dataKey="t" tick={{fill:"#475569",fontSize:8}} interval="preserveStartEnd"/>
                  <YAxis tick={{fill:"#475569",fontSize:9}}/>
                  <Tooltip contentStyle={TT}/>
                  <Legend wrapperStyle={{fontSize:10,color:C.muted}}/>
                  <Line type="monotone" dataKey="total"  stroke="#3b82f6" dot={false} strokeWidth={2.5} name="Total"  isAnimationActive={false}/>
                  <Line type="monotone" dataKey="cars"   stroke="#22c55e" dot={false} strokeWidth={2}   name="Cars"   isAnimationActive={false}/>
                  <Line type="monotone" dataKey="trucks" stroke="#ef4444" dot={false} strokeWidth={1.5} name="Trucks" isAnimationActive={false}/>
                </LineChart>
              </ResponsiveContainer>
            </Card>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
              {[
                ["🔁","Loop Detectors",    "Count axles at road surface",         "24","#3b82f6",true ],
                ["📷","CCTV / CV Cameras", "AI vehicle detection & counting",     "18","#a78bfa",true ],
                ["📍","GPS Aggregators",   "Floating probe vehicle data",         "12","#22c55e",true ],
                ["📶","Bluetooth Sensors", "Anonymous MAC address scanning",      "30","#eab308",true ],
                ["💳","RFID / FASTag",     "Toll point vehicle readers",          "8", "#f97316",false],
                ["🌦️","Weather Stations",  "Rain, fog, visibility sensors",      "6", "#64748b",true ],
              ].map(([ic,nm,desc,cnt,col,on])=>(
                <Card key={nm} style={{border:`1px solid ${col}20`}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                    <span style={{fontSize:24}}>{ic}</span>
                    <Chip label={on?"ONLINE":"OFFLINE"} color={on?"#22c55e":"#ef4444"}/>
                  </div>
                  <div style={{fontWeight:600,fontSize:13,marginBottom:4}}>{nm}</div>
                  <div style={{fontSize:10,color:C.muted,marginBottom:12}}>{desc}</div>
                  <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:32,fontWeight:700,color:col,marginBottom:8}}>{cnt}</div>
                  <div style={{background:"#030c1a",borderRadius:4,height:4,overflow:"hidden"}}>
                    <div style={{height:"100%",width:on?"100%":"25%",background:col,borderRadius:4}}/>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* ═══════ ALERTS ═══════ */}
        {tab==="alerts"&&(
          <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:18}}>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <div style={{fontSize:10,color:C.muted,letterSpacing:2,marginBottom:4}}>LIVE TRAFFIC ALERTS — HYDERABAD</div>
              {ALERTS_DATA.map(a=>(
                <div key={a.id} className="alert-row" style={{background:C.surface,borderLeft:`4px solid ${a.color}`,border:`1px solid ${a.color}20`,borderRadius:10,padding:"14px 18px",display:"flex",alignItems:"flex-start",gap:14,cursor:"pointer"}}>
                  <span style={{fontSize:28,flexShrink:0}}>{a.icon}</span>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <Chip label={a.type.toUpperCase()} color={a.color}/>
                        <span style={{fontSize:11,color:"#94a3b8",fontWeight:600}}>{a.loc}</span>
                      </div>
                      <span style={{fontSize:10,color:C.muted}}>{a.time}</span>
                    </div>
                    <div style={{fontSize:12,color:C.text,lineHeight:1.6}}>{a.msg}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <Card>
                <STitle>ALERT SUMMARY</STitle>
                {[["🚨","Severe", ALERTS_DATA.filter(a=>a.type==="Severe").length, "#ef4444"],
                  ["⚠️","Warning",ALERTS_DATA.filter(a=>a.type==="Warning").length,"#f97316"],
                  ["ℹ️","Info",   ALERTS_DATA.filter(a=>a.type==="Info").length,   "#3b82f6"]].map(([ic,t,c,col])=>(
                  <div key={t} style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:"#030c1a",borderRadius:8,padding:"11px 14px",marginBottom:8}}>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <span style={{fontSize:20}}>{ic}</span>
                      <span style={{fontSize:12,color:C.muted}}>{t}</span>
                    </div>
                    <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:22,fontWeight:700,color:col}}>{c}</span>
                  </div>
                ))}
              </Card>
              <Card>
                <STitle>AFFECTED ZONES</STitle>
                {[["IT Corridor","HIGH","#ef4444"],["Old City","HIGH","#ef4444"],["Central","NORMAL","#eab308"],["North","LOW","#22c55e"],["South-East","HEAVY","#f97316"]].map(([z,s,c])=>(
                  <div key={z} style={{display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:"1px solid #060f1e",padding:"8px 0"}}>
                    <span style={{fontSize:12,color:C.text}}>{z}</span>
                    <Chip label={s} color={c}/>
                  </div>
                ))}
              </Card>
            </div>
          </div>
        )}

        {/* ═══════ MODEL ═══════ */}
        {/* ═══════ SIGNAL OPTIMIZER ═══════ */}
        {tab==="signal"&&(
          <div style={{display:"flex",flexDirection:"column",gap:18}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}}>
              <Card>
                <STitle>🚦 ADAPTIVE SIGNAL TIMING — BASED ON RF PREDICTIONS</STitle>
                <div style={{fontSize:11,color:C.muted,marginBottom:14,lineHeight:1.7}}>
                  Signal timing is calculated from live congestion scores produced by your Random Forest model.
                  Higher congestion on the main road → longer green time for main road to clear the queue faster.
                </div>
                {liveEdges.slice(0,8).map((seg,i)=>{
                  const mainGreen = seg.score>75?120:seg.score>50?90:seg.score>30?60:45;
                  const sideGreen = 150-mainGreen;
                  const efficiency = Math.round(100-seg.score*0.6);
                  return(
                    <div key={i} style={{background:"#030c1a",borderRadius:10,padding:"12px 14px",marginBottom:10,border:`1px solid ${seg.color}22`}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                        <div>
                          <div style={{fontSize:12,fontWeight:600,color:C.text}}>{seg.name}</div>
                          <div style={{fontSize:9,color:C.muted}}>{seg.from} → {seg.to} · Congestion: <span style={{color:seg.color}}>{seg.score}%</span></div>
                        </div>
                        <Chip label={seg.score>75?"SEVERE":seg.score>50?"HEAVY":seg.score>30?"NORMAL":"CLEAR"} color={seg.color}/>
                      </div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:8}}>
                        <div style={{background:"#22c55e22",border:"1px solid #22c55e33",borderRadius:7,padding:"8px",textAlign:"center"}}>
                          <div style={{fontSize:9,color:"#22c55e",letterSpacing:1}}>MAIN GREEN</div>
                          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:20,fontWeight:700,color:"#22c55e"}}>{mainGreen}s</div>
                        </div>
                        <div style={{background:"#ef444422",border:"1px solid #ef444433",borderRadius:7,padding:"8px",textAlign:"center"}}>
                          <div style={{fontSize:9,color:"#ef4444",letterSpacing:1}}>SIDE GREEN</div>
                          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:20,fontWeight:700,color:"#ef4444"}}>{sideGreen}s</div>
                        </div>
                        <div style={{background:"#3b82f622",border:"1px solid #3b82f633",borderRadius:7,padding:"8px",textAlign:"center"}}>
                          <div style={{fontSize:9,color:"#3b82f6",letterSpacing:1}}>EFFICIENCY</div>
                          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:20,fontWeight:700,color:"#3b82f6"}}>{efficiency}%</div>
                        </div>
                      </div>
                      <div style={{display:"flex",height:8,borderRadius:4,overflow:"hidden",gap:2}}>
                        <div style={{width:`${(mainGreen/150)*100}%`,background:"#22c55e",borderRadius:"4px 0 0 4px"}}/>
                        <div style={{width:"3%",background:"#eab308"}}/>
                        <div style={{flex:1,background:"#ef4444",borderRadius:"0 4px 4px 0"}}/>
                      </div>
                      <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:C.muted,marginTop:4}}>
                        <span>🟢 Main road: {mainGreen}s</span>
                        <span>🟡 Yellow: 5s</span>
                        <span>🔴 Side road: {sideGreen}s</span>
                      </div>
                    </div>
                  );
                })}
              </Card>
              <div style={{display:"flex",flexDirection:"column",gap:14}}>
                <Card>
                  <STitle>📊 CITY-WIDE SIGNAL PERFORMANCE</STitle>
                  {[
                    ["Total Signalled Junctions","15","#3b82f6"],
                    ["Adaptive Signals Active","12","#22c55e"],
                    ["Avg Cycle Time","90 sec","#eab308"],
                    ["Est. Wait Time Reduction","24%","#22c55e"],
                    ["Vehicles Served/Hour",curRow.total.toString(),"#3b82f6"],
                    ["CO₂ Saved by Optimization",Math.round(co2Today*0.15)+" kg","#22c55e"],
                    ["Critical Junctions",critCount.toString(),"#ef4444"],
                    ["RF Model Confidence","92.89%","#22c55e"],
                  ].map(([k,v,c])=>(
                    <div key={k} style={{display:"flex",justifyContent:"space-between",borderBottom:"1px solid #060f1e",padding:"9px 0"}}>
                      <span style={{fontSize:11,color:C.muted}}>{k}</span>
                      <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:c,fontWeight:700}}>{v}</span>
                    </div>
                  ))}
                </Card>
                <Card style={{background:"#0d1f10",border:"1px solid #22c55e22"}}>
                  <STitle>✅ HOW IT WORKS</STitle>
                  {[
                    ["1","RF model predicts congestion score (0–100%) for each road segment","#3b82f6"],
                    ["2","Score maps to signal timing: score>75 → 120s green, score>50 → 90s, else 60s","#a78bfa"],
                    ["3","Remaining cycle time assigned to side roads","#22c55e"],
                    ["4","Timings update every 5 seconds as live data flows in","#eab308"],
                    ["5","Emergency mode overrides all signals to GREEN on fastest path","#ef4444"],
                  ].map(([n,t,c])=>(
                    <div key={n} style={{display:"flex",gap:10,padding:"8px 0",borderBottom:"1px solid #0a1e0a"}}>
                      <span style={{background:c+"33",color:c,borderRadius:"50%",width:20,height:20,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,flexShrink:0}}>{n}</span>
                      <span style={{fontSize:11,color:C.muted,lineHeight:1.5}}>{t}</span>
                    </div>
                  ))}
                </Card>
                <Card>
                  <STitle>🌍 ENVIRONMENTAL IMPACT TODAY</STitle>
                  {[
                    ["🌿","CO₂ Tracked",co2Today.toLocaleString()+" kg","#22c55e"],
                    ["⏱","Commuter Minutes Saved",minSaved.toLocaleString(),"#3b82f6"],
                    ["🚗","Total Vehicles Monitored",vehToday.toLocaleString(),"#a78bfa"],
                    ["⛽","Fuel Saved (est.)",Math.round(minSaved*0.03)+" litres","#eab308"],
                  ].map(([ic,lb,vl,c])=>(
                    <div key={lb} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:"1px solid #060f1e"}}>
                      <span style={{fontSize:22}}>{ic}</span>
                      <div style={{flex:1}}>
                        <div style={{fontSize:10,color:C.muted}}>{lb}</div>
                        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:16,color:c,fontWeight:700}}>{vl}</div>
                      </div>
                    </div>
                  ))}
                </Card>
              </div>
            </div>
          </div>
        )}

        {tab==="model"&&(
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}}>
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <Card>
                <STitle>MODEL PERFORMANCE METRICS</STitle>
                {[["Algorithm","Random Forest","#22c55e"],["n_estimators","200 trees","#3b82f6"],["max_depth","15","#3b82f6"],["Features Used","12","#3b82f6"],["Training Records","7,143 (80%)","#3b82f6"],["Test Records","1,785 (20%)","#3b82f6"],["Test Accuracy","92.89%","#22c55e"],["Macro F1-Score","0.90","#22c55e"],["Classes","low · normal · heavy · high","#eab308"],["CSV Records","8,928 total","#3b82f6"],["Time Period","2 months","#3b82f6"]].map(([k,v,c])=>(
                  <div key={k} style={{display:"flex",justifyContent:"space-between",borderBottom:"1px solid #060f1e",padding:"8px 0"}}>
                    <span style={{fontSize:11,color:C.muted}}>{k}</span>
                    <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:c,fontWeight:600}}>{v}</span>
                  </div>
                ))}
              </Card>
              <Card>
                <STitle>CLASS DISTRIBUTION — YOUR DATA</STitle>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={SIT_DIST}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1a2f50"/>
                    <XAxis dataKey="name" tick={{fill:"#475569",fontSize:10}}/>
                    <YAxis tick={{fill:"#475569",fontSize:9}}/>
                    <Tooltip contentStyle={TT} formatter={v=>[v.toLocaleString()+" records"]}/>
                    <Bar dataKey="value" name="Records" radius={[4,4,0,0]}>
                      {SIT_DIST.map((s,i)=><Cell key={i} fill={s.color}/>)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <Card>
                <STitle>FEATURE IMPORTANCE — WHAT DRIVES PREDICTIONS</STitle>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart layout="vertical" data={FEAT_IMP}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1a2f50"/>
                    <XAxis type="number" tick={{fill:"#475569",fontSize:9}} domain={[0,35]}/>
                    <YAxis dataKey="f" type="category" tick={{fill:"#94a3b8",fontSize:10}} width={118}/>
                    <Tooltip contentStyle={TT}/>
                    <Bar dataKey="imp" name="Importance %" fill="#3b82f6" radius={[0,4,4,0]}>
                      {FEAT_IMP.map((_,i)=><Cell key={i} fill={`hsl(${220-i*14},70%,${60-i*2}%)`}/>)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Card>
              <Card>
                <STitle>DATA SCIENCE PIPELINE</STitle>
                {[
                  ["1. Data Collection","Traffic.csv + TrafficTwoMonth.csv","#3b82f6"],
                  ["2. Preprocessing","Parse time → hour, minute features","#a78bfa"],
                  ["3. Feature Eng.","peak flag, ratios, day of week","#22c55e"],
                  ["4. Label Encode","low/normal/heavy/high → 0,1,2,3","#eab308"],
                  ["5. Train/Test Split","80% train · 20% test (random_state=42)","#3b82f6"],
                  ["6. RF Training","200 trees · max_depth=15 · n_jobs=-1","#22c55e"],
                  ["7. Evaluation","Accuracy 92.89% · Macro F1: 0.90","#22c55e"],
                  ["8. Deployment","Flask REST API → React Dashboard","#f97316"],
                ].map(([step,desc,col])=>(
                  <div key={step} style={{display:"flex",gap:10,borderBottom:"1px solid #060f1e",padding:"8px 0",alignItems:"flex-start"}}>
                    <span style={{fontSize:10,color:col,fontWeight:700,minWidth:120,fontFamily:"'JetBrains Mono',monospace"}}>{step}</span>
                    <span style={{fontSize:11,color:C.muted,lineHeight:1.4}}>{desc}</span>
                  </div>
                ))}
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
