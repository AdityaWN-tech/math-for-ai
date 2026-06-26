#!/usr/bin/env node
/**
 * Generate interactive-specs-batch5.mjs — enriched exercises for phases 10, 14, 19.
 * Run: node scripts/generate-batch5-enriched.mjs
 */
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "interactive-specs-batch5.mjs");

/** @typedef {[string, number, number, string, string, string, string, string, string, string]} Row */
/** id, phaseId, ln, title, concept, filename, starter, testBody, artName, artDesc */

/** @type {Row[]} */
const LESSONS = [
  // Phase 10 — LLMs from Scratch (remaining)
  ["07-rlhf", 10, 7, "RLHF", "RLHF trains a policy against a reward model with a KL penalty to stay near the base model.", "rlhf.py", "def kl_penalty(pi, ref, beta):\n    return beta * sum((p-r)**2 for p,r in zip(pi, ref))\n", ' __check("kl", kl_penalty([0.6,0.4],[0.5,0.5],0.1)>0)', "KL penalty", "RLHF trust-region via KL."],
  ["08-dpo", 10, 8, "DPO", "Direct Preference Optimization avoids explicit reward modeling — optimize preferences directly.", "dpo.py", "def preference_margin(chosen, rejected):\n    return chosen - rejected\n", ' __check("m", preference_margin(2.0,1.0)==1.0)', "DPO margin", "Chosen logprob beats rejected."],
  ["09-constitutional-ai-self-improvement", 10, 9, "Constitutional AI", "Model critiques and revises its own outputs against a constitution of principles.", "cai.py", "def revision_rounds(max_r):\n    return max_r\n", ' __check("r", revision_rounds(3)==3)', "CAI rounds", "Self-critique iteration budget."],
  ["11-quantization", 10, 11, "Quantization", "INT8/INT4 weights cut memory and speed inference with minimal quality loss.", "quant.py", "def quantize_int8(x, scale=127):\n    return int(round(x*scale))\n", ' __check("q", quantize_int8(0.5)==64)', "INT8 quant", "Scale float to int8 bin."],
  ["12-inference-optimization", 10, 12, "Inference Optimization", "Batching, KV cache, and kernels maximize tokens/sec per dollar.", "infer.py", "def tokens_per_sec(tokens, seconds):\n    return tokens/max(seconds,1e-9)\n", ' __check("t", tokens_per_sec(1000,2)==500)', "Throughput", "Serving throughput metric."],
  ["13-building-complete-llm-pipeline", 10, 13, "Complete LLM Pipeline", "Data → train → eval → quantize → serve — production LLM lifecycle.", "pipe10.py", "def pipeline_stages(stages):\n    return len(stages)\n", ' __check("s", pipeline_stages([\"a\",\"b\",\"c\"])==3)', "Pipeline", "End-to-end LLM stages."],
  ["14-open-models-architecture-walkthroughs", 10, 14, "Open Model Architectures", "Llama, Mistral, Qwen — GQA, RoPE, SwiGLU building blocks.", "openmdl.py", "def gqa_kv_heads(q_heads, ratio):\n    return q_heads//ratio\n", ' __check("g", gqa_kv_heads(32,4)==8)', "GQA heads", "Grouped-query attention head count."],
  ["15-speculative-decoding-eagle3", 10, 15, "EAGLE-3 Speculative Decoding", "Draft tokens with a small model; verify in parallel with the target.", "eagle.py", "def accept_rate(acc, prop):\n    return acc/max(prop,1)\n", ' __check("a", accept_rate(4,5)==0.8)', "Accept rate", "Speculative decoding efficiency."],
  ["16-differential-attention-v2", 10, 16, "Differential Attention", "Subtract attention maps to reduce noise and improve long-context focus.", "diffattn.py", "def diff_attn(a1, a2):\n    return [x-y for x,y in zip(a1,a2)]\n", ' __check("d", diff_attn([1,0.5],[0.5,0.5])[0]==0.5)', "Diff attn", "Attention map subtraction."],
  ["17-native-sparse-attention", 10, 17, "Native Sparse Attention", "Only attend to top-k keys — subquadratic memory for long context.", "nsa.py", "def topk_indices(scores, k):\n    return sorted(range(len(scores)), key=lambda i:-scores[i])[:k]\n", ' __check("k", len(topk_indices([0.1,0.9,0.3],2))==2)', "Top-k attn", "Sparse attention indices."],
  ["18-multi-token-prediction", 10, 18, "Multi-Token Prediction", "Predict multiple future tokens per forward pass for faster training.", "mtp.py", "def mtp_heads(n_tokens):\n    return n_tokens\n", ' __check("h", mtp_heads(4)==4)', "MTP heads", "Parallel token prediction count."],
  ["19-dualpipe-parallelism", 10, 19, "DualPipe Parallelism", "Pipeline parallel schedules overlap forward/backward across GPUs.", "dualpipe.py", "def bubble_fraction(stages, microbatches):\n    return (stages-1)/max(microbatches,1)\n", ' __check("b", bubble_fraction(4,8)<1)', "PP bubble", "Pipeline bubble estimate."],
  ["20-deepseek-v3-walkthrough", 10, 20, "DeepSeek-V3 Walkthrough", "MoE + MLA + efficient training at frontier scale.", "dsv3.py", "def moe_active_experts(k, n):\n    return k\n", ' __check("e", moe_active_experts(2,8)==2)', "MoE top-k", "Experts activated per token."],
  ["21-jamba-hybrid-ssm-transformer", 10, 21, "Jamba Hybrid SSM", "Mix Mamba SSM layers with attention for long context efficiency.", "jamba.py", "def hybrid_ratio(ssm_layers, attn_layers):\n    return ssm_layers/(ssm_layers+attn_layers)\n", ' __check("r", hybrid_ratio(2,2)==0.5)', "Hybrid ratio", "SSM vs attention layer mix."],
  ["22-async-hogwild-inference", 10, 22, "Async Hogwild Inference", "Lock-free parallel inference workers update shared state.", "hogwild.py", "def worker_count(gpus, per_gpu):\n    return gpus*per_gpu\n", ' __check("w", worker_count(4,2)==8)', "Workers", "Parallel inference worker count."],
  ["25-speculative-decoding", 10, 25, "Speculative Decoding", "Draft-verify loops accelerate autoregressive generation.", "spec10.py", "def speedup(baseline, spec):\n    return baseline/spec\n", ' __check("s", speedup(100,50)==2.0)', "Speedup", "Speculative decoding gain."],
  ["34-gradient-checkpointing", 10, 34, "Gradient Checkpointing", "Recompute activations in backward pass to trade compute for memory.", "gchk.py", "def mem_savings_ratio(checkpoints, layers):\n    return 1 - checkpoints/layers\n", ' __check("m", mem_savings_ratio(4,16)>0)', "Checkpoint mem", "Memory saved by checkpointing."],

  // Phase 14 — Agent Engineering (06–42)
  ["06-tool-use-and-function-calling", 14, 6, "Tool Use", "Agents invoke tools via JSON schemas — validate args before execution.", "tool14.py", "def parse_tool_name(call):\n    return call.get(\"name\",\"\")\n", ' __check("n", parse_tool_name({\"name\":\"search\"})==\"search\")', "Tool name", "Extract tool from call payload."],
  ["07-memory-virtual-context-memgpt", 14, 7, "MemGPT Virtual Context", "Tiered memory: core context + archival store with paging.", "memgpt.py", "def page_out(tokens, limit):\n    return max(0, tokens-limit)\n", ' __check("p", page_out(12000,8000)==4000)', "Page out", "Tokens moved to archival memory."],
  ["08-memory-blocks-sleep-time-compute", 14, 8, "Sleep-Time Compute", "Background reflection consolidates memories while user is idle.", "sleep.py", "def idle_minutes(threshold):\n    return threshold\n", ' __check("i", idle_minutes(5)==5)', "Idle threshold", "When sleep-time compute runs."],
  ["09-hybrid-memory-mem0", 14, 9, "Mem0 Hybrid Memory", "Vector + graph memory for persistent agent recall.", "mem0.py", "def memory_hit(score, thresh):\n    return score>=thresh\n", ' __check("h", memory_hit(0.85,0.8))', "Memory hit", "Retrieval threshold for recall."],
  ["10-skill-libraries-voyager", 14, 10, "Skill Libraries", "Voyager stores reusable code skills discovered during exploration.", "voyager.py", "def skill_count(skills):\n    return len(skills)\n", ' __check("s", skill_count([\"move\",\"craft\"])==2)', "Skill count", "Growing skill library size."],
  ["11-planning-htn-and-evolutionary", 14, 11, "HTN Planning", "Hierarchical task networks decompose goals into subtasks.", "htn.py", "def decompose_depth(subtasks):\n    return len(subtasks)\n", ' __check("d", decompose_depth([\"a\",\"b\"])==2)', "HTN depth", "Subtask decomposition width."],
  ["12-anthropic-workflow-patterns", 14, 12, "Anthropic Workflows", "Prompt chaining, routing, parallelization, orchestrator-workers.", "workflow.py", "def chain_steps(steps):\n    return len(steps)\n", ' __check("c", chain_steps([1,2,3])==3)', "Chain length", "Prompt chain step count."],
  ["13-langgraph-stateful-graphs", 14, 13, "LangGraph Stateful Graphs", "Nodes, edges, and checkpoints for durable agent workflows.", "lg14.py", "def next_state(edges, state):\n    return edges.get(state)\n", ' __check("n", next_state({\"a\":\"b\"},\"a\")==\"b\")', "Graph edge", "State machine transition."],
  ["14-autogen-actor-model", 14, 14, "AutoGen Actor Model", "Conversable agents exchange messages in group chats.", "autogen.py", "def message_round(agents):\n    return len(agents)\n", ' __check("r", message_round([\"a\",\"b\"])==2)', "Round robin", "Agents per conversation round."],
  ["15-crewai-role-based-crews", 14, 15, "CrewAI Crews", "Role-based agents with goals, backstory, and delegated tasks.", "crew.py", "def crew_size(roles):\n    return len(roles)\n", ' __check("c", crew_size([\"r\",\"w\"])==2)', "Crew size", "Role count in crew."],
  ["16-openai-agents-sdk", 14, 16, "OpenAI Agents SDK", "Handoffs, guardrails, and tracing for production agents.", "oaiag.py", "def handoff_count(h):\n    return len(h)\n", ' __check("h", handoff_count([\"triage\"])==1)', "Handoffs", "Agent handoff chain length."],
  ["17-claude-agent-sdk", 14, 17, "Claude Agent SDK", "Computer use, bash, and structured tool loops for Claude agents.", "claudeag.py", "def tool_budget(max_calls):\n    return max_calls\n", ' __check("b", tool_budget(20)==20)', "Tool budget", "Max tool calls per run."],
  ["18-agno-and-mastra-runtimes", 14, 18, "Agno & Mastra", "Lightweight agent runtimes with workflows and observability.", "agno.py", "def workflow_nodes(n):\n    return n\n", ' __check("w", workflow_nodes(5)==5)', "Workflow nodes", "Agent workflow graph size."],
  ["19-benchmarks-swebench-gaia", 14, 19, "SWE-bench & GAIA", "Coding and general assistant benchmarks for agent eval.", "bench.py", "def pass_rate(passed, total):\n    return passed/total\n", ' __check("p", pass_rate(3,10)==0.3)', "Pass rate", "Benchmark success rate."],
  ["20-benchmarks-webarena-osworld", 14, 20, "WebArena & OSWorld", "Browser and desktop environment benchmarks for computer-use agents.", "webarena.py", "def task_success(done, total):\n    return done==total\n", ' __check("s", task_success(5,5))', "Task success", "All subtasks completed."],
  ["21-computer-use-agents", 14, 21, "Computer Use Agents", "Screenshot + accessibility tree → click, type, scroll actions.", "compuse.py", "def action_valid(t):\n    return t in (\"click\",\"type\",\"scroll\")\n", ' __check("a", action_valid(\"click\"))', "UI action", "Valid computer-use action types."],
  ["22-voice-agents-pipecat-livekit", 14, 22, "Voice Agents", "Pipecat/LiveKit pipelines: VAD → STT → LLM → TTS streaming.", "voice14.py", "def pipeline_latency_ms(parts):\n    return sum(parts)\n", ' __check("l", pipeline_latency_ms([50,200,100])==350)', "Voice latency", "End-to-end voice agent delay."],
  ["23-otel-genai-conventions", 14, 23, "OpenTelemetry GenAI", "Standard spans for LLM calls, tool use, and agent steps.", "otel.py", "def span_attrs(model, tokens):\n    return {\"model\":model,\"tokens\":tokens}\n", ' __check("s", span_attrs(\"gpt\",100)[\"tokens\"]==100)', "OTel span", "GenAI span attributes."],
  ["24-agent-observability-platforms", 14, 24, "Agent Observability", "LangSmith, Phoenix, Braintrust — trace every agent step.", "obs.py", "def trace_steps(steps):\n    return len(steps)\n", ' __check("t", trace_steps([1,2])==2)', "Trace steps", "Steps in an agent trace."],
  ["25-multi-agent-debate", 14, 25, "Multi-Agent Debate", "Multiple agents argue; aggregator picks best answer.", "debate.py", "def majority_vote(votes):\n    return max(set(votes), key=votes.count)\n", ' __check("m", majority_vote([\"a\",\"a\",\"b\"])==\"a\")', "Majority vote", "Debate aggregation."],
  ["26-failure-modes-agentic", 14, 26, "Agent Failure Modes", "Loops, tool hallucination, context drift — design guardrails.", "fail.py", "def loop_detect(history, max_rep):\n    return history.count(history[-1])>max_rep if history else False\n", ' __check("l", loop_detect([\"a\",\"a\",\"a\"],2))', "Loop detect", "Detect repeated agent actions."],
  ["27-prompt-injection-defense", 14, 27, "Prompt Injection Defense", "Separate trusted system from untrusted user/tool content.", "inj.py", "def untrusted_boundary(text):\n    return \"<untrusted>\" in text\n", ' __check("u", untrusted_boundary(\"<untrusted>x\"))', "Boundary tag", "Mark untrusted content regions."],
  ["28-orchestration-patterns", 14, 28, "Orchestration Patterns", "Supervisor, hierarchical, and event-driven multi-agent topologies.", "orch.py", "def fan_out(workers, task):\n    return [(w, task) for w in workers]\n", ' __check("f", len(fan_out([\"a\",\"b\"],\"t\"))==2)', "Fan-out", "Distribute task to workers."],
  ["29-production-runtimes", 14, 29, "Production Runtimes", "Queues, rate limits, idempotency for agent APIs at scale.", "runtime.py", "def rate_ok(count, limit):\n    return count<limit\n", ' __check("r", rate_ok(5,10))', "Rate limit", "Request throttle check."],
  ["30-eval-driven-agent-development", 14, 30, "Eval-Driven Agents", "Write evals first; iterate agent until benchmark improves.", "evdag.py", "def eval_delta(before, after):\n    return after-before\n", ' __check("d", eval_delta(0.5,0.7)>0)', "Eval delta", "Improvement from iteration."],
  ["31-agent-workbench-why-models-fail", 14, 31, "Why Models Fail", "Context limits, tool errors, and ambiguous specs cause agent failures.", "wb31.py", "def failure_class(err):\n    return \"tool\" if \"tool\" in err else \"other\"\n", ' __check("f", failure_class(\"tool timeout\")==\"tool\")', "Failure class", "Categorize agent failure."],
  ["32-minimal-agent-workbench", 14, 32, "Minimal Agent Workbench", "Smallest loop: read state → LLM → tool → update state.", "wb32.py", "def agent_loop_steps():\n    return [\"observe\",\"act\",\"update\"]\n", ' __check("l", len(agent_loop_steps())==3)', "Agent loop", "Minimal agent cycle."],
  ["33-instructions-as-executable-constraints", 14, 33, "Executable Constraints", "Treat instructions as verifiable contracts on agent behavior.", "wb33.py", "def constraint_ok(output, forbidden):\n    return not any(f in output for f in forbidden)\n", ' __check("c", constraint_ok(\"ok\",[\"secret\"]))', "Constraint", "Output satisfies forbidden list."],
  ["34-repo-memory-and-state", 14, 34, "Repo Memory & State", "Persist file tree snapshots and edit history across turns.", "wb34.py", "def files_changed(before, after):\n    return len(set(after)-set(before))\n", ' __check("f", files_changed([\"a\"],[\"a\",\"b\"])==1)', "Files changed", "Diff file sets between turns."],
  ["35-initialization-scripts", 14, 35, "Initialization Scripts", "Bootstrap agent environment: deps, env vars, test runner.", "wb35.py", "def init_commands(cmds):\n    return len(cmds)\n", ' __check("i", init_commands([\"pip\",\"test\"])==2)', "Init cmds", "Setup command count."],
  ["36-scope-contracts", 14, 36, "Scope Contracts", "Define allowed files, commands, and network for safe agents.", "wb36.py", "def in_scope(path, allowed):\n    return any(path.startswith(a) for a in allowed)\n", ' __check("s", in_scope(\"src/x\",[\"src/\"]))', "Scope check", "Path allowed by contract."],
  ["37-runtime-feedback-loops", 14, 37, "Runtime Feedback", "Test output and linter results feed back into the next agent turn.", "wb37.py", "def tests_passed(results):\n    return all(results)\n", ' __check("t", tests_passed([True,True]))', "Tests pass", "All tests green."],
  ["38-verification-gates", 14, 38, "Verification Gates", "Block merges until tests, lint, and review checks pass.", "wb38.py", "def gate_open(checks):\n    return all(checks.values())\n", ' __check("g", gate_open({\"t\":True,\"l\":True}))', "Gate open", "All verification checks pass."],
  ["39-reviewer-agent", 14, 39, "Reviewer Agent", "Separate critic agent reviews diffs before human approval.", "wb39.py", "def review_approved(issues):\n    return len(issues)==0\n", ' __check("a", review_approved([]))', "Review OK", "No blocking review issues."],
  ["40-multi-session-handoff", 14, 40, "Multi-Session Handoff", "Serialize agent state for continuation across sessions.", "wb40.py", "def handoff_payload(state):\n    return {\"state\": state, \"v\": 1}\n", ' __check("h", handoff_payload({})[\"v\"]==1)', "Handoff", "Versioned session payload."],
  ["41-workbench-for-real-repos", 14, 41, "Real Repo Workbench", "Run agents on real codebases with git, CI, and monorepos.", "wb41.py", "def repo_size(files):\n    return len(files)\n", ' __check("r", repo_size([\"a\",\"b\"])==2)', "Repo size", "Tracked file count."],
  ["42-agent-workbench-capstone", 14, 42, "Agent Workbench Capstone", "End-to-end: spec → agent → tests → PR with observability.", "wb42.py", "def capstone_done(tests, pr):\n    return tests and pr\n", ' __check("c", capstone_done(True,True))', "Capstone", "Tests pass and PR opened."],

  // Phase 19 — Capstone building blocks & key projects
  ["09-code-migration-agent", 19, 9, "Code Migration Agent", "Automated framework upgrades across large repos.", "cap9.py", "def files_migrated(n):\n    return n>=1\n", ' __check("m", files_migrated(3))', "Migration", "Files successfully migrated."],
  ["10-multi-agent-software-team", 19, 10, "Multi-Agent Software Team", "PM, dev, reviewer agents collaborate on a feature.", "cap10.py", "def team_roles(roles):\n    return len(roles)>=3\n", ' __check("t", team_roles([\"pm\",\"dev\",\"qa\"]))', "Team roles", "Minimum agent team size."],
  ["11-llm-observability-dashboard", 19, 11, "LLM Observability Dashboard", "Traces, costs, latency — production LLM monitoring UI.", "cap11.py", "def p99_latency(samples):\n    s=sorted(samples); return s[int(0.99*len(s))-1]\n", ' __check("p", p99_latency([1,2,100])==100)', "P99 latency", "Tail latency metric."],
  ["12-video-understanding-pipeline", 19, 12, "Video Understanding Pipeline", "Sample frames → VLM → temporal reasoning over video.", "cap12.py", "def frame_sample(fps, sec, stride):\n    return int(fps*sec)//stride\n", ' __check("f", frame_sample(30,2,2)==30)', "Frame sample", "Frames extracted from video."],
  ["13-mcp-server-with-registry", 19, 13, "MCP Server Registry", "Discover and route tool calls across MCP servers.", "cap13.py", "def registry_lookup(reg, name):\n    return reg.get(name)\n", ' __check("l", registry_lookup({\"calc\":1},\"calc\")==1)', "Registry", "Tool server lookup."],
  ["14-speculative-decoding-server", 19, 14, "Speculative Decoding Server", "Deploy draft+target models for low-latency inference.", "cap14.py", "def draft_tokens(k):\n    return k\n", ' __check("d", draft_tokens(4)==4)', "Draft batch", "Tokens proposed per step."],
  ["15-constitutional-safety-harness", 19, 15, "Constitutional Safety Harness", "Policy checks on inputs and outputs in production.", "cap15.py", "def policy_violation(text, banned):\n    return any(b in text.lower() for b in banned)\n", ' __check("v", policy_violation(\"hack\",[\"hack\"]))', "Policy", "Detect banned content."],
  ["16-github-issue-to-pr-agent", 19, 16, "Issue-to-PR Agent", "Read GitHub issue → branch → fix → tests → pull request.", "cap16.py", "def pr_ready(tests, diff_lines):\n    return tests and diff_lines>0\n", ' __check("p", pr_ready(True,10))', "PR ready", "Tests pass with non-empty diff."],
  ["17-personal-ai-tutor", 19, 17, "Personal AI Tutor", "Adaptive tutoring with mastery tracking and Socratic hints.", "cap17.py", "def mastery_level(correct, total):\n    return correct/total\n", ' __check("m", mastery_level(8,10)==0.8)', "Mastery", "Learner mastery score."],
  ["20-agent-harness-loop-contract", 19, 20, "Agent Harness Contract", "Standard observe-think-act interface for portable agents.", "cap20.py", "def harness_steps():\n    return [\"observe\",\"think\",\"act\"]\n", ' __check("h", len(harness_steps())==3)', "Harness", "Agent harness phases."],
  ["21-tool-registry-schema-validation", 19, 21, "Tool Registry Validation", "JSON Schema validates tool args before dispatch.", "cap21.py", "def required_present(args, req):\n    return all(k in args for k in req)\n", ' __check("v", required_present({\"q\":\"x\"},[\"q\"]))', "Schema valid", "Required args present."],
  ["22-jsonrpc-stdio-transport", 19, 22, "JSON-RPC stdio Transport", "MCP-style newline-delimited JSON-RPC over stdin/stdout.", "cap22.py", "def jsonrpc_id_valid(i):\n    return i is not None\n", ' __check("j", jsonrpc_id_valid(1))', "JSON-RPC id", "Request id present."],
  ["23-function-call-dispatcher", 19, 23, "Function Call Dispatcher", "Route tool calls to handlers; enforce timeouts.", "cap23.py", "def dispatch_timeout_ms():\n    return 30000\n", ' __check("t", dispatch_timeout_ms()==30000)', "Timeout", "Default tool timeout."],
  ["24-plan-execute-control-flow", 19, 24, "Plan-Execute Control Flow", "Planner emits steps; executor runs with replanning on failure.", "cap24.py", "def replan_on_fail(failed):\n    return failed\n", ' __check("r", replan_on_fail(True))', "Replan", "Trigger replan after failure."],
  ["25-verification-gates-observation-budget", 19, 25, "Verification Gates", "Cap observations and tool calls per task for safety.", "cap25.py", "def budget_ok(used, max_obs):\n    return used<=max_obs\n", ' __check("b", budget_ok(5,10))', "Obs budget", "Within observation budget."],
  ["26-sandbox-runner-denylist", 19, 26, "Sandbox Denylist", "Block dangerous shell commands in agent sandboxes.", "cap26.py", "def is_denied(cmd, deny):\n    return any(d in cmd for d in deny)\n", ' __check("d", is_denied(\"rm -rf\",[\"rm\"]))', "Denylist", "Blocked dangerous command."],
  ["27-eval-harness-fixture-tasks", 19, 27, "Eval Harness Fixtures", "Fixture tasks with golden outputs for regression eval.", "cap27.py", "def fixture_pass(out, expected):\n    return out==expected\n", ' __check("f", fixture_pass(1,1))', "Fixture", "Output matches golden."],
  ["28-observability-otel-traces", 19, 28, "OTel Traces Capstone", "Instrument agent with spans for every LLM and tool call.", "cap28.py", "def span_count(trace):\n    return len(trace)\n", ' __check("s", span_count([1,2,3])==3)', "Span count", "Spans in agent trace."],
  ["29-end-to-end-coding-task-demo", 19, 29, "E2E Coding Task Demo", "Full demo: issue → agent edits → CI green.", "cap29.py", "def e2e_success(ci, tests):\n    return ci and tests\n", ' __check("e", e2e_success(True,True))', "E2E demo", "CI and tests pass."],
  ["30-bpe-tokenizer-from-scratch", 19, 30, "BPE Tokenizer Capstone", "Train byte-pair encoding merges on a corpus.", "cap30.py", "def merge_count(vocab, merges):\n    return vocab+merges\n", ' __check("m", merge_count(256,1000)==1256)', "BPE vocab", "Vocab size after merges."],
  ["33-multihead-self-attention", 19, 33, "Multi-Head Attention Capstone", "Implement scaled dot-product attention with multiple heads.", "cap33.py", "def head_dim(d_model, n_heads):\n    return d_model//n_heads\n", ' __check("h", head_dim(512,8)==64)', "Head dim", "Dimension per attention head."],
  ["34-transformer-block", 19, 34, "Transformer Block", "Attention + FFN + residual + layer norm in one block.", "cap34.py", "def block_submodules():\n    return [\"attn\",\"ffn\",\"norm\"]\n", ' __check("b", len(block_submodules())==3)', "Block parts", "Transformer block components."],
  ["69-end-to-end-rag-system", 19, 69, "End-to-End RAG System", "Ingest → chunk → embed → retrieve → rerank → generate.", "cap69.py", "def rag_stages():\n    return 6\n", ' __check("r", rag_stages()==6)', "RAG stages", "Production RAG pipeline steps."],
  ["87-end-to-end-safety-gate", 19, 87, "End-to-End Safety Gate", "Input filter → model → output filter → audit log.", "cap87.py", "def safety_pipeline_stages():\n    return 4\n", ' __check("s", safety_pipeline_stages()==4)', "Safety gate", "Safety pipeline stage count."],
];

function esc(s) {
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

async function main() {
  const entries = LESSONS.map(
    ([id, phaseId, ln, title, concept, filename, starter, testBody, artName, artDesc]) =>
      `  S("${id}", ${phaseId}, ${ln}, "${esc(title)}", "${esc(concept)}", "${filename}", ${JSON.stringify(starter)}, '${testBody}', "${esc(artName)}", "${esc(artDesc)}")`,
  );

  const body = `/** Batch 5 — enriched exercises for LLMs from scratch, agents, and capstones */
const C = \`def __check(n,ok,m=""):\\n __results.append({"name":n,"pass":bool(ok),"msg":m})\\n\`;

function S(id, phaseId, ln, title, concept, filename, starter, testBody, artName, artDesc) {
  return {
    id, phaseId, lessonNumber: ln, title, concept,
    build: {
      filename, starter,
      tests: \`\${C}try:\\n\${testBody}\\nexcept Exception as e:\\n __check("runtime",False,str(e))\`,
    },
    artifact: { name: artName, description: artDesc },
  };
}

export default [
${entries.join(",\n")},
];
`;

  await fs.writeFile(OUT, body);
  console.log(`Wrote ${OUT} with ${LESSONS.length} enriched specs`);
}

main();
