#!/usr/bin/env ts-node

import { readFile, writeFile } from 'fs/promises';
import { join, resolve } from 'path';
import {
    AccessorDeclarationType,
    CallSignatureType,
    ClassDeclarationType,
    ConstructorDeclarationType,
    DeclarationComment,
    DeclarationKind,
    DeclarationParamType,
    InterfaceDeclarationType,
    MethodDeclarationType,
    TypeAlias
} from './referenceType';
import { ArgType, MethodReference, ObjectReference, TypeReference } from './docsJsonStructure';

const __dirname = resolve();

type ModuleDeclarations = Array<ClassDeclarationType | InterfaceDeclarationType>;

function filterGroupsByCategory(
    groups: Array<{ title: string; children: number[] }>,
    symbolMap: { [keyof: string]: { sourceFileName: string; qualifiedName: string } },
    categoryFiles: string[]
): [categoryIds: number[]] {
    const allIds: number[] = [];
    groups.forEach((group) => {
        const filteredIDs = group.children.filter((referenceId) => {
            const includesReference = categoryFiles.includes(
                symbolMap[referenceId.toString()].sourceFileName
            );
            return includesReference;
        });

        if (filteredIDs.length === 0) {
            return;
        }

        allIds.push(...filteredIDs);


    });
    return [allIds];
}

function serializeCallSignature(signature: CallSignatureType) {

    const functionParamsSnippet = (signature.parameters || [])
        .map((param) => {
            return `${param.name}: ${serializeParamType(param.type).name}`;
        })
        .join(',');

    return `(${functionParamsSnippet})=>${serializeParamType(signature.type).name}`;
}


function createParamLink(qualifiedName: string) {

    return `js/web-sdk/${qualifiedName}`;
}

function serializeParamType(param: DeclarationParamType, indentLevel: number = 0, inline?: boolean): ArgType {
    if (!param) {
        throw Error('Invalid param type');
    }

    if (param.type === 'intrinsic') {
        return {
            name: param.name,
            optional: false,
            link: ''
        };
    }
    if (param.type === 'reference' && param.typeArguments) {
        const serializedType = param.typeArguments.map(type => serializeParamType(type, 0, true));
        return {
            name: `${param.name.trim()}<${serializedType.map(type => type.name.trim()).join(', ')}>`,
            optional: false,
            link: serializedType[0].name
        };
    }
    if (param.type === 'array') {
        const serializedType = serializeParamType(param.elementType);
        return {
            name: `${serializedType.name}[]`,
            optional: false,
            link: serializedType.link
        };
    }
    if (param.type === 'union') {
        return {
            name: param.types.map((type) => serializeParamType(type).name).join(' | '),
            optional: false,
            link: ''
        };
    }
    if (param.type === 'reflection') {
        const fieldIndentTabs = inline ? '' : '\t'.repeat(indentLevel + 1);
        const closingIndent = inline ? '' : '\t'.repeat(indentLevel);

        if ('signatures' in param.declaration) {
            //Arrow functions
            return {
                name: serializeCallSignature(param.declaration.signatures[0]),
                optional: false,
                link: ''
            };

        } else if ('children' in param.declaration) {
            //Object literals
            const objectFields = param.declaration.children
                .map(
                    (field) =>
                        `${fieldIndentTabs}${field.name}: ${serializeParamType(field.type, indentLevel + 1).name};`
                );
            return {
                name: inline ? `{${objectFields.join(';')}}` : `{\n${objectFields.join('\n')}\n${closingIndent}}`,
                optional: false,
                link: ''
            };
        }
    }
    if (param.type === 'reference') {
        return {
            name: param.name.trim(),
            optional: false,
            link: createParamLink(param.name)
        };
    }

    if (param.type === 'intersection') {
        return {
            name: (param.types as DeclarationParamType[]).map((it) => serializeParamType(it).name).join(' & '),
            optional: false,
            link: ''
        };
    }

    if (param.type === 'literal' || param.type === 'templateLiteral') {
        return {
            name: `"${param.value}"`,
            optional: false,
            link: ''
        };
    }

    // @ts-ignore
    if (param.type === 'conditional' || param.type === 'query' || param.type === 'mapped' || param.type === 'indexedAccess') {
        return {
            name: 'UNKNOWN',
            optional: false,
            link: ''
        };
    }

    throw new Error(`Invalid param type ${param.type}`);

}

