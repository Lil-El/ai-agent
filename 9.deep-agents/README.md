# DeepAgents

LangChain 是给你一堆 AI 开发积木，LangGraph 是搭建复杂工作流的底层蓝图，那 DeepAgents 就是提前搭好主体结构的半成品房子。

底层依赖 LangGraph 的状态管理（state）、循环路由、持久化执行能力（checkpointer），上层直接内置了任务规划、长期记忆、子 Agent 调度、上下文压缩等核心能力。

它最大的优势，就是大幅降低复杂 Agent 的开发门槛。