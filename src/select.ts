import { onlineMoods } from "./online";
import { Mood, Moods, Soundset, Soundsets } from "./syrin";

export interface SelectConfig {
    soundsetClass: string;
    moodClass: string;
    soundset?: Soundset;
    mood?: Mood;
    soundsets: Soundsets;

    onSoundsetChange?: (soundset: Soundset | undefined) => void;
    onMoodChange?: (mood: Mood | undefined) => void;
}

export interface Select {
    setMood: (soundset: Soundset | undefined, mood: Mood | undefined) => void;
}

export async function select(config: SelectConfig): Promise<JQuery<HTMLElement> & Select> {
    let getMoods = async (soundsetId: string | undefined) => {
        if(!soundsetId) return {};
        let moods = config.soundsets[soundsetId].moods;
        if(Object.keys(moods).length === 0) {
            return await onlineMoods(soundsetId);
        }
        return moods;
    };
    let moods: Moods = await getMoods(config.soundset?.id);

    const soundsetOptions = Object.entries(config.soundsets).map(([id, obj]) => {
        const selected = (config.soundset?.id === id) ? "selected" : "";
        return `<option value="${id}" ${selected}>${obj.name}</option>`;
    }).join("\n");

    const moodOptions = Object.entries(moods).map(([id, obj]) => {
        const selected = (Number(config.mood?.id) === Number(id)) ? "selected" : "";
        return `<option value="${id}" ${selected}>${obj.name}</option>`;
    }).join("\n");

    let $inject = $(`
<div>
  <select class="${config.soundsetClass}" >
    <option value="" ${config.soundset === undefined ? "selected": ""}>--No soundset--</option>
    ${soundsetOptions}
  </select>

    <select class="${config.moodClass}" ${config.soundset === undefined ? "disabled" : ""} >
    <option value="" ${config.mood === undefined ? "selected": ""}>--No mood--</option>
    ${moodOptions}
  </select>
</div>
    `);

    let $soundset = $inject.find("." + config.soundsetClass);
    let $mood = $inject.find("." + config.moodClass);

    async function updateMoods() {
        moods = await getMoods(config.soundset?.id);

        const moodOptions = Object.entries(moods).map(([id, obj]) => {
            return `<option value="${id}">${obj.name}</option>`;
        }).join("\n");
        $mood.append(moodOptions);
        $mood.removeAttr("disabled");
    }

    $soundset.on("change", async function() {
        const id = $(this).val();
        console.log("SyrinControl | on Select change soundset", id);

        if (id ===  undefined) { return; }
        if (id instanceof Array) { return; }
        $mood.html('<option value="" selected>--No mood--</option>');
        if (id === "") {
            $mood.attr("disabled", "disabled");
            config.soundset = undefined;
            config.mood = undefined;
            config.onSoundsetChange?.(config.soundset);
            config.onMoodChange?.(config.mood);
            return;
        }
        config.soundset = config.soundsets[id as string];

        await updateMoods();

        config.onSoundsetChange?.(config.soundset);
        config.onMoodChange?.(undefined);
    });

    $mood.on("change", async function() {
        const id = $(this).val();
        console.log("SyrinControl | on Select change mood", id);
        if (id ===  undefined) { return; }
        if (id instanceof Array) { return; }
        if (id === "") {
            config.mood = undefined;
            config.onMoodChange?.(config.mood);
            return;
        }

        config.mood = moods[id as number];

        config.onMoodChange?.(config.mood);
    });

    return Object.assign($inject, {
    setMood: async (newSoundset: Soundset | undefined, newMood : Mood | undefined) => {
        console.log("SyrinControl | setMood in select", newSoundset, newMood);
        const isSoundsetNew = newSoundset !== config.soundset;
        config.soundset = newSoundset;
        config.mood = newMood;

        $inject.find("." + config.soundsetClass + ` option[value="${newSoundset?.id ?? ""}"]`).prop('selected', true);

        if (isSoundsetNew) {
            await updateMoods();
        }

        $inject.find("." + config.moodClass + ` option[value="${newMood?.id ?? ""}"]`).prop('selected', true);

        if (newSoundset === undefined) {
            $mood.attr("disabled", "disabled");
        }
    }
    });
}
