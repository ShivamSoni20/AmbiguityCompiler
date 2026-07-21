import { z } from "zod";

export const verificationArtifactSchema = z
  .object({
    framework: z.literal("vitest"),
    target: z.literal("monthly-export"),
    contract: z.literal("A"),
    criteria: z.array(z.literal("AC1")).length(1),
    exitCode: z.number().int().min(0).max(255),
    passed: z.number().int().min(0),
    failed: z.number().int().min(0),
    durationMs: z.number().int().min(0),
    patchHash: z.string().regex(/^sha256:[a-f0-9]{64}$/),
  })
  .strict();

export type VerificationArtifact = z.infer<typeof verificationArtifactSchema>;
