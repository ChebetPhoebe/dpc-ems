import React, { useState, useEffect, useRef } from "react";
import { supabase } from './supabaseClient';

// ── GOOGLE FONTS ──────────────────────────────────────────────────────────────
(() => {
  const l = document.createElement("link");
  l.rel = "stylesheet";
  l.href = "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Playfair+Display:wght@400;500;600;700&display=swap";
  document.head.appendChild(l);
})();

// ── CONSTANTS ─────────────────────────────────────────────────────────────────
const COUNTIES = ["Mombasa","Kwale","Kilifi","Tana River","Lamu","Taita-Taveta","Garissa","Wajir","Mandera","Marsabit","Isiolo","Meru","Tharaka-Nithi","Embu","Kitui","Machakos","Makueni","Nyandarua","Nyeri","Kirinyaga","Murang'a","Kiambu","Turkana","West Pokot","Samburu","Trans-Nzoia","Uasin Gishu","Elgeyo-Marakwet","Nandi","Baringo","Laikipia","Nakuru","Narok","Kajiado","Kericho","Bomet","Kakamega","Vihiga","Bungoma","Busia","Siaya","Kisumu","Homa Bay","Migori","Kisii","Nyamira","Nairobi"];
const JOB_GRADES = ["A","B","C","D","E","F","G","H","J","K","L","M","N","P","Q","R","S","T","U","V","W"];
const EDUCATION_LEVELS = ["PhD / Doctorate","Masters Degree","Bachelors Degree","Higher National Diploma","Diploma","Certificate","Kenya Certificate of Secondary Education (KCSE)","Kenya Certificate of Primary Education (KCPE)"];
const EMP_TYPES = ["Permanent & Pensionable","Contract","Temporary","Intern / Attachment","Secondment"];
const DEPARTMENTS = ["Office of the Director General","Administration & Human Resources","Finance & Accounts","ICT & Systems","Public Relations & Communications","Broadcasting Operations","Content & Production","Legal Services","Research &Policy","Procurement & Supply Chain","Customer Service","Regional Coordination"];
const REGIONS = ["Nairobi Region","Central Region","Coast Region","Eastern Region","North Eastern Region","Nyanza Region","Rift Valley Region","Western Region"];
const PROF_BODIES = ["Public Relations Society of Kenya (PRSK)","Media Council of Kenya (MCK)","Kenya Institute of Management (KIM)","Institute of Certified Public Accountants of Kenya (ICPAK)","Law Society of Kenya (LSK)","Engineers Board of Kenya (EBK)","Institute of Human Resource Management (IHRM)","ICT Authority Kenya","Kenya Institute of Mass Communication (KIMC) Alumni","Marketing Society of Kenya (MSK)","Other"];
const GENDERS = ["Male","Female","Prefer not to say"];
const MARITAL = ["Single","Married","Divorced","Widowed","Separated"];
const STATUS_OPTIONS = ["Active","On Leave","Suspended","Retired","Resigned","Pending Review"];

// ── COLORS ────────────────────────────────────────────────────────────────────
const C = {
  navy:"#0d1f3c", navy2:"#162d54", navy3:"#1e3a6e",
  gold:"#c4932a", goldL:"#e8b84b",
  white:"#ffffff", bg:"#eef1f6",
  text:"#1a202c", muted:"#64748b",
  success:"#059669", error:"#dc2626", warn:"#d97706", info:"#2563eb",
  border:"#d1d9e6"
};

// ── UTILS ─────────────────────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36);
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-KE", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const fmtTS = (d) => d ? new Date(d).toLocaleString("en-KE", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "—";
const initials = (n) => (n || "?").split(" ").filter(Boolean).map(x => x[0]).join("").toUpperCase().slice(0, 2);
const AV_COLORS = ["#1e3a6e","#7c3aed","#065f46","#92400e","#9d174d","#1e4d6e","#713f12","#7f1d1d","#164e63"];
const avColor = (n) => AV_COLORS[(n || "A").charCodeAt(0) % AV_COLORS.length];

const emptyEmp = () => ({
  personalNumber: "", firstName: "", middleName: "", lastName: "",
  dob: "", gender: "", nationalId: "", kraPin: "", nssfNo: "", nhifNo: "",
  phone: "", email: "", maritalStatus: "", nationality: "Kenyan", photo: "",
  employmentDate: "", jobTitle: "", jobGrade: "", employmentType: "", department: "", station: "",
  county: "", region: "", physicalAddress: "", workStation: "",
  education: [{ id: uid(), level: "", institution: "", fieldOfStudy: "", yearCompleted: "" }],
  professionalBodies: [{ id: uid(), bodyName: "", membershipNo: "", registrationDate: "" }],
  workExperiences: [{ id: uid(), employer: "", role: "", duration: "", startDate: "", endDate: "" }],
  yearsOfExperience: "", previousEmployer: "", previousRole: "", previousDuration: "",
  emergencyName: "", emergencyRelationship: "", emergencyPhone: "",
  status: "Active", submittedBy: "admin", notes: "",
  createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
});

const emptyAdmin = () => ({ name: "", email: "", role: "Admin" });

// ── SHARED STYLES ─────────────────────────────────────────────────────────────
const S = {
  card: { background: C.white, borderRadius: 12, boxShadow: "0 2px 16px rgba(13,31,60,0.08)", padding: 24, marginBottom: 20 },
  btn: (v = "primary") => ({
    padding: "9px 20px", borderRadius: 8, border: "none", cursor: "pointer",
    fontWeight: 600, fontSize: 14, fontFamily: "'Inter', sans-serif", transition: "opacity 0.15s",
    background: v==="primary"?C.gold:v==="danger"?C.error:v==="success"?C.success:v==="ghost"?"transparent":v==="navy"?C.navy:"#e8ecf1",
    color: ["primary","danger","success","navy"].includes(v)?C.white:v==="ghost"?C.muted:C.navy,
    border: v==="outline"?`1.5px solid ${C.border}`:"none",
  }),
  input: { width:"100%", padding:"10px 12px", borderRadius:8, border:`1.5px solid ${C.border}`, fontSize:14, fontFamily:"'Inter', sans-serif", background:C.white, color:C.text, outline:"none", boxSizing:"border-box", transition:"border 0.15s" },
  label: { fontSize: 12, fontWeight: 600, color: C.navy, marginBottom: 5, display: "block", textTransform: "uppercase", letterSpacing: 0.5, fontFamily: "'Inter', sans-serif" },
  secHead: { fontSize: 15, fontWeight: 700, color: C.navy, borderLeft: `4px solid ${C.gold}`, paddingLeft: 12, marginBottom: 20, fontFamily: "'Playfair Display', serif" },
  badge: (c) => ({
    padding: "3px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700, display:"inline-block", fontFamily: "'Inter', sans-serif",
    background: c==="Active"?"#d1fae5":c==="Pending Review"?"#fef3c7":c==="On Leave"?"#e0e7ff":c==="Suspended"?"#fee2e2":"#f1f5f9",
    color: c==="Active"?"#065f46":c==="Pending Review"?"#92400e":c==="On Leave"?"#3730a3":c==="Suspended"?"#991b1b":"#475569"
  })
};

// ── REUSABLE FORM COMPONENTS ──────────────────────────────────────────────────
const Field = ({ label, required, children, half, third }) => (
  <div style={{ flex: third?"1 1 calc(33% - 8px)":half?"1 1 calc(50% - 8px)":"1 1 100%", minWidth:0 }}>
    <label style={S.label}>{label}{required && <span style={{color:C.error}}> *</span>}</label>
    {children}
  </div>
);

const Inp = ({ value, onChange, type="text", placeholder, required, disabled, min, max }) => (
  <input style={{ ...S.input, background: disabled?"#f8fafc":"" }} type={type} value={value||""} onChange={e=>onChange(e.target.value)} placeholder={placeholder} required={required} disabled={disabled} min={min} max={max} />
);

const Sel = ({ value, onChange, options, placeholder, required }) => (
  <select style={S.input} value={value||""} onChange={e=>onChange(e.target.value)} required={required}>
    <option value="">{placeholder||"— Select —"}</option>
    {options.map(o=><option key={o} value={o}>{o}</option>)}
  </select>
);

const Textarea = ({ value, onChange, placeholder, rows=3 }) => (
  <textarea style={{ ...S.input, resize:"vertical", minHeight: rows*40 }} value={value||""} onChange={e=>onChange(e.target.value)} placeholder={placeholder} />
);

// ── LOADING ───────────────────────────────────────────────────────────────────
const LoadingScreen = () => (
  <div style={{ height:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:C.navy, flexDirection:"column", gap:20, fontFamily:"'Inter', sans-serif" }}>
    <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>
    <div style={{ position:"relative" }}>
      <div style={{ width:64, height:64, border:`3px solid rgba(196,147,42,0.2)`, borderRadius:"50%" }} />
      <div style={{ width:64, height:64, border:`3px solid ${C.gold}`, borderTopColor:"transparent", borderRadius:"50%", animation:"spin 0.8s linear infinite", position:"absolute", top:0, left:0 }} />
    </div>
    <div style={{ color:C.gold, fontFamily:"'Playfair Display',serif", fontSize:18, animation:"pulse 1.5s ease-in-out infinite" }}>Initializing System...</div>
    <div style={{ color:"rgba(255,255,255,0.4)", fontSize:12 }}>Department of Public Communication · EMS</div>
  </div>
);

// ── TOAST ─────────────────────────────────────────────────────────────────────
const Toast = ({ toast }) => toast ? (
  <div style={{ position:"fixed", bottom:28, right:28, zIndex:9999, background:toast.type==="error"?C.error:toast.type==="info"?C.info:C.success, color:C.white, padding:"14px 22px", borderRadius:12, fontWeight:500, fontSize:14, boxShadow:"0 8px 30px rgba(0,0,0,0.25)", maxWidth:340, fontFamily:"'Inter', sans-serif", display:"flex", alignItems:"center", gap:10 }}>
    <span style={{fontSize:18}}>{toast.type==="error"?"⚠️":toast.type==="info"?"ℹ️":"✅"}</span>
    {toast.msg}
  </div>
) : null;

