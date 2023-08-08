import { Wave } from '../../../../../class/sound/Wave.js';

export function waves() {
	const waves = [];

	const framesPerBar = 320;
	const tonic = 62;

	waves[0] = new Wave('pulse');
	waves[0].setDuty(2);
	waves[0].setGain(1);
	waves[0].setEnvelopeEnabled(true);
	waves[0].setEnvelopePeriod(15);
	waves[0].setEnvelopeLoop(false);
	waves[0].setSweepEnabled(true);
	waves[0].setSweepPeriod(1);
	waves[0].setSweepAmount(7);
	waves[0].noteOn(framesPerBar / 4, 69 - 12);

	return waves;
}
