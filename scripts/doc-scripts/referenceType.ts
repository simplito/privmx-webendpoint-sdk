export enum DeclarationKind {
    Project = 0x1,
    Module = 0x2,
    Namespace = 0x4,
    Enum = 0x8,
    EnumMember = 0x10,
    Variable = 0x20,
    Function = 0x40,
    Class = 0x80, // 128
    Interface = 0x100, //256
    Constructor = 0x200,
    Property = 0x400, // 1024
    Method = 0x800, /// 2048
    CallSignature = 0x1000, // 4096
    IndexSignature = 0x2000,
    ConstructorSignature = 0x4000,
    Parameter = 0x8000, // 32768
    TypeLiteral = 0x10000, // 65536
    TypeParameter = 0x20000,
    Accessor = 0x40000, // 262144
    GetSignature = 0x80000, //524288
    SetSignature = 0x100000,
    TypeAlias = 0x200000, // 2097152
    Reference = 0x400000,
    /**
     * Generic non-ts content to be included in the generated docs as its own page.
     */
    Document = 0x800000
}

export interface TypeAlias {
    id: string;
    name: string;
    variant: 'declaration';
    comment: DeclarationComment;
    kind: DeclarationKind.TypeAlias;
    flags: DeclarationFlags;
    sources: { fileName: string; line: number; character: number }[];
    type: DeclarationParamType;
}

export type DeclarationFlags = {
    isPublic?: boolean;
    isStatic?: boolean;
};

type DeclarationSources = Array<{
    fileName: string;
    line: number;
    character: number;
}>;

export type DeclarationParamType =
    | {
          type: 'reference';
          target: number | { sourceFileName: string; qualifiedName: string };
          typeArguments: DeclarationParamType[];
          name: string;
          package: string;
      }
    | { type: 'intrinsic'; name: string }
    | { type: 'array'; elementType: DeclarationParamType }
    | { type: 'union'; types: Exclude<DeclarationParamType, 'union'>[]; defaultData?: string }
    | {
          type: 'reflection';
          declaration: {
              id: number;
              name: '__type';
              variant: 'declaration';
              kind: DeclarationKind.TypeLiteral;
              flags: DeclarationFlags;
              children: PropertyDeclarationType[];
          };
      }
    | {
          type: 'reflection';
          declaration: {
              id: number;
              name: '__type';
              variant: 'declaration';
              kind: DeclarationKind.TypeLiteral;
              flags: DeclarationFlags;
              signatures: CallSignatureType[];
          };
      }
    | {
          type: 'intersection';
          types: DeclarationParamType[];
      }
    | {
          type: 'literal' | 'templateLiteral';
          value: string;
      };

export type DeclarationComment = {
    summary: {
        kind: string;
        text: string;
    }[];
    blockTags: {
        tag: string;
        content: {
            kind: string;
            text: string;
        };
    }[];
};

interface PropertyDeclarationType {
    id: string;
    name: string;
    kind: DeclarationKind.Property;
    sources: DeclarationSources;
    comment?: DeclarationComment;
    type: DeclarationParamType;
    defaultValue: string;
}

export interface ConstructorDeclarationType {
    id: string;
    name: string;
    kind: DeclarationKind.Constructor;
    sources: DeclarationSources;
    signatures: Array<CallSignatureType>;
}

interface MethodParamType {
    id: number;
    name: string;
    variant: 'param';
    kind: DeclarationKind.Parameter;
    flags: DeclarationFlags;
    comment?: DeclarationComment;
    type: DeclarationParamType;
}

export interface CallSignatureType {
    id: number;
    name: string;
    variant: string;
    kind: DeclarationKind.CallSignature;
    flags: DeclarationFlags;
    comment?: DeclarationComment;
    sources: DeclarationSources;
    parameters?: MethodParamType[];
    type: DeclarationParamType;
    typeParameters: Array<{
        id: number;
        name: string;
        variant: 'typeParam';
        kind: DeclarationKind.TypeParameter;
        flags: DeclarationFlags;
        type: DeclarationParamType;
    }>;
    implementationOf: {
        type: 'reference';
        target: number;
        name: string;
    };
}

export interface MethodDeclarationType {
    id: string;
    name: string;
    kind: DeclarationKind.Method;
    flags: DeclarationFlags;
    sources: DeclarationSources;
    signatures: Array<CallSignatureType>;
    implementationOf: {
        type: 'reference';
        target: number;
        name: string;
    };
}

export type AccessorDeclarationType = {
    id: number;
    name: string;
    variant: 'declaration';
    kind: DeclarationKind.Accessor;
    flags: DeclarationFlags;
    sources: DeclarationSources;
} & (
    | {
          getSignature: {
              id: number;
              name: string;
              comment?: DeclarationComment;
              variant: 'signature';
              kind: DeclarationKind.GetSignature;
              sources: DeclarationSources;
              type: DeclarationParamType;
          };
      }
    | {
          setSignature: {
              name: string;
              comment?: DeclarationComment;
              type: DeclarationParamType;
          };
      }
);

export interface ClassDeclarationType {
    id: number;
    name: string;
    kind: DeclarationKind.Class;
    flags: DeclarationFlags;
    comment: {
        summary: { kind: string; text: string }[];
        blockTags: { tag: string; content: { kind: string; text: string } }[];
    };
    children: Array<
        | ConstructorDeclarationType
        | PropertyDeclarationType
        | AccessorDeclarationType
        | MethodDeclarationType
    >;
    groups: Array<{
        title: string;
        children: number[];
    }>;
    sources: { fileName: string; line: number; character: number }[];
}

export interface InterfaceDeclarationType {
    id: number;
    name: string;
    comment: DeclarationComment;
    variant: string;
    kind: DeclarationKind.Interface;
    flags: DeclarationFlags;
    children: Array<PropertyDeclarationType>;
    groups: {
        title: string;
        children: number[];
    };
    sources: { fileName: string; line: number; character: number }[];
}
