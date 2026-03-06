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

// ── TWO-COLOR PALETTE ─────────────────────────────────────────────────────────
const C = {
  primary: "#0d1f3c",
  white: "#ffffff",
  bg: "#eef1f6",
  border: "#d1d9e6"
};

// ── UTILS ─────────────────────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36);
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-KE", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const fmtTS = (d) => d ? new Date(d).toLocaleString("en-KE", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "—";
const initials = (n) => (n || "?").split(" ").filter(Boolean).map(x => x[0]).join("").toUpperCase().slice(0, 2);
const AV_COLORS = [C.primary, "#2c3e50", "#34495e", "#2c3e50", "#34495e", "#2c3e50"];
const avColor = (n) => C.primary; // all avatars same primary

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
    background: v==="primary"?C.primary:v==="danger"?"transparent":v==="success"?"transparent":v==="ghost"?"transparent":v==="outline"?"transparent":C.white,
    color: v==="primary"?C.white:v==="danger"?C.primary:v==="success"?C.primary:v==="ghost"?C.primary:C.primary,
    border: v==="outline"?`1.5px solid ${C.border}`:"none",
  }),
  input: { width:"100%", padding:"10px 12px", borderRadius:8, border:`1.5px solid ${C.border}`, fontSize:14, fontFamily:"'Inter', sans-serif", background:C.white, color:C.primary, outline:"none", boxSizing:"border-box", transition:"border 0.15s" },
  label: { fontSize: 12, fontWeight: 600, color: C.primary, marginBottom: 5, display: "block", textTransform: "uppercase", letterSpacing: 0.5, fontFamily: "'Inter', sans-serif" },
  secHead: { fontSize: 15, fontWeight: 700, color: C.primary, borderLeft: `4px solid ${C.primary}`, paddingLeft: 12, marginBottom: 20, fontFamily: "'Playfair Display', serif" },
  badge: (c) => ({
    padding: "3px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700, display:"inline-block", fontFamily: "'Inter', sans-serif",
    background: "transparent",
    color: C.primary,
    border: `1px solid ${C.primary}`
  })
};

// ── REUSABLE FORM COMPONENTS ──────────────────────────────────────────────────
const Field = ({ label, required, children, half, third }) => (
  <div style={{ flex: third?"1 1 calc(33% - 8px)":half?"1 1 calc(50% - 8px)":"1 1 100%", minWidth:0 }}>
    <label style={S.label}>{label}{required && <span style={{color:C.primary}}> *</span>}</label>
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

const YearSelect = ({ value, onChange, required, placeholder = "Select year" }) => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let y = currentYear + 10; y >= 1900; y--) {
    years.push(y);
  }
  return (
    <select style={S.input} value={value || ""} onChange={e => onChange(e.target.value)} required={required}>
      <option value="">{placeholder}</option>
      {years.map(y => <option key={y} value={y}>{y}</option>)}
    </select>
  );
};

// ── LOADING ───────────────────────────────────────────────────────────────────
const LoadingScreen = () => (
  <div style={{ height:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:C.primary, flexDirection:"column", gap:20, fontFamily:"'Inter', sans-serif" }}>
    <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>
    <div style={{ position:"relative" }}>
      <div style={{ width:64, height:64, border:`3px solid ${C.white}20`, borderRadius:"50%" }} />
      <div style={{ width:64, height:64, border:`3px solid ${C.white}`, borderTopColor:"transparent", borderRadius:"50%", animation:"spin 0.8s linear infinite", position:"absolute", top:0, left:0 }} />
    </div>
    <div style={{ color:C.white, fontFamily:"'Playfair Display',serif", fontSize:18, animation:"pulse 1.5s ease-in-out infinite" }}>Initializing System...</div>
    <div style={{ color:`${C.white}80`, fontSize:12 }}>Directorate of Public Communication · EMS</div>
  </div>
);

// ── TOAST ─────────────────────────────────────────────────────────────────────
const Toast = ({ toast }) => toast ? (
  <div style={{ position:"fixed", bottom:28, right:28, zIndex:9999, background:C.white, color:C.primary, padding:"14px 22px", borderRadius:12, fontWeight:500, fontSize:14, boxShadow:"0 8px 30px rgba(0,0,0,0.25)", maxWidth:340, fontFamily:"'Inter', sans-serif", display:"flex", alignItems:"center", gap:10, border:`1px solid ${C.primary}` }}>
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
    <div style={{ minHeight:"100vh", background:C.primary, display:"flex", alignItems:"center", justifyContent:"center", padding:20, fontFamily:"'Inter', sans-serif" }}>
      <style>{`*{box-sizing:border-box}body{margin:0}input:focus,select:focus,textarea:focus{border-color:${C.primary}!important;box-shadow:0 0 0 3px ${C.primary}20!important;outline:none!important}`}</style>
      <div style={{ background:C.white, borderRadius:24, overflow:"hidden", width:"100%", maxWidth:400, boxShadow:"0 40px 80px rgba(0,0,0,0.5)" }}>
        <div style={{ background:C.primary, padding:"40px 40px 20px", textAlign:"center" }}>
          <div style={{ width:70, height:70, borderRadius:"50%", background:C.white, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 10px" }}>
            <img src={`${process.env.PUBLIC_URL}/coat-of-arms.png`} alt="Coat of Arms" style={{ width:45, height:45 }} />
          </div>
          <div style={{ color:C.white, fontSize:16, fontWeight:600, fontFamily:"'Playfair Display',serif" }}>Directorate of Public Communication</div>
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
                <button type="button" onClick={()=>setShowPass(s=>!s)} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:C.primary, fontSize:14 }}>
                  {showPass ? "Hide" : "Show"}
                </button>
              </div>
            </div>
            {err && <div style={{ background:"#fee2e2", color:C.primary, padding:"8px 12px", borderRadius:6, fontSize:12, marginBottom:12, border:`1px solid ${C.primary}` }}>{err}</div>}
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
  { id:"reports", label:"Reports" },
  { id:"admins", label:"Admin Management" },
];

const TopNav = ({ view, navigate }) => (
  <div style={{ background:C.white, borderBottom:`1px solid ${C.border}`, padding:"0 28px", display:"flex", alignItems:"center", gap:32, height:56 }}>
    {NAV_ITEMS.map(n => {
      const active = view===n.id || (n.id==="employees" && ["view-employee","edit-employee"].includes(view));
      return (
        <button key={n.id} onClick={()=>navigate(n.id)} style={{ background:"none", border:"none", cursor:"pointer", fontFamily:"'Inter', sans-serif", fontSize:14, fontWeight:active?600:400, color:active?C.primary:C.primary, borderBottom:active?`2px solid ${C.primary}`:"none", padding:"8px 0", opacity:active?1:0.7 }}>
          {n.label}
        </button>
      );
    })}
  </div>
);

