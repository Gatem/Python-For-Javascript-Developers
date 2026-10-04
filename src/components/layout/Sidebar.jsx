import SideNav from "./SideNav";

export default function Sidebar(props) {
  return (
    <div className="sticky top-16 hidden md:block h-[calc(100dvh-4rem)] w-[290px] shrink-0 self-start overflow-y-auto scroll-thin border-r border-fg/8">
      <SideNav {...props} />
    </div>
  );
}
