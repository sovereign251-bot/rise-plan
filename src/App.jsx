import React, { useState, useEffect } from "react";


const C = {
  rose:"#C49794",roseDark:"#a07370",blush:"#F2CFCC",
  cream:"#FFEFED",pale:"#F9F8F8",accent1:"#EBDFDD",
  accent2:"#D4BBB7",charcoal:"#494747",white:"#fff",
  gold:"#C9A84C",
};

// ── STYLES ────────────────────────────────────────────────────────────────────
const btn = (variant="fill",sm=false) => ({
  background: variant==="fill" ? C.rose : "transparent",
  color: variant==="fill" ? C.white : C.rose,
  border: variant==="fill" ? "none" : `1.5px solid ${C.rose}`,
  borderRadius: sm ? 6 : 8,
  padding: sm ? "5px 14px" : "11px 24px",
  cursor:"pointer", fontSize: sm ? 12 : 14,
  fontFamily:"Georgia,serif", letterSpacing:"0.02em",
  transition:"opacity 0.15s",
});
const inp = { width:"100%", padding:"10px 12px", border:`1px solid ${C.blush}`, borderRadius:8, fontSize:14, fontFamily:"Georgia,serif", background:C.white, boxSizing:"border-box", color:C.charcoal, outline:"none" };
const ta = { ...inp, resize:"vertical", minHeight:80 };
const lbl = { fontSize:11, color:C.roseDark, fontWeight:600, letterSpacing:"0.1em", textTransform:"uppercase", display:"block", marginBottom:5 };
const card = { background:C.white, borderRadius:16, border:`1px solid ${C.blush}`, padding:"1.5rem", marginBottom:"1rem" };
const aiBox = { background:C.cream, border:`1px solid ${C.blush}`, borderLeft:`3px solid ${C.rose}`, borderRadius:12, padding:"1.25rem 1.5rem", fontSize:14, lineHeight:1.8, color:C.charcoal, whiteSpace:"pre-wrap", marginTop:"1rem" };

const chip = (active) => ({
  display:"inline-block", padding:"6px 16px", borderRadius:20,
  border:`1px solid ${active ? C.rose : C.blush}`,
  background: active ? C.blush : C.white,
  color: active ? C.roseDark : C.charcoal,
  cursor:"pointer", fontSize:13, margin:"3px 4px 3px 0",
  fontFamily:"Georgia,serif", transition:"all 0.15s",
});

