import * as JsonApi from "../../jsonapi/index";
import * as ApiRequest from "../../common/request";
import * as Environments from "../environments/index";
import * as Plans from "../plans/index";
import * as Tiers from "../tiers/tiers";
import { Term, ContainerLineItem } from "./common";
import { Id } from "../../common/structures";

export function document() {
    return SingleRequest;
}

export interface Single extends JsonApi.ResourceDocument {
    data: Resources | null;
}

export interface Resources {
    id: Id;
    type: "active_services";
    attributes: {
        term: Term;
        containers: ContainerLineItem[];
        due: number;
        tier: Tiers.Summary & {due: number};
    };
    meta: {
        environments: {[key: string]: Environments.Resource};
    };
}

export interface Volumes {
    path: string;
    plan: Plans.Summary;
    due: number;
}

export class SingleRequest {
    private static target = `billing/current`;

    public static async get(query?: ApiRequest.QueryParams): Promise<Single> {
        return ApiRequest._get<Single>(this.target, query);
    }
}