// ── LOGIN PAGE ────────────────────────────────────────────────────────────────
const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handle = async (e) => {
    e.preventDefault(); setLoading(true); setErr("");
    const ok = await onLogin(email, pass);
    if (!ok) { setErr("Invalid email or password."); setLoading(false); }
  };

  return (
    <div style={{ minHeight:"100vh", background:`linear-gradient(160deg, ${C.navy} 0%, ${C.navy3} 60%, #0f2f5c 100%)`, display:"flex", alignItems:"center", justifyContent:"center", padding:20, fontFamily:"'Inter', sans-serif" }}>
      <style>{`*{box-sizing:border-box}body{margin:0}input:focus,select:focus,textarea:focus{border-color:${C.gold}!important;box-shadow:0 0 0 3px rgba(196,147,42,0.15)!important;outline:none!important}`}</style>
      <div style={{ background:C.white, borderRadius:24, overflow:"hidden", width:"100%", maxWidth:400, boxShadow:"0 40px 80px rgba(0,0,0,0.5)" }}>
        <div style={{ background:`linear-gradient(160deg, ${C.navy} 0%, ${C.navy3} 100%)`, padding:"40px 40px 20px", textAlign:"center" }}>
          <div style={{ width:70, height:70, borderRadius:"50%", background:`linear-gradient(135deg, ${C.gold}, ${C.goldL})`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 10px" }}>
            <img src={`${process.env.PUBLIC_URL}/coat-of-arms.png`} alt="Coat of Arms" style={{ width:45, height:45 }} />
          </div>
          <div style={{ color:C.white, fontSize:16, fontWeight:600, fontFamily:"'Playfair Display',serif" }}>Department of Public Communication</div>
        </div>
        <div style={{ padding:"30px 40px 40px" }}>
          <form onSubmit={handle}>
            <div style={{ marginBottom:16 }}>
              <label style={S.label}>Email</label>
              <Inp type="email" value={email} onChange={setEmail} placeholder="admin@mict.go.ke" required />
            </div>
            <div style={{ marginBottom:8 }}>
              <label style={S.label}>Password</label>
              <div style={{ position:"relative" }}>
                <Inp type={showPass?"text":"password"} value={pass} onChange={setPass} placeholder="••••••••••" required />
                <button type="button" onClick={()=>setShowPass(s=>!s)} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:C.muted, fontSize:14 }}>
                  {showPass ? "Hide" : "Show"}
                </button>
              </div>
            </div>
            {err && <div style={{ background:"#fef2f2", color:C.error, padding:"8px 12px", borderRadius:6, fontSize:12, marginBottom:12, border:`1px solid #fecaca` }}>{err}</div>}
            <button style={{ ...S.btn("primary"), width:"100%", padding:"12px", fontSize:14, marginTop:12 }} disabled={loading}>
              {loading ? "Authenticating..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// ── HORIZONTAL TOP NAVIGATION ─────────────────────────────────────────────────
const NAV_ITEMS = [
  { id:"dashboard", label:"Dashboard" },
  { id:"employees", label:"Employee Database" },
  { id:"add-employee", label:"Add Employee" },
  { id:"leave-requests", label:"Leave Requests" },
  { id:"admins", label:"Admin Management" },
];

const TopNav = ({ view, navigate }) => (
  <div style={{ background:C.white, borderBottom:`1px solid ${C.border}`, padding:"0 28px", display:"flex", alignItems:"center", gap:32, height:56 }}>
    {NAV_ITEMS.map(n => {
      const active = view===n.id || (n.id==="employees" && ["view-employee","edit-employee"].includes(view));
      return (
        <button key={n.id} onClick={()=>navigate(n.id)} style={{ background:"none", border:"none", cursor:"pointer", fontFamily:"'Inter', sans-serif", fontSize:14, fontWeight:active?600:400, color:active?C.gold:C.navy, borderBottom:active?`2px solid ${C.gold}`:"none", padding:"8px 0" }}>
          {n.label}
        </button>
      );
    })}
  </div>
);

// ── SIDEBAR (hamburger) with stats ────────────────────────────────────────────
const Sidebar = ({ isOpen, toggleSidebar, employees, admin, onLogout }) => {
  const sidebarRef = useRef(null);
  const active = employees.filter(e=>e.status==="Active").length;
  const pending = employees.filter(e=>e.status==="Pending Review").length;
  const onLeave = employees.filter(e=>e.status==="On Leave").length;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target) && isOpen) {
        toggleSidebar();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, toggleSidebar]);

  if (!isOpen) return null;

  return (
    <>
      <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:1001 }} onClick={toggleSidebar} />
      <div ref={sidebarRef} style={{ position:"fixed", top:0, left:0, width:280, height:"100vh", background:C.white, boxShadow:"2px 0 10px rgba(0,0,0,0.1)", zIndex:1002, display:"flex", flexDirection:"column", overflowY:"auto", padding:20 }}>
        <div style={{ marginBottom:24 }}>
          <div style={{ fontSize:14, fontWeight:600, color:C.muted, marginBottom:12 }}>Stats</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <div style={{ background:C.bg, borderRadius:8, padding:12 }}>
              <div style={{ fontSize:11, color:C.muted, textTransform:"uppercase" }}>Total</div>
              <div style={{ fontSize:24, fontWeight:700, color:C.navy }}>{employees.length}</div>
            </div>
            <div style={{ background:C.bg, borderRadius:8, padding:12 }}>
              <div style={{ fontSize:11, color:C.muted, textTransform:"uppercase" }}>Active</div>
              <div style={{ fontSize:24, fontWeight:700, color:C.navy }}>{active}</div>
            </div>
            <div style={{ background:C.bg, borderRadius:8, padding:12 }}>
              <div style={{ fontSize:11, color:C.muted, textTransform:"uppercase" }}>Pending</div>
              <div style={{ fontSize:24, fontWeight:700, color:C.navy }}>{pending}</div>
            </div>
            <div style={{ background:C.bg, borderRadius:8, padding:12 }}>
              <div style={{ fontSize:11, color:C.muted, textTransform:"uppercase" }}>On Leave</div>
              <div style={{ fontSize:24, fontWeight:700, color:C.navy }}>{onLeave}</div>
            </div>
          </div>
        </div>

        <div style={{ marginTop:"auto", borderTop:`1px solid ${C.border}`, paddingTop:16 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:40, height:40, borderRadius:"50%", background:C.gold, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, fontWeight:800, color:C.navy }}>{initials(admin?.name)}</div>
            <div>
              <div style={{ fontSize:14, fontWeight:600 }}>{admin?.name}</div>
              <div style={{ fontSize:12, color:C.muted }}>{admin?.role}</div>
            </div>
          </div>
          <button onClick={onLogout} style={{ width:"100%", marginTop:16, padding:"10px", background:"transparent", border:`1px solid ${C.gold}`, color:C.gold, borderRadius:6, cursor:"pointer", fontSize:14 }}>Sign Out</button>
        </div>
      </div>
    </>
  );
};

// ── ADMIN LAYOUT (with bell) ──────────────────────────────────────────────────
const AdminLayout = ({ children, admin, view, navigate, onLogout, toast, employees, activity }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);
  const toggleSidebar = () => setSidebarOpen(prev => !prev);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div style={{ minHeight:"100vh", fontFamily:"'Inter', sans-serif", background:C.bg }}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}body{margin:0}input:focus,select:focus,textarea:focus{border-color:${C.gold}!important;box-shadow:0 0 0 3px rgba(196,147,42,0.12)!important;outline:none!important}@media print{.no-print{display:none!important}}`}</style>
      
      <div style={{ background:C.white, borderBottom:`1px solid ${C.border}`, padding:"16px 28px", display:"flex", alignItems:"center", gap:16 }}>
        <img src={`${process.env.PUBLIC_URL}/coat-of-arms.png`} alt="Coat of Arms" style={{ width:45, height:45 }} />
        <div>
          <div style={{ fontSize:12, color:C.muted, letterSpacing:1, textTransform:"uppercase" }}>Republic of Kenya</div>
          <div style={{ fontSize:16, fontWeight:700, color:C.navy, fontFamily:"'Playfair Display',serif" }}>MINISTRY OF INFORMATION, COMMUNICATIONS AND THE DIGITAL ECONOMY (MICDE)</div>
          <div style={{ fontSize:13, color:C.muted }}>State Department of Broadcasting & Telecommunication · Department of Public Communication</div>
        </div>
        <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:16 }}>
          <div style={{ fontSize:14, color:C.muted }}>{new Date().toLocaleDateString("en-KE",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</div>
          <div style={{ width:1, height:30, background:C.border }} />
          
          {/* Bell icon with dropdown */}
          <div style={{ position:"relative" }} ref={dropdownRef}>
            <button onClick={() => setShowNotifications(!showNotifications)} style={{ background:"none", border:"none", cursor:"pointer", fontSize:20 }}>
              🔔
              {activity && activity.filter(a => !a.read).length > 0 && (
                <span style={{ position:"absolute", top:-5, right:-5, background:C.error, color:C.white, borderRadius:"50%", width:16, height:16, fontSize:10, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  {activity.filter(a => !a.read).length}
                </span>
              )}
            </button>
            {showNotifications && (
              <div style={{ position:"absolute", right:0, top:35, width:280, background:C.white, borderRadius:8, boxShadow:"0 4px 20px rgba(0,0,0,0.15)", zIndex:1000, maxHeight:350, overflowY:"auto" }}>
                <div style={{ padding:"10px 16px", borderBottom:`1px solid ${C.border}`, fontWeight:600 }}>Recent Activity</div>
                {activity && activity.length ? activity.slice(0,8).map(a => (
                  <div key={a.id} style={{ padding:"8px 16px", borderBottom:`1px solid ${C.border}`, fontSize:12 }}>
                    <div style={{ fontWeight:500 }}>{a.details}</div>
                    <div style={{ fontSize:10, color:C.muted }}>{fmtTS(a.timestamp)} · {a.adminName}</div>
                  </div>
                )) : <div style={{ padding:"16px", textAlign:"center", color:C.muted }}>No recent activity</div>}
              </div>
            )}
          </div>

          <div style={{ width:1, height:30, background:C.border }} />
          <div style={{ fontSize:14, fontWeight:600, color:C.navy, background:C.bg, padding:"6px 14px", borderRadius:20, border:`1px solid ${C.border}` }}>
            {admin?.name}
          </div>
        </div>
      </div>

      <TopNav view={view} navigate={navigate} />

      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} employees={employees} admin={admin} onLogout={onLogout} />

      <main style={{ padding:28 }}>
        {React.isValidElement(children) ? React.cloneElement(children, { toggleSidebar }) : children}
      </main>
      <Toast toast={toast} />
    </div>
  );
};

// ── DASHBOARD ─────────────────────────────────────────────────────────────────
const Dashboard = ({ employees, navigate, admin, leaveRequests, toggleSidebar }) => {
  const regLink = `${window.location.href.split("#")[0]}#register`;
  const leaveLink = `${window.location.href.split("#")[0]}#leave-request`;
  const pendingLeaves = leaveRequests.filter(r => r.status === "Pending").length;

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:24 }}>
        <button onClick={toggleSidebar} style={{ background:"none", border:"none", cursor:"pointer", fontSize:24, color:C.navy }}>
          ☰
        </button>
        <h1 style={{ fontSize:24, fontWeight:700, color:C.navy, fontFamily:"'Playfair Display',serif", margin:0 }}>Dashboard</h1>
      </div>

      <div style={{ ...S.card, background:`linear-gradient(135deg, ${C.navy} 0%, ${C.navy2} 100%)`, marginBottom:24 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:16, flexWrap:"wrap" }}>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:16, fontWeight:700, color:C.white, fontFamily:"'Playfair Display',serif", marginBottom:6 }}>Employee Self-Registration Portal</div>
            <div style={{ background:"rgba(0,0,0,0.2)", padding:"10px 16px", borderRadius:8, fontSize:12, fontFamily:"monospace", color:C.goldL, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:500 }}>{regLink}</div>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={()=>{navigator.clipboard.writeText(regLink); alert("Link copied!");}} style={{ ...S.btn("primary"), background:C.gold }}>Copy Link</button>
          </div>
        </div>
      </div>

      <div style={{ ...S.card, background:`linear-gradient(135deg, ${C.navy2} 0%, ${C.navy3} 100%)`, marginBottom:24 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:16, flexWrap:"wrap" }}>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:16, fontWeight:700, color:C.white, fontFamily:"'Playfair Display',serif", marginBottom:6 }}>Employee Leave Request Portal</div>
            <div style={{ background:"rgba(0,0,0,0.2)", padding:"10px 16px", borderRadius:8, fontSize:12, fontFamily:"monospace", color:C.goldL, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:500 }}>{leaveLink}</div>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={()=>{navigator.clipboard.writeText(leaveLink); alert("Link copied!");}} style={{ ...S.btn("primary"), background:C.gold }}>Copy Link</button>
          </div>
        </div>
      </div>

      <div style={{ ...S.card }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <h3 style={{ fontSize:18, fontWeight:700, color:C.navy, fontFamily:"'Playfair Display',serif" }}>Leave Requests</h3>
          {pendingLeaves > 0 && (
            <span style={{ background:C.warn, color:C.white, padding:"4px 10px", borderRadius:20, fontSize:12 }}>{pendingLeaves} pending</span>
          )}
        </div>
        <p style={{ color:C.muted, marginBottom:16 }}>{pendingLeaves} leave request{pendingLeaves!==1?"s":""} awaiting review.</p>
        <button onClick={()=>navigate("leave-requests")} style={S.btn("primary")}>Manage Leave Requests</button>
      </div>
    </div>
  );
};