function Spinner() {
  return (
    <div style={{display:"flex",alignItems:"center",gap:8,color:C.rose,fontSize:13,margin:"1rem 0"}}>
      <div style={{width:14,height:14,border:`2px solid ${C.blush}`,borderTop:`2px solid ${C.rose}`,borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>
      Generating your personalized response...
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
function F({label,children,hint}){
  return(
    <div style={{marginBottom:"1.1rem"}}>
      <label style={lbl}>{label}</label>
      {hint && <p style={{fontSize:12,color:"#aaa",margin:"-3px 0 6px",fontStyle:"italic"}}>{hint}</p>}
      {children}
    </div>
  );
}
function Chips({options,selected,onToggle,multi=false}){
  return <div style={{marginTop:4}}>{options.map(o=><span key={o} style={chip(multi?(selected||[]).includes(o):selected===o)} onClick={()=>onToggle(o)}>{o}</span>)}</div>;
}
function Sec({title,sub,children}){
  return(
    <div style={{marginBottom:"1.75rem"}}>
      <div style={{fontSize:13,fontWeight:600,color:C.rose,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:sub?2:10}}>{title}</div>
      {sub && <p style={{fontSize:12,color:"#aaa",margin:"0 0 10px",fontStyle:"italic"}}>{sub}</p>}
      {children}
    </div>
  );
}

async function callClaude(sys,prompt){
  try{
    const res=await fetch("/api/claude",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({model:"claude-sonnet-4-6",max_tokens:1000,system:sys,messages:[{role:"user",content:prompt}]}),
    });
    const d=await res.json();
    return d.content?.map(b=>b.text||"").join("")||"Something went wrong. Please try again.";
  }catch{return"Error connecting to AI. Please try again.";}
}

// ── ILLUSTRATED HERO BANNERS ──────────────────────────────────────────────────
function HeroBanner({title,sub,icon,gradient}){
  const bg = gradient || `linear-gradient(135deg,${C.blush} 0%,${C.cream} 60%,${C.accent1} 100%)`;
  return(
    <div style={{background:bg,borderRadius:16,padding:"1.75rem 2rem",marginBottom:"1.25rem",position:"relative",overflow:"hidden",border:`1px solid ${C.blush}`}}>
      <div style={{position:"absolute",right:24,top:"50%",transform:"translateY(-50%)",fontSize:64,opacity:0.18,userSelect:"none"}}>{icon}</div>
      <div style={{position:"absolute",right:80,top:12,fontSize:18,color:C.gold,opacity:0.5}}>✦</div>
      <div style={{position:"absolute",right:40,bottom:10,fontSize:12,color:C.gold,opacity:0.4}}>✦</div>
      <div style={{position:"absolute",left:"40%",top:8,fontSize:10,color:C.gold,opacity:0.3}}>✦</div>
      <p style={{fontSize:11,color:C.roseDark,letterSpacing:"0.2em",textTransform:"uppercase",margin:"0 0 6px",fontStyle:"italic"}}>my signature</p>
      <h2 style={{fontSize:22,color:C.charcoal,fontWeight:400,margin:"0 0 6px",fontFamily:"Georgia,serif"}}>{title}</h2>
      <p style={{fontSize:13,color:"#888",margin:0,lineHeight:1.5,maxWidth:400}}>{sub}</p>
    </div>
  );
}

// ── TOOL CARD GRID ────────────────────────────────────────────────────────────
function ToolGrid({tools,active,onSelect}){
  return(
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:"1.5rem"}}>
      {tools.map(t=>(
        <div key={t.id} onClick={()=>onSelect(t.id)} style={{
          padding:"1rem 1.25rem",borderRadius:12,cursor:"pointer",
          border:`1.5px solid ${active===t.id?C.rose:C.blush}`,
          background:active===t.id?C.cream:C.white,
          transition:"all 0.15s",
        }}>
          <div style={{fontSize:20,marginBottom:6}}>{t.icon}</div>
          <div style={{fontWeight:600,fontSize:13,color:C.charcoal,marginBottom:3}}>{t.name}</div>
          <div style={{fontSize:12,color:"#aaa",lineHeight:1.4}}>{t.desc}</div>
        </div>
      ))}
    </div>
  );
}

// ── LOGIN ─────────────────────────────────────────────────────────────────────
function LoginScreen({onLogin}){
  const[mode,setMode]=useState("login");
  const[email,setEmail]=useState("");const[pw,setPw]=useState("");const[name,setName]=useState("");const[err,setErr]=useState("");
  function submit(){
    setErr("");
    if(!email||!pw)return setErr("Please enter your email and password.");
    const k=`rise_auth_${email.toLowerCase()}`;
    if(mode==="signup"){
      if(!name)return setErr("Please enter your name.");
      if(localStorage.getItem(k))return setErr("Account already exists. Please log in.");
      const u={name,email:email.toLowerCase(),password:pw};
      localStorage.setItem(k,JSON.stringify(u));localStorage.setItem("rise_current_user",email.toLowerCase());onLogin(u);
    }else{
      const stored=localStorage.getItem(k);
      if(!stored)return setErr("No account found. Please sign up.");
      const u=JSON.parse(stored);
      if(u.password!==pw)return setErr("Incorrect password.");
      localStorage.setItem("rise_current_user",email.toLowerCase());onLogin(u);
    }
  }
  return(
    <div style={{minHeight:"100vh",background:`linear-gradient(135deg,${C.cream} 0%,${C.blush} 50%,${C.accent1} 100%)`,display:"flex",alignItems:"center",justifyContent:"center",padding:"2rem"}}>
      <div style={{width:"100%",maxWidth:420}}>
        <div style={{textAlign:"center",marginBottom:"2rem"}}>
          <div style={{fontSize:13,letterSpacing:"0.3em",color:C.rose,marginBottom:6,fontFamily:"Georgia,serif",fontStyle:"italic"}}>my signature</div>
          <div style={{fontSize:64,fontFamily:"Georgia,serif",color:C.rose,letterSpacing:"0.18em",lineHeight:1}}>RISE</div>
          <div style={{fontSize:13,letterSpacing:"0.25em",color:C.charcoal,marginTop:6,fontFamily:"Georgia,serif"}}>PLAN</div>
          <div style={{display:"flex",justifyContent:"center",gap:20,marginTop:14}}>
            {["Reclaim","Install","Sustain","Expand"].map(p=>(
              <div key={p} style={{fontSize:11,color:C.roseDark,letterSpacing:"0.06em",textAlign:"center"}}>
                <div style={{width:28,height:28,borderRadius:"50%",background:C.blush,margin:"0 auto 4px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,color:C.rose}}>{p[0]}</div>
                {p}
              </div>
            ))}
          </div>
        </div>
        <div style={{...card,boxShadow:"0 8px 32px rgba(196,151,148,0.15)"}}>
          <div style={{display:"flex",gap:8,marginBottom:"1.5rem"}}>
            {["login","signup"].map(m=><button key={m} style={m===mode?btn("fill"):btn("out")} onClick={()=>setMode(m)}>{m==="login"?"Log in":"Sign up"}</button>)}
          </div>
          {mode==="signup"&&<F label="Your name"><input style={inp} value={name} onChange={e=>setName(e.target.value)} placeholder="First name"/></F>}
          <F label="Email"><input style={inp} type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@email.com"/></F>
          <F label="Password"><input style={inp} type="password" value={pw} onChange={e=>setPw(e.target.value)} placeholder="Password" onKeyDown={e=>e.key==="Enter"&&submit()}/></F>
          {err&&<p style={{color:"#c0392b",fontSize:13,margin:"0 0 10px"}}>{err}</p>}
          <button style={{...btn("fill"),width:"100%",marginTop:8,padding:"13px"}} onClick={submit}>{mode==="login"?"Enter my dashboard →":"Create my account →"}</button>
        </div>
      </div>
    </div>
  );
}

// ── HOME ──────────────────────────────────────────────────────────────────────
function HomeTab({user,data,setNav,saved}){
  const phases=[
    {id:"reclaim",letter:"R",name:"Reclaim",icon:"🌸",desc:"Separate who you had to become from who you are choosing to become.",check:data.reclaimResult},
    {id:"install",letter:"I",name:"Install",icon:"⚡",desc:"Face your full financial picture and build your product plan.",check:data.installResult},
    {id:"sustain",letter:"S",name:"Sustain",icon:"✨",desc:"Build habits, content, and brand for lasting stability.",check:data.sustainResult},
    {id:"expand",letter:"E",name:"Expand",icon:"🌿",desc:"With stability beneath you, build the life fully yours.",check:data.expandResult},
  ];
  const done=phases.filter(p=>p.check).length;
  const pct=Math.round((done/4)*100);
  return(
    <div>
      <div style={{background:`linear-gradient(135deg,${C.charcoal} 0%,#6b5a59 100%)`,borderRadius:20,padding:"2rem",marginBottom:"1.25rem",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",right:-20,top:-20,width:160,height:160,borderRadius:"50%",background:"rgba(242,207,204,0.08)"}}/>
        <div style={{position:"absolute",right:40,bottom:-30,width:100,height:100,borderRadius:"50%",background:"rgba(196,151,148,0.1)"}}/>
        <div style={{fontSize:22,color:C.gold,marginBottom:2}}>✦</div>
        <p style={{fontSize:12,color:C.accent2,letterSpacing:"0.15em",margin:"0 0 6px",fontStyle:"italic"}}>welcome back,</p>
        <h2 style={{fontSize:28,color:C.white,fontWeight:400,margin:"0 0 6px",fontFamily:"Georgia,serif"}}>{user.name}</h2>
        <p style={{color:C.accent2,fontSize:13,margin:"0 0 1.5rem"}}>Your RISE journey is underway. Keep going — she's waiting for you.</p>
        <div style={{background:"rgba(255,255,255,0.1)",borderRadius:8,height:6,marginBottom:8,overflow:"hidden"}}>
          <div style={{background:`linear-gradient(90deg,${C.blush},${C.rose})`,height:"100%",width:`${pct}%`,borderRadius:8,transition:"width 0.8s ease"}}/>
        </div>
        <p style={{fontSize:12,color:C.accent2,margin:0}}>{done} of 4 phases activated — {pct}% of your RISE complete</p>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:"1.25rem"}}>
        {phases.map(p=>(
          <div key={p.id} onClick={()=>setNav(p.id)} style={{...card,marginBottom:0,cursor:"pointer",border:`1.5px solid ${p.check?C.rose:C.blush}`,position:"relative",transition:"transform 0.15s"}}>
            {p.check&&<div style={{position:"absolute",top:10,right:12,fontSize:10,color:C.rose,background:C.blush,borderRadius:10,padding:"2px 8px",letterSpacing:"0.06em"}}>✓ DONE</div>}
            <div style={{fontSize:24,marginBottom:8}}>{p.icon}</div>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
              <div style={{width:24,height:24,borderRadius:"50%",background:p.check?C.rose:C.accent1,color:p.check?C.white:C.roseDark,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700}}>{p.letter}</div>
              <div style={{fontWeight:600,fontSize:14,color:C.charcoal}}>{p.name}</div>
            </div>
            <div style={{fontSize:12,color:"#999",lineHeight:1.5}}>{p.desc}</div>
          </div>
        ))}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:"1.25rem"}}>
        {[{id:"pinterest",label:"Pinterest Creator",icon:"📌"},{id:"repurpose",label:"Repurpose",icon:"↻"},{id:"library",label:`Library ${saved.length>0?`(${saved.length})`:""}`,icon:"📂"}].map(t=>(
          <div key={t.id} onClick={()=>setNav(t.id)} style={{...card,marginBottom:0,cursor:"pointer",textAlign:"center",padding:"1.25rem 0.75rem"}}>
            <div style={{fontSize:22,marginBottom:6}}>{t.icon}</div>
            <div style={{fontSize:12,color:C.charcoal,fontWeight:500}}>{t.label}</div>
          </div>
        ))}
      </div>

      {saved.length>0&&(
        <div style={card}>
          <div style={{fontSize:11,color:C.roseDark,letterSpacing:"0.1em",fontWeight:600,marginBottom:12}}>RECENT SAVES</div>
          {saved.slice(0,3).map((item,i)=>(
            <div key={i} style={{padding:"10px 0",borderBottom:`1px solid ${C.blush}`,fontSize:13,display:"flex",gap:10,alignItems:"flex-start"}}>
              <span style={{background:C.blush,color:C.roseDark,borderRadius:10,padding:"2px 8px",fontSize:10,whiteSpace:"nowrap",marginTop:2}}>{item.tag}</span>
              <span style={{color:"#888",lineHeight:1.5}}>{item.content.substring(0,80)}...</span>
            </div>
          ))}
          <p style={{fontSize:12,color:C.rose,marginTop:10,cursor:"pointer",margin:"10px 0 0"}} onClick={()=>setNav("library")}>View all {saved.length} saved items →</p>
        </div>
      )}
    </div>
  );
}

// ── RECLAIM ───────────────────────────────────────────────────────────────────
function ReclaimTab({data,setData,onSave}){
  const[subtab,setSubtab]=useState("gap");
  const[loading,setLoading]=useState(false);
  const[result,setResult]=useState(data.reclaimResult||"");
  const f=data.reclaim||{};
  const cf=data.incomeCalc||{};
  const set=(k,v)=>setData(d=>({...d,reclaim:{...d.reclaim,[k]:v}}));
  const setC=(k,v)=>setData(d=>({...d,incomeCalc:{...d.incomeCalc,[k]:v}}));

  const curInc=parseFloat(cf.cur)||0;
  const tarInc=parseFloat(cf.tar)||0;
  const gap=Math.max(0,tarInc-curInc);
  const pr=parseFloat(cf.pr)||0;
  const units=pr>0?Math.ceil(gap/pr):0;
  const wks=parseFloat(cf.wks)||12;
  const perWk=wks>0?Math.ceil(units/wks):0;

  async function generate(){
    setLoading(true);
    const r=await callClaude(
      `You are a warm, empowering coach for the RISE framework — for divorced moms who are nurses starting their own businesses. RECLAIM = separating who they had to become to survive from who they are choosing to become. Be specific, warm, feminine, powerful. Max 450 words.`,
      `Current situation: ${f.status||""}\nIndustry: ${f.industry||""}\nExperience: ${f.experience||""}\nWhat comes easily: ${f.gifts||""}\nTaught others: ${f.taught||""}\nSkills people ask for: ${f.skills||""}\nResearches in free time: ${f.interests||""}\nProblem solved recently: ${f.problem||""}\nWishes known 3 yrs ago: ${f.wisdom||""}\nTransformation story: ${f.transformation||""}\nOnline comfort: ${f.online||""}\nProduct type interest: ${f.productType||""}\nVision: ${f.vision||""}\nTime/week: ${f.time||""}\nBiggest fear: ${f.fear||""}\nAnything else: ${f.extra||""}\nIncome gap: $${gap}/month, needs ${units} sales at $${pr}\n\nBuild her personalized RECLAIM Blueprint across all 6 sections.`
    );
    setResult(r);setData(d=>({...d,reclaimResult:r}));setLoading(false);
  }

  const tabs=[{id:"gap",label:"Income Gap"},{id:"blueprint",label:"Blueprint"}];

  return(
    <div>
      <HeroBanner title="Reclaim Your Story" sub="Separate who you had to become to survive from who you are choosing to become." icon="🌸" />
      <div style={{display:"flex",gap:8,marginBottom:"1.5rem"}}>
        {tabs.map(t=><button key={t.id} style={t.id===subtab?btn("fill"):btn("out")} onClick={()=>setSubtab(t.id)}>{t.label}</button>)}
      </div>

      {subtab==="gap"&&(
        <div style={card}>
          <Sec title="Income Gap Calculator" sub="Know your numbers. Build toward your freedom.">
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:"1rem"}}>
              <F label="Current monthly income ($)"><input style={inp} type="number" value={cf.cur||""} onChange={e=>setC("cur",e.target.value)} placeholder="e.g. 5000"/></F>
              <F label="Target monthly income ($)"><input style={inp} type="number" value={cf.tar||""} onChange={e=>setC("tar",e.target.value)} placeholder="e.g. 8000"/></F>
              <F label="Product price ($)"><input style={inp} type="number" value={cf.pr||""} onChange={e=>setC("pr",e.target.value)} placeholder="e.g. 97"/></F>
              <F label="Weeks to reach goal"><input style={inp} type="number" value={cf.wks||""} onChange={e=>setC("wks",e.target.value)} placeholder="e.g. 12"/></F>
            </div>
            {(curInc>0||tarInc>0)&&(
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:"1.25rem"}}>
                {[{label:"Monthly gap",val:`$${gap.toLocaleString()}`},{label:"Sales needed",val:units||"—"},{label:"Sales per week",val:perWk||"—"}].map(m=>(
                  <div key={m.label} style={{background:C.cream,borderRadius:12,padding:"14px",border:`1px solid ${C.blush}`,textAlign:"center"}}>
                    <div style={{fontSize:10,color:C.roseDark,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:6}}>{m.label}</div>
                    <div style={{fontSize:26,color:C.rose,fontFamily:"Georgia,serif"}}>{m.val}</div>
                  </div>
                ))}
              </div>
            )}
            <F label="What this gap means to you"><textarea style={ta} value={cf.notes||""} onChange={e=>setC("notes",e.target.value)} placeholder="e.g. This would let me drop a night shift, cover my mortgage, pay off debt..."/></F>
            <F label="Biggest financial fear right now"><textarea style={ta} value={cf.fear||""} onChange={e=>setC("fear",e.target.value)}/></F>
            <F label="Existing protections in place"><textarea style={ta} value={cf.protections||""} onChange={e=>setC("protections",e.target.value)} placeholder="Emergency fund, life insurance, disability cover..."/></F>
          </Sec>
        </div>
      )}

      {subtab==="blueprint"&&(
        <div style={card}>
          <Sec title="1. Your Story" sub="Let's start where you are right now.">
            <F label="Current situation"><Chips options={["Full time employee","Business owner","Freelance/contractor","Stay at home parent","Student","In transition"]} selected={f.status||""} onToggle={v=>set("status",v)}/></F>
            <F label="What industry do/did you work in?"><input style={inp} value={f.industry||""} onChange={e=>set("industry",e.target.value)} placeholder="e.g. Nursing, healthcare, education..."/></F>
            <F label="Years of experience in the field"><Chips options={["0–2","3–5","5–10","10+"]} selected={f.experience||""} onToggle={v=>set("experience",v)}/></F>
          </Sec>
          <Sec title="2. Your Gifts" sub="Skills & Experience">
            <F label="What comes easily to you?"><textarea style={ta} value={f.gifts||""} onChange={e=>set("gifts",e.target.value)} placeholder="Think beyond your job title..."/></F>
            <F label="Have you ever taught someone how to do something? What was it?"><textarea style={ta} value={f.taught||""} onChange={e=>set("taught",e.target.value)}/></F>
            <F label="What professional skills do people always come to you for?"><textarea style={ta} value={f.skills||""} onChange={e=>set("skills",e.target.value)}/></F>
          </Sec>
          <Sec title="3. Your Passion" sub="What actually interests you?">
            <F label="What do you find yourself researching/reading about in your free time?"><textarea style={ta} value={f.interests||""} onChange={e=>set("interests",e.target.value)}/></F>
            <F label="What is the specific problem you've solved in your own life recently?"><textarea style={ta} value={f.problem||""} onChange={e=>set("problem",e.target.value)}/></F>
          </Sec>
          <Sec title="4. Your Journey" sub="What's your unique perspective?">
            <F label="What do you know now that you wish someone had told you 3 years ago?"><textarea style={ta} value={f.wisdom||""} onChange={e=>set("wisdom",e.target.value)}/></F>
            <F label="Describe a transformation you've experienced — the before and the after"><textarea style={ta} value={f.transformation||""} onChange={e=>set("transformation",e.target.value)}/></F>
          </Sec>
          <Sec title="5. Your People" sub="Who do you want to help and how?">
            <F label="How comfortable are you being online?"><Chips options={["Fully faceless","Hybrid","Face of brand","Not sure yet"]} selected={f.online||""} onToggle={v=>set("online",v)}/></F>
            <F label="What kind of digital product sounds interesting to you?"><Chips options={["Ebook/guide","Online course/workshop","Template or planners","Coaching/consulting framework","Membership/subscription","No idea — help me figure it out"]} selected={f.productType||""} onToggle={v=>set("productType",v)}/></F>
          </Sec>
          <Sec title="6. Your Vision" sub="What are you working with?">
            <F label="What's your goal?"><Chips options={["Replace full time income eventually","Build a meaningful side income stream","Create something I own that can grow over time","Test the water and see if this is for me"]} selected={f.vision||""} onToggle={v=>set("vision",v)}/></F>
            <F label="How much time can you dedicate per week?"><Chips options={["<5 hours","5–10 hours","10–20 hours","20+ hours"]} selected={f.time||""} onToggle={v=>set("time",v)}/></F>
            <F label="What's your biggest concern or fear about starting this?"><textarea style={ta} value={f.fear||""} onChange={e=>set("fear",e.target.value)}/></F>
            <F label="Anything else you want to share before we build your blueprint?"><textarea style={ta} value={f.extra||""} onChange={e=>set("extra",e.target.value)}/></F>
          </Sec>
          <button style={btn("fill")} onClick={generate}>Get my Reclaim Blueprint →</button>
          {loading&&<Spinner/>}
          {result&&<><div style={aiBox}>{result}</div><button style={{...btn("fill",true),marginTop:10}} onClick={()=>onSave(result,"Reclaim Blueprint")}>+ Save to library</button></>}
        </div>
      )}
    </div>
  );
}