function serializeComment(comment?: DeclarationComment): string {
    if (!comment) return '';

    let text: string = '';

    if (comment.summary) {
        text = comment.summary.map((block) => block.text).join('');
    }

    return text;
}

function serializeException(comment?: DeclarationComment): { type: ArgType, description: string, code: number }[] {
    const errorTags = comment?.blockTags?.filter(block => block.tag === '@throws');

    if (!errorTags) {
        return [];
    }

    return errorTags.map(errBlock => {
        return {
            type: { name: errBlock.content[0].text, link: '', optional: false },
            code: 0,
            description: errBlock.content[1].text
        };
    });
}

function serializeInterface(interfaceDeclaration: InterfaceDeclarationType): TypeReference {
    const serializedFields: TypeReference['fields'] = interfaceDeclaration.children.map((child) => {
        return { name: child.name, description: serializeComment(child.comment), type: serializeParamType(child.type) };
    });

    const serializedType: TypeReference = {
        type: 'type',
        name: interfaceDeclaration.name,
        description: serializeComment(interfaceDeclaration.comment),
        generic: [],
        snippet: `interface ${interfaceDeclaration.name}{
${serializedFields.map((field) => `\t${field.name}: ${field.type.name};`).join('\n')}
}`,
        fields: serializedFields
    };

    return serializedType;
}

function serializeConstructor(constructorDeclaration: ConstructorDeclarationType): MethodReference {
    const constructorSig = constructorDeclaration.signatures[0];
    const functionParams = constructorSig.parameters || [];

    const constructorParams = functionParams
        .map((param) => `${param.name}: ${serializeParamType(param.type).name}`)
        .join(',');

    const serializedParams = functionParams.map((param) => {
        return {
            name: param.name,
            description: serializeComment(param.comment),
            type: serializeParamType(param.type)
        } satisfies { name: string; description: string; type: ArgType };
    });

    const constructor: MethodReference = {
        type: 'method',
        name: constructorDeclaration.name,
        description: serializeComment(constructorSig.comment),
        snippet: `constructor(${constructorParams})`,
        methodType: 'constructor',
        params: serializedParams
    };

    return constructor;
}

function serializeMethod(methodDeclaration: MethodDeclarationType): MethodReference {
    const sig = methodDeclaration.signatures[0];
    const isStatic = methodDeclaration.flags.isStatic;
    const isAsync = sig.type.type === 'reference' && sig.type.name === 'Promise';

    const signatureComments = { summary: [], blockTags: [], ...sig.comment };
    const returnDesc =
        signatureComments.blockTags.find((block) => block.tag === '@returns')?.content[0]?.text ||
        '';

    const functionParams = sig.parameters || [];
    const params = functionParams
        .map((param) => {
            //Serialization of nested fields inside Object literals
            if (param.type.type === 'reflection' && 'children' in param.type.declaration) {
                return param.type.declaration.children.map((declarationField) => {
                    const fieldComment = serializeComment(declarationField.comment);
                    return {
                        name: `${param.name}.${declarationField.name}`,
                        description: fieldComment,
                        type: serializeParamType(declarationField.type)
                    };
                });
            }
            const paramDescription = serializeComment(param.comment);
            return {
                name: param.name,
                description: paramDescription,
                type: serializeParamType(param.type)
            };
        })
        .flat();

    const functionParamsSnippet = functionParams
        .map((param) => {
            return `${param.name}: ${serializeParamType(param.type).name}`;
        })
        .join(', ');

    return {
        type: 'method',
        name: methodDeclaration.name,
        description: serializeComment(sig.comment),
        methodType: isStatic ? 'static' : 'method',
        snippet: `${isStatic ? 'static ' : ''}${isAsync ? 'async ' : ''}${
            sig.name
        }(${functionParamsSnippet})`,
        returns: [{ type: serializeParamType(sig.type), description: returnDesc }],
        params,
        events: [],
        exceptions: serializeException(sig.comment),
        generic: []
    };
}

