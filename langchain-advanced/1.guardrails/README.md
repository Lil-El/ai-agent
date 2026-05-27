# Guardrails

防护栏（Guardrails）通过在智能体执行的关键节点验证和过滤内容，帮助您构建安全合规的AI应用。它能检测敏感信息、执行内容政策、验证输出结果，并在潜在问题发生前阻止不安全行为。

典型应用场景包括：

- 防止个人身份信息泄露

- 检测并阻断提示词注入攻击

- 拦截不当或有害内容

- 执行商业规则与合规要求

- 确保输出内容的质量与准确性

**通过中间件实现防护措施，在关键节点拦截执行——在代理启动前、完成后，或围绕模型和工具调用时。**

## 内置

- PII detection
- Human-in-the-loop
- [Custom](https://docs.langchain.com/oss/javascript/langchain/guardrails#built-in-guardrails)