import * as fs from "fs";
import * as path from "path";
import { IOC } from "./index";

export interface Registry {
    register(type: unknown): void;
}

export class Scanner {
    
    static DEBUG = false;
    
    static registerToIoc(ioc: IOC, dirPath: string, filter?: RegExp) {
        return Scanner.scan(ioc, dirPath, filter);
    }
    
    static findTypes(dirPath: string, filter?: RegExp) {
        const list: unknown[] = [];
        Scanner.scan({register: type => list.push(type)}, dirPath, filter);
        return list;
    }
    
    static scan(registry: Registry, dirPath: string, filter?: RegExp) {
        const entries = fs.readdirSync(dirPath);
        for (const entry of entries) {
            const entryPath = path.resolve(dirPath, entry);
            if (fs.statSync(entryPath).isDirectory()) {
                this.scan(registry, entryPath, filter);
            }
            else if (entry.endsWith(".js") && (!filter || filter.test(entry))) {
                try {
                    const module = require(entryPath);
                    for (const key in module) {
                        const exported = module[key];
                        if (typeof(exported) == "function") {
                            if (Scanner.DEBUG) {
                                console.log(`Register ${exported.name} from ${entryPath}`);
                            }
                            registry.register(exported);
                        }
                    }
                }
                catch (e) {
                    console.log(`Error during registering module ${entryPath} in IOC`, e);
                }
            }
        }
    }
}
