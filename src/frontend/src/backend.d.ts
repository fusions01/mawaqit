import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface backendInterface {
    getSettings(): Promise<{
        notificationsEnabled: boolean;
        adhanEnabled: boolean;
        calculationMethod: string;
    }>;
    getTasbihCount(): Promise<bigint>;
    incrementTasbih(): Promise<bigint>;
    resetTasbih(): Promise<void>;
    saveSettings(calculationMethod: string, adhanEnabled: boolean, notificationsEnabled: boolean): Promise<void>;
}
