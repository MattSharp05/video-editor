# AI image 01: research (fresh research agent, 2026-11-07)

Opened: Alammar Illustrated Stable Diffusion; SD v1-4 model card (CompVis/HF); Rombach 2022 (arXiv 2112.10752);
Ho 2020 DDPM (2006.11239); Ho & Salimans CFG (2207.12598); LAION-5B (2210.08402); Carlini 2023 (2301.13188);
OpenAI 4o native image generation system card addendum (Mar 2025). Search-only: Google MobileDiffusion blog/paper.

Chain: prompt -> tokens -> text encoder numbers (SD1.x: CLIP ViT-L/14, 77 slots x 768 numbers) -> start from random
noise -> trained network (U-Net / transformer) predicts the noise, steered by the text (cross-attention); part removed
-> repeat (SD card examples 50 steps; 20-50 typical; distilled 1-8) -> works on a small latent grid (64x64x4 for 512x512),
VAE decoder makes full pixels once at the end -> trained by adding noise to captioned images and learning to predict it
(LAION-5B 5.85 B pairs; SD trained on LAION-2B(en) subsets; ~150,000 A100 GPU-hours).
CFG: guess with and without the prompt, push toward the difference.

Myths: "picks pixels one at a time" false for diffusion (whole picture each step, coarse to fine); "collage of photos"
false as mechanism (no picture database, learned weights), but memorisation of heavily duplicated images happens
(Carlini: ~100 near-copies from ~175 M attempts) -> don't say "never copies". 4o image generation is autoregressive
(OpenAI addendum) -> say "most popular image generators" / "many", not "all".
Safe: "starts with TV static and cleans it up step by step, guided by your words" (static is a fair visual stand-in
for the latent). "Practised on billions of pictures with captions: add static, then guess the static."
