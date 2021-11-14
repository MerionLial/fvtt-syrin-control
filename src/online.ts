import { getMoods, getSoundsets } from "./api";
import { Moods, Soundsets } from "./syrin";
import { useAPI } from "./utils";

export async function onlineMoods(soundsetId: string): Promise<Moods> {
    if (useAPI()) {
        const moods = await getMoods(soundsetId);
        return moods.map(mood => { return {
            id: mood.pk,
            name: mood.name
        };})
            .reduce((moodsById, mood) => {
                moodsById[mood.id] = mood;
                return moodsById;
            }, Object.create(null))
        ;
    }
    return {};
}

export async function onlineSoundsets(): Promise<Soundsets> {
    if (useAPI()) {
        const soundsets = await getSoundsets();
        return soundsets.map(soundset => { return {
            id: soundset.uuid,
            name: soundset.full_name,
            moods: []
        };})
            .reduce((soundsetsById, soundset) => {
                soundsetsById[soundset.id] = soundset;
                return soundsetsById;
            }, Object.create(null))
        ;
    }
    return {};
}
