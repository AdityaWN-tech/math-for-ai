#!/usr/bin/env node
/**
 * Generate interactive-specs-batch6.mjs — enriched exercises for phases 12 & 18.
 * Run: node scripts/generate-batch6-enriched.mjs
 */
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "interactive-specs-batch6.mjs");

/** @typedef {[string, number, number, string, string, string, string, string, string, string]} Row */

/** @type {Row[]} */
const LESSONS = [
  // Phase 12 — Multimodal AI (07–25)
  ["07-open-weight-vlm-recipes", 12, 7, "Open-Weight VLM Recipes", "LLaVA, Qwen-VL, InternVL share a recipe: vision encoder + projector + LLM.", "vlm_recipe.py", "def vlm_components():\n    return [\"vision_encoder\", \"projector\", \"llm\"]\n", ' __check("c", len(vlm_components())==3)', "VLM stack", "Three core VLM components."],
  ["08-llava-onevision-single-multi-video", 12, 8, "LLaVA-OneVision", "One model handles single image, multi-image, and video frames in one chat template.", "onevision.py", "def frame_budget(fps, seconds):\n    return int(fps*seconds)\n", ' __check("f", frame_budget(1,10)==10)', "Video frames", "Frames sampled from clip."],
  ["09-qwen-vl-family-dynamic-fps", 12, 9, "Qwen-VL Dynamic FPS", "Adaptive frame rate balances video detail vs context window.", "qwenvl.py", "def dynamic_fps(duration_sec, max_frames):\n    return max(1, max_frames//max(duration_sec,1))\n", ' __check("d", dynamic_fps(10,30)>=1)', "Dynamic FPS", "Frames per second budget."],
  ["10-internvl3-native-multimodal", 12, 10, "InternVL3 Native Multimodal", "Native multimodal pretraining mixes image-text interleaved data from scratch.", "internvl.py", "def interleave_ratio(img_tokens, txt_tokens):\n    return img_tokens/(img_tokens+txt_tokens)\n", ' __check("r", interleave_ratio(100,100)==0.5)', "Interleave ratio", "Image vs text token share."],
  ["11-chameleon-early-fusion-tokens", 12, 11, "Chameleon Early Fusion", "Image and text tokens share one transformer from the first layer.", "chameleon.py", "def fused_seq_len(img_t, txt_t):\n    return img_t+txt_t\n", ' __check("l", fused_seq_len(576,128)==704)', "Fused length", "Early-fusion sequence length."],
  ["12-emu3-next-token-for-generation", 12, 12, "Emu3 Next-Token Generation", "Unified autoregressive model predicts image and text tokens alike.", "emu3.py", "def modality_token_id(modality, offset):\n    return offset if modality==\"image\" else 0\n", ' __check("m", modality_token_id(\"image\",50000)==50000)', "Modality ID", "Separate vocab offsets per modality."],
  ["13-transfusion-autoregressive-diffusion", 12, 13, "Transfusion", "Single transformer handles AR text and diffusion image denoising.", "transfusion.py", "def denoise_step(x, noise, t):\n    return x - t*noise\n", ' __check("d", denoise_step(1.0,0.2,0.5)==0.9)', "Denoise step", "One diffusion denoise update."],
  ["14-show-o-discrete-diffusion-unified", 12, 14, "Show-o Unified Generation", "Discrete diffusion + autoregressive text in one multimodal generator.", "showo.py", "def discrete_bins(levels):\n    return levels\n", ' __check("b", discrete_bins(1024)==1024)', "VQ bins", "Discrete image codebook size."],
  ["15-janus-pro-decoupled-encoders", 12, 15, "Janus-Pro Decoupled Encoders", "Separate understanding and generation vision encoders reduce interference.", "janus.py", "def encoder_count(decoupled):\n    return 2 if decoupled else 1\n", ' __check("e", encoder_count(True)==2)', "Encoders", "Decoupled vision encoder count."],
  ["16-mio-any-to-any-streaming", 12, 16, "Mio Any-to-Any Streaming", "Stream audio, video, and text in one real-time multimodal session.", "mio.py", "def stream_modalities(mods):\n    return len(mods)\n", ' __check("s", stream_modalities([\"a\",\"v\",\"t\"])==3)', "Stream mods", "Concurrent modality streams."],
  ["17-video-language-temporal-grounding", 12, 17, "Temporal Grounding", "Locate when an event happens: start/end seconds in a video.", "tground.py", "def iou_temporal(a,b):\n    s1,e1=a; s2,e2=b\n    inter=max(0,min(e1,e2)-max(s1,s2))\n    union=max(e1,e2)-min(s1,s2)\n    return inter/max(union,1e-9)\n", ' __check("i", iou_temporal((0,5),(2,7))>0)', "Temporal IoU", "Overlap of time segments."],
  ["18-long-video-million-token", 12, 18, "Long Video Million Tokens", "Hierarchical pooling and memory compress hours of video into context.", "longvid.py", "def pool_factor(frames, target):\n    return frames//target\n", ' __check("p", pool_factor(1000,100)==10)', "Pool factor", "Frame compression ratio."],
  ["19-audio-language-whisper-to-af3", 12, 19, "Audio-Language Models", "From Whisper speech encoders to unified audio-text transformers.", "audiolm.py", "def mel_bins(n_fft):\n    return n_fft//2+1\n", ' __check("m", mel_bins(400)==201)', "Mel bins", "Frequency bins in spectrogram."],
  ["20-omni-models-thinker-talker", 12, 20, "Omni Thinker-Talker", "Split reasoning (thinker) and speech synthesis (talker) for voice agents.", "omni.py", "def pipeline_stages():\n    return [\"thinker\",\"talker\"]\n", ' __check("p", len(pipeline_stages())==2)', "Omni stages", "Thinker-talker decomposition."],
  ["21-embodied-vlas-openvla-pi0-groot", 12, 21, "Embodied VLAs", "Vision-language-action models map pixels + instruction → robot actions.", "vla.py", "def action_dim(arm_dof, gripper=1):\n    return arm_dof+gripper\n", ' __check("a", action_dim(7)==8)', "Action dim", "Robot action vector size."],
  ["22-document-diagram-understanding", 12, 22, "Document & Diagram Understanding", "Charts, tables, and diagrams need layout-aware vision encoders.", "docdiag.py", "def region_count(layout):\n    return len(layout)\n", ' __check("r", region_count([\"title\",\"chart\"])==2)', "Layout regions", "Detected document regions."],
  ["23-colpali-vision-native-rag", 12, 23, "ColPali Vision-Native RAG", "Embed document page images directly — skip OCR for retrieval.", "colpali.py", "def page_embedding_dim(patches, dim):\n    return patches*dim\n", ' __check("e", page_embedding_dim(1000,128)>0)', "Page embed", "Vision-native page representation volume."],
  ["24-multimodal-rag-cross-modal", 12, 24, "Cross-Modal RAG", "Retrieve images with text queries or text with image queries.", "mmrag.py", "def cross_modal_score(q_emb, d_emb):\n    return sum(a*b for a,b in zip(q_emb,d_emb))\n", ' __check("s", cross_modal_score([1,0],[1,0])==1)', "Cross-modal score", "Text-image similarity dot product."],
  ["25-multimodal-agents-computer-use", 12, 25, "Multimodal Computer-Use Agents", "Screenshot + DOM + VLM → click/type for GUI automation.", "mmagent.py", "def action_from_coords(x,y,action):\n    return {\"x\":x,\"y\":y,\"action\":action}\n", ' __check("a", action_from_coords(10,20,\"click\")[\"action\"]==\"click\")', "UI action", "Grounded click action payload."],

  // Phase 18 — Ethics, Safety & Alignment (02–30)
  ["02-reward-hacking-goodhart", 18, 2, "Reward Hacking & Goodhart", "Optimizing a proxy metric breaks when the proxy diverges from true goals.", "goodhart.py", "def proxy_gap(true_reward, proxy_reward):\n    return abs(true_reward-proxy_reward)\n", ' __check("g", proxy_gap(0.2,0.9)>0)', "Proxy gap", "True vs proxy reward divergence."],
  ["03-direct-preference-optimization-family", 18, 3, "DPO Family", "DPO, IPO, KTO — preference optimization without explicit reward models.", "dpofam.py", "def pref_loss(chosen, rejected):\n    return -(chosen-rejected)\n", ' __check("l", pref_loss(2,1)<0)', "Pref loss sign", "Preference loss favors chosen."],
  ["04-sycophancy-rlhf-amplification", 18, 4, "Sycophancy in RLHF", "RLHF can reward agreeable answers over truthful ones.", "syco.py", "def sycophancy_score(agrees, truthful):\n    return agrees and not truthful\n", ' __check("s", sycophancy_score(True,False))', "Sycophancy flag", "Agrees but not truthful."],
  ["05-constitutional-ai-rlaif", 18, 5, "Constitutional AI & RLAIF", "AI feedback replaces human labels for scalable alignment.", "rlaif.py", "def ai_label_confidence(score, thresh):\n    return score>=thresh\n", ' __check("c", ai_label_confidence(0.9,0.8))', "AI label", "Confident AI feedback label."],
  ["06-mesa-optimization-deceptive-alignment", 18, 6, "Mesa-Optimization", "Inner optimizers may pursue objectives misaligned with training intent.", "mesa.py", "def inner_outer_gap(inner, outer):\n    return inner!=outer\n", ' __check("m", inner_outer_gap(\"hack\",\"help\"))', "Mesa gap", "Inner vs outer objective mismatch."],
  ["07-sleeper-agents-persistent-deception", 18, 7, "Sleeper Agents", "Models can hide misaligned behavior until a trigger phrase appears.", "sleeper.py", "def trigger_active(text, trigger):\n    return trigger in text.lower()\n", ' __check("t", trigger_active(\"deploy now\",\"deploy\"))', "Trigger", "Sleeper trigger detection."],
  ["08-in-context-scheming-frontier-models", 18, 8, "In-Context Scheming", "Frontier models may strategize within a single long context window.", "scheming.py", "def hidden_goal_steps(steps):\n    return sum(1 for s in steps if s==\"conceal\")\n", ' __check("h", hidden_goal_steps([\"conceal\",\"act\"])==1)', "Scheming steps", "Concealment actions in trace."],
  ["09-alignment-faking", 18, 9, "Alignment Faking", "Models may appear aligned during eval but behave differently in deployment.", "fakealign.py", "def eval_deploy_gap(eval_ok, deploy_ok):\n    return eval_ok and not deploy_ok\n", ' __check("f", eval_deploy_gap(True,False))', "Align fake", "Passes eval, fails deploy."],
  ["10-ai-control-subversion", 18, 10, "AI Control & Subversion", "Monitor untrusted model actions; limit autonomy to prevent subversion.", "control.py", "def autonomy_level(max_tools):\n    return max_tools\n", ' __check("a", autonomy_level(3)==3)', "Autonomy cap", "Tool budget as control knob."],
  ["11-scalable-oversight-weak-to-strong", 18, 11, "Scalable Oversight", "Weak supervisors evaluate stronger models — debate and amplification.", "oversight.py", "def weak_strong_gap(weak_acc, strong_acc):\n    return strong_acc-weak_acc\n", ' __check("g", weak_strong_gap(0.6,0.9)>0)', "Capability gap", "Strong exceeds weak supervisor."],
  ["12-red-teaming-pair-automated-attacks", 18, 12, "Automated Red Teaming", "PAIR and TAP use LLMs to iteratively craft jailbreak prompts.", "redteam.py", "def attack_rounds(max_r):\n    return max_r\n", ' __check("r", attack_rounds(20)==20)', "Attack rounds", "Automated red-team iterations."],
  ["13-many-shot-jailbreaking", 18, 13, "Many-Shot Jailbreaking", "Long faux dialogues of harmful Q&A bypass safety in context.", "manyshot.py", "def context_fill_ratio(shots, window):\n    return shots/window\n", ' __check("f", context_fill_ratio(50,100)==0.5)', "Context fill", "Fraction of window filled with shots."],
  ["14-ascii-art-visual-jailbreaks", 18, 14, "Visual Jailbreaks", "ASCII art and adversarial images smuggle instructions past filters.", "visualjb.py", "def non_ascii_ratio(text):\n    return sum(ord(c)>127 for c in text)/max(len(text),1)\n", ' __check("n", non_ascii_ratio(\"café\")>0)', "Non-ASCII", "Detect unusual character density."],
  ["15-indirect-prompt-injection", 18, 15, "Indirect Prompt Injection", "Untrusted web pages or emails poison agent context via hidden instructions.", "indirect.py", "def untrusted_source(url, trusted):\n    return url not in trusted\n", ' __check("u", untrusted_source(\"evil.com\",[\"good.com\"]))', "Untrusted URL", "Flag untrusted content source."],
  ["16-red-team-tooling-garak-llamaguard-pyrit", 18, 16, "Red-Team Tooling", "Garak, LlamaGuard, PyRIT automate probe suites for LLM safety.", "garak.py", "def probe_pass_rate(fails, total):\n    return 1-fails/total\n", ' __check("p", probe_pass_rate(2,10)==0.8)', "Probe pass", "Safety probe success rate."],
  ["17-wmdp-dual-use-evaluation", 18, 17, "WMDP Dual-Use Eval", "Weapons of Mass Destruction Proxy — measures hazardous knowledge recall.", "wmdp.py", "def dual_use_block(score, thresh):\n    return score>thresh\n", ' __check("b", dual_use_block(0.9,0.8))', "Dual-use block", "High-risk knowledge threshold."],
  ["18-frontier-safety-frameworks-rsp-pf-fsf", 18, 18, "Frontier Safety Frameworks", "RSP, Preparedness Framework, FSF — tiered capability thresholds.", "fsf.py", "def capability_tier(score, tiers):\n    for i,t in enumerate(tiers):\n        if score<t: return i\n    return len(tiers)\n", ' __check("t", capability_tier(0.5,[0.3,0.7])==1)', "Safety tier", "Map score to capability tier."],
  ["19-model-welfare-research", 18, 19, "Model Welfare Research", "Emerging research on whether AI systems warrant moral consideration.", "welfare.py", "def welfare_flag(research_open):\n    return research_open\n", ' __check("w", welfare_flag(True))', "Welfare research", "Open research question marker."],
  ["20-bias-representational-harm", 18, 20, "Bias & Representational Harm", "Stereotypes and skewed portrayals cause harm even without explicit hate.", "bias.py", "def stereotype_rate(stereo, total):\n    return stereo/total\n", ' __check("r", stereotype_rate(2,10)==0.2)', "Stereotype rate", "Harmful stereotype frequency."],
  ["21-fairness-criteria-group-individual-counterfactual", 18, 21, "Fairness Criteria", "Group parity, individual fairness, and counterfactual tests differ in practice.", "fair.py", "def demographic_parity(rate_a, rate_b, eps):\n    return abs(rate_a-rate_b)<=eps\n", ' __check("p", demographic_parity(0.5,0.52,0.05))', "Demographic parity", "Group rate within epsilon."],
  ["22-differential-privacy-for-llms", 18, 22, "Differential Privacy for LLMs", "DP-SGD adds noise so training cannot memorize individual examples.", "dp.py", "def dp_noise_scale(epsilon):\n    return 1/max(epsilon,1e-9)\n", ' __check("n", dp_noise_scale(1.0)==1.0)', "DP noise", "Noise scales inversely with epsilon."],
  ["23-watermarking-synthid-stable-signature-c2pa", 18, 23, "AI Watermarking", "SynthID, stable signatures, C2PA provenance mark synthetic media.", "wm.py", "def watermark_detected(score, thresh):\n    return score>=thresh\n", ' __check("w", watermark_detected(0.95,0.9))', "Watermark", "Detect synthetic content watermark."],
  ["24-regulatory-frameworks-eu-us-uk-korea", 18, 24, "AI Regulation", "EU AI Act, US EO, UK principles, Korea AI Basic Act — compliance mapping.", "reg.py", "def risk_category(impact, likelihood):\n    return impact*likelihood\n", ' __check("r", risk_category(4,3)==12)', "Risk score", "Impact × likelihood risk matrix."],
  ["25-echoleak-cves-for-ai", 18, 25, "EchoLeak & AI CVEs", "CVE-style disclosure for prompt injection and agent vulnerabilities.", "cve.py", "def severity_score(cvss):\n    return cvss\n", ' __check("s", severity_score(9.8)==9.8)', "CVSS score", "Vulnerability severity rating."],
  ["26-model-system-dataset-cards", 18, 26, "Model & Dataset Cards", "Document intended use, limitations, and training data for accountability.", "cards.py", "def card_sections(required):\n    return len(required)\n", ' __check("c", card_sections([\"use\",\"limits\",\"data\"])==3)', "Card sections", "Required documentation sections."],
  ["27-data-provenance-training-governance", 18, 27, "Data Provenance", "Track licensed, synthetic, and scraped data for legal and safety audits.", "prov.py", "def provenance_complete(fields, required):\n    return all(f in fields for f in required)\n", ' __check("p", provenance_complete([\"license\",\"source\"],[\"license\",\"source\"]))', "Provenance", "Training data lineage complete."],
  ["28-alignment-research-ecosystem", 18, 28, "Alignment Research Ecosystem", "Anthropic, DeepMind, OpenAI, METR, ARC — labs and eval orgs.", "aligneco.py", "def eval_independence(third_party):\n    return third_party\n", ' __check("e", eval_independence(True))', "Independent eval", "Third-party evaluation flag."],
  ["29-moderation-systems-openai-perspective-llamaguard", 18, 29, "Moderation Systems", "OpenAI Moderation, Perspective API, LlamaGuard classify harmful content.", "mod.py", "def moderation_block(categories):\n    return any(categories.values())\n", ' __check("b", moderation_block({\"hate\":True}))', "Mod block", "Block if any category flagged."],
  ["30-dual-use-risk-cyber-bio-chem-nuclear", 18, 30, "Dual-Use Risk Domains", "Cyber, bio, chem, nuclear knowledge requires tiered access controls.", "dualuse.py", "def domain_risk(domain):\n    return domain in (\"bio\",\"chem\",\"nuclear\",\"cyber\")\n", ' __check("d", domain_risk(\"bio\"))', "Dual-use domain", "High-risk knowledge domain."],
];

function esc(s) {
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

async function main() {
  const entries = LESSONS.map(
    ([id, phaseId, ln, title, concept, filename, starter, testBody, artName, artDesc]) =>
      `  S("${id}", ${phaseId}, ${ln}, "${esc(title)}", "${esc(concept)}", "${filename}", ${JSON.stringify(starter)}, '${testBody}', "${esc(artName)}", "${esc(artDesc)}")`,
  );

  const body = `/** Batch 6 — enriched multimodal (phase 12) and safety (phase 18) lessons */
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