// ── EMPLOYEE LIST ─────────────────────────────────────────────────────────────
const EmployeeList = ({ employees, navigate, onDelete, onApprove, onRefresh }) => {
  const [search, setSearch] = useState("");
  const [deptF, setDeptF] = useState("All");
  const [statusF, setStatusF] = useState("All");
  const [page, setPage] = useState(1);
  const PER_PAGE = 15;

  const filtered = employees.filter(e => {
    const q = search.toLowerCase();
    const match = !q || `${e.firstName} ${e.middleName} ${e.lastName} ${e.personalNumber} ${e.nationalId} ${e.jobTitle} ${e.email} ${e.phone}`.toLowerCase().includes(q);
    return match && (deptF==="All"||e.department===deptF) && (statusF==="All"||e.status===statusF);
  });
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paged = filtered.slice((page-1)*PER_PAGE, page*PER_PAGE);

  const exportCSV = () => {
    const h = ["Personal No","First Name","Middle Name","Last Name","Gender","DOB","National ID","KRA PIN","NSSF","NHIF","Phone","Email","Marital Status","Employment Date","Job Title","Job Grade","Employment Type","Department","Station","County","Region","Work Station","Years Experience","Status","Submitted By","Created"];
    const r = filtered.map(e=>[e.personalNumber,e.firstName,e.middleName,e.lastName,e.gender,e.dob,e.nationalId,e.kraPin,e.nssfNo,e.nhifNo,e.phone,e.email,e.maritalStatus,e.employmentDate,e.jobTitle,e.jobGrade,e.employmentType,e.department,e.station,e.county,e.region,e.workStation,e.yearsOfExperience,e.status,e.submittedBy,e.createdAt]);
    const csv = [h,...r].map(row=>row.map(v=>`"${(v||"").toString().replace(/"/g,'""')}"`).join(",")).join("\n");
    const a=document.createElement("a"); a.href=`data:text/csv;charset=utf-8,\uFEFF${encodeURIComponent(csv)}`; a.download=`DPC_Employees_${new Date().toISOString().slice(0,10)}.csv`; a.click();
  };

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
        <div>
          <div style={{ fontSize:24, fontWeight:700, color:C.navy, fontFamily:"'Playfair Display',serif" }}>Employee Database</div>
          <div style={{ color:C.muted, fontSize:14 }}>{filtered.length} record{filtered.length!==1?"s":""}</div>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <button onClick={exportCSV} style={S.btn("outline")}>Export CSV</button>
          <button onClick={()=>navigate("add-employee")} style={S.btn("primary")}>Add Employee</button>
          <button onClick={onRefresh} style={{ ...S.btn("outline"), marginLeft:8 }}>↻ Refresh</button>
        </div>
      </div>

      <div style={{ ...S.card, padding:16, display:"flex", gap:12, flexWrap:"wrap", marginBottom:0, borderRadius:"12px 12px 0 0" }}>
        <input style={{ ...S.input, maxWidth:300 }} placeholder="Search..." value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} />
        <select style={{ ...S.input, maxWidth:200 }} value={deptF} onChange={e=>{setDeptF(e.target.value);setPage(1);}}>
          <option value="All">All Departments</option>
          {DEPARTMENTS.map(d=><option key={d}>{d}</option>)}
        </select>
        <select style={{ ...S.input, maxWidth:150 }} value={statusF} onChange={e=>{setStatusF(e.target.value);setPage(1);}}>
          <option value="All">All Statuses</option>
          {STATUS_OPTIONS.map(s=><option key={s}>{s}</option>)}
        </select>
        {(search||deptF!=="All"||statusF!=="All") && (
          <button onClick={()=>{setSearch("");setDeptF("All");setStatusF("All");setPage(1);}} style={{ ...S.btn("ghost"), color:C.error, fontSize:13 }}>✕ Clear</button>
        )}
      </div>

      <div style={{ ...S.card, padding:0, overflow:"hidden", borderRadius:"0 0 12px 12px", marginTop:0 }}>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
            <thead>
              <tr style={{ background:C.navy, color:C.white }}>
                {["","Personal No.","Full Name","Department","Job Title","Grade","Type","County","Status","Actions"].map(h=>(
                  <th key={h} style={{ padding:"12px 14px", textAlign:"left", fontWeight:600, fontSize:11, whiteSpace:"nowrap", letterSpacing:0.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.length===0 ? (
                <tr><td colSpan={10} style={{ textAlign:"center", padding:60, color:C.muted }}>
                  {employees.length ? "No employees match your search." : "No employees yet."}
                </td></tr>
              ) : paged.map((e,i) => (
                <tr key={e.id} style={{ borderBottom:`1px solid ${C.border}`, background:i%2===0?C.white:"#fafbfc" }}>
                  <td style={{ padding:"10px 14px" }}>
                    <div style={{ width:34, height:34, borderRadius:"50%", background:avColor(`${e.firstName}${e.lastName}`), display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, color:C.white }}>{initials(`${e.firstName} ${e.lastName}`)}</div>
                  </td>
                  <td style={{ padding:"10px 14px", fontFamily:"monospace", fontSize:12, color:C.gold, fontWeight:700, whiteSpace:"nowrap" }}>{e.personalNumber}</td>
                  <td style={{ padding:"10px 14px", fontWeight:600, color:C.text, whiteSpace:"nowrap" }}>{e.firstName} {e.middleName} {e.lastName}</td>
                  <td style={{ padding:"10px 14px", color:C.muted, maxWidth:160, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{e.department||"—"}</td>
                  <td style={{ padding:"10px 14px", whiteSpace:"nowrap" }}>{e.jobTitle||"—"}</td>
                  <td style={{ padding:"10px 14px", textAlign:"center", fontWeight:700, color:C.navy }}>{e.jobGrade||"—"}</td>
                  <td style={{ padding:"10px 14px", color:C.muted, whiteSpace:"nowrap" }}>{e.employmentType?.split(" ")[0]||"—"}</td>
                  <td style={{ padding:"10px 14px" }}>{e.county||"—"}</td>
                  <td style={{ padding:"10px 14px" }}><span style={S.badge(e.status)}>{e.status}</span></td>
                  <td style={{ padding:"10px 14px" }}>
                    <div style={{ display:"flex", gap:4 }}>
                      {e.status === "Pending Review" && (
                        <button onClick={() => onApprove(e.id)} style={{ ...S.btn("success"), padding:"5px 8px", fontSize:11 }}>✓ Approve</button>
                      )}
                      <button onClick={()=>navigate("view-employee",e)} style={{ ...S.btn("outline"), padding:"5px 8px", fontSize:11 }}>View</button>
                      <button onClick={()=>navigate("edit-employee",e)} style={{ ...S.btn("outline"), padding:"5px 8px", fontSize:11 }}>Edit</button>
                      <button onClick={()=>{if(window.confirm(`Remove ${e.firstName} ${e.lastName}?`))onDelete(e.id);}} style={{ ...S.btn("danger"), padding:"5px 8px", fontSize:11 }}>✕</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages>1 && (
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 20px", borderTop:`1px solid ${C.border}` }}>
            <div style={{ color:C.muted, fontSize:13 }}>Page {page} of {totalPages}</div>
            <div style={{ display:"flex", gap:6 }}>
              <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} style={{ ...S.btn("outline"), padding:"6px 12px", fontSize:12 }}>← Prev</button>
              {Array.from({length:Math.min(5,totalPages)},(_,i)=>{const p=Math.max(1,Math.min(totalPages-4,page-2))+i; return (
                <button key={p} onClick={()=>setPage(p)} style={{ ...S.btn(p===page?"primary":"outline"), padding:"6px 10px", fontSize:12 }}>{p}</button>
              );})}
              <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages} style={{ ...S.btn("outline"), padding:"6px 12px", fontSize:12 }}>Next →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ── EMPLOYEE FORM ─────────────────────────────────────────────────────────────
const EmployeeForm = ({ employee, onSave, navigate, employees }) => {
  const [form, setForm] = useState(employee ? {
    ...employee,
    education: employee.education || [{id:uid(),level:"",institution:"",fieldOfStudy:"",yearCompleted:""}],
    professionalBodies: employee.professionalBodies || [{id:uid(),bodyName:"",membershipNo:"",registrationDate:""}],
    workExperiences: employee.workExperiences || [{id:uid(),employer:"",role:"",duration:"",startDate:"",endDate:""}]
  } : { ...emptyEmp(), personalNumber: "" });
  const [tab, setTab] = useState(0);
  const [validationError, setValidationError] = useState('');

  const requiredFieldsPerTab = {
    0: ['firstName', 'lastName', 'nationalId', 'personalNumber', 'phone'],
    1: ['jobTitle'],
    2: ['county'],
    3: [],
    4: [],
    5: [],
    6: [],
  };

  const validateTab = (tabIndex) => {
    const required = requiredFieldsPerTab[tabIndex];
    for (let field of required) {
      const value = form[field];
      if (!value || value.trim() === '') {
        setValidationError(`${field} is required.`);
        return false;
      }
    }
    setValidationError('');
    return true;
  };

  const set = (f, v) => setForm(p => ({...p, [f]:v}));
  const setEdu = (i, f, v) => setForm(p => { const e=[...p.education]; e[i]={...e[i],[f]:v}; return {...p,education:e}; });
  const addEdu = () => setForm(p => ({...p, education:[...p.education, {id:uid(),level:"",institution:"",fieldOfStudy:"",yearCompleted:""}]}));
  const rmEdu = (i) => setForm(p => ({...p, education:p.education.filter((_,j)=>j!==i)}));
  const setProf = (i, f, v) => setForm(p => { const b=[...p.professionalBodies]; b[i]={...b[i],[f]:v}; return {...p,professionalBodies:b}; });
  const addProf = () => setForm(p => ({...p, professionalBodies:[...p.professionalBodies, {id:uid(),bodyName:"",membershipNo:"",registrationDate:""}]}));
  const rmProf = (i) => setForm(p => ({...p, professionalBodies:p.professionalBodies.filter((_,j)=>j!==i)}));
  const setWork = (i, f, v) => setForm(p => { const w=[...p.workExperiences]; w[i]={...w[i],[f]:v}; return {...p,workExperiences:w}; });
  const addWork = () => setForm(p => ({...p, workExperiences:[...p.workExperiences, {id:uid(),employer:"",role:"",duration:"",startDate:"",endDate:""}]}));
  const rmWork = (i) => setForm(p => ({...p, workExperiences:p.workExperiences.filter((_,j)=>j!==i)}));

  const save = () => {
    for (let tabIndex in requiredFieldsPerTab) {
      for (let field of requiredFieldsPerTab[tabIndex]) {
        const value = form[field];
        if (!value || value.trim() === '') {
          alert(`${field} is required in tab ${parseInt(tabIndex)+1}.`);
          setTab(parseInt(tabIndex));
          return;
        }
      }
    }
    onSave({...form, updatedAt:new Date().toISOString()});
  };

  const TABS = ["Personal Info","Employment","Deployment","Education","Prof. Bodies","Work Experience","Emergency"];
  const tabBtn = (i) => ({ padding:"8px 16px", borderRadius:8, border:"none", cursor:"pointer", fontFamily:"'Inter', sans-serif", fontSize:13, fontWeight:tab===i?700:400, background:tab===i?C.gold:"transparent", color:tab===i?C.white:C.navy, transition:"all 0.15s" });

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:22 }}>
        <button onClick={()=>navigate("employees")} style={{ ...S.btn("ghost"), color:C.muted, padding:"8px 12px" }}>← Back</button>
        <div>
          <div style={{ fontSize:22, fontWeight:700, color:C.navy, fontFamily:"'Playfair Display',serif" }}>{employee?"Edit Employee Record":"Add New Employee"}</div>
          <div style={{ color:C.muted, fontSize:13 }}>Personal Number: <span style={{ fontWeight:700, color:C.gold, fontFamily:"monospace" }}>{form.personalNumber}</span></div>
        </div>
      </div>

      <div style={{ background:C.white, borderRadius:"12px 12px 0 0", padding:"10px 14px", borderBottom:`2px solid ${C.gold}`, display:"flex", gap:4, flexWrap:"wrap", boxShadow:"0 2px 16px rgba(13,31,60,0.08)" }}>
        {TABS.map((t,i)=><button key={i} style={tabBtn(i)} onClick={()=>setTab(i)}>{i+1}. {t}</button>)}
      </div>

      <div style={{ ...S.card, borderRadius:"0 0 12px 12px", marginTop:0 }}>
        {tab===0 && (
          <div>
            <div style={S.secHead}>Personal Information</div>
            {validationError && <div style={{ color:C.error, marginBottom:10 }}>{validationError}</div>}
            <div style={{ display:"flex", flexWrap:"wrap", gap:16 }}>
              <Field label="First Name" required half><Inp value={form.firstName} onChange={v=>set("firstName",v)} required /></Field>
              <Field label="Middle Name" half><Inp value={form.middleName} onChange={v=>set("middleName",v)} /></Field>
              <Field label="Last Name" required half><Inp value={form.lastName} onChange={v=>set("lastName",v)} required /></Field>
              <Field label="Date of Birth" half><Inp type="date" value={form.dob} onChange={v=>set("dob",v)} /></Field>
              <Field label="Gender" half><Sel value={form.gender} onChange={v=>set("gender",v)} options={GENDERS} /></Field>
              <Field label="Marital Status" half><Sel value={form.maritalStatus} onChange={v=>set("maritalStatus",v)} options={MARITAL} /></Field>
              <Field label="National ID Number" required half><Inp value={form.nationalId} onChange={v=>set("nationalId",v)} placeholder="e.g. 12345678" required /></Field>
              <Field label="Personal Number (e.g., P/F 2025/00123)" required half>
                <Inp value={form.personalNumber} onChange={v=>set("personalNumber",v)} placeholder="e.g. P/F 2025/00123" required />
              </Field>
              <Field label="Nationality" half><Inp value={form.nationality} onChange={v=>set("nationality",v)} /></Field>
              <Field label="KRA PIN" half><Inp value={form.kraPin} onChange={v=>set("kraPin",v)} placeholder="A001234567B" /></Field>
              <Field label="NSSF Number" half><Inp value={form.nssfNo} onChange={v=>set("nssfNo",v)} /></Field>
              <Field label="NHIF Number" half><Inp value={form.nhifNo} onChange={v=>set("nhifNo",v)} /></Field>
              <Field label="Phone Number" required half><Inp value={form.phone} onChange={v=>set("phone",v)} placeholder="+254 7XX XXX XXX" required /></Field>
              <Field label="Email Address"><Inp type="email" value={form.email} onChange={v=>set("email",v)} placeholder="firstname.lastname@mict.go.ke" /></Field>
            </div>
          </div>
        )}

        {tab===1 && (
          <div>
            <div style={S.secHead}>Employment Details</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:16 }}>
              <Field label="Date of First Employment" half><Inp type="date" value={form.employmentDate} onChange={v=>set("employmentDate",v)} /></Field>
              <Field label="Job Title / Designation" required half><Inp value={form.jobTitle} onChange={v=>set("jobTitle",v)} placeholder="e.g. Senior Communications Officer" required /></Field>
              <Field label="Job Group / Grade" half><Sel value={form.jobGrade} onChange={v=>set("jobGrade",v)} options={JOB_GRADES} /></Field>
              <Field label="Employment Type" half><Sel value={form.employmentType} onChange={v=>set("employmentType",v)} options={EMP_TYPES} /></Field>
              <Field label="Department" half><Sel value={form.department} onChange={v=>set("department",v)} options={DEPARTMENTS} /></Field>
              <Field label="Station / Branch Office" half><Inp value={form.station} onChange={v=>set("station",v)} placeholder="e.g. Broadcasting House — HQ" /></Field>
            </div>
          </div>
        )}

        {tab===2 && (
          <div>
            <div style={S.secHead}>Place of Deployment</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:16 }}>
              <Field label="County of Deployment" required half><Sel value={form.county} onChange={v=>set("county",v)} options={COUNTIES} required /></Field>
              <Field label="Region" half><Sel value={form.region} onChange={v=>set("region",v)} options={REGIONS} /></Field>
              <Field label="Physical Address" half><Inp value={form.physicalAddress} onChange={v=>set("physicalAddress",v)} placeholder="Building, Street, Town" /></Field>
              <Field label="Work Station / Office" half><Inp value={form.workStation} onChange={v=>set("workStation",v)} placeholder="e.g. Broadcasting House" /></Field>
            </div>
          </div>
        )}

        {tab===3 && (
          <div>
            <div style={S.secHead}>Education Background</div>
            {form.education.map((e,i) => (
              <div key={e.id||i} style={{ background:"#f8fafc", border:`1px solid ${C.border}`, borderRadius:10, padding:18, marginBottom:16 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:14 }}>
                  <div style={{ fontWeight:600, color:C.navy, fontSize:14 }}>Qualification {i+1}</div>
                  {i>0 && <button onClick={()=>rmEdu(i)} style={{ ...S.btn("danger"), padding:"4px 12px", fontSize:12 }}>Remove</button>}
                </div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:12 }}>
                  <Field label="Education Level" half><Sel value={e.level} onChange={v=>setEdu(i,"level",v)} options={EDUCATION_LEVELS} /></Field>
                  <Field label="Year Completed" half><Inp type="number" value={e.yearCompleted} onChange={v=>setEdu(i,"yearCompleted",v)} placeholder="e.g. 2018" min="1960" max="2030" /></Field>
                  <Field label="Institution / University" half><Inp value={e.institution} onChange={v=>setEdu(i,"institution",v)} placeholder="e.g. University of Nairobi" /></Field>
                  <Field label="Field of Study / Course" half><Inp value={e.fieldOfStudy} onChange={v=>setEdu(i,"fieldOfStudy",v)} placeholder="e.g. Mass Communication" /></Field>
                </div>
              </div>
            ))}
            <button onClick={addEdu} style={{ ...S.btn("outline"), fontSize:13 }}>+ Add Another Qualification</button>
          </div>
        )}

        {tab===4 && (
          <div>
            <div style={S.secHead}>Professional Body Memberships</div>
            {form.professionalBodies.map((p,i) => (
              <div key={p.id||i} style={{ background:"#f8fafc", border:`1px solid ${C.border}`, borderRadius:10, padding:18, marginBottom:16 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:14 }}>
                  <div style={{ fontWeight:600, color:C.navy, fontSize:14 }}>Membership {i+1}</div>
                  {i>0 && <button onClick={()=>rmProf(i)} style={{ ...S.btn("danger"), padding:"4px 12px", fontSize:12 }}>Remove</button>}
                </div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:12 }}>
                  <Field label="Professional Body" half><Sel value={p.bodyName} onChange={v=>setProf(i,"bodyName",v)} options={PROF_BODIES} /></Field>
                  <Field label="Membership / Registration No." half><Inp value={p.membershipNo} onChange={v=>setProf(i,"membershipNo",v)} placeholder="e.g. PRSK/2021/0123" /></Field>
                  <Field label="Registration Date" half><Inp type="date" value={p.registrationDate} onChange={v=>setProf(i,"registrationDate",v)} /></Field>
                </div>
              </div>
            ))}
            <button onClick={addProf} style={{ ...S.btn("outline"), fontSize:13 }}>+ Add Membership</button>
          </div>
        )}

        {tab===5 && (
          <div>
            <div style={S.secHead}>Work Experience</div>
            {form.workExperiences.map((exp, i) => (
              <div key={exp.id || i} style={{ background:"#f8fafc", border:`1px solid ${C.border}`, borderRadius:10, padding:18, marginBottom:16 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:14 }}>
                  <div style={{ fontWeight:600, color:C.navy, fontSize:14 }}>Experience {i+1}</div>
                  {i>0 && <button onClick={()=>rmWork(i)} style={{ ...S.btn("danger"), padding:"4px 12px", fontSize:12 }}>Remove</button>}
                </div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:12 }}>
                  <Field label="Employer / Organization" half>
                    <Inp value={exp.employer} onChange={v => setWork(i, "employer", v)} placeholder="e.g. Nation Media Group" />
                  </Field>
                  <Field label="Role / Position" half>
                    <Inp value={exp.role} onChange={v => setWork(i, "role", v)} placeholder="e.g. Senior Reporter" />
                  </Field>
                  <Field label="Duration (e.g., 2 years)" half>
                    <Inp value={exp.duration} onChange={v => setWork(i, "duration", v)} placeholder="e.g. 3 years 6 months" />
                  </Field>
                  <Field label="Start Date" half>
                    <Inp type="date" value={exp.startDate} onChange={v => setWork(i, "startDate", v)} />
                  </Field>
                  <Field label="End Date (leave blank if current)" half>
                    <Inp type="date" value={exp.endDate} onChange={v => setWork(i, "endDate", v)} />
                  </Field>
                </div>
              </div>
            ))}
            <button onClick={addWork} style={{ ...S.btn("outline"), fontSize:13 }}>+ Add Another Experience</button>
          </div>
        )}

        {tab===6 && (
          <div>
            <div style={S.secHead}>Emergency Contact</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:16, marginBottom:28 }}>
              <Field label="Full Name" half><Inp value={form.emergencyName} onChange={v=>set("emergencyName",v)} placeholder="Next of kin full name" /></Field>
              <Field label="Relationship" half><Inp value={form.emergencyRelationship} onChange={v=>set("emergencyRelationship",v)} placeholder="e.g. Spouse, Parent, Sibling" /></Field>
              <Field label="Phone Number" half><Inp value={form.emergencyPhone} onChange={v=>set("emergencyPhone",v)} placeholder="+254 7XX XXX XXX" /></Field>
            </div>
            <div style={S.secHead}>Additional Notes / Remarks</div>
            <Textarea value={form.notes} onChange={v=>set("notes",v)} placeholder="Any additional information, remarks, or special instructions..." rows={4} />
          </div>
        )}

        <div style={{ display:"flex", justifyContent:"space-between", marginTop:28, paddingTop:22, borderTop:`1px solid ${C.border}` }}>
          <div style={{ display:"flex", gap:8 }}>
            {tab>0 && <button onClick={()=>setTab(t=>t-1)} style={S.btn("outline")}>← Previous</button>}
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={()=>navigate("employees")} style={S.btn("ghost")}>Cancel</button>
            {tab<TABS.length-1
              ? <button onClick={() => { if (validateTab(tab)) setTab(t => t + 1); }} style={S.btn("primary")}>Next Section →</button>
              : <button onClick={save} style={{ ...S.btn("success"), padding:"10px 28px" }}>✓ Save Employee Record</button>
            }
          </div>
        </div>
      </div>
    </div>
  );
};

