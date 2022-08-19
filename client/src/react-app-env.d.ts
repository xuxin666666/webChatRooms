/// <reference types="react-scripts" />

type InferArray<T> = T extends (infer S)[] ? S : never

type ReturnType<F> = F extends (...props: any[]) => infer R ? R : never

// function assertIsNode(e: any): asserts e is Node { }
// function assertIsInputElement(e: any): asserts e is HTMLInputElement { }