// ── INSTALL ───────────────────────────────────────────────────────────────────
function InstallTab({data,setData,onSave}){
  const[tool,setTool]=useState("brand");
  const[loading,setLoading]=useState(false);
  const[result,setResult]=useState("");
  const bf=data.brand||{};const pf=data.product||{};const idf=data.ideagen||{};
  const setB=(k,v)=>setData(d=>({...d,brand:{...d.brand,[k]:v}}));
  const setP=(k,v)=>setData(d=>({...d,product:{...d.product,[k]:v}}));
  const setI=(k,v)=>setData(d=>({...d,ideagen:{...d.ideagen,[k]:v}}));

  const tools=[
    {id:"brand",icon:"🎨",name:"Brand Kit",desc:"Build your voice, aesthetic & presence"},
    {id:"idea",icon:"💡",name:"Idea Generator",desc:"Find your unique digital product idea"},
    {id:"product",icon:"📦",name:"Product Builder",desc:"Build your full product plan"},
  ];

  async function generate(){
    setLoading(true);setResult("");
    let sys="",prompt="";
    if(tool==="brand"){
      sys=`You are a brand strategist for the RISE framework for divorced nurse moms. Build a complete, specific brand kit: brand name suggestions, voice guide, content pillars, visual direction, bio options, platform strategy, consistency plan. Warm, feminine, specific. Max 500 words.`;
      prompt=`Profile: ${bf.profile||""}\nFeel: ${bf.feel||""}\nDream audience: ${bf.audience||""}\nEnergy: ${bf.energy||""}\nAdmired brands: ${bf.admired||""}\nTone: ${bf.tone||""}\nKnown for: ${bf.knownFor||""}\nVisibility: ${bf.visibility||""}\nPlatforms: ${(bf.platforms||[]).join(", ")}\nBiggest block: ${bf.block||""}\nBrand name idea: ${bf.name||""}\nNiche: ${bf.niche||""}\nFear: ${bf.fear||""}\nAnything else: ${bf.extra||""}`;
    }
    if(tool==="idea"){
      sys=`You are an idea generation coach for the RISE framework for divorced nurse moms building digital businesses. Generate 3-5 specific, compelling digital product ideas based on her skills, life experience, and the problems she solves. Be specific — not generic. Each idea should feel like "only she could make this." Max 500 words.`;
      prompt=`Skills & expertise: ${idf.skills||""}\nLife experiences: ${idf.life||""}\nProblems she helps solve: ${idf.problems||""}`;
    }
    if(tool==="product"){
      sys=`You are a product strategist for the RISE framework for divorced nurse moms. Build a complete product plan: refined product name, positioning, full outline, pricing rationale, launch sequence, and first 3 action steps. Warm, specific, actionable. Max 500 words.`;
      prompt=`Product idea: ${pf.idea||""}\nBefore state: ${pf.before||""}\nAfter state: ${pf.after||""}\nFormat: ${pf.format||""}\nHow to teach: ${pf.teach||""}\nExisting content: ${pf.existing||""}\nModules/steps: ${pf.modules||""}\nMisconception: ${pf.misconception||""}\nQuick win: ${pf.quickwin||""}\nName: ${pf.name||""}\nPrice: ${pf.price||""}\nTarget buyer: ${pf.buyer||""}\nAudience size: ${pf.audience||""}\nPlatforms: ${(pf.platforms||[]).join(", ")}\nFeel about selling: ${pf.selling||""}\nAnything else: ${pf.extra||""}`;
    }
    const r=await callClaude(sys,prompt);
    setResult(r);
    if(tool==="brand")setData(d=>({...d,installResult:r}));
    setLoading(false);
  }

  const fmts=["Ebook/PDF Guide","Mini-course (3–5 lessons)","Full online course (6+ modules)","Template pack","Swipe file/Resource vault","Planner/workbook","Audio series","Email course","Workshop recording","Bundle (multiple formats)","Coaching program","Membership/community","Notion template"];
  const platforms=["Instagram","TikTok","Pinterest","YouTube","Blog","Website","Email newsletter","Podcast","Twitter/X","Facebook","LinkedIn"];

  return(
    <div>
      <HeroBanner title="Install Your Foundation" sub="Face your full financial picture and put the right protections in place — so nothing is left to chance." icon="⚡"/>
      <ToolGrid tools={tools} active={tool} onSelect={t=>{setTool(t);setResult("");}}/>

      {tool==="brand"&&(
        <div style={card}>
          <Sec title="Brand Kit" sub="Build your voice, aesthetic & presence">
            <F label="Profile" hint="Your voice, audience, handle, platforms — describe yourself in 3–5 sentences"><textarea style={ta} value={bf.profile||""} onChange={e=>setB("profile",e.target.value)} placeholder="I'm a nurse turned digital creator helping divorced moms..."/></F>
            <F label="What do you want people to feel when they encounter your brand?"><textarea style={ta} value={bf.feel||""} onChange={e=>setB("feel",e.target.value)}/></F>
            <F label="Who is your dream audience?"><textarea style={ta} value={bf.audience||""} onChange={e=>setB("audience",e.target.value)}/></F>
          </Sec>
          <Sec title="Your Brand Energy" sub="Pick the mood that feels aligned">
            <Chips options={["Quiet luxury — understated elegance","Bold & vibrant — high energy impact","Soft & nurturing — warm & welcoming","Minimal & modern — clean & intentional","Earthy & organic — grounded in nature","Playful & creative — fun & expressive"]} selected={bf.energy||""} onToggle={v=>setB("energy",v)}/>
            <F label="Brands or accounts you admire the aesthetic of (2–3)" hint=" "><input style={{...inp,marginTop:8}} value={bf.admired||""} onChange={e=>setB("admired",e.target.value)} placeholder="e.g. @jenna.kutcher, The Home Edit, Glossier"/></F>
          </Sec>
          <Sec title="Your Brand Voice">
            <Chips options={["Warm & conversational — like texting a smart friend","Professional & polished — authoritative but approachable","Bold & direct — no fluff, straight to the point","Witty & playful — personality-forward, a little cheeky"]} selected={bf.tone||""} onToggle={v=>setB("tone",v)}/>
            <F label="3–5 words or phrases you want your brand to be known for" hint=" "><input style={{...inp,marginTop:8}} value={bf.knownFor||""} onChange={e=>setB("knownFor",e.target.value)} placeholder="e.g. Empowering, real, feminine, strategic, brave"/></F>
          </Sec>
          <Sec title="Visibility & Platform">
            <F label="How visible do you want to be?"><Chips options={["Fully faceless — my aesthetic and voice do the talking","Hybrid — mostly faceless with occasional personal moments","Face-forward — I'm comfortable being the face of my brand"]} selected={bf.visibility||""} onToggle={v=>setB("visibility",v)}/></F>
            <F label="What platforms will you show up on?"><Chips options={platforms} selected={bf.platforms||[]} onToggle={v=>{const c=bf.platforms||[];setB("platforms",c.includes(v)?c.filter(x=>x!==v):[...c,v]);}} multi/></F>
            <F label="What feels like the biggest block to showing up consistently?"><textarea style={ta} value={bf.block||""} onChange={e=>setB("block",e.target.value)}/></F>
          </Sec>
          <Sec title="Practical Details">
            <F label="Do you have a brand name in mind?"><input style={inp} value={bf.name||""} onChange={e=>setB("name",e.target.value)} placeholder="Leave blank and we'll help you name it"/></F>
            <F label="What industry or niche are you in?"><input style={inp} value={bf.niche||""} onChange={e=>setB("niche",e.target.value)}/></F>
            <F label="What's your biggest fear about putting yourself or your brand out there?"><textarea style={ta} value={bf.fear||""} onChange={e=>setB("fear",e.target.value)}/></F>
            <F label="Anything else that would help personalize your brand kit?"><textarea style={ta} value={bf.extra||""} onChange={e=>setB("extra",e.target.value)}/></F>
          </Sec>
          <button style={btn("fill")} onClick={generate}>Build my brand kit →</button>
        </div>
      )}

      {tool==="idea"&&(
        <div style={card}>
          <Sec title="Idea Generator" sub="Your unfair advantage is hiding in plain sight.">
            <F label="Your skills & expertise" hint="Think beyond job title. What can you do effortlessly that would feel impossible to someone else?"><textarea style={{...ta,minHeight:100}} value={idf.skills||""} onChange={e=>setI("skills",e.target.value)} placeholder="e.g. I can explain complex medical situations calmly under pressure. I can create order out of complete chaos..."/></F>
            <F label="Your life experiences" hint="Your past chapters aren't irrelevant — they're your unfair advantage. The harder the chapter, the more valuable the lesson."><textarea style={{...ta,minHeight:100}} value={idf.life||""} onChange={e=>setI("life",e.target.value)} placeholder="e.g. Went through a divorce while working night shifts, raised kids alone, rebuilt my finances from zero..."/></F>
            <F label="Problems you help solve" hint="What do people come to you for? What do friends DM you about? What do you find yourself explaining again and again?"><textarea style={{...ta,minHeight:100}} value={idf.problems||""} onChange={e=>setI("problems",e.target.value)} placeholder="e.g. How to manage burnout, how to start saving on a nurse's salary, how to leave a toxic relationship..."/></F>
          </Sec>
          <button style={btn("fill")} onClick={generate}>Generate my ideas →</button>
        </div>
      )}

      {tool==="product"&&(
        <div style={card}>
          <Sec title="Your Idea & Transformation">
            <F label="What's your product idea/topic? (even if rough)"><textarea style={ta} value={pf.idea||""} onChange={e=>setP("idea",e.target.value)}/></F>
            <F label="Describe the BEFORE state — what your buyer is struggling with"><textarea style={ta} value={pf.before||""} onChange={e=>setP("before",e.target.value)}/></F>
            <F label="Describe the AFTER state — what will they have/feel/be able to do?"><textarea style={ta} value={pf.after||""} onChange={e=>setP("after",e.target.value)}/></F>
          </Sec>
          <Sec title="Format & Structure">
            <F label="What format feels right for this product?"><Chips options={fmts} selected={pf.format||""} onToggle={v=>setP("format",v)}/></F>
            <F label="How would you naturally teach this to a friend? Walk me through it."><textarea style={ta} value={pf.teach||""} onChange={e=>setP("teach",e.target.value)}/></F>
            <F label="Do you have any existing content that could be repurposed?"><textarea style={ta} value={pf.existing||""} onChange={e=>setP("existing",e.target.value)} placeholder="Blog posts, Instagram content, notes, talks..."/></F>
          </Sec>
          <Sec title="Mapping Your Product">
            <F label="List the main steps, sections, or modules (number them if you can)"><textarea style={{...ta,minHeight:100}} value={pf.modules||""} onChange={e=>setP("modules",e.target.value)}/></F>
            <F label="What's the BIGGEST misconception people have about this topic?"><textarea style={ta} value={pf.misconception||""} onChange={e=>setP("misconception",e.target.value)}/></F>
            <F label="What's ONE quick win you can give buyers early to build their confidence?"><textarea style={ta} value={pf.quickwin||""} onChange={e=>setP("quickwin",e.target.value)}/></F>
          </Sec>
          <Sec title="Naming & Pricing">
            <F label="Do you have a product name in mind?"><Chips options={["Yes, I have a name","Help me name it"]} selected={pf.hasName||""} onToggle={v=>setP("hasName",v)}/></F>
            {pf.hasName==="Yes, I have a name"&&<F label="Your name"><input style={inp} value={pf.name||""} onChange={e=>setP("name",e.target.value)}/></F>}
            <F label="What's your price point?">
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:6}}>
                {[{v:"Low ticket $17–37",d:"Impulse buy, first product, audience building"},{v:"Mid ticket $97–197",d:"Comprehensive, deeper commitment"},{v:"High ticket $197–297",d:"Premium transformation, warm audience required"},{v:"Not sure — help me figure it out",d:""}].map(p=>(
                  <div key={p.v} onClick={()=>setP("price",p.v)} style={{padding:"12px",borderRadius:10,border:`1.5px solid ${pf.price===p.v?C.rose:C.blush}`,background:pf.price===p.v?C.cream:C.white,cursor:"pointer"}}>
                    <div style={{fontWeight:600,fontSize:13,color:C.charcoal}}>{p.v}</div>
                    {p.d&&<div style={{fontSize:11,color:"#aaa",marginTop:3}}>{p.d}</div>}
                  </div>
                ))}
              </div>
            </F>
            <F label="Describe your specific target buyer (the more specific, the better the plan)"><textarea style={ta} value={pf.buyer||""} onChange={e=>setP("buyer",e.target.value)} placeholder="Be as specific as possible..."/></F>
          </Sec>
          <Sec title="Launch & Monetisation">
            <F label="What's your current audience size?"><Chips options={["Just starting 0–500","Growing 500–2,000","Established 2,000–10,000","Large audience 10,000+"]} selected={pf.audience||""} onToggle={v=>setP("audience",v)}/></F>
            <F label="Which platforms will you use to sell and market?"><Chips options={["Instagram","TikTok","Pinterest","YouTube","Email list","Podcast","Blog","Twitter/X","LinkedIn"]} selected={pf.platforms||[]} onToggle={v=>{const c=pf.platforms||[];setP("platforms",c.includes(v)?c.filter(x=>x!==v):[...c,v]);}} multi/></F>
            <F label="Honestly — how do you feel about selling your own product?"><textarea style={ta} value={pf.selling||""} onChange={e=>setP("selling",e.target.value)}/></F>
            <F label="Anything else that will help personalize your product plan?"><textarea style={ta} value={pf.extra||""} onChange={e=>setP("extra",e.target.value)}/></F>
          </Sec>
          <button style={btn("fill")} onClick={generate}>Build my product plan →</button>
        </div>
      )}

      {loading&&<Spinner/>}
      {result&&<><div style={aiBox}>{result}</div><button style={{...btn("fill",true),marginTop:10}} onClick={()=>onSave(result,tool==="brand"?"Brand Kit":tool==="idea"?"Idea Generator":"Product Plan")}>+ Save to library</button></>}
    </div>
  );
}

