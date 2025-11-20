import React, { useEffect, useRef, useState, useCallback } from 'react';
import './BrainwaveGenerator.css';

interface BrainwaveGeneratorProps {
  onBack?: () => void;
}

const TABS = 5;
const FCARMIN = 27.5;
const FMODMIN = 0.1;
const OCTCAR = 9;
const OCTMOD = 10;

interface GeneratorState {
  carrier: number;
  mod: number;
  isochronic: number;
  binaural: number;
  bilateral: number;
  fm: number;
  level: number;
  noise: number;
}

export const BrainwaveGenerator: React.FC<BrainwaveGeneratorProps> = ({ onBack }) => {
  const [currentGen, setCurrentGen] = useState(0);
  const [multiEdit, setMultiEdit] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [message, setMessage] = useState('Interactive Text Display');
  const [navOpen, setNavOpen] = useState(false);
  const [warningOpen, setWarningOpen] = useState(false);
  const [isSuspended, setIsSuspended] = useState(false);

  const contextRef = useRef<AudioContext | null>(null);
  const generatorsRef = useRef<GeneratorState[]>([
    { carrier: 220, mod: 1, isochronic: 50, binaural: 100, bilateral: 0, fm: 0, level: 50, noise: 0 },
    { carrier: 30, mod: 0.5, isochronic: 100, binaural: 100, bilateral: 0, fm: 0, level: 0, noise: 0 },
    { carrier: 150, mod: 1.95, isochronic: 0, binaural: 100, bilateral: 0, fm: 0, level: 0, noise: 0 },
    { carrier: 432, mod: 3, isochronic: 0, binaural: 0, bilateral: 100, fm: 0, level: 0, noise: 0 },
    { carrier: 9000, mod: 0.2, isochronic: 100, binaural: 100, bilateral: 100, fm: 100, level: 0, noise: 0 },
  ]);

  const audioNodesRef = useRef<{
    oscL: OscillatorNode[];
    oscR: OscillatorNode[];
    noiseL: AudioBufferSourceNode[];
    noiseR: AudioBufferSourceNode[];
    lfo: OscillatorNode[];
    lfoHalf: OscillatorNode[];
    gainL: GainNode[];
    gainR: GainNode[];
    merger: ChannelMergerNode[];
    gainI: GainNode[];
    bilatGain: GainNode[];
    noiseGainL: GainNode[];
    noiseGainR: GainNode[];
    noiseGainRL: GainNode[];
    noiseGainRR: GainNode[];
    filterL: BiquadFilterNode[];
    filterR: BiquadFilterNode[];
    oscGainL: GainNode[];
    oscGainR: GainNode[];
    bilatInvertedGain: GainNode[];
    lfoGain: GainNode[];
    fmGain: GainNode[];
    filterGain: GainNode[];
    gainGlobal: GainNode[];
  } | null>(null);

  const msgTimerRef = useRef<NodeJS.Timeout | null>(null);

  const showMessage = useCallback((txt: string) => {
    setMessage(txt);
    if (msgTimerRef.current) {
      clearTimeout(msgTimerRef.current);
    }
    msgTimerRef.current = setTimeout(() => {
      setMessage("<b class='mod'>Scroll down</b> for more instructions...");
    }, 5000);
  }, []);

  const webAudioContextCheck = useCallback(() => {
    if (contextRef.current && contextRef.current.state === 'suspended') {
      setIsSuspended(true);
      setWarningOpen(true);
    }
  }, []);

  const resumeContext = useCallback(() => {
    if (contextRef.current) {
      contextRef.current.resume();
      setIsSuspended(false);
      setWarningOpen(false);
    }
  }, []);

  const initWebAudio = useCallback(() => {
    const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) {
      alert('Web Audio API is missing. To enjoy Brainwave Generator, please use a recent version of Chrome, Edge, Safari or Firefox.');
      return;
    }

    const context = new AudioContextClass();
    contextRef.current = context;

    const generators = generatorsRef.current;
    const nodes: typeof audioNodesRef.current = {
      oscL: [],
      oscR: [],
      noiseL: [],
      noiseR: [],
      lfo: [],
      lfoHalf: [],
      gainL: [],
      gainR: [],
      merger: [],
      gainI: [],
      bilatGain: [],
      noiseGainL: [],
      noiseGainR: [],
      noiseGainRL: [],
      noiseGainRR: [],
      filterL: [],
      filterR: [],
      oscGainL: [],
      oscGainR: [],
      bilatInvertedGain: [],
      lfoGain: [],
      fmGain: [],
      filterGain: [],
      gainGlobal: [],
    };

    for (let t = 0; t < TABS; t++) {
      const gen = generators[t];

      // Creating oscillators
      const oscL = context.createOscillator();
      oscL.type = 'sine';
      oscL.frequency.value = gen.carrier + gen.mod / 2 * gen.binaural / 100;

      const oscR = context.createOscillator();
      oscR.type = 'sine';
      oscR.frequency.value = gen.carrier - gen.mod / 2 * gen.binaural / 100;

      const lfo = context.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = gen.mod;

      const lfoHalf = context.createOscillator();
      lfoHalf.type = 'sine';
      lfoHalf.frequency.value = gen.mod / 2;

      // Noises
      const bufferSize = 6 * context.sampleRate;
      const noiseBuffer = context.createBuffer(1, bufferSize, context.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = 3 * (Math.random() * 2 - 1);
      }

      const noiseL = context.createBufferSource();
      noiseL.buffer = noiseBuffer;
      noiseL.loop = true;

      const noiseR = context.createBufferSource();
      noiseR.buffer = noiseBuffer;
      noiseR.loop = true;

      // Filters for the noise
      const filterR = context.createBiquadFilter();
      const filterL = context.createBiquadFilter();
      filterR.type = 'bandpass';
      filterR.frequency.value = gen.carrier;
      filterR.Q.value = 2;
      filterL.type = 'bandpass';
      filterL.frequency.value = gen.carrier;
      filterL.Q.value = 2;

      // Tone+noise
      const noiseGainL = context.createGain();
      const noiseGainR = context.createGain();
      const noiseGainRL = context.createGain();
      const noiseGainRR = context.createGain();
      const oscGainL = context.createGain();
      const oscGainR = context.createGain();

      noiseGainL.gain.value = gen.noise / 100;
      noiseGainR.gain.value = gen.noise / 100;
      oscGainL.gain.value = 1 - gen.noise / 100;
      oscGainR.gain.value = 1 - gen.noise / 100;
      noiseGainRL.gain.value = 0;
      noiseGainRR.gain.value = 1;

      noiseL.connect(noiseGainL);
      noiseL.connect(noiseGainRL);
      noiseR.connect(noiseGainRR);
      noiseGainRR.connect(noiseGainR);
      noiseGainRL.connect(noiseGainR);
      noiseGainL.connect(filterL);
      noiseGainR.connect(filterR);
      oscL.connect(oscGainL);
      oscR.connect(oscGainR);

      // Creating gain nodes
      const bilatGain = context.createGain();
      bilatGain.gain.value = gen.bilateral / 100 * 0.25;

      const bilatInvertedGain = context.createGain();
      bilatInvertedGain.gain.value = -1;
      bilatGain.connect(bilatInvertedGain);
      lfoHalf.connect(bilatGain);

      const lfoGain = context.createGain();
      lfo.connect(lfoGain);

      const fmGain = context.createGain();
      fmGain.gain.value = gen.fm / 100 * gen.carrier;

      const filterGain = context.createGain();
      filterGain.gain.value = gen.fm / 150 * gen.carrier;

      lfo.connect(fmGain);
      lfo.connect(filterGain);
      fmGain.connect(oscL.frequency);
      fmGain.connect(oscR.frequency);
      filterGain.connect(filterL.frequency);
      filterGain.connect(filterR.frequency);

      const gainL = context.createGain();
      const gainR = context.createGain();
      const gainI = context.createGain();

      gainL.gain.value = 0.25;
      gainR.gain.value = 0.25;
      bilatInvertedGain.connect(gainL.gain);
      bilatGain.connect(gainR.gain);

      const fmax = Math.pow(2, OCTCAR) * FCARMIN;
      gainI.gain.value = 0.5 * (1 - 0.5 * gen.carrier / fmax) * (1 - 0.6 * gen.carrier / fmax);
      lfoGain.gain.value = gen.isochronic / 100 * gainI.gain.value;

      oscGainL.connect(gainL);
      oscGainR.connect(gainR);
      filterL.connect(gainL);
      filterR.connect(gainR);

      const merger = context.createChannelMerger(2);
      merger.connect(gainI);
      gainL.connect(merger, 0, 0);
      gainR.connect(merger, 0, 1);

      const gainGlobal = context.createGain();
      gainGlobal.gain.value = gen.level * gen.level / 10000;
      gainI.connect(gainGlobal);
      gainGlobal.connect(context.destination);

      // Store nodes
      nodes.oscL.push(oscL);
      nodes.oscR.push(oscR);
      nodes.noiseL.push(noiseL);
      nodes.noiseR.push(noiseR);
      nodes.lfo.push(lfo);
      nodes.lfoHalf.push(lfoHalf);
      nodes.gainL.push(gainL);
      nodes.gainR.push(gainR);
      nodes.merger.push(merger);
      nodes.gainI.push(gainI);
      nodes.bilatGain.push(bilatGain);
      nodes.noiseGainL.push(noiseGainL);
      nodes.noiseGainR.push(noiseGainR);
      nodes.noiseGainRL.push(noiseGainRL);
      nodes.noiseGainRR.push(noiseGainRR);
      nodes.filterL.push(filterL);
      nodes.filterR.push(filterR);
      nodes.oscGainL.push(oscGainL);
      nodes.oscGainR.push(oscGainR);
      nodes.bilatInvertedGain.push(bilatInvertedGain);
      nodes.lfoGain.push(lfoGain);
      nodes.fmGain.push(fmGain);
      nodes.filterGain.push(filterGain);
      nodes.gainGlobal.push(gainGlobal);

      // Start everything
      lfo.start();
      lfoHalf.start();
      oscL.start();
      oscR.start();
      noiseR.start(0, 3);
      noiseL.start();
    }

    audioNodesRef.current = nodes;
  }, []);

  useEffect(() => {
    initWebAudio();
    setTimeout(() => {
      webAudioContextCheck();
    }, 500);

    return () => {
      if (msgTimerRef.current) {
        clearTimeout(msgTimerRef.current);
      }
      if (contextRef.current) {
        contextRef.current.close();
      }
    };
  }, [initWebAudio, webAudioContextCheck]);

  const updateGenerator = useCallback((index: number, updates: Partial<GeneratorState>, skipMuteCheck = false) => {
    const generators = generatorsRef.current;
    generators[index] = { ...generators[index], ...updates };
    
    if (!audioNodesRef.current) return;
    const nodes = audioNodesRef.current;
    const gen = generators[index];

    // Update oscillator frequencies
    nodes.oscL[index].frequency.value = gen.carrier + gen.mod / 2 * gen.binaural / 100;
    nodes.oscR[index].frequency.value = gen.carrier - gen.mod / 2 * gen.binaural / 100;

    // Update LFO frequencies
    const cT = contextRef.current?.currentTime || 0;
    nodes.lfo[index].frequency.setTargetAtTime(gen.mod, cT, 0.001);
    nodes.lfoHalf[index].frequency.setTargetAtTime(gen.mod / 2, cT, 0.001);

    // Update filters
    nodes.filterL[index].frequency.value = gen.carrier;
    nodes.filterR[index].frequency.value = gen.carrier;

    // Update FM
    nodes.fmGain[index].gain.value = gen.fm / 100 * gen.carrier;
    nodes.filterGain[index].gain.value = gen.fm / 150 * gen.carrier;

    // Update binaural
    nodes.noiseGainRR[index].gain.value = gen.binaural / 100;
    nodes.noiseGainRL[index].gain.value = 1 - gen.binaural / 100;

    // Update bilateral
    nodes.bilatGain[index].gain.value = gen.bilateral / 100 * 0.25;

    // Update isochronic
    const fmax = Math.pow(2, OCTCAR) * FCARMIN;
    nodes.gainI[index].gain.value = 0.5 * (1 - 0.5 * gen.carrier / fmax) * (1 - 0.6 * gen.carrier / fmax);
    nodes.lfoGain[index].gain.value = gen.isochronic / 100 * nodes.gainI[index].gain.value;

    // Update noise
    nodes.noiseGainL[index].gain.value = gen.noise / 100;
    nodes.noiseGainR[index].gain.value = gen.noise / 100;
    nodes.oscGainL[index].gain.value = 1 - gen.noise / 100;
    nodes.oscGainR[index].gain.value = 1 - gen.noise / 100;

    // Update level (only if not skipping mute check)
    if (!skipMuteCheck) {
      const levelValue = isMuted ? 0 : gen.level * gen.level / 10000;
      nodes.gainGlobal[index].gain.value = levelValue;
    }
  }, [isMuted]);

  const setCarrier = useCallback((val: number, g?: number) => {
    const genIndex = g !== undefined ? g : currentGen;
    if (multiEdit) {
      for (let t = 0; t < TABS; t++) {
        updateGenerator(t, { carrier: val });
      }
    } else {
      updateGenerator(genIndex, { carrier: val });
    }
    if (val > 1000) {
      showMessage('A high as you can hear!');
    } else {
      showMessage('Make it low, but still audible');
    }
  }, [currentGen, multiEdit, updateGenerator, showMessage]);

  const setMod = useCallback((val: number, g?: number) => {
    const genIndex = g !== undefined ? g : currentGen;
    if (multiEdit) {
      for (let t = 0; t < TABS; t++) {
        updateGenerator(t, { mod: val });
      }
    } else {
      updateGenerator(genIndex, { mod: val });
    }
    let text = '';
    if (val < 0.5) text = 'Ultra-Low Delta';
    else if (val > 0.5) text = 'Delta';
    if (val > 4) text = 'Theta';
    if (val > 8) text = 'Alpha';
    if (val > 12) text = 'Beta';
    if (val > 30) text = 'Gamma';
    if (val > 60) text = 'High Gamma';
    showMessage(text);
  }, [currentGen, multiEdit, updateGenerator, showMessage]);

  const setBinaural = useCallback((val: number, g?: number) => {
    const genIndex = g !== undefined ? g : currentGen;
    if (multiEdit) {
      for (let t = 0; t < TABS; t++) {
        updateGenerator(t, { binaural: val });
      }
    } else {
      updateGenerator(genIndex, { binaural: val });
    }
    showMessage('Best for Headphones');
  }, [currentGen, multiEdit, updateGenerator, showMessage]);

  const setBilateral = useCallback((val: number, g?: number) => {
    const genIndex = g !== undefined ? g : currentGen;
    if (multiEdit) {
      for (let t = 0; t < TABS; t++) {
        updateGenerator(t, { bilateral: val });
      }
    } else {
      updateGenerator(genIndex, { bilateral: val });
    }
    showMessage('For Stereo Speakers and Headphones');
  }, [currentGen, multiEdit, updateGenerator, showMessage]);

  const setIsochronic = useCallback((val: number, g?: number) => {
    const genIndex = g !== undefined ? g : currentGen;
    if (multiEdit) {
      for (let t = 0; t < TABS; t++) {
        updateGenerator(t, { isochronic: val });
      }
    } else {
      updateGenerator(genIndex, { isochronic: val });
    }
    showMessage('Best for Single Speaker use');
  }, [currentGen, multiEdit, updateGenerator, showMessage]);

  const setFm = useCallback((val: number, g?: number) => {
    const genIndex = g !== undefined ? g : currentGen;
    if (multiEdit) {
      for (let t = 0; t < TABS; t++) {
        updateGenerator(t, { fm: val });
      }
    } else {
      updateGenerator(genIndex, { fm: val });
    }
    showMessage('Works with everything!');
  }, [currentGen, multiEdit, updateGenerator, showMessage]);

  const setNoise = useCallback((val: number, g?: number) => {
    const genIndex = g !== undefined ? g : currentGen;
    if (multiEdit) {
      for (let t = 0; t < TABS; t++) {
        updateGenerator(t, { noise: val });
      }
    } else {
      updateGenerator(genIndex, { noise: val });
    }
    showMessage('Works with everything!');
  }, [currentGen, multiEdit, updateGenerator, showMessage]);

  const setLevel = useCallback((val: number, g?: number) => {
    const genIndex = g !== undefined ? g : currentGen;
    if (multiEdit) {
      for (let t = 0; t < TABS; t++) {
        updateGenerator(t, { level: val });
      }
    } else {
      updateGenerator(genIndex, { level: val });
    }
    if (val > 0.5) {
      showMessage('A loud as you want, but not louder!');
    } else {
      showMessage('As quiet as you want, but audible');
    }
  }, [currentGen, multiEdit, updateGenerator, showMessage]);

  const muteOutput = useCallback(() => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    const generators = generatorsRef.current;
    if (!audioNodesRef.current) return;
    const nodes = audioNodesRef.current;

    for (let t = 0; t < TABS; t++) {
      const levelValue = newMutedState ? 0 : generators[t].level * generators[t].level / 10000;
      nodes.gainGlobal[t].gain.value = levelValue;
    }
  }, [isMuted]);

  const newSet = useCallback((setting: string) => {
    const generators = generatorsRef.current;
    const start = multiEdit ? 0 : currentGen;
    const end = multiEdit ? TABS : currentGen + 1;

    for (let t = start; t < end; t++) {
      let mod = generators[t].mod;
      let car = generators[t].carrier;
      let iso = generators[t].isochronic;
      let bin = generators[t].binaural;
      let bil = generators[t].bilateral;
      let fm = generators[t].fm;
      let noi = generators[t].noise;

      switch (setting) {
        case 'anything':
          mod = Math.pow(2, Math.random() * OCTMOD) * FMODMIN;
          car = Math.pow(2, Math.random() * Math.random() * OCTCAR) * FCARMIN;
          iso = Math.floor(Math.random() * 100);
          bin = Math.floor(Math.random() * 100);
          bil = Math.floor(Math.random() * 100);
          fm = Math.floor(Math.random() * 100);
          noi = Math.floor(Math.random() * 100);
          break;
        case 'sleep':
          mod = (2 - 0.25) * Math.random() + 0.25;
          break;
        case 'dream':
          mod = (6 - 2) * Math.random() + 2;
          break;
        case 'creative':
          mod = (8 - 6) * Math.random() + 6;
          break;
        case 'relax':
          mod = (14 - 8) * Math.random() + 8;
          break;
        case 'productivity':
          mod = (20 - 14) * Math.random() + 14;
          break;
        case 'alert':
          mod = (60 - 20) * Math.random() + 20;
          break;
        case 'headphones':
          car = (300 - 75) * Math.random() * Math.random() + 75;
          bin = 100;
          bil = Math.floor(Math.random() * 50);
          iso = Math.floor(Math.random() * 25);
          fm = 0;
          break;
        case 'mobile':
          car = (600 - 200) * Math.random() + 200;
          bin = 0;
          bil = 0;
          iso = 100;
          fm = Math.floor(Math.max(100 - (car / 2 - 100), 0));
          break;
        case 'speaker1':
          car = (300 - 75) * Math.random() + 75;
          bin = 0;
          bil = 0;
          iso = 100;
          fm = Math.floor(Math.max(175 - car, 0));
          break;
        case 'speaker2':
          car = (300 - 75) * Math.random() + 75;
          bin = Math.floor(Math.random() * 100);
          bil = 100;
          iso = Math.floor(Math.random() * 50);
          fm = Math.floor(Math.max(175 - car, 0));
          break;
        case 'sub':
          car = (100 - 15) * Math.random() + 15;
          bin = 0;
          bil = 0;
          iso = 100;
          fm = Math.floor(Math.max(160 - 4 * car, 0));
          break;
        case 'hearing':
          car = (14000 - 8000) * Math.random() + 8000;
          mod = (30 - 1) * Math.random() + 1;
          bin = 0;
          bil = Math.floor(Math.random() * 100);
          iso = Math.floor(Math.random() * 100);
          fm = 100;
          break;
      }

      updateGenerator(t, { mod, carrier: car, isochronic: iso, binaural: bin, bilateral: bil, fm, noise: noi });
    }
  }, [currentGen, multiEdit, updateGenerator]);

  const currentGenState = generatorsRef.current[currentGen];

  return (
    <div className="brainwave-generator">
      <div className="background"></div>

      <div id="myNav" className={`overlayNav ${navOpen ? 'open' : ''}`}>
        <div id="menuLinks" className="navCentered">
          <p><div className="logo" style={{ fontSize: '2rem', fontWeight: 'bold', color: '#C0C0D0' }}>🧠 BrainAural</div></p>
          <div className="navLink" onClick={() => { setNavOpen(false); document.getElementById('welcome')?.scrollIntoView(); }}>Introduction</div>
          <div className="navLink" onClick={() => { setNavOpen(false); document.getElementById('brainwaves')?.scrollIntoView(); }}>Brainwaves</div>
          <div className="navLink" onClick={() => { setNavOpen(false); document.getElementById('entrainment')?.scrollIntoView(); }}>Entrainment</div>
          <div className="navLink" onClick={() => { setNavOpen(false); window.open('?render=1', '_blank'); }}>Audio File Download</div>
          <div className="navLink" onClick={() => { setNavOpen(false); document.getElementById('player')?.scrollIntoView(); }}>Back to Player</div>
        </div>
      </div>

      <div id="myWarning" className={`overlayWarning ${warningOpen ? 'open' : ''}`} onClick={resumeContext}>
        <div id="warning" className="navCentered">
          <p>Best experienced with headphones!</p>
          <p><span style={{ fontSize: '4rem', cursor: 'pointer' }}>🎧</span></p>
          <p>Click (Tap) to dismiss this message<br />- or -<br />Enable Auto-Play Sound for brainaural.com in your browser settings</p>
        </div>
      </div>

      <div id="hamburger" className={`upperLeft show ${navOpen ? 'close' : ''}`} onClick={() => setNavOpen(!navOpen)}></div>
      <div className="anchor" id="player"></div>

      <div className="tile1">
        <a href="/" className="nounderline">
          <div id="title">
            <span className="black">brain</span><span className="white">aural</span><span className="reg">&reg;</span>
          </div>
        </a>
        <div id="subtitle"><span className="white">Ultimate</span> <span className="black">Brainwaves</span></div>

        <div className="ctrSection">
          <button className={`ctrlImg ${isMuted ? 'superactive' : ''}`} onClick={muteOutput} onMouseEnter={() => showMessage('Muting the Audio Output')} title="Mute">🔇</button>
          <button className="ctrlImg" onClick={() => window.prompt('This URL embeds all your settings. Press [Ctrl+C] to Copy', window.location.href)} onMouseEnter={() => showMessage('Save or Share current settings in a custom URL')} title="Link">🔗</button>
          <button className="ctrlImg" onClick={() => newSet('anything')} onMouseEnter={() => showMessage('Anything can happen! (Randomize)')} title="Random">🎲</button>
          <button className="ctrlImg" onClick={() => window.open('?render=1', '_blank')} onMouseEnter={() => showMessage('Generate a high quality standalone audio file')} title="WAV">💾</button>
        </div>

        <div className="group black">
          <div className="sliderGroup">
            <span className="label black">brainwave</span>
            <input type="range" min="0" max={OCTMOD} step="0.01" value={Math.log2(currentGenState.mod / FMODMIN)} onChange={(e) => setMod(Math.pow(2, parseFloat(e.target.value)) * FMODMIN)} className="slider" id="mod" />
            <input type="text" value={`${Math.round(currentGenState.mod * 100) / 100}Hz`} readOnly className="valueInput" id="modval" />
          </div>
        </div>

        <span className="black">&darr;</span>

        <div className="group white">
          <div className="sliderGroup">
            <span className="label black">a-mod</span>
            <input type="range" min="0" max="100" step="1" value={currentGenState.isochronic} onChange={(e) => setIsochronic(parseInt(e.target.value))} className="slider" id="isochronic" />
            <input type="text" value={`${currentGenState.isochronic}%`} readOnly className="valueInput" id="isoval" />
          </div>
          <div className="sliderGroup">
            <span className="label black">binaural</span>
            <input type="range" min="0" max="100" step="1" value={currentGenState.binaural} onChange={(e) => setBinaural(parseInt(e.target.value))} className="slider" id="binaural" />
            <input type="text" value={`${currentGenState.binaural}%`} readOnly className="valueInput" id="binval" />
          </div>
          <div className="sliderGroup">
            <span className="label black">stereo</span>
            <input type="range" min="0" max="100" step="1" value={currentGenState.bilateral} onChange={(e) => setBilateral(parseInt(e.target.value))} className="slider" id="bilateral" />
            <input type="text" value={`${currentGenState.bilateral}%`} readOnly className="valueInput" id="bilval" />
          </div>
          <div className="sliderGroup">
            <span className="label black">f-mod</span>
            <input type="range" min="0" max="100" step="1" value={currentGenState.fm} onChange={(e) => setFm(parseInt(e.target.value))} className="slider" id="fm" />
            <input type="text" value={`${currentGenState.fm}%`} readOnly className="valueInput" id="fmval" />
          </div>
        </div>

        <span className="white">&uarr;</span>

        <div className="group white">
          <div className="sliderGroup">
            <span className="label white">carrier</span>
            <input type="range" min="0" max={OCTCAR} step="0.01" value={Math.log2(currentGenState.carrier / FCARMIN)} onChange={(e) => setCarrier(Math.pow(2, parseFloat(e.target.value)) * FCARMIN)} className="slider" id="carrier" />
            <input type="text" value={`${Math.round(currentGenState.carrier)}Hz`} readOnly className="valueInput" id="carval" />
          </div>
          <div className="sliderGroup">
            <span className="label white">noise</span>
            <input type="range" min="0" max="100" step="1" value={currentGenState.noise} onChange={(e) => setNoise(parseInt(e.target.value))} className="slider" id="noise" />
            <input type="text" value={`${currentGenState.noise}%`} readOnly className="valueInput" id="noiseval" />
          </div>
        </div>

        <div className="group white">
          <div className="sliderGroup">
            <span className="label black">mix level</span>
            <input type="range" min="0" max="100" step="1" value={currentGenState.level} onChange={(e) => setLevel(parseInt(e.target.value))} className="slider" id="level" />
            <input type="text" value={`${currentGenState.level}%`} readOnly className="valueInput" id="levval" />
          </div>
        </div>

        <div className="ctrSection">
          {[0, 1, 2, 3, 4].map((i) => (
            <button key={i} className={`selImg ${currentGen === i && !multiEdit ? 'active' : ''}`} onClick={() => { setCurrentGen(i); setMultiEdit(false); }} onMouseEnter={() => showMessage(`Edit Generator ${i + 1}`)} title={`Gen ${i + 1}`}>{i + 1}</button>
          ))}
          <button className={`selImg ${multiEdit ? 'active' : ''}`} onClick={() => setMultiEdit(true)} onMouseEnter={() => showMessage('Multi Edit')} title="Multi">M</button>
        </div>

        <div id="msg" dangerouslySetInnerHTML={{ __html: message }}></div>

        <div className="ctrSection">
          <button className="ctrlImg" onClick={() => newSet('sleep')} onMouseEnter={() => showMessage('Brainwaves for <b class=\'mod\'>Deep Sleep</b>')} title="Sleep">😴</button>
          <button className="ctrlImg" onClick={() => newSet('dream')} onMouseEnter={() => showMessage('Brainwaves for <b class=\'mod\'>Dream</b>')} title="Dream">💭</button>
          <button className="ctrlImg" onClick={() => newSet('creative')} onMouseEnter={() => showMessage('Brainwaves for <b class=\'mod\'>Creativity</b>')} title="Creative">🎨</button>
          <button className="ctrlImg" onClick={() => newSet('relax')} onMouseEnter={() => showMessage('Brainwaves for <b class=\'mod\'>Relaxation</b>')} title="Relax">🧘</button>
          <button className="ctrlImg" onClick={() => newSet('productivity')} onMouseEnter={() => showMessage('Brainwaves for <b class=\'mod\'>Productivity</b>')} title="Productivity">⚡</button>
          <button className="ctrlImg" onClick={() => newSet('alert')} onMouseEnter={() => showMessage('Brainwaves for <b class=\'mod\'>Focus</b>')} title="Alert">🎯</button>
          <br />
          <button className="ctrlImg" onClick={() => newSet('headphones')} onMouseEnter={() => showMessage('Carrier & Mods for <b class=\'mod\'>Headphones</b>')} title="Headphones">🎧</button>
          <button className="ctrlImg" onClick={() => newSet('mobile')} onMouseEnter={() => showMessage('Carrier & Mods for <b class=\'mod\'>Miniature Speakers</b>')} title="Mobile">📱</button>
          <button className="ctrlImg" onClick={() => newSet('speaker1')} onMouseEnter={() => showMessage('Carrier & Mods for <b class=\'mod\'>Single Speakers</b>')} title="Speaker1">🔊</button>
          <button className="ctrlImg" onClick={() => newSet('speaker2')} onMouseEnter={() => showMessage('Carrier & Mods for <b class=\'mod\'>Sterophonic Speakers</b>')} title="Speaker2">🔊🔊</button>
          <button className="ctrlImg" onClick={() => newSet('sub')} onMouseEnter={() => showMessage('Carrier & Mods for <b class=\'mod\'>Subwoofer</b>')} title="Sub">🔉</button>
          <button className="ctrlImg" onClick={() => newSet('hearing')} onMouseEnter={() => showMessage('Retrain your <b class=\'mod\'>Hearing</b>!')} title="Hearing">👂</button>
        </div>
      </div>

      <div className="tile2">
        <div className="anchor" id="welcome"></div>
        <div className="section">
          <h1>Hack Your Mind: A Free and Personalized Brainwave Entrainment Sound Generator</h1>
          <p>With BrainAural®, you're getting access to one of the most advanced brainwave entrainment tools available online. The platform is designed to help you tap into the hidden potential of your subconscious mind. It's entirely free and gives you an opportunity to experiment and discover the power brainwave entrainement, but first, see if it works for you.</p>
          <p>At BrainAural®, we take a different approach compared to many other websites you may come across. While there are plenty of sites eager to sell you binaural beats and brainwave entrainment techniques, often with lofty promises of life-changing benefits, we believe in a more respectful and open way of exploring this fascinating field. Our platform is free to use and encourages you to experiment with brainwave entrainment at your own pace. We don't make grand promises. Instead, we offer a space for you to discover the potential power of brainwave entrainment for yourself, through self-experimentation. Feel free to explore, tweak settings, and find what resonates best with you. If you're pleased with your findings and wish to support the platform, you can buy a high-quality .wav file with your preferred settings, to enjoy on any mobile player wherever you go.</p>
          <p>Whether you're looking to improve your productivity with Beta waves, or induce deep sleep with Delta waves, BrainAural® offers tailored auditory stimuli to guide your brain falling into these specific frequency ranges. Enhance focus, facilitate relaxation, or achieve other desired mental states with a wide range of modulation techniques.</p>
          <blockquote>Don't let the simple interface fool you. This online generator offers a wide range of brainwave modulations. From binaural beats and isochronic tones to bilateral entrainment and modulated white noise, BrainAural® has got everything you need for advanced brainwave entrainment experimentation.</blockquote>
          <p>As the current beat plays in the background, we'll walk you through the basic and benefits of brainwave entrainment. Scroll down to find out how to influence your mental states and enhance your well-being using straightforward but effective sound patterns.</p>
          <blockquote>Before we get started, it's worth mentioning that BrainAural.com is committed to providing a secure and welcoming space for ever visitor. You won't find any intrusive ads or data collection practices here. Instead, we offer a clean, user-friendly environment where you can focus solely on your journey through the world of brainwave entrainment.<br /><br />You're welcome to listen as much as you like and come back whenever you want, all at no cost. This project stays afloat thanks to the ".wav" icon, where you can purchase high-quality audio files for either personal or even professional use.</blockquote>
          <h2>Tuning into Your Brain's Natural Frequencies: An Introduction</h2>
          <p>Brainwaves are real, not pseudo-science. Originating from the activity of neuron clusters in your brain, these electrical patterns fall into distinct categories based on their frequency and location. These categories are associated with various mental and physiological states like focus, relaxation, or sleep.</p>
          <p>Brainwave entrainment uses stimuli to facilitate the synchronization of your brain's frequency with a target frequency, making it easier to reach states like focus or relaxation. While different stimuli like visual cues can be employed, our platform specializes in auditory-based entrainment.</p>
          <blockquote>Brainwave frequencies are usually too low to be heard by the human ear. To make them audible, we use a unique method that includes a carrier frequency, which is then modulated with the target brainwave frequency. We offer four different modulation techniques: amplitude modulation (monaural beats), binaural beats, stereophonic panning (bilateral entrainment), and frequency modulation.</blockquote>
          <h2>From 4Hz Delta Waves for Sleep to 30Hz Beta Waves for Focus</h2>
          <p>Keen to explore brainwave frequencies? Here's how: First, select a target brainwave frequency, then choose an audible carrier frequency, and finally apply the modulation type you prefer.</p>
          <p><b>As you move from lower to higher frequencies (Hz), the mental and emotional experience tends to shift from a state of deep relaxation and sleep to one of increasing alertness and cognitive activity. Overall, the journey from low to high frequencies is like waking up, becoming more alert, and getting mentally active.</b></p>
          <blockquote>Don't worry if the sliders seem confusing at first, particularly if you're new to the world of brainwave entrainment. If you're unsure about which settings or modulation schemes to use and don't want to read through this entire page, just look for the icons at the bottom of the interface. These icons are crafted to help you effortlessly choose the best entrainment and carrier frequencies for your needs. Just click on them, and they'll apply the optimal settings for your desired results.</blockquote>
          <h2>Advanced Entrainment: Mixing Multiple Brainwave Frequencies</h2>
          <p>Want to explore even more? We offer the capability to mix up to five different brainwave frequencies enabling complex entrainment routines tailored to your needs. If you're new to the world of brainwave entrainment, we recommend starting with a single frequency though.</p>
        </div>

        <div className="anchor" id="brainwaves"></div>
        <div className="section">
          <h1 className="brw">Unveiling the Electrical Nature of the Brain</h1>
          <p>Many complex living organisms, including animals and plants, depend on electrochemical processes for various functions. Specifically for the human brain, neurons transmit information using electrochemical signals. While the electrical output of the brain is weak, it is detectable and can be measured accurately using specialized equipment like electroencephalograms (EEGs).</p>
          <h2>The Discovery of Alpha and Beta Waves</h2>
          <p>Hans Berger, the pioneer in this field, initiated these measurements roughly 100 years ago. Though Berger aimed to prove that brainwaves could be utilized for telepathy, he didn't succeed ;) However, he stumbled upon a groundbreaking discovery that shaped the future of brainwave entrainment.</p>
          <p>During his research, Berger identified dominant waves oscillating at around 10 cycles per second (or Hertz, Hz). Labeling them as "alpha" waves, these were the first of their kind to be observed. Subsequently, he discovered a different set of higher frequency waves, termed as "beta" waves. Berger noted that Alpha waves decreased during sleep, whereas Beta waves were prevalent during states of mental focus. These findings, later verified by numerous scientists, laid the foundation for understanding different mental states through brainwave activity.</p>
          <h2>Exploring the Spectrum: Understanding Frequencies and Their Effects</h2>
          <p>As science advanced, researchers have identified additional types of brainwaves. These have been classified based on their frequencies and their locations within the brain.</p>
          <p>Let's explore the main types, categorized by frequency, and see how they affect our mental well-being.</p>
          <h3>Delta Waves: The Slowest Frequencies for Deep Sleep</h3>
          <p><span style={{ float: 'left', marginRight: '15px', fontSize: '24px' }}>😴</span></p>
          <p>With frequencies below 4 Hz, Delta waves are the slowest type of brainwave. These waves are predominant during the deep, dreamless stages of sleep and are crucial for physical restoration. When delta waves are prevalent, it indicates that the brain is in a state of deep relaxation and unconsciousness. This is the stage where the body undergoes essential healing and recovery processes. Delta waves play a pivotal role in the body's restoration process, providing a range of benefits that contribute to physical health, emotional well-being, and cognitive functioning.</p>
          <h3>Theta Waves: The Twilight State Frequencies</h3>
          <p><span style={{ float: 'left', marginRight: '15px', fontSize: '24px' }}>💭</span></p>
          <p>Theta waves oscillate between 4 and 8 Hz and are prevalent during the early stages of sleep and are particularly important during the REM (Rapid Eye Movement) stage, when most vivid dreaming occurs. These waves are associated with relaxation, reduced consciousness, and drowsiness, serving as a transition from the wakeful state dominated by alpha and beta waves to the deeper sleep stages characterized by delta waves. The presence of theta waves is believed to facilitate several restorative processes in the body and mind. It is during these theta-dominated stages that the brain can work on consolidating memories, processing emotional experiences, and promoting mental restoration. The theta state is sometimes described as subconscious processing, as it allows the brain to sort and store experiences, which is crucial for learning and memory.</p>
          <h3>Alpha Waves: The Frequencies for Relaxation</h3>
          <p><span style={{ float: 'left', marginRight: '15px', fontSize: '24px' }}>🧘</span></p>
          <p>Falling within the 8 - 12 Hz range, Alpha waves were the first to be discovered by Hans Berger and are sometimes referred to as "Berger's waves." These waves are dominant when you're awake yet relaxed, such as during meditation or when your eyes are closed but you're not yet asleep. When your brain is producing alpha waves, you're likely in a state of flow, where time seems to pass quickly and you can generate new ideas more easily. This state is often linked to activities such as daydreaming, meditating, or taking a warm bath—times when you are relaxed but your mind is still active and not focused on the outside world. In such states, individuals often report increased creativity and problem-solving abilities.</p>
          <h3>Beta Waves: Frequencies for Active Thinking and Focus</h3>
          <p><span style={{ float: 'left', marginRight: '15px', fontSize: '24px' }}>⚡</span></p>
          <p>These brainwave frequencies typically range from 13 to 30 Hz and are prevalent during work, problem-solving, decision-making, and similar tasks that require cognitive engagement. These waves are most prevalent when you're fully awake and engaged in mental activities. Beta waves are often associated with active, analytical thought and are commonly present when you're awake and engaged in mental activities that require focus and concentration.</p>
          <h3>Gamma Waves: The Fastest Frequencies for Learning and Memory</h3>
          <p><span style={{ float: 'left', marginRight: '15px', fontSize: '24px' }}>🎯</span></p>
          <p>With frequencies above 30 Hz, Gamma waves are the fastest and occur in the higher cortical regions of the brain during activities like learning and retaining information. They are associated with higher-order cognitive functions and sensory perception. These brainwaves are thought to help synchronize activities across different areas of the brain, aiding in tasks that require quick thinking, focus, and problem-solving. High levels of gamma wave activity are often observed during tasks that require rapid processing of information and quick decision-making.</p>
        </div>

        <div className="section">
          <h1 className="brw">Beyond the Basics: The Complex Reality of Brain Frequencies</h1>
          <p>Understanding brainwave frequencies is essential for optimizing the effectiveness of brainwave entrainment. This knowledge helps you dial in the right modulator frequencies, whether you're using binaural beats, isochronic tones, or other types of auditory stimuli.</p>
          <p>Though it's convenient to classify brainwave frequencies into groups like Delta, Theta, Alpha, Beta, and Gamma, it's crucial to understand that this is a simplified lens on the brain's intricate workings. There are important nuances to consider; the story is more complex than these categories suggest.</p>
          <h2>No Single Frequency Dominance</h2>
          <p>Contrary to what one might assume, the brain doesn't operate on just one frequency range at any given moment. Multiple types of brainwaves can coexist, interact, and contribute to your overall mental state.</p>
          <h2>Overlapping Frequency Bands</h2>
          <p>The boundaries between these frequency categories are not rigid but rather overlap. For example, while a 9 Hz frequency is typically associated with an Alpha state, it's entirely possible that you could also be in a Theta state. Scientific research has shown varying frequency ranges for the same brainwave states, adding another layer of complexity to understanding these bands.</p>
          <h2>Individual Differences</h2>
          <p>Last but not least, every human brain is unique. This means that the frequency ranges and their associated mental states can differ from person to person.</p>
          <p>Given this individual variability, it's essential to take a personalized approach to brainwave entrainment. That's where a platform like BrainAural® comes in handy. Our brainwave entrainment generator adopts a flexible approach. While you can choose specific frequencies to target, the technology also allows for a mix of modulators and carriers, enabling a more nuanced entrainment experience that better reflects the brain's actual functioning.</p>
          <blockquote>Brainwave entrainment is not a one-size-fits-all experience due to individual variability. That's why BrainAural® is designed for flexibility, offering a wide range of frequencies and entrainment techniques, including binaural beats and isochronic tones. You can mix up to five different brainwave frequencies and modulation methods, allowing you to create a customized entrainment routine tailored to your specific needs. We highly recommend that you play around with the settings to find what aligns best with your needs. Your own experimentation is crucial in this personal experience.</blockquote>
        </div>

        <div className="anchor" id="entrainment"></div>
        <div className="section">
          <h1 className="car">Safe and Subtle: What to Expect from Brainwave Entrainment</h1>
          <p>You don't need to be an expert to use our online audio tool. If you don't want to dive into the technical details like understanding modulators or carriers, that's completely fine: there is an intuitive way to use this tool, which many find to be surprisingly effective. Here is how it works.</p>
          <p>Feel free to play around with the sliders to see what works for you. <span className="highlight">The 'brainwave' slider</span> adjusts the brainwave frequency, which you can set to match the mental state you're aiming for. <span className="highlight">The 'carrier' slider</span> changes the frequency of the sine tone used as the carrier; adjust it to find a sound that's pleasing to your ear. All the other sliders can be tweaked to your personal liking, so don't hesitate to experiment.</p>
          <p>Nothing wrong can happen; your brain won't suddenly switch modes on you. These shifts in mental state take a few minutes to happen, and they do gradually. As you fiddle with the settings, start to notice any small changes in how you feel after a couple of minutes of listening. These changes are often subtle at first, almost like a premonition. Are you getting more relaxed? Feeling more focused? Or maybe even a little bit sleepy? If you like where it's heading, keep going or refine the settings to amplify the feeling. If not, change your settings more profoundly and go explore another territory, or leave the page if you don't feel the envy to experiment more.</p>
          <p>Once you find what works for you, save it via the save icon. Even better, you can generate an audio file by clicking on the '.wav' icon. Your purchase helps us keep this tool running and ad-free.</p>
        </div>

        <div className="anchor" id="carrier"></div>
        <div className="section">
          <h1 className="car">The Carrier: How We Turn Silent Brainwaves into Audible Signals</h1>
          <p>Brainwaves naturally occur at frequencies too low for human ears to hear: below 20 Hz, frequencies are inaudible, and those between 20 Hz and 40 Hz require special equipment like a subwoofer, which is often impractical to use. To overcome this limitation, our tool turns inaudible brainwaves into frequencies you can actually hear, thanks to a technique known as carrier modulation.</p>
          <p>A carrier is an audible sound that serves as a medium to deliver inaudible brainwave frequencies to your brain. Usually, it's a pleasant-sounding frequency like a sine wave that your speakers can easily reproduce. You're free to pick the carrier frequency that sounds best to you. You can even opt for noise via <span className="highlight">the 'noise' slider</span>, either on its own or mixed with the sine tone. The key is to choose a carrier sound that you find enjoyable to listen to at a low or moderate volume.</p>
          <p>What happens next is a little magic trick: the chosen carrier is modulated to include the target brainwave frequency. This modulation essentially 'carries' the brainwave frequency to your ears, making it possible to experience its effects.</p>
          <p>The type of modulations that help achieve this are explained in the following section.</p>
        </div>

        <div className="anchor" id="modulation"></div>
        <div className="section">
          <h1 className="mod">Discover Advanced Modulation Techniques for Brainwave Entrainment: Binaural Beats, Isochronic Tones, and More!</h1>
          <p>Dive into a rich selection of modulation schemes to tailor your brainwave entrainment experience to perfection. Whether you're a fan of binaural beats, isochronic tones, or exploring new auditory realms, we've got you covered with four distinct modulation schemes. You can use them separately, or combine them to your liking.</p>
          <h3>Amplitude Modulation for Powerful Isochronic Tones</h3>
          <p><span className="highlight">The 'a-mod' slider</span> in the interface. This method modifies the level of the carrier sound. Perfect for single-speaker setups, it creates isochronic tones or monaural with a strong audible beat. If you're on the hunt for noticeable auditory beats, this is the modulator you'll want to use.</p>
          <h3>Binaural Modulation for Binaural Beats</h3>
          <p><span className="highlight">The 'binaural' slider</span> in the interface. If you're using headphones, binaural modulation offers an interesting auditory experience. It divides a carrier sound into two separate tones for each ear and detunes them by an amount set by the modulation rate. This creates a mild beating sensation within your head. Although the beating is fainter compared to amplitude modulation, it's often more noticeable with a low carrier frequency. What makes binaural beats intriguing is that the beating is more of a brain-created illusion, yet many people find them highly effective despite their subtlety.</p>
          <h3>Stereo Modulation for Bilateral Beats</h3>
          <p><span className="highlight">The 'stereo' slider</span> in the interface. You'll want to have two speakers—one for the left channel and one for the right—or you could just use headphones. This modulation technique shifts the carrier sound within the stereo field, and it's the key to creating what are known as bilateral beats. This makes for an engaging auditory experience if you are using a stereo configuration.</p>
          <h3>Frequency Modulation</h3>
          <p><span className="highlight">The 'f-mod' slider</span> in the interface. Less commonly used but highly effective, frequency modulation alters the frequency of the carrier sound around its central frequency point. Although it's rarely used in brainwave entrainment programs, it arguably produces the most noticeable auditory impact. The good thing about frequency modulation is that, like amplitude modulation, it works perfectly well with just a single speaker. Though it might be the most powerful modulation, it also the most tiring to the ears.</p>
          <blockquote>If all this talk about modulators sounds complex, just play around with the sliders until you find what feels and sounds right to you. What's most important is that you can hear the carrier frequency change from a constant 'weeeeeeeeeee' to a fluctuating 'weeEEeeEEeeEE'. This fluctuating sound indicates that the carrier is effectively transmitting a beating. Remember, the carrier serves as the conduit, while the beating is the actual signal we aim to deliver to your brain. If you only hear a constant sound with no fluctuations, you're hearing just the carrier, not the signal we want to send to your brain.</blockquote>
          <p>Nothing wrong can happen while you're experimenting with the settings. Synchronizing to a particular brain state is a gradual process that usually takes a few minutes. It's not as if your brain will immediately switch into deep sleep or high focus just because you've found a particular setting. Feel free to explore and discover your personalized audio sweet spot for optimal focus, relaxation, or creativity.</p>
        </div>

        <div className="anchor" id="honest"></div>
        <div className="section">
          <h1>The Gray Area of Brainwave Synchronization: An Honest Look</h1>
          <p>Brainwave entrainment, also known as brainwave synchronization, has gained significant attention in recent years. This concept proposes that the brain can synchronize its frequencies with external stimuli, such as the audio generated in this context. However, determining its actual effectiveness is challenging. Nevertheless, the popularity of this topic makes it difficult to dismiss its potential benefits. In fact, some individuals even refer to these sounds as 'digital drugs.'</p>
          <p>We aim for transparency and integrity here. Does brainwave entrainment really work? Well, the feedback and success of myNoise Binaural Beats—a sister page by the same creator of BrainAural®—served as the inspiration to create this platform, providing an even broader scope for self-experimentation. What we can say is that user feedback on myNoise was compelling enough to warrant the creation of this upgraded platform. Whether the effects are real or a powerful placebo, they're significant. And remember, even the placebo effect, backed by modern scientific research, can produce real, measurable results, even when you're aware it's a placebo. This surprising phenomenon has been highlighted by recent scientific research.</p>
          <p>When it comes to brainwave entrainment, the scientific community is still divided. The field remains a bit of a gray area in terms of research. That's where BrainAural® comes in handy; it allows you to experiment freely and form your own opinion.</p>
          <p>Brainwave entrainment hasn't been shown to harm people to date. So go ahead, explore, and find your personal audio sweet spot. There's nothing to lose and potentially much to gain. <span className="red">However, if you have specific medical conditions like epilepsy, it's important to be cautious. Make sure to consult with a healthcare provider before you start your journey into brainwave entrainment. Experimenting with BrainAural, is always your personal responsibility.</span></p>
        </div>

        <div className="anchor" id="HiGamma"></div>
        <div className="section">
          <h1>Journey into the Frontier of Neuroscience: BrainAural's Capabilities in High Gamma Brainwave Entrainment</h1>
          <p>High gamma waves have recently been the subject of much excitement and hype in the realm of neuroscience and brainwave entrainment. These brainwaves, which range from around 40 Hz to 100 Hz, are associated with higher mental activity, including perception, problem-solving, and consciousness. While the understanding of high gamma waves is still a growing field, many claim that they can significantly impact cognitive functions.</p>
          <p>The exciting part? BrainAural® an generate frequency content up to the high gamma range. Our modulators go as high as 100 Hz, letting you explore the uppermost spectrum of gamma waves. Whether you're interested in boosting focus, improving cognitive function, or just curious about what high gamma can offer, BrainAural® is a sturdy and reliable platform for your own experiments.</p>
        </div>

        <div className="section">
          <h1>Hearing Retraining: A New Frontier for BrainAural</h1>
          <p>As we age, our ears become less sensitive to higher frequencies, a condition known as age-related hearing loss or presbycusis. Interestingly, some theories suggest that the ear can be 'retrained' to pick up these frequencies. A recent experiment on myNoise, which utilized natural sounds like cicadas and bats that operate at near ultrasonic frequencies, showed some promising results. Users reported that over time, they began to hear frequencies that were initially inaudible to them.</p>
          <p>Inspired by this, I've designed BrainAural's carrier frequency to extend into the upper limits of our hearing range, enabling you to take part in your own hearing retraining. To start, try setting the carrier frequency to 14,000 Hz and adjust the frequency modulation (f-mod) to 50%. This will create a signal that scans through all frequencies between 7,000 Hz and 21,000 Hz. Give it a try and explore the potential for improving your hearing!"</p>
        </div>

        <div className="anchor" id="audiofile"></div>
        <div className="section">
          <h1>Audio File Download</h1>
          <p><button className="ctrlImg" onClick={() => window.open('?render=1', '_blank')} onMouseEnter={() => showMessage('Generate a high quality standalone audio file')} title="WAV" style={{ float: 'left', marginRight: '15px' }}>💾</button></p>
          <p>&larr; Click the icon to turn the brainwave that is currently playing into a perfectly looped audio file. This feature compensates for the absence of a mobile app, and allows you to play BrainAural® sounds without internet connection.</p>
          <h2>For Businesses and Commercial Ventures in Sound Therapy</h2>
          <p>Are you looking to incorporate high-quality binaural beats and entrainment sounds into your product or service? BrainAural® is your ideal partner for sourcing top-notch audio content. Our platform is not just a tool for individuals; we offer commercial licenses that make it easy for businesses to integrate our audio into their offerings. Simply use the .wav order function to secure high-fidelity sound files tailored to your needs.</p>
        </div>

        <div className="section">
          <h1>About the Creator - Dr. Ir. Stéphane Pigeon</h1>
          <p>Dr. Ir. <a href="https://stephanepigeon.com">Stéphane Pigeon</a> is an engineer with a passion for sounds, renowned for his contributions to audio technology and sound therapy. His work is showcased on platforms like <a href="https://audiocheck.net">AudioCheck</a> and <a href="https://mynoise.net">myNoise</a>, which collectively draw an impressive 20,000 daily visitors.</p>
          <p>Not only are Dr. Pigeon's platforms innovative, but they also prioritize user privacy. Here, you won't encounter ads or data harvesting. What you get is a clean and respectful user experience.</p>
        </div>

        <div className="sectionLast">
          <p>© 2017-2023 &nbsp; <a href="http://stephanepigeon.com" className="white">Dr. Ir. Stéphane Pigeon</a></p>
        </div>
      </div>
    </div>
  );
};

