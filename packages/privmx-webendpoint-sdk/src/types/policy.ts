/** Represents the inheritance options for policies */
type PolicyInheritance = 'inherit' | 'default' | 'none' | 'all';

/** Represents the single roles available for containers */
type SingleContainerRole = 'user' | 'manager' | 'owner';

/** Represents the single roles available for items */
export type SingleItemRole = 'user' | 'manager' | 'owner' | 'itemOwner';

/**
 * Helper type for creating unique role combinations
 * @template T - The base type for role combinations
 */
type UniqueRoleCombination<T extends string, U extends string = T> = T extends any
    ? T | `${T}&${Exclude<U, T>}` | `${T},${UniqueRoleCombination<Exclude<U, T>>}`
    : never;

/** Represents valid role combinations for container policies */
export type ContainerRoleCombination = UniqueRoleCombination<SingleContainerRole>;

/** Represents valid role combinations for item policies with all roles */
export type ItemRoleCombinationAll = UniqueRoleCombination<SingleItemRole>;

/** Represents valid role combinations for item policies without 'itemOwner' */
export type ItemRoleCombinationNoItemOwner = UniqueRoleCombination<
    Exclude<SingleItemRole, 'itemOwner'>
>;

/** Represents the valid policy values for containers */
export type ContainerPolicyValue = PolicyInheritance | ContainerRoleCombination;

/** Represents the options for updater and owner removal policies */
type RemovalPolicy = 'inherit' | 'default' | 'yes' | 'no';

/** Represents the valid policy values for items with all roles */
export type ItemPolicyValueAll = PolicyInheritance | ItemRoleCombinationAll;

/** Represents the valid policy values for items without 'itemOwner' */
export type ItemPolicyValueNoItemOwner = PolicyInheritance | ItemRoleCombinationNoItemOwner;

/** Represents the policy structure for containers, excluding item-specific rules */
export interface ContainerWithoutItemPolicy {
    /** Policy for getting the container */
    get?: ContainerPolicyValue;
    /** Policy for updating the container */
    update?: ContainerPolicyValue;
    /** Policy for updating the container's policy */
    updatePolicy?: ContainerPolicyValue;
    /** Policy for deleting the container */
    delete?: ContainerPolicyValue;
    /** Policy for removing updaters from managers */
    updaterCanBeRemovedFromManagers?: RemovalPolicy;
    /** Policy for removing owners from managers */
    ownerCanBeRemovedFromManagers?: RemovalPolicy;
}

/** Represents the complete policy structure for containers, including item-specific rules */
export interface ContainerPolicy extends ContainerWithoutItemPolicy {
    /** Policy for items within the container */
    item?: ItemPolicyForContainer;
    /** These properties are not allowed in ContainerPolicy */
    listMy?: never;
    listAll?: never;
    create?: never;
    canOverwriteContextPolicy?: never;
    creatorHasToBeManager?: never;
}

/** Represents the policy structure for items within a container */
export interface ItemPolicyForContainer {
    /** Policy for getting an item */
    get?: ItemPolicyValueAll;
    /** Policy for listing items owned by the user */
    listMy?: ItemPolicyValueNoItemOwner;
    /** Policy for listing all items */
    listAll?: ItemPolicyValueNoItemOwner;
    /** Policy for creating an item */
    create?: ItemPolicyValueNoItemOwner;
    /** Policy for updating an item */
    update?: ItemPolicyValueAll;
    /** Policy for deleting an item */
    delete?: ItemPolicyValueAll;
}