// ── EMPLOYEE PROFILE ──────────────────────────────────────────────────────────
const Row = ({ label, value }) => (
  <div style={{ display:"flex", gap:12, padding:"9px 0", borderBottom:`1px solid ${C.border}` }}>
    <div style={{ width:190, color:C.muted, fontSize:12, fontWeight:600, textTransform:"uppercase", letterSpacing:0.4, flexShrink:0, paddingTop:1 }}>{label}</div>
    <div style={{ fontSize:13, color:C.text, fontWeight:500, flex:1 }}>{value||"—"}</div>
  </div>
);

const EmployeeProfile = ({ employee:e, navigate, onDelete }) => {
  const fullName = `${e.firstName} ${e.middleName} ${e.lastName}`.replace(/\s+/g," ").trim();
  return (
    <div>
      <div className="no-print" style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:22, flexWrap:"wrap", gap:12 }}>
        <div style={{ display:"flex", gap:10, alignItems:"center" }}>
          <button onClick={()=>navigate("employees")} style={{ ...S.btn("ghost"), color:C.muted }}>← Back</button>
          <div style={{ fontSize:22, fontWeight:700, color:C.navy, fontFamily:"'Playfair Display',serif" }}>Employee Profile</div>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <button onClick={()=>window.print()} style={S.btn("outline")}>Print</button>
          <button onClick={()=>navigate("edit-employee",e)} style={S.btn("primary")}>✏ Edit Record</button>
          <button onClick={()=>{if(window.confirm(`Permanently remove ${fullName} from the system?`))onDelete(e.id);}} style={S.btn("danger")}>🗑 Delete</button>
        </div>
      </div>

      <div style={{ background:`linear-gradient(135deg, ${C.navy} 0%, ${C.navy3} 100%)`, borderRadius:14, padding:"24px 28px", marginBottom:20, display:"flex", gap:22, alignItems:"center", boxShadow:"0 4px 24px rgba(13,31,60,0.2)" }}>
        <div style={{ width:76, height:76, borderRadius:"50%", background:avColor(`${e.firstName}${e.lastName}`), display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, fontWeight:800, color:C.white, flexShrink:0, border:`3px solid ${C.gold}`, boxShadow:`0 0 0 6px rgba(196,147,42,0.15)` }}>
          {initials(fullName)}
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:26, fontWeight:700, color:C.white, fontFamily:"'Playfair Display',serif", marginBottom:4 }}>{fullName}</div>
          <div style={{ color:C.gold, fontSize:14, fontWeight:600, marginBottom:6 }}>{e.jobTitle||"—"} {e.department?`— ${e.department}`:""}</div>
          <div style={{ display:"flex", gap:20, flexWrap:"wrap" }}>
            <div style={{ color:"rgba(255,255,255,0.6)", fontSize:12 }}>Personal No: <span style={{ color:C.goldL, fontFamily:"monospace", fontWeight:700 }}>{e.personalNumber}</span></div>
            {e.employmentDate && <div style={{ color:"rgba(255,255,255,0.6)", fontSize:12 }}>Employed: <span style={{ color:"rgba(255,255,255,0.9)" }}>{fmtDate(e.employmentDate)}</span></div>}
            {e.jobGrade && <div style={{ color:"rgba(255,255,255,0.6)", fontSize:12 }}>Grade: <span style={{ color:"rgba(255,255,255,0.9)", fontWeight:700 }}>{e.jobGrade}</span></div>}
          </div>
        </div>
        <span style={S.badge(e.status)}>{e.status}</span>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:18 }}>
        <div style={S.card}>
          <div style={S.secHead}>Personal Information</div>
          <Row label="Date of Birth" value={fmtDate(e.dob)} />
          <Row label="Gender" value={e.gender} />
          <Row label="Marital Status" value={e.maritalStatus} />
          <Row label="Nationality" value={e.nationality} />
          <Row label="National ID" value={e.nationalId} />
          <Row label="KRA PIN" value={e.kraPin} />
          <Row label="NSSF Number" value={e.nssfNo} />
          <Row label="NHIF Number" value={e.nhifNo} />
          <Row label="Phone" value={e.phone} />
          <Row label="Email" value={e.email} />
        </div>

        <div style={S.card}>
          <div style={S.secHead}>Employment Details</div>
          <Row label="Employment Date" value={fmtDate(e.employmentDate)} />
          <Row label="Employment Type" value={e.employmentType} />
          <Row label="Job Grade" value={e.jobGrade} />
          <Row label="Department" value={e.department} />
          <Row label="Station" value={e.station} />
          <div style={{ marginTop:18 }}><div style={S.secHead}>Place of Deployment</div></div>
          <Row label="County" value={e.county} />
          <Row label="Region" value={e.region} />
          <Row label="Physical Address" value={e.physicalAddress} />
          <Row label="Work Station" value={e.workStation} />
        </div>

        <div style={S.card}>
          <div style={S.secHead}>Education Background</div>
          {(e.education||[]).filter(x=>x.level||x.institution).length ? (e.education||[]).filter(x=>x.level||x.institution).map((ed,i) => (
            <div key={i} style={{ padding:"10px 0", borderBottom:`1px solid ${C.border}` }}>
              <div style={{ fontWeight:700, color:C.navy, fontSize:14 }}>{ed.level||"Not specified"}</div>
              <div style={{ color:C.muted, fontSize:13, marginTop:2 }}>{ed.institution}{ed.fieldOfStudy?` · ${ed.fieldOfStudy}`:""}</div>
              {ed.yearCompleted && <div style={{ color:C.gold, fontSize:12, fontWeight:600, marginTop:2 }}>Year: {ed.yearCompleted}</div>}
            </div>
          )) : <div style={{ color:C.muted, fontSize:13 }}>No education records added.</div>}

          <div style={{ marginTop:18 }}><div style={S.secHead}>Work Experience</div></div>
          {(e.workExperiences||[]).filter(x=>x.employer||x.role).length ? (e.workExperiences||[]).filter(x=>x.employer||x.role).map((exp,i) => (
            <div key={i} style={{ padding:"10px 0", borderBottom:`1px solid ${C.border}` }}>
              <div style={{ fontWeight:700, color:C.navy, fontSize:14 }}>{exp.role || "Role not specified"}</div>
              <div style={{ color:C.muted, fontSize:13, marginTop:2 }}>{exp.employer}{exp.duration?` · ${exp.duration}`:""}</div>
              {(exp.startDate || exp.endDate) && <div style={{ color:C.muted, fontSize:12, marginTop:2 }}>{exp.startDate?fmtDate(exp.startDate):"?"} – {exp.endDate?fmtDate(exp.endDate):"Present"}</div>}
            </div>
          )) : <div style={{ color:C.muted, fontSize:13 }}>No work experience added.</div>}

          <div style={{ marginTop:18 }}><div style={S.secHead}>Professional Bodies</div></div>
          {(e.professionalBodies||[]).filter(x=>x.bodyName).length ? (e.professionalBodies||[]).filter(x=>x.bodyName).map((p,i) => (
            <div key={i} style={{ padding:"10px 0", borderBottom:`1px solid ${C.border}` }}>
              <div style={{ fontWeight:700, color:C.navy, fontSize:14 }}>{p.bodyName}</div>
              <div style={{ color:C.muted, fontSize:13, marginTop:2 }}>Membership No: {p.membershipNo||"—"}</div>
              {p.registrationDate && <div style={{ color:C.muted, fontSize:12, marginTop:2 }}>Registered: {fmtDate(p.registrationDate)}</div>}
            </div>
          )) : <div style={{ color:C.muted, fontSize:13 }}>No professional memberships added.</div>}

          <div style={{ marginTop:18 }}><div style={S.secHead}>Emergency Contact</div></div>
          <Row label="Full Name" value={e.emergencyName} />
          <Row label="Relationship" value={e.emergencyRelationship} />
          <Row label="Phone" value={e.emergencyPhone} />

          <div style={{ marginTop:18 }}><div style={S.secHead}>Record Information</div></div>
          <Row label="Record Created" value={fmtDate(e.createdAt)} />
          <Row label="Last Updated" value={fmtDate(e.updatedAt)} />
          <Row label="Submitted By" value={e.submittedBy==="self"?"Employee (Self-Registration)":"Administrator"} />
          {e.notes && <Row label="Notes" value={e.notes} />}
        </div>
      </div>
    </div>
  );
};

