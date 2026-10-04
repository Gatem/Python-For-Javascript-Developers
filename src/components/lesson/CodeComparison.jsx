import { Columns2 } from "lucide-react";
import Code from "../ui/Code";
import SectionTitle from "./SectionTitle";

export default function CodeComparison({ jsCode, pyCode }) {
  return (
    <section aria-labelledby="compare-heading">
      <SectionTitle id="compare-heading" icon={Columns2}>
        Side by side
      </SectionTitle>
      <div className="grid gap-4 xl:grid-cols-2">
        <Code code={jsCode} lang="js" />
        <Code code={pyCode} lang="py" />
      </div>
    </section>
  );
}
