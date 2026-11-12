import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BarChart3,
  Crosshair,
  Flame,
  ChevronDown,
  ChevronRight,
  Orbit,
  Info,
  Layers,
  Waves,
  Cloud as CloudIcon,
  Leaf,
  Lock,
  Moon,
  SlidersHorizontal,
  Sparkles,
  X,
  Zap,
} from "lucide-react";
import { FONT, getColors } from "../lib/design";

const CATEGORIES = [
  { id: "All", label: "All", icon: Layers },
  { id: "Calm", label: "Calm", icon: Leaf },
  { id: "Sleep", label: "Sleep", icon: Moon },
  { id: "Focus", label: "Focus", icon: Crosshair },
  { id: "Energy", label: "Energy", icon: Zap },
  { id: "Advanced", label: "Advanced", icon: Flame },
];

function SheetRow({ icon: Icon, label, onClick, active, locked, muted, accent, theme, trailing }) {
  const colors = getColors(theme);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "true" : undefined}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        width: "100%",
        minHeight: 48,
        padding: "10px 14px",
        borderRadius: 14,
        border: "none",
        background: active ? colors.accentSoft : "transparent",
        cursor: "pointer",
        textAlign: "left",
        fontFamily: FONT,
        fontSize: "16px",
        fontWeight: active ? 700 : 600,
        color: muted ? colors.tertiary : accent ? colors.accent : colors.text,
      }}
    >
      <Icon size={19} strokeWidth={2.1} color={active || accent ? colors.accent : colors.tertiary} />
      <span style={{ flex: 1 }}>{label}</span>
      {locked && <Lock size={15} color={colors.tertiary} />}
      {trailing}
    </button>
  );
}