// ── SUSTAIN ───────────────────────────────────────────────────────────────────
function SustainTab({data,setData,onSave}){
  const[tool,setTool]=useState("studio");
  const[subtool,setSubtool]=useState("");
  const[loading,setLoading]=useState(false);
  const[result,setResult]=useState("");
  const f=data.sustain||{};
  const set=(k,v)=>setData(d=>({...d,sustain:{...d.sustain,[k]:v}}));
  const mf=data.moments||[];

  const studioTools=[
    {id:"studio",icon:"✍️",name:"Content Studio",desc:"Generate content that sells, grows & connects"},
    {id:"story",icon:"📖",name:"Story & Voice",desc:"Build your origin story, voice & content pillars"},
    {id:"repurpose",icon:"↻",name:"Repurpose",desc:"Turn one piece of content into many formats"},
  ];
  const storySubtools=[
    {id:"voicemirror",label:"Brand Voice Mirror"},
    {id:"originstory",label:"Origin Story Builder"},
    {id:"pillars",label:"Content Pillars"},
    {id:"angles",label:"Story Angle Generator"},
    {id:"caption",label:"Transformation Caption"},
    {id:"scripts",label:"Selling Story Scripts"},
    {id:"objection",label:"Objection Responder"},
    {id:"moments",label:"Brand Moment Library"},
    {id:"uniqueness",label:"Only I Could Write This"},
    {id:"audit",label:"Standout Auditor"},
  ];

  const tones=["Confident & bold","Warm & relatable","Luxe & aspirational","Playful & fun","Soft & feminine","Raw & unfiltered","Educational & clear","Professional & polished"];
  const contentGroups=[
    {group:"Content that sells",items:["Drive DMs","Clicks & conversions"]},
    {group:"Growth content",items:["Reach new audiences","Shareable hooks"]},
    {group:"Entertain & story",items:["Relatable moments","Humor","Personal stories"]},
    {group:"Educate & add value",items:["Tips","Tutorials","Teach your expertise"]},
    {group:"Build trust",items:["Proof","Testimonials","Behind the scenes"]},
    {group:"Inspire & motivate",items:["Mindset","Aspirational","Big picture vision"]},
  ];
  const quickStarts=["I have no idea what to post — help","Write me a caption","Create 7 hooks for a post","Build a carousel","Plan my content for the week","Give me a 30-day content plan","Write a story sequence"];

  async function generate(sys,prompt){
    setLoading(true);setResult("");
    const r=await callClaude(sys,prompt);
    setResult(r);setData(d=>({...d,sustainResult:r}));setLoading(false);
  }

  function addMoment(){
    if(!f.newMoment?.trim())return;
    const moments=[...(data.moments||[]),{text:f.newMoment,date:new Date().toLocaleDateString("en-CA",{month:"short",day:"numeric"})}];
    setData(d=>({...d,moments}));set("newMoment","");
  }

  return(
    <div>
      <HeroBanner title="Sustain Your Business" sub="Build the habits, income, and presence that create lasting stability — and become the woman who trusts herself to maintain them." icon="✨"/>
      <ToolGrid tools={studioTools} active={tool} onSelect={t=>{setTool(t);setSubtool("");setResult("");}}/>

      {tool==="studio"&&(
        <div style={card}>
          <Sec title="Content Studio" sub="Content that grows your audience, builds trust and sells.">
            <F label="What kind of content?">
              {contentGroups.map(g=>(
                <div key={g.group} style={{marginBottom:8}}>
                  <div style={{fontSize:11,color:"#aaa",letterSpacing:"0.06em",marginBottom:4}}>{g.group}</div>
                  {g.items.map(item=><span key={item} style={chip(f.contentType===item)} onClick={()=>set("contentType",item)}>{item}</span>)}
                </div>
              ))}
            </F>
            <F label="Pick one tone"><Chips options={tones} selected={f.tone||""} onToggle={v=>set("tone",v)}/></F>
            <F label="Niche"><input style={inp} value={f.niche||""} onChange={e=>set("niche",e.target.value)} placeholder="e.g. Nurse entrepreneurs, financial freedom after divorce..."/></F>
            <F label="Target audience"><input style={inp} value={f.audience||""} onChange={e=>set("audience",e.target.value)} placeholder="Divorced moms who are nurses..."/></F>
            <F label="Your product (if any)"><input style={inp} value={f.product||""} onChange={e=>set("product",e.target.value)}/></F>
            <F label="Platform"><Chips options={["Instagram","TikTok","Pinterest","YouTube","Email","LinkedIn"]} selected={f.platform||""} onToggle={v=>set("platform",v)}/></F>
            <F label="Quick starts"><Chips options={quickStarts} selected={f.quickStart||""} onToggle={v=>set("quickStart",v)}/></F>
            <F label="Write with me" hint="Tell me what you want to create and I'll make it sound exactly like you."><textarea style={ta} value={f.writeWithMe||""} onChange={e=>set("writeWithMe",e.target.value)} placeholder="No templates or fillers — just your story written properly."/></F>
          </Sec>
          <button style={btn("fill")} onClick={()=>generate(`You are a content strategist and copywriter for the RISE framework for divorced nurse moms building digital businesses. Write powerful, specific, conversion-worthy content. No generic filler — every word should feel like it came from a real woman who's been through hard things and is ready to rise. Match the requested tone exactly. Max 500 words.`,`Request: ${f.quickStart||f.writeWithMe||"general content"}\nType: ${f.contentType||""}\nTone: ${f.tone||""}\nNiche: ${f.niche||""}\nAudience: ${f.audience||"divorced nurse moms"}\nProduct: ${f.product||""}\nPlatform: ${f.platform||""}`)}>Generate content →</button>
        </div>
      )}

      {tool==="story"&&(
        <div>
          <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:"1.25rem"}}>
            {storySubtools.map(t=><button key={t.id} style={subtool===t.id?btn("fill",true):btn("out",true)} onClick={()=>{setSubtool(t.id);setResult("");}}>
              {t.label}
            </button>)}
          </div>

          {subtool==="voicemirror"&&<div style={card}>
            <Sec title="Brand Voice Mirror" sub="Analyse my writing and capture my exact voice.">
              <F label="Paste writing samples"><textarea style={{...ta,minHeight:120}} value={f.voiceWriting||""} onChange={e=>set("voiceWriting",e.target.value)} placeholder="Paste 2-3 captions, emails, or posts you've written..."/></F>
              <F label="Niche (optional)"><input style={inp} value={f.voiceNiche||""} onChange={e=>set("voiceNiche",e.target.value)}/></F>
              <F label="Audience (optional)"><input style={inp} value={f.voiceAudience||""} onChange={e=>set("voiceAudience",e.target.value)}/></F>
            </Sec>
            <button style={btn("fill")} onClick={()=>generate(`You are a brand voice analyst for the RISE framework. Study the writing samples deeply. Identify: sentence rhythm, vocabulary level, emotional tone, personality traits, unique phrases, what makes it distinctly hers. Then write a Voice Guide she can use to brief anyone writing for her brand. Max 400 words.`,`Writing samples: ${f.voiceWriting||""}\nNiche: ${f.voiceNiche||""}\nAudience: ${f.voiceAudience||""}`)}>Analyse my voice →</button>
          </div>}

          {subtool==="originstory"&&<div style={card}>
            <Sec title="Origin Story Builder" sub="Turn your journey into 5 ready-to-use story formats.">
              <F label="Your before"><textarea style={ta} value={f.sBefore||""} onChange={e=>set("sBefore",e.target.value)}/></F>
              <F label="The turning point"><textarea style={ta} value={f.sTurn||""} onChange={e=>set("sTurn",e.target.value)}/></F>
              <F label="Your after"><textarea style={ta} value={f.sAfter||""} onChange={e=>set("sAfter",e.target.value)}/></F>
              <F label="Why you do what you do"><textarea style={ta} value={f.sWhy||""} onChange={e=>set("sWhy",e.target.value)}/></F>
              <F label="Mission (optional)"><input style={inp} value={f.sMission||""} onChange={e=>set("sMission",e.target.value)}/></F>
              <F label="Niche (optional)"><input style={inp} value={f.sNiche||""} onChange={e=>set("sNiche",e.target.value)}/></F>
            </Sec>
            <button style={btn("fill")} onClick={()=>generate(`You are a story coach for the RISE framework. Write 5 different versions of her origin story — each in a different format: 1) Instagram caption, 2) Email intro, 3) TikTok/Reel hook script, 4) Bio paragraph, 5) Conversational "tell me about yourself." Each version should be raw, specific, and powerful. Max 600 words total.`,`Before: ${f.sBefore||""}\nTurning point: ${f.sTurn||""}\nAfter: ${f.sAfter||""}\nWhy: ${f.sWhy||""}\nMission: ${f.sMission||""}\nNiche: ${f.sNiche||""}`)}>Build my origin story →</button>
          </div>}

          {subtool==="pillars"&&<div style={card}>
            <Sec title="Content Pillars" sub="Build pillars rooted in your actual lived experience.">
              <F label="Your life experiences & chapters" hint="Career pivots, rock bottom moments, wins, losses — be honest"><textarea style={{...ta,minHeight:100}} value={f.pLife||""} onChange={e=>set("pLife",e.target.value)}/></F>
              <F label="Your skills & expertise" hint="What you know well, have done for years, what people come to you for"><textarea style={ta} value={f.pSkills||""} onChange={e=>set("pSkills",e.target.value)}/></F>
              <F label="Niche"><input style={inp} value={f.pNiche||""} onChange={e=>set("pNiche",e.target.value)}/></F>
              <F label="Audience"><input style={inp} value={f.pAudience||""} onChange={e=>set("pAudience",e.target.value)}/></F>
              <F label="Offer"><input style={inp} value={f.pOffer||""} onChange={e=>set("pOffer",e.target.value)}/></F>
            </Sec>
            <button style={btn("fill")} onClick={()=>generate(`You are a content strategist for the RISE framework. Build 5 content pillars rooted in her real lived experience — not generic topics. Each pillar: name, description, why it connects to her story, 3 content ideas. Max 500 words.`,`Life: ${f.pLife||""}\nSkills: ${f.pSkills||""}\nNiche: ${f.pNiche||""}\nAudience: ${f.pAudience||""}\nOffer: ${f.pOffer||""}`)}>Build my story pillars →</button>
          </div>}

          {subtool==="angles"&&<div style={card}>
            <Sec title="Story Angle Generator" sub="5 story angles for any topic or offer.">
              <F label="Topic/offer" hint="e.g. Launching my first digital product"><input style={inp} value={f.angTopic||""} onChange={e=>set("angTopic",e.target.value)}/></F>
              <F label="Niche"><input style={inp} value={f.angNiche||""} onChange={e=>set("angNiche",e.target.value)}/></F>
              <F label="Audience"><input style={inp} value={f.angAudience||""} onChange={e=>set("angAudience",e.target.value)}/></F>
              <F label="Your known moments/experiences related to this topic" hint="Real moments that connect to this topic"><textarea style={ta} value={f.angMoments||""} onChange={e=>set("angMoments",e.target.value)}/></F>
            </Sec>
            <button style={btn("fill")} onClick={()=>generate(`You are a story strategist for the RISE framework. Generate 5 distinct story angles for the given topic. Each angle: the hook, the narrative thread, why it resonates with the audience, and the CTA. Make each angle feel personal and non-generic. Max 500 words.`,`Topic: ${f.angTopic||""}\nNiche: ${f.angNiche||""}\nAudience: ${f.angAudience||""}\nMoments: ${f.angMoments||""}`)}>Generate story angles →</button>
          </div>}

          {subtool==="caption"&&<div style={card}>
            <Sec title="Transformation Caption Builder" sub="Before–shift–after caption that sells the journey.">
              <F label="The before"><textarea style={ta} value={f.capBefore||""} onChange={e=>set("capBefore",e.target.value)}/></F>
              <F label="The shift"><textarea style={ta} value={f.capShift||""} onChange={e=>set("capShift",e.target.value)}/></F>
              <F label="The after"><textarea style={ta} value={f.capAfter||""} onChange={e=>set("capAfter",e.target.value)}/></F>
              <F label="Your offer (optional)"><input style={inp} value={f.capOffer||""} onChange={e=>set("capOffer",e.target.value)}/></F>
              <F label="Tone (optional)"><Chips options={tones} selected={f.capTone||""} onToggle={v=>set("capTone",v)}/></F>
            </Sec>
            <button style={btn("fill")} onClick={()=>generate(`You are a copywriter for the RISE framework. Write a transformation caption using before-shift-after structure. Make it specific, emotional, real. Not a template — it should sound like this exact woman's story. End with a subtle CTA. Max 300 words.`,`Before: ${f.capBefore||""}\nShift: ${f.capShift||""}\nAfter: ${f.capAfter||""}\nOffer: ${f.capOffer||""}\nTone: ${f.capTone||""}`)}>Build my caption →</button>
          </div>}

          {subtool==="scripts"&&<div style={card}>
            <Sec title="Selling Story Scripts" sub="5-part story sequences for IG, email, or TikTok.">
              <F label="Your offer"><textarea style={ta} value={f.scrOffer||""} onChange={e=>set("scrOffer",e.target.value)}/></F>
              <F label="Before state (audience's starting point)"><textarea style={ta} value={f.scrBefore||""} onChange={e=>set("scrBefore",e.target.value)}/></F>
              <F label="After state (the transformation)"><textarea style={ta} value={f.scrAfter||""} onChange={e=>set("scrAfter",e.target.value)}/></F>
              <F label="Niche"><input style={inp} value={f.scrNiche||""} onChange={e=>set("scrNiche",e.target.value)}/></F>
              <F label="Format"><Chips options={["IG story series","Email series","TikTok series"]} selected={f.scrFormat||""} onToggle={v=>set("scrFormat",v)}/></F>
            </Sec>
            <button style={btn("fill")} onClick={()=>generate(`You are a story script writer for the RISE framework. Write a 5-part selling story sequence in the requested format. Each part flows into the next and builds toward the offer naturally — not salesy. Real, warm, specific. Max 600 words.`,`Offer: ${f.scrOffer||""}\nBefore: ${f.scrBefore||""}\nAfter: ${f.scrAfter||""}\nNiche: ${f.scrNiche||""}\nFormat: ${f.scrFormat||"IG story series"}`)}>Write my story series →</button>
          </div>}

          {subtool==="objection"&&<div style={card}>
            <Sec title="Objection Story Responder" sub="Answer sales objections with personal stories, not logic.">
              <F label="The objection"><input style={inp} value={f.objObj||""} onChange={e=>set("objObj",e.target.value)} placeholder="e.g. I don't have enough time, I'm not an expert, it won't work for me..."/></F>
              <F label="Your relevant personal story" hint="The real moment that contradicts this objection"><textarea style={ta} value={f.objStory||""} onChange={e=>set("objStory",e.target.value)}/></F>
              <F label="Your offer"><input style={inp} value={f.objOffer||""} onChange={e=>set("objOffer",e.target.value)}/></F>
            </Sec>
            <button style={btn("fill")} onClick={()=>generate(`You are a sales story coach for the RISE framework. Write a story-based response to the sales objection. Don't use logic or bullet points — use story. Make it personal, specific, and powerful. The reader should feel seen, not sold to. Max 300 words.`,`Objection: ${f.objObj||""}\nPersonal story: ${f.objStory||""}\nOffer: ${f.objOffer||""}`)}>Write story responses →</button>
          </div>}

          {subtool==="uniqueness"&&<div style={card}>
            <Sec title="Only I Could Write This" sub="Score and rewrite content for maximum personal specificity.">
              <F label="Your content"><textarea style={{...ta,minHeight:120}} value={f.uniContent||""} onChange={e=>set("uniContent",e.target.value)} placeholder="Paste your caption, email, or post..."/></F>
              <F label="Context about you (optional)"><textarea style={ta} value={f.uniContext||""} onChange={e=>set("uniContext",e.target.value)} placeholder="Any personal details that should be in this content..."/></F>
            </Sec>
            <button style={btn("fill")} onClick={()=>generate(`You are a content specificity coach for the RISE framework. Score the content 1-10 on how uniquely personal it is. Then rewrite it with maximum specificity — replace every generic phrase with a real, personal detail. Show before/after. Max 400 words.`,`Content: ${f.uniContent||""}\nContext: ${f.uniContext||""}`)}>Filter for uniqueness →</button>
          </div>}

          {subtool==="audit"&&<div style={card}>
            <Sec title="Standout Content Auditor" sub="Could-only-be-you score with full breakdown and rewrite.">
              <F label="Your content"><textarea style={{...ta,minHeight:120}} value={f.audContent||""} onChange={e=>set("audContent",e.target.value)}/></F>
              <F label="Niche"><input style={inp} value={f.audNiche||""} onChange={e=>set("audNiche",e.target.value)}/></F>
              <F label="Audience"><input style={inp} value={f.audAudience||""} onChange={e=>set("audAudience",e.target.value)}/></F>
            </Sec>
            <button style={btn("fill")} onClick={()=>generate(`You are a content auditor for the RISE framework. Give a full audit: 1) Overall score /10, 2) What's working, 3) What's generic, 4) What only SHE could add, 5) Full rewrite. Be direct but warm. Max 500 words.`,`Content: ${f.audContent||""}\nNiche: ${f.audNiche||""}\nAudience: ${f.audAudience||""}`)}>Audit my content →</button>
          </div>}

          {subtool==="moments"&&<div style={card}>
            <Sec title="Brand Moment Library" sub="Save your real moments. Generate content from any of them.">
              <F label="Add a brand moment" hint="A real experience, story, win, lesson, turning point — anything raw and real"><textarea style={ta} value={f.newMoment||""} onChange={e=>set("newMoment",e.target.value)} placeholder="e.g. The day I sat in my car after a 12-hour shift and realized I couldn't keep doing this..."/></F>
              <button style={btn("out",true)} onClick={addMoment}>+ Save moment</button>
              {(data.moments||[]).length>0&&<>
                <div style={{marginTop:"1.25rem",marginBottom:8,fontSize:11,color:C.roseDark,letterSpacing:"0.1em",fontWeight:600}}>YOUR MOMENTS</div>
                {(data.moments||[]).map((m,i)=>(
                  <div key={i} style={{border:`1px solid ${C.blush}`,borderRadius:10,padding:"12px 14px",marginBottom:8,background:C.white}}>
                    <div style={{fontSize:12,color:"#aaa",marginBottom:6}}>{m.date}</div>
                    <div style={{fontSize:13,color:C.charcoal,lineHeight:1.6,marginBottom:8}}>{m.text}</div>
                    <button style={btn("fill",true)} onClick={()=>{
                      set("writeWithMe",m.text);setTool("studio");
                      generate(`You are a content creator for the RISE framework for divorced nurse moms. Take this real personal moment and turn it into a powerful piece of content. Make it raw, specific, and real. Platform: Instagram. Max 300 words.`,`Moment: ${m.text}`);
                    }}>Generate content from this moment →</button>
                  </div>
                ))}
              </>}
            </Sec>
          </div>}

          {!subtool&&<div style={{...card,textAlign:"center",padding:"2rem",color:"#aaa"}}>
            <div style={{fontSize:32,marginBottom:8}}>📖</div>
            <p style={{fontSize:13}}>Select a story tool above to get started.</p>
          </div>}

          {loading&&<Spinner/>}
          {result&&subtool!=="moments"&&<><div style={aiBox}>{result}</div><button style={{...btn("fill",true),marginTop:10}} onClick={()=>onSave(result,`Sustain — ${storySubtools.find(t=>t.id===subtool)?.label||"Story"}`)}>+ Save to library</button></>}
        </div>
      )}

      {tool==="repurpose"&&(
        <div style={card}>
          <Sec title="Repurpose Your Content" sub="Turn one piece of content into many formats — without starting from scratch.">
            <F label="What format was the original?"><Chips options={["IG story","Caption","Reel","Email","Thread","Blog","Voice note transcript"]} selected={f.repFrom||""} onToggle={v=>set("repFrom",v)}/></F>
            <F label="Turn it into"><Chips options={["Carousel","Email","Caption","Story sequence","Pinterest pin","Reel script","LinkedIn post"]} selected={f.repTo||""} onToggle={v=>set("repTo",v)}/></F>
            <F label="Paste your content"><textarea style={{...ta,minHeight:120}} value={f.repContent||""} onChange={e=>set("repContent",e.target.value)} placeholder="Paste your caption, email, story, blog post..."/></F>
          </Sec>
          <button style={btn("fill")} onClick={()=>generate(`You are a content repurposing expert for the RISE framework. Take the content and fully rebuild it in the new format. Don't start from scratch — extract the real voice, ideas, and story. Sound exactly like the original person. Be specific. No generic fillers. Max 500 words.`,`From: ${f.repFrom||""}\nTo: ${f.repTo||""}\nContent: ${f.repContent||""}`)}>Repurpose my content →</button>
          {loading&&<Spinner/>}
          {result&&<><div style={aiBox}>{result}</div><button style={{...btn("fill",true),marginTop:10}} onClick={()=>onSave(result,`Repurposed → ${f.repTo||""}`)}>+ Save to library</button></>}
        </div>
      )}

      {tool!=="repurpose"&&tool!=="story"&&loading&&<Spinner/>}
      {tool==="studio"&&result&&<><div style={aiBox}>{result}</div><button style={{...btn("fill",true),marginTop:10}} onClick={()=>onSave(result,"Content Studio")}>+ Save to library</button></>}
    </div>
  );
}

