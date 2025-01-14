/// <reference types="@league-of-foundry-developers/foundry-vtt-types" />
import { injectable } from 'tsyringe';
import { MODULE } from './utils';
import type { Soundset, Mood, Element } from '@/types';

export interface PlayMoodParams {
	soundset: Soundset | undefined;
	mood: Mood | undefined;
}

export interface Global {
	playElement(id: number): Promise<void>;
	stopElement(id: number): Promise<void>;
	playMood(params: PlayMoodParams | number): Promise<void>;
	isPlayerActive(): boolean;
	refresh(): void;
}

export interface FVTTGame {
	setGlobal(global: Global): void;
	registerSetting(name: string, options: any): void;
	getSetting<T>(name: string): T;
	setSetting<T>(name: string, t: T): void;

	notifyInfo(msg: string): void;
	notifyError(msg: string): void;
	isGM(): boolean;
	getActiveScene(): Scene | undefined;

	localize(key: string): string;
	
	getAudioContext(): Promise<AudioContext | undefined>;
	createMoodMacro(mood: Mood, folder: any): Promise<StoredDocument<Macro> | undefined>;
	createElementMacro(element: Element): Promise<StoredDocument<Macro> | undefined>;
	createPlaylist(mood: Mood, folder: string | undefined): Promise<StoredDocument<Playlist> | undefined>;
  createPlaylistSound(element: Element, parent: StoredDocument<Playlist>): Promise<StoredDocument<PlaylistSound> | undefined>;
  createPlaylistMoodSound(mood: Mood, parent: StoredDocument<Playlist>): Promise<StoredDocument<PlaylistSound> | undefined>;
	
	getPlaylists(): Playlists | undefined;

	getPlayerName(): string;
	callHookAll(name: string, ...args: any[]): void;
}

@injectable()
export class FVTTGameImpl implements FVTTGame {
	private game: Game;

	constructor() {
		this.game = getGame();
	}

	getPlayerName(): string {
		return this.game.user?.name ?? "unknown";	
	}
	
	localize(key: string): string {
		return this.game.i18n.localize(key);
	}

	setGlobal(global: Global): void {
		this.game.syrinscape = global;
		// this.game.modules.get(MODULE)!.api = global;
		// console.error("SET GLOBAL");
	}

	registerSetting(name: string, options: ClientSettings.PartialSetting<any>) {
		this.game.settings.register(MODULE, name, options);
	}

	getActiveScene(): Scene | undefined {
		return this.game.scenes?.active;
	}

	getPlaylists(): Playlists | undefined {
		return this.game.playlists;
	}

	callHookAll(name: string, ...args: any[]): void {
		Hooks.callAll(MODULE + name, ...args);
	}

	notifyInfo(msg: string): void {
		ui.notifications?.info(msg);
	}

	notifyError(msg: string): void {
		ui.notifications?.error(msg);
	}

	isGM(): boolean {
		return this.game.user?.isGM === true;
	}

	getSetting<T>(name: string): T {
		return this.game.settings.get(MODULE, name) as T;
	}

	setSetting<T>(name: string, t: T) {
		this.game.settings.set(MODULE, name, t);
	}

	async createPlaylist(soundset: Soundset, folder: string | undefined): Promise<StoredDocument<Playlist> | undefined> {
		const playlist = await Playlist.create({
			name: soundset.name,
			description: "Created by SyrinControl",
			mode: CONST.PLAYLIST_MODES.SIMULTANEOUS,
			folder,
 			flags: {
				syrinscape: {
					soundset: soundset.id,
				}
			}
		}, {
				 });
		return playlist;
	}

	async createPlaylistSound(element: Element, parent: StoredDocument<Playlist>): Promise<StoredDocument<PlaylistSound> | undefined> {
		const sound = await PlaylistSound.create({
			name: element.name,
			description: "Created by SyrinControl",
			path: "./syrinscape-not-a-real-path.wav",
			sort: 0,
			flags: {
				syrinscape: {
					type: "element",
					element: element.id,
				}
			}
		}, { parent });
		return sound;
	}

	async createPlaylistMoodSound(mood: Mood, parent: StoredDocument<Playlist>): Promise<StoredDocument<PlaylistSound> | undefined> {
		const sound = await PlaylistSound.create({
			name: mood.name,
			description: "Created by SyrinControl",
			path: "./syrinscape-not-a-real-path.wav",
			sort: 0,
			flags: {
				syrinscape: {
					type: "mood",
					mood: mood.id,
				}
			}
		}, { parent });
		return sound;
	}
	
	async getAudioContext(): Promise<AudioContext | undefined> {
		const { game } = this;
		if (game.audio.unlock !== undefined) { // V10
			await game.audio.unlock;
			const context = game.audio.getAudioContext();
			if(context === null) return undefined;
			return context;
		} else { // V9 or lower
			return await new Promise(function(resolve) {
				(
					function waitForCtx() {
						const ctx = game.audio.getAudioContext();
						if (ctx !== null) return resolve(ctx);
						setTimeout(waitForCtx, 100);
					}
				)();
			});
			}
	}
	
	async createMoodMacro(mood: Mood, folder: any): Promise<StoredDocument<Macro> | undefined> {
		const macro = await Macro.create({
			name: mood.name,
			type: 'script',
			folder: folder,
			img: 'icons/svg/sound.svg',
			command: 'game.syrinscape.playMood(' + mood.id + '); // ' + mood.name
		});
		return macro;
	}

	async createElementMacro(element: Element): Promise<StoredDocument<Macro> | undefined> {
		const macro = await Macro.create({
			name: element.name,
			type: 'script',
			img: element.icon,
			command: 'game.syrinscape.playElement(' + element.id + '); // ' + element.name
		});
		return macro;
	}
}

export function getGame(): Game {
	if (!(game instanceof Game)) {
		throw new Error('game is not initialized yet');
	}
	return game;
}
