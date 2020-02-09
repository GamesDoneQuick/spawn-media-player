declare module 'windows-audio-devices' {
	export type AudioOutputDevice = {
		friendly: string;
		device: string;
		guid: string;
		kind: string;
		default: boolean;
	};

	export function getAudioDevices(): AudioOutputDevice[];
}
