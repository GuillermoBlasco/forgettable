
import { configureBotHooks } from "./botHooks";
import { telegraf } from "./providers";


configureBotHooks(telegraf);

telegraf.launch();

// Enable graceful stop
process.once("SIGINT", () => telegraf.stop("SIGINT"));
process.once("SIGTERM", () => telegraf.stop("SIGTERM"));
