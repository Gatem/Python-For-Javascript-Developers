import Button from "../ui/Button";

export default function LessonNav({ onPrev, onNext, isFirst, isLast }) {
  return (
    <nav aria-label="Lesson navigation" className="flex justify-between mt-7 pt-4 border-t border-white/5">
      <Button variant="secondary" disabled={isFirst} onClick={onPrev}>
        {"←"} Previous
      </Button>
      {!isLast && (
        <Button variant="primary" onClick={onNext}>
          Next {"→"}
        </Button>
      )}
    </nav>
  );
}