export default function NavigationSheet({
  theme,
  selectedCategory,
  onCategoryChange,
  isPro,
  lockedCategories = [],
  onLockedCategoryTap,
  onOpenPersonalize,
  onOpenMoments,
  onOpenPausePlus,
  onOpenAbout,
  isOwner = false,
  onClose,
}) {
  const colors = getColors(theme);
  const navigate = useNavigate();
  const [breathingExpanded,setBreathingExpanded]=useState(false);
  const [sensoryExpanded,setSensoryExpanded]=useState(false);
  const [natureExpanded,setNatureExpanded]=useState(false);
  const [abstractExpanded,setAbstractExpanded]=useState(false);

  const handleCategory = (id) => {
    const locked = !isPro && lockedCategories.includes(id);
    onClose();
    if (locked) {
      if (onLockedCategoryTap) onLockedCategoryTap(id);
      return;
    }
    onCategoryChange(id);
  };

  return (
    <motion.div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 55,
        background: colors.scrim,
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onClose}
    >
      <motion.nav
        role="dialog"
        aria-label="Menu"
        onClick={(event) => event.stopPropagation()}
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          width: "min(88vw, 372px)",
          display: "flex",
          flexDirection: "column",
          boxSizing: "border-box",
          paddingTop: "calc(env(safe-area-inset-top, 44px) + 10px)",
          paddingBottom: "calc(env(safe-area-inset-bottom, 20px) + 12px)",
          background: colors.sheet,
          boxShadow: "-14px 0 44px rgba(0, 0, 0, 0.20)",
          fontFamily: FONT,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 10px 6px 20px",
          }}
        >
          <span
            style={{
              fontSize: "18px",
              fontWeight: 800,
              letterSpacing: "0.01em",
              color: colors.text,
            }}
          >
            always pause.
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            style={{
              width: 44,
              height: 44,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: colors.secondary,
            }}
          >
            <X size={22} strokeWidth={2.2} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "0 10px" }}>
          <button type="button" onClick={() => setBreathingExpanded(v => !v)} aria-expanded={breathingExpanded} aria-controls="breathing-menu" style={{display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",margin:"10px 0 4px",padding:"9px 14px",border:0,background:"transparent",color:colors.tertiary,fontFamily:FONT,fontSize:12.5,fontWeight:700,letterSpacing:".08em",textTransform:"uppercase",cursor:"pointer"}}>
            <span>Breathing</span>{breathingExpanded?<ChevronDown size={17}/>:<ChevronRight size={17}/>}
          </button>
          {breathingExpanded && <div id="breathing-menu">{CATEGORIES.map(category => <SheetRow key={category.id} theme={theme} icon={category.icon} label={category.label} active={selectedCategory===category.id} locked={!isPro&&lockedCategories.includes(category.id)} onClick={() => handleCategory(category.id)}/>)}</div>}
          <div style={{height:1,margin:"12px 14px",background:colors.border}}/>
          <button type="button" onClick={() => setSensoryExpanded(v => !v)} aria-expanded={sensoryExpanded} aria-controls="sensory-menu" style={{display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",margin:"0 0 4px",padding:"9px 14px",border:0,background:"transparent",color:colors.tertiary,fontFamily:FONT,fontSize:12.5,fontWeight:700,letterSpacing:".08em",textTransform:"uppercase",cursor:"pointer"}}>
            <span>Sensory</span>{sensoryExpanded?<ChevronDown size={17}/>:<ChevronRight size={17}/>}
          </button>
          {sensoryExpanded && <div id="sensory-menu">
            {[
              {id:"nature",label:"Nature",expanded:natureExpanded,toggle:()=>setNatureExpanded(v=>!v),items:[
                {label:"Cloud",icon:CloudIcon,path:"/sensory/cloud"},
                {label:"Underwater",icon:Waves,path:"/sensory/underwater"}
              ]},
              {id:"abstract",label:"Abstract",expanded:abstractExpanded,toggle:()=>setAbstractExpanded(v=>!v),items:[
                {label:"Liquid Chrome",icon:Waves,path:"/sensory/liquid-chrome"},
                {label:"Popcorn",icon:Orbit,path:"/sensory/popcorn"},
                {label:"Liquid Surface",icon:Waves,path:"/sensory/liquid-surface"},
                {label:"Prismatic Water",icon:Waves,path:"/sensory/prismatic-water"}
              ]}
            ].map(group=><div key={group.id}>
              <button type="button" onClick={group.toggle} aria-expanded={group.expanded} aria-controls={`sensory-${group.id}-menu`} style={{display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",padding:"12px 18px 12px 28px",border:0,background:"transparent",color:colors.secondary,fontFamily:FONT,fontSize:15,fontWeight:650,cursor:"pointer",textAlign:"left"}}>
                <span>{group.label}</span>{group.expanded?<ChevronDown size={17}/>:<ChevronRight size={17}/>}
              </button>
              {group.expanded && <div id={`sensory-${group.id}-menu`} style={{paddingLeft:20}}>{group.items.map(item=><SheetRow key={item.path} theme={theme} icon={item.icon} label={item.label} onClick={()=>{onClose();navigate(item.path);}}/>)}</div>}
            </div>)}
            {isOwner && <SheetRow theme={theme} icon={SlidersHorizontal} label="Sensory Studio · private" muted onClick={() => {onClose();navigate("/sensory-studio");}}/>}
          </div>}
          <div style={{ height: 1, margin: "12px 14px", background: colors.border }} />

          <SheetRow
            theme={theme}
            icon={SlidersHorizontal}
            label="Personalize Pause"
            onClick={() => {
              onClose();
              onOpenPersonalize();
            }}
          />

          <SheetRow
            theme={theme}
            icon={BarChart3}
            label="Your Moments"
            onClick={() => {
              onClose();
              onOpenMoments();
            }}
          />

        </div>

        {/* Pinned footer */}
        <div style={{ padding: "0 10px" }}>
          <SheetRow
            theme={theme}
            icon={Sparkles}
            label={isPro ? "Always Pause+ · manage" : "Unlock Always Pause+"}
            accent={!isPro}
            onClick={() => {
              onClose();
              onOpenPausePlus();
            }}
          />

          <div style={{ height: 1, margin: "4px 14px 8px", background: colors.border }} />
          <SheetRow
            theme={theme}
            icon={Info}
            label="About & Legal"
            onClick={() => {
              onClose();
              onOpenAbout();
            }}
          />
        </div>
      </motion.nav>
    </motion.div>
  );
}