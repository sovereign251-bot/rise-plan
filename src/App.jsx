import React, { useState, useEffect, createContext, useContext } from "react";

const MobCtx = createContext(false);
function useIsMobile() { return useContext(MobCtx); }

const C = {
  rose:"#C49794",roseDark:"#a07370",blush:"#F2CFCC",
  cream:"#FFEFED",pale:"#F5F0EB",accent1:"#EBDFDD",
  accent2:"#D4BBB7",charcoal:"#494747",white:"#fff",
  gold:"#C9A84C",
};

const btn = (variant="fill",sm=false) => ({
  background: variant==="fill" ? C.rose : "transparent",
  color: variant==="fill" ? C.white : C.rose,
  border: variant==="fill" ? "none" : `1.5px solid ${C.rose}`,
  borderRadius: sm ? 20 : 30,
  padding: sm ? "5px 16px" : "11px 28px",
  cursor:"pointer", fontSize: sm ? 12 : 14,
  fontFamily:"Georgia,serif", letterSpacing:"0.02em",
  transition:"opacity 0.15s",
});
const inp = { width:"100%", padding:"10px 12px", border:`1px solid ${C.blush}`, borderRadius:8, fontSize:14, fontFamily:"Georgia,serif", background:C.white, boxSizing:"border-box", color:C.charcoal, outline:"none" };
const ta = { ...inp, resize:"vertical", minHeight:80 };
const lbl = { fontSize:11, color:C.roseDark, fontWeight:600, letterSpacing:"0.1em", textTransform:"uppercase", display:"block", marginBottom:5 };
const card = { background:C.white, borderRadius:20, boxShadow:"0 4px 20px rgba(196,151,148,0.10)", padding:"1.5rem", marginBottom:"1rem" };
const aiBox = { background:C.cream, border:`1px solid ${C.blush}`, borderLeft:`3px solid ${C.rose}`, borderRadius:12, padding:"1.25rem 1.5rem", fontSize:14, lineHeight:1.8, color:C.charcoal, whiteSpace:"pre-wrap", marginTop:"1rem" };

const chip = (active) => ({
  display:"inline-block", padding:"6px 16px", borderRadius:20,
  border:`1px solid ${active ? C.rose : C.blush}`,
  background: active ? C.blush : C.white,
  color: active ? C.roseDark : C.charcoal,
  cursor:"pointer", fontSize:13, margin:"3px 4px 3px 0",
  fontFamily:"Georgia,serif", transition:"all 0.15s",
});

// ── STRIP MARKDOWN ────────────────────────────────────────────────────────────
function stripMarkdown(text) {
  if (!text) return "";
  return text
    .replace(/\*\*\*(.+?)\*\*\*/g, '$1')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*([^*\n]+?)\*/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/`(.+?)`/g, '$1')
    .replace(/_{2}(.+?)_{2}/g, '$1')
    .replace(/_([^_\n]+?)_/g, '$1')
    .trim();
}

