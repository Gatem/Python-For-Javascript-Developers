export default function LessonHeader({ mod, lesson }) {
  const index = mod.lessons.indexOf(lesson);
  return (
    <div className="mb-5">
      <p className="text-[13px] text-txt-dim mb-1 mt-0">
        <span aria-hidden="true">{mod.icon} </span>
        {mod.title} {"—"} Lesson {index + 1} of {mod.lessons.length}
      </p>
      <h2 id="lesson-title" className="text-[24px] font-bold m-0 text-slate-100">
        {lesson.title}
      </h2>
    </div>
  );
}
