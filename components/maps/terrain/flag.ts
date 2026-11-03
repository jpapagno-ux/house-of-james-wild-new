// The 3D terrain pilot flag. next.config.ts sets NEXT_PUBLIC_TERRAIN_PILOT at build: "true" on Vercel preview
// deployments, "false" in production unless James sets the variable to "true" there (his approval).
export const terrainPilotOn = () => process.env.NEXT_PUBLIC_TERRAIN_PILOT === "true";
