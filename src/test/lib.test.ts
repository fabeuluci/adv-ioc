import * as assert from "assert";
import { Inject, Injectable, InjectNamed, IOC } from "../index";
import { Scanner } from "../Scanner";

it("Register lazy created singleton", () => {
    
    class Foo {
    }
    
    class Bar {
        constructor(public foo: Foo) {
        }
    }
    
    const ioc = new IOC();
    ioc.register(Foo);
    ioc.register(Bar);
    
    assert(ioc.resolve("foo") instanceof Foo);
    assert(ioc.resolve("bar") instanceof Bar);
    assert(ioc.resolve("foo") === ioc.resolve<Bar>("bar").foo);
});

it("Register singleton under name", () => {
    
    class Foo {
    }
    
    const ioc = new IOC();
    ioc.registerWithName("bar", Foo);
    
    assert(ioc.resolve("bar") instanceof Foo);
});

it("Register value", () => {
    const ioc = new IOC();
    ioc.registerValue("foo", 123);
    
    assert(ioc.resolve("foo") === 123);
});

it("Register factory", () => {
    
    class Foo {
        constructor(public logger: Logger) {
        }
        
        foo() {
            return this.logger.log("abc");
        }
    }
    
    class Logger {
        constructor(public name: string) {
        }
        
        log(...args: unknown[]) {
            return `[${this.name}] ${args.join (" ")}`;
        }
    }
    
    const ioc = new IOC();
    ioc.register(Foo);
    ioc.registerFactory("logger", (_parent: unknown, parentName: string|null, _propertyName: string) => {
        return new Logger(parentName || "<unknown>");
    });
    
    assert(ioc.resolve<Foo>("foo").foo(), "[foo] abc");
});

it("Create object", () => {
    
    class Foo {
    }
    
    const ioc = new IOC();
    ioc.register(Foo);
    
    assert(ioc.create("foo") instanceof Foo);
});

it("Create object of not registered class", () => {
    
    class A {
    }
    
    const ioc = new IOC();
    assert(ioc.createEx(A) instanceof A);
});

it("Create object with one-time dependency map", () => {
    
    class A {
        constructor(public foo: string, public abc: number) {
        }
    }
    
    const ioc = new IOC();
    assert(ioc.createEx(A, {foo: "bar", abc: 123}) instanceof A);
});

it("Inject dependency into property", () => {
    
    class A {
        
        @Inject foo!: string;
        
    }
    
    const ioc = new IOC();
    ioc.registerValue("foo", "bar");
    assert(ioc.createEx(A).foo === "bar");
});

it("Inject dependency into renamed property", () => {
    
    class A {
        
        @InjectNamed("foo") myVariable!: string;
        
    }
    
    const ioc = new IOC();
    ioc.registerValue("foo", "bar");
    assert(ioc.createEx(A).myVariable === "bar");
});

it("Usage injected property in constructor", () => {
    
    class A {
        
        @Inject foo!: string;
        test: string;
        
        constructor() {
            this.test = this.foo;
        }
    }
    
    const ioc = new IOC();
    ioc.registerValue("foo", "bar");
    assert(ioc.createEx(A).test === undefined);
});

it("Usage injected property in constructor 2", () => {
    
    class A extends Injectable {
        
        @Inject foo!: string;
        test: string;
        
        constructor() {
            super();
                this.test = this.foo;
        }
    }
    
    const ioc = new IOC();
    ioc.registerValue("foo", "bar");
    assert(ioc.createEx(A).test === "bar");
});

it("Should register classes from dir", () => {
    
    const ioc = new IOC();
    Scanner.registerToIoc(ioc, __dirname);
    
    assert(ioc.resolve("a") !== null);
    assert(ioc.resolve("b") !== null);
    assert(ioc.resolve("c") !== null);
});

it("Should find classes in dir", () => {
    
    const types = Scanner.findTypes(__dirname);
    
    assert(types.length === 3);
    assert((<Function>types[0]).name === "A");
    assert((<Function>types[1]).name === "B");
    assert((<Function>types[2]).name === "C");
});
