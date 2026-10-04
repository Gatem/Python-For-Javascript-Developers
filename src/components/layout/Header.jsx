import ActivityMeter from "../activity/ActivityMeter";

export default function Header({ activity, isMobile }) {
  return (
    <header
      className={`bg-linear-to-r from-emerald-500/12 to-blue-500/12 border-b border-white/[0.06] flex items-center justify-between gap-3 ${isMobile ? "py-3 pl-16 pr-3" : "py-5 px-6"}`}
    >
      {!isMobile && <div className="flex-1" />}
      <div className={isMobile ? "min-w-0" : "text-center"}>
        <h1
          className={`font-bold m-0 bg-linear-to-r from-brand-green to-brand-blue bg-clip-text text-transparent ${isMobile ? "text-[19px]" : "text-[28px]"}`}
        >
          <span aria-hidden="true">{"\u{1F40D}"} </span>Python for JS Developers
        </h1>
        {!isMobile && (
          <p className="text-[14px] text-txt-muted mt-1 m-0">
            Everything you need to know, coming from JavaScript
          </p>
        )}
      </div>
      <div className={`flex justify-end ${isMobile ? "" : "flex-1"}`}>
        <ActivityMeter activity={activity} />
      </div>
    </header>
  );
}
