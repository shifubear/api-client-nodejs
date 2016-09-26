import * as JsonApi from "../../jsonapi/index";
import * as API from "../../common/api";
import { Id, State, Events, FormattedDoc, Task } from "../../common/structures";

export function document(): typeof CollectionRequest;
export function document(id: string): SingleRequest;
export function document(id?: string): typeof CollectionRequest | SingleRequest {
    if (id) {
        return new SingleRequest(id);
    }

    return CollectionRequest;
}

export interface Collection extends JsonApi.CollectionDocument {
    data: Resource[];
}

export interface Single extends JsonApi.ResourceDocument {
    data: Resource | null;
}

export interface Resource {
    id: Id;
    type: "billing_methods";
    attributes: {
        name: string;
        primary: boolean;
        address: BillingAddress;
        credit_card: CreditCard;
        state: State<States>;
        events: Events;
    };
}

export type States = "active" | "inactive" | "processing" | "deleting" | "deleted";

export type SingleActions = "make_primary";

export interface BillingAddress {
    city: string;
    country: string;
    state: string;
    zip: string;
    lines: string[];
}

export interface CreditCard {
    name: string;
    brand: string;
    expiration: {
        month: number;
        year: number
    };
}

export interface CreditCardParams {
    name: string;
    number: string;
    cvv2: string;
    expiration: {
        month: number;
        year: number
    };
}

export interface NewParams {
    name: string;
    credit_card: CreditCardParams;
    address: BillingAddress;
    team?: string;
}

export interface UpdateParams {
    name: string;
}

export class CollectionRequest {
    private static target = "billing/methods";

    public static async get(query?: API.QueryParams): API.Response<Collection> {
        return API.get<Collection>(this.target, query);
    }

    // Methods if no ID
    public static async create(method: NewParams, query?: API.QueryParams): API.Response<Single> {
        return API.post<Single>(
            this.target,
            new FormattedDoc({ type: "billing_methods", attributes: method }),
            query
        );
    }
}

export class SingleRequest {
    private target = "billing/methods";

    constructor(private id: string) {
        this.target = `${this.target}/${id}`;
    }

    public async update(doc: UpdateParams, query?: API.QueryParams): API.Response<Single> {
        return API.patch<Single>(
            this.target,
            new FormattedDoc({ id: this.id, type: "billing_methods", attributes: doc }),
            query
        );
    }

    public makePrimary(): API.Response<Task<SingleActions>> {
        return this.task("make_primary");
    }

    public task(action: SingleActions, contents?: Object, query?: API.QueryParams): API.Response<Task<SingleActions>> {
        return API.post<Task<SingleActions>>(
            `${this.target}/tasks`,
            new Task(action, contents),
            query
        );
    }

    public async delete(): API.Response<Task<"delete">> {
        return API.del<Task<"delete">>(this.target);
    }

    public async get(query?: API.QueryParams): API.Response<Single> {
        return API.get<Single>(this.target, query);
    }
}