// ── EXPAND ────────────────────────────────────────────────────────────────────
function ExpandTab({data,setData,onSave}){
  const[view,setView]=useState("mindset");
  const[loading,setLoading]=useState(false);
  const[result,setResult]=useState(data.expandResult||"");
  const[jLoading,setJLoading]=useState(false);const[jRef,setJRef]=useState("");const[entry,setEntry]=useState("");const[jTag,setJTag]=useState("General");
  const f=data.expand||{};
  const set=(k,v)=>setData(d=>({...d,expand:{...d.expand,[k]:v}}));
  const mindset=[
    {label:"Imposter syndrome",desc:"Not feeling good enough"},
    {label:"Procrastination",desc:"Not taking action"},
    {label:"Comparison",desc:"Comparing myself to others"},
    {label:"Self-doubt",desc:"Don't feel like I have enough expertise"},
    {label:"Overwhelm",desc:"Not knowing where to start"},
    {label:"Motivation",desc:"Losing steam"},
    {label:"Something else",desc:""},
  ];
  async function generate(){
    setLoading(true);
    const r=await callClaude(`You are a warm, powerful mindset coach for the RISE framework for divorced nurse moms. Combine emotional intelligence with practical tools. Speak like a trusted mentor who has been through hard things. Max 400 words.`,`Challenge: ${f.topic||"general"}\nDetails: ${f.details||""}\nVision: ${f.vision||""}\nTime/week: ${f.time||""}\nIncome goal: ${f.goal||""}`);
    setResult(r);setData(d=>({...d,expandResult:r}));setLoading(false);
  }
  async function addEntry(){
    if(!entry.trim())return;
    setJLoading(true);
    const ref=await callClaude(`You are a warm mindset coach for the RISE framework. A woman just wrote a journal entry. Respond with 2-4 warm, insightful sentences. Acknowledge what she said, offer one gentle reframe, end with one powerful question for her to sit with. Never be generic.`,`Entry: ${entry}\nTag: ${jTag}`);
    setData(d=>({...d,journal:[{entry,tag:jTag,date:new Date().toLocaleDateString("en-CA",{month:"short",day:"numeric",year:"numeric"}),reflection:ref},...(d.journal||[])]}));
    setJRef(ref);setEntry("");setJLoading(false);
  }
  return(
    <div>
      <HeroBanner title="Expand Your Life" sub="With stability beneath you and your identity restored, you intentionally build a life that is fully, finally yours." icon="🌿"/>
      <div style={{display:"flex",gap:8,marginBottom:"1.5rem"}}>
        {[{id:"mindset",label:"Mindset Coaching"},{id:"journal",label:"Mindset Journal"}].map(t=><button key={t.id} style={t.id===view?btn("fill"):btn("out")} onClick={()=>setView(t.id)}>{t.label}</button>)}
      </div>
      {view==="mindset"&&<>
        <div style={card}>
          <Sec title="What would you like to work on today?">
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:"1.25rem"}}>
              {mindset.map(m=><div key={m.label} onClick={()=>set("topic",m.label)} style={{padding:"12px 14px",borderRadius:10,border:`1.5px solid ${f.topic===m.label?C.rose:C.blush}`,background:f.topic===m.label?C.cream:C.white,cursor:"pointer"}}>
                <div style={{fontWeight:600,fontSize:13,color:C.charcoal}}>{m.label}</div>
                {m.desc&&<div style={{fontSize:11,color:"#aaa",marginTop:2}}>{m.desc}</div>}
              </div>)}
            </div>
            <F label="Tell me more — this is your space"><textarea style={{...ta,minHeight:100}} value={f.details||""} onChange={e=>set("details",e.target.value)} placeholder="Be as honest as you want."/></F>
          </Sec>
          <Sec title="Your Vision">
            <F label="What are you working towards?"><Chips options={["Replace full-time income","Build a meaningful side income","Create something I own that grows","Test the waters"]} selected={f.vision||""} onToggle={v=>set("vision",v)}/></F>
            <F label="Income goal"><input style={inp} value={f.goal||""} onChange={e=>set("goal",e.target.value)} placeholder="e.g. $5,000/month"/></F>
            <F label="Hours per week available"><Chips options={["Under 5 hours","5–10 hours","10–20 hours","20+ hours"]} selected={f.time||""} onToggle={v=>set("time",v)}/></F>
            <F label="Anything else to share?"><textarea style={ta} value={f.extra||""} onChange={e=>set("extra",e.target.value)}/></F>
          </Sec>
          <button style={btn("fill")} onClick={generate}>Get my Expand coaching →</button>
          {loading&&<Spinner/>}
          {result&&<><div style={aiBox}>{result}</div><button style={{...btn("fill",true),marginTop:10}} onClick={()=>onSave(result,"Expand Coaching")}>+ Save to library</button></>}
        </div>
      </>}
      {view==="journal"&&(
        <div>
          <div style={card}>
            <Sec title="Mindset Journal" sub="Your private space. Write freely.">
              <F label="What's on your mind today?"><textarea style={{...ta,minHeight:120}} value={entry} onChange={e=>setEntry(e.target.value)} placeholder="Write freely. This is just for you."/></F>
              <F label="Tag this entry"><Chips options={["General","Imposter syndrome","Procrastination","Comparison","Self-doubt","Overwhelm","Motivation","Win","Gratitude"]} selected={jTag} onToggle={setJTag}/></F>
              <button style={btn("fill")} onClick={addEntry} disabled={!entry.trim()}>Add entry + get reflection →</button>
              {jLoading&&<Spinner/>}
              {jRef&&<div style={{...aiBox,borderLeft:`3px solid ${C.gold}`}}><div style={{fontSize:10,color:C.gold,letterSpacing:"0.1em",marginBottom:6}}>YOUR REFLECTION</div>{jRef}</div>}
            </Sec>
          </div>
          {(data.journal||[]).map((e,i)=>(
            <div key={i} style={{...card,marginBottom:"0.75rem"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <div style={{display:"flex",gap:8}}><span style={{background:C.blush,color:C.roseDark,borderRadius:10,padding:"2px 10px",fontSize:10}}>{e.tag}</span><span style={{fontSize:11,color:"#aaa"}}>{e.date}</span></div>
                <button style={{background:"transparent",border:"none",color:"#ccc",cursor:"pointer",fontSize:16}} onClick={()=>setData(d=>({...d,journal:(d.journal||[]).filter((_,j)=>j!==i)}))}>×</button>
              </div>
              <p style={{fontSize:13,color:C.charcoal,lineHeight:1.7,margin:"0 0 10px"}}>{e.entry}</p>
              {e.reflection&&<div style={{background:C.cream,borderRadius:8,padding:"10px 12px",fontSize:12,color:C.charcoal,lineHeight:1.6,borderLeft:`2px solid ${C.gold}`}}><span style={{fontSize:10,color:C.gold,letterSpacing:"0.08em"}}>REFLECTION · </span>{e.reflection}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── POWER TOOLS ───────────────────────────────────────────────────────────────
function PowerToolsTab({data,setData,onSave}){
  const[tool,setTool]=useState("price");
  const[loading,setLoading]=useState(false);
  const[result,setResult]=useState("");
  const pf=data.priceCalc||{};
  const wf=data.whereSell||{};
  const setP=(k,v)=>setData(d=>({...d,priceCalc:{...d.priceCalc,[k]:v}}));
  const setW=(k,v)=>setData(d=>({...d,whereSell:{...d.whereSell,[k]:v}}));
  const fmts=["Ebook/PDF Guide","Mini-course (3–5 lessons)","Full online course (6+ modules)","Template pack","Swipe file/Resource vault","Planner/workbook","Audio series","Email course","Workshop recording","Bundle (multiple formats)","Coaching program","Membership/community","Notion template"];

  async function generate(){
    setLoading(true);setResult("");
    let sys="",prompt="";
    if(tool==="price"){
      sys=`You are a pricing strategist for the RISE framework helping divorced nurse moms price their digital products confidently. Give a specific recommended price range with clear reasoning. Include: suggested price, minimum viable price, aspirational price, and why. Be direct and specific. Max 400 words.`;
      prompt=`Product type: ${pf.type||""}\nOutcome it creates: ${pf.outcome||""}\nTime to complete: ${pf.time||""}\nAudience temperature: ${pf.audience||""}\nProduct details: ${pf.details||""}`;
    }else{
      sys=`You are a sales platform strategist for the RISE framework for divorced nurse moms. Recommend the best platforms to sell her product based on her product type, price point, audience size, visibility comfort, and experience level. Be specific — name actual platforms (Stan Store, Gumroad, Teachable, Kajabi, etc.) with pros/cons for her situation. Max 400 words.`;
      prompt=`Product: ${wf.product||""}\nPrice: ${wf.price||""}\nAudience size: ${wf.audience||""}\nVisibility: ${wf.visibility||""}\nExperience: ${wf.experience||""}`;
    }
    const r=await callClaude(sys,prompt);
    setResult(r);setLoading(false);
  }

  const tools=[{id:"price",icon:"💰",name:"Price Calculator",desc:"Get your confident, strategic price point"},{id:"where",icon:"🛒",name:"Where to Sell",desc:"Find the best platform for your product"}];

  return(
    <div>
      <HeroBanner title="Power Tools" sub="Strategic tools to price confidently, sell smart, and grow with intention." icon="⚙️"/>
      <ToolGrid tools={tools} active={tool} onSelect={t=>{setTool(t);setResult("");}}/>

      {tool==="price"&&(
        <div style={card}>
          <Sec title="Price Calculator" sub="Know your worth. Price it right.">
            <F label="Product type"><Chips options={fmts} selected={pf.type||""} onToggle={v=>setP("type",v)}/></F>
            <F label="What outcome does your product create?">
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:6}}>
                {[{v:"Quick wins",d:"Saves time/solves a specific problem"},{v:"Skill upgrade",d:"Teaches a new skill/process they can use repeatedly"},{v:"Life chapter shift",d:"Changes a major area of life — health, money, relationships, career"},{v:"Identity transformation",d:"Redefines who they are and how they see themselves"}].map(o=>(
                  <div key={o.v} onClick={()=>setP("outcome",o.v)} style={{padding:"12px",borderRadius:10,border:`1.5px solid ${pf.outcome===o.v?C.rose:C.blush}`,background:pf.outcome===o.v?C.cream:C.white,cursor:"pointer"}}>
                    <div style={{fontWeight:600,fontSize:13,color:C.charcoal}}>{o.v}</div>
                    <div style={{fontSize:11,color:"#aaa",marginTop:2}}>{o.d}</div>
                  </div>
                ))}
              </div>
            </F>
            <F label="Time needed to complete"><Chips options={["30 minutes or less","1–3 hours","Half day (3–6 hrs)","1–3 days","1 month+"]} selected={pf.time||""} onToggle={v=>setP("time",v)}/></F>
            <F label="Your audience"><Chips options={["Cold — don't know me","Warm — know me but haven't bought","Hot — engaged and bought before"]} selected={pf.audience||""} onToggle={v=>setP("audience",v)}/></F>
            <F label="Product details" hint="# of pages + bonuses, # of modules, time to complete, community, live Q&A..."><textarea style={ta} value={pf.details||""} onChange={e=>setP("details",e.target.value)}/></F>
          </Sec>
          <button style={btn("fill")} onClick={generate}>Calculate my pricing →</button>
        </div>
      )}

      {tool==="where"&&(
        <div style={card}>
          <Sec title="Where to Sell" sub="The right platform changes everything.">
            <F label="What are you selling?"><Chips options={fmts} selected={wf.product||""} onToggle={v=>setW("product",v)}/></F>
            <F label="Price point">
              <Chips options={["Under $27","$27–47","$47–97","$97–197","$197–497","$497+"]} selected={wf.price||""} onToggle={v=>setW("price",v)}/>
            </F>
            <F label="Size of audience"><Chips options={["Starting out 0–1k","Growing 1–10k","Established 10–50k","Large 50k+"]} selected={wf.audience||""} onToggle={v=>setW("audience",v)}/></F>
            <F label="Visibility"><Chips options={["Completely faceless","Hybrid","Face of business","Unsure"]} selected={wf.visibility||""} onToggle={v=>setW("visibility",v)}/></F>
            <F label="Experience level"><Chips options={["Beginner","Sold a few things","Experienced seller","Scaling"]} selected={wf.experience||""} onToggle={v=>setW("experience",v)}/></F>
          </Sec>
          <button style={btn("fill")} onClick={generate}>Find my best platform →</button>
        </div>
      )}

      {loading&&<Spinner/>}
      {result&&<><div style={aiBox}>{result}</div><button style={{...btn("fill",true),marginTop:10}} onClick={()=>onSave(result,tool==="price"?"Price Strategy":"Where to Sell")}>+ Save to library</button></>}
    </div>
  );
}

// ── PINTEREST ─────────────────────────────────────────────────────────────────
function PinterestTab({onSave}){
  const[mode,setMode]=useState("describe");
  const[loading,setLoading]=useState(false);const[result,setResult]=useState("");
  const[f,setF]=useState({});const set=(k,v)=>setF(x=>({...x,[k]:v}));
  const modes=[{id:"describe",label:"Describe your pin"},{id:"topic",label:"Topic + offer"},{id:"repurpose",label:"Repurpose content"}];
  async function generate(){
    setLoading(true);setResult("");
    let prompt="";
    if(mode==="describe")prompt=`Pin: ${f.pinDesc||""}\nNiche: ${f.niche||""}\nAudience: ${f.audience||""}\nOffer: ${f.offer||""}`;
    if(mode==="topic")prompt=`Topic: ${f.topic||""}\nOffer: ${f.offer||""}\nNiche: ${f.niche||""}\nAudience: ${f.audience||""}`;
    if(mode==="repurpose")prompt=`Original (${f.origFormat||"caption"}): ${f.origContent||""}\nNiche: ${f.niche||""}\nOffer: ${f.offer||""}`;
    const r=await callClaude(`You are a Pinterest content strategist for divorced nurse moms building digital businesses. Create complete, optimized Pinterest content. Output: 1) Pin title (max 100 chars) 2) Pin description (150-300 words, keyword-rich) 3) Board name 4) 5 hashtags 5) SEO keywords. If topic given, build a 5-pin strategy. Warm, aspirational, searchable. Max 500 words.`,prompt);
    setResult(r);setLoading(false);
  }
  return(
    <div>
      <HeroBanner title="Pinterest Creator" sub="Build scroll-stopping pins that drive traffic and sales to your digital products." icon="📌"/>
      <div style={{display:"flex",gap:8,marginBottom:"1.5rem",flexWrap:"wrap"}}>
        {modes.map(m=><button key={m.id} style={m.id===mode?btn("fill"):btn("out")} onClick={()=>{setMode(m.id);setResult("");}}>{m.label}</button>)}
      </div>
      <div style={card}>
        {mode==="describe"&&<>
          <F label="Describe what your pin is about"><textarea style={ta} value={f.pinDesc||""} onChange={e=>set("pinDesc",e.target.value)} placeholder="e.g. A calm desk setup about morning routines for busy nurses..."/></F>
          <F label="Your niche"><input style={inp} value={f.niche||""} onChange={e=>set("niche",e.target.value)}/></F>
          <F label="Your audience"><input style={inp} value={f.audience||""} onChange={e=>set("audience",e.target.value)}/></F>
          <F label="Your offer (optional)"><input style={inp} value={f.offer||""} onChange={e=>set("offer",e.target.value)}/></F>
        </>}
        {mode==="topic"&&<>
          <F label="Topic"><input style={inp} value={f.topic||""} onChange={e=>set("topic",e.target.value)} placeholder="e.g. How nurses can start a digital business in 90 days"/></F>
          <F label="Your offer"><input style={inp} value={f.offer||""} onChange={e=>set("offer",e.target.value)}/></F>
          <F label="Your niche"><input style={inp} value={f.niche||""} onChange={e=>set("niche",e.target.value)}/></F>
          <F label="Your audience"><input style={inp} value={f.audience||""} onChange={e=>set("audience",e.target.value)}/></F>
        </>}
        {mode==="repurpose"&&<>
          <F label="Original format"><Chips options={["IG story","Caption","Reel","Email","Blog","Thread","Voice note"]} selected={f.origFormat||""} onToggle={v=>set("origFormat",v)}/></F>
          <F label="Paste your content"><textarea style={{...ta,minHeight:120}} value={f.origContent||""} onChange={e=>set("origContent",e.target.value)}/></F>
          <F label="Your niche"><input style={inp} value={f.niche||""} onChange={e=>set("niche",e.target.value)}/></F>
          <F label="Your offer (optional)"><input style={inp} value={f.offer||""} onChange={e=>set("offer",e.target.value)}/></F>
        </>}
        <button style={btn("fill")} onClick={generate}>Create my Pinterest content →</button>
        {loading&&<Spinner/>}
        {result&&<><div style={aiBox}>{result}</div><button style={{...btn("fill",true),marginTop:10}} onClick={()=>onSave(result,"Pinterest")}>+ Save to library</button></>}
      </div>
    </div>
  );
}

// ── LIBRARY ───────────────────────────────────────────────────────────────────
function LibraryTab({saved,onDelete,onExport}){
  const[filter,setFilter]=useState("All");
  const tags=["All",...Array.from(new Set(saved.map(i=>i.tag)))];
  const filtered=filter==="All"?saved:saved.filter(i=>i.tag===filter);
  return(
    <div>
      <HeroBanner title="Saved Library" sub="All your blueprints, plans, and content — organized and ready to use." icon="📂"/>
      <div style={{...card}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1rem"}}>
          <div style={{fontSize:11,color:C.roseDark,letterSpacing:"0.1em",fontWeight:600}}>{saved.length} SAVED ITEMS</div>
          {saved.length>0&&<button style={btn("out",true)} onClick={onExport}>⬇ Export all</button>}
        </div>
        {saved.length===0
          ?<div style={{textAlign:"center",padding:"2.5rem 0",color:"#ccc"}}>
            <div style={{fontSize:40,marginBottom:10}}>✦</div>
            <p style={{fontSize:13}}>No saved content yet.<br/>Generate content in any tab and save it here.</p>
          </div>
          :<>
            <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:"1.25rem"}}>
              {tags.map(t=><span key={t} style={chip(t===filter)} onClick={()=>setFilter(t)}>{t}</span>)}
            </div>
            {filtered.map((item,i)=>(
              <div key={i} style={{border:`1px solid ${C.blush}`,borderRadius:12,padding:"1.25rem",marginBottom:"0.75rem",background:C.white}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                  <div style={{display:"flex",gap:8,alignItems:"center"}}>
                    <span style={{background:C.blush,color:C.roseDark,borderRadius:10,padding:"2px 10px",fontSize:10,fontWeight:600}}>{item.tag}</span>
                    <span style={{fontSize:11,color:"#aaa"}}>{item.date}</span>
                  </div>
                  <button style={{background:"transparent",border:"none",color:"#ccc",cursor:"pointer",fontSize:18}} onClick={()=>onDelete(saved.indexOf(item))}>×</button>
                </div>
                <div style={{fontSize:13,color:C.charcoal,lineHeight:1.7,whiteSpace:"pre-wrap"}}>{item.content}</div>
                <button style={{...btn("fill",true),marginTop:12}} onClick={()=>navigator.clipboard?.writeText(item.content)}>Copy</button>
              </div>
            ))}
          </>
        }
      </div>
    </div>
  );
}

// ── APP ───────────────────────────────────────────────────────────────────────
const NAV=[
  {id:"home",label:"Home",icon:"⌂"},
  {id:"reclaim",label:"Reclaim",icon:"R",letter:true},
  {id:"install",label:"Install",icon:"I",letter:true},
  {id:"sustain",label:"Sustain",icon:"S",letter:true},
  {id:"expand",label:"Expand",icon:"E",letter:true},
  {id:"power",label:"Power Tools",icon:"⚙"},
  {id:"pinterest",label:"Pinterest",icon:"📌"},
  {id:"library",label:"Library",icon:"📂"},
];

export default function App(){
  const[user,setUser]=useState(null);
  const[nav,setNav]=useState("home");
  const[data,setData]=useState({});
  const[saved,setSaved]=useState([]);
  const[sideOpen,setSideOpen]=useState(true);

  useEffect(()=>{
    const email=localStorage.getItem("rise_current_user");
    if(email){
      const s=localStorage.getItem(`rise_auth_${email}`);
      if(s){const u=JSON.parse(s);setUser(u);const d=localStorage.getItem(`rise_data_${email}`);if(d)setData(JSON.parse(d));const l=localStorage.getItem(`rise_lib_${email}`);if(l)setSaved(JSON.parse(l));}
    }
  },[]);
  useEffect(()=>{if(user)localStorage.setItem(`rise_data_${user.email}`,JSON.stringify(data));},[data,user]);
  useEffect(()=>{if(user)localStorage.setItem(`rise_lib_${user.email}`,JSON.stringify(saved));},[saved,user]);

  function handleLogin(u){
    setUser(u);
    const d=localStorage.getItem(`rise_data_${u.email}`);if(d)setData(JSON.parse(d));
    const l=localStorage.getItem(`rise_lib_${u.email}`);if(l)setSaved(JSON.parse(l));
  }
  function logout(){localStorage.removeItem("rise_current_user");setUser(null);setData({});setSaved([]);setNav("home");}
  function saveItem(content,tag){setSaved(p=>[{content,tag,date:new Date().toLocaleDateString("en-CA",{month:"short",day:"numeric",year:"numeric"})},...p]);}
  function deleteItem(item){setSaved(p=>p.filter(i=>i!==item));}
  function exportLib(){
    if(!saved.length)return;
    const t=saved.map(i=>`[${i.tag}] — ${i.date}\n${"─".repeat(40)}\n${i.content}\n`).join("\n\n");
    const b=new Blob([t],{type:"text/plain"});const u=URL.createObjectURL(b);
    const a=document.createElement("a");a.href=u;a.download=`RISE-Library-${new Date().toISOString().slice(0,10)}.txt`;a.click();URL.revokeObjectURL(u);
  }

  if(!user)return<LoginScreen onLogin={handleLogin}/>;

  const SIDE_W=sideOpen?200:60;

  return(
    <div style={{display:"flex",minHeight:"100vh",background:C.pale,fontFamily:"Georgia,serif"}}>
      {/* SIDEBAR */}
      <div style={{width:SIDE_W,minHeight:"100vh",background:C.charcoal,display:"flex",flexDirection:"column",transition:"width 0.25s ease",flexShrink:0,position:"relative",zIndex:10}}>
        <div style={{padding:sideOpen?"1.25rem 1rem":"1rem 0",borderBottom:`1px solid rgba(255,255,255,0.08)`,textAlign:sideOpen?"left":"center"}}>
          {sideOpen
            ?<><div style={{fontSize:10,letterSpacing:"0.25em",color:C.accent2,fontStyle:"italic",marginBottom:2}}>my signature</div>
              <div style={{fontSize:22,color:C.rose,letterSpacing:"0.2em"}}>RISE</div>
              <div style={{fontSize:10,letterSpacing:"0.15em",color:C.accent2}}>PLAN</div></>
            :<div style={{fontSize:18,color:C.rose,letterSpacing:"0.15em"}}>R</div>
          }
        </div>
        <nav style={{flex:1,padding:"0.75rem 0"}}>
          {NAV.map(n=>{
            const active=nav===n.id;
            return(
              <div key={n.id} onClick={()=>setNav(n.id)} style={{display:"flex",alignItems:"center",gap:sideOpen?10:0,padding:sideOpen?"10px 1rem":"10px 0",justifyContent:sideOpen?"flex-start":"center",cursor:"pointer",background:active?"rgba(196,151,148,0.15)":"transparent",borderLeft:active?`3px solid ${C.rose}`:"3px solid transparent",transition:"all 0.15s",marginBottom:2}}>
                <div style={{width:28,height:28,borderRadius:n.letter?"50%":"8px",background:active?C.rose:n.letter?"rgba(196,151,148,0.2)":"transparent",color:active?C.white:C.accent2,display:"flex",alignItems:"center",justifyContent:"center",fontSize:n.letter?13:16,fontWeight:n.letter?700:400,flexShrink:0}}>
                  {n.icon}
                </div>
                {sideOpen&&<span style={{fontSize:13,color:active?C.white:C.accent2,letterSpacing:"0.03em"}}>{n.label}{n.id==="library"&&saved.length>0?` (${saved.length})`:""}</span>}
              </div>
            );
          })}
        </nav>
        <div style={{padding:"0.75rem",borderTop:`1px solid rgba(255,255,255,0.08)`}}>
          {sideOpen
            ?<div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div style={{fontSize:12,color:C.accent2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:110}}>{user.name}</div>
              <button style={{background:"transparent",border:"none",color:C.accent2,cursor:"pointer",fontSize:12}} onClick={logout}>Out</button>
            </div>
            :<button style={{background:"transparent",border:"none",color:C.accent2,cursor:"pointer",fontSize:16,width:"100%"}} onClick={logout}>↩</button>
          }
        </div>
        <button onClick={()=>setSideOpen(o=>!o)} style={{position:"absolute",top:"50%",right:-12,transform:"translateY(-50%)",width:24,height:24,borderRadius:"50%",background:C.rose,border:"none",color:C.white,cursor:"pointer",fontSize:12,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 2px 8px rgba(0,0,0,0.2)"}}>
          {sideOpen?"‹":"›"}
        </button>
      </div>

      {/* MAIN */}
      <div style={{flex:1,overflow:"auto"}}>
        <div style={{maxWidth:760,margin:"0 auto",padding:"1.75rem 1.5rem"}}>
          {nav==="home"&&<HomeTab user={user} data={data} setNav={setNav} saved={saved}/>}
          {nav==="reclaim"&&<ReclaimTab data={data} setData={setData} onSave={saveItem}/>}
          {nav==="install"&&<InstallTab data={data} setData={setData} onSave={saveItem}/>}
              {nav==="sustain"&&<SustainTab data={data} setData={setData} onSave={saveItem}/>}
          {nav==="expand"&&<ExpandTab data={data} setData={setData} onSave={saveItem}/>}
          {nav==="power"&&<PowerToolsTab data={data} setData={setData} onSave={saveItem}/>}
          {nav==="pinterest"&&<PinterestTab onSave={saveItem}/>}
          {nav==="library"&&<LibraryTab saved={saved} onDelete={deleteItem} onExport={exportLib}/>}
        </div>
      </div>
    </div>
  );
} 
