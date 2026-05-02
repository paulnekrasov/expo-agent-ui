import * as child_process from "child_process";

export function runMaestroFlow(
  yamlPath: string,
  options?: { device?: string }
): { success: boolean; error?: string; output?: string } {
  try {
    child_process.execSync("maestro --version", { stdio: "pipe" });
  } catch {
    return {
      success: false,
      error:
        "MAESTRO_UNAVAILABLE: Maestro CLI is not installed. Install with: curl -Ls \"https://get.maestro.mobile.dev\" | bash"
    };
  }

  try {
    const deviceFlag = options?.device ? ` --device ${options.device}` : "";
    const output = child_process.execSync(
      `maestro test ${yamlPath}${deviceFlag}`,
      {
        encoding: "utf8",
        timeout: 120000
      }
    );
    return { success: true, output };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return { success: false, error: `Maestro run failed: ${msg}` };
  }
}
