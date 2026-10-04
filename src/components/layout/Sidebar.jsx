import SideNav from "./SideNav";

export default function Sidebar(props) {
  return (
    <div className="w-[260px] shrink-0 bg-[rgba(15,23,42,0.6)] border-r border-white/5 overflow-y-auto py-3 sticky top-0 h-screen self-start custom-scrollbar">
      <SideNav {...props} />
    </div>
  );
}
