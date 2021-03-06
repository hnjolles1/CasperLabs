import * as externals from "./externals";
import {arrayToTyped} from "./utils";
import {UREF_SERIALIZED_LENGTH} from "./constants";
import {URef} from "./uref";
import {PublicKey, PUBLIC_KEY_ED25519_ID} from "./key";

export enum AddKeyFailure {
    // Success
    Ok = 0,
    // Unable to add new associated key because maximum amount of keys is reached
    MaxKeysLimit = 1,
    // Unable to add new associated key because given key already exists
    DuplicateKey = 2,
    // Unable to add new associated key due to insufficient permissions
    PermissionDenied = 3,
}

export enum UpdateKeyFailure {
    Ok = 0,
    // Key does not exist in the list of associated keys.
    MissingKey = 1,
    // Unable to add new associated key due to insufficient permissions
    PermissionDenied = 2,
    // Unable to update weight that would fall below any of action thresholds
    ThresholdViolation = 3,
}

export enum RemoveKeyFailure {
    Ok = 0,
    // Key does not exist in the list of associated keys.
    MissingKey = 1,
    // Unable to remove associated key due to insufficient permissions
    PermissionDenied = 2,
    // Unable to remove a key which would violate action threshold constraints
    ThresholdViolation = 3,
}

export enum SetThresholdFailure {
    Ok = 0,
    // New threshold should be lower or equal than deployment threshold
    KeyManagementThreshold = 1,
    // New threshold should be lower or equal than key management threshold
    DeploymentThreshold = 2,
    // Unable to set action threshold due to insufficient permissions
    PermissionDeniedError = 3,
    // New threshold should be lower or equal than total weight of associated keys
    InsufficientTotalWeight = 4,
}

export enum ActionType {
    // Required by deploy execution.
    Deployment = 0,
    // Required when adding/removing associated keys, changing threshold levels.
    KeyManagement = 1,
}

export function addAssociatedKey(publicKey: PublicKey, weight: i32): AddKeyFailure {
    const publicKeyBytes = publicKey.toBytes();
    const ret = externals.add_associated_key(publicKeyBytes.dataStart, publicKeyBytes.length, weight);
    return <AddKeyFailure>ret;
}

export function setActionThreshold(actionType: ActionType, thresholdValue: u8): SetThresholdFailure {
    const ret = externals.set_action_threshold(<i32>actionType, thresholdValue);
    return <SetThresholdFailure>ret;
}

export function updateAssociatedKey(publicKey: PublicKey, weight: i32): UpdateKeyFailure {
    const publicKeyBytes = publicKey.toBytes();
    const ret = externals.update_associated_key(publicKeyBytes.dataStart, publicKeyBytes.length, weight);
    return <UpdateKeyFailure>ret;
}

export function removeAssociatedKey(publicKey: PublicKey): RemoveKeyFailure {
    const publicKeyBytes = publicKey.toBytes();
    const ret = externals.remove_associated_key(publicKeyBytes.dataStart, publicKeyBytes.length);
    return <RemoveKeyFailure>ret;
}

export function getMainPurse(): URef | null {
    let data = new Uint8Array(UREF_SERIALIZED_LENGTH);
    data.fill(0);
    externals.get_main_purse(data.dataStart);
    let urefResult = URef.fromBytes(data);
    if (urefResult.hasError()) {
        return null;
    }
    return urefResult.value;
}
