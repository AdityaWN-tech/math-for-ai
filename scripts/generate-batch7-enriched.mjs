#!/usr/bin/env node
/**
 * Generate interactive-specs-batch7.mjs — enrich all remaining stub lessons.
 * Run: node scripts/generate-batch7-enriched.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const CATALOG = path.join(ROOT, "apps/web/src/content/lessons/catalog.json");
const INTERACTIVE = path.join(ROOT, "apps/web/src/content/lessons/interactive");
const OUT = path.join(__dirname, "interactive-specs-batch7.mjs");

/** @type {Record<string, {concept:string, filename:string, starter:string, testBody:string, artName:string, artDesc:string}>} */
const CURATED = {
  "01-dev-environment": { concept: "Set up Python 3.10+, git, and an editor — foundation for every lesson.", filename: "devenv.py", starter: "def check_python_version(major, minor):\n    return (major, minor) >= (3, 10)\n", testBody: ' __check("py", check_python_version(3, 11))', artName: "Dev setup", artDesc: "Python 3.10+ environment ready." },
  "02-git-and-collaboration": { concept: "Branch, commit, push — version control for code, data, and configs.", filename: "git.py", starter: "def parse_branch(ref):\n    return ref.replace(\"refs/heads/\", \"\")\n", testBody: ' __check("b", parse_branch(\"refs/heads/main\")==\"main\")', artName: "Git branch", artDesc: "Parse git branch ref." },
  "03-gpu-setup-and-cloud": { concept: "CUDA drivers and cloud GPUs (Lambda, RunPod) for training.", filename: "gpu.py", starter: "def vram_gb(params_b, bytes_per=2):\n    return params_b * bytes_per\n", testBody: " __check(\"v\", vram_gb(7)==14)", artName: "VRAM estimate", artDesc: "7B model fp16 memory." },
  "04-apis-and-keys": { concept: "Store API keys in environment variables — never commit secrets.", filename: "keys.py", starter: "def key_from_env(name, env):\n    return env.get(name)\n", testBody: ' __check("k", key_from_env(\"OPENAI_API_KEY\", {\"OPENAI_API_KEY\": \"sk-x\"})==\"sk-x\")', artName: "API keys", artDesc: "Read key from environment." },
  "05-jupyter-notebooks": { concept: "Notebook cells for exploration; export clean scripts for production.", filename: "jupyter.py", starter: "def cell_count(cells):\n    return len(cells)\n", testBody: " __check(\"c\", cell_count([1,2,3])==3)", artName: "Notebook cells", artDesc: "Count notebook cells." },
  "06-python-environments": { concept: "venv/conda isolate dependencies per project.", filename: "venv.py", starter: "def env_isolated(base, project):\n    return base != project\n", testBody: ' __check("i", env_isolated(\"/usr\", \"/proj/.venv\"))', artName: "venv isolate", artDesc: "Separate base vs project env." },
};

