import "dotenv/config";
import { Annotation, START, END, StateGraph } from "@langchain/graph";

const StateAnnotation = Annotation.Root({
  text: Annotation({
    reducer: (p, n) => n,
    default: () => "",
  }),
});

const stepOK = (state) => ({ text: `${state.text} => OK` });

const stepError = (state) => {
  throw new Error("Error");
};

const graph = new StateGraph(StateAnnotation)
  .addNode("step_ok", stepOK)
  .addNode("step_error", stepError)
  .addEdge(START, "step_ok")
  .addEdge("step_ok", "step_error")
  .addEdge("step_error", END)
  .compile();

try {
  await graph.invoke({ text: "hello" });
  console.log("here");
} catch (error) {
  console.log("error:", error);
}
