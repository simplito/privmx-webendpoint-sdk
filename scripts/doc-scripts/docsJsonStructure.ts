type ApiCategory = 'threads' | 'stores' | 'inboxes' | 'core' | 'crypto' | 'errors' | string;

export type ArgType = {
    name: string;
    optional: boolean;
    link?: string;
};

type UnknownDescription = {
    [key: string]: Array<string | ArgType>;
};

type GenericDescription = {
    definition: string; // eg. T or T extends IParsable
    description: string;
};

export interface MethodReference {
    type: 'method';
    name: string;
    description: string;
    snippet: string;
    methodType: 'constructor' | 'static' | 'method';
    generic?: Array<GenericDescription>;
    params: Array<{
        name: string;
        description: string;
        type: ArgType;
    }>;
    returns?: Array<{
        type: ArgType;
        description: string;
    }>;
    exceptions?: Array<{
        type: ArgType;
        code: number;
        description: string;
    }>;
    events?: Array<{
        type: string;
        channel: string;
        payload: ArgType;
    }>;
}

export interface TypeReference {
    type: 'type';
    name: string;
    description: string;
    generic: Array<GenericDescription>;
    snippet: string;
    fields: Array<{
        name: string;
        description: string;
        type: ArgType;
    }>;
}

export interface UnionReference {
    type: 'union';
    name: string;
    description: string;
    options: Array<{
        snippet: string;
        description?: string;
    }>;
    methods?: Array<MethodReference>;
}

export interface ObjectReference {
    type: 'class' | 'struct' | 'enum';
    name: string;
    description: string;
    generic?: Array<GenericDescription>;
    fields: Array<{
        name: string;
        description: string;
        type: ArgType;
        snippet: string;
    }>;
    methods: Array<MethodReference>;
}

interface Page {
    title: string;
    content: Array<TypeReference | UnionReference | ObjectReference>;
}

interface Folder {
    title: string;
    children: Page[];
}

interface ReferenceCategories {
    [key: ApiCategory]: Array<Page | Folder>;
}

export type ApiReferenceModel = ReferenceCategories;

// "docs:parse-json": "npx tsc ./scripts/parse-json.ts  --outDir ./scripts/out --module ESNext --moduleResolution Node --target ESNext"
