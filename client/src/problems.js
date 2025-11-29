const problems = [
    {
    id: "two-sum",
    title: "Two Sum (Playground)",
    description: "Given an array of integers, return indices of the two numbers such that they add up to a specific target.",
    signature: "int[] twoSum(int[] nums, int target)",
    starterCode: `// Example starter (Java)
  public int[] twoSum(int[] nums, int target) {
    // try writing code below and watch the visualizer
    // default input (you can override by loading a test input)
    int[] numsLocal = new int[]{2,7,11,15};
    int targetLocal = 9;
    // naive: check pairs
    for (int i = 0; i < numsLocal.length; i++) {
      for (int j = i+1; j < numsLocal.length; j++) {
        if (numsLocal[i] + numsLocal[j] == targetLocal) {
          return new int[]{i,j};
        }
      }
    }
    return new int[]{-1,-1};
  }
  `,
    tests: [
      { id: 't1', input: { numsLocal: [2,7,11,15], targetLocal: 9 }, expected: [0,1] },
      { id: 't2', input: { numsLocal: [3,2,4], targetLocal: 6 }, expected: [1,2] },
    ],
    },
  {
    id: "stack-play",
    title: "Basic Stack Ops",
    description: "Experiment with pushing and popping values on a Stack.",
    signature: "",
    starterCode: `import java.util.Stack;

Stack<Integer> st = new Stack<>();
st.push(1);
st.push(2);
st.pop();
st.push(5);
`,
  },
  {
    id: "queue-play",
    title: "Basic Queue Ops",
    description: "Experiment with queue operations.",
    signature: "",
    starterCode: `import java.util.Queue;
import java.util.LinkedList;

Queue<Integer> q = new LinkedList<>();
q.add(3);
q.offer(4);
q.poll();
`,
  },
];

export default problems;
