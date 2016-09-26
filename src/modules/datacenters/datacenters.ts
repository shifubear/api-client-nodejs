// tslint:disable-next-line
import { ErrorDetail, ResultFail, ResultSuccess } from "../../common/api";
import * as JsonApi from "../../jsonapi/index";
import { Id } from "../../common/structures";
import * as API from "../../common/api";

export function document(): typeof CollectionRequest;
export function document(id: string): SingleRequest;
export function document(id?: string): typeof CollectionRequest | SingleRequest {
    if (!id) {
        return CollectionRequest;
    }

    return new SingleRequest(id);
}

export interface Collection extends JsonApi.CollectionDocument {
    data: Resource[];
}

export interface Single extends JsonApi.ResourceDocument {
    data: Resource | null;
}

export interface Resource extends JsonApi.Resource {
    id: Id;
    type: "datacenters";
    attributes: {
        name: string;
        provider: string;
        location: LocationStructure;
        active: boolean;
    };
}

export interface LocationStructure {
    state: string;
    city: string;
    country: string;
    continent: string;
    coordinates: number[];
}

export class CollectionRequest {
    public static async get(query?: API.QueryParams) {
        return API.get<Collection>("datacenters", query);
    }
}

export class SingleRequest {
    private target: string;

    constructor(id: string) {
        this.target = `datacenters/${id}`;
    }
}
