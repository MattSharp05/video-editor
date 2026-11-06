import path from 'node:path';
import {Config} from '@remotion/cli/config';
Config.setChromiumOpenGlRenderer('swangle');
Config.setConcurrency(4);
Config.setDelayRenderTimeoutInMilliseconds(120000);
// the water kit lives in the skill (.claude/skills/animated-video/templates/parts/src/kit/water), outside this project:
// resolve its `three` / `react` imports from this project's packages so there is one copy of each
Config.overrideWebpackConfig((c) => ({...c, resolve: {...c.resolve, modules: [path.resolve(process.cwd(), 'node_modules'), 'node_modules']}}));
