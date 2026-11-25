import {Config} from '@remotion/cli/config';
Config.setChromiumOpenGlRenderer('swangle');
Config.setConcurrency(4);
Config.setDelayRenderTimeoutInMilliseconds(120000);