// ── ADMIN LAYOUT (with user dropdown) ─────────────────────────────────────────
const AdminLayout = ({ children, admin, view, navigate, onLogout, toast, employees, activity }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const dropdownRef = useRef(null);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div style={{ minHeight:"100vh", fontFamily:"'Inter', sans-serif", background:C.bg }}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}body{margin:0}input:focus,select:focus,textarea:focus{border-color:${C.primary}!important;box-shadow:0 0 0 3px ${C.primary}20!important;outline:none!important}@media print{.no-print{display:none!important}}`}</style>
      
      <div style={{ background:C.white, borderBottom:`1px solid ${C.border}`, padding:"16px 28px", display:"flex", alignItems:"center", gap:16 }}>
        <img src={`${process.env.PUBLIC_URL}/coat-of-arms.png`} alt="Coat of Arms" style={{ width:45, height:45 }} />
        <div>
          <div style={{ fontSize:12, color:C.primary, letterSpacing:1, textTransform:"uppercase" }}>Republic of Kenya</div>
          <div style={{ fontSize:16, fontWeight:700, color:C.primary, fontFamily:"'Playfair Display',serif" }}>MINISTRY OF INFORMATION, COMMUNICATIONS AND THE DIGITAL ECONOMY (MICDE)</div>
          <div style={{ fontSize:13, color:C.primary, opacity:0.7 }}>State Department of Broadcasting & Telecommunication · Directorate of Public Communication</div>
        </div>
        <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:16 }}>
          <div style={{ fontSize:14, color:C.primary }}>{new Date().toLocaleDateString("en-KE",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</div>
          <div style={{ width:1, height:30, background:C.border }} />
          
          {/* Bell icon with dropdown – fixed closing tags */}
          <div style={{ position:"relative" }} ref={dropdownRef}>
            <button onClick={() => setShowNotifications(!showNotifications)} style={{ background:"none", border:"none", cursor:"pointer", fontSize:20, color:C.primary }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: C.primary }}>
  <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
</svg>
              {activity && activity.filter(a => !a.read).length > 0 && (
                <span style={{ position:"absolute", top:-5, right:-5, background:C.primary, color:C.white, borderRadius:"50%", width:16, height:16, fontSize:10, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  {activity.filter(a => !a.read).length}
                </span>
              )}
            </button>
            {showNotifications && (
              <div style={{ position:"absolute", right:0, top:35, width:280, background:C.white, borderRadius:8, boxShadow:"0 4px 20px rgba(0,0,0,0.15)", zIndex:1000, maxHeight:350, overflowY:"auto" }}>
                <div style={{ padding:"10px 16px", borderBottom:`1px solid ${C.border}`, fontWeight:600, color:C.primary }}>Recent Activity</div>
                {activity && activity.length ? activity.slice(0,8).map(a => (
                  <div key={a.id} style={{ padding:"8px 16px", borderBottom:`1px solid ${C.border}`, fontSize:12 }}>
                    <div style={{ fontWeight:500, color:C.primary }}>{a.details}</div>
                    <div style={{ fontSize:10, color:C.primary, opacity:0.7 }}>{fmtTS(a.timestamp)} · {a.adminName}</div>
                  </div>
                )) : <div style={{ padding:"16px", textAlign:"center", color:C.primary }}>No recent activity</div>}
              </div>
            )}
          </div>

          <div style={{ width:1, height:30, background:C.border }} />
          
          {/* User menu */}
          <div style={{ position:"relative" }} ref={userMenuRef}>
            <button onClick={() => setShowUserMenu(!showUserMenu)} style={{ background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:8, padding:"4px 8px", borderRadius:20, background:C.bg }}>
              <span style={{ fontSize:14, fontWeight:600, color:C.primary }}>{admin?.name}</span>
              <span style={{ fontSize:12, color:C.primary, opacity:0.7 }}>▼</span>
            </button>
            {showUserMenu && (
              <div style={{ position:"absolute", right:0, top:40, width:180, background:C.white, borderRadius:8, boxShadow:"0 4px 20px rgba(0,0,0,0.15)", zIndex:1000 }}>
                <button onClick={() => { setShowUserMenu(false); navigate("profile"); }} style={{ width:"100%", padding:"10px 16px", border:"none", background:"none", cursor:"pointer", textAlign:"left", borderBottom:`1px solid ${C.border}`, color:C.primary }}>
                  View Profile
                </button>
                <button onClick={onLogout} style={{ width:"100%", padding:"10px 16px", border:"none", background:"none", cursor:"pointer", textAlign:"left", color:C.primary }}>
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <TopNav view={view} navigate={navigate} />

      <main style={{ padding:28 }}>
        {children}
      </main>
      <Toast toast={toast} />
    </div>
  );
};

// ── PROFILE PAGE ──────────────────────────────────────────────────────────────
const Profile = ({ admin }) => {
  return (
    <div>
      <h2 style={{ fontSize:24, fontWeight:700, color:C.primary, fontFamily:"'Playfair Display',serif", marginBottom:20 }}>My Profile</h2>
      <div style={S.card}>
        <div style={{ display:"flex", alignItems:"center", gap:24 }}>
          <div style={{ width:80, height:80, borderRadius:"50%", background:C.primary, display:"flex", alignItems:"center", justifyContent:"center", fontSize:32, fontWeight:800, color:C.white }}>
            {initials(admin?.name)}
          </div>
          <div>
            <div style={{ fontSize:20, fontWeight:600, color:C.primary }}>{admin?.name}</div>
            <div style={{ fontSize:14, color:C.primary, opacity:0.7 }}>{admin?.email}</div>
            <div style={{ fontSize:14, color:C.primary, opacity:0.7 }}>Role: {admin?.role}</div>
            <div style={{ fontSize:12, color:C.primary, marginTop:4 }}>Member since {fmtDate(admin?.created_at)}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── DASHBOARD ─────────────────────────────────────────────────────────────────
const Dashboard = ({ employees, navigate, admin, leaveRequests }) => {
  const regLink = `${window.location.href.split("#")[0]}#register`;
  const leaveLink = `${window.location.href.split("#")[0]}#leave-request`;
  const pendingLeaves = leaveRequests.filter(r => r.status === "Pending").length;

  return (
    <div>
      <h1 style={{ fontSize:24, fontWeight:700, color:C.primary, fontFamily:"'Playfair Display',serif", marginBottom:24 }}>Dashboard</h1>

      <div style={{ ...S.card, background:C.primary, marginBottom:24 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:16, flexWrap:"wrap" }}>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:16, fontWeight:700, color:C.white, fontFamily:"'Playfair Display',serif", marginBottom:6 }}>Employee Self-Registration Portal</div>
            <div style={{ background:`${C.white}20`, padding:"10px 16px", borderRadius:8, fontSize:12, fontFamily:"monospace", color:C.white, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:500 }}>{regLink}</div>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={()=>{navigator.clipboard.writeText(regLink); alert("Link copied!");}} style={{ ...S.btn("primary"), background:C.white, color:C.primary }}>Copy Link</button>
          </div>
        </div>
      </div>

      <div style={{ ...S.card, background:C.primary, marginBottom:24 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:16, flexWrap:"wrap" }}>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:16, fontWeight:700, color:C.white, fontFamily:"'Playfair Display',serif", marginBottom:6 }}>Employee Leave Request Portal</div>
            <div style={{ background:`${C.white}20`, padding:"10px 16px", borderRadius:8, fontSize:12, fontFamily:"monospace", color:C.white, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:500 }}>{leaveLink}</div>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={()=>{navigator.clipboard.writeText(leaveLink); alert("Link copied!");}} style={{ ...S.btn("primary"), background:C.white, color:C.primary }}>Copy Link</button>
          </div>
        </div>
      </div>

      <div style={{ ...S.card }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <h3 style={{ fontSize:18, fontWeight:700, color:C.primary, fontFamily:"'Playfair Display',serif" }}>Leave Requests</h3>
          {pendingLeaves > 0 && (
            <span style={S.badge("Pending")}>{pendingLeaves} pending</span>
          )}
        </div>
        <p style={{ color:C.primary, opacity:0.7, marginBottom:16 }}>{pendingLeaves} leave request{pendingLeaves!==1?"s":""} awaiting review.</p>
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
          <div style={{ fontSize:24, fontWeight:700, color:C.primary, fontFamily:"'Playfair Display',serif" }}>Employee Database</div>
          <div style={{ color:C.primary, opacity:0.7, fontSize:14 }}>{filtered.length} record{filtered.length!==1?"s":""}</div>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <button onClick={exportCSV} style={S.btn("outline")}>Export CSV</button>
          <button onClick={()=>navigate("add-employee")} style={S.btn("primary")}>Add Employee</button>
          <button onClick={onRefresh} style={{ ...S.btn("outline"), marginLeft:8 }}>↻ Refresh</button>
          <button onClick={() => navigate("reports")} style={{ ...S.btn("outline"), marginLeft:8 }}>Reports</button>
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
          <button onClick={()=>{setSearch("");setDeptF("All");setStatusF("All");setPage(1);}} style={{ ...S.btn("ghost"), color:C.primary, fontSize:13 }}>✕ Clear</button>
        )}
      </div>

      <div style={{ ...S.card, padding:0, overflow:"hidden", borderRadius:"0 0 12px 12px", marginTop:0 }}>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
            <thead>
              <tr style={{ background:C.primary, color:C.white }}>
                <th style={{ padding:"12px 14px", textAlign:"left", fontWeight:600, fontSize:11, whiteSpace:"nowrap", letterSpacing:0.5 }}>Personal No.</th>
                <th style={{ padding:"12px 14px", textAlign:"left", fontWeight:600, fontSize:11, whiteSpace:"nowrap", letterSpacing:0.5 }}>Full Name</th>
                <th style={{ padding:"12px 14px", textAlign:"left", fontWeight:600, fontSize:11, whiteSpace:"nowrap", letterSpacing:0.5 }}>Department</th>
                <th style={{ padding:"12px 14px", textAlign:"left", fontWeight:600, fontSize:11, whiteSpace:"nowrap", letterSpacing:0.5 }}>Job Title</th>
                <th style={{ padding:"12px 14px", textAlign:"left", fontWeight:600, fontSize:11, whiteSpace:"nowrap", letterSpacing:0.5 }}>Grade</th>
                <th style={{ padding:"12px 14px", textAlign:"left", fontWeight:600, fontSize:11, whiteSpace:"nowrap", letterSpacing:0.5 }}>Type</th>
                <th style={{ padding:"12px 14px", textAlign:"left", fontWeight:600, fontSize:11, whiteSpace:"nowrap", letterSpacing:0.5 }}>County</th>
                <th style={{ padding:"12px 14px", textAlign:"left", fontWeight:600, fontSize:11, whiteSpace:"nowrap", letterSpacing:0.5 }}>Status</th>
                <th style={{ padding:"12px 14px", textAlign:"left", fontWeight:600, fontSize:11, whiteSpace:"nowrap", letterSpacing:0.5 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paged.length===0 ? (
                <tr><td colSpan={9} style={{ textAlign:"center", padding:60, color:C.primary }}>
                  {employees.length ? "No employees match your search." : "No employees yet."}
                </td></tr>
              ) : paged.map((e,i) => (
                <tr key={e.id} style={{ borderBottom:`1px solid ${C.border}`, background:i%2===0?C.white:"#fafbfc" }}>
                  <td style={{ padding:"10px 14px", fontFamily:"monospace", fontSize:12, color:C.primary, fontWeight:700, whiteSpace:"nowrap" }}>{e.personalNumber}</td>
                  <td style={{ padding:"10px 14px", fontWeight:600, color:C.primary, whiteSpace:"nowrap" }}>{e.firstName} {e.middleName} {e.lastName}</td>
                  <td style={{ padding:"10px 14px", color:C.primary, maxWidth:160, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{e.department||"—"}</td>
                  <td style={{ padding:"10px 14px", whiteSpace:"nowrap", color:C.primary }}>{e.jobTitle||"—"}</td>
                  <td style={{ padding:"10px 14px", textAlign:"center", fontWeight:700, color:C.primary }}>{e.jobGrade||"—"}</td>
                  <td style={{ padding:"10px 14px", color:C.primary, whiteSpace:"nowrap" }}>{e.employmentType?.split(" ")[0]||"—"}</td>
                  <td style={{ padding:"10px 14px", color:C.primary }}>{e.county||"—"}</td>
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
            <div style={{ color:C.primary, opacity:0.7, fontSize:13 }}>Page {page} of {totalPages}</div>
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

// ── EMPLOYEE DOCUMENTS COMPONENT (for admin use) ──────────────────────────────
const EmployeeDocuments = ({ employeeId, documents, onUpload, onDelete, isEditing }) => {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    for (let file of files) {
      await onUpload(file);
    }
    setUploading(false);
    fileInputRef.current.value = '';
  };

  return (
    <div>
      <div style={S.secHead}>Documents</div>
      {isEditing && (
        <div style={{ marginBottom: 20 }}>
          <input
            type="file"
            multiple
            ref={fileInputRef}
            onChange={handleFileChange}
            disabled={uploading}
            style={{ marginRight: 10 }}
          />
          {uploading && <span>Uploading...</span>}
        </div>
      )}
      {documents && documents.length > 0 ? (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: C.primary, color: C.white }}>
              <th style={{ padding: 10, textAlign: 'left' }}>File Name</th>
              <th style={{ padding: 10, textAlign: 'left' }}>Type</th>
              <th style={{ padding: 10, textAlign: 'left' }}>Uploaded</th>
              {isEditing && <th style={{ padding: 10 }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {documents.map(doc => (
              <tr key={doc.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                <td style={{ padding: 10 }}>
                  <a href={doc.file_url} target="_blank" rel="noopener noreferrer" style={{ color: C.primary }}>
                    {doc.file_name}
                  </a>
                </td>
                <td style={{ padding: 10 }}>{doc.file_type || '—'}</td>
                <td style={{ padding: 10 }}>{fmtDate(doc.uploaded_at)}</td>
                {isEditing && (
                  <td style={{ padding: 10 }}>
                    <button onClick={() => onDelete(doc)} style={{ ...S.btn("danger"), padding: '4px 10px', fontSize: 12 }}>
                      Delete
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p style={{ color: C.primary, opacity: 0.7 }}>No documents uploaded yet.</p>
      )}
    </div>
  );
};

// ── EMPLOYEE FORM (with Documents tab) ────────────────────────────────────────
const EmployeeForm = ({ employee, onSave, navigate, employees }) => {
  const [form, setForm] = useState(employee ? {
    ...employee,
    education: employee.education || [{id:uid(),level:"",institution:"",fieldOfStudy:"",yearCompleted:""}],
    professionalBodies: employee.professionalBodies || [{id:uid(),bodyName:"",membershipNo:"",registrationDate:""}],
    workExperiences: employee.workExperiences || [{id:uid(),employer:"",role:"",duration:"",startDate:"",endDate:""}]
  } : { ...emptyEmp(), personalNumber: "" });
  const [tab, setTab] = useState(0);
  const [validationError, setValidationError] = useState('');
  const [documents, setDocuments] = useState(employee?.documents || []);

  const requiredFieldsPerTab = {
    0: ['firstName', 'lastName', 'nationalId', 'personalNumber', 'phone'],
    1: ['jobTitle'],
    2: ['county'],
    3: [],
    4: [],
    5: [],
    6: [],
    7: [],
  };

  useEffect(() => {
    if (employee?.id) {
      fetchDocuments(employee.id);
    }
  }, [employee]);

  const fetchDocuments = async (empId) => {
    const { data, error } = await supabase
      .from('employee_documents')
      .select('*')
      .eq('employee_id', empId)
      .order('uploaded_at', { ascending: false });
    if (!error) setDocuments(data);
  };

  const uploadDocument = async (file) => {
    if (!employee?.id) {
      alert('Please save the employee first before uploading documents.');
      return;
    }
    const fileExt = file.name.split('.').pop();
    const fileName = `${employee.id}/${Date.now()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage
      .from('employee-documents')
      .upload(fileName, file);
    if (uploadError) {
      alert('Upload failed: ' + uploadError.message);
      return;
    }
    const { data: urlData } = supabase.storage
      .from('employee-documents')
      .getPublicUrl(fileName);
    const fileUrl = urlData.publicUrl;
    const { data, error } = await supabase
      .from('employee_documents')
      .insert([{
        employee_id: employee.id,
        file_name: file.name,
        file_url: fileUrl,
        file_type: file.type
      }])
      .select()
      .single();
    if (error) {
      alert('Error saving document info: ' + error.message);
      return;
    }
    setDocuments(prev => [...prev, data]);
  };

  const deleteDocument = async (doc) => {
    const fileName = doc.file_url.split('/').pop();
    const { error: storageError } = await supabase.storage
      .from('employee-documents')
      .remove([`${employee.id}/${fileName}`]);
    if (storageError) {
      alert('Failed to delete file: ' + storageError.message);
      return;
    }
    const { error } = await supabase
      .from('employee_documents')
      .delete()
      .eq('id', doc.id);
    if (error) {
      alert('Error deleting document record: ' + error.message);
      return;
    }
    setDocuments(prev => prev.filter(d => d.id !== doc.id));
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

  const TABS = ["Personal Info","Employment","Deployment","Education","Prof. Bodies","Work Experience","Emergency","Documents"];
  const tabBtn = (i) => ({ padding:"8px 16px", borderRadius:8, border:"none", cursor:"pointer", fontFamily:"'Inter', sans-serif", fontSize:13, fontWeight:tab===i?700:400, background:tab===i?C.primary:"transparent", color:tab===i?C.white:C.primary, transition:"all 0.15s" });

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:22 }}>
        <button onClick={()=>navigate("employees")} style={{ ...S.btn("ghost"), color:C.primary, padding:"8px 12px" }}>← Back</button>
        <div>
          <div style={{ fontSize:22, fontWeight:700, color:C.primary, fontFamily:"'Playfair Display',serif" }}>{employee?"Edit Employee Record":"Add New Employee"}</div>
          <div style={{ color:C.primary, opacity:0.7, fontSize:13 }}>Personal Number: <span style={{ fontWeight:700, color:C.primary, fontFamily:"monospace" }}>{form.personalNumber}</span></div>
        </div>
      </div>

      <div style={{ background:C.white, borderRadius:"12px 12px 0 0", padding:"10px 14px", borderBottom:`2px solid ${C.primary}`, display:"flex", gap:4, flexWrap:"wrap", boxShadow:"0 2px 16px rgba(13,31,60,0.08)" }}>
        {TABS.map((t,i)=><button key={i} style={tabBtn(i)} onClick={()=>setTab(i)}>{i+1}. {t}</button>)}
      </div>

      <div style={{ ...S.card, borderRadius:"0 0 12px 12px", marginTop:0 }}>
        {tab===0 && (
          <div>
            <div style={S.secHead}>Personal Information</div>
            {validationError && <div style={{ color:C.primary, marginBottom:10 }}>{validationError}</div>}
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
                  <div style={{ fontWeight:600, color:C.primary, fontSize:14 }}>Qualification {i+1}</div>
                  {i>0 && <button onClick={()=>rmEdu(i)} style={{ ...S.btn("danger"), padding:"4px 12px", fontSize:12 }}>Remove</button>}
                </div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:12 }}>
                  <Field label="Education Level" half><Sel value={e.level} onChange={v=>setEdu(i,"level",v)} options={EDUCATION_LEVELS} /></Field>
                  <Field label="Year Completed" half>
                    <YearSelect value={e.yearCompleted} onChange={v=>setEdu(i,"yearCompleted",v)} />
                  </Field>
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
                  <div style={{ fontWeight:600, color:C.primary, fontSize:14 }}>Membership {i+1}</div>
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
                  <div style={{ fontWeight:600, color:C.primary, fontSize:14 }}>Experience {i+1}</div>
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

        {tab===7 && (
          <EmployeeDocuments
            employeeId={employee?.id}
            documents={documents}
            onUpload={uploadDocument}
            onDelete={deleteDocument}
            isEditing={true}
          />
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

// ── EMPLOYEE PROFILE (with Documents section) ─────────────────────────────────
const Row = ({ label, value }) => (
  <div style={{ display:"flex", gap:12, padding:"9px 0", borderBottom:`1px solid ${C.border}` }}>
    <div style={{ width:190, color:C.primary, fontSize:12, fontWeight:600, textTransform:"uppercase", letterSpacing:0.4, flexShrink:0, paddingTop:1 }}>{label}</div>
    <div style={{ fontSize:13, color:C.primary, fontWeight:500, flex:1 }}>{value||"—"}</div>
  </div>
);

const EmployeeProfile = ({ employee:e, navigate, onDelete }) => {
  const fullName = `${e.firstName} ${e.middleName} ${e.lastName}`.replace(/\s+/g," ").trim();
  return (
    <div>
      <div className="no-print" style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:22, flexWrap:"wrap", gap:12 }}>
        <div style={{ display:"flex", gap:10, alignItems:"center" }}>
          <button onClick={()=>navigate("employees")} style={{ ...S.btn("ghost"), color:C.primary }}>← Back</button>
          <div style={{ fontSize:22, fontWeight:700, color:C.primary, fontFamily:"'Playfair Display',serif" }}>Employee Profile</div>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <button onClick={()=>window.print()} style={S.btn("outline")}>Print</button>
          <button onClick={()=>navigate("edit-employee",e)} style={S.btn("primary")}>✏ Edit Record</button>
          <button onClick={()=>{if(window.confirm(`Permanently remove ${fullName} from the system?`))onDelete(e.id);}} style={{ ...S.btn("danger"), padding:"5px 10px", fontSize:12 }}>🗑 Delete</button>
        </div>
      </div>

      <div style={{ background:C.primary, borderRadius:14, padding:"24px 28px", marginBottom:20, display:"flex", gap:22, alignItems:"center", boxShadow:"0 4px 24px rgba(13,31,60,0.2)" }}>
        <div style={{ width:76, height:76, borderRadius:"50%", background:C.white, display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, fontWeight:800, color:C.primary }}>
          {initials(fullName)}
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:26, fontWeight:700, color:C.white, fontFamily:"'Playfair Display',serif", marginBottom:4 }}>{fullName}</div>
          <div style={{ color:C.white, fontSize:14, fontWeight:600, marginBottom:6 }}>{e.jobTitle||"—"} {e.department?`— ${e.department}`:""}</div>
          <div style={{ display:"flex", gap:20, flexWrap:"wrap" }}>
            <div style={{ color:`${C.white}80`, fontSize:12 }}>Personal No: <span style={{ color:C.white, fontFamily:"monospace", fontWeight:700 }}>{e.personalNumber}</span></div>
            {e.employmentDate && <div style={{ color:`${C.white}80`, fontSize:12 }}>Employed: <span style={{ color:C.white }}>{fmtDate(e.employmentDate)}</span></div>}
            {e.jobGrade && <div style={{ color:`${C.white}80`, fontSize:12 }}>Grade: <span style={{ color:C.white, fontWeight:700 }}>{e.jobGrade}</span></div>}
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
              <div style={{ fontWeight:700, color:C.primary, fontSize:14 }}>{ed.level||"Not specified"}</div>
              <div style={{ color:C.primary, opacity:0.7, fontSize:13, marginTop:2 }}>{ed.institution}{ed.fieldOfStudy?` · ${ed.fieldOfStudy}`:""}</div>
              {ed.yearCompleted && <div style={{ color:C.primary, fontSize:12, fontWeight:600, marginTop:2 }}>Year: {ed.yearCompleted}</div>}
            </div>
          )) : <div style={{ color:C.primary, opacity:0.7, fontSize:13 }}>No education records added.</div>}

          <div style={{ marginTop:18 }}><div style={S.secHead}>Work Experience</div></div>
          {(e.workExperiences||[]).filter(x=>x.employer||x.role).length ? (e.workExperiences||[]).filter(x=>x.employer||x.role).map((exp,i) => (
            <div key={i} style={{ padding:"10px 0", borderBottom:`1px solid ${C.border}` }}>
              <div style={{ fontWeight:700, color:C.primary, fontSize:14 }}>{exp.role || "Role not specified"}</div>
              <div style={{ color:C.primary, opacity:0.7, fontSize:13, marginTop:2 }}>{exp.employer}{exp.duration?` · ${exp.duration}`:""}</div>
              {(exp.startDate || exp.endDate) && <div style={{ color:C.primary, opacity:0.6, fontSize:12, marginTop:2 }}>{exp.startDate?fmtDate(exp.startDate):"?"} – {exp.endDate?fmtDate(exp.endDate):"Present"}</div>}
            </div>
          )) : <div style={{ color:C.primary, opacity:0.7, fontSize:13 }}>No work experience added.</div>}

          <div style={{ marginTop:18 }}><div style={S.secHead}>Professional Bodies</div></div>
          {(e.professionalBodies||[]).filter(x=>x.bodyName).length ? (e.professionalBodies||[]).filter(x=>x.bodyName).map((p,i) => (
            <div key={i} style={{ padding:"10px 0", borderBottom:`1px solid ${C.border}` }}>
              <div style={{ fontWeight:700, color:C.primary, fontSize:14 }}>{p.bodyName}</div>
              <div style={{ color:C.primary, opacity:0.7, fontSize:13, marginTop:2 }}>Membership No: {p.membershipNo||"—"}</div>
              {p.registrationDate && <div style={{ color:C.primary, opacity:0.6, fontSize:12, marginTop:2 }}>Registered: {fmtDate(p.registrationDate)}</div>}
            </div>
          )) : <div style={{ color:C.primary, opacity:0.7, fontSize:13 }}>No professional memberships added.</div>}

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

        {/* Documents Section */}
        <div style={S.card}>
          <div style={S.secHead}>Documents</div>
          {e.documents && e.documents.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: C.primary, color: C.white }}>
                  <th style={{ padding: 10, textAlign: 'left' }}>File Name</th>
                  <th style={{ padding: 10, textAlign: 'left' }}>Uploaded</th>
                </tr>
              </thead>
              <tbody>
                {e.documents.map(doc => (
                  <tr key={doc.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                    <td style={{ padding: 10 }}>
                      <a href={doc.file_url} target="_blank" rel="noopener noreferrer" style={{ color: C.primary }}>
                        {doc.file_name}
                      </a>
                    </td>
                    <td style={{ padding: 10 }}>{fmtDate(doc.uploaded_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={{ color: C.primary, opacity: 0.7 }}>No documents uploaded.</p>
          )}
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
          <div style={{ fontSize:24, fontWeight:700, color:C.primary, fontFamily:"'Playfair Display',serif" }}>Admin Management</div>
          <div style={{ color:C.primary, opacity:0.7, fontSize:14 }}>{admins.length} administrator(s)</div>
        </div>
        <button onClick={()=>setShowForm(s=>!s)} style={S.btn("primary")}>+ Add Administrator</button>
      </div>

      {showForm && (
        <div style={{ ...S.card, borderLeft:`4px solid ${C.primary}`, marginBottom:20 }}>
          <div style={{ fontSize:16, fontWeight:700, color:C.primary, marginBottom:18, fontFamily:"'Playfair Display',serif" }}>New Administrator Account</div>
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
            <tr style={{ background:C.primary, color:C.white }}>
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
                    <div style={{ width:38, height:38, borderRadius:"50%", background:C.primary, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:800, color:C.white }}>{initials(a.name)}</div>
                    <div>
                      <div style={{ fontWeight:600, color:C.primary }}>{a.name}</div>
                      {a.is_super && <div style={{ fontSize:11, color:C.primary, fontWeight:700 }}>SUPER ADMIN</div>}
                      {a.id===currentAdmin?.id && !a.is_super && <div style={{ fontSize:11, color:C.primary, opacity:0.7 }}>• Current Session</div>}
                    </div>
                  </div>
                </td>
                <td style={{ padding:"14px 18px", color:C.primary, opacity:0.7 }}>{a.email}</td>
                <td style={{ padding:"14px 18px" }}><span style={S.badge("Active")}>{a.role}</span></td>
                <td style={{ padding:"14px 18px", color:C.primary, opacity:0.7, fontSize:13 }}>{fmtDate(a.created_at)}</td>
                <td style={{ padding:"14px 18px" }}>
                  {!a.is_super && a.id!==currentAdmin?.id
                    ? <button onClick={()=>{if(window.confirm(`Remove ${a.name} as administrator? They will lose system access.`))onRemove(a.id);}} style={{ ...S.btn("danger"), padding:"6px 14px", fontSize:12 }}>Remove Access</button>
                    : <span style={{ color:C.primary, opacity:0.7, fontSize:12 }}>{a.is_super?"Protected (Super Admin)":"(Your Account)"}</span>
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

// ── PUBLIC REGISTRATION (with document upload and blank download buttons) ─────
const PublicRegistration = ({ onSubmit, employees }) => {
  const [form, setForm] = useState({ 
    ...emptyEmp(), 
    status:"Pending Review", 
    submittedBy:"self",
    workExperiences: [{ id: uid(), employer: "", role: "", duration: "", startDate: "", endDate: "" }]
  });
  const [tab, setTab] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [newEmployee, setNewEmployee] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [stage, setStage] = useState('form'); // 'form', 'upload', 'success'
  const fileInputRef = useRef(null);

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
    try {
      const emp = await onSubmit(form);
      setNewEmployee(emp);
      setStage('upload');
    } catch (error) {
      alert('Registration failed. Please try again.');
    }
    setSubmitting(false);
  };

  const uploadDocument = async (file) => {
    if (!newEmployee?.id) return;
    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${newEmployee.id}/${Date.now()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage
      .from('employee-documents')
      .upload(fileName, file);
    if (uploadError) {
      alert('Upload failed: ' + uploadError.message);
      setUploading(false);
      return;
    }
    const { data: urlData } = supabase.storage
      .from('employee-documents')
      .getPublicUrl(fileName);
    const fileUrl = urlData.publicUrl;
    const { data, error } = await supabase
      .from('employee_documents')
      .insert([{
        employee_id: newEmployee.id,
        file_name: file.name,
        file_url: fileUrl,
        file_type: file.type
      }])
      .select()
      .single();
    if (error) {
      alert('Error saving document info: ' + error.message);
      setUploading(false);
      return;
    }
    setUploadedFiles(prev => [...prev, data]);
    setUploading(false);
  };

  const handleFileChange = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    for (let file of files) {
      await uploadDocument(file);
    }
    fileInputRef.current.value = '';
  };

  const finish = () => setStage('success');

  // ── Blank PDF generation for employee registration ───────────────────
  const generateBlankPDF = async () => {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();

    const loadImage = (url) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = reject;
        img.src = url;
      });
    };

    let imgData;
    try {
      imgData = await loadImage(`${process.env.PUBLIC_URL}/coat-of-arms.png`);
    } catch (error) {
      console.warn('Coat of arms image not found, using text fallback');
      imgData = null;
    }

    if (imgData) {
      doc.addImage(imgData, 'PNG', 10, 10, 20, 20);
      doc.setFontSize(16);
      doc.text('MINISTRY OF INFORMATION, COMMUNICATIONS', 35, 20);
      doc.setFontSize(12);
      doc.text('AND THE DIGITAL ECONOMY (MICDE)', 35, 27);
      doc.setFontSize(10);
      doc.text('Directorate of Public Communication', 35, 33);
    } else {
      doc.setFontSize(16);
      doc.text('REPUBLIC OF KENYA', 14, 15);
      doc.setFontSize(12);
      doc.text('MINISTRY OF INFORMATION, COMMUNICATIONS AND THE DIGITAL ECONOMY (MICDE)', 14, 22);
      doc.setFontSize(10);
      doc.text('Directorate of Public Communication', 14, 28);
    }
    doc.setFontSize(10);
    doc.text(`Form generated: ${new Date().toLocaleDateString()}`, 14, 40);
    doc.setFontSize(14);
    doc.text('Employee Self-Registration – Blank Form', 14, 50);

    let y = 60;
    const addSection = (title, fields) => {
      if (y > 250) {
        doc.addPage();
        y = 20;
        if (imgData) {
          doc.addImage(imgData, 'PNG', 10, 10, 20, 20);
          doc.setFontSize(16);
          doc.text('MINISTRY OF INFORMATION, COMMUNICATIONS', 35, 20);
          doc.setFontSize(12);
          doc.text('AND THE DIGITAL ECONOMY (MICDE)', 35, 27);
          doc.setFontSize(10);
          doc.text('Directorate of Public Communication', 35, 33);
        } else {
          doc.setFontSize(16);
          doc.text('REPUBLIC OF KENYA', 14, 15);
          doc.setFontSize(12);
          doc.text('MINISTRY OF INFORMATION, COMMUNICATIONS AND THE DIGITAL ECONOMY (MICDE)', 14, 22);
          doc.setFontSize(10);
          doc.text('Directorate of Public Communication', 14, 28);
        }
        doc.setFontSize(10);
        doc.text('Form continued...', 14, 40);
        y = 45;
      }
      doc.setFont(undefined, 'bold');
      doc.text(title, 14, y);
      y += 5;
      doc.setFont(undefined, 'normal');
      fields.forEach(field => {
        doc.text(`• ${field}: __________________________`, 16, y);
        y += 5;
      });
      y += 3;
    };

    addSection('Personal Information', [
      'First Name', 'Middle Name', 'Last Name', 'Date of Birth', 'Gender',
      'Marital Status', 'National ID', 'Personal Number', 'Nationality',
      'KRA PIN', 'NSSF Number', 'NHIF Number', 'Phone', 'Email'
    ]);

    addSection('Employment Details', [
      'Date of First Employment', 'Job Title', 'Job Grade', 'Employment Type',
      'Department', 'Station'
    ]);

    addSection('Place of Deployment', [
      'County', 'Region', 'Physical Address', 'Work Station'
    ]);

    addSection('Education (add rows as needed)', [
      'Level', 'Institution', 'Field of Study', 'Year Completed'
    ]);

    addSection('Professional Bodies', [
      'Body Name', 'Membership No.', 'Registration Date'
    ]);

    addSection('Work Experience', [
      'Employer', 'Role', 'Duration', 'Start Date', 'End Date'
    ]);

    addSection('Emergency Contact', [
      'Full Name', 'Relationship', 'Phone'
    ]);

    doc.save('employee_registration_blank.pdf');
  };

  // ── Blank Word generation for employee registration ───────────────────
  const generateBlankWord = async () => {
    const loadImage = (url) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = reject;
        img.src = url;
      });
    };

    let imgData;
    try {
      imgData = await loadImage(`${process.env.PUBLIC_URL}/coat-of-arms.png`);
    } catch (error) {
      console.warn('Coat of arms image not found, using text fallback');
      imgData = null;
    }

    const headerHtml = imgData ? `
      <div style="display:flex; align-items:center; gap:10px; margin-bottom:20px;">
        <img src="${imgData}" width="60" height="60" />
        <div>
          <div style="font-size:12px; color:#0d1f3c;">Republic of Kenya</div>
          <div style="font-size:16px; font-weight:700; color:#0d1f3c;">MINISTRY OF INFORMATION, COMMUNICATIONS AND THE DIGITAL ECONOMY (MICDE)</div>
          <div style="font-size:13px; color:#0d1f3c; opacity:0.7;">State Department of Broadcasting & Telecommunication · Directorate of Public Communication</div>
        </div>
      </div>
    ` : `
      <div style="margin-bottom:20px;">
        <div style="font-size:12px; color:#0d1f3c;">Republic of Kenya</div>
        <div style="font-size:16px; font-weight:700; color:#0d1f3c;">MINISTRY OF INFORMATION, COMMUNICATIONS AND THE DIGITAL ECONOMY (MICDE)</div>
        <div style="font-size:13px; color:#0d1f3c; opacity:0.7;">State Department of Broadcasting & Telecommunication · Directorate of Public Communication</div>
      </div>
    `;

    const sections = [
      { title: 'Personal Information', fields: [
        'First Name', 'Middle Name', 'Last Name', 'Date of Birth', 'Gender',
        'Marital Status', 'National ID', 'Personal Number', 'Nationality',
        'KRA PIN', 'NSSF Number', 'NHIF Number', 'Phone', 'Email'
      ] },
      { title: 'Employment Details', fields: [
        'Date of First Employment', 'Job Title', 'Job Grade', 'Employment Type',
        'Department', 'Station'
      ] },
      { title: 'Place of Deployment', fields: [
        'County', 'Region', 'Physical Address', 'Work Station'
      ] },
      { title: 'Education (add rows as needed)', fields: [
        'Level', 'Institution', 'Field of Study', 'Year Completed'
      ] },
      { title: 'Professional Bodies', fields: [
        'Body Name', 'Membership No.', 'Registration Date'
      ] },
      { title: 'Work Experience', fields: [
        'Employer', 'Role', 'Duration', 'Start Date', 'End Date'
      ] },
      { title: 'Emergency Contact', fields: [
        'Full Name', 'Relationship', 'Phone'
      ] }
    ];

    const sectionsHtml = sections.map(s => `
      <h4 style="margin-top:20px; color:#0d1f3c;">${s.title}</h4>
      ${s.fields.map(f => `<p><strong>${f}:</strong> __________________________</p>`).join('')}
    `).join('');

    const fullHtml = `
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: 'Inter', sans-serif; padding: 20px; background: #eef1f6; }
            .container { max-width: 800px; margin: 0 auto; }
            h4 { margin-bottom: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            ${headerHtml}
            <h2 style="color:#0d1f3c;">Employee Self-Registration – Blank Form</h2>
            <p>Generated: ${new Date().toLocaleDateString()}</p>
            ${sectionsHtml}
          </div>
        </body>
      </html>
    `;

    const blob = new Blob([fullHtml], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'employee_registration_blank.doc';
    link.click();
    URL.revokeObjectURL(url);
  };

  if (stage === 'upload') {
    return (
      <div style={{ minHeight:"100vh", background:C.bg, fontFamily:"'Inter', sans-serif", padding:20 }}>
        <div style={{ maxWidth:600, margin:"0 auto", background:C.white, borderRadius:16, padding:32, boxShadow:"0 4px 20px rgba(0,0,0,0.1)" }}>
          <div style={{ textAlign:"center", marginBottom:24 }}>
            <img src={`${process.env.PUBLIC_URL}/coat-of-arms.png`} alt="Coat of Arms" style={{ width:60, height:60 }} />
            <h1 style={{ fontSize:24, color:C.primary, fontFamily:"'Playfair Display',serif", marginTop:10 }}>Upload Documents</h1>
            <p style={{ color:C.primary, opacity:0.7 }}>You can upload your CV, certificates, or any supporting documents (optional).</p>
          </div>
          <div style={{ marginBottom:20 }}>
            <input
              type="file"
              multiple
              ref={fileInputRef}
              onChange={handleFileChange}
              disabled={uploading}
              style={{ marginRight: 10 }}
            />
            {uploading && <span>Uploading...</span>}
          </div>
          {uploadedFiles.length > 0 && (
            <div style={{ marginBottom:20 }}>
              <h3 style={{ color:C.primary }}>Uploaded Files:</h3>
              <ul>
                {uploadedFiles.map(f => <li key={f.id} style={{ color:C.primary }}>{f.file_name}</li>)}
              </ul>
            </div>
          )}
          <div style={{ display:"flex", justifyContent:"space-between", gap:16 }}>
            <button onClick={finish} style={{ ...S.btn("primary") }}>Continue to Success</button>
            <button onClick={finish} style={{ ...S.btn("ghost") }}>Skip</button>
          </div>
        </div>
      </div>
    );
  }

  if (stage === 'success') {
    return (
      <div style={{ minHeight:"100vh", background:C.primary, display:"flex", alignItems:"center", justifyContent:"center", padding:20, fontFamily:"'Inter', sans-serif" }}>
        <style>{`*{box-sizing:border-box}body{margin:0}`}</style>
        <div style={{ background:C.white, borderRadius:24, padding:"52px 48px", textAlign:"center", maxWidth:500, boxShadow:"0 40px 80px rgba(0,0,0,0.4)" }}>
          <div style={{ fontSize:72, marginBottom:20 }}>✅</div>
          <div style={{ fontSize:28, fontWeight:700, color:C.primary, fontFamily:"'Playfair Display',serif", marginBottom:10 }}>Registration Successful!</div>
          <div style={{ color:C.primary, opacity:0.7, fontSize:15, marginBottom:24, lineHeight:1.7 }}>
            Thank you, <strong>{form.firstName} {form.lastName}</strong>. Your details have been securely submitted.
          </div>
          <div style={{ background:C.bg, borderRadius:12, padding:24, marginBottom:24 }}>
            <div style={{ color:C.primary, fontSize:12, fontWeight:600, textTransform:"uppercase", letterSpacing:1, marginBottom:8 }}>Your Personal Number</div>
            <div style={{ fontSize:32, fontWeight:800, color:C.primary, fontFamily:"monospace", letterSpacing:2, marginBottom:4 }}>{newEmployee?.personalNumber}</div>
            <div style={{ fontSize:13, color:C.primary, opacity:0.7 }}>Keep this number for future reference.</div>
          </div>
          <div style={{ color:C.primary, fontSize:14, lineHeight:1.7, background:"#fee2e2", padding:"16px 20px", borderRadius:12, border:`1px solid ${C.primary}`, marginBottom:24 }}>
            <strong>⏳ Pending Review</strong> – Your record will be reviewed by an administrator.
          </div>
          <button onClick={() => window.location.href = '/'} style={{ ...S.btn("outline"), padding:"12px 24px", fontSize:15 }}>Return to Home</button>
        </div>
      </div>
    );
  }

  const TABS = ["Personal Info","Employment","Deployment","Education","Prof. Bodies","Work Experience","Emergency"];

  return (
    <div style={{ minHeight:"100vh", background:C.bg, fontFamily:"'Inter', sans-serif" }}>
      <style>{`*{box-sizing:border-box}body{margin:0}input:focus,select:focus,textarea:focus{border-color:${C.primary}!important;box-shadow:0 0 0 3px ${C.primary}20!important;outline:none!important}`}</style>
      
      <div style={{ background:C.primary, padding:"18px 28px", display:"flex", alignItems:"center", gap:16 }}>
        <div style={{ width:52, height:52, borderRadius:12, background:C.white, display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, flexShrink:0 }}>
          <img src={`${process.env.PUBLIC_URL}/coat-of-arms.png`} alt="Coat of Arms" style={{ width:40, height:40 }} />
        </div>
        <div>
          <div style={{ color:C.white, fontSize:10, fontWeight:700, letterSpacing:2.5, textTransform:"uppercase" }}>Republic of Kenya · Ministry of ICT and Digital Economy</div>
          <div style={{ color:C.white, fontSize:16, fontWeight:700, fontFamily:"'Playfair Display',serif" }}>Directorate of Public Communication</div>
          <div style={{ color:`${C.white}80`, fontSize:11 }}>Employee Self‑Registration</div>
        </div>
      </div>

      <div style={{ maxWidth:820, margin:"28px auto", padding:"0 20px 60px" }}>
        <div style={{ ...S.card, textAlign:"center", borderTop:`4px solid ${C.primary}`, padding:"24px 28px", marginBottom:16 }}>
          <div style={{ fontSize:20, fontWeight:700, color:C.primary, fontFamily:"'Playfair Display',serif", marginBottom:6 }}>Employee Self-Registration</div>
          <div style={{ color:C.primary, opacity:0.7, fontSize:13 }}>Fields marked <span style={{color:C.primary}}>*</span> are required.</div>
        </div>

        <div style={{ display:"flex", gap:4, marginBottom:0, overflowX:"auto", paddingBottom:4 }}>
          {TABS.map((t,i) => (
            <div key={i} onClick={()=>setTab(i)} style={{ flex:"1 0 auto", minWidth:80, textAlign:"center", padding:"9px 10px", background:i<tab?C.primary:i===tab?C.primary:"#e2e8f0", borderRadius:8, fontSize:11, fontWeight:700, color:i<=tab?C.white:C.primary, cursor:"pointer", whiteSpace:"nowrap", letterSpacing:0.3 }}>
              {i<tab?"✓ ":""}{i+1}. {t}
            </div>
          ))}
        </div>

        <div style={{ ...S.card, borderRadius:"0 0 12px 12px", marginTop:0, borderTop:`2px solid ${C.primary}` }}>
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
                    <div style={{ fontWeight:600, color:C.primary, fontSize:14 }}>Qualification {i+1}</div>
                    {i>0 && <button onClick={()=>rmEdu(i)} style={{ ...S.btn("danger"), padding:"4px 12px", fontSize:12 }}>Remove</button>}
                  </div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:12 }}>
                    <Field label="Education Level" half><Sel value={e.level} onChange={v=>setEdu(i,"level",v)} options={EDUCATION_LEVELS} /></Field>
                    <Field label="Year Completed" half>
                      <YearSelect value={e.yearCompleted} onChange={v=>setEdu(i,"yearCompleted",v)} />
                    </Field>
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
                    <div style={{ fontWeight:600, color:C.primary, fontSize:14 }}>Membership {i+1}</div>
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
                    <div style={{ fontWeight:600, color:C.primary, fontSize:14 }}>Experience {i+1}</div>
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

        {/* Download buttons for blank forms */}
        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <p style={{ color:C.primary, fontSize:13 }}>Need a paper form? Download a blank template:</p>
          <div style={{ display:'flex', gap:10, justifyContent:'center' }}>
            <button onClick={generateBlankPDF} style={S.btn("outline")}>Blank PDF</button>
            <button onClick={generateBlankWord} style={S.btn("outline")}>Blank Word</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── LEAVE REQUEST PUBLIC FORM (with blank download buttons) ───────────────────
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
  const [loading, setLoading] = useState(false);
  const [employeeValid, setEmployeeValid] = useState(false);

  const validateEmployee = async () => {
    if (!form.employeePersonalNumber) {
      setError("Please enter your personal number.");
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from('employees')
      .select('first_name, last_name')
      .eq('personal_number', form.employeePersonalNumber)
      .maybeSingle();
    if (error || !data) {
      setError("Invalid personal number. Please check and try again.");
      setEmployeeValid(false);
      setForm(prev => ({ ...prev, employeeName: "" }));
    } else {
      setForm(prev => ({ ...prev, employeeName: `${data.first_name} ${data.last_name}` }));
      setEmployeeValid(true);
      setError("");
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!employeeValid) {
      setError("Please verify your personal number first.");
      return;
    }
    if (!form.startDate || !form.endDate || !form.reason) {
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

  // ── Blank PDF for leave request ────────────────────────────────────────
  const generateBlankPDF = async () => {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();

    const loadImage = (url) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = reject;
        img.src = url;
      });
    };

    let imgData;
    try {
      imgData = await loadImage(`${process.env.PUBLIC_URL}/coat-of-arms.png`);
    } catch (error) {
      console.warn('Coat of arms image not found, using text fallback');
      imgData = null;
    }

    if (imgData) {
      doc.addImage(imgData, 'PNG', 10, 10, 20, 20);
      doc.setFontSize(16);
      doc.text('MINISTRY OF INFORMATION, COMMUNICATIONS', 35, 20);
      doc.setFontSize(12);
      doc.text('AND THE DIGITAL ECONOMY (MICDE)', 35, 27);
      doc.setFontSize(10);
      doc.text('Directorate of Public Communication', 35, 33);
    } else {
      doc.setFontSize(16);
      doc.text('REPUBLIC OF KENYA', 14, 15);
      doc.setFontSize(12);
      doc.text('MINISTRY OF INFORMATION, COMMUNICATIONS AND THE DIGITAL ECONOMY (MICDE)', 14, 22);
      doc.setFontSize(10);
      doc.text('Directorate of Public Communication', 14, 28);
    }
    doc.setFontSize(10);
    doc.text(`Form generated: ${new Date().toLocaleDateString()}`, 14, 40);
    doc.setFontSize(14);
    doc.text('Leave Request – Blank Form', 14, 50);

    let y = 60;
    const fields = [
      'Personal Number',
      'Full Name',
      'Start Date',
      'End Date',
      'Reason for Leave'
    ];

    fields.forEach((field, idx) => {
      if (y > 250) {
        doc.addPage();
        y = 20;
        if (imgData) {
          doc.addImage(imgData, 'PNG', 10, 10, 20, 20);
          doc.setFontSize(16);
          doc.text('MINISTRY OF INFORMATION, COMMUNICATIONS', 35, 20);
          doc.setFontSize(12);
          doc.text('AND THE DIGITAL ECONOMY (MICDE)', 35, 27);
          doc.setFontSize(10);
          doc.text('Directorate of Public Communication', 35, 33);
        } else {
          doc.setFontSize(16);
          doc.text('REPUBLIC OF KENYA', 14, 15);
          doc.setFontSize(12);
          doc.text('MINISTRY OF INFORMATION, COMMUNICATIONS AND THE DIGITAL ECONOMY (MICDE)', 14, 22);
          doc.setFontSize(10);
          doc.text('Directorate of Public Communication', 14, 28);
        }
        doc.setFontSize(10);
        doc.text('Form continued...', 14, 40);
        y = 45;
      }
      doc.text(`${idx+1}. ${field}: __________________________`, 14, y);
      y += 7;
    });

    doc.save('leave_request_blank.pdf');
  };

  // ── Blank Word for leave request ────────────────────────────────────────
  const generateBlankWord = async () => {
    const loadImage = (url) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = reject;
        img.src = url;
      });
    };

    let imgData;
    try {
      imgData = await loadImage(`${process.env.PUBLIC_URL}/coat-of-arms.png`);
    } catch (error) {
      console.warn('Coat of arms image not found, using text fallback');
      imgData = null;
    }

    const headerHtml = imgData ? `
      <div style="display:flex; align-items:center; gap:10px; margin-bottom:20px;">
        <img src="${imgData}" width="60" height="60" />
        <div>
          <div style="font-size:12px; color:#0d1f3c;">Republic of Kenya</div>
          <div style="font-size:16px; font-weight:700; color:#0d1f3c;">MINISTRY OF INFORMATION, COMMUNICATIONS AND THE DIGITAL ECONOMY (MICDE)</div>
          <div style="font-size:13px; color:#0d1f3c; opacity:0.7;">State Department of Broadcasting & Telecommunication · Directorate of Public Communication</div>
        </div>
      </div>
    ` : `
      <div style="margin-bottom:20px;">
        <div style="font-size:12px; color:#0d1f3c;">Republic of Kenya</div>
        <div style="font-size:16px; font-weight:700; color:#0d1f3c;">MINISTRY OF INFORMATION, COMMUNICATIONS AND THE DIGITAL ECONOMY (MICDE)</div>
        <div style="font-size:13px; color:#0d1f3c; opacity:0.7;">State Department of Broadcasting & Telecommunication · Directorate of Public Communication</div>
      </div>
    `;

    const fieldsHtml = `
      <ol style="list-style:decimal; padding-left:20px;">
        <li><strong>Personal Number:</strong> __________________________</li>
        <li><strong>Full Name:</strong> __________________________</li>
        <li><strong>Start Date:</strong> __________________________</li>
        <li><strong>End Date:</strong> __________________________</li>
        <li><strong>Reason for Leave:</strong> __________________________</li>
      </ol>
    `;

    const fullHtml = `
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: 'Inter', sans-serif; padding: 20px; background: #eef1f6; }
            .container { max-width: 800px; margin: 0 auto; }
          </style>
        </head>
        <body>
          <div class="container">
            ${headerHtml}
            <h2 style="color:#0d1f3c;">Leave Request – Blank Form</h2>
            <p>Generated: ${new Date().toLocaleDateString()}</p>
            ${fieldsHtml}
          </div>
        </body>
      </html>
    `;

    const blob = new Blob([fullHtml], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'leave_request_blank.doc';
    link.click();
    URL.revokeObjectURL(url);
  };

  if (submitted) {
    return (
      <div style={{ minHeight:"100vh", background:C.primary, display:"flex", alignItems:"center", justifyContent:"center", padding:20, fontFamily:"'Inter', sans-serif" }}>
        <div style={{ background:C.white, borderRadius:24, padding:"40px", textAlign:"center", maxWidth:400 }}>
          <div style={{ fontSize:48, marginBottom:20 }}>✅</div>
          <h2 style={{ color:C.primary, marginBottom:10 }}>Leave Request Submitted</h2>
          <p style={{ color:C.primary, opacity:0.7 }}>Your request has been received and is pending approval.</p>
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
          <h1 style={{ fontSize:24, color:C.primary, fontFamily:"'Playfair Display',serif", marginTop:10 }}>Leave Request</h1>
          <p style={{ color:C.primary, opacity:0.7 }}>Enter your personal number to request leave.</p>
        </div>
        {error && <div style={{ background:"#fee2e2", color:C.primary, padding:10, borderRadius:6, marginBottom:16, border:`1px solid ${C.primary}` }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <Field label="Personal Number" required>
            <div style={{ display:"flex", gap:8 }}>
              <Inp
                value={form.employeePersonalNumber}
                onChange={(val) => {
                  setForm({...form, employeePersonalNumber: val});
                  setEmployeeValid(false);
                }}
                placeholder="e.g. DPC/2025/00012"
                required
                disabled={loading}
                style={{ flex:1 }}
              />
              <button 
                type="button" 
                onClick={validateEmployee} 
                disabled={loading}
                style={{ ...S.btn("primary"), padding:"10px 16px" }}
              >
                {loading ? "..." : "Verify"}
              </button>
            </div>
          </Field>

          {form.employeeName && (
            <div style={{ marginBottom:16, padding:10, background:C.bg, borderRadius:8, border:`1px solid ${C.border}` }}>
              <strong style={{ color:C.primary }}>Name:</strong> {form.employeeName}
            </div>
          )}

          <div style={{ display:"flex", gap:16, flexWrap:"wrap" }}>
            <Field label="Start Date" required half>
              <Inp
                type="date"
                value={form.startDate}
                onChange={(val) => setForm({...form, startDate: val})}
                required
                disabled={!employeeValid}
              />
            </Field>
            <Field label="End Date" required half>
              <Inp
                type="date"
                value={form.endDate}
                onChange={(val) => setForm({...form, endDate: val})}
                required
                disabled={!employeeValid}
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
              disabled={!employeeValid}
            />
          </Field>
          <button type="submit" style={{ ...S.btn("primary"), width:"100%", marginTop:16 }} disabled={!employeeValid || loading}>Submit Request</button>
        </form>

        {/* Download buttons for blank forms */}
        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <p style={{ color:C.primary, fontSize:13 }}>Need a paper form? Download a blank template:</p>
          <div style={{ display:'flex', gap:10, justifyContent:'center' }}>
            <button onClick={generateBlankPDF} style={S.btn("outline")}>Blank PDF</button>
            <button onClick={generateBlankWord} style={S.btn("outline")}>Blank Word</button>
          </div>
        </div>
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
        <h2 style={{ fontSize:24, fontWeight:700, color:C.primary, fontFamily:"'Playfair Display',serif" }}>Leave Requests</h2>
        <select value={filter} onChange={e => setFilter(e.target.value)} style={{ ...S.input, width:200 }}>
          <option value="All">All</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Declined">Declined</option>
        </select>
      </div>

      <div style={S.card}>
        {filtered.length === 0 ? (
          <div style={{ textAlign:"center", padding:40, color:C.primary }}>No leave requests found.</div>
        ) : (
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ background:C.primary, color:C.white }}>
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
                  <td style={{ padding:12, color:C.primary }}>{r.employeeName}</td>
                  <td style={{ padding:12, fontFamily:"monospace", color:C.primary }}>{r.employeePersonalNumber}</td>
                  <td style={{ padding:12, color:C.primary }}>{fmtDate(r.startDate)}</td>
                  <td style={{ padding:12, color:C.primary }}>{fmtDate(r.endDate)}</td>
                  <td style={{ padding:12, maxWidth:200, color:C.primary }}>{r.reason}</td>
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

// ── REPORTS PAGE (enhanced, with PDF/Word export and section customization) ──
const Reports = ({ employees }) => {
  const [filterDept, setFilterDept] = useState("All");
  const [filterGrade, setFilterGrade] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [showCustomize, setShowCustomize] = useState(false);
  const [sections, setSections] = useState({
    personal: true,
    employment: true,
    deployment: true,
    education: true,
    professional: true,
    workExperience: true,
    documents: true,
  });

  const filtered = employees.filter(emp => {
    const deptMatch = filterDept === "All" || emp.department === filterDept;
    const gradeMatch = filterGrade === "All" || emp.jobGrade === filterGrade;
    const statusMatch = filterStatus === "All" || emp.status === filterStatus;
    return deptMatch && gradeMatch && statusMatch;
  });

  const exportFullCSV = () => {
    const headers = [
      "Personal No", "First Name", "Middle Name", "Last Name", "Gender", "DOB",
      "National ID", "KRA PIN", "NSSF", "NHIF", "Phone", "Email", "Marital Status",
      "Nationality", "Employment Date", "Job Title", "Job Grade", "Employment Type",
      "Department", "Station", "County", "Region", "Work Station", "Years Experience",
      "Emergency Name", "Emergency Relationship", "Emergency Phone",
      "Status", "Submitted By", "Created At", "Last Updated"
    ];

    const rows = filtered.map(e => [
      e.personalNumber,
      e.firstName,
      e.middleName || '',
      e.lastName,
      e.gender || '',
      e.dob || '',
      e.nationalId || '',
      e.kraPin || '',
      e.nssfNo || '',
      e.nhifNo || '',
      e.phone || '',
      e.email || '',
      e.maritalStatus || '',
      e.nationality || '',
      e.employmentDate || '',
      e.jobTitle || '',
      e.jobGrade || '',
      e.employmentType || '',
      e.department || '',
      e.station || '',
      e.county || '',
      e.region || '',
      e.workStation || '',
      e.yearsOfExperience || '',
      e.emergencyName || '',
      e.emergencyRelationship || '',
      e.emergencyPhone || '',
      e.status,
      e.submittedBy || '',
      e.createdAt ? new Date(e.createdAt).toLocaleDateString() : '',
      e.updatedAt ? new Date(e.updatedAt).toLocaleDateString() : ''
    ]);

    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `employee_report_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const generatePDF = async () => {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();

    const loadImage = (url) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = reject;
        img.src = url;
      });
    };

    let imgData;
    try {
      imgData = await loadImage(`${process.env.PUBLIC_URL}/coat-of-arms.png`);
    } catch (error) {
      console.warn('Coat of arms image not found, using text fallback');
      imgData = null;
    }

    const addSection = (title, contentLines) => {
      if (!contentLines || contentLines.length === 0) return;
      if (y + (contentLines.length * 5) > 280) {
        doc.addPage();
        y = 20;
        if (imgData) {
          doc.addImage(imgData, 'PNG', 10, 10, 20, 20);
          doc.setFontSize(16);
          doc.text('MINISTRY OF INFORMATION, COMMUNICATIONS', 35, 20);
          doc.setFontSize(12);
          doc.text('AND THE DIGITAL ECONOMY (MICDE)', 35, 27);
          doc.setFontSize(10);
          doc.text('Directorate of Public Communication', 35, 33);
        } else {
          doc.setFontSize(16);
          doc.text('REPUBLIC OF KENYA', 14, 15);
          doc.setFontSize(12);
          doc.text('MINISTRY OF INFORMATION, COMMUNICATIONS AND THE DIGITAL ECONOMY (MICDE)', 14, 22);
          doc.setFontSize(10);
          doc.text('Directorate of Public Communication', 14, 28);
        }
        doc.setFontSize(10);
        doc.text('Report continued...', 14, 40);
        y = 45;
      }
      doc.setFont(undefined, 'bold');
      doc.text(title, 14, y);
      y += 5;
      doc.setFont(undefined, 'normal');
      contentLines.forEach(line => {
        doc.text(line, 16, y);
        y += 5;
      });
    };

    if (imgData) {
      doc.addImage(imgData, 'PNG', 10, 10, 20, 20);
      doc.setFontSize(16);
      doc.text('MINISTRY OF INFORMATION, COMMUNICATIONS', 35, 20);
      doc.setFontSize(12);
      doc.text('AND THE DIGITAL ECONOMY (MICDE)', 35, 27);
      doc.setFontSize(10);
      doc.text('Directorate of Public Communication', 35, 33);
    } else {
      doc.setFontSize(16);
      doc.text('REPUBLIC OF KENYA', 14, 15);
      doc.setFontSize(12);
      doc.text('MINISTRY OF INFORMATION, COMMUNICATIONS AND THE DIGITAL ECONOMY (MICDE)', 14, 22);
      doc.setFontSize(10);
      doc.text('Directorate of Public Communication', 14, 28);
    }
    doc.setFontSize(10);
    doc.text(`Report Generated: ${new Date().toLocaleDateString()}`, 14, 40);
    doc.setFontSize(14);
    doc.text('Comprehensive Employee Report', 14, 50);
    doc.setFontSize(10);
    doc.text(`Filters: Department ${filterDept}, Grade ${filterGrade}, Status ${filterStatus}`, 14, 57);
    doc.text(`Total Employees in Report: ${filtered.length}`, 14, 64);

    let y = 75;

    filtered.forEach((emp, index) => {
      if (y > 250) {
        doc.addPage();
        y = 20;
        if (imgData) {
          doc.addImage(imgData, 'PNG', 10, 10, 20, 20);
          doc.setFontSize(16);
          doc.text('MINISTRY OF INFORMATION, COMMUNICATIONS', 35, 20);
          doc.setFontSize(12);
          doc.text('AND THE DIGITAL ECONOMY (MICDE)', 35, 27);
          doc.setFontSize(10);
          doc.text('Directorate of Public Communication', 35, 33);
        } else {
          doc.setFontSize(16);
          doc.text('REPUBLIC OF KENYA', 14, 15);
          doc.setFontSize(12);
          doc.text('MINISTRY OF INFORMATION, COMMUNICATIONS AND THE DIGITAL ECONOMY (MICDE)', 14, 22);
          doc.setFontSize(10);
          doc.text('Directorate of Public Communication', 14, 28);
        }
        doc.setFontSize(10);
        doc.text('Report continued...', 14, 40);
        y = 45;
      }

      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text(`${emp.firstName} ${emp.lastName} (${emp.personalNumber})`, 14, y);
      y += 6;
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');

      if (sections.personal) {
        const lines = [
          `Gender: ${emp.gender || '—'} | DOB: ${emp.dob || '—'} | National ID: ${emp.nationalId || '—'}`,
          `KRA PIN: ${emp.kraPin || '—'} | NSSF: ${emp.nssfNo || '—'} | NHIF: ${emp.nhifNo || '—'}`,
          `Phone: ${emp.phone || '—'} | Email: ${emp.email || '—'} | Marital Status: ${emp.maritalStatus || '—'}`,
          `Nationality: ${emp.nationality || '—'}`,
        ];
        addSection('Personal Information', lines);
      }

      if (sections.employment) {
        const lines = [
          `Employment Date: ${emp.employmentDate || '—'} | Job Title: ${emp.jobTitle || '—'} | Grade: ${emp.jobGrade || '—'}`,
          `Employment Type: ${emp.employmentType || '—'} | Department: ${emp.department || '—'} | Station: ${emp.station || '—'}`,
          `Years of Experience: ${emp.yearsOfExperience || '—'}`,
          `Previous Employer: ${emp.previousEmployer || '—'} | Previous Role: ${emp.previousRole || '—'} | Duration: ${emp.previousDuration || '—'}`,
          `Emergency Contact: ${emp.emergencyName || '—'} (${emp.emergencyRelationship || '—'}) - ${emp.emergencyPhone || '—'}`,
        ];
        addSection('Employment Details', lines);
      }

      if (sections.deployment) {
        const lines = [
          `County: ${emp.county || '—'} | Region: ${emp.region || '—'} | Work Station: ${emp.workStation || '—'}`,
          `Physical Address: ${emp.physicalAddress || '—'}`,
        ];
        addSection('Place of Deployment', lines);
      }

      if (sections.education && emp.education && emp.education.length) {
        const lines = emp.education.map(edu =>
          `  • ${edu.level || '—'} at ${edu.institution || '—'}, ${edu.fieldOfStudy || '—'} (${edu.yearCompleted || '—'})`
        );
        addSection('Education', lines);
      }

      if (sections.professional && emp.professionalBodies && emp.professionalBodies.length) {
        const lines = emp.professionalBodies.map(pb =>
          `  • ${pb.bodyName || '—'} (${pb.membershipNo || '—'}) registered ${pb.registrationDate || '—'}`
        );
        addSection('Professional Bodies', lines);
      }

      if (sections.workExperience && emp.workExperiences && emp.workExperiences.length) {
        const lines = emp.workExperiences.map(we =>
          `  • ${we.role || '—'} at ${we.employer || '—'} (${we.duration || '—'}) ${we.startDate || '—'} to ${we.endDate || 'Present'}`
        );
        addSection('Work Experience', lines);
      }

      if (sections.documents && emp.documents && emp.documents.length) {
        const lines = emp.documents.map(doc =>
          `  • ${doc.file_name} (uploaded ${new Date(doc.uploaded_at).toLocaleDateString()})`
        );
        addSection('Documents', lines);
      }

      y += 5;
    });

    doc.save(`employee_report_${new Date().toISOString().slice(0,10)}.pdf`);
  };

  const generateWord = async () => {
    const loadImage = (url) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = reject;
        img.src = url;
      });
    };

    let imgData;
    try {
      imgData = await loadImage(`${process.env.PUBLIC_URL}/coat-of-arms.png`);
    } catch (error) {
      console.warn('Coat of arms image not found, using text fallback');
      imgData = null;
    }

    const headerHtml = imgData ? `
      <div style="display:flex; align-items:center; gap:10px; margin-bottom:20px;">
        <img src="${imgData}" width="60" height="60" />
        <div>
          <div style="font-size:12px; color:#0d1f3c;">Republic of Kenya</div>
          <div style="font-size:16px; font-weight:700; color:#0d1f3c;">MINISTRY OF INFORMATION, COMMUNICATIONS AND THE DIGITAL ECONOMY (MICDE)</div>
          <div style="font-size:13px; color:#0d1f3c; opacity:0.7;">State Department of Broadcasting & Telecommunication · Directorate of Public Communication</div>
        </div>
      </div>
    ` : `
      <div style="margin-bottom:20px;">
        <div style="font-size:12px; color:#0d1f3c;">Republic of Kenya</div>
        <div style="font-size:16px; font-weight:700; color:#0d1f3c;">MINISTRY OF INFORMATION, COMMUNICATIONS AND THE DIGITAL ECONOMY (MICDE)</div>
        <div style="font-size:13px; color:#0d1f3c; opacity:0.7;">State Department of Broadcasting & Telecommunication · Directorate of Public Communication</div>
      </div>
    `;

    const statsHtml = `
      <div style="display:grid; grid-template-columns:repeat(4,1fr); gap:10px; margin:20px 0;">
        <div style="background:#f9f9f9; padding:10px; border-radius:8px; border:1px solid #d1d9e6;">
          <div style="font-size:12px; color:#0d1f3c;">Total Employees</div>
          <div style="font-size:24px; font-weight:700; color:#0d1f3c;">${employees.length}</div>
        </div>
        <div style="background:#f9f9f9; padding:10px; border-radius:8px; border:1px solid #d1d9e6;">
          <div style="font-size:12px; color:#0d1f3c;">Active</div>
          <div style="font-size:24px; font-weight:700; color:#0d1f3c;">${employees.filter(e => e.status === "Active").length}</div>
        </div>
        <div style="background:#f9f9f9; padding:10px; border-radius:8px; border:1px solid #d1d9e6;">
          <div style="font-size:12px; color:#0d1f3c;">Pending Review</div>
          <div style="font-size:24px; font-weight:700; color:#0d1f3c;">${employees.filter(e => e.status === "Pending Review").length}</div>
        </div>
        <div style="background:#f9f9f9; padding:10px; border-radius:8px; border:1px solid #d1d9e6;">
          <div style="font-size:12px; color:#0d1f3c;">On Leave</div>
          <div style="font-size:24px; font-weight:700; color:#0d1f3c;">${employees.filter(e => e.status === "On Leave").length}</div>
        </div>
      </div>
    `;

    const employeesHtml = filtered.map(emp => {
      let sectionsHtml = '';

      if (sections.personal) {
        sectionsHtml += `
          <h4 style="color:#0d1f3c;">Personal Information</h4>
          <p style="color:#0d1f3c;"><strong>Gender:</strong> ${emp.gender || '—'} | <strong>DOB:</strong> ${emp.dob || '—'} | <strong>National ID:</strong> ${emp.nationalId || '—'}</p>
          <p style="color:#0d1f3c;"><strong>KRA PIN:</strong> ${emp.kraPin || '—'} | <strong>NSSF:</strong> ${emp.nssfNo || '—'} | <strong>NHIF:</strong> ${emp.nhifNo || '—'}</p>
          <p style="color:#0d1f3c;"><strong>Phone:</strong> ${emp.phone || '—'} | <strong>Email:</strong> ${emp.email || '—'} | <strong>Marital Status:</strong> ${emp.maritalStatus || '—'}</p>
          <p style="color:#0d1f3c;"><strong>Nationality:</strong> ${emp.nationality || '—'}</p>
        `;
      }

      if (sections.employment) {
        sectionsHtml += `
          <h4 style="color:#0d1f3c;">Employment Details</h4>
          <p style="color:#0d1f3c;"><strong>Employment Date:</strong> ${emp.employmentDate || '—'} | <strong>Job Title:</strong> ${emp.jobTitle || '—'} | <strong>Grade:</strong> ${emp.jobGrade || '—'}</p>
          <p style="color:#0d1f3c;"><strong>Employment Type:</strong> ${emp.employmentType || '—'} | <strong>Department:</strong> ${emp.department || '—'} | <strong>Station:</strong> ${emp.station || '—'}</p>
          <p style="color:#0d1f3c;"><strong>Years of Experience:</strong> ${emp.yearsOfExperience || '—'}</p>
          <p style="color:#0d1f3c;"><strong>Previous Employer:</strong> ${emp.previousEmployer || '—'} | <strong>Previous Role:</strong> ${emp.previousRole || '—'} | <strong>Duration:</strong> ${emp.previousDuration || '—'}</p>
          <p style="color:#0d1f3c;"><strong>Emergency Contact:</strong> ${emp.emergencyName || '—'} (${emp.emergencyRelationship || '—'}) - ${emp.emergencyPhone || '—'}</p>
        `;
      }

      if (sections.deployment) {
        sectionsHtml += `
          <h4 style="color:#0d1f3c;">Place of Deployment</h4>
          <p style="color:#0d1f3c;"><strong>County:</strong> ${emp.county || '—'} | <strong>Region:</strong> ${emp.region || '—'} | <strong>Work Station:</strong> ${emp.workStation || '—'}</p>
          <p style="color:#0d1f3c;"><strong>Physical Address:</strong> ${emp.physicalAddress || '—'}</p>
        `;
      }

      if (sections.education && emp.education && emp.education.length) {
        sectionsHtml += `<h4 style="color:#0d1f3c;">Education</h4>`;
        emp.education.forEach(edu => {
          sectionsHtml += `<p style="color:#0d1f3c;">• ${edu.level || '—'} at ${edu.institution || '—'}, ${edu.fieldOfStudy || '—'} (${edu.yearCompleted || '—'})</p>`;
        });
      }

      if (sections.professional && emp.professionalBodies && emp.professionalBodies.length) {
        sectionsHtml += `<h4 style="color:#0d1f3c;">Professional Bodies</h4>`;
        emp.professionalBodies.forEach(pb => {
          sectionsHtml += `<p style="color:#0d1f3c;">• ${pb.bodyName || '—'} (${pb.membershipNo || '—'}) registered ${pb.registrationDate || '—'}</p>`;
        });
      }

      if (sections.workExperience && emp.workExperiences && emp.workExperiences.length) {
        sectionsHtml += `<h4 style="color:#0d1f3c;">Work Experience</h4>`;
        emp.workExperiences.forEach(we => {
          sectionsHtml += `<p style="color:#0d1f3c;">• ${we.role || '—'} at ${we.employer || '—'} (${we.duration || '—'}) ${we.startDate || '—'} to ${we.endDate || 'Present'}</p>`;
        });
      }

      if (sections.documents && emp.documents && emp.documents.length) {
        sectionsHtml += `<h4 style="color:#0d1f3c;">Documents</h4>`;
        emp.documents.forEach(doc => {
          sectionsHtml += `<p style="color:#0d1f3c;">• ${doc.file_name} (uploaded ${new Date(doc.uploaded_at).toLocaleDateString()})</p>`;
        });
      }

      return `
        <div style="border:1px solid #d1d9e6; border-radius:8px; padding:16px; margin-bottom:20px; background:#fff;">
          <h3 style="margin:0 0 10px 0; color:#0d1f3c;">${emp.firstName} ${emp.lastName} (${emp.personalNumber})</h3>
          ${sectionsHtml}
          <p style="color:#0d1f3c;"><strong>Status:</strong> ${emp.status}</p>
        </div>
      `;
    }).join('');

    const fullHtml = `
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: 'Inter', sans-serif; padding: 20px; background: #eef1f6; }
            .container { max-width: 1000px; margin: 0 auto; }
            h4 { margin-bottom: 5px; color: #0d1f3c; }
          </style>
        </head>
        <body>
          <div class="container">
            ${headerHtml}
            <h2 style="color:#0d1f3c;">Comprehensive Employee Report</h2>
            <p style="color:#0d1f3c;"><strong>Filters:</strong> Department ${filterDept}, Grade ${filterGrade}, Status ${filterStatus}</p>
            ${statsHtml}
            <h3 style="color:#0d1f3c;">Employee Details (${filtered.length})</h3>
            ${employeesHtml}
          </div>
        </body>
      </html>
    `;

    const blob = new Blob([fullHtml], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `employee_report_${new Date().toISOString().slice(0,10)}.doc`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const total = employees.length;
  const active = employees.filter(e => e.status === "Active").length;
  const pending = employees.filter(e => e.status === "Pending Review").length;
  const onLeave = employees.filter(e => e.status === "On Leave").length;

  return (
    <div>
      <h2 style={{ fontSize:24, fontWeight:700, color:C.primary, fontFamily:"'Playfair Display',serif", marginBottom:20 }}>Reports</h2>
      
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:24 }}>
        <div style={{ background:C.white, borderRadius:8, padding:16, boxShadow:"0 2px 8px rgba(13,31,60,0.08)" }}>
          <div style={{ fontSize:12, color:C.primary }}>Total Employees</div>
          <div style={{ fontSize:28, fontWeight:700, color:C.primary }}>{total}</div>
        </div>
        <div style={{ background:C.white, borderRadius:8, padding:16, boxShadow:"0 2px 8px rgba(13,31,60,0.08)" }}>
          <div style={{ fontSize:12, color:C.primary }}>Active</div>
          <div style={{ fontSize:28, fontWeight:700, color:C.primary }}>{active}</div>
        </div>
        <div style={{ background:C.white, borderRadius:8, padding:16, boxShadow:"0 2px 8px rgba(13,31,60,0.08)" }}>
          <div style={{ fontSize:12, color:C.primary }}>Pending Review</div>
          <div style={{ fontSize:28, fontWeight:700, color:C.primary }}>{pending}</div>
        </div>
        <div style={{ background:C.white, borderRadius:8, padding:16, boxShadow:"0 2px 8px rgba(13,31,60,0.08)" }}>
          <div style={{ fontSize:12, color:C.primary }}>On Leave</div>
          <div style={{ fontSize:28, fontWeight:700, color:C.primary }}>{onLeave}</div>
        </div>
      </div>

      <div style={{ ...S.card, marginBottom:20 }}>
        <div style={{ display:"flex", gap:16, flexWrap:"wrap", alignItems:"flex-end" }}>
          <div style={{ minWidth:180 }}>
            <label style={S.label}>Department</label>
            <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)} style={S.input}>
              <option value="All">All Departments</option>
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div style={{ minWidth:150 }}>
            <label style={S.label}>Job Grade</label>
            <select value={filterGrade} onChange={(e) => setFilterGrade(e.target.value)} style={S.input}>
              <option value="All">All Grades</option>
              {JOB_GRADES.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div style={{ minWidth:150 }}>
            <label style={S.label}>Status</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={S.input}>
              <option value="All">All Statuses</option>
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div style={{ display:"flex", gap:8, marginLeft:"auto" }}>
            <button onClick={() => setShowCustomize(true)} style={S.btn("outline")}>Customize</button>
          </div>
        </div>
        <div style={{ display:"flex", gap:8, marginTop:16 }}>
          <button onClick={exportFullCSV} style={S.btn("outline")}>CSV</button>
          <button onClick={generatePDF} style={S.btn("outline")}>PDF</button>
          <button onClick={generateWord} style={S.btn("outline")}>Word</button>
        </div>
      </div>

      {showCustomize && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 2000
        }}>
          <div style={{ background: C.white, borderRadius: 12, padding: 24, maxWidth: 400, width: '90%' }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color:C.primary, marginBottom: 16 }}>Customize Report Sections</h3>
            <p style={{ fontSize: 13, color:C.primary, opacity:0.7, marginBottom: 16 }}>
              Select which sections to include in PDF and Word exports. CSV always includes all data.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ color:C.primary }}><input type="checkbox" checked={sections.personal} onChange={e => setSections({...sections, personal: e.target.checked})} /> Personal Information</label>
              <label style={{ color:C.primary }}><input type="checkbox" checked={sections.employment} onChange={e => setSections({...sections, employment: e.target.checked})} /> Employment Details</label>
              <label style={{ color:C.primary }}><input type="checkbox" checked={sections.deployment} onChange={e => setSections({...sections, deployment: e.target.checked})} /> Place of Deployment</label>
              <label style={{ color:C.primary }}><input type="checkbox" checked={sections.education} onChange={e => setSections({...sections, education: e.target.checked})} /> Education</label>
              <label style={{ color:C.primary }}><input type="checkbox" checked={sections.professional} onChange={e => setSections({...sections, professional: e.target.checked})} /> Professional Bodies</label>
              <label style={{ color:C.primary }}><input type="checkbox" checked={sections.workExperience} onChange={e => setSections({...sections, workExperience: e.target.checked})} /> Work Experience</label>
              <label style={{ color:C.primary }}><input type="checkbox" checked={sections.documents} onChange={e => setSections({...sections, documents: e.target.checked})} /> Documents</label>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
              <button onClick={() => setShowCustomize(false)} style={S.btn("ghost")}>Cancel</button>
              <button onClick={() => setShowCustomize(false)} style={S.btn("primary")}>Apply</button>
            </div>
          </div>
        </div>
      )}

      <div style={S.card}>
        <h3 style={{ fontSize:18, fontWeight:600, color:C.primary, marginBottom:16 }}>Filtered Employees (Summary)</h3>
        {filtered.length === 0 ? (
          <p style={{ color:C.primary, opacity:0.7, textAlign:"center", padding:20 }}>No employees match the selected filters.</p>
        ) : (
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead>
                <tr style={{ background:C.primary, color:C.white }}>
                  <th style={{ padding:10, textAlign:"left" }}>Personal No.</th>
                  <th style={{ padding:10, textAlign:"left" }}>Name</th>
                  <th style={{ padding:10, textAlign:"left" }}>Department</th>
                  <th style={{ padding:10, textAlign:"left" }}>Job Grade</th>
                  <th style={{ padding:10, textAlign:"left" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 100).map(e => (
                  <tr key={e.id} style={{ borderBottom:`1px solid ${C.border}` }}>
                    <td style={{ padding:10, color:C.primary, fontFamily:"monospace" }}>{e.personalNumber}</td>
                    <td style={{ padding:10, color:C.primary }}>{e.firstName} {e.lastName}</td>
                    <td style={{ padding:10, color:C.primary }}>{e.department || '—'}</td>
                    <td style={{ padding:10, color:C.primary }}>{e.jobGrade || '—'}</td>
                    <td style={{ padding:10 }}><span style={S.badge(e.status)}>{e.status}</span></td>
                  </tr>
                ))}
                {filtered.length > 100 && (
                  <tr><td colSpan={5} style={{ padding:10, textAlign:"center", color:C.primary, opacity:0.7 }}>Showing first 100 records. Download CSV for full list.</td></tr>
                )}
              </tbody>
            </table>
          </div>
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
      const { data: adminData, error: adminError } = await supabase
        .from('admins')
        .select('*')
        .eq('email', user.email)
        .single();
      if (adminError) throw adminError;
      setAdmin(adminData);

      const { data: employeesData, error: empError } = await supabase
        .from('employees')
        .select(`
          *,
          education(*),
          professional_bodies(*),
          work_experiences(*),
          employee_documents(*)
        `)
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
        documents: e.employee_documents || [],
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

      const { data: allAdmins } = await supabase.from('admins').select('*').order('created_at', { ascending: false });
      setAdmins(allAdmins || []);

      const { data: logs } = await supabase.from('activity_logs').select('*').order('timestamp', { ascending: false }).limit(150);
      setActivity(logs || []);

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
      if (!emp.id) {
        const { data: existing } = await supabase
          .from('employees')
          .select('id')
          .eq('personal_number', emp.personalNumber)
          .maybeSingle();
        if (existing) {
          showToast("Personal number already exists. Please use a unique number.", "error");
          return;
        }
      } else {
        const { data: existing } = await supabase
          .from('employees')
          .select('id')
          .eq('personal_number', emp.personalNumber)
          .neq('id', emp.id)
          .maybeSingle();
        if (existing) {
          showToast("Personal number already exists. Please use a unique number.", "error");
          return;
        }
      }

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
      const { data } = await supabase
        .from('employees')
        .select('*')
        .eq('personal_number', emp.personalNumber)
        .single();
      return data;
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
      const request = leaveRequests.find(r => r.id === id);
      if (!request) return;

      const { error } = await supabase
        .from('leave_requests')
        .update({ status: 'Approved', reviewed_at: new Date().toISOString(), reviewed_by: admin?.id })
        .eq('id', id);
      if (error) throw error;

      const { error: empError } = await supabase
        .from('employees')
        .update({ status: 'On Leave' })
        .eq('personal_number', request.employeePersonalNumber);
      if (empError) throw empError;

      showToast("Leave request approved. Employee is now On Leave.");
      fetchUserData(session.user);
      logActivity('Leave Approved', `Leave request ${id} approved, employee ${request.employeeName} marked as On Leave`);
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
    <AdminLayout 
      admin={admin} 
      view={view} 
      navigate={navigate} 
      onLogout={logout} 
      toast={toast} 
      employees={employees} 
      activity={activity}
    >
      {view === "dashboard" && <Dashboard employees={employees} navigate={navigate} admin={admin} leaveRequests={leaveRequests} />}
      {view === "employees" && <EmployeeList employees={employees} navigate={navigate} onDelete={deleteEmployee} onApprove={approveEmployee} onRefresh={() => fetchUserData(session?.user)} />}
      {view === "add-employee" && <EmployeeForm onSave={saveEmployee} navigate={navigate} employees={employees} />}
      {view === "edit-employee" && selected && <EmployeeForm employee={selected} onSave={saveEmployee} navigate={navigate} employees={employees} />}
      {view === "view-employee" && selected && <EmployeeProfile employee={selected} navigate={navigate} onDelete={deleteEmployee} />}
      {view === "admins" && <AdminManagement admins={admins} onSave={saveAdmin} onRemove={removeAdmin} currentAdmin={admin} />}
      {view === "leave-requests" && <LeaveRequestsAdmin requests={leaveRequests} onApprove={approveLeave} onDecline={declineLeave} />}
      {view === "reports" && <Reports employees={employees} />}
      {view === "profile" && <Profile admin={admin} />}
    </AdminLayout>
  );
}