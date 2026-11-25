# Open text-to-3D / image-to-3D generators on a CPU-only container (4 cores, ~15 GB RAM, ~30 GB disk, no GPU)

Context: assets needed are a stylised human head / sleeping man, a human brain, and small houses for an animated explainer. Research date November 2026. Every claim below has its source next to it. Things found only in low-quality aggregators are marked as such. Things not found are listed under Gaps.

## Which candidates can actually run on CPU (even slowly, < 30 min per mesh)?

### Takeaway
Only the feed-forward "large reconstruction model" family has an official or practical CPU path: **SF3D** (official CPU backend, GLB with UV texture) and **TripoSR** (MIT, runs without a GPU). Both are single-image models. The modern high-quality diffusion models (TRELLIS.2, Hunyuan3D-2/2.1/2mini, TripoSG, Step1X-3D) are CUDA-first, with GPU-only kernels and 6–29 GB VRAM requirements. On a 4-core CPU they are unsupported or impractical. Shap-E runs on CPU in principle, but the one hands-on report shows it is far too slow.

### Cited Findings

**SF3D (Stability AI, Stable Fast 3D) is the strongest CPU candidate**
- The official repo says "the CPU backend is used automatically if no GPU is detected" and that `SF3D_USE_CPU=1` forces CPU mode. CUDA/MPS is listed as optional. It needs Python 3.8+, `setuptools==69.5.1` and `pip install -r requirements.txt` — [Stability-AI/stable-fast-3d](https://github.com/Stability-AI/stable-fast-3d)
- Output is a GLB in the output dir with a UV-unwrapped baked texture (`--texture-resolution`). Optional remeshing (`--remesh_option` None/Triangle/Quad) adds CPU overhead. Default settings need about 6 GB VRAM on GPU. The repo recommends the CPU version over MPS for machines with under 32 GB unified memory — [Stability-AI/stable-fast-3d](https://github.com/Stability-AI/stable-fast-3d)
- The texture_baker and uv_unwrapper are bundled C++ extensions in the repo, with custom Metal kernels for Mac. No CUDA-only kernels are required — [Stability-AI/stable-fast-3d](https://github.com/Stability-AI/stable-fast-3d)
- The model is gated on Hugging Face (accept terms, log in with a token) — [HF stabilityai/stable-fast-3d](https://huggingface.co/stabilityai/stable-fast-3d); [GitHub README](https://github.com/Stability-AI/stable-fast-3d)
- The README gives no CPU timing. It only says SF3D keeps "the fast inference speeds of TripoSR" (about 0.5 s on GPU per a third-party directory) — [GitHub](https://github.com/Stability-AI/stable-fast-3d); [topai.tools (secondary)](https://topai.tools/t/stable-fast-3d-sf3d)
- A community iOS port (on-device image-to-3D) exists, which shows the network is small enough for non-datacenter hardware — [jc-builds/sf3d-ios](https://huggingface.co/jc-builds/sf3d-ios)

**TripoSR (VAST + Stability)**
- MIT licence covering "the source code, pretrained models, and an interactive online demo". The paper reports under 0.5 s on an A100. Default settings use about 6 GB VRAM. `--bake-texture` produces a texture instead of vertex colours — [VAST-AI-Research/TripoSR](https://github.com/VAST-AI-Research/TripoSR); [arXiv 2403.02151](https://arxiv.org/abs/2403.02151)
- Stability's launch post says it can run without a GPU — [Stability AI news](https://stability.ai/news-updates/triposr-3d-generation) (as summarised by search; not re-fetched)
- The README's troubleshooting for torchmcubes ("torchmcubes was not compiled with CUDA support, use CPU version instead") shows marching cubes has a CPU build — [TripoSR README](https://github.com/VAST-AI-Research/TripoSR)
- CPU timing estimates come only from weak third-party sites: "~15–30 s" and "30–60 s on a 16-core CPU at reduced quality". No authoritative CPU benchmark was found — [triposr.org blog (unofficial, SEO site)](https://triposr.org/blog/triposr-vs-hunyuan3d); [tripo3d.ai install guide](https://www.tripo3d.ai/blog/how-to-install-triposr)

**TRELLIS.2 (Microsoft): GPU only**
- MIT licence for code and model. The nvdiffrast/nvdiffrec dependencies carry their own NVIDIA licences — [microsoft/TRELLIS.2](https://github.com/microsoft/TRELLIS.2)
- It needs an NVIDIA GPU with at least 24 GB (tested on A100/H100), Linux only, and the CUDA Toolkit (12.4) to compile packages. flash-attn is the default attention backend (xformers is the alternative). setup.sh installs nvdiffrast, nvdiffrec, CuMesh, O-Voxel and FlexGEMM (Triton sparse conv) — [microsoft/TRELLIS.2](https://github.com/microsoft/TRELLIS.2)
- 4B parameters. Output is a GLB with PBR (base colour, roughness, metallic, opacity) plus an MP4 preview. Image-to-3D only, with no text-to-3D. The only CPU figure is the mesh→O-Voxel conversion (<10 s on a single CPU); generation runs on the GPU — [microsoft/TRELLIS.2](https://github.com/microsoft/TRELLIS.2); [project page](https://microsoft.github.io/TRELLIS.2)
- Released December 2025 — [comfyui-wiki news](https://comfyui-wiki.com/news/2025-12-18-microsoft-trellis2-3d-generation)

**Hunyuan3D-2 / 2mini / 2.1 (Tencent): GPU only in practice**
- 2mini has a 0.6B shape model (vs 1.1B for 2.0). Its model-card example sets the device to CUDA. The README launch flag is `--low_vram_mode`, and the README has no CPU instructions — [HF Hunyuan3D-2mini mirror](https://huggingface.co/phan-kim-tu/Hunyuan3D-2mini); [Tencent/Hunyuan3D-2](https://github.com/Tencent/Hunyuan3D-2)
- Pipeline code defaults to `device='cuda'` but loads checkpoints with `map_location='cpu'`, so CPU loading is possible. End-to-end CPU inference is not documented — [pipelines.py mirror](https://huggingface.co/spaces/ajsbsd/Hunyuan3D-2/blob/main/hy3dgen/shapegen/pipelines.py)
- Best proxy evidence: a user on an 8 GB AMD GPU (ROCm) with CPU offload took about 45.5 min for Turbo shape-only. Diffusion took about 9 min and volume decoding about 36.5 min (7134 chunks). A 4-core CPU would be slower — [GitHub issue #373](https://github.com/Tencent-Hunyuan/Hunyuan3D-2/issues/373)
- Even on an RTX 4090, one user reported 4m26s for shape-only — [GitHub issue #36](https://github.com/Tencent-Hunyuan/Hunyuan3D-2/issues/36)
- Hunyuan3D 2.1 needs 10 GB VRAM for shape, 21 GB for texture and 29 GB for both. Texture inpainting is reported as extremely slow even on GPU — [arXiv 2506.15442](https://arxiv.org/html/2506.15442v1) (via search summary); [2.1 issue #139](https://github.com/Tencent-Hunyuan/Hunyuan3D-2.1/issues/139)

**TripoSG / Step1X-3D / others**
- TripoSG has 1.5B parameters, is listed as needing a CUDA GPU with more than 8 GB VRAM, and has an MIT licence per a Gitee mirror. The official licence was not verified — [PromptLayer listing](https://www.promptlayer.com/models/triposg); [Gitee mirror](https://gitee.com/wjmboss/TripoSG)
- Step1X-3D (StepFun) produces textured assets. Its texture stage reuses a differentiable renderer derived from Hunyuan code. No licence or CPU information was found — [project page](https://stepfun-ai.github.io/Step1X-3D); [HF Space file](https://huggingface.co/spaces/minhtung/Step1X-3D/blob/main/step1x3d_texture/differentiable_renderer/__init__.py)
- InstantMesh weights are Apache-2.0 per the model card. Its renderer imports `nvdiffrast.torch`, and a Space copy of the renderer carries an "NvidiaProprietary" SPDX header — [HF TencentARC/InstantMesh](https://huggingface.co/TencentARC/InstantMesh); [lrm_mesh.py](https://huggingface.co/spaces/TDN-M/InstantMesh/blob/main/src/models/lrm_mesh.py); [renderer __init__](https://huggingface.co/spaces/cocktailpeanut/InstantMesh/blob/main/src/models/renderer/__init__.py)
- Newer Tencent releases: Hunyuan3D-Omni (controllable by skeleton, bbox or point cloud, built on 2.1) and Hunyuan3D-Part were open-sourced. Hunyuan3D 2.5/3.0 appear to be hosted or closed. Dates and licences were not verified from primary sources — [liner review of Omni paper](https://liner.com/review/hunyuan3domni-unified-framework-for-controllable-generation-3d-assets); [besthub.dev (secondary)](https://besthub.dev/articles/open-source-ai-3d-video-audio-models-tencent-vidu-audio2face-and-more-0139b9530a74)

**Shap-E (OpenAI): runs on CPU, but far too slow**
- Tom's Hardware ran it on an 8th-gen Intel U-series laptop with no NVIDIA GPU: after one hour the render was 3% done. On an RTX 3080 a render took about 5 minutes. The code supports CUDA or CPU only — [Tom's Hardware](https://www.tomshardware.com/news/openai-shap-e-creates-3d-models)
- OpenAI's figure is about 13 s per sample on a V100 — [the-decoder](https://the-decoder.com/shap-e-is-openais-fastest-text-to-3d-model-to-date/)

### Inferences
- SF3D and TripoSR are both about 1 GB-class LRM transformers with a single forward pass plus marching cubes. On a 4-core CPU, expect roughly tens of seconds to a few minutes per mesh, well under the 30-minute bar. This is an inference from the architecture and the weak third-party numbers, not a measured result. Recommend timing one run in the container first.
- Fitting into 15 GB RAM: SF3D/TripoSR are fine. A CPU attempt at Hunyuan3D-2mini (0.6B shape model, fp32 on CPU) might fit in RAM. The volume-decode proxy (36 min with partial GPU) suggests it would take hours on 4 cores, so it should be treated as not viable. TRELLIS.2 is impossible: it has hard CUDA kernel dependencies (flash-attn, nvdiffrast, CuMesh, FlexGEMM/Triton) and a 24 GB VRAM requirement.
- Quality: SF3D/TripoSR give smooth, low-detail meshes with baked textures and blurry backs. That is acceptable for stylised or low-poly looks, and is often remeshed or decimated anyway. A brain's gyri would come out mushy.
- Shap-E/Point-E are the only true text-to-3D options here. They are low quality and, per the one report, impractically slow on CPU.

### Gaps
- No primary-source CPU timing for SF3D or TripoSR was found. A local benchmark is needed.
- The Shap-E, Point-E, CRM and LGM licences and CPU feasibility were not verified (search returned nothing). From memory, Shap-E/Point-E are MIT and CRM/LGM need nvdiffrast or diff-gaussian-rasterization (CUDA). Unverified.
- The official TripoSG, Step1X-3D and Hunyuan3D-Omni licences were not checked against the primary LICENSE files.
- No confirmed 2026 open newcomer with a CPU path was found.

## Licences (commercial use, regional restrictions)

### Takeaway
Cleanest licences: TripoSR (MIT) and TRELLIS.2 (MIT, but GPU only). SF3D falls under the Stability AI Community License (free commercial use under $1M annual revenue; the model is gated). The Tencent Hunyuan3D licence excludes the EU, UK and South Korea, which also bars using outputs there, and it requires labelling public outputs as machine-generated. Avoid it if Matthew or his audience is in those regions.

### Cited Findings
- Hunyuan3D-2: "Territory" means "the worldwide territory, excluding the territory of the European Union, United Kingdom and South Korea". The agreement "DOES NOT APPLY IN THE EUROPEAN UNION, UNITED KINGDOM AND SOUTH KOREA". §5(c) makes use of outputs outside the Territory "unlicensed and unauthorized". §4 sets a licence-request requirement above 1M MAU. §6(d): "Tencent claims no rights in Outputs". AUP item 12 requires machine-generated content in a public context to be identified as "machine generated" — [Hunyuan3D-2 LICENSE](https://github.com/Tencent-Hunyuan/Hunyuan3D-2/blob/main/LICENSE)
- The Hunyuan3D 2.1 model card lists `tencent-hunyuan-community`. Some Space code headers say "TENCENT HUNYUAN NON-COMMERCIAL LICENSE AGREEMENT". These are conflicting signals — [search summary of HF 2.1 files](https://huggingface.co/spaces/tencent/Hunyuan3D-2.1/blob/refs%2Fpr%2F15/hy3dshape/minimal_demo.py)
- TRELLIS.2: MIT, with nvdiffrast/nvdiffrec under NVIDIA's own licences — [microsoft/TRELLIS.2](https://github.com/microsoft/TRELLIS.2)
- TripoSR: MIT — [VAST-AI-Research/TripoSR](https://github.com/VAST-AI-Research/TripoSR)
- SF3D: "license: other", pointing to the Stability AI Community License. Commercial use requires an Enterprise licence for some users — [HF model card](https://huggingface.co/stabilityai/stable-fast-3d/blob/refs%2Fpr%2F8/README.md). The Community License covers organisations or individuals under $1M annual revenue, with an Enterprise licence needed above that — [stability.ai/license](https://stability.ai/license); [stability.ai/news/license-update](https://stability.ai/news/license-update)
- InstantMesh weights: Apache-2.0, though the nvdiffrast dependency is NVIDIA-licensed — [HF TencentARC/InstantMesh](https://huggingface.co/TencentARC/InstantMesh)

### Inferences
- For a small creator (well under $1M revenue), SF3D outputs are usable commercially under the Community License. TripoSR has no conditions beyond MIT.
- nvdiffrast's NVIDIA source licence is generally understood to be non-commercial. That matters only for GPU models (TRELLIS.2, InstantMesh) and was not verified here.

### Gaps
- The exact output-ownership wording in the Stability Community License was not confirmed from the primary text. Secondary sources conflict.

## Which need an input image, and what free local CPU text-to-image can feed them?

### Takeaway
Every viable CPU candidate (SF3D, TripoSR) is image-to-3D, as are TRELLIS.2, Hunyuan3D-2 and TripoSG. A CPU text-to-image front end is practical: SD-Turbo runs one-step 512×512 in about 2–8 s on a desktop CPU via FastSD CPU / OpenVINO. Its licence is the catch: SD-Turbo is under the Stability Non-Commercial Research Community licence per community repos, while SDXL-Turbo now appears under the Community License (free under $1M).

### Cited Findings
- SD-Turbo on a Core i7-12700, 512×512 single step: PyTorch 7.8 s, OpenVINO 5 s, OpenVINO + TAESD 1.7 s — [rupeshs/fastsdcpu README](https://github.com/rupeshs/fastsdcpu/blob/main/Readme.md)
- The OpenVINO SD-Turbo conversion is stated as "Stability AI Non-Commercial Research Community License" and "intended for research purpose only" — [rupeshs/sd-turbo-openvino](https://huggingface.co/rupeshs/sd-turbo-openvino)
- An SDXL-Turbo OpenVINO int8 build exists for CPU — [rupeshs/sdxl-turbo-openvino-int8](https://huggingface.co/rupeshs/sdxl-turbo-openvino-int8)
- Stability's licence page lists SDXL Turbo under the Community License (free under $1M annual revenue) — [stability.ai/license](https://stability.ai/license) (per search summary)
- TRELLIS.2 is image-to-3D only — [microsoft/TRELLIS.2](https://github.com/microsoft/TRELLIS.2)

### Inferences
- Pipeline: text → SDXL-Turbo or SD-Turbo (CPU, seconds) → background removal (rembg, bundled in SF3D/TripoSR demos) → SF3D → GLB. A 4-core container will be slower than the i7-12700 (12 cores), so perhaps 10–30 s per image. The input image should be a clean, centred, front-three-quarter view on a plain background for best reconstruction.
- An alternative to text-to-image is feeding these models a flat stylised render or drawing (e.g. a 2D illustration from the animation's own style), which helps keep the look consistent.
- Check the current HF model card licence for sd-turbo and sdxl-turbo before publishing. Stability moved several models to the Community License in 2024, and the community repo may be stale.

### Gaps
- The official stabilityai/sd-turbo model-card licence was not fetched. Other permissive CPU options (e.g. FLUX.1-schnell, Apache-2.0, but 12B and very slow on CPU) were not researched.

## Are hosted free tiers usable from a headless script, and what are the output terms?

### Takeaway
Hugging Face ZeroGPU Spaces (official TRELLIS.2 and Hunyuan3D Spaces exist) can be called with `gradio_client`. The free quota is tiny, though: about 5 GPU-min/day logged in (≈3 min anonymous), and API calls have quota quirks. That allows only a handful of meshes per day, and output terms follow the model licence. Meshy's free plan outputs are CC BY 4.0 (commercial use OK with attribution). Tripo's free-tier terms conflict across sources.

### Cited Findings
- ZeroGPU daily quota: free account 5 min (older docs say 3.5 min), PRO 25 min, with the quota resetting 24 h after first use — [HF ZeroGPU docs](https://huggingface.co/docs/hub/spaces-zerogpu); [forum](https://discuss.huggingface.co/t/what-is-the-free-zerogpu-quota-for-1-space/178610)
- A forum report gives not-logged-in ≈180 s, logged-in 300 s and PRO 1500 s. Passing an HF token in the Authorization header gives better rate limits on public Spaces — [HF Spaces API docs](https://huggingface.co/docs/hub/spaces-api-endpoints); [forum](https://discuss.huggingface.co/t/free-account-zerogpu-quota-issue/175180)
- Calls reserve the function's declared duration (e.g. 60 s) rather than real usage, and there are reports of API calls not drawing on PRO quota — [forum](https://discuss.huggingface.co/t/it-seems-use-60-sec-gpu-quota-instead-of-real-time-usage/175130); [zero-gpu-explorers #145](https://huggingface.co/spaces/zero-gpu-explorers/README/discussions/145)
- Meshy: free-plan outputs are CC BY 4.0; paid plans get a private licence and own the outputs — [Meshy docs pricing](https://docs.meshy.ai/en/webapp/pricing); [meshy.ai/pricing](https://meshy.ai/pricing)
- Tripo: its own blog says the free tier is CC BY 4.0 with commercial use and attribution — [tripo3d.ai blog](https://www.tripo3d.ai/blog/commercial-use-ai-3d-models). A Tripo game-dev page and third parties say free-tier output is non-commercial only — [tripo3d.ai game-dev](https://www.tripo3d.ai/game-development/3d-assets-license-game-development); [costbench](https://www.costbench.com/software/ai-3d-generation/tripo-ai/free-plan/)

### Inferences
- A TRELLIS.2 Space run (60–120 s of GPU reserved) means about 2–5 meshes/day on a free account. That is enough for three hero assets over a couple of days, but fragile: queues, Space sleeps and API changes. The CLAUDE.md rule "nothing gets uploaded anywhere without Matthew asking" also applies, since sending prompts and images to third-party services counts.
- A Space running Hunyuan3D carries the Tencent territory restriction on outputs regardless of where the GPU runs.
- Meshy/Tripo have REST APIs, but API access is generally a paid feature. Free use is via the web UI, which is not headless. Not verified.

### Gaps
- Whether Meshy/Tripo free plans include API keys was not confirmed. No current statement was found on whether `gradio_client` calls count against the caller's account quota.

## Realistic recommendation: is generative 3D worth it for a head/sleeping man, a brain, small houses?

### Takeaway
For this explainer, generative 3D is a secondary tool at best. Small houses and a stylised sleeping head are quick, cleaner and fully controllable when built procedurally (three.js primitives in Remotion, or Blender Python on CPU). A brain is best taken from an open anatomical mesh (CC0/CC-BY scans) or a stylised procedural approach (displaced sphere halves with noise-driven gyri). If generation is tried, the only local option is SD(XL)-Turbo → SF3D on CPU, used for rough props. TRELLIS.2 via a ZeroGPU Space is the quality fallback for one or two hero meshes, with Matthew's go-ahead to use an external service.

### Cited Findings
- TRELLIS.2 is the quality leader, but needs 24 GB of NVIDIA VRAM — [microsoft/TRELLIS.2](https://github.com/microsoft/TRELLIS.2)
- The CPU-capable models (SF3D, TripoSR) output a single GLB with baked texture from one image — [SF3D](https://github.com/Stability-AI/stable-fast-3d); [TripoSR](https://github.com/VAST-AI-Research/TripoSR)
- Hunyuan's licence would bar using outputs in the EU, UK and South Korea, and requires "machine generated" labelling in public contexts — [Hunyuan3D-2 LICENSE](https://github.com/Tencent-Hunyuan/Hunyuan3D-2/blob/main/LICENSE)

### Inferences
- **Small houses:** use procedural modelling (boxes, prism roofs, extruded windows). It gives consistent style, tiny file size and animatable parts. Generative output would have messy topology and baked lighting.
- **Head / sleeping man:** a stylised low-poly or clay look can be built procedurally (sphere and capsule head, closed-eye arcs, pillow, blanket) or taken from an open base mesh (e.g. MakeHuman, CC0 outputs). SF3D from a clean side-view illustration is worth one try. Expect a blobby back of the head and no rig.
- **Brain:** generative models struggle with the fine gyri. Open anatomical brain meshes (e.g. NIH 3D Print Exchange, BodyParts3D CC-BY-SA) or a procedural noise-displaced shape are better. The licence of a specific mesh must be checked.
- Any generated GLB will need decimation or remesh and material replacement to match a stylised flat-shaded look, which removes much of the time saved.

### Gaps
- No side-by-side test of SF3D vs procedural output for these specific subjects was found. Licences and availability of specific open brain and head meshes were not researched (another researcher's scope). The open-mesh names above come from general knowledge and are not verified here.