function serializeClass(classDeclaration: ClassDeclarationType): ObjectReference {
    const classFields = (
        classDeclaration.children.filter(
            (child) => child.kind === DeclarationKind.Accessor
        ) as AccessorDeclarationType[]
    ).map((propertyReference) => {
        if ('getSignature' in propertyReference) {
            const serializedType = serializeParamType(propertyReference.getSignature.type);
            const comment = serializeComment(propertyReference.getSignature.comment);
            return {
                name: propertyReference.name,
                description: comment,
                snippet: `get ${propertyReference.name}(): ${serializeParamType(propertyReference.getSignature.type).name}`,
                type: {
                    name: serializedType.name,
                    optional: false,
                    link: serializedType.link
                }
            } satisfies {
                name: string;
                description: string;
                type: ArgType;
                snippet: string;
            };
        } else {
            const serializedType = serializeParamType(propertyReference.setSignature.type);
            const comment = serializeComment(propertyReference.setSignature.comment);
            return {
                name: propertyReference.name,
                description: comment,
                snippet: `set ${propertyReference.name}(): ${serializeParamType(propertyReference.setSignature.type).name}`,
                type: {
                    name: serializedType.name,
                    optional: false,
                    link: serializedType.link
                }
            } satisfies {
                name: string;
                description: string;
                type: ArgType;
                snippet: string;
            };
        }
    });

    const methodFields: ObjectReference['methods'] = (
        classDeclaration.children.filter(
            (child) => child.kind === DeclarationKind.Method
        ) as MethodDeclarationType[]
    ).map(serializeMethod);

    const constructor = classDeclaration.children.find(
        (declaration) => declaration.kind === DeclarationKind.Constructor
    ) as ConstructorDeclarationType;

    if (constructor) {
        const constructorSig = serializeConstructor(constructor);
        methodFields.unshift(constructorSig);
    }

    const classReference: ObjectReference = {
        type: 'class',
        description: serializeComment(classDeclaration.comment),
        name: classDeclaration.name,
        fields: classFields,
        methods: methodFields
    };

    return classReference;
}

function serializeTypeAlias(alias: TypeAlias): ObjectReference {
    const type = serializeParamType(alias.type);
    const serializedType: ObjectReference = {
        description: serializeComment(alias.comment),
        name: alias.name,
        fields: [
            { name: type.name, type, description: alias.type.type, snippet: '' }
        ],
        generic: [],
        methods: [],
        type: undefined
    };

    return serializedType;
}

function serializeReferences(x: ClassDeclarationType | TypeAlias | InterfaceDeclarationType) {
    switch (x.kind) {
        case DeclarationKind.Interface:
            return serializeInterface(x);
        case DeclarationKind.Class:
            return serializeClass(x);
        case DeclarationKind.TypeAlias:
            return serializeTypeAlias(x);
        default:
        // console.log(`Unknown type ${JSON.stringify(x)}`);
    }
}

