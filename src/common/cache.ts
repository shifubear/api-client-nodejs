interface Entry {
    value: any;
    options: any;
    team?: string;
    timer: number | null;
}

export default class Cache {

    private static registry: {[key: string]: Entry} = {};

    public static get(key: string, options?: {}, team?: string) {
        if (!this.registry[key]) {
            // Cache miss
            return null;
        }
        
        if (options) {
            // Different options. Cache miss.
            if (JSON.stringify(this.registry[key].options) !== JSON.stringify(options)) {
                return null;
            }
        }

        if (team) {
            // Different team. Cache miss.
            if (this.registry[key].team !== team) {
                return null;
            } 
        }

        return this.registry[key].value;
    }

    public static set(key: string, value: any, options: any, team?: string, timeout?: number) {
        if (!timeout) {
            timeout = 1000;
        }
        this.clear(key);
        this.registry[key] = {value: value, options: options, timer: null, team: team};
        this.registry[key].timer = setTimeout(this.clear.bind(this, key), timeout);
        return value;
    }

    public static clear(key: string) {
        if (! this.registry[key]) {
            return;
        }
        this.registry[key].value = null;
        clearTimeout(<number>this.registry[key].timer);
    }
}