// ── ADMIN MANAGEMENT ──────────────────────────────────────────────────────────
const AdminManagement = ({ admins, onSave, onRemove, currentAdmin }) => {
  const [form, setForm] = useState(emptyAdmin());
  const [showForm, setShowForm] = useState(false);
  const set = (f,v) => setForm(p=>({...p,[f]:v}));

  const save = () => {
    if(!form.name.trim()||!form.email.trim()){alert("Name and email are required.");return;}
    if(admins.find(a=>a.email.toLowerCase()===form.email.toLowerCase()&&a.id!==form.id)){alert("An administrator with this email already exists.");return;}
    onSave(form);
    setForm(emptyAdmin());
    setShowForm(false);
  };

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:22 }}>
        <div>
          <div style={{ fontSize:24, fontWeight:700, color:C.navy, fontFamily:"'Playfair Display',serif" }}>Admin Management</div>
          <div style={{ color:C.muted, fontSize:14 }}>{admins.length} administrator(s)</div>
        </div>
        <button onClick={()=>setShowForm(s=>!s)} style={S.btn("primary")}>+ Add Administrator</button>
      </div>

      {showForm && (
        <div style={{ ...S.card, borderLeft:`4px solid ${C.gold}`, marginBottom:20 }}>
          <div style={{ fontSize:16, fontWeight:700, color:C.navy, marginBottom:18, fontFamily:"'Playfair Display',serif" }}>New Administrator Account</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:14 }}>
            <Field label="Full Name" required half><Inp value={form.name} onChange={v=>set("name",v)} placeholder="e.g. John Kamau" /></Field>
            <Field label="Email Address" required half><Inp type="email" value={form.email} onChange={v=>set("email",v)} placeholder="john.kamau@mict.go.ke" /></Field>
            <Field label="Role / Access Level" half><Sel value={form.role} onChange={v=>set("role",v)} options={["Admin","HR Officer","Records Officer","Viewer"]} /></Field>
          </div>
          <div style={{ display:"flex", gap:8, marginTop:18 }}>
            <button onClick={save} style={S.btn("primary")}>Save Administrator</button>
            <button onClick={()=>{setShowForm(false);setForm(emptyAdmin());}} style={S.btn("ghost")}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ ...S.card, padding:0, overflow:"hidden" }}>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:14 }}>
          <thead>
            <tr style={{ background:C.navy, color:C.white }}>
              {["Administrator","Email Address","Role","Date Added","Actions"].map(h=>(
                <th key={h} style={{ padding:"12px 18px", textAlign:"left", fontSize:11, fontWeight:600, letterSpacing:0.5 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {admins.map((a,i) => (
              <tr key={a.id} style={{ borderBottom:`1px solid ${C.border}`, background:i%2?"#fafbfc":C.white }}>
                <td style={{ padding:"14px 18px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                    <div style={{ width:38, height:38, borderRadius:"50%", background:avColor(a.name), display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:800, color:C.white, flexShrink:0 }}>{initials(a.name)}</div>
                    <div>
                      <div style={{ fontWeight:600 }}>{a.name}</div>
                      {a.is_super && <div style={{ fontSize:11, color:C.gold, fontWeight:700 }}>SUPER ADMIN</div>}
                      {a.id===currentAdmin?.id && !a.is_super && <div style={{ fontSize:11, color:C.info, fontWeight:600 }}>• Current Session</div>}
                    </div>
                  </div>
                </td>
                <td style={{ padding:"14px 18px", color:C.muted }}>{a.email}</td>
                <td style={{ padding:"14px 18px" }}><span style={S.badge("Active")}>{a.role}</span></td>
                <td style={{ padding:"14px 18px", color:C.muted, fontSize:13 }}>{fmtDate(a.created_at)}</td>
                <td style={{ padding:"14px 18px" }}>
                  {!a.is_super && a.id!==currentAdmin?.id
                    ? <button onClick={()=>{if(window.confirm(`Remove ${a.name} as administrator? They will lose system access.`))onRemove(a.id);}} style={{ ...S.btn("danger"), padding:"6px 14px", fontSize:12 }}>Remove Access</button>
                    : <span style={{ color:C.muted, fontSize:12 }}>{a.is_super?"Protected (Super Admin)":"(Your Account)"}</span>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ── PUBLIC REGISTRATION ───────────────────────────────────────────────────────
const PublicRegistration = ({ onSubmit, employees }) => {
  const [form, setForm] = useState({ 
    ...emptyEmp(), 
    status:"Pending Review", 
    submittedBy:"self",
    workExperiences: [{ id: uid(), employer: "", role: "", duration: "", startDate: "", endDate: "" }]
  });
  const [tab, setTab] = useState(0);
  const [done, setDone] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const set = (f,v) => setForm(p=>({...p,[f]:v}));
  const setEdu = (i,f,v) => setForm(p=>{const e=[...p.education];e[i]={...e[i],[f]:v};return{...p,education:e};});
  const addEdu = () => setForm(p=>({...p,education:[...p.education,{id:uid(),level:"",institution:"",fieldOfStudy:"",yearCompleted:""}]}));
  const rmEdu = (i) => setForm(p=>({...p,education:p.education.filter((_,j)=>j!==i)}));
  const setProf = (i,f,v) => setForm(p=>{const b=[...p.professionalBodies];b[i]={...b[i],[f]:v};return{...p,professionalBodies:b};});
  const addProf = () => setForm(p=>({...p,professionalBodies:[...p.professionalBodies,{id:uid(),bodyName:"",membershipNo:"",registrationDate:""}]}));
  const rmProf = (i) => setForm(p=>({...p,professionalBodies:p.professionalBodies.filter((_,j)=>j!==i)}));
  const setWork = (i,f,v) => setForm(p=>{const w=[...p.workExperiences];w[i]={...w[i],[f]:v};return{...p,workExperiences:w};});
  const addWork = () => setForm(p=>({...p,workExperiences:[...p.workExperiences,{id:uid(),employer:"",role:"",duration:"",startDate:"",endDate:""}]}));
  const rmWork = (i) => setForm(p=>({...p,workExperiences:p.workExperiences.filter((_,j)=>j!==i)}));

  const submit = async () => {
    if(!form.firstName?.trim()||!form.lastName?.trim()||!form.nationalId?.trim()){alert("First name, last name, and National ID are required.");setTab(0);return;}
    setSubmitting(true);
    const pn = await onSubmit(form);
    setDone(pn);
    setSubmitting(false);
  };

  const TABS = ["Personal Info","Employment","Deployment","Education","Prof. Bodies","Work Experience","Emergency"];

  if(done) return (
    <div style={{ minHeight:"100vh", background:`linear-gradient(160deg, ${C.navy} 0%, ${C.navy3} 100%)`, display:"flex", alignItems:"center", justifyContent:"center", padding:20, fontFamily:"'Inter', sans-serif" }}>
      <style>{`*{box-sizing:border-box}body{margin:0}`}</style>
      <div style={{ background:C.white, borderRadius:24, padding:"52px 48px", textAlign:"center", maxWidth:500, boxShadow:"0 40px 80px rgba(0,0,0,0.4)" }}>
        <div style={{ fontSize:72, marginBottom:20 }}>✅</div>
        <div style={{ fontSize:28, fontWeight:700, color:C.navy, fontFamily:"'Playfair Display',serif", marginBottom:10 }}>Registration Successful!</div>
        <div style={{ color:C.muted, fontSize:15, marginBottom:24, lineHeight:1.7 }}>
          Thank you, <strong>{form.firstName} {form.lastName}</strong>. Your details have been securely submitted.
        </div>
        <div style={{ background:C.bg, borderRadius:12, padding:24, marginBottom:24 }}>
          <div style={{ color:C.muted, fontSize:12, fontWeight:600, textTransform:"uppercase", letterSpacing:1, marginBottom:8 }}>Your Personal Number</div>
          <div style={{ fontSize:32, fontWeight:800, color:C.gold, fontFamily:"monospace", letterSpacing:2, marginBottom:4 }}>{done}</div>
          <div style={{ fontSize:13, color:C.muted }}>Keep this number for future reference.</div>
        </div>
        <div style={{ color:C.muted, fontSize:14, lineHeight:1.7, background:"#fef3c7", padding:"16px 20px", borderRadius:12, border:"1px solid #fde68a", marginBottom:24 }}>
          <strong>⏳ Pending Review</strong> – Your record will be reviewed by an administrator.
        </div>
        <button onClick={() => window.location.href = '/'} style={{ ...S.btn("outline"), padding:"12px 24px", fontSize:15 }}>Return to Home</button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:C.bg, fontFamily:"'Inter', sans-serif" }}>
      <style>{`*{box-sizing:border-box}body{margin:0}input:focus,select:focus,textarea:focus{border-color:${C.gold}!important;box-shadow:0 0 0 3px rgba(196,147,42,0.12)!important;outline:none!important}`}</style>
      
      <div style={{ background:`linear-gradient(135deg, ${C.navy} 0%, ${C.navy3} 100%)`, padding:"18px 28px", display:"flex", alignItems:"center", gap:16 }}>
        <div style={{ width:52, height:52, borderRadius:12, background:`linear-gradient(135deg,${C.gold},${C.goldL})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, flexShrink:0 }}>
          <img src={`${process.env.PUBLIC_URL}/coat-of-arms.png`} alt="Coat of Arms" style={{ width:40, height:40 }} />
        </div>
        <div>
          <div style={{ color:C.gold, fontSize:10, fontWeight:700, letterSpacing:2.5, textTransform:"uppercase" }}>Republic of Kenya · Ministry of ICT and Digital Economy</div>
          <div style={{ color:C.white, fontSize:16, fontWeight:700, fontFamily:"'Playfair Display',serif" }}>Department of Public Communication</div>
          <div style={{ color:"rgba(255,255,255,0.55)", fontSize:11 }}>Employee Self‑Registration</div>
        </div>
      </div>

      <div style={{ maxWidth:820, margin:"28px auto", padding:"0 20px 60px" }}>
        <div style={{ ...S.card, textAlign:"center", borderTop:`4px solid ${C.gold}`, padding:"24px 28px", marginBottom:16 }}>
          <div style={{ fontSize:20, fontWeight:700, color:C.navy, fontFamily:"'Playfair Display',serif", marginBottom:6 }}>Employee Self-Registration</div>
          <div style={{ color:C.muted, fontSize:13 }}>Fields marked <span style={{color:C.error}}>*</span> are required.</div>
        </div>

        <div style={{ display:"flex", gap:4, marginBottom:0, overflowX:"auto", paddingBottom:4 }}>
          {TABS.map((t,i) => (
            <div key={i} onClick={()=>setTab(i)} style={{ flex:"1 0 auto", minWidth:80, textAlign:"center", padding:"9px 10px", background:i<tab?`${C.success}`:i===tab?C.gold:"#e2e8f0", borderRadius:8, fontSize:11, fontWeight:700, color:i<=tab?C.white:C.muted, cursor:"pointer", whiteSpace:"nowrap", letterSpacing:0.3 }}>
              {i<tab?"✓ ":""}{i+1}. {t}
            </div>
          ))}
        </div>

        <div style={{ ...S.card, borderRadius:"0 0 12px 12px", marginTop:0, borderTop:`2px solid ${C.gold}` }}>
          {tab===0 && (
            <div>
              <div style={S.secHead}>Personal Information</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:16 }}>
                <Field label="First Name" required half><Inp value={form.firstName} onChange={v=>set("firstName",v)} required /></Field>
                <Field label="Middle Name" half><Inp value={form.middleName} onChange={v=>set("middleName",v)} /></Field>
                <Field label="Last Name" required half><Inp value={form.lastName} onChange={v=>set("lastName",v)} required /></Field>
                <Field label="Date of Birth" half><Inp type="date" value={form.dob} onChange={v=>set("dob",v)} /></Field>
                <Field label="Gender" half><Sel value={form.gender} onChange={v=>set("gender",v)} options={GENDERS} /></Field>
                <Field label="Marital Status" half><Sel value={form.maritalStatus} onChange={v=>set("maritalStatus",v)} options={MARITAL} /></Field>
                <Field label="National ID Number" required half><Inp value={form.nationalId} onChange={v=>set("nationalId",v)} placeholder="e.g. 12345678" required /></Field>
                <Field label="Personal Number (e.g., P/F 2025/00123)" required half>
                  <Inp value={form.personalNumber} onChange={v=>set("personalNumber",v)} placeholder="e.g. P/F 2025/00123" required />
                </Field>
                <Field label="Nationality" half><Inp value={form.nationality} onChange={v=>set("nationality",v)} /></Field>
                <Field label="KRA PIN" half><Inp value={form.kraPin} onChange={v=>set("kraPin",v)} placeholder="A001234567B" /></Field>
                <Field label="NSSF Number" half><Inp value={form.nssfNo} onChange={v=>set("nssfNo",v)} /></Field>
                <Field label="NHIF Number" half><Inp value={form.nhifNo} onChange={v=>set("nhifNo",v)} /></Field>
                <Field label="Phone Number" required half><Inp value={form.phone} onChange={v=>set("phone",v)} placeholder="+254 7XX XXX XXX" required /></Field>
                <Field label="Email Address"><Inp type="email" value={form.email} onChange={v=>set("email",v)} placeholder="your.email@example.com" /></Field>
              </div>
            </div>
          )}
          {tab===1 && (
            <div>
              <div style={S.secHead}>Employment Details</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:16 }}>
                <Field label="Date of Employment" half><Inp type="date" value={form.employmentDate} onChange={v=>set("employmentDate",v)} /></Field>
                <Field label="Job Title / Designation" half><Inp value={form.jobTitle} onChange={v=>set("jobTitle",v)} /></Field>
                <Field label="Job Group / Grade" half><Sel value={form.jobGrade} onChange={v=>set("jobGrade",v)} options={JOB_GRADES} /></Field>
                <Field label="Employment Type" half><Sel value={form.employmentType} onChange={v=>set("employmentType",v)} options={EMP_TYPES} /></Field>
                <Field label="Department" half><Sel value={form.department} onChange={v=>set("department",v)} options={DEPARTMENTS} /></Field>
                <Field label="Station / Branch" half><Inp value={form.station} onChange={v=>set("station",v)} /></Field>
              </div>
            </div>
          )}
          {tab===2 && (
            <div>
              <div style={S.secHead}>Place of Deployment</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:16 }}>
                <Field label="County" half><Sel value={form.county} onChange={v=>set("county",v)} options={COUNTIES} /></Field>
                <Field label="Region" half><Sel value={form.region} onChange={v=>set("region",v)} options={REGIONS} /></Field>
                <Field label="Physical Address" half><Inp value={form.physicalAddress} onChange={v=>set("physicalAddress",v)} placeholder="Building, Street, Town" /></Field>
                <Field label="Work Station / Office" half><Inp value={form.workStation} onChange={v=>set("workStation",v)} /></Field>
              </div>
            </div>
          )}
          {tab===3 && (
            <div>
              <div style={S.secHead}>Education Background</div>
              {form.education.map((e,i) => (
                <div key={e.id||i} style={{ background:"#f8fafc", border:`1px solid ${C.border}`, borderRadius:10, padding:18, marginBottom:16 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:14 }}>
                    <div style={{ fontWeight:600, color:C.navy, fontSize:14 }}>Qualification {i+1}</div>
                    {i>0 && <button onClick={()=>rmEdu(i)} style={{ ...S.btn("danger"), padding:"4px 12px", fontSize:12 }}>Remove</button>}
                  </div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:12 }}>
                    <Field label="Education Level" half><Sel value={e.level} onChange={v=>setEdu(i,"level",v)} options={EDUCATION_LEVELS} /></Field>
                    <Field label="Year Completed" half><Inp type="number" value={e.yearCompleted} onChange={v=>setEdu(i,"yearCompleted",v)} placeholder="e.g. 2019" /></Field>
                    <Field label="Institution / University" half><Inp value={e.institution} onChange={v=>setEdu(i,"institution",v)} placeholder="e.g. University of Nairobi" /></Field>
                    <Field label="Field of Study / Course" half><Inp value={e.fieldOfStudy} onChange={v=>setEdu(i,"fieldOfStudy",v)} placeholder="e.g. Mass Communication" /></Field>
                  </div>
                </div>
              ))}
              <button onClick={addEdu} style={{ ...S.btn("outline"), fontSize:13 }}>+ Add Another Qualification</button>
            </div>
          )}
          {tab===4 && (
            <div>
              <div style={S.secHead}>Professional Body Memberships</div>
              {form.professionalBodies.map((p,i) => (
                <div key={p.id||i} style={{ background:"#f8fafc", border:`1px solid ${C.border}`, borderRadius:10, padding:18, marginBottom:16 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:14 }}>
                    <div style={{ fontWeight:600, color:C.navy, fontSize:14 }}>Membership {i+1}</div>
                    {i>0 && <button onClick={()=>rmProf(i)} style={{ ...S.btn("danger"), padding:"4px 12px", fontSize:12 }}>Remove</button>}
                  </div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:12 }}>
                    <Field label="Professional Body" half><Sel value={p.bodyName} onChange={v=>setProf(i,"bodyName",v)} options={PROF_BODIES} /></Field>
                    <Field label="Membership No." half><Inp value={p.membershipNo} onChange={v=>setProf(i,"membershipNo",v)} /></Field>
                    <Field label="Registration Date" half><Inp type="date" value={p.registrationDate} onChange={v=>setProf(i,"registrationDate",v)} /></Field>
                  </div>
                </div>
              ))}
              <button onClick={addProf} style={{ ...S.btn("outline"), fontSize:13 }}>+ Add Membership</button>
            </div>
          )}
          {tab===5 && (
            <div>
              <div style={S.secHead}>Work Experience</div>
              {form.workExperiences.map((exp, i) => (
                <div key={exp.id || i} style={{ background:"#f8fafc", border:`1px solid ${C.border}`, borderRadius:10, padding:18, marginBottom:16 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:14 }}>
                    <div style={{ fontWeight:600, color:C.navy, fontSize:14 }}>Experience {i+1}</div>
                    {i>0 && <button onClick={()=>rmWork(i)} style={{ ...S.btn("danger"), padding:"4px 12px", fontSize:12 }}>Remove</button>}
                  </div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:12 }}>
                    <Field label="Employer / Organization" half>
                      <Inp value={exp.employer} onChange={v => setWork(i, "employer", v)} placeholder="e.g. Nation Media Group" />
                    </Field>
                    <Field label="Role / Position" half>
                      <Inp value={exp.role} onChange={v => setWork(i, "role", v)} placeholder="e.g. Senior Reporter" />
                    </Field>
                    <Field label="Duration (e.g., 2 years)" half>
                      <Inp value={exp.duration} onChange={v => setWork(i, "duration", v)} placeholder="e.g. 3 years 6 months" />
                    </Field>
                    <Field label="Start Date" half>
                      <Inp type="date" value={exp.startDate} onChange={v => setWork(i, "startDate", v)} />
                    </Field>
                    <Field label="End Date (leave blank if current)" half>
                      <Inp type="date" value={exp.endDate} onChange={v => setWork(i, "endDate", v)} />
                    </Field>
                  </div>
                </div>
              ))}
              <button onClick={addWork} style={{ ...S.btn("outline"), fontSize:13 }}>+ Add Another Experience</button>
            </div>
          )}
          {tab===6 && (
            <div>
              <div style={S.secHead}>Emergency Contact</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:16 }}>
                <Field label="Full Name" half><Inp value={form.emergencyName} onChange={v=>set("emergencyName",v)} placeholder="Next of kin" /></Field>
                <Field label="Relationship" half><Inp value={form.emergencyRelationship} onChange={v=>set("emergencyRelationship",v)} placeholder="e.g. Spouse, Parent" /></Field>
                <Field label="Phone Number" half><Inp value={form.emergencyPhone} onChange={v=>set("emergencyPhone",v)} /></Field>
              </div>
            </div>
          )}

          <div style={{ display:"flex", justifyContent:"space-between", marginTop:28, paddingTop:22, borderTop:`1px solid ${C.border}` }}>
            {tab>0 ? <button onClick={()=>setTab(t=>t-1)} style={S.btn("outline")}>← Previous</button> : <div/>}
            {tab<TABS.length-1
              ? <button onClick={()=>setTab(t=>t+1)} style={S.btn("primary")}>Next Section →</button>
              : <button onClick={submit} disabled={submitting} style={{ ...S.btn("success"), padding:"12px 32px", fontSize:15 }}>{submitting?"Submitting...":"Submit Registration ✓"}</button>
            }
          </div>
        </div>
      </div>
    </div>
  );
};

// ── LEAVE REQUEST PUBLIC FORM ─────────────────────────────────────────────────
const LeaveRequestForm = ({ onSubmit }) => {
  const [form, setForm] = useState({
    employeePersonalNumber: "",
    employeeName: "",
    startDate: "",
    endDate: "",
    reason: ""
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.employeePersonalNumber || !form.employeeName || !form.startDate || !form.endDate || !form.reason) {
      setError("All fields are required.");
      return;
    }
    if (new Date(form.endDate) < new Date(form.startDate)) {
      setError("End date cannot be before start date.");
      return;
    }
    setError("");
    const success = await onSubmit(form);
    if (success) setSubmitted(true);
  };

  if (submitted) {
    return (
      <div style={{ minHeight:"100vh", background:`linear-gradient(160deg, ${C.navy} 0%, ${C.navy3} 100%)`, display:"flex", alignItems:"center", justifyContent:"center", padding:20, fontFamily:"'Inter', sans-serif" }}>
        <div style={{ background:C.white, borderRadius:24, padding:"40px", textAlign:"center", maxWidth:400 }}>
          <div style={{ fontSize:48, marginBottom:20 }}>✅</div>
          <h2 style={{ color:C.navy, marginBottom:10 }}>Leave Request Submitted</h2>
          <p style={{ color:C.muted }}>Your request has been received and is pending approval.</p>
          <button onClick={() => window.location.href = '/'} style={{ ...S.btn("primary"), marginTop:20 }}>Return Home</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight:"100vh", background:C.bg, fontFamily:"'Inter', sans-serif", padding:20 }}>
      <div style={{ maxWidth:600, margin:"0 auto", background:C.white, borderRadius:16, padding:32, boxShadow:"0 4px 20px rgba(0,0,0,0.1)" }}>
        <div style={{ textAlign:"center", marginBottom:24 }}>
          <img src={`${process.env.PUBLIC_URL}/coat-of-arms.png`} alt="Coat of Arms" style={{ width:60, height:60 }} />
          <h1 style={{ fontSize:24, color:C.navy, fontFamily:"'Playfair Display',serif", marginTop:10 }}>Leave Request</h1>
          <p style={{ color:C.muted }}>Fill in the form below to request leave.</p>
        </div>
        {error && <div style={{ background:"#fee2e2", color:C.error, padding:10, borderRadius:6, marginBottom:16 }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <Field label="Personal Number" required>
            <Inp 
              value={form.employeePersonalNumber} 
              onChange={(val) => setForm({...form, employeePersonalNumber: val})} 
              placeholder="e.g. DPC/2025/00012" 
              required 
            />
          </Field>
          <Field label="Full Name" required>
            <Inp 
              value={form.employeeName} 
              onChange={(val) => setForm({...form, employeeName: val})} 
              placeholder="Your full name" 
              required 
            />
          </Field>
          <div style={{ display:"flex", gap:16, flexWrap:"wrap" }}>
            <Field label="Start Date" required half>
              <Inp 
                type="date" 
                value={form.startDate} 
                onChange={(val) => setForm({...form, startDate: val})} 
                required 
              />
            </Field>
            <Field label="End Date" required half>
              <Inp 
                type="date" 
                value={form.endDate} 
                onChange={(val) => setForm({...form, endDate: val})} 
                required 
              />
            </Field>
          </div>
          <Field label="Reason for Leave" required>
            <Textarea 
              value={form.reason} 
              onChange={(val) => setForm({...form, reason: val})} 
              placeholder="e.g. Annual leave, sick leave, etc." 
              rows={4} 
              required 
            />
          </Field>
          <button type="submit" style={{ ...S.btn("primary"), width:"100%", marginTop:16 }}>Submit Request</button>
        </form>
      </div>
    </div>
  );
};

// ── LEAVE REQUESTS ADMIN PAGE ─────────────────────────────────────────────────
const LeaveRequestsAdmin = ({ requests, onApprove, onDecline }) => {
  const [filter, setFilter] = useState("All");

  const filtered = requests.filter(r => filter === "All" || r.status === filter);

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <h2 style={{ fontSize:24, fontWeight:700, color:C.navy, fontFamily:"'Playfair Display',serif" }}>Leave Requests</h2>
        <select value={filter} onChange={e => setFilter(e.target.value)} style={{ ...S.input, width:200 }}>
          <option value="All">All</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Declined">Declined</option>
        </select>
      </div>

      <div style={S.card}>
        {filtered.length === 0 ? (
          <div style={{ textAlign:"center", padding:40, color:C.muted }}>No leave requests found.</div>
        ) : (
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ background:C.navy, color:C.white }}>
                <th style={{ padding:12, textAlign:"left" }}>Employee</th>
                <th style={{ padding:12, textAlign:"left" }}>Personal No.</th>
                <th style={{ padding:12, textAlign:"left" }}>Start Date</th>
                <th style={{ padding:12, textAlign:"left" }}>End Date</th>
                <th style={{ padding:12, textAlign:"left" }}>Reason</th>
                <th style={{ padding:12, textAlign:"left" }}>Status</th>
                <th style={{ padding:12, textAlign:"left" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id} style={{ borderBottom:`1px solid ${C.border}` }}>
                  <td style={{ padding:12 }}>{r.employeeName}</td>
                  <td style={{ padding:12, fontFamily:"monospace" }}>{r.employeePersonalNumber}</td>
                  <td style={{ padding:12 }}>{fmtDate(r.startDate)}</td>
                  <td style={{ padding:12 }}>{fmtDate(r.endDate)}</td>
                  <td style={{ padding:12, maxWidth:200 }}>{r.reason}</td>
                  <td style={{ padding:12 }}><span style={S.badge(r.status)}>{r.status}</span></td>
                  <td style={{ padding:12 }}>
                    {r.status === "Pending" && (
                      <div style={{ display:"flex", gap:8 }}>
                        <button onClick={() => onApprove(r.id)} style={{ ...S.btn("success"), padding:"4px 10px", fontSize:12 }}>Approve</button>
                        <button onClick={() => onDecline(r.id)} style={{ ...S.btn("danger"), padding:"4px 10px", fontSize:12 }}>Decline</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

// ── MAIN APP ──────────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState("loading");
  const [admin, setAdmin] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [activity, setActivity] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [selected, setSelected] = useState(null);
  const [toast, setToast] = useState(null);
  const [session, setSession] = useState(null);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash === "#register") { setView("register"); return; }
    if (hash === "#leave-request") { setView("leave-request"); return; }
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchUserData(session.user);
      } else {
        setView("login");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchUserData(session.user);
      } else {
        setAdmin(null);
        setView("login");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserData = async (user) => {
    try {
      // Fetch admin details
      const { data: adminData, error: adminError } = await supabase
        .from('admins')
        .select('*')
        .eq('email', user.email)
        .single();
      if (adminError) throw adminError;
      setAdmin(adminData);

      // Fetch employees with related data
      const { data: employeesData, error: empError } = await supabase
        .from('employees')
        .select('*, education(*), professional_bodies(*), work_experiences(*)')
        .order('created_at', { ascending: false });
      if (empError) throw empError;
      
      const transformedEmps = employeesData.map(e => ({
        id: e.id,
        personalNumber: e.personal_number,
        firstName: e.first_name,
        middleName: e.middle_name,
        lastName: e.last_name,
        dob: e.dob,
        gender: e.gender,
        nationalId: e.national_id,
        kraPin: e.kra_pin,
        nssfNo: e.nssf_no,
        nhifNo: e.nhif_no,
        phone: e.phone,
        email: e.email,
        maritalStatus: e.marital_status,
        nationality: e.nationality,
        photo: e.photo,
        employmentDate: e.employment_date,
        jobTitle: e.job_title,
        jobGrade: JOB_GRADES[e.job_grade_id - 1],
        employmentType: EMP_TYPES[e.employment_type_id - 1],
        department: DEPARTMENTS[e.department_id - 1],
        station: e.station,
        county: COUNTIES[e.county_id - 1],
        region: REGIONS[e.region_id - 1],
        physicalAddress: e.physical_address,
        workStation: e.work_station,
        education: e.education.map(ed => ({
          id: ed.id,
          level: ed.level,
          institution: ed.institution,
          fieldOfStudy: ed.field_of_study,
          yearCompleted: ed.year_completed
        })),
        professionalBodies: e.professional_bodies.map(pb => ({
          id: pb.id,
          bodyName: pb.body_name,
          membershipNo: pb.membership_no,
          registrationDate: pb.registration_date
        })),
        workExperiences: e.work_experiences.map(w => ({
          id: w.id,
          employer: w.employer,
          role: w.role,
          duration: w.duration,
          startDate: w.start_date,
          endDate: w.end_date
        })),
        yearsOfExperience: e.years_of_experience,
        previousEmployer: e.previous_employer,
        previousRole: e.previous_role,
        previousDuration: e.previous_duration,
        emergencyName: e.emergency_name,
        emergencyRelationship: e.emergency_relationship,
        emergencyPhone: e.emergency_phone,
        status: e.status,
        submittedBy: e.submitted_by,
        notes: e.notes,
        createdAt: e.created_at,
        updatedAt: e.updated_at
      }));
      setEmployees(transformedEmps);

      // Fetch admins
      const { data: allAdmins } = await supabase.from('admins').select('*').order('created_at', { ascending: false });
      setAdmins(allAdmins || []);

      // Fetch activity logs
      const { data: logs } = await supabase.from('activity_logs').select('*').order('timestamp', { ascending: false }).limit(150);
      setActivity(logs || []);

      // Fetch leave requests with transformation
      const { data: leaves } = await supabase.from('leave_requests').select('*').order('submitted_at', { ascending: false });
      if (leaves) {
        const transformedLeaves = leaves.map(l => ({
          id: l.id,
          employeeName: l.employee_name,
          employeePersonalNumber: l.employee_personal_number,
          startDate: l.start_date,
          endDate: l.end_date,
          reason: l.reason,
          status: l.status,
          adminNotes: l.admin_notes,
          submittedAt: l.submitted_at,
          reviewedAt: l.reviewed_at,
          reviewedBy: l.reviewed_by
        }));
        setLeaveRequests(transformedLeaves);
      } else {
        setLeaveRequests([]);
      }

      setView("dashboard");
    } catch (error) {
      console.error('Error fetching user data:', error);
      showToast("Error loading data", "error");
    }
  };

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const logActivity = async (action, details) => {
    try {
      await supabase.from('activity_logs').insert([{
        action,
        details,
        admin_name: admin?.name,
        admin_id: admin?.id,
        timestamp: new Date().toISOString()
      }]);
    } catch (err) {
      console.error('Failed to log activity:', err);
    }
  };

  const navigate = (v, data = null) => {
    setSelected(data);
    setView(v);
    window.scrollTo(0, 0);
  };

  const login = async (email, password) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return false;
      return true;
    } catch {
      return false;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const saveEmployee = async (emp) => {
    try {
      const employeeData = {
        personal_number: emp.personalNumber,
        first_name: emp.firstName,
        middle_name: emp.middleName,
        last_name: emp.lastName,
        dob: emp.dob || null,
        gender: emp.gender || null,
        national_id: emp.nationalId,
        kra_pin: emp.kraPin || null,
        nssf_no: emp.nssfNo || null,
        nhif_no: emp.nhifNo || null,
        phone: emp.phone || null,
        email: emp.email || null,
        marital_status: emp.maritalStatus || null,
        nationality: emp.nationality || 'Kenyan',
        photo: emp.photo || null,
        employment_date: emp.employmentDate || null,
        job_title: emp.jobTitle || null,
        job_grade_id: emp.jobGrade ? JOB_GRADES.indexOf(emp.jobGrade) + 1 : null,
        employment_type_id: emp.employmentType ? EMP_TYPES.indexOf(emp.employmentType) + 1 : null,
        department_id: emp.department ? DEPARTMENTS.indexOf(emp.department) + 1 : null,
        station: emp.station || null,
        county_id: emp.county ? COUNTIES.indexOf(emp.county) + 1 : null,
        region_id: emp.region ? REGIONS.indexOf(emp.region) + 1 : null,
        physical_address: emp.physicalAddress || null,
        work_station: emp.workStation || null,
        years_of_experience: emp.yearsOfExperience ? parseInt(emp.yearsOfExperience) : null,
        previous_employer: emp.previousEmployer || null,
        previous_role: emp.previousRole || null,
        previous_duration: emp.previousDuration || null,
        emergency_name: emp.emergencyName || null,
        emergency_relationship: emp.emergencyRelationship || null,
        emergency_phone: emp.emergencyPhone || null,
        status: emp.status || 'Active',
        submitted_by: emp.submittedBy || 'admin',
        notes: emp.notes || null,
        updated_at: new Date().toISOString()
      };

      let employeeId = emp.id;

      if (!emp.id) {
        employeeData.created_at = new Date().toISOString();
        const { data, error } = await supabase
          .from('employees')
          .insert([employeeData])
          .select()
          .single();
        if (error) throw error;
        employeeId = data.id;
        await logActivity('Employee Added', `${emp.firstName} ${emp.lastName} (${emp.personalNumber}) added to system`);
      } else {
        const { error } = await supabase
          .from('employees')
          .update(employeeData)
          .eq('id', emp.id);
        if (error) throw error;
        await supabase.from('education').delete().eq('employee_id', emp.id);
        await supabase.from('professional_bodies').delete().eq('employee_id', emp.id);
        await supabase.from('work_experiences').delete().eq('employee_id', emp.id);
        await logActivity('Employee Updated', `${emp.firstName} ${emp.lastName} (${emp.personalNumber}) record updated`);
      }

      if (emp.education && emp.education.length) {
        const eduInserts = emp.education
          .filter(e => e.level || e.institution)
          .map(e => ({
            employee_id: employeeId,
            level: e.level || null,
            institution: e.institution || null,
            field_of_study: e.fieldOfStudy || null,
            year_completed: e.yearCompleted ? parseInt(e.yearCompleted) : null
          }));
        if (eduInserts.length) {
          await supabase.from('education').insert(eduInserts);
        }
      }

      if (emp.professionalBodies && emp.professionalBodies.length) {
        const profInserts = emp.professionalBodies
          .filter(p => p.bodyName)
          .map(p => ({
            employee_id: employeeId,
            body_name: p.bodyName || null,
            membership_no: p.membershipNo || null,
            registration_date: p.registrationDate || null
          }));
        if (profInserts.length) {
          await supabase.from('professional_bodies').insert(profInserts);
        }
      }

      if (emp.workExperiences && emp.workExperiences.length) {
        const workInserts = emp.workExperiences
          .filter(w => w.employer || w.role)
          .map(w => ({
            employee_id: employeeId,
            employer: w.employer || null,
            role: w.role || null,
            duration: w.duration || null,
            start_date: w.startDate || null,
            end_date: w.endDate || null
          }));
        if (workInserts.length) {
          await supabase.from('work_experiences').insert(workInserts);
        }
      }

      await fetchUserData(session.user);
      showToast(emp.id ? "✅ Employee updated successfully!" : "✅ Employee added successfully!");
      navigate("employees");
    } catch (error) {
      console.error('Error saving employee:', error);
      showToast("Error saving employee", "error");
    }
  };

  const deleteEmployee = async (id) => {
    try {
      const emp = employees.find(e => e.id === id);
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', id);
      if (error) throw error;
      await logActivity('Employee Deleted', `${emp?.firstName} ${emp?.lastName} (${emp?.personalNumber}) removed`);
      await fetchUserData(session.user);
      showToast("Employee removed from system.", "info");
      navigate("employees");
    } catch (error) {
      console.error('Error deleting employee:', error);
      showToast("Error deleting employee", "error");
    }
  };

  const approveEmployee = async (id) => {
    try {
      const { error } = await supabase
        .from('employees')
        .update({ status: 'Active' })
        .eq('id', id);
      if (error) throw error;
      showToast("Employee approved successfully!");
      fetchUserData(session?.user);
    } catch (error) {
      showToast("Error approving employee", "error");
    }
  };

  const saveAdmin = async (a) => {
    try {
      const adminData = {
        name: a.name,
        email: a.email,
        role: a.role || 'Admin',
        is_super: false,
        created_at: new Date().toISOString()
      };
      if (!a.id) {
        await supabase.from('admins').insert([adminData]);
        await logActivity('Admin Added', `${a.name} added as ${a.role}`);
      } else {
        await supabase.from('admins').update(adminData).eq('id', a.id);
      }
      const { data: allAdmins } = await supabase.from('admins').select('*').order('created_at', { ascending: false });
      setAdmins(allAdmins);
      showToast("Administrator account saved!");
    } catch (error) {
      console.error('Error saving admin:', error);
      showToast("Error saving admin", "error");
    }
  };

  const removeAdmin = async (id) => {
    try {
      const a = admins.find(x => x.id === id);
      const { error } = await supabase.from('admins').delete().eq('id', id);
      if (error) throw error;
      await logActivity('Admin Removed', `${a?.name} removed from system`);
      const { data: allAdmins } = await supabase.from('admins').select('*').order('created_at', { ascending: false });
      setAdmins(allAdmins);
      showToast("Administrator access removed.", "info");
    } catch (error) {
      console.error('Error removing admin:', error);
      showToast("Error removing admin", "error");
    }
  };

  const submitRegistration = async (emp) => {
    try {
      emp.status = "Pending Review";
      emp.submittedBy = "self";
      await saveEmployee(emp);
      return emp.personalNumber;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const submitLeaveRequest = async (data) => {
    try {
      const { error } = await supabase.from('leave_requests').insert([{
        employee_name: data.employeeName,
        employee_personal_number: data.employeePersonalNumber,
        start_date: data.startDate,
        end_date: data.endDate,
        reason: data.reason,
        status: 'Pending'
      }]);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error submitting leave request:', error);
      return false;
    }
  };

  const approveLeave = async (id) => {
    try {
      const { error } = await supabase
        .from('leave_requests')
        .update({ status: 'Approved', reviewed_at: new Date().toISOString(), reviewed_by: admin?.id })
        .eq('id', id);
      if (error) throw error;
      showToast("Leave request approved");
      fetchUserData(session.user);
      logActivity('Leave Approved', `Leave request ${id} approved`);
    } catch (error) {
      showToast("Error approving leave", "error");
    }
  };

  const declineLeave = async (id) => {
    try {
      const { error } = await supabase
        .from('leave_requests')
        .update({ status: 'Declined', reviewed_at: new Date().toISOString(), reviewed_by: admin?.id })
        .eq('id', id);
      if (error) throw error;
      showToast("Leave request declined");
      fetchUserData(session.user);
      logActivity('Leave Declined', `Leave request ${id} declined`);
    } catch (error) {
      showToast("Error declining leave", "error");
    }
  };

  if (view === "loading") return <LoadingScreen />;
  if (view === "register") return <PublicRegistration onSubmit={submitRegistration} employees={employees} />;
  if (view === "leave-request") return <LeaveRequestForm onSubmit={submitLeaveRequest} />;
  if (view === "login") return <LoginPage onLogin={login} />;

  return (
    <AdminLayout admin={admin} view={view} navigate={navigate} onLogout={logout} toast={toast} employees={employees} activity={activity}>
      {view === "dashboard" && <Dashboard employees={employees} navigate={navigate} admin={admin} leaveRequests={leaveRequests} />}
      {view === "employees" && <EmployeeList employees={employees} navigate={navigate} onDelete={deleteEmployee} onApprove={approveEmployee} onRefresh={() => fetchUserData(session?.user)} />}
      {view === "add-employee" && <EmployeeForm onSave={saveEmployee} navigate={navigate} employees={employees} />}
      {view === "edit-employee" && selected && <EmployeeForm employee={selected} onSave={saveEmployee} navigate={navigate} employees={employees} />}
      {view === "view-employee" && selected && <EmployeeProfile employee={selected} navigate={navigate} onDelete={deleteEmployee} />}
      {view === "admins" && <AdminManagement admins={admins} onSave={saveAdmin} onRemove={removeAdmin} currentAdmin={admin} />}
      {view === "leave-requests" && <LeaveRequestsAdmin requests={leaveRequests} onApprove={approveLeave} onDecline={declineLeave} />}
    </AdminLayout>
  );
}