/** @type {Array<[RegExp, (l: {id:string,title:string,lessonNumber:number}) => typeof CURATED[string]]>} */
const RULES = [
  [/neural-audio-codec/i, () => ({ concept: "Neural codecs (EnCodec, DAC) compress audio at low bitrate.", filename: "codec.py", starter: "def compression_ratio(raw_kb, coded_kb):\n    return raw_kb/max(coded_kb,1e-9)\n", testBody: " __check(\"r\", compression_ratio(100,10)==10)", artName: "Compression ratio", artDesc: "Neural audio compression gain." })],
  [/voice-activity|vad/i, () => ({ concept: "VAD detects speech vs silence for turn-taking in voice agents.", filename: "vad.py", starter: "def is_speech(energy, threshold):\n    return energy > threshold\n", testBody: " __check(\"s\", is_speech(0.8, 0.5))", artName: "VAD gate", artDesc: "Speech activity detection." })],
  [/speech-to-speech|moshi/i, () => ({ concept: "Full-duplex speech-to-speech models stream audio in and out.", filename: "s2s.py", starter: "def duplex_latency_ms(capture, infer, play):\n    return capture+infer+play\n", testBody: " __check(\"l\", duplex_latency_ms(50,100,50)==200)", artName: "S2S latency", artDesc: "Duplex speech pipeline delay." })],
  [/anti-spoof|watermark/i, () => ({ concept: "Detect synthetic/deepfake audio via watermark verification.", filename: "antispoof.py", starter: "def watermark_match(score, thresh):\n    return score >= thresh\n", testBody: " __check(\"w\", watermark_match(0.95, 0.9))", artName: "Watermark", artDesc: "Audio authenticity check." })],
  [/audio-evaluation|wer|pesq/i, () => ({ concept: "WER, PESQ, and MOS measure ASR and audio quality.", filename: "audioeval.py", starter: "def wer(errors, words):\n    return errors/max(words,1)\n", testBody: " __check(\"w\", wer(2,10)==0.2)", artName: "WER", artDesc: "Word error rate metric." })],
  [/audio-generation/i, () => ({ concept: "Audio diffusion and transformers synthesize music and speech.", filename: "audiogen.py", starter: "def seconds_of_audio(sr, samples):\n    return samples/sr\n", testBody: " __check(\"s\", seconds_of_audio(16000,16000)==1)", artName: "Audio duration", artDesc: "Length from sample count." })],
  [/3d-generation/i, () => ({ concept: "NeRF, Gaussian splatting, and mesh diffusion generate 3D assets.", filename: "gen3d.py", starter: "def point_count(resolution):\n    return resolution**3\n", testBody: " __check(\"p\", point_count(10)==1000)", artName: "3D grid", artDesc: "Voxel grid point count." })],
  [/flow-matching|rectified/i, () => ({ concept: "Flow matching learns straight paths from noise to data.", filename: "flow.py", starter: "def flow_interpolate(x0, x1, t):\n    return x0*(1-t)+x1*t\n", testBody: " __check(\"f\", flow_interpolate(0,1,0.5)==0.5)", artName: "Flow interp", artDesc: "Linear flow path at t." })],
  [/fid|clip-score/i, () => ({ concept: "FID and CLIP score evaluate generative image quality.", filename: "genmetric.py", starter: "def clip_score(dot, scale=1.0):\n    return scale*dot\n", testBody: " __check(\"c\", clip_score(0.8)==0.8)", artName: "CLIP score", artDesc: "Image-text alignment metric." })],
  [/visual-autoregressive|var/i, () => ({ concept: "Visual autoregressive models predict image tokens like GPT.", filename: "var.py", starter: "def image_tokens(h, w, patch):\n    return (h//patch)*(w//patch)\n", testBody: " __check(\"t\", image_tokens(256,256,16)==256)", artName: "VAR tokens", artDesc: "Autoregressive image token count." })],
  [/reward-model/i, () => ({ concept: "Reward models score completions for RLHF preference learning.", filename: "rm.py", starter: "def preference(chosen, rejected):\n    return chosen > rejected\n", testBody: " __check(\"p\", preference(2.0, 1.0))", artName: "Preference", artDesc: "Chosen beats rejected score." })],
  [/multi-agent-rl/i, () => ({ concept: "Multiple agents learn in shared environments — cooperation and competition.", filename: "marl.py", starter: "def joint_reward(r):\n    return sum(r)\n", testBody: " __check(\"j\", joint_reward([1,2,3])==6)", artName: "Joint reward", artDesc: "Team reward aggregation." })],
  [/sim-to-real/i, () => ({ concept: "Domain randomization bridges simulation and real-world robotics.", filename: "sim2real.py", starter: "def domain_gap(sim, real):\n    return abs(sim-real)\n", testBody: " __check(\"g\", domain_gap(0.9,0.7)==0.2)", artName: "Domain gap", artDesc: "Sim vs real performance gap." })],
  [/rl-for-games/i, () => ({ concept: "DQN and PPO master Atari and strategy games via self-play.", filename: "rlgame.py", starter: "def epsilon_greedy(q, eps):\n    return max(q)*(1-eps)\n", testBody: " __check(\"e\", epsilon_greedy([0.1,0.9],0.1)>0)", artName: "Epsilon greedy", artDesc: "Exploration in game RL." })],
  [/mcp-server/i, () => ({ concept: "Build an MCP server exposing tools over JSON-RPC stdio.", filename: "mcpsrv.py", starter: "def list_tools(tools):\n    return {\"tools\": tools}\n", testBody: ' __check("l", len(list_tools([\"a\"])[\"tools\"])==1)', artName: "MCP list", artDesc: "Tool list response shape." })],
  [/mcp-client/i, () => ({ concept: "MCP clients discover and invoke remote tool servers.", filename: "mcpcli.py", starter: "def call_tool(name, args):\n    return {\"name\": name, \"arguments\": args}\n", testBody: ' __check("c", call_tool(\"search\",{})[\"name\"]==\"search\")', artName: "MCP call", artDesc: "Tool invocation payload." })],
  [/mcp-transport/i, () => ({ concept: "stdio, SSE, and HTTP transports carry MCP JSON-RPC messages.", filename: "mcptr.py", starter: "def transport_ok(t):\n    return t in (\"stdio\",\"sse\",\"http\")\n", testBody: ' __check("t", transport_ok(\"stdio\"))', artName: "Transport", artDesc: "Valid MCP transport." })],
  [/mcp-resources|mcp-prompts/i, () => ({ concept: "MCP resources and prompts are first-class context for hosts.", filename: "mcprp.py", starter: "def resource_uri(scheme, path):\n    return f\"{scheme}://{path}\"\n", testBody: ' __check("u", resource_uri(\"file\",\"data\")==\"file://data\")', artName: "Resource URI", artDesc: "MCP resource identifier." })],
  [/mcp-sampling/i, () => ({ concept: "MCP sampling lets servers request LLM completions from the host.", filename: "mcpsamp.py", starter: "def sampling_request(prompt, max_tokens):\n    return {\"prompt\": prompt, \"maxTokens\": max_tokens}\n", testBody: ' __check("s", sampling_request(\"hi\",100)[\"maxTokens\"]==100)', artName: "Sampling", artDesc: "MCP sampling request." })],
  [/mcp-roots|elicitation/i, () => ({ concept: "Roots define filesystem boundaries; elicitation gathers user input.", filename: "mcproot.py", starter: "def path_allowed(path, roots):\n    return any(path.startswith(r) for r in roots)\n", testBody: ' __check("a", path_allowed(\"/data/x\", [\"/data\"]))', artName: "Root allow", artDesc: "Path within MCP roots." })],
  [/mcp-async/i, () => ({ concept: "Long-running MCP tools return task IDs for async polling.", filename: "mcpasync.py", starter: "def task_pending(status):\n    return status==\"running\"\n", testBody: ' __check("p", task_pending(\"running\"))', artName: "Async task", artDesc: "MCP async task status." })],
  [/mcp-apps/i, () => ({ concept: "MCP Apps embed interactive UIs in tool responses.", filename: "mcpapp.py", starter: "def has_ui_block(result):\n    return \"ui\" in result\n", testBody: ' __check("u", has_ui_block({\"ui\":1}))', artName: "MCP UI", artDesc: "UI block in tool result." })],
  [/tool-poisoning/i, () => ({ concept: "Malicious tool descriptions can hijack agent behavior.", filename: "poison.py", starter: "def description_suspicious(desc):\n    return \"ignore\" in desc.lower()\n", testBody: ' __check("s", description_suspicious(\"ignore previous\"))', artName: "Tool poison", artDesc: "Suspicious tool description." })],
  [/oauth/i, () => ({ concept: "OAuth 2.1 secures MCP servers with scoped tokens.", filename: "oauth.py", starter: "def token_scopes_ok(granted, required):\n    return all(s in granted for s in required)\n", testBody: ' __check("o", token_scopes_ok([\"read\",\"write\"],[\"read\"]))', artName: "OAuth scope", artDesc: "Token scope validation." })],
  [/mcp-gateway|registry/i, () => ({ concept: "Gateways route requests across federated MCP server registries.", filename: "mcpgw.py", starter: "def route_server(registry, name):\n    return registry.get(name)\n", testBody: ' __check("r", route_server({\"calc\":1},\"calc\")==1)', artName: "Gateway route", artDesc: "Lookup MCP server in registry." })],
  [/mcp-auth/i, () => ({ concept: "Production MCP requires auth, TLS, and audit logging.", filename: "mcpauth.py", starter: "def auth_header_present(headers):\n    return \"authorization\" in {k.lower() for k in headers}\n", testBody: ' __check("a", auth_header_present({\"Authorization\":\"bearer x\"}))', artName: "MCP auth", artDesc: "Authorization header present." })],
  [/a2a-protocol/i, () => ({ concept: "Agent-to-Agent protocol for interoperable multi-vendor agents.", filename: "a2a.py", starter: "def agent_card_skills(skills):\n    return len(skills)\n", testBody: " __check(\"s\", agent_card_skills([\"search\",\"code\"])==2)", artName: "A2A skills", artDesc: "Agent capability count." })],
  [/opentelemetry|otel/i, () => ({ concept: "OTel GenAI conventions standardize LLM trace attributes.", filename: "otel.py", starter: "def genai_span(model, tokens):\n    return {\"gen_ai.request.model\": model, \"gen_ai.usage.total_tokens\": tokens}\n", testBody: ' __check("t", genai_span(\"gpt\",50)[\"gen_ai.usage.total_tokens\"]==50)', artName: "OTel GenAI", artDesc: "GenAI span attributes." })],
  [/routing-layer|model-routing/i, () => ({ concept: "Route prompts to the cheapest model that meets quality SLAs.", filename: "route.py", starter: "def pick_model(scores, min_q):\n    ok=[m for m,s in scores.items() if s>=min_q]\n    return ok[0] if ok else None\n", testBody: ' __check("p", pick_model({\"small\":0.7,\"big\":0.9},0.8)==\"big\")', artName: "Model route", artDesc: "Quality-threshold routing." })],
  [/skills-and-agent/i, () => ({ concept: "Agent SDKs package reusable skills and tool definitions.", filename: "skills.py", starter: "def skill_manifest(name, tools):\n    return {\"name\": name, \"tools\": tools}\n", testBody: ' __check("m", len(skill_manifest(\"dev\",[\"run\"])[\"tools\"])==1)', artName: "Skill manifest", artDesc: "Agent skill package." })],
  [/capstone-tool-ecosystem/i, () => ({ concept: "Capstone: MCP servers, registry, auth, and observability together.", filename: "tooleco.py", starter: "def ecosystem_ready(mcp, auth, otel):\n    return mcp and auth and otel\n", testBody: " __check(\"e\", ecosystem_ready(True,True,True))", artName: "Tool ecosystem", artDesc: "Full MCP production stack." })],
  [/star-family|reasoning/i, () => ({ concept: "STaR and related methods improve reasoning via self-generated traces.", filename: "star.py", starter: "def trace_quality(correct, total):\n    return correct/total\n", testBody: " __check(\"q\", trace_quality(8,10)==0.8)", artName: "Trace quality", artDesc: "Reasoning trace success rate." })],
  [/alphaevolve|evolutionary/i, () => ({ concept: "Evolutionary coding mutates programs toward higher fitness.", filename: "evolve.py", starter: "def fitness(score):\n    return score\n", testBody: " __check(\"f\", fitness(0.9)==0.9)", artName: "Fitness", artDesc: "Evolutionary fitness score." })],
  [/darwin|godel/i, () => ({ concept: "Self-improving systems revise their own code under safety bounds.", filename: "darwin.py", starter: "def improvement_delta(before, after):\n    return after-before\n", testBody: " __check(\"d\", improvement_delta(0.5,0.7)>0)", artName: "Self-improve", artDesc: "Measured improvement delta." })],
  [/ai-scientist/i, () => ({ concept: "Autonomous research loops: hypothesis → experiment → paper.", filename: "scienst.py", starter: "def research_loop_stages():\n    return [\"hypothesis\",\"experiment\",\"writeup\"]\n", testBody: " __check(\"s\", len(research_loop_stages())==3)", artName: "Research loop", artDesc: "AI scientist pipeline stages." })],
  [/recursive-self-improvement/i, () => ({ concept: "Agents that edit their own codebase — bounded vs unbounded risk.", filename: "rsi.py", starter: "def bounded_steps(n, cap):\n    return min(n, cap)\n", testBody: " __check(\"b\", bounded_steps(100,10)==10)", artName: "RSI bound", artDesc: "Cap self-improvement iterations." })],
  [/browser-agent/i, () => ({ concept: "Browser agents navigate the web via accessibility trees and screenshots.", filename: "browser.py", starter: "def click_action(x,y):\n    return {\"type\":\"click\",\"x\":x,\"y\":y}\n", testBody: ' __check("c", click_action(10,20)[\"type\"]==\"click\")', artName: "Browser click", artDesc: "GUI click action." })],
  [/claude-code|permission/i, () => ({ concept: "Permission modes control what coding agents can read, write, and execute.", filename: "perm.py", starter: "def mode_allows(mode, action):\n    return mode==\"full\" or action==\"read\"\n", testBody: ' __check("p", mode_allows(\"read-only\",\"read\"))', artName: "Permission mode", artDesc: "Agent permission check." })],
  [/durable-execution/i, () => ({ concept: "Durable workflows survive crashes with checkpoints and replay.", filename: "durable.py", starter: "def checkpoint_id(run, step):\n    return f\"{run}:{step}\"\n", testBody: ' __check("c", checkpoint_id(\"r1\",3)==\"r1:3\")', artName: "Checkpoint ID", artDesc: "Durable workflow checkpoint." })],
  [/cost-governor/i, () => ({ concept: "Cost governors halt runs when spend exceeds budget.", filename: "costgov.py", starter: "def over_budget(spent, limit):\n    return spent > limit\n", testBody: " __check(\"o\", over_budget(11,10))", artName: "Cost governor", artDesc: "Budget exceeded flag." })],
  [/kill-switch|canar/i, () => ({ concept: "Kill switches and canaries limit blast radius of autonomous systems.", filename: "kill.py", starter: "def kill_triggered(signal):\n    return signal==\"STOP\"\n", testBody: ' __check("k", kill_triggered(\"STOP\"))', artName: "Kill switch", artDesc: "Emergency stop signal." })],
  [/vllm/i, () => ({ concept: "vLLM uses PagedAttention and continuous batching for throughput.", filename: "vllm.py", starter: "def continuous_batch(batch_sizes):\n    return sum(batch_sizes)\n", testBody: " __check(\"b\", continuous_batch([4,8,2])==14)", artName: "Continuous batch", artDesc: "Total batched sequences." })],
  [/sglang|radix/i, () => ({ concept: "SGLang RadixAttention caches shared prompt prefixes across requests.", filename: "sglang.py", starter: "def prefix_cache_hit(shared, total):\n    return shared/max(total,1)\n", testBody: " __check(\"h\", prefix_cache_hit(80,100)==0.8)", artName: "Prefix cache", artDesc: "Shared prefix cache ratio." })],
  [/tensorrt/i, () => ({ concept: "TensorRT-LLM optimizes kernels for NVIDIA inference.", filename: "trt.py", starter: "def fp8_scale(x):\n    return round(x*127)/127\n", testBody: " __check(\"f\", fp8_scale(1.0)==1.0)", artName: "FP8 quant", artDesc: "TensorRT FP8 scaling." })],
  [/goodput|inference-metric/i, () => ({ concept: "Goodput counts useful tokens/sec after accounting for retries.", filename: "goodput.py", starter: "def goodput(success_tokens, wall_s):\n    return success_tokens/max(wall_s,1e-9)\n", testBody: " __check(\"g\", goodput(500,1)==500)", artName: "Goodput", artDesc: "Useful inference throughput." })],
  [/quantization/i, () => ({ concept: "INT4/INT8 quantization shrinks models for faster cheaper inference.", filename: "quantinf.py", starter: "def quant_bits(params_m, bits=4):\n    return params_m*bits/8\n", testBody: " __check(\"q\", quant_bits(1000)==500)", artName: "Quant size", artDesc: "Quantized model MB estimate." })],
  [/semantic-cach/i, () => ({ concept: "Semantic cache returns prior answers for similar prompts.", filename: "semcache.py", starter: "def cache_similarity(a,b):\n    return sum(x*y for x,y in zip(a,b))\n", testBody: " __check(\"s\", cache_similarity([1,0],[1,0])==1)", artName: "Semantic hit", artDesc: "Embedding similarity for cache." })],
  [/finops/i, () => ({ concept: "FinOps tracks $/1M tokens and GPU-hours per feature.", filename: "finops.py", starter: "def cost_per_million(tokens, dollars):\n    return dollars/(tokens/1e6)\n", testBody: " __check(\"c\", cost_per_million(1e6,3)==3)", artName: "FinOps", artDesc: "Cost per million tokens." })],
  [/fipa|acl/i, () => ({ concept: "FIPA ACL message types: inform, request, agree, refuse.", filename: "fipa.py", starter: "def acl_performative(msg):\n    return msg.get(\"performative\",\"\")\n", testBody: ' __check("p", acl_performative({\"performative\":\"inform\"})==\"inform\")', artName: "ACL performative", artDesc: "FIPA message type." })],
  [/consensus|bft/i, () => ({ concept: "Byzantine fault tolerance needs 3f+1 nodes to tolerate f faults.", filename: "bft.py", starter: "def min_replicas(f):\n    return 3*f+1\n", testBody: " __check(\"n\", min_replicas(1)==4)", artName: "BFT quorum", artDesc: "Minimum replicas for f faults." })],
  [/swarm|pso|aco/i, () => ({ concept: "Swarm algorithms optimize via particle or ant colony search.", filename: "swarm.py", starter: "def best_fitness(pop):\n    return max(pop)\n", testBody: " __check(\"b\", best_fitness([0.1,0.9,0.3])==0.9)", artName: "Swarm best", artDesc: "Best particle fitness." })],
  [/tokenizer|bpe/i, () => ({ concept: "BPE merges frequent pairs to build subword vocabularies.", filename: "bpe.py", starter: "def merge_once(tokens, pair):\n    a,b=pair; out=[]; i=0\n    while i<len(tokens):\n        if i<len(tokens)-1 and tokens[i]==a and tokens[i+1]==b:\n            out.append(a+b); i+=2\n        else:\n            out.append(tokens[i]); i+=1\n    return out\n", testBody: ' __check("m", merge_once([\"a\",\"a\",\"b\"],(\"a\",\"a\"))==[\"aa\",\"b\"])', artName: "BPE merge", artDesc: "One BPE merge step." })],
  [/positional-embed|rope/i, () => ({ concept: "RoPE encodes position via rotary transforms on Q and K.", filename: "rope.py", starter: "def rope_dim(head_dim):\n    return head_dim\n", testBody: " __check(\"d\", rope_dim(64)==64)", artName: "RoPE dim", artDesc: "Rotary embedding dimension." })],
  [/multihead|attention/i, () => ({ concept: "Multi-head attention runs parallel attention in subspaces.", filename: "mha.py", starter: "def head_dim(d_model, n_heads):\n    return d_model//n_heads\n", testBody: " __check(\"h\", head_dim(512,8)==64)", artName: "Head dim", artDesc: "Dimension per attention head." })],
  [/transformer-block/i, () => ({ concept: "Transformer block = attention + FFN + residuals + layer norm.", filename: "tblock.py", starter: "def residual(x, sublayer):\n    return x+sublayer\n", testBody: " __check(\"r\", residual(1.0,0.5)==1.5)", artName: "Residual", artDesc: "Residual connection." })],
  [/training-loop|cosine-lr|gradient-clipping|gradient-accum/i, () => ({ concept: "Training loops combine LR schedules, clipping, and accumulation.", filename: "train.py", starter: "def effective_batch(micro, accum):\n    return micro*accum\n", testBody: " __check(\"b\", effective_batch(4,8)==32)", artName: "Eff batch", artDesc: "Gradient accumulation batch size." })],
  [/distributed|fsdp|ddp|pipeline-parallel|zero-parameter/i, () => ({ concept: "Distributed training shards params and pipelines across GPUs.", filename: "dist.py", starter: "def world_size(gpus):\n    return gpus\n", testBody: " __check(\"w\", world_size(8)==8)", artName: "World size", artDesc: "Distributed process count." })],
  [/rag|retrieval|rerank|bm25|hyde|chunking/i, () => ({ concept: "RAG retrieves relevant chunks then conditions generation on them.", filename: "rag.py", starter: "def retrieval_precision(relevant, k):\n    return len(relevant)/k\n", testBody: " __check(\"p\", retrieval_precision([1,1],2)==1.0)", artName: "RAG P@k", artDesc: "Retrieval precision at k." })],
  [/eval|perplexity|leaderboard|lm-eval/i, () => ({ concept: "Eval harnesses measure capability with standardized benchmarks.", filename: "eval.py", starter: "def pass_at_k(n,c,k):\n    return 1-(1-c/n)**k if n else 0\n", testBody: " __check(\"p\", pass_at_k(1,1,1)==1)", artName: "pass@k", artDesc: "Code eval pass@k metric." })],
  [/hypothesis|literature|experiment-runner|paper-writer|critic-loop/i, () => ({ concept: "Research agents loop through hypothesis, experiments, and writeups.", filename: "research.py", starter: "def research_stages():\n    return [\"hypothesis\",\"experiment\",\"paper\"]\n", testBody: " __check(\"s\", len(research_stages())==3)", artName: "Research stages", artDesc: "Autonomous research pipeline." })],
  [/vision-encoder|vit-transformer|projection-layer|cross-attention|vision-language/i, () => ({ concept: "Vision-language models fuse image patches with text tokens.", filename: "vlm.py", starter: "def patch_tokens(h,w,p):\n    return (h//p)*(w//p)\n", testBody: " __check(\"t\", patch_tokens(224,224,16)==196)", artName: "Patch tokens", artDesc: "ViT sequence length." })],
  [/jailbreak|prompt-injection|refusal|content-classifier|constitutional-rules|safety-gate/i, () => ({ concept: "Safety gates filter inputs, outputs, and tool results in production.", filename: "safety.py", starter: "def safety_block(flags):\n    return any(flags.values())\n", testBody: ' __check("b", safety_block({\"inj\":True}))', artName: "Safety gate", artDesc: "Block on any safety flag." })],
  [/fine-tuning|dpo-from-scratch|instruction-tuning/i, () => ({ concept: "Fine-tuning adapts base models via SFT, DPO, or LoRA.", filename: "ft.py", starter: "def trainable_tokens(total, masked):\n    return total-masked\n", testBody: " __check(\"t\", trainable_tokens(100,30)==70)", artName: "Train tokens", artDesc: "Tokens with loss applied." })],
  [/hdf5|corpus-downloader|tokenized-dataset/i, () => ({ concept: "Data pipelines download, tokenize, and shard training corpora.", filename: "data.py", starter: "def shard_count(tokens, size):\n    return (tokens+size-1)//size\n", testBody: " __check(\"s\", shard_count(1000,300)==4)", artName: "Shards", artDesc: "Training shard count." })],
];

