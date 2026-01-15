export interface IMemoryLayer {
    id: string;
    name: string;
    read(key: string): Promise<any>;
    write(key: string, value: any): Promise<void>;
    clear(): Promise<void>;
}
