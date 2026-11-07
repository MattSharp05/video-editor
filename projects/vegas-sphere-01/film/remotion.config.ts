import {Config} from '@remotion/cli/config';
Config.setChromiumOpenGlRenderer('swangle');
Config.setConcurrency(3);
Config.setDelayRenderTimeoutInMilliseconds(120000);