function Spinner() {
  return (
    <div style={{display:"flex",alignItems:"center",gap:8,color:C.rose,fontSize:13,margin:"1rem 0"}}>
      <div style={{width:14,height:14,border:`2px solid ${C.blush}`,borderTop:`2px solid ${C.rose}`,borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>
      Generating your personalized response...
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

// ── NUDGE BOX ─────────────────────────────────────────────────────────────────
function NudgeBox({id, label, context, nudges, onNudge}) {
  const n = nudges[id] || {};
  return (
    <div style={{marginBottom:6}}>
      <button
        onClick={() => onNudge(id, label, context)}
        style={{
          background:"transparent",
          border:`1px dashed ${C.rose}`,
          color:C.rose, borderRadius:20,
          padding:"3px 12px", fontSize:11,
          cursor:"pointer", fontFamily:"Georgia,serif",
          letterSpacing:"0.03em",
          opacity: n.loading ? 0.6 : 1,
        }}
        disabled={n.loading}
      >
        💭 Help me think
      </button>
      {n.loading && (
        <div style={{fontSize:12,color:C.rose,marginTop:4,fontStyle:"italic"}}>Thinking...</div>
      )}
      {n.result && (
        <div style={{
          background:C.cream, borderLeft:`3px solid ${C.gold}`,
          borderRadius:8, padding:"10px 14px",
          marginTop:6, fontSize:12,
          color:C.charcoal, lineHeight:1.8
        }}>
          <div style={{fontSize:10,color:C.gold,letterSpacing:"0.1em",marginBottom:4,fontWeight:600}}>💭 NUDGE</div>
          {stripMarkdown(n.result)}
        </div>
      )}
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

async function callClaude(sys, prompt, maxTokens=1000){
  try{
    const res=await fetch("/api/claude",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({model:"claude-sonnet-4-6",max_tokens:maxTokens,system:sys,messages:[{role:"user",content:prompt}]}),
    });
    const d=await res.json();
    return d.content?.map(b=>b.text||"").join("")||"Something went wrong. Please try again.";
  }catch{return"Error connecting to AI. Please try again.";}
}

async function getNudge(fieldId, fieldLabel, context, setNudges) {
  setNudges(prev => ({...prev, [fieldId]: {loading: true, result: ""}}));
  const r = await callClaude(
    `You are a warm, practical coach for the RISE framework helping a divorced nurse mom build a digital business. She's stuck filling in a specific field. Either ask her 3 short specific questions to spark her thinking, OR give her 3-4 concrete real examples from nursing/healthcare backgrounds to get her started. Be specific, not generic. Max 150 words.`,
    `Field she is filling in: "${fieldLabel}"\nContext: ${context || "She is a nurse building her first digital product"}`
  );
  setNudges(prev => ({...prev, [fieldId]: {loading: false, result: r}}));
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

function ToolGrid({tools,active,onSelect}){
  const isMobile=useIsMobile();
  return(
    <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:10,marginBottom:"1.5rem"}}>
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

// ── AUTH FORM ─────────────────────────────────────────────────────────────────
function AuthForm({onLogin,defaultMode="signup"}){
  const[mode,setMode]=useState(defaultMode);
  const[email,setEmail]=useState("");const[pw,setPw]=useState("");const[name,setName]=useState("");
  const[err,setErr]=useState("");const[loading,setLoading]=useState(false);

  async function submit(e){
    if(e)e.preventDefault();
    setErr("");
    if(!email||!pw)return setErr("Please enter your email and password.");
    if(mode==="signup"&&!name)return setErr("Please enter your name.");
    setLoading(true);
    try{
      const res=await fetch("/api/auth",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({action:mode,name,email,password:pw}),
      });
      const data=await res.json();
      if(!res.ok){setErr(data.error||"Something went wrong.");setLoading(false);return;}
      localStorage.setItem("rise_current_user",data.user.email);
      localStorage.setItem(`rise_name_${data.user.email}`,data.user.name);
      onLogin(data.user);
    }catch{
      setErr("Error connecting. Please try again.");
    }
    setLoading(false);
  }

  return(
    <div style={{...card,boxShadow:"0 8px 40px rgba(196,151,148,0.22)",maxWidth:440,margin:"0 auto",background:C.white}}>
      <div style={{textAlign:"center",marginBottom:"1.5rem"}}>
        <div style={{fontStyle:"italic",fontSize:13,color:C.rose,letterSpacing:"0.1em",marginBottom:4}}>purely empowered</div>
        <div style={{fontSize:44,fontFamily:"Georgia,serif",color:C.rose,letterSpacing:"0.18em",lineHeight:1}}>RISE</div>
        <div style={{fontSize:11,letterSpacing:"0.28em",color:C.charcoal,marginTop:4}}>PLAN</div>
      </div>
      <div style={{display:"flex",gap:8,marginBottom:"1.5rem"}}>
        {[["signup","Join — founding rate →"],["login","Already a member"]].map(([m,label])=>(
          <button key={m} type="button" style={m===mode?btn("fill"):btn("out")} onClick={()=>{setMode(m);setErr("");}}>
            {label}
          </button>
        ))}
      </div>
      <form onSubmit={submit} autoComplete="on">
        {mode==="signup"&&<F label="Your name"><input style={inp} name="name" autoComplete="name" value={name} onChange={e=>setName(e.target.value)} placeholder="First name"/></F>}
        <F label="Email"><input style={inp} type="email" name="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@email.com"/></F>
        <F label="Password"><input style={inp} type="password" name="password" autoComplete={mode==="signup"?"new-password":"current-password"} value={pw} onChange={e=>setPw(e.target.value)} placeholder={mode==="signup"?"Choose a password":"Your password"}/></F>
        {err&&<p style={{color:"#c0392b",fontSize:13,margin:"0 0 10px"}}>{err}</p>}
        <button type="submit" disabled={loading} style={{...btn("fill"),width:"100%",marginTop:8,padding:"13px",opacity:loading?0.7:1,fontSize:15}}>
          {loading?"Please wait...":mode==="login"?"Enter my dashboard →":"Claim my founding rate →"}
        </button>
      </form>
      {mode==="signup"&&<p style={{fontSize:11,color:"#bbb",textAlign:"center",marginTop:12,marginBottom:0}}>$27/month · Cancel anytime · No contracts</p>}
    </div>
  );
}

// ── LANDING PAGE ──────────────────────────────────────────────────────────────
function LandingPage({onLogin}){
  const isMobile=useIsMobile();
  const[openFaq,setOpenFaq]=useState(null);
  const scrollTo=()=>document.getElementById("pe-join")?.scrollIntoView({behavior:"smooth"});

  const forYou=[
    {icon:"💔",text:"You feel like you lost yourself somewhere in the marriage — and you're not sure who you are anymore"},
    {icon:"💸",text:"You want financial independence. Something that's actually yours — not tied to a paycheck or a partner"},
    {icon:"📱",text:"You see other women building businesses online and think 'I could do that' — but you don't know where to start"},
    {icon:"⏰",text:"You're balancing work, kids, and a fresh start — and you need a plan that fits your real life"},
  ];

  const phases=[
    {letter:"R",name:"Reclaim",grad:"linear-gradient(135deg,#6b5a59,#a07370)",desc:"Reconnect with who you actually are — separate from the marriage. This is where it all starts."},
    {letter:"I",name:"Install",grad:"linear-gradient(135deg,#494747,#7a6560)",desc:"Map your finances, build your offer, and install the real foundation of your business."},
    {letter:"S",name:"Sustain",grad:"linear-gradient(135deg,#7a6560,#C49794)",desc:"Create content that sounds like you and builds an audience — without being online 24/7."},
    {letter:"E",name:"Expand",grad:"linear-gradient(135deg,#5a4f4e,#9a7a77)",desc:"With stability beneath you, build the life that's entirely, unapologetically yours."},
  ];

  const tools=[
    {icon:"🧠",name:"Identity Clarity",desc:"AI-guided questions to separate who you were from who you're becoming"},
    {icon:"💰",name:"Financial Blueprint",desc:"Map your income gap and build a pricing strategy for your offer"},
    {icon:"✍️",name:"Content Studio",desc:"Generate hooks, captions, and reel scripts in your voice — single posts or a full month"},
    {icon:"📅",name:"30-Day Calendar",desc:"A complete content plan built around your niche, audience, and goals"},
    {icon:"✨",name:"Brand Kit",desc:"Your voice, niche, and visual identity — all defined in one session"},
    {icon:"📂",name:"Your Library",desc:"Every piece of content you create is auto-saved and ready to copy-paste"},
  ];

  const steps=[
    {n:"01",title:"Tell the AI about you",desc:"Answer a few guided questions. The platform learns your story, your skills, and where you're starting."},
    {n:"02",title:"Get your personalized plan",desc:"The RISE method maps to your exact situation — clarity on your offer, your content, and your next move."},
    {n:"03",title:"Build, post, and grow",desc:"Use the tools daily or weekly. Your business grows alongside your life — not instead of it."},
  ];

  const foundingFeatures=["Full access to all 4 RISE phases","AI Content Studio + 30-Day Calendar","Brand Kit & identity tools","Library that auto-saves everything you create","Founding member rate locked in forever"];
  const stdFeatures=["Full access to all 4 RISE phases","AI Content Studio + 30-Day Calendar","Brand Kit & identity tools","Library that auto-saves everything you create"];

  const faqs=[
    {q:"What if I have no idea what kind of business to build?",a:"That's exactly what this is for. The Reclaim and Install phases walk you through discovering your offer from your own story, skills, and experience — you don't need to come in with an idea."},
    {q:"Will I actually have time for this with everything I'm managing?",a:"The tools are built for 20–30 minute sessions. You don't need to be online constantly — you build in the pockets of time you actually have."},
    {q:"Is this only for nurses?",a:"No — it's for any woman rebuilding after divorce who wants financial independence. The platform is built around your real life, wherever you're starting from."},
    {q:"What if I join and it's not for me?",a:"Cancel anytime. No contracts, no questions, no hard feelings. Your founding rate is locked in for as long as you stay."},
    {q:"What happens after the founding 50 spots are gone?",a:"The price moves to $67/month. Your founding rate of $27/month stays locked in forever — as long as you remain a member."},
  ];

  return(
    <div style={{background:C.pale,fontFamily:"Georgia,serif",color:C.charcoal}}>

      {/* NAV */}
      <div style={{position:"sticky",top:0,zIndex:100,background:"rgba(245,240,235,0.94)",backdropFilter:"blur(14px)",borderBottom:`1px solid ${C.blush}`}}>
        <div style={{maxWidth:920,margin:"0 auto",padding:"0 1.5rem",display:"flex",justifyContent:"space-between",alignItems:"center",height:54}}>
          <div>
            <span style={{fontStyle:"italic",color:C.rose,fontSize:14,letterSpacing:"0.06em"}}>purely empowered</span>
            <span style={{color:C.accent2,fontSize:11,marginLeft:8,letterSpacing:"0.08em"}}>by Paulina Patrick</span>
          </div>
          <button onClick={scrollTo} style={{...btn("fill",true),fontSize:12}}>Get started →</button>
        </div>
      </div>

      {/* HERO */}
      <div style={{background:`linear-gradient(160deg,${C.charcoal} 0%,#5a4542 60%,#7a6058 100%)`,padding:isMobile?"4.5rem 1.5rem 5.5rem":"6.5rem 2rem 8rem",textAlign:"center",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:"8%",left:"4%",width:220,height:220,borderRadius:"50%",background:"rgba(242,207,204,0.05)"}}/>
        <div style={{position:"absolute",bottom:"-5%",right:"3%",width:320,height:320,borderRadius:"50%",background:"rgba(196,151,148,0.06)"}}/>
        <div style={{position:"relative",maxWidth:700,margin:"0 auto"}}>
          <p style={{fontStyle:"italic",color:C.rose,fontSize:15,letterSpacing:"0.12em",marginBottom:20}}>purely empowered</p>
          <h1 style={{fontSize:isMobile?34:54,color:C.white,fontWeight:400,lineHeight:1.18,margin:"0 0 1.25rem",letterSpacing:"-0.01em"}}>
            The divorce was chapter one.<br/>
            <span style={{color:C.blush}}>This is chapter two.</span>
          </h1>
          <p style={{fontSize:isMobile?15:17,color:C.accent2,lineHeight:1.8,maxWidth:520,margin:"0 auto 2.25rem"}}>
            An AI-powered coaching platform built for women rebuilding after divorce — find your offer, build your brand, and create content that grows your income.
          </p>
          <div style={{display:"inline-flex",flexDirection:"column",alignItems:"center",gap:14}}>
            <button onClick={scrollTo} style={{...btn("fill"),fontSize:16,padding:"15px 38px",background:`linear-gradient(135deg,${C.rose},${C.roseDark})`,boxShadow:`0 10px 30px rgba(196,151,148,0.38)`}}>
              Start building my next chapter →
            </button>
            <div style={{background:"rgba(201,168,76,0.14)",border:`1px solid rgba(201,168,76,0.4)`,borderRadius:30,padding:"7px 20px",display:"inline-flex",alignItems:"center",gap:8}}>
              <div style={{width:7,height:7,borderRadius:"50%",background:C.gold,flexShrink:0}}/>
              <span style={{fontSize:12,color:C.gold,letterSpacing:"0.07em"}}>Founding rate: $27/month · First 50 members only</span>
            </div>
          </div>
        </div>
      </div>

      {/* FOR YOU IF */}
      <div style={{maxWidth:880,margin:"0 auto",padding:isMobile?"3.5rem 1.25rem":"5rem 2rem"}}>
        <p style={{fontSize:10,color:C.roseDark,letterSpacing:"0.2em",fontWeight:700,textTransform:"uppercase",marginBottom:10,textAlign:"center"}}>this is for you</p>
        <h2 style={{fontSize:isMobile?24:32,textAlign:"center",fontWeight:400,margin:"0 0 2.5rem",lineHeight:1.35}}>If any of this sounds familiar...</h2>
        <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:14}}>
          {forYou.map((item,i)=>(
            <div key={i} style={{background:C.white,borderRadius:18,padding:"1.5rem",display:"flex",gap:14,alignItems:"flex-start",boxShadow:"0 2px 16px rgba(196,151,148,0.08)"}}>
              <div style={{fontSize:26,flexShrink:0,marginTop:2}}>{item.icon}</div>
              <p style={{fontSize:14,lineHeight:1.75,margin:0,color:C.charcoal}}>{item.text}</p>
            </div>
          ))}
        </div>
        <p style={{textAlign:"center",fontSize:16,fontStyle:"italic",color:C.rose,marginTop:"2.5rem",marginBottom:0}}>Then you are exactly in the right place.</p>
      </div>

      {/* RISE METHOD */}
      <div style={{background:C.white,padding:isMobile?"3.5rem 1.25rem":"5rem 2rem"}}>
        <div style={{maxWidth:880,margin:"0 auto"}}>
          <p style={{fontSize:10,color:C.roseDark,letterSpacing:"0.2em",fontWeight:700,textTransform:"uppercase",marginBottom:10,textAlign:"center"}}>the method</p>
          <h2 style={{fontSize:isMobile?24:32,textAlign:"center",fontWeight:400,margin:"0 0 6px",lineHeight:1.35}}>The RISE Method</h2>
          <p style={{textAlign:"center",color:"#aaa",fontSize:14,marginBottom:"2.5rem",lineHeight:1.6}}>Four phases. One clear path. Built around your real life.</p>
          <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr 1fr":"1fr 1fr 1fr 1fr",gap:14}}>
            {phases.map(p=>(
              <div key={p.letter} style={{background:p.grad,borderRadius:20,padding:"1.5rem 1.25rem",color:C.white,minHeight:190,display:"flex",flexDirection:"column",justifyContent:"space-between"}}>
                <div style={{width:32,height:32,borderRadius:"50%",background:"rgba(255,255,255,0.18)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,marginBottom:10}}>{p.letter}</div>
                <div>
                  <div style={{fontWeight:600,fontSize:15,marginBottom:6}}>{p.name}</div>
                  <div style={{fontSize:11,color:"rgba(255,255,255,0.72)",lineHeight:1.65}}>{p.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* WHAT'S INSIDE */}
      <div style={{maxWidth:880,margin:"0 auto",padding:isMobile?"3.5rem 1.25rem":"5rem 2rem"}}>
        <p style={{fontSize:10,color:C.roseDark,letterSpacing:"0.2em",fontWeight:700,textTransform:"uppercase",marginBottom:10,textAlign:"center"}}>what you get</p>
        <h2 style={{fontSize:isMobile?24:32,textAlign:"center",fontWeight:400,margin:"0 0 2.5rem",lineHeight:1.35}}>Everything you need — in one place</h2>
        <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr 1fr":"1fr 1fr 1fr",gap:14}}>
          {tools.map((t,i)=>(
            <div key={i} style={{background:C.white,borderRadius:18,padding:"1.5rem",boxShadow:"0 2px 16px rgba(196,151,148,0.08)"}}>
              <div style={{fontSize:28,marginBottom:10}}>{t.icon}</div>
              <div style={{fontWeight:600,fontSize:14,marginBottom:6,color:C.charcoal}}>{t.name}</div>
              <div style={{fontSize:12,color:"#aaa",lineHeight:1.65}}>{t.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div style={{background:`linear-gradient(135deg,${C.cream},${C.blush})`,padding:isMobile?"3.5rem 1.25rem":"5rem 2rem"}}>
        <div style={{maxWidth:880,margin:"0 auto"}}>
          <p style={{fontSize:10,color:C.roseDark,letterSpacing:"0.2em",fontWeight:700,textTransform:"uppercase",marginBottom:10,textAlign:"center"}}>simple steps</p>
          <h2 style={{fontSize:isMobile?24:32,textAlign:"center",fontWeight:400,margin:"0 0 2.5rem",lineHeight:1.35}}>From "I don't know where to start" to building</h2>
          <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr 1fr",gap:18}}>
            {steps.map((s,i)=>(
              <div key={i} style={{background:C.white,borderRadius:20,padding:"2rem 1.5rem",textAlign:"center",boxShadow:"0 4px 20px rgba(196,151,148,0.10)"}}>
                <div style={{fontSize:11,color:C.rose,letterSpacing:"0.22em",fontWeight:700,marginBottom:10}}>{s.n}</div>
                <div style={{fontWeight:600,fontSize:15,color:C.charcoal,marginBottom:10}}>{s.title}</div>
                <div style={{fontSize:12,color:"#aaa",lineHeight:1.75}}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FOUNDER'S NOTE */}
      <div style={{maxWidth:660,margin:"0 auto",padding:isMobile?"3.5rem 1.25rem":"5rem 2rem",textAlign:"center"}}>
        <p style={{fontSize:10,color:C.roseDark,letterSpacing:"0.2em",fontWeight:700,textTransform:"uppercase",marginBottom:10}}>from paulina</p>
        <h2 style={{fontSize:isMobile?22:28,fontWeight:400,margin:"0 0 1.5rem",lineHeight:1.4}}>I built this because I needed it</h2>
        <div style={{...card,textAlign:"left",fontSize:14,lineHeight:1.95,color:"#777",border:`1px solid ${C.blush}`}}>
          <p style={{marginTop:0}}>"I know what it's like to sit in the quiet after everything changes — and wonder what's next. To want to build something, but not know where to begin. To feel like you're starting over, but without a map."</p>
          <p>"RISE Plan is the map I wish I'd had. Every tool inside it was built with women like us in mind — the ones balancing everything, rebuilding everything, and quietly becoming someone who surprises herself."</p>
          <p style={{marginBottom:0,fontStyle:"italic",color:C.rose}}>— Paulina Patrick, founder of Purely Empowered</p>
        </div>
      </div>

      {/* PRICING */}
      <div style={{background:C.white,padding:isMobile?"3.5rem 1.25rem":"5rem 2rem"}}>
        <div style={{maxWidth:740,margin:"0 auto"}}>
          <p style={{fontSize:10,color:C.roseDark,letterSpacing:"0.2em",fontWeight:700,textTransform:"uppercase",marginBottom:10,textAlign:"center"}}>pricing</p>
          <h2 style={{fontSize:isMobile?24:32,textAlign:"center",fontWeight:400,margin:"0 0 6px"}}>One membership. Every tool.</h2>
          <p style={{textAlign:"center",color:"#aaa",fontSize:14,marginBottom:"2.5rem"}}>No contracts. Cancel anytime.</p>
          <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:16,alignItems:"start"}}>
            <div style={{borderRadius:24,border:`2px solid ${C.rose}`,padding:"2rem",position:"relative",background:C.cream}}>
              <div style={{position:"absolute",top:-14,left:"50%",transform:"translateX(-50%)",background:C.rose,color:C.white,fontSize:11,fontWeight:700,letterSpacing:"0.08em",padding:"4px 18px",borderRadius:20,whiteSpace:"nowrap"}}>🌱 FOUNDING MEMBER</div>
              <div style={{marginTop:"1rem"}}>
                <div style={{display:"flex",alignItems:"flex-end",gap:4,marginBottom:4}}>
                  <span style={{fontSize:44,fontWeight:400,color:C.charcoal,lineHeight:1}}>$27</span>
                  <span style={{fontSize:15,color:"#aaa",paddingBottom:4}}>/month</span>
                </div>
                <div style={{fontSize:11,color:C.rose,letterSpacing:"0.06em",marginBottom:"1.5rem"}}>First 50 members · locked in forever</div>
              </div>
              {foundingFeatures.map((f,i)=>(
                <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start",marginBottom:10}}>
                  <div style={{width:18,height:18,borderRadius:"50%",background:C.blush,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:C.roseDark,flexShrink:0,marginTop:2}}>✓</div>
                  <span style={{fontSize:13,lineHeight:1.5,color:C.charcoal}}>{f}</span>
                </div>
              ))}
              <button onClick={scrollTo} style={{...btn("fill"),width:"100%",marginTop:"1.5rem",padding:"13px",fontSize:15}}>Claim founding rate →</button>
            </div>
            <div style={{borderRadius:24,border:`1.5px solid ${C.blush}`,padding:"2rem",background:C.pale}}>
              <div style={{marginTop:"1rem"}}>
                <div style={{display:"flex",alignItems:"flex-end",gap:4,marginBottom:4}}>
                  <span style={{fontSize:44,fontWeight:400,color:"#bbb",lineHeight:1}}>$67</span>
                  <span style={{fontSize:15,color:"#ccc",paddingBottom:4}}>/month</span>
                </div>
                <div style={{fontSize:11,color:"#ccc",marginBottom:"1.5rem"}}>Standard rate · after founding spots fill</div>
              </div>
              {stdFeatures.map((f,i)=>(
                <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start",marginBottom:10}}>
                  <div style={{width:18,height:18,borderRadius:"50%",background:C.accent1,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:"#bbb",flexShrink:0,marginTop:2}}>✓</div>
                  <span style={{fontSize:13,color:"#bbb",lineHeight:1.5}}>{f}</span>
                </div>
              ))}
              <button onClick={scrollTo} style={{...btn("out"),width:"100%",marginTop:"1.5rem",padding:"13px",fontSize:14,opacity:0.6}}>Join at standard rate</button>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div style={{maxWidth:680,margin:"0 auto",padding:isMobile?"3.5rem 1.25rem":"5rem 2rem"}}>
        <p style={{fontSize:10,color:C.roseDark,letterSpacing:"0.2em",fontWeight:700,textTransform:"uppercase",marginBottom:10,textAlign:"center"}}>questions answered</p>
        <h2 style={{fontSize:isMobile?24:30,textAlign:"center",fontWeight:400,margin:"0 0 2rem"}}>Before you decide</h2>
        {faqs.map((faq,i)=>(
          <div key={i} style={{borderBottom:`1px solid ${C.blush}`}}>
            <div onClick={()=>setOpenFaq(openFaq===i?null:i)} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"1.1rem 0",cursor:"pointer"}}>
              <span style={{fontSize:14,fontWeight:600,color:C.charcoal,lineHeight:1.4,paddingRight:16}}>{faq.q}</span>
              <div style={{fontSize:20,color:C.rose,flexShrink:0,transition:"transform 0.2s",transform:openFaq===i?"rotate(180deg)":"none"}}>▾</div>
            </div>
            {openFaq===i&&<p style={{fontSize:13,color:"#888",lineHeight:1.85,margin:"0 0 1.1rem",paddingRight:16}}>{faq.a}</p>}
          </div>
        ))}
      </div>

      {/* JOIN / AUTH */}
      <div id="pe-join" style={{background:`linear-gradient(160deg,${C.charcoal} 0%,#5a4542 100%)`,padding:isMobile?"3.5rem 1.25rem 5rem":"5rem 2rem 7rem",textAlign:"center"}}>
        <p style={{fontStyle:"italic",color:C.rose,fontSize:14,marginBottom:10,letterSpacing:"0.08em"}}>your next chapter starts now</p>
        <h2 style={{fontSize:isMobile?26:36,color:C.white,fontWeight:400,margin:"0 0 8px",lineHeight:1.3}}>You've rebuilt yourself before.</h2>
        <p style={{fontSize:16,color:C.accent2,marginBottom:"2.5rem",lineHeight:1.6}}>This time, you get to build something.</p>
        <AuthForm onLogin={onLogin}/>
        <p style={{fontSize:11,color:"rgba(255,255,255,0.25)",marginTop:"1.5rem",marginBottom:0}}>$27/month · Cancel anytime · No contracts</p>
      </div>

    </div>
  );
}

// ── HOME ──────────────────────────────────────────────────────────────────────
function HomeTab({user,data,setNav,saved}){
  const isMobile=useIsMobile();
  const firstName=user.name.split(" ")[0];
  const phases=[
    {id:"reclaim",letter:"R",name:"Reclaim",desc:"Separate who you had to become from who you are choosing to become.",check:data.reclaimResult,grad:"linear-gradient(135deg,#6b5a59 0%,#8a6d6a 60%,#a07370 100%)",accent:"#e8c4c0"},
    {id:"install",letter:"I",name:"Install",desc:"Face your full financial picture and build your product plan.",check:data.installResult,grad:"linear-gradient(135deg,#494747 0%,#6b5a59 60%,#7a6560 100%)",accent:"#d4bbb7"},
    {id:"sustain",letter:"S",name:"Sustain",desc:"Build habits, content, and brand for lasting stability.",check:data.sustainResult,grad:"linear-gradient(135deg,#7a6560 0%,#a07370 60%,#C49794 100%)",accent:"#f2cfcc"},
    {id:"expand",letter:"E",name:"Expand",desc:"With stability beneath you, build the life fully yours.",check:data.expandResult,grad:"linear-gradient(135deg,#5a4f4e 0%,#7a6560 60%,#9a7a77 100%)",accent:"#ebdfdd"},
  ];
  const done=phases.filter(p=>p.check).length;
  const pct=Math.round((done/4)*100);

  const powerTools=[
    {id:"power",label:"Content Studio",icon:"✍",badge:"fan fav"},
    {id:"power",label:"Story & Voice",icon:"🎙",badge:null},
    {id:"power",label:"Idea Generator",icon:"💡",badge:null},
    {id:"reclaim",label:"Price Calculator",icon:"$",badge:null},
    {id:"pinterest",label:"Pinterest",icon:"📌",badge:null},
    {id:"library",label:`Library${saved.length>0?` (${saved.length})`:""}`,icon:"📂",badge:null},
  ];

  const [startPath,setStartPath]=useState(()=>{try{return localStorage.getItem(`sp_${user.email}`)||null;}catch{return null;}});
  const [startOpen,setStartOpen]=useState(()=>{try{const v=localStorage.getItem(`so_${user.email}`);return v!==null?v==="1":done===0;}catch{return done===0;}});
  const toggleOpen=(v)=>{setStartOpen(v);try{localStorage.setItem(`so_${user.email}`,v?"1":"0");}catch{}};
  const choosePath=(p)=>{setStartPath(p);try{if(p)localStorage.setItem(`sp_${user.email}`,p);else localStorage.removeItem(`sp_${user.email}`);}catch{}};
  const noIdeaSteps=[
    {name:"Reclaim Your Identity",desc:"Clarity on who you are now",nav:"reclaim",isDone:!!data.reclaimResult},
    {name:"Brand Kit",desc:"Your niche, voice & visual identity",nav:"install",isDone:!!data.installResult},
    {name:"Idea Generator",desc:"Explore content angles & offers",nav:"install",isDone:!!data.installResult},
    {name:"Product Builder",desc:"Design your signature offer",nav:"install",isDone:!!data.installResult},
    {name:"Content Studio",desc:"Create single posts & content",nav:"sustain",isDone:!!data.sustainResult},
    {name:"30-Day Calendar",desc:"Plan a full month of content",nav:"sustain",isDone:!!data.sustainResult},
  ];
  const haveIdeaSteps=[
    {name:"Product Builder",desc:"Define & price your offer",nav:"install",isDone:!!data.installResult},
    {name:"Brand Kit",desc:"Your niche, voice & visual identity",nav:"install",isDone:!!data.installResult},
    {name:"Content Studio",desc:"Create single posts & content",nav:"sustain",isDone:!!data.sustainResult},
    {name:"30-Day Calendar",desc:"Plan a full month of content",nav:"sustain",isDone:!!data.sustainResult},
    {name:"Reclaim Your Identity",desc:"Optional deep-dive on identity",nav:"reclaim",isDone:!!data.reclaimResult,optional:true},
  ];

  return(
    <div>
      {/* ── HERO ── */}
      <div style={{background:`linear-gradient(135deg,${C.charcoal} 0%,#6b5a59 100%)`,borderRadius:24,padding:isMobile?"1.75rem 1.5rem":"2.25rem 2rem",marginBottom:"1.25rem",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",right:-30,top:-30,width:180,height:180,borderRadius:"50%",background:"rgba(242,207,204,0.07)"}}/>
        <div style={{position:"absolute",right:50,bottom:-40,width:120,height:120,borderRadius:"50%",background:"rgba(196,151,148,0.09)"}}/>
        <div style={{position:"absolute",left:"45%",top:16,fontSize:10,color:C.gold,opacity:0.5}}>✦</div>
        <div style={{position:"absolute",right:30,top:20,fontSize:14,color:C.gold,opacity:0.4}}>✦</div>
        <p style={{fontSize:13,color:C.accent2,letterSpacing:"0.1em",margin:"0 0 4px",fontStyle:"italic",fontFamily:"Georgia,serif"}}>welcome back,</p>
        <h2 style={{fontSize:isMobile?32:40,color:C.white,fontWeight:400,margin:"0 0 8px",fontFamily:"Georgia,serif",lineHeight:1.1}}>{firstName}</h2>
        <p style={{color:C.accent2,fontSize:13,margin:"0 0 1.5rem",lineHeight:1.6,maxWidth:340}}>Your RISE journey is underway. Keep going — she's waiting for you.</p>
        <div style={{background:"rgba(255,255,255,0.12)",borderRadius:10,height:6,marginBottom:8,overflow:"hidden"}}>
          <div style={{background:`linear-gradient(90deg,${C.blush},${C.rose})`,height:"100%",width:`${pct||4}%`,borderRadius:10,transition:"width 0.8s ease"}}/>
        </div>
        <p style={{fontSize:11,color:C.accent2,margin:0,letterSpacing:"0.05em"}}>{done} of 4 phases activated — {pct}% complete</p>
      </div>

      {/* ── START HERE ── */}
      <div style={{...card,marginBottom:"1.25rem",border:`1px solid ${C.blush}`,padding:"1.25rem"}}>
        <div onClick={()=>toggleOpen(!startOpen)} style={{display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer"}}>
          <div>
            <div style={{fontSize:10,color:C.roseDark,letterSpacing:"0.15em",fontWeight:700,textTransform:"uppercase",marginBottom:2}}>Start Here</div>
            <div style={{fontSize:13,color:C.charcoal,lineHeight:1.4}}>{startPath?(startPath==="no-idea"?"🌱 No idea yet — your path":"💡 Have an idea — your path"):"Not sure where to begin? Pick your path."}</div>
          </div>
          <div style={{fontSize:20,color:C.rose,transition:"transform 0.2s",transform:startOpen?"rotate(180deg)":"rotate(0deg)",marginLeft:12,flexShrink:0}}>▾</div>
        </div>
        {startOpen&&(
          <div style={{marginTop:16}}>
            {!startPath&&(
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div onClick={()=>choosePath("no-idea")} style={{background:C.cream,borderRadius:16,padding:"1.25rem 1rem",cursor:"pointer",border:`1.5px solid ${C.blush}`,textAlign:"center",transition:"opacity 0.15s"}}>
                  <div style={{fontSize:30,marginBottom:8}}>🌱</div>
                  <div style={{fontFamily:"Georgia,serif",fontSize:14,color:C.charcoal,fontWeight:600,marginBottom:6}}>No idea yet</div>
                  <div style={{fontSize:11,color:"#999",lineHeight:1.5}}>Discover your niche, offer & content from scratch</div>
                </div>
                <div onClick={()=>choosePath("have-idea")} style={{background:C.cream,borderRadius:16,padding:"1.25rem 1rem",cursor:"pointer",border:`1.5px solid ${C.blush}`,textAlign:"center",transition:"opacity 0.15s"}}>
                  <div style={{fontSize:30,marginBottom:8}}>💡</div>
                  <div style={{fontFamily:"Georgia,serif",fontSize:14,color:C.charcoal,fontWeight:600,marginBottom:6}}>Have an idea</div>
                  <div style={{fontSize:11,color:"#999",lineHeight:1.5}}>You know what you want — let's build it out</div>
                </div>
              </div>
            )}
            {startPath&&(
              <div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                  <div style={{fontSize:12,color:"#999"}}>Tap any step to jump there</div>
                  <button onClick={e=>{e.stopPropagation();choosePath(null);}} style={{background:"transparent",border:`1px solid ${C.blush}`,borderRadius:20,padding:"4px 12px",fontSize:11,color:C.rose,cursor:"pointer",fontFamily:"Georgia,serif"}}>Switch path</button>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {(startPath==="no-idea"?noIdeaSteps:haveIdeaSteps).map((step,i)=>(
                    <div key={i} onClick={()=>setNav(step.nav)} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",borderRadius:12,background:step.isDone?C.cream:C.pale,border:`1px solid ${step.isDone?C.blush:"rgba(196,151,148,0.15)"}`,cursor:"pointer"}}>
                      <div style={{width:24,height:24,borderRadius:"50%",flexShrink:0,background:step.isDone?C.rose:C.accent1,color:step.isDone?C.white:C.roseDark,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700}}>{step.isDone?"✓":i+1}</div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:13,fontWeight:600,color:C.charcoal}}>{step.name}</div>
                        <div style={{fontSize:10,color:"#aaa",marginTop:1}}>{step.desc}</div>
                      </div>
                      {step.optional&&<div style={{fontSize:10,color:C.rose,borderRadius:10,padding:"2px 8px",background:C.blush,flexShrink:0}}>optional</div>}
                      <div style={{fontSize:13,color:C.rose,flexShrink:0}}>→</div>
                    </div>
                  ))}
                </div>
                <p onClick={()=>toggleOpen(false)} style={{fontSize:11,color:"#ccc",textAlign:"center",cursor:"pointer",margin:"14px 0 0"}}>Got it, hide this guide</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── PHASE CARDS ── */}
      <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr 1fr":"1fr 1fr",gap:12,marginBottom:"1.25rem"}}>
        {phases.map(p=>(
          <div key={p.id} onClick={()=>setNav(p.id)} style={{background:p.grad,borderRadius:20,padding:"1.5rem 1.25rem",cursor:"pointer",position:"relative",overflow:"hidden",minHeight:140,display:"flex",flexDirection:"column",justifyContent:"space-between",transition:"transform 0.15s, box-shadow 0.15s",boxShadow:"0 6px 24px rgba(73,71,71,0.18)"}}>
            <div style={{position:"absolute",right:-20,bottom:-20,width:90,height:90,borderRadius:"50%",background:"rgba(255,255,255,0.06)"}}/>
            {/* frosted glass badge */}
            <div style={{display:"inline-flex",alignItems:"center",gap:6,background:"rgba(255,255,255,0.15)",backdropFilter:"blur(6px)",borderRadius:30,padding:"4px 12px",width:"fit-content",marginBottom:8}}>
              <div style={{width:18,height:18,borderRadius:"50%",background:p.check?"rgba(255,255,255,0.9)":"rgba(255,255,255,0.25)",color:p.check?p.grad.includes("C49794")?C.roseDark:"#6b5a59":"rgba(255,255,255,0.9)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,flexShrink:0}}>{p.check?"✓":p.letter}</div>
              <span style={{fontSize:11,color:"rgba(255,255,255,0.9)",letterSpacing:"0.06em",fontWeight:600}}>{p.name}</span>
            </div>
            <div>
              <p style={{fontSize:11,color:"rgba(255,255,255,0.7)",lineHeight:1.5,margin:"0 0 12px",maxWidth:140}}>{p.desc}</p>
              <div style={{display:"inline-flex",alignItems:"center",gap:4,background:"rgba(255,255,255,0.18)",borderRadius:20,padding:"5px 14px",fontSize:12,color:"rgba(255,255,255,0.95)",fontFamily:"Georgia,serif"}}>
                Open →
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── POWER TOOLS HORIZONTAL SCROLL ── */}
      <div style={{marginBottom:"1.25rem"}}>
        <div style={{fontSize:10,color:C.roseDark,letterSpacing:"0.15em",fontWeight:700,textTransform:"uppercase",marginBottom:12}}>Power Tools</div>
        <div style={{display:"flex",gap:10,overflowX:"auto",paddingBottom:8,scrollbarWidth:"none",WebkitOverflowScrolling:"touch"}}>
          <style>{`.pt-strip::-webkit-scrollbar{display:none}`}</style>
          {powerTools.map((t,i)=>(
            <div key={i} onClick={()=>setNav(t.id)} style={{flexShrink:0,width:96,cursor:"pointer",textAlign:"center"}}>
              <div style={{position:"relative",width:64,height:64,borderRadius:"50%",background:C.white,boxShadow:"0 4px 16px rgba(196,151,148,0.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,margin:"0 auto 8px"}}>
                {t.icon}
                {t.badge&&<div style={{position:"absolute",top:-4,right:-4,background:C.gold,color:C.white,fontSize:8,fontWeight:700,letterSpacing:"0.05em",borderRadius:10,padding:"2px 6px",whiteSpace:"nowrap"}}>{t.badge}</div>}
              </div>
              <div style={{fontSize:11,color:C.charcoal,fontWeight:500,lineHeight:1.3}}>{t.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── RISE JOURNEY ── */}
      <div style={{...card,marginBottom:"1.25rem"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div style={{fontSize:10,color:C.roseDark,letterSpacing:"0.15em",fontWeight:700,textTransform:"uppercase"}}>Your RISE Journey</div>
          <div style={{fontSize:11,color:C.rose}}>{pct}% complete</div>
        </div>
        <div style={{background:C.blush,borderRadius:8,height:5,marginBottom:16,overflow:"hidden"}}>
          <div style={{background:`linear-gradient(90deg,${C.rose},${C.blush})`,height:"100%",width:`${pct||2}%`,borderRadius:8,transition:"width 0.8s ease"}}/>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          {phases.map(p=>(
            <div key={p.id} onClick={()=>setNav(p.id)} style={{borderRadius:14,padding:"14px",background:p.check?C.cream:C.pale,border:`1px solid ${p.check?C.blush:"rgba(196,151,148,0.15)"}`,cursor:"pointer",position:"relative"}}>
              {!p.check&&<div style={{position:"absolute",top:10,right:12,fontSize:13,color:"#ccc"}}>🔒</div>}
              {p.check&&<div style={{position:"absolute",top:10,right:12,width:18,height:18,borderRadius:"50%",background:C.rose,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:C.white,fontWeight:700}}>✓</div>}
              <div style={{width:28,height:28,borderRadius:"50%",background:p.check?C.rose:C.accent1,color:p.check?C.white:C.roseDark,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,marginBottom:8}}>{p.letter}</div>
              <div style={{fontSize:13,fontWeight:600,color:C.charcoal,marginBottom:3}}>{p.name}</div>
              <div style={{fontSize:10,color:p.check?C.rose:"#bbb",letterSpacing:"0.04em"}}>{p.check?"Complete":"Tap to start →"}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── RECENT SAVES ── */}
      {saved.length>0&&(
        <div style={card}>
          <div style={{fontSize:10,color:C.roseDark,letterSpacing:"0.15em",fontWeight:700,textTransform:"uppercase",marginBottom:12}}>Recent Saves</div>
          {saved.slice(0,3).map((item,i)=>(
            <div key={i} style={{padding:"10px 0",borderBottom:`1px solid ${C.blush}`,fontSize:13,display:"flex",gap:10,alignItems:"flex-start"}}>
              <span style={{background:C.blush,color:C.roseDark,borderRadius:20,padding:"2px 10px",fontSize:10,whiteSpace:"nowrap",marginTop:2,fontWeight:600}}>{item.tag}</span>
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
  const isMobile=useIsMobile();
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
    setResult(r);setData(d=>({...d,reclaimResult:r}));onSave(r,"Reclaim Blueprint");setLoading(false);
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
            <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:12,marginBottom:"1rem"}}>
              <F label="Current monthly income ($)"><input style={inp} type="number" value={cf.cur||""} onChange={e=>setC("cur",e.target.value)} placeholder="e.g. 5000"/></F>
              <F label="Target monthly income ($)"><input style={inp} type="number" value={cf.tar||""} onChange={e=>setC("tar",e.target.value)} placeholder="e.g. 8000"/></F>
              <F label="Product price ($)"><input style={inp} type="number" value={cf.pr||""} onChange={e=>setC("pr",e.target.value)} placeholder="e.g. 97"/></F>
              <F label="Weeks to reach goal"><input style={inp} type="number" value={cf.wks||""} onChange={e=>setC("wks",e.target.value)} placeholder="e.g. 12"/></F>
            </div>
            {(curInc>0||tarInc>0)&&(
              <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr 1fr",gap:10,marginBottom:"1.25rem"}}>
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
          {result&&<><div style={aiBox}>{stripMarkdown(result)}</div><div style={{display:"flex",gap:8,alignItems:"center",marginTop:10}}><button style={btn("fill",true)} onClick={()=>navigator.clipboard?.writeText(stripMarkdown(result))}>Copy</button><span style={{fontSize:11,color:C.rose}}>✓ Auto-saved to library</span></div></>}
        </div>
      )}
    </div>
  );
}

// ── PRODUCT BUILDER (standalone for cleanliness) ──────────────────────────────
function ProductBuilder({data, setData, onSave}) {
  const isMobile=useIsMobile();
  const pf = data.product || {};
  const setP = (k,v) => setData(d => ({...d, product:{...d.product,[k]:v}}));
  const [phase, setPhase] = useState('form');
  const [outline, setOutline] = useState(null);
  const [outlineLoading, setOutlineLoading] = useState(false);
  const [outlineError, setOutlineError] = useState("");
  const [sectionContents, setSectionContents] = useState({});
  const [sectionLoadings, setSectionLoadings] = useState({});
  const [nudges, setNudges] = useState({});

  const fmts=["Ebook/PDF Guide","Mini-course (3–5 lessons)","Full online course (6+ modules)","Template pack","Swipe file/Resource vault","Planner/workbook","Audio series","Email course","Workshop recording","Bundle (multiple formats)","Coaching program","Membership/community","Notion template"];

  function doNudge(id, label, ctx) {
    getNudge(id, label, ctx, setNudges);
  }

  function getFormatGuide(format) {
    const f = (format||"").toLowerCase();
    if(f.includes("course")||f.includes("lesson")||f.includes("mini-course"))
      return "Write a complete lesson with: Learning Objectives, 3-5 Key Teaching Points with deep explanations, Real Examples from nursing or healthcare life, a Practical Exercise, and a Key Takeaway. This is a real course lesson.";
    if(f.includes("workbook")||f.includes("planner"))
      return "Write a complete workbook section with: Brief intro, 3-4 Reflection Prompts with space indicators, 2-3 Practical Exercises, Action Steps, and a closing affirmation. Ready to be formatted in Canva.";
    if(f.includes("email"))
      return "Write a complete email lesson: Subject line, personal story hook, main teaching point, practical tip, and a CTA. Warm and direct, like a trusted friend who gets it.";
    if(f.includes("template")||f.includes("notion"))
      return "Create the actual template content: headers, sections, prompts, instructions, and example fill-ins. Immediately usable as-is.";
    return "Write a complete chapter with: an engaging opening paragraph, 3-4 main points with depth and real examples, a practical application section, a chapter summary, and 2-3 reflection questions.";
  }

  async function generateOutline() {
    setOutlineLoading(true);
    setOutlineError("");
    const sys = `You are a digital product strategist for the RISE framework for divorced nurse moms. Create a complete product structure. Return ONLY valid JSON — no other text, no markdown, no explanation. Use this exact format: {"productName":"...","productType":"...","tagline":"...","targetAudience":"...","transformation":"...","sections":[{"id":1,"title":"...","description":"..."}]} Include 5-8 sections appropriate for the product format.`;
    const prompt = `Format: ${pf.format||"ebook"}\nProduct idea: ${pf.idea||""}\nBefore state: ${pf.before||""}\nAfter state: ${pf.after||""}\nTarget buyer: ${pf.buyer||""}\nModules outlined: ${pf.modules||""}\nQuick win: ${pf.quickwin||""}\nMisconception: ${pf.misconception||""}\nProduct name: ${pf.hasName==="Yes, I have a name"?pf.name:"(generate a name)"}`;
    const r = await callClaude(sys, prompt, 1500);
    try {
      const clean = r.replace(/```json\n?/g,'').replace(/```\n?/g,'').trim();
      const parsed = JSON.parse(clean);
      setOutline(parsed);
      setPhase('outline');
    } catch(e) {
      setOutlineError("Couldn't generate the outline. Please try again.");
    }
    setOutlineLoading(false);
  }

  async function generateSection(section) {
    setSectionLoadings(prev => ({...prev, [section.id]: true}));
    const formatGuide = getFormatGuide(pf.format);
    const sys = `You are writing section "${section.title}" for "${outline?.productName||'a digital product'}" — a ${pf.format||'digital product'} for ${outline?.targetAudience||'divorced nurse moms building digital businesses'}.

${formatGuide}

Voice: Warm, direct, empowering. Like a trusted mentor who has been through real hardship and come out the other side. Write specifically for nurses and women rebuilding after divorce. No generic filler — every sentence earns its place.

IMPORTANT: Write the COMPLETE section. This is final, publish-ready content — not an outline, not a summary, not bullet points. Full prose (or full template/lesson as required by format).`;
    const prompt = `Section: "${section.title}"\nPurpose: ${section.description}\nTransformation: From "${pf.before||'struggling'}" to "${pf.after||'thriving'}"\nContext: ${pf.modules||""} ${pf.quickwin||""}`;
    const content = await callClaude(sys, prompt, 3000);
    setSectionContents(prev => ({...prev, [section.id]: content}));
    onSave(content, `Product — ${section.title}`);
    setSectionLoadings(prev => ({...prev, [section.id]: false}));
  }

  function exportAll() {
    const generated = (outline?.sections||[]).filter(s => sectionContents[s.id]);
    if (!generated.length) return;
    const text = `${outline?.productName||"My Product"}\n${outline?.tagline||""}\n\n${"=".repeat(60)}\n\n` +
      generated.map(s => `${s.title}\n${"-".repeat(40)}\n\n${stripMarkdown(sectionContents[s.id])}`).join("\n\n" + "=".repeat(60) + "\n\n");
    navigator.clipboard?.writeText(text).then(() => alert("All sections copied to clipboard!"));
  }

  function saveAll() {
    const generated = (outline?.sections||[]).filter(s => sectionContents[s.id]);
    if (!generated.length) return;
    const text = `${outline?.productName||"My Product"}\n\n` +
      generated.map(s => `${s.title}\n\n${stripMarkdown(sectionContents[s.id])}`).join("\n\n---\n\n");
    onSave(text, "Complete Product");
  }

  const generatedCount = Object.keys(sectionContents).length;

  if (phase === 'outline' && outline) {
    return (
      <div>
        {/* Product header */}
        <div style={{background:`linear-gradient(135deg,${C.charcoal},#6b5a59)`,borderRadius:16,padding:"1.5rem",marginBottom:"1.25rem",color:C.white}}>
          <div style={{fontSize:10,color:C.accent2,letterSpacing:"0.2em",marginBottom:6}}>YOUR PRODUCT</div>
          <div style={{fontSize:22,fontFamily:"Georgia,serif",marginBottom:4}}>{outline.productName}</div>
          <div style={{fontSize:13,color:C.accent2,marginBottom:8,fontStyle:"italic"}}>{outline.tagline}</div>
          <div style={{fontSize:12,color:C.accent2}}>{outline.targetAudience} · {outline.productType}</div>
          <div style={{marginTop:10,padding:"10px 12px",background:"rgba(255,255,255,0.08)",borderRadius:8,fontSize:12,color:C.accent1}}>
            Transformation: {outline.transformation}
          </div>
        </div>

        {/* Progress */}
        {generatedCount > 0 && (
          <div style={{...card,marginBottom:"1rem",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={{fontSize:11,color:C.roseDark,letterSpacing:"0.08em",fontWeight:600}}>{generatedCount} OF {outline.sections?.length} SECTIONS WRITTEN</div>
              <div style={{background:C.blush,borderRadius:4,height:4,marginTop:6,overflow:"hidden"}}>
                <div style={{background:C.rose,height:"100%",width:`${(generatedCount/(outline.sections?.length||1))*100}%`,borderRadius:4}}/>
              </div>
            </div>
            <div style={{display:"flex",gap:8}}>
              <button style={btn("out",true)} onClick={exportAll}>Copy all</button>
              <button style={btn("fill",true)} onClick={saveAll}>Save to library</button>
            </div>
          </div>
        )}

        {/* Sections */}
        {(outline.sections||[]).map(section => (
          <div key={section.id} style={{...card,marginBottom:"0.75rem"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:sectionContents[section.id]?12:0}}>
              <div style={{flex:1}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                  <div style={{width:24,height:24,borderRadius:"50%",background:sectionContents[section.id]?C.rose:C.accent1,color:sectionContents[section.id]?C.white:C.roseDark,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,flexShrink:0}}>
                    {sectionContents[section.id]?"✓":section.id}
                  </div>
                  <div style={{fontWeight:600,fontSize:14,color:C.charcoal}}>{section.title}</div>
                </div>
                <div style={{fontSize:12,color:"#999",lineHeight:1.5,paddingLeft:32}}>{section.description}</div>
              </div>
              <div style={{flexShrink:0,marginLeft:12}}>
                {sectionLoadings[section.id]
                  ? <div style={{fontSize:12,color:C.rose,fontStyle:"italic"}}>Writing...</div>
                  : sectionContents[section.id]
                    ? <button style={btn("out",true)} onClick={()=>generateSection(section)}>Regenerate</button>
                    : <button style={btn("fill",true)} onClick={()=>generateSection(section)}>Write this section →</button>
                }
              </div>
            </div>
            {sectionLoadings[section.id] && <Spinner/>}
            {sectionContents[section.id] && (
              <div>
                <div style={{...aiBox,marginTop:12,fontSize:13}}>{stripMarkdown(sectionContents[section.id])}</div>
                <button style={{...btn("fill",true),marginTop:8}} onClick={()=>navigator.clipboard?.writeText(stripMarkdown(sectionContents[section.id]))}>Copy this section</button>
              </div>
            )}
          </div>
        ))}

        <div style={{marginTop:"1rem",display:"flex",gap:8,flexWrap:"wrap"}}>
          <button style={btn("out")} onClick={()=>setPhase('form')}>← Edit product details</button>
          {generatedCount > 0 && <button style={btn("fill")} onClick={saveAll}>Save all to library →</button>}
        </div>
      </div>
    );
  }

  return (
    <div style={card}>
      <Sec title="Your Idea & Transformation">
        <F label="What's your product idea/topic? (even if rough)">
          <NudgeBox id="pb-idea" label="Product idea/topic" context="She wants to build a digital product for divorced nurse moms" nudges={nudges} onNudge={doNudge}/>
          <textarea style={ta} value={pf.idea||""} onChange={e=>setP("idea",e.target.value)}/>
        </F>
        <F label="Describe the BEFORE state — what your buyer is struggling with">
          <NudgeBox id="pb-before" label="Before state — what her buyer is struggling with" context={`Product idea: ${pf.idea||""}`} nudges={nudges} onNudge={doNudge}/>
          <textarea style={ta} value={pf.before||""} onChange={e=>setP("before",e.target.value)}/>
        </F>
        <F label="Describe the AFTER state — what will they have/feel/be able to do?">
          <NudgeBox id="pb-after" label="After state — the transformation this product creates" context={`Product idea: ${pf.idea||""}, Before: ${pf.before||""}`} nudges={nudges} onNudge={doNudge}/>
          <textarea style={ta} value={pf.after||""} onChange={e=>setP("after",e.target.value)}/>
        </F>
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
          <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:8,marginTop:6}}>
            {[{v:"Low ticket $17–37",d:"Impulse buy, first product, audience building"},{v:"Mid ticket $97–197",d:"Comprehensive, deeper commitment"},{v:"High ticket $197–297",d:"Premium transformation, warm audience required"},{v:"Not sure — help me figure it out",d:""}].map(p=>(
              <div key={p.v} onClick={()=>setP("price",p.v)} style={{padding:"12px",borderRadius:10,border:`1.5px solid ${pf.price===p.v?C.rose:C.blush}`,background:pf.price===p.v?C.cream:C.white,cursor:"pointer"}}>
                <div style={{fontWeight:600,fontSize:13,color:C.charcoal}}>{p.v}</div>
                {p.d&&<div style={{fontSize:11,color:"#aaa",marginTop:3}}>{p.d}</div>}
              </div>
            ))}
          </div>
        </F>
        <F label="Describe your specific target buyer (the more specific, the better)"><textarea style={ta} value={pf.buyer||""} onChange={e=>setP("buyer",e.target.value)} placeholder="Be as specific as possible..."/></F>
      </Sec>
      <Sec title="Launch & Monetisation">
        <F label="What's your current audience size?"><Chips options={["Just starting 0–500","Growing 500–2,000","Established 2,000–10,000","Large audience 10,000+"]} selected={pf.audience||""} onToggle={v=>setP("audience",v)}/></F>
        <F label="Which platforms will you use to sell and market?"><Chips options={["Instagram","TikTok","Pinterest","YouTube","Email list","Podcast","Blog","Twitter/X","LinkedIn"]} selected={pf.platforms||[]} onToggle={v=>{const c=pf.platforms||[];setP("platforms",c.includes(v)?c.filter(x=>x!==v):[...c,v]);}} multi/></F>
        <F label="Honestly — how do you feel about selling your own product?"><textarea style={ta} value={pf.selling||""} onChange={e=>setP("selling",e.target.value)}/></F>
        <F label="Anything else that will help personalize your product?"><textarea style={ta} value={pf.extra||""} onChange={e=>setP("extra",e.target.value)}/></F>
      </Sec>
      {outlineError && <p style={{color:"#c0392b",fontSize:13,marginBottom:10}}>{outlineError}</p>}
      <button style={btn("fill")} onClick={generateOutline} disabled={outlineLoading}>
        {outlineLoading ? "Building your product outline..." : "Build my complete product →"}
      </button>
      {outlineLoading && <Spinner/>}
    </div>
  );
}

// ── INSTALL ───────────────────────────────────────────────────────────────────
function InstallTab({data,setData,onSave}){
  const[tool,setTool]=useState("brand");
  const[loading,setLoading]=useState(false);
  const[result,setResult]=useState("");
  const[nudges,setNudges]=useState({});
  const bf=data.brand||{};const idf=data.ideagen||{};
  const setB=(k,v)=>setData(d=>({...d,brand:{...d.brand,[k]:v}}));
  const setI=(k,v)=>setData(d=>({...d,ideagen:{...d.ideagen,[k]:v}}));

  function doNudge(id, label, ctx) {
    getNudge(id, label, ctx, setNudges);
  }

  const tools=[
    {id:"brand",icon:"🎨",name:"Brand Kit",desc:"Build your voice, aesthetic & presence"},
    {id:"idea",icon:"💡",name:"Idea Generator",desc:"Find your unique digital product idea"},
    {id:"product",icon:"📦",name:"Product Builder",desc:"Build & write your complete product"},
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
    const r=await callClaude(sys,prompt);
    setResult(r);
    if(tool==="brand")setData(d=>({...d,installResult:r}));
    onSave(r,tool==="brand"?"Brand Kit":"Idea Generator");
    setLoading(false);
  }

  const platforms=["Instagram","TikTok","Pinterest","YouTube","Blog","Website","Email newsletter","Podcast","Twitter/X","Facebook","LinkedIn"];

  return(
    <div>
      <HeroBanner title="Install Your Foundation" sub="Face your full financial picture and put the right protections in place — so nothing is left to chance." icon="⚡"/>
      <ToolGrid tools={tools} active={tool} onSelect={t=>{setTool(t);setResult("");}}/>

      {tool==="brand"&&(
        <div style={card}>
          <Sec title="Brand Kit" sub="Build your voice, aesthetic & presence">
            <F label="Profile" hint="Your voice, audience, handle, platforms — describe yourself in 3–5 sentences">
              <NudgeBox id="bk-profile" label="Brand profile — who you are and who you serve" context="Divorced nurse mom building a digital business" nudges={nudges} onNudge={doNudge}/>
              <textarea style={ta} value={bf.profile||""} onChange={e=>setB("profile",e.target.value)} placeholder="I'm a nurse turned digital creator helping divorced moms..."/>
            </F>
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
          {loading&&<Spinner/>}
          {result&&<><div style={aiBox}>{stripMarkdown(result)}</div><div style={{display:"flex",gap:8,alignItems:"center",marginTop:10}}><button style={btn("fill",true)} onClick={()=>navigator.clipboard?.writeText(stripMarkdown(result))}>Copy</button><span style={{fontSize:11,color:C.rose}}>✓ Auto-saved to library</span></div></>}
        </div>
      )}

      {tool==="idea"&&(
        <div style={card}>
          <Sec title="Idea Generator" sub="Your unfair advantage is hiding in plain sight.">
            <F label="Your skills & expertise" hint="Think beyond your job title. What can you do effortlessly that would feel impossible to someone else?">
              <NudgeBox id="ig-skills" label="Skills and expertise" context="She is a nurse and divorced mom considering a digital product business" nudges={nudges} onNudge={doNudge}/>
              <textarea style={{...ta,minHeight:100}} value={idf.skills||""} onChange={e=>setI("skills",e.target.value)} placeholder="e.g. I can explain complex medical situations calmly under pressure. I can create order out of complete chaos..."/>
            </F>
            <F label="Your life experiences" hint="Your past chapters aren't irrelevant — they're your unfair advantage. The harder the chapter, the more valuable the lesson.">
              <NudgeBox id="ig-life" label="Life experiences and past chapters" context={`Her skills: ${idf.skills||""}`} nudges={nudges} onNudge={doNudge}/>
              <textarea style={{...ta,minHeight:100}} value={idf.life||""} onChange={e=>setI("life",e.target.value)} placeholder="e.g. Went through a divorce while working night shifts, raised kids alone, rebuilt my finances from zero..."/>
            </F>
            <F label="Problems you help solve" hint="What do people come to you for? What do friends DM you about? What do you find yourself explaining again and again?">
              <NudgeBox id="ig-problems" label="Problems she helps solve" context={`Skills: ${idf.skills||""}, Life: ${idf.life||""}`} nudges={nudges} onNudge={doNudge}/>
              <textarea style={{...ta,minHeight:100}} value={idf.problems||""} onChange={e=>setI("problems",e.target.value)} placeholder="e.g. How to manage burnout, how to start saving on a nurse's salary, how to leave a toxic relationship..."/>
            </F>
          </Sec>
          <button style={btn("fill")} onClick={generate}>Generate my ideas →</button>
          {loading&&<Spinner/>}
          {result&&<><div style={aiBox}>{stripMarkdown(result)}</div><div style={{display:"flex",gap:8,alignItems:"center",marginTop:10}}><button style={btn("fill",true)} onClick={()=>navigator.clipboard?.writeText(stripMarkdown(result))}>Copy</button><span style={{fontSize:11,color:C.rose}}>✓ Auto-saved to library</span></div></>}
        </div>
      )}

      {tool==="product"&&(
        <ProductBuilder data={data} setData={setData} onSave={onSave}/>
      )}
    </div>
  );
}

// ── SUSTAIN ───────────────────────────────────────────────────────────────────
function SustainTab({data,setData,onSave}){
  const isMobile=useIsMobile();
  const[tool,setTool]=useState("studio");
  const[subtool,setSubtool]=useState("");
  const[loading,setLoading]=useState(false);
  const[result,setResult]=useState("");
  const[nudges,setNudges]=useState({});
  const[calLoading,setCalLoading]=useState(false);
  const[calDays,setCalDays]=useState([]);
  const[profileOpen,setProfileOpen]=useState(true);
  const f=data.sustain||{};
  const set=(k,v)=>setData(d=>({...d,sustain:{...d.sustain,[k]:v}}));

  function doNudge(id, label, ctx) {
    getNudge(id, label, ctx, setNudges);
  }

  const studioTools=[
    {id:"studio",icon:"✍️",name:"Content Studio",desc:"Generate content that sells, grows & connects"},
    {id:"story",icon:"📖",name:"Story & Voice",desc:"Build your origin story, voice & content pillars"},
    {id:"repurpose",icon:"↻",name:"Repurpose",desc:"Turn one piece of content into many formats"},
    {id:"calendar",icon:"📅",name:"30-Day Calendar",desc:"30 days of hooks, captions & reel scripts — Canva ready"},
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
  const goals=[
    {id:"growth",icon:"📈",name:"Growth Content",desc:"Reach new audiences & go viral"},
    {id:"sells",icon:"💰",name:"Selling Content",desc:"Drive DMs, clicks & conversions"},
    {id:"entertain",icon:"🎭",name:"Entertain & Story",desc:"Relatable moments & personal stories"},
    {id:"educate",icon:"💡",name:"Educate & Add Value",desc:"Tips, tutorials, teach your expertise"},
    {id:"trust",icon:"🤝",name:"Build Trust",desc:"Proof, testimonials, behind the scenes"},
    {id:"inspire",icon:"✨",name:"Inspire & Motivate",desc:"Mindset, aspirational, big-picture vision"},
  ];
  const goalFrameworks={
    growth:["pain-hook","narrow","reel"],
    sells:["social-proof","carousel","pain-hook"],
    entertain:["reel","narrow"],
    educate:["carousel","narrow"],
    trust:["social-proof","carousel"],
    inspire:["reel","pain-hook"],
  };
  const frameworks=[
    {id:"pain-hook",icon:"🎯",name:"Pain-to-Hook",desc:"Hooks under 10 words that stop the scroll and open a loop they need to close"},
    {id:"narrow",icon:"🔬",name:"Narrow Content",desc:"Hyper-specific angle almost nobody covers — feels written for one exact person"},
    {id:"reel",icon:"🎬",name:"Reel Script",desc:"30-second video: Hook → Tension → Insight → CTA. Punchy, fast, zero fluff"},
    {id:"social-proof",icon:"⭐",name:"Social Proof",desc:"Testimonial → before/after/turning point → marketing phrases that sell without selling"},
    {id:"carousel",icon:"📱",name:"Saveable Carousel",desc:"Every slide is a lightbulb moment that could stand alone as its own post"},
  ];

  function getFrameworkPrompts(id){
    const ctx=`Niche: ${f.niche||"nurse entrepreneurs"}\nAudience: ${f.audience||"divorced nurse moms building digital businesses"}\nProduct/offer: ${f.product||""}\nTopic/context: ${f.writeWithMe||""}\nGoal: ${goals.find(g=>g.id===f.goal)?.name||""}`;
    const ctaRule=`\n\nALWAYS end with:\nCAPTION CTA: Comment [KEYWORD] if you are [hyper-specific identity] trying to [very specific outcome]. (KEYWORD = 1–2 memorable words)`;
    const m={
      "pain-hook":{
        sys:`You are a viral hook copywriter for divorced nurse moms building digital businesses. Your hooks stop the scroll cold and make people feel deeply seen.\n\nOutput:\n1. Write 8 hooks — numbered list, each under 10 words. Lead with visceral, specific pain. Feel like you're reading their diary. Create an open loop they NEED to close.\n2. Pick the strongest hook and write a full caption (3–4 sentences, relatable opener + value + CTA).${ctaRule}`,
        prompt:ctx+`\nTone: ${f.tone||"raw and real"}\nPlatform: ${f.platform||""}`,
      },
      "narrow":{
        sys:`You are a hyper-specific content strategist. Generic content is your enemy.\n\nOutput format:\n1. THE NARROW ANGLE (one sentence — the exact specific angle almost no creator is talking about)\n2. WHY THIS HITS (2 sentences — why this creates instant "that's me" recognition)\n3. THE CONTENT (full post/caption — specific names, numbers, situations. Zero filler. Sounds like a real woman, not a template.)${ctaRule}`,
        prompt:ctx,
      },
      "reel":{
        sys:`You are a viral reel script writer for divorced nurse moms building digital businesses. Write a 30-second reel script engineered for maximum hook rate and watch time.\n\nSTRUCTURE (label every section):\nHOOK (0–3s): One line. Creates open loop. Scroll-stopping.\nTENSION (3–12s): Build the pain. 2–3 short sentences.\nINSIGHT (12–22s): The reframe. Specific. 2–3 sentences.\nCTA (22–30s): "Comment [WORD] if you are [specific identity] trying to [specific outcome]."\n\nRULES: 3–5 words per sentence MAX. Zero fluff. Every word earns its place. Label each section.`,
        prompt:ctx+`\nPlatform: ${f.platform||"Instagram/TikTok"}\nTone: ${f.tone||""}`,
      },
      "social-proof":{
        sys:`You are a social proof copywriter who extracts conversion gold from testimonials.\n\nOutput format:\nBEFORE: [exact pain state — specific]\nTURNING POINT: [the precise moment everything shifted]\nAFTER: [the specific result]\n\n---\nMARKETING PHRASES:\nWrite 10 short phrases under 10 words each. Create curiosity, make the dream customer say "that's me," use before/after contrast. One per line. No numbering. No punctuation at end.${ctaRule}`,
        prompt:`Testimonial/result: ${f.testimonial||f.writeWithMe||""}\nNiche: ${f.niche||""}\nDream customer: ${f.audience||""}\nOffer: ${f.product||""}`,
      },
      "carousel":{
        sys:`You are a saveable carousel strategist. Every slide must be so clear it could stand alone as its own post. Each slide creates a lightbulb moment — not informs, REFRAMES.\n\nSTRUCTURE:\nSLIDE 1 — HOOK: Bold, specific, creates pattern interrupt. Makes them stop and swipe.\nSLIDES 2–6 — INSIGHT SLIDES: One reframe per slide. 15–20 words max. "I never thought of it this way" energy.\nSLIDE 7 — CTA: "Comment [KEYWORD] if you are [specific dream customer] trying to [specific outcome]."\n\nLabel each slide. One idea per slide. No filler. Every slide = mic drop.`,
        prompt:ctx+`\nTone: ${f.tone||"bold and direct"}`,
      },
    };
    return m[id]||{sys:`You are a content strategist and copywriter for divorced nurse moms building digital businesses. Write powerful, specific, conversion-worthy content. End with a strong Comment CTA. No generic filler.`,prompt:ctx};
  }

  async function generate(sys,prompt,label="Content"){
    setLoading(true);setResult("");
    const r=await callClaude(sys,prompt);
    setResult(r);setData(d=>({...d,sustainResult:r}));onSave(r,label);setLoading(false);
  }

  function addMoment(){
    if(!f.newMoment?.trim())return;
    const moments=[...(data.moments||[]),{text:f.newMoment,date:new Date().toLocaleDateString("en-CA",{month:"short",day:"numeric"})}];
    setData(d=>({...d,moments}));set("newMoment","");
  }

  async function generateCalendar(){
    setCalLoading(true);setCalDays([]);
    const isAudience=f.calMode==="audience";
    const distribution=isAudience
      ?`FRAMEWORK DISTRIBUTION — ALL 30 DAYS ARE GROWTH & AWARENESS CONTENT. No selling. Build audience, reach, and trust first.
DAYS 1–10: PAIN-TO-HOOK (Growth) — viral hooks under 10 words that hit a raw, specific pain point
DAYS 11–20: NARROW CONTENT (Growth) — hyper-specific angle almost nobody covers; feels written for one person
DAYS 21–30: REEL SCRIPT (Growth) — 30-second video scripts for maximum reach and watch time`
      :`FRAMEWORK DISTRIBUTION — STRATEGIC MIX OF GROWTH + SELLING + TRUST + INSPIRATION:
DAYS 1–6: PAIN-TO-HOOK (Growth) — viral hooks, reach new audiences
DAYS 7–10: NARROW CONTENT (Growth) — hyper-specific angles, shareable content
DAYS 11–13: REEL SCRIPT (Growth) — scroll-stopping 30-sec video scripts
DAYS 14–18: SOCIAL PROOF (Selling) — testimonials, before/after, turning points that convert
DAYS 19–23: SAVEABLE CAROUSEL (Selling) — lightbulb carousel slides that educate and sell
DAYS 24–26: SOCIAL PROOF (Trust) — behind the scenes, real moments, honest results
DAYS 27–28: NARROW CONTENT (Trust) — specific credibility-building takes
DAYS 29–30: REEL SCRIPT (Inspire) — mindset reframes and big-picture vision`;

    const sys=`You are a content calendar strategist for divorced nurse moms building digital businesses.

${distribution}

For EACH day output EXACTLY this format:
DAY [number] — [FRAMEWORK NAME] — [GOAL]
HOOK: [Scroll-stopping opener under 10 words]
CAPTION: [3–4 sentences: relatable opener + value + CTA. Max 60 words.]
SCRIPT:
HOOK: [Same or stronger hook]
TENSION: [Build the pain — 1 sentence]
INSIGHT: [The reframe — 1 sentence]
CTA: Comment [KEYWORD] if you are [specific person] trying to [specific outcome]
---

Output all 30 days in order. No extra text. No commentary. Just the 30 days.`;
    const prompt=`Niche: ${f.niche||"nurse entrepreneurs"}\nAudience: ${f.audience||"divorced nurse moms building digital businesses"}\nOffer: ${f.product||""}\nPlatform: ${f.platform||"Instagram/TikTok"}\nTone: ${f.tone||"warm and real"}\nPersonal themes/stories to weave in: ${f.calThemes||""}`;
    const raw=await callClaude(sys,prompt,4000);
    const blocks=raw.split(/\n---+\n?/).filter(b=>b.trim());
    const days=blocks.map(block=>{
      const headerMatch=block.match(/DAY\s*(\d+)\s*[—\-]+\s*([^—\-\n]+?)(?:\s*[—\-]+\s*([^\n]+))?[\n]/i);
      const dayMatch=headerMatch||block.match(/DAY\s*(\d+)/i);
      if(!dayMatch)return null;
      const hookMatch=block.match(/^HOOK:\s*(.+)/im);
      const captionMatch=block.match(/CAPTION:\s*([\s\S]+?)(?=\nSCRIPT:|---)/i);
      const scriptMatch=block.match(/SCRIPT:\s*([\s\S]+?)$/i);
      return{
        day:parseInt(dayMatch[1]),
        framework:headerMatch?.[2]?.trim()||"",
        goal:headerMatch?.[3]?.trim()||"",
        hook:hookMatch?.[1]?.trim()||"",
        caption:captionMatch?.[1]?.trim()||"",
        script:scriptMatch?.[1]?.trim()||"",
      };
    }).filter(Boolean).sort((a,b)=>a.day-b.day);
    if(days.length>0){
      setCalDays(days);
      const saved=days.map(d=>`Day ${d.day}\nHOOK: ${d.hook}\nCAPTION: ${d.caption}\nSCRIPT:\n${d.script}`).join("\n\n---\n\n");
      onSave(saved,"30-Day Calendar");
    }
    setCalLoading(false);
  }

  return(
    <div>
      <HeroBanner title="Sustain Your Business" sub="Build the habits, income, and presence that create lasting stability — and become the woman who trusts herself to maintain them." icon="✨"/>

      {/* ── SHARED CONTEXT CARD ── */}
      <div style={{...card,marginBottom:"1rem",border:`1px solid ${C.blush}`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer"}} onClick={()=>setProfileOpen(p=>!p)}>
          <div>
            <div style={{fontSize:10,color:C.roseDark,letterSpacing:"0.15em",fontWeight:700,textTransform:"uppercase"}}>Your Context</div>
            <div style={{fontSize:12,color:"#aaa",marginTop:2}}>
              {profileOpen?"Set once — used by Content Studio, 30-Day Calendar, and all tools below"
                :`${f.niche||"No niche set"} · ${f.tone||"No tone set"}`}
            </div>
          </div>
          <div style={{fontSize:18,color:C.rose,userSelect:"none"}}>{profileOpen?"∧":"∨"}</div>
        </div>
        {profileOpen&&(
          <div style={{marginTop:"1.25rem"}}>
            <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:12,marginBottom:"0.75rem"}}>
              <F label="Your niche"><input style={inp} value={f.niche||""} onChange={e=>set("niche",e.target.value)} placeholder="e.g. Nurse entrepreneurs, financial freedom after divorce..."/></F>
              <F label="Target audience"><input style={inp} value={f.audience||""} onChange={e=>set("audience",e.target.value)} placeholder="e.g. Divorced moms who are nurses wanting digital income..."/></F>
              <F label="Your product or offer"><input style={inp} value={f.product||""} onChange={e=>set("product",e.target.value)} placeholder="e.g. My ebook on paying off debt on a nurse's salary"/></F>
              <F label="Platform"><input style={inp} value={f.platform||""} onChange={e=>set("platform",e.target.value)} placeholder="e.g. Instagram, TikTok..."/></F>
            </div>
            <F label="Tone">
              <Chips options={tones} selected={f.tone||""} onToggle={v=>set("tone",v)}/>
            </F>
          </div>
        )}
      </div>

      <ToolGrid tools={studioTools} active={tool} onSelect={t=>{setTool(t);setSubtool("");setResult("");}}/>

      {tool==="studio"&&(
        <div style={card}>
          <Sec title="Content Studio" sub="3 steps: pick your goal → pick your angle → add your topic. Done.">

            {/* Step 1: Goal */}
            <div style={{marginBottom:"1.25rem"}}>
              <div style={{fontSize:11,color:C.roseDark,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:10}}>Step 1 — What do you want this content to do?</div>
              <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr 1fr":"repeat(3,1fr)",gap:8}}>
                {goals.map(g=>(
                  <div key={g.id} onClick={()=>{set("goal",g.id);set("framework","");}} style={{
                    padding:"14px 10px",borderRadius:12,cursor:"pointer",textAlign:"center",
                    border:`1.5px solid ${f.goal===g.id?C.rose:C.blush}`,
                    background:f.goal===g.id?C.cream:C.white,
                    transition:"all 0.15s",
                  }}>
                    <div style={{fontSize:22,marginBottom:5}}>{g.icon}</div>
                    <div style={{fontWeight:600,fontSize:12,color:C.charcoal,marginBottom:2}}>{g.name}</div>
                    <div style={{fontSize:10,color:"#aaa",lineHeight:1.4}}>{g.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 2: Framework (filtered by goal) */}
            {f.goal&&(
              <div style={{marginBottom:"1.25rem"}}>
                <div style={{fontSize:11,color:C.roseDark,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:10}}>Step 2 — How should it be written?</div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  {(goalFrameworks[f.goal]||[]).map(fwId=>{
                    const fw=frameworks.find(x=>x.id===fwId);
                    if(!fw)return null;
                    return(
                      <div key={fw.id} onClick={()=>set("framework",fw.id)} style={{
                        flex:"1 1 140px",padding:"12px",borderRadius:10,cursor:"pointer",
                        border:`1.5px solid ${f.framework===fw.id?C.rose:C.blush}`,
                        background:f.framework===fw.id?C.cream:C.white,
                        transition:"all 0.15s",
                      }}>
                        <div style={{fontSize:18,marginBottom:4}}>{fw.icon}</div>
                        <div style={{fontWeight:600,fontSize:12,color:C.charcoal,marginBottom:3}}>{fw.name}</div>
                        <div style={{fontSize:10,color:"#aaa",lineHeight:1.4}}>{fw.desc}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 3: Topic / Testimonial */}
            {f.framework&&(
              <div>
                <div style={{fontSize:11,color:C.roseDark,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:10}}>Step 3 — {f.framework==="social-proof"?"Paste your testimonial or result":"Give it your story or topic"}</div>
                {f.framework==="social-proof"
                  ?<textarea style={{...ta,minHeight:100}} value={f.testimonial||""} onChange={e=>set("testimonial",e.target.value)} placeholder="Paste it exactly as they wrote/said it — the rawer the better. e.g. 'I literally cried when I paid off my credit card...'"/>
                  :<textarea style={ta} value={f.writeWithMe||""} onChange={e=>set("writeWithMe",e.target.value)} placeholder="e.g. How I paid off $8k in debt on a nurse's salary while raising 2 kids alone..."/>
                }
                {(!f.niche&&!f.audience)&&(
                  <div style={{background:C.cream,border:`1px solid ${C.blush}`,borderRadius:10,padding:"10px 14px",fontSize:12,color:C.roseDark,marginTop:8}}>
                    💡 Fill in your <strong>niche, audience & tone</strong> in the context card above for better results.
                  </div>
                )}
              </div>
            )}
          </Sec>
          {f.framework&&<button style={btn("fill")} onClick={()=>{const{sys,prompt}=getFrameworkPrompts(f.framework);const fw=frameworks.find(f2=>f2.id===f.framework);const g=goals.find(g2=>g2.id===f.goal);generate(sys,prompt,`${g?.name||"Content"} — ${fw?.name||""}`);}}>Generate →</button>}
          {loading&&<Spinner/>}
          {result&&<><div style={aiBox}>{stripMarkdown(result)}</div><div style={{display:"flex",gap:8,alignItems:"center",marginTop:10}}><button style={btn("fill",true)} onClick={()=>navigator.clipboard?.writeText(stripMarkdown(result))}>Copy</button><span style={{fontSize:11,color:C.rose}}>✓ Auto-saved to library</span></div></>}
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
              <F label="Paste writing samples">
                <NudgeBox id="vm-writing" label="Writing samples to analyse" context="She needs to paste examples of her own writing to get her brand voice mirrored" nudges={nudges} onNudge={doNudge}/>
                <textarea style={{...ta,minHeight:120}} value={f.voiceWriting||""} onChange={e=>set("voiceWriting",e.target.value)} placeholder="Paste 2-3 captions, emails, or posts you've written..."/>
              </F>
              <F label="Niche (optional)"><input style={inp} value={f.voiceNiche||""} onChange={e=>set("voiceNiche",e.target.value)}/></F>
              <F label="Audience (optional)"><input style={inp} value={f.voiceAudience||""} onChange={e=>set("voiceAudience",e.target.value)}/></F>
            </Sec>
            <button style={btn("fill")} onClick={()=>generate(`You are a brand voice analyst for the RISE framework. Study the writing samples deeply. Identify: sentence rhythm, vocabulary level, emotional tone, personality traits, unique phrases, what makes it distinctly hers. Then write a Voice Guide she can use to brief anyone writing for her brand. Max 400 words.`,`Writing samples: ${f.voiceWriting||""}\nNiche: ${f.voiceNiche||""}\nAudience: ${f.voiceAudience||""}`, "Brand Voice Mirror")}>Analyse my voice →</button>
          </div>}

          {subtool==="originstory"&&<div style={card}>
            <Sec title="Origin Story Builder" sub="Turn your journey into 5 ready-to-use story formats.">
              <F label="Your before">
                <NudgeBox id="os-before" label="Your 'before' state — where you started" context="She is building her origin story for her brand" nudges={nudges} onNudge={doNudge}/>
                <textarea style={ta} value={f.sBefore||""} onChange={e=>set("sBefore",e.target.value)}/>
              </F>
              <F label="The turning point">
                <NudgeBox id="os-turn" label="The turning point in her story" context={`Her before: ${f.sBefore||""}`} nudges={nudges} onNudge={doNudge}/>
                <textarea style={ta} value={f.sTurn||""} onChange={e=>set("sTurn",e.target.value)}/>
              </F>
              <F label="Your after"><textarea style={ta} value={f.sAfter||""} onChange={e=>set("sAfter",e.target.value)}/></F>
              <F label="Why you do what you do">
                <NudgeBox id="os-why" label="Why she does what she does — her deeper purpose" context={`Before: ${f.sBefore||""}, After: ${f.sAfter||""}`} nudges={nudges} onNudge={doNudge}/>
                <textarea style={ta} value={f.sWhy||""} onChange={e=>set("sWhy",e.target.value)}/>
              </F>
              <F label="Mission (optional)"><input style={inp} value={f.sMission||""} onChange={e=>set("sMission",e.target.value)}/></F>
              <F label="Niche (optional)"><input style={inp} value={f.sNiche||""} onChange={e=>set("sNiche",e.target.value)}/></F>
            </Sec>
            <button style={btn("fill")} onClick={()=>generate(`You are a story coach for the RISE framework. Write 5 different versions of her origin story — each in a different format: 1) Instagram caption, 2) Email intro, 3) TikTok/Reel hook script, 4) Bio paragraph, 5) Conversational "tell me about yourself." Each version should be raw, specific, and powerful. Max 600 words total.`,`Before: ${f.sBefore||""}\nTurning point: ${f.sTurn||""}\nAfter: ${f.sAfter||""}\nWhy: ${f.sWhy||""}\nMission: ${f.sMission||""}\nNiche: ${f.sNiche||""}`, "Origin Story")}>Build my origin story →</button>
          </div>}

          {subtool==="pillars"&&<div style={card}>
            <Sec title="Content Pillars" sub="Build pillars rooted in your actual lived experience.">
              <F label="Your life experiences & chapters" hint="Career pivots, rock bottom moments, wins, losses — be honest">
                <NudgeBox id="cp-life" label="Life experiences and chapters" context="She is a divorced nurse mom building a digital business" nudges={nudges} onNudge={doNudge}/>
                <textarea style={{...ta,minHeight:100}} value={f.pLife||""} onChange={e=>set("pLife",e.target.value)}/>
              </F>
              <F label="Your skills & expertise" hint="What you know well, have done for years, what people come to you for">
                <NudgeBox id="cp-skills" label="Skills and expertise for content pillars" context={`Her life: ${f.pLife||""}`} nudges={nudges} onNudge={doNudge}/>
                <textarea style={ta} value={f.pSkills||""} onChange={e=>set("pSkills",e.target.value)}/>
              </F>
              <F label="Niche"><input style={inp} value={f.pNiche||""} onChange={e=>set("pNiche",e.target.value)}/></F>
              <F label="Audience"><input style={inp} value={f.pAudience||""} onChange={e=>set("pAudience",e.target.value)}/></F>
              <F label="Offer"><input style={inp} value={f.pOffer||""} onChange={e=>set("pOffer",e.target.value)}/></F>
            </Sec>
            <button style={btn("fill")} onClick={()=>generate(`You are a content strategist for the RISE framework. Build 5 content pillars rooted in her real lived experience — not generic topics. Each pillar: name, description, why it connects to her story, 3 content ideas. Max 500 words.`,`Life: ${f.pLife||""}\nSkills: ${f.pSkills||""}\nNiche: ${f.pNiche||""}\nAudience: ${f.pAudience||""}\nOffer: ${f.pOffer||""}`, "Content Pillars")}>Build my story pillars →</button>
          </div>}

          {subtool==="angles"&&<div style={card}>
            <Sec title="Story Angle Generator" sub="5 story angles for any topic or offer.">
              <F label="Topic/offer" hint="e.g. Launching my first digital product">
                <NudgeBox id="sa-topic" label="Topic or offer to generate story angles for" context="She is a divorced nurse mom building a digital business" nudges={nudges} onNudge={doNudge}/>
                <input style={{...inp,marginTop:6}} value={f.angTopic||""} onChange={e=>set("angTopic",e.target.value)}/>
              </F>
              <F label="Niche"><input style={inp} value={f.angNiche||""} onChange={e=>set("angNiche",e.target.value)}/></F>
              <F label="Audience"><input style={inp} value={f.angAudience||""} onChange={e=>set("angAudience",e.target.value)}/></F>
              <F label="Your known moments/experiences related to this topic" hint="Real moments that connect to this topic">
                <NudgeBox id="sa-moments" label="Real personal moments related to this topic" context={`Topic: ${f.angTopic||""}`} nudges={nudges} onNudge={doNudge}/>
                <textarea style={{...ta,marginTop:6}} value={f.angMoments||""} onChange={e=>set("angMoments",e.target.value)}/>
              </F>
            </Sec>
            <button style={btn("fill")} onClick={()=>generate(`You are a story strategist for the RISE framework. Generate 5 distinct story angles for the given topic. Each angle: the hook, the narrative thread, why it resonates with the audience, and the CTA. Make each angle feel personal and non-generic. Max 500 words.`,`Topic: ${f.angTopic||""}\nNiche: ${f.angNiche||""}\nAudience: ${f.angAudience||""}\nMoments: ${f.angMoments||""}`, "Story Angles")}>Generate story angles →</button>
          </div>}

          {subtool==="caption"&&<div style={card}>
            <Sec title="Transformation Caption Builder" sub="Before–shift–after caption that sells the journey.">
              <F label="The before">
                <NudgeBox id="tc-before" label="The 'before' state for this caption" context="She is writing a transformation caption for social media" nudges={nudges} onNudge={doNudge}/>
                <textarea style={{...ta,marginTop:6}} value={f.capBefore||""} onChange={e=>set("capBefore",e.target.value)}/>
              </F>
              <F label="The shift">
                <NudgeBox id="tc-shift" label="The shift or turning point" context={`Before: ${f.capBefore||""}`} nudges={nudges} onNudge={doNudge}/>
                <textarea style={{...ta,marginTop:6}} value={f.capShift||""} onChange={e=>set("capShift",e.target.value)}/>
              </F>
              <F label="The after"><textarea style={ta} value={f.capAfter||""} onChange={e=>set("capAfter",e.target.value)}/></F>
              <F label="Your offer (optional)"><input style={inp} value={f.capOffer||""} onChange={e=>set("capOffer",e.target.value)}/></F>
              <F label="Tone (optional)"><Chips options={tones} selected={f.capTone||""} onToggle={v=>set("capTone",v)}/></F>
            </Sec>
            <button style={btn("fill")} onClick={()=>generate(`You are a copywriter for the RISE framework. Write a transformation caption using before-shift-after structure. Make it specific, emotional, real. Not a template — it should sound like this exact woman's story. End with a subtle CTA. Max 300 words.`,`Before: ${f.capBefore||""}\nShift: ${f.capShift||""}\nAfter: ${f.capAfter||""}\nOffer: ${f.capOffer||""}\nTone: ${f.capTone||""}`, "Transformation Caption")}>Build my caption →</button>
          </div>}

          {subtool==="scripts"&&<div style={card}>
            <Sec title="Selling Story Scripts" sub="5-part story sequences for IG, email, or TikTok.">
              <F label="Your offer"><textarea style={ta} value={f.scrOffer||""} onChange={e=>set("scrOffer",e.target.value)}/></F>
              <F label="Before state (audience's starting point)">
                <NudgeBox id="ss-before" label="Audience before state for selling story" context={`Offer: ${f.scrOffer||""}`} nudges={nudges} onNudge={doNudge}/>
                <textarea style={{...ta,marginTop:6}} value={f.scrBefore||""} onChange={e=>set("scrBefore",e.target.value)}/>
              </F>
              <F label="After state (the transformation)">
                <NudgeBox id="ss-after" label="Audience after state — the transformation" context={`Offer: ${f.scrOffer||""}, Before: ${f.scrBefore||""}`} nudges={nudges} onNudge={doNudge}/>
                <textarea style={{...ta,marginTop:6}} value={f.scrAfter||""} onChange={e=>set("scrAfter",e.target.value)}/>
              </F>
              <F label="Niche"><input style={inp} value={f.scrNiche||""} onChange={e=>set("scrNiche",e.target.value)}/></F>
              <F label="Format"><Chips options={["IG story series","Email series","TikTok series"]} selected={f.scrFormat||""} onToggle={v=>set("scrFormat",v)}/></F>
            </Sec>
            <button style={btn("fill")} onClick={()=>generate(`You are a story script writer for the RISE framework. Write a 5-part selling story sequence in the requested format. Each part flows into the next and builds toward the offer naturally — not salesy. Real, warm, specific. Max 600 words.`,`Offer: ${f.scrOffer||""}\nBefore: ${f.scrBefore||""}\nAfter: ${f.scrAfter||""}\nNiche: ${f.scrNiche||""}\nFormat: ${f.scrFormat||"IG story series"}`, "Selling Story Scripts")}>Write my story series →</button>
          </div>}

          {subtool==="objection"&&<div style={card}>
            <Sec title="Objection Story Responder" sub="Answer sales objections with personal stories, not logic.">
              <F label="The objection"><input style={inp} value={f.objObj||""} onChange={e=>set("objObj",e.target.value)} placeholder="e.g. I don't have enough time, I'm not an expert, it won't work for me..."/></F>
              <F label="Your relevant personal story" hint="The real moment that contradicts this objection">
                <NudgeBox id="obj-story" label="Personal story that contradicts this objection" context={`Objection: ${f.objObj||""}`} nudges={nudges} onNudge={doNudge}/>
                <textarea style={{...ta,marginTop:6}} value={f.objStory||""} onChange={e=>set("objStory",e.target.value)}/>
              </F>
              <F label="Your offer"><input style={inp} value={f.objOffer||""} onChange={e=>set("objOffer",e.target.value)}/></F>
            </Sec>
            <button style={btn("fill")} onClick={()=>generate(`You are a sales story coach for the RISE framework. Write a story-based response to the sales objection. Don't use logic or bullet points — use story. Make it personal, specific, and powerful. The reader should feel seen, not sold to. Max 300 words.`,`Objection: ${f.objObj||""}\nPersonal story: ${f.objStory||""}\nOffer: ${f.objOffer||""}`, "Objection Responder")}>Write story responses →</button>
          </div>}

          {subtool==="uniqueness"&&<div style={card}>
            <Sec title="Only I Could Write This" sub="Score and rewrite content for maximum personal specificity.">
              <F label="Your content">
                <NudgeBox id="uni-content" label="Content to make more personal and specific" context="She wants to make her content uniquely hers" nudges={nudges} onNudge={doNudge}/>
                <textarea style={{...ta,minHeight:120,marginTop:6}} value={f.uniContent||""} onChange={e=>set("uniContent",e.target.value)} placeholder="Paste your caption, email, or post..."/>
              </F>
              <F label="Context about you (optional)"><textarea style={ta} value={f.uniContext||""} onChange={e=>set("uniContext",e.target.value)} placeholder="Any personal details that should be in this content..."/></F>
            </Sec>
            <button style={btn("fill")} onClick={()=>generate(`You are a content specificity coach for the RISE framework. Score the content 1-10 on how uniquely personal it is. Then rewrite it with maximum specificity — replace every generic phrase with a real, personal detail. Show before/after. Max 400 words.`,`Content: ${f.uniContent||""}\nContext: ${f.uniContext||""}`, "Only I Could Write This")}>Filter for uniqueness →</button>
          </div>}

          {subtool==="audit"&&<div style={card}>
            <Sec title="Standout Content Auditor" sub="Could-only-be-you score with full breakdown and rewrite.">
              <F label="Your content"><textarea style={{...ta,minHeight:120}} value={f.audContent||""} onChange={e=>set("audContent",e.target.value)}/></F>
              <F label="Niche"><input style={inp} value={f.audNiche||""} onChange={e=>set("audNiche",e.target.value)}/></F>
              <F label="Audience"><input style={inp} value={f.audAudience||""} onChange={e=>set("audAudience",e.target.value)}/></F>
            </Sec>
            <button style={btn("fill")} onClick={()=>generate(`You are a content auditor for the RISE framework. Give a full audit: 1) Overall score /10, 2) What's working, 3) What's generic, 4) What only SHE could add, 5) Full rewrite. Be direct but warm. Max 500 words.`,`Content: ${f.audContent||""}\nNiche: ${f.audNiche||""}\nAudience: ${f.audAudience||""}`, "Standout Audit")}>Audit my content →</button>
          </div>}

          {subtool==="moments"&&<div style={card}>
            <Sec title="Brand Moment Library" sub="Save your real moments. Generate content from any of them.">
              <F label="Add a brand moment" hint="A real experience, story, win, lesson, turning point — anything raw and real">
                <NudgeBox id="bm-moment" label="A brand moment — real story, win, lesson, or turning point" context="She is building a library of personal brand moments to use in content" nudges={nudges} onNudge={doNudge}/>
                <textarea style={{...ta,marginTop:6}} value={f.newMoment||""} onChange={e=>set("newMoment",e.target.value)} placeholder="e.g. The day I sat in my car after a 12-hour shift and realized I couldn't keep doing this..."/>
              </F>
              <button style={btn("out",true)} onClick={addMoment}>+ Save moment</button>
              {(data.moments||[]).length>0&&<>
                <div style={{marginTop:"1.25rem",marginBottom:8,fontSize:11,color:C.roseDark,letterSpacing:"0.1em",fontWeight:600}}>YOUR MOMENTS</div>
                {(data.moments||[]).map((m,i)=>(
                  <div key={i} style={{border:`1px solid ${C.blush}`,borderRadius:10,padding:"12px 14px",marginBottom:8,background:C.white}}>
                    <div style={{fontSize:12,color:"#aaa",marginBottom:6}}>{m.date}</div>
                    <div style={{fontSize:13,color:C.charcoal,lineHeight:1.6,marginBottom:8}}>{m.text}</div>
                    <button style={btn("fill",true)} onClick={()=>{
                      set("writeWithMe",m.text);setTool("studio");
                      generate(`You are a content creator for the RISE framework for divorced nurse moms. Take this real personal moment and turn it into a powerful piece of content. Make it raw, specific, and real. Platform: Instagram. Max 300 words.`,`Moment: ${m.text}`, "Brand Moment");
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
          {result&&subtool!=="moments"&&<><div style={aiBox}>{stripMarkdown(result)}</div><div style={{display:"flex",gap:8,alignItems:"center",marginTop:10}}><button style={btn("fill",true)} onClick={()=>navigator.clipboard?.writeText(stripMarkdown(result))}>Copy</button><span style={{fontSize:11,color:C.rose}}>✓ Auto-saved to library</span></div></>}
        </div>
      )}

      {tool==="repurpose"&&(
        <div style={card}>
          <Sec title="Repurpose Your Content" sub="Turn one piece of content into many formats — without starting from scratch.">
            <F label="What format was the original?"><Chips options={["IG story","Caption","Reel","Email","Thread","Blog","Voice note transcript"]} selected={f.repFrom||""} onToggle={v=>set("repFrom",v)}/></F>
            <F label="Turn it into"><Chips options={["Carousel","Email","Caption","Story sequence","Pinterest pin","Reel script","LinkedIn post"]} selected={f.repTo||""} onToggle={v=>set("repTo",v)}/></F>
            <F label="Paste your content"><textarea style={{...ta,minHeight:120}} value={f.repContent||""} onChange={e=>set("repContent",e.target.value)} placeholder="Paste your caption, email, story, blog post..."/></F>
          </Sec>
          <button style={btn("fill")} onClick={()=>generate(`You are a content repurposing expert for the RISE framework. Take the content and fully rebuild it in the new format. Don't start from scratch — extract the real voice, ideas, and story. Sound exactly like the original person. Be specific. No generic fillers. Max 500 words.`,`From: ${f.repFrom||""}\nTo: ${f.repTo||""}\nContent: ${f.repContent||""}`, `Repurposed — ${f.repTo||"content"}`)}>Repurpose my content →</button>
          {loading&&<Spinner/>}
          {result&&<><div style={aiBox}>{stripMarkdown(result)}</div><div style={{display:"flex",gap:8,alignItems:"center",marginTop:10}}><button style={btn("fill",true)} onClick={()=>navigator.clipboard?.writeText(stripMarkdown(result))}>Copy</button><span style={{fontSize:11,color:C.rose}}>✓ Auto-saved to library</span></div></>}
        </div>
      )}

      {tool==="calendar"&&(
        <div style={card}>
          <Sec title="30-Day Content Calendar" sub="Pick your focus → we handle the strategy. 30 days of hooks, captions & scripts — copy-paste ready.">
            {/* Mode selector */}
            <div style={{marginBottom:"1.25rem"}}>
              <div style={{fontSize:11,color:C.roseDark,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:10}}>What's your focus this month?</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div onClick={()=>set("calMode","audience")} style={{padding:"16px 12px",borderRadius:14,cursor:"pointer",textAlign:"center",border:`1.5px solid ${f.calMode==="audience"?C.rose:C.blush}`,background:f.calMode==="audience"?C.cream:C.white,transition:"all 0.15s"}}>
                  <div style={{fontSize:26,marginBottom:6}}>🌱</div>
                  <div style={{fontWeight:700,fontSize:13,color:C.charcoal,marginBottom:4}}>Build my audience</div>
                  <div style={{fontSize:11,color:"#aaa",lineHeight:1.5}}>Just starting out — all 30 days are growth & awareness. No product needed.</div>
                </div>
                <div onClick={()=>set("calMode","sell")} style={{padding:"16px 12px",borderRadius:14,cursor:"pointer",textAlign:"center",border:`1.5px solid ${f.calMode==="sell"?C.rose:C.blush}`,background:f.calMode==="sell"?C.cream:C.white,transition:"all 0.15s"}}>
                  <div style={{fontSize:26,marginBottom:6}}>💰</div>
                  <div style={{fontWeight:700,fontSize:13,color:C.charcoal,marginBottom:4}}>Grow & sell</div>
                  <div style={{fontSize:11,color:"#aaa",lineHeight:1.5}}>You have something to sell — strategic mix of growth, selling, trust & inspiration.</div>
                </div>
              </div>
            </div>
            {f.calMode&&(
              <div style={{background:C.cream,border:`1px solid ${C.blush}`,borderRadius:10,padding:"10px 14px",marginBottom:"1rem",fontSize:11,color:C.charcoal,lineHeight:1.7}}>
                {f.calMode==="audience"
                  ?<><strong style={{color:C.roseDark}}>Your 30 days:</strong> Pain-to-Hook (days 1–10) → Narrow Content (days 11–20) → Reel Script (days 21–30) — all growth focused, CTA baked into every post.</>
                  :<><strong style={{color:C.roseDark}}>Your 30 days:</strong> Growth content (days 1–13) → Selling content (days 14–23) → Trust building (days 24–28) → Inspire (days 29–30) — all 5 angles rotated in.</>
                }
              </div>
            )}
            {(!f.niche&&!f.audience)&&(
              <div style={{background:"#fff8f7",border:`1px solid ${C.blush}`,borderRadius:10,padding:"10px 14px",fontSize:12,color:C.roseDark,marginBottom:"1rem"}}>
                ⚠️ Fill in your <strong>niche, audience & tone</strong> in the context card above before generating.
              </div>
            )}
            <F label="Personal themes or stories to weave in" hint="Real moments make content convert — the more specific the better"><textarea style={ta} value={f.calThemes||""} onChange={e=>set("calThemes",e.target.value)} placeholder="e.g. my divorce story, paying off $8k on a nurse's salary, night shift struggles, my first digital product sale..."/></F>
          </Sec>
          <button style={{...btn("fill"),opacity:f.calMode?1:0.45,cursor:f.calMode?"pointer":"not-allowed"}} onClick={()=>f.calMode&&generateCalendar()}>Generate my 30-day calendar →</button>
          {calLoading&&<div style={{margin:"1rem 0"}}><Spinner/><p style={{fontSize:12,color:"#aaa",fontStyle:"italic",marginTop:4}}>Building your 30-day content plan — this takes 20–30 seconds...</p></div>}
          {calDays.length>0&&(
            <div style={{marginTop:"1.5rem"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1rem",flexWrap:"wrap",gap:8}}>
                <div style={{fontSize:11,color:C.roseDark,fontWeight:700,letterSpacing:"0.1em"}}>{calDays.length} DAYS GENERATED · ✓ AUTO-SAVED TO LIBRARY</div>
                <button style={btn("out",true)} onClick={()=>{
                  const t="DAY\tHOOK\tCAPTION\tSCRIPT\n"+calDays.map(d=>`Day ${d.day}\t${d.hook}\t${d.caption}\t${d.script.replace(/\n/g," ")}`).join("\n");
                  navigator.clipboard?.writeText(t);
                }}>Copy all (spreadsheet format)</button>
              </div>
              {/* Column headers — desktop only */}
              {!isMobile&&(
                <div style={{display:"grid",gridTemplateColumns:"52px 1fr 1fr 1fr",gap:0,marginBottom:4,padding:"0 14px"}}>
                  {["","HOOK","CAPTION","SCRIPT"].map(h=>(
                    <div key={h} style={{fontSize:9,color:C.roseDark,letterSpacing:"0.15em",fontWeight:700,padding:"0 10px"}}>{h}</div>
                  ))}
                </div>
              )}
              {calDays.map(d=>(
                <div key={d.day} style={{border:`1px solid ${C.blush}`,borderRadius:14,marginBottom:8,overflow:"hidden",background:C.white}}>
                  {/* Day header */}
                  <div style={{background:C.cream,padding:"8px 14px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:`1px solid ${C.blush}`,flexWrap:"wrap",gap:6}}>
                    <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                      <div style={{fontWeight:700,fontSize:12,color:C.roseDark,letterSpacing:"0.1em"}}>DAY {d.day}</div>
                      {d.framework&&<div style={{fontSize:10,color:C.white,background:C.rose,borderRadius:20,padding:"2px 10px",letterSpacing:"0.05em",fontWeight:600}}>{d.framework}</div>}
                      {d.goal&&<div style={{fontSize:10,color:C.roseDark,background:C.blush,borderRadius:20,padding:"2px 10px",letterSpacing:"0.05em",fontWeight:600}}>{d.goal}</div>}
                    </div>
                    <button style={btn("out",true)} onClick={()=>navigator.clipboard?.writeText(`HOOK: ${d.hook}\n\nCAPTION:\n${d.caption}\n\nSCRIPT:\n${d.script}`)}>Copy day</button>
                  </div>
                  {/* 3 columns */}
                  <div style={{display:isMobile?"block":"grid",gridTemplateColumns:"1fr 1fr 1fr"}}>
                    <div style={{padding:"12px 14px",borderRight:isMobile?"none":`1px solid ${C.blush}`,borderBottom:isMobile?`1px solid ${C.blush}`:"none"}}>
                      {isMobile&&<div style={{fontSize:9,color:C.roseDark,letterSpacing:"0.15em",fontWeight:700,marginBottom:5}}>HOOK</div>}
                      <div style={{fontSize:13,color:C.charcoal,lineHeight:1.6,fontStyle:"italic"}}>"{d.hook}"</div>
                    </div>
                    <div style={{padding:"12px 14px",borderRight:isMobile?"none":`1px solid ${C.blush}`,borderBottom:isMobile?`1px solid ${C.blush}`:"none"}}>
                      {isMobile&&<div style={{fontSize:9,color:C.roseDark,letterSpacing:"0.15em",fontWeight:700,marginBottom:5}}>CAPTION</div>}
                      <div style={{fontSize:12,color:C.charcoal,lineHeight:1.6}}>{d.caption}</div>
                    </div>
                    <div style={{padding:"12px 14px"}}>
                      {isMobile&&<div style={{fontSize:9,color:C.roseDark,letterSpacing:"0.15em",fontWeight:700,marginBottom:5}}>SCRIPT</div>}
                      <div style={{fontSize:12,color:C.charcoal,lineHeight:1.7,whiteSpace:"pre-line"}}>{d.script}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── EXPAND ────────────────────────────────────────────────────────────────────
function ExpandTab({data,setData,onSave}){
  const isMobile=useIsMobile();
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
    setResult(r);setData(d=>({...d,expandResult:r}));onSave(r,"Expand Coaching");setLoading(false);
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
            <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:8,marginBottom:"1.25rem"}}>
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
          {result&&<><div style={aiBox}>{stripMarkdown(result)}</div><div style={{display:"flex",gap:8,alignItems:"center",marginTop:10}}><button style={btn("fill",true)} onClick={()=>navigator.clipboard?.writeText(stripMarkdown(result))}>Copy</button><span style={{fontSize:11,color:C.rose}}>✓ Auto-saved to library</span></div></>}
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
              {jRef&&<div style={{...aiBox,borderLeft:`3px solid ${C.gold}`}}><div style={{fontSize:10,color:C.gold,letterSpacing:"0.1em",marginBottom:6}}>YOUR REFLECTION</div>{stripMarkdown(jRef)}</div>}
            </Sec>
          </div>
          {(data.journal||[]).map((e,i)=>(
            <div key={i} style={{...card,marginBottom:"0.75rem"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <div style={{display:"flex",gap:8}}><span style={{background:C.blush,color:C.roseDark,borderRadius:10,padding:"2px 10px",fontSize:10}}>{e.tag}</span><span style={{fontSize:11,color:"#aaa"}}>{e.date}</span></div>
                <button style={{background:"transparent",border:"none",color:"#ccc",cursor:"pointer",fontSize:16}} onClick={()=>setData(d=>({...d,journal:(d.journal||[]).filter((_,j)=>j!==i)}))}>×</button>
              </div>
              <p style={{fontSize:13,color:C.charcoal,lineHeight:1.7,margin:"0 0 10px"}}>{e.entry}</p>
              {e.reflection&&<div style={{background:C.cream,borderRadius:8,padding:"10px 12px",fontSize:12,color:C.charcoal,lineHeight:1.6,borderLeft:`2px solid ${C.gold}`}}><span style={{fontSize:10,color:C.gold,letterSpacing:"0.08em"}}>REFLECTION · </span>{stripMarkdown(e.reflection)}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── POWER TOOLS ───────────────────────────────────────────────────────────────
function PowerToolsTab({data,setData,onSave}){
  const isMobile=useIsMobile();
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
    setResult(r);onSave(r,tool==="price"?"Price Strategy":"Where to Sell");setLoading(false);
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
              <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:8,marginTop:6}}>
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
            <F label="Price point"><Chips options={["Under $27","$27–47","$47–97","$97–197","$197–497","$497+"]} selected={wf.price||""} onToggle={v=>setW("price",v)}/></F>
            <F label="Size of audience"><Chips options={["Starting out 0–1k","Growing 1–10k","Established 10–50k","Large 50k+"]} selected={wf.audience||""} onToggle={v=>setW("audience",v)}/></F>
            <F label="Visibility"><Chips options={["Completely faceless","Hybrid","Face of business","Unsure"]} selected={wf.visibility||""} onToggle={v=>setW("visibility",v)}/></F>
            <F label="Experience level"><Chips options={["Beginner","Sold a few things","Experienced seller","Scaling"]} selected={wf.experience||""} onToggle={v=>setW("experience",v)}/></F>
          </Sec>
          <button style={btn("fill")} onClick={generate}>Find my best platform →</button>
        </div>
      )}

      {loading&&<Spinner/>}
      {result&&<><div style={aiBox}>{stripMarkdown(result)}</div><div style={{display:"flex",gap:8,alignItems:"center",marginTop:10}}><button style={btn("fill",true)} onClick={()=>navigator.clipboard?.writeText(stripMarkdown(result))}>Copy</button><span style={{fontSize:11,color:C.rose}}>✓ Auto-saved to library</span></div></>}
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
    setResult(r);onSave(r,"Pinterest");setLoading(false);
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
        {result&&<><div style={aiBox}>{stripMarkdown(result)}</div><div style={{display:"flex",gap:8,alignItems:"center",marginTop:10}}><button style={btn("fill",true)} onClick={()=>navigator.clipboard?.writeText(stripMarkdown(result))}>Copy</button><span style={{fontSize:11,color:C.rose}}>✓ Auto-saved to library</span></div></>}
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

// ── SETTINGS MODAL ───────────────────────────────────────────────────────────
function SettingsModal({user,onClose,onLogout}){
  const isMobile=useIsMobile();
  const cancelEmail="support@purelyempowered.com";
  return(
    <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:1000,background:"rgba(73,71,71,0.5)",display:"flex",alignItems:isMobile?"flex-end":"center",justifyContent:"center"}}>
      <div onClick={e=>e.stopPropagation()} style={{background:C.white,borderRadius:isMobile?"24px 24px 0 0":"24px",padding:"2rem",width:"100%",maxWidth:isMobile?"100%":430,boxShadow:"0 -8px 40px rgba(73,71,71,0.18)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"1.5rem"}}>
          <div>
            <div style={{fontSize:10,color:C.roseDark,letterSpacing:"0.15em",fontWeight:700,textTransform:"uppercase",marginBottom:3}}>Account</div>
            <div style={{fontSize:20,color:C.charcoal,fontFamily:"Georgia,serif"}}>Settings</div>
          </div>
          <button onClick={onClose} style={{background:"transparent",border:"none",fontSize:24,color:"#ccc",cursor:"pointer",lineHeight:1,padding:"0 4px"}}>×</button>
        </div>

        {/* Account info */}
        <div style={{background:C.pale,borderRadius:14,padding:"1rem 1.25rem",marginBottom:"1rem"}}>
          <div style={{fontSize:10,color:C.roseDark,letterSpacing:"0.12em",fontWeight:700,textTransform:"uppercase",marginBottom:10}}>Your account</div>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:7}}>
            <span style={{fontSize:12,color:"#bbb"}}>Name</span>
            <span style={{fontSize:13,color:C.charcoal,fontWeight:600}}>{user.name}</span>
          </div>
          <div style={{display:"flex",justifyContent:"space-between"}}>
            <span style={{fontSize:12,color:"#bbb"}}>Email</span>
            <span style={{fontSize:13,color:C.charcoal}}>{user.email}</span>
          </div>
        </div>

        {/* Membership */}
        <div style={{background:C.cream,borderRadius:14,padding:"1rem 1.25rem",marginBottom:"1rem",border:`1px solid ${C.blush}`}}>
          <div style={{fontSize:10,color:C.roseDark,letterSpacing:"0.12em",fontWeight:700,textTransform:"uppercase",marginBottom:10}}>Membership</div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <span style={{fontSize:13,color:C.charcoal}}>Purely Empowered · RISE Plan</span>
            <span style={{fontSize:11,color:C.rose,background:C.blush,borderRadius:20,padding:"2px 10px",whiteSpace:"nowrap"}}>Active</span>
          </div>
          <a href={`mailto:${cancelEmail}?subject=Cancel my RISE Plan membership&body=Hi Paulina,%0D%0A%0D%0APlease cancel my membership for the account: ${user.email}.%0D%0A%0D%0AThank you.`}
             style={{display:"block",textAlign:"center",padding:"11px",borderRadius:10,border:`1px solid rgba(196,151,148,0.4)`,color:C.roseDark,fontSize:13,textDecoration:"none",background:C.white,fontFamily:"Georgia,serif",cursor:"pointer"}}>
            Request cancellation →
          </a>
          <p style={{fontSize:11,color:"#bbb",textAlign:"center",margin:"8px 0 0",lineHeight:1.6}}>We'll cancel within 24 hours and you won't be charged again.</p>
        </div>

        {/* Logout */}
        <button onClick={onLogout} style={{...btn("out"),width:"100%",padding:"12px",marginTop:4}}>Sign out of my account</button>
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

function MobileHeader({user,onSettings}){
  return(
    <div style={{background:C.charcoal,padding:"10px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:`1px solid rgba(255,255,255,0.08)`,flexShrink:0}}>
      <div>
        <div style={{fontSize:9,letterSpacing:"0.2em",color:C.accent2,fontStyle:"italic"}}>purely empowered</div>
        <div style={{fontSize:16,color:C.rose,letterSpacing:"0.2em",lineHeight:1.2}}>RISE PLAN</div>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <div style={{fontSize:12,color:C.accent2,maxWidth:100,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user.name}</div>
        <button onClick={onSettings} style={{background:"rgba(196,151,148,0.15)",border:`1px solid rgba(196,151,148,0.25)`,color:C.accent2,cursor:"pointer",fontSize:17,padding:"5px 9px",borderRadius:8,lineHeight:1}}>⚙</button>
      </div>
    </div>
  );
}

function MobileNav({nav,setNav,saved}){
  return(
    <div style={{position:"fixed",bottom:0,left:0,right:0,background:C.charcoal,display:"flex",borderTop:`1px solid rgba(255,255,255,0.1)`,zIndex:100,paddingBottom:"env(safe-area-inset-bottom)"}}>
      {NAV.map(n=>{
        const active=nav===n.id;
        return(
          <div key={n.id} onClick={()=>setNav(n.id)} style={{flex:1,padding:"8px 2px 6px",textAlign:"center",cursor:"pointer",borderTop:active?`2px solid ${C.rose}`:"2px solid transparent"}}>
            {n.letter
              ?<div style={{width:22,height:22,borderRadius:"50%",background:active?C.rose:"rgba(196,151,148,0.2)",color:active?C.white:C.accent2,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,margin:"0 auto 2px"}}>{n.icon}</div>
              :<div style={{fontSize:15,color:active?C.rose:C.accent2,marginBottom:2}}>{n.icon}</div>
            }
            <div style={{fontSize:8,color:active?C.rose:C.accent2,letterSpacing:"0.04em",lineHeight:1}}>{n.label}{n.id==="library"&&saved.length>0?` (${saved.length})`:""}</div>
          </div>
        );
      })}
    </div>
  );
}

export default function App(){
  const[isMobile,setIsMobile]=useState(()=>window.innerWidth<640);
  const[user,setUser]=useState(null);
  const[nav,setNav]=useState("home");
  const[data,setData]=useState({});
  const[saved,setSaved]=useState([]);
  const[sideOpen,setSideOpen]=useState(true);

  useEffect(()=>{
    const h=()=>setIsMobile(window.innerWidth<640);
    window.addEventListener("resize",h);
    return()=>window.removeEventListener("resize",h);
  },[]);

  useEffect(()=>{
    const email=localStorage.getItem("rise_current_user");
    if(email){
      let name=localStorage.getItem(`rise_name_${email}`);
      if(!name){
        try{const old=localStorage.getItem(`rise_auth_${email}`);if(old)name=JSON.parse(old).name;}catch{}
      }
      name=name||email.split("@")[0];
      localStorage.setItem(`rise_name_${email}`,name);
      setUser({name,email});
      const d=localStorage.getItem(`rise_data_${email}`);if(d)setData(JSON.parse(d));
      const l=localStorage.getItem(`rise_lib_${email}`);if(l)setSaved(JSON.parse(l));
    }
  },[]);
  useEffect(()=>{if(user)localStorage.setItem(`rise_data_${user.email}`,JSON.stringify(data));},[data,user]);
  useEffect(()=>{if(user)localStorage.setItem(`rise_lib_${user.email}`,JSON.stringify(saved));},[saved,user]);

  function handleLogin(u){
    setUser(u);
    const d=localStorage.getItem(`rise_data_${u.email}`);if(d)setData(JSON.parse(d));
    const l=localStorage.getItem(`rise_lib_${u.email}`);if(l)setSaved(JSON.parse(l));
  }
  const[showSettings,setShowSettings]=useState(false);
  function logout(){localStorage.removeItem("rise_current_user");setUser(null);setData({});setSaved([]);setNav("home");setShowSettings(false);}
  function saveItem(content,tag){setSaved(p=>[{content,tag,date:new Date().toLocaleDateString("en-CA",{month:"short",day:"numeric",year:"numeric"})},...p]);}
  function deleteItem(idx){setSaved(p=>p.filter((_,i)=>i!==idx));}
  function exportLib(){
    if(!saved.length)return;
    const t=saved.map(i=>`[${i.tag}] — ${i.date}\n${"─".repeat(40)}\n${i.content}\n`).join("\n\n");
    const b=new Blob([t],{type:"text/plain"});const u=URL.createObjectURL(b);
    const a=document.createElement("a");a.href=u;a.download=`RISE-Library-${new Date().toISOString().slice(0,10)}.txt`;a.click();URL.revokeObjectURL(u);
  }

  const SIDE_W=sideOpen?200:60;

  const content=(
    <div style={{flex:1,overflow:"auto",paddingBottom:isMobile?70:0}}>
      <div style={{maxWidth:760,margin:"0 auto",padding:isMobile?"1rem":"1.75rem 1.5rem"}}>
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
  );

  return(
    <MobCtx.Provider value={isMobile}>
      {!user
        ?<LandingPage onLogin={handleLogin}/>
        :isMobile
          ?<div style={{display:"flex",flexDirection:"column",minHeight:"100vh",background:C.pale,fontFamily:"Georgia,serif"}}>
            <MobileHeader user={user} onSettings={()=>setShowSettings(true)}/>
            {content}
            <MobileNav nav={nav} setNav={setNav} saved={saved}/>
          </div>
          :<div style={{display:"flex",minHeight:"100vh",background:C.pale,fontFamily:"Georgia,serif"}}>
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
                    <button onClick={()=>setShowSettings(true)} style={{background:"transparent",border:"none",color:C.accent2,cursor:"pointer",fontSize:18,lineHeight:1,padding:"2px 4px"}} title="Settings">⚙</button>
                  </div>
                  :<button onClick={()=>setShowSettings(true)} style={{background:"transparent",border:"none",color:C.accent2,cursor:"pointer",fontSize:18,width:"100%",lineHeight:1}} title="Settings">⚙</button>
                }
              </div>
              <button onClick={()=>setSideOpen(o=>!o)} style={{position:"absolute",top:"50%",right:-12,transform:"translateY(-50%)",width:24,height:24,borderRadius:"50%",background:C.rose,border:"none",color:C.white,cursor:"pointer",fontSize:12,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 2px 8px rgba(0,0,0,0.2)"}}>
                {sideOpen?"‹":"›"}
              </button>
            </div>
            {content}
          </div>
      }
      {showSettings&&user&&<SettingsModal user={user} onClose={()=>setShowSettings(false)} onLogout={logout}/>}
    </MobCtx.Provider>
  );
}
