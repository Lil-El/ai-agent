---
name: calculator
description: 数学计算技能
---

# 计算技能

将问题转换为数学公式，并计算结果。

## 步骤

1. 将问题转换为数学公式
2. 将问题拆解为加法、减法、乘法，调用不同的子Agent进行计算。需要将每个子Agent的计算存储到/workspace/[task_id].md
3. 汇总结果并返回，整理为文档，保存到/workspace/calculator_results.md