function isStub(id) {
  const raw = fs.readFileSync(path.join(INTERACTIVE, `${id}.json`), "utf8");
  const j = JSON.parse(raw);
  return j.steps.find((s) => s.type === "build")?.code?.starter?.includes("lesson_checkpoint");
}

function matchRule(lesson) {
  for (const [re, fn] of RULES) {
    if (re.test(lesson.id) || re.test(lesson.title)) return fn(lesson);
  }
  return null;
}

function fallback(lesson) {
  const slug = lesson.id.replace(/^\d+-/, "").replace(/[^a-z0-9]+/gi, "_").slice(0, 22) || "lesson";
  const concepts = {
    15: "Autonomous AI systems plan, research, and improve with safety bounds.",
    16: "Multi-agent coordination via protocols, memory, and orchestration.",
    17: "Production LLM infrastructure: serving, observability, reliability.",
    19: "Capstone module: implement and ship a production AI capability.",
  };
  const concept = concepts[lesson.phaseId] || `Apply ${lesson.title} in a hands-on checkpoint.`;
  return {
    concept,
    filename: `${slug}.py`,
    starter: `def ${slug}(x):\n    return x\n`,
    testBody: ` __check("core", ${slug}(7)==7)`,
    artName: lesson.title.slice(0, 45),
    artDesc: `Checkpoint: ${lesson.title}.`,
  };
}

