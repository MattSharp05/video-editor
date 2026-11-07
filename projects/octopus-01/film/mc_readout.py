# motion_check readout without a bar film (cloud: bar renders are git-ignored); compare with recorded bars:
# Grand Canyon 01 median 11 movers/s, Lightsaber 01 median 20. usage: python mc_readout.py RENDER.mp4
import sys, numpy as np
sys.argv = sys.argv[:2]
import motion_check as mc
R = np.array(mc.readout(sys.argv[1]))
print('seconds', len(R), 'movers median', np.median(R[:, 1]), 'p25', np.percentile(R[:, 1], 25), '<=2 movers', round(float(np.mean(R[:, 1] <= 2)) * 100), '%')
low = [i for i, r in enumerate(R) if r[1] < 6]
print('seconds with < 6 movers:', low)
print(' '.join(f'{i}:{int(r[1])}' for i, r in enumerate(R)))
