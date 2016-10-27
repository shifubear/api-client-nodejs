// tslint:disable-next-line
import { CycleErrorDetail, ResultFail, ResultSuccess } from "../../common/api";
import * as JsonApi from "../../jsonapi/index";
import * as API from "../../common/api";
import { Id, State, Events, Task, FormattedDoc, Scope } from "../../common/structures";

export function document(): typeof CollectionRequest;
export function document(id: Id): SingleRequest;
export function document(id?: Id): typeof CollectionRequest | SingleRequest {
    if (!id) {
        return CollectionRequest;
    }

    return new SingleRequest(id);
}

export interface Collection extends JsonApi.CollectionDocument {
    data: Resource[];
}

export interface Single extends JsonApi.ResourceDocument {
    data: Resource;
}

export interface Resource extends JsonApi.Resource {
    id: Id;
    type: "repos";
    attributes: {
        name: string;
        about: {
            description: string;
        };
        type: Types;
        owner: Scope;
        url: string;
        auth: {
            private_key: string;
        };
        state: State<States>;
        events: Events;
    };

    relationships?: {
        creator: JsonApi.ToOneRelationship;
    };

    meta?: {
        counts: {};
        account: {};
        team: {};
    };
}

export type States = "live" | "building" | "deleting" | "deleted" | "error";

export type Types = "git";

export interface NewParams {
    name: string;
    url: string;
    type: Types;
    auth?: {
        private_key: string;
    };
}

export interface UpdateParams {
    name?: string;
    auth?: {
        private_key: string;
    };
}

export interface BuildParams {
    latest: boolean;
    commit: string;
    description: string;
}

export class CollectionRequest {
    private static target = "repos";

    public static async get(query?: API.QueryParams) {
        return API.get<Collection>(this.target, query);
    }

    public static async create(doc: NewParams, query?: API.QueryParams) {
        return API.post<Single>(
            this.target,
            new FormattedDoc({ type: "repos", attributes: doc }),
            query
        );
    }
}

export type SingleActions = "build";
export class SingleRequest {
    private target: string;

    constructor(private id: Id) {
        this.target = `repos/${id}`;
    }

    public async get(query?: API.QueryParams) {
        return API.get<Single>(this.target, query);
    }

    public async update(doc: UpdateParams, query?: API.QueryParams) {
        return API.patch<Single>(this.target, new FormattedDoc({ type: "repos", attributes: doc }), query);
    }

    public async delete(query?: API.QueryParams) {
        return API.del<Task<SingleActions>>(this.target, query);
    }

    public async build(options: BuildParams) {
        return this.task("build", options);
    }

    public async task(action: SingleActions, contents?: Object) {
        return API.post<Task<SingleActions>>(`${this.target}/tasks`, new Task(action, contents));
    }
}