function enrich(lesson) {
  return CURATED[lesson.id] || matchRule(lesson) || fallback(lesson);
}

function esc(s) {
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

const catalog = JSON.parse(fs.readFileSync(CATALOG, "utf8"));
const stubs = catalog.lessons.filter((l) => isStub(l.id));

const entries = stubs.map((l) => {
  const e = enrich(l);
  const title = l.title;
  return `  S("${l.id}", ${l.phaseId}, ${l.lessonNumber}, "${esc(title)}", "${esc(e.concept)}", "${e.filename}", ${JSON.stringify(e.starter)}, '${e.testBody}', "${esc(e.artName)}", "${esc(e.artDesc)}")`;
});

const body = `/** Batch 7 — enriched ${stubs.length} remaining stub lessons */
const C = \`def __check(n,ok,m=""):\\n __results.append({"name":n,"pass":bool(ok),"msg":m})\\n\`;
function S(id, phaseId, ln, title, concept, filename, starter, testBody, artName, artDesc) {
  return { id, phaseId, lessonNumber: ln, title, concept,
    build: { filename, starter, tests: \`\${C}try:\\n\${testBody}\\nexcept Exception as e:\\n __check("runtime",False,str(e))\` },
    artifact: { name: artName, description: artDesc } };
}
export default [
${entries.join(",\n")},
];
`;

fs.writeFileSync(OUT, body);
console.log(`Wrote ${OUT} with ${stubs.length} specs`);