async function main() {
    const docPath = join(__dirname, '../../packages/privmx-webendpoint-sdk/.doc/docs.json');

    const docJson = await readFile(docPath, 'utf-8');

    const docsObject = JSON.parse(docJson);
    delete docsObject.packageName;
    delete docsObject.readme;
    delete docsObject.files;

    const references = docsObject.children as ModuleDeclarations;

    const [threadIDs] = filterGroupsByCategory(
        docsObject.groups,
        docsObject.symbolIdMap,
        [
            'src/clients/ThreadClient.ts',
            'src/types/thread.ts',
            'src/clients/ContextClients/GenericThread.ts',
            'src/clients/ContextClients/ContextThreads.ts',
            'src/api/thread/ThreadApi.ts',
            'src/api/thread/ThreadApiInterface.ts'
        ]
    );

    const [storeIDs] = filterGroupsByCategory(
        docsObject.groups,
        docsObject.symbolIdMap,
        [
            'src/clients/StoreClient.ts',
            'src/types/store.ts',
            'src/clients/StreamReader.ts',
            'src/clients/StreamUploader.ts',
            'src/clients/ContextClients/GenericStore.ts',
            'src/clients/ContextClients/ContextStores.ts',
            'src/api/thread/StoreApi.ts',
            'src/api/thread/StoreApiInterface.ts'
        ]
    );

    const [inboxIDs] = filterGroupsByCategory(
        docsObject.groups,
        docsObject.symbolIdMap,
        [
            'src/clients/InboxClient.ts',
            'src/types/inboxes.ts',
            'src/clients/InboxFileUploader.ts',
            'src/clients/ContextClients/ContextInboxes.ts',
            'src/clients/ContextClients/GenericInbox.ts',
            'src/api/inbox/InboxApiInterface.ts'
        ]
    );

    const [coreIds] = filterGroupsByCategory(
        docsObject.groups,
        docsObject.symbolIdMap,
        [
            'src/clients/Endpoint.ts',
            'src/clients/PublicConnection.ts',
            'src/clients/AnonymousConnection.ts',
            'src/types/core.ts',
            'src/types/user.ts',
            'src/types/events.ts',
            'src/types/context.ts'
        ]
    );

    const [cryptoIds] = filterGroupsByCategory(
        docsObject.groups,
        docsObject.symbolIdMap,
        [
            'src/clients/PrivmxCrypto.ts',
            'src/api/thread/CryptoApi.ts'
        ]
    );


    const threadReferences = references
        .filter((reference) => threadIDs.includes(reference.id))
        .map(serializeReferences)
        .filter(Boolean);

    const serializedStore = references
        .filter((reference) => storeIDs.includes(reference.id))
        .map(serializeReferences)
        .filter(Boolean);

    const serializedCore = references
        .filter((reference) => coreIds.includes(reference.id))
        .map(serializeReferences)
        .filter(Boolean);

    const serializedCrypto = references
        .filter((reference) => cryptoIds.includes(reference.id))
        .map(serializeReferences)
        .filter(Boolean);

    const serializedInbox = references
        .filter((reference) => inboxIDs.includes(reference.id))
        .map(serializeReferences)
        .filter(Boolean);


    const content =
        JSON.stringify({
            _meta: {
                version: '2.0',
                package: 'web-sdk',
                lang: 'js',
                name: 'Endpoint Web SDk'
            },
            Thread: [
                ...threadReferences.filter((ref) => ref?.type === 'class').map((ref) => {
                    return {
                        title: ref?.name,
                        content: [ref]
                    };
                }),
                {
                    title: 'Types',
                    content: threadReferences.filter((ref) => ref?.type === 'type')
                }

            ],
            Store: [
                ...serializedStore.filter(ref => ref?.type === 'class').map(ref => {
                    return {
                        title: ref?.name,
                        content: [ref]
                    };
                }),
                {
                    title: 'Types',
                    content: serializedStore.filter((ref) => ref?.type === 'type')
                }
            ],
            Inbox: [
                ...serializedInbox.filter((ref) => ref?.type === 'class').map((ref) => {
                    return {
                        title: ref?.name,
                        content: [ref]
                    };
                }),
                {
                    title: 'Types',
                    content: serializedInbox.filter((ref) => ref?.type === 'type')
                }
            ],
            Core: [
                ...serializedCore.filter((ref) => ref?.type === 'class').map((ref) => {
                    return {
                        title: ref?.name,
                        content: [ref]
                    };
                }),
                {
                    title: 'Types',
                    content: serializedCore.filter((ref) => ref?.type === 'type')
                }
            ],
            Crypto: [
                ...serializedCrypto.filter((ref) => ref?.type === 'class').map((ref) => {
                    return {
                        title: ref?.name,
                        content: [ref]
                    };
                })
            ]
        });

    await writeFile(join(__dirname, './out.json'), content);
}

main();
