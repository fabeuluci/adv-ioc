# adv-ioc

## Register class
Register lazy created singleton
```
import { IOC } from "adv-ioc";

class Foo {
}

class Bar {
    constructor(public foo: Foo) {
    }
}

const ioc = new IOC();
ioc.register(Foo);
ioc.register(Bar);
console.log(ioc.resolve("foo")); // prints Foo {}
console.log(ioc.resolve("bar")); // prints Bar { foo: Foo {} }
console.log(ioc.resolve("foo") === ioc.resolve<Bar>("bar").foo); // prints true
```

## Register singleton under name
Register lazy created singleton
```
import { IOC } from "adv-ioc";

class Foo {
}

const ioc = new IOC();
ioc.registerWithName("bar", Foo);
console.log(ioc.resolve("bar")); // prints Foo {}
```

## Register value
Register prepared value
```
import { IOC } from "adv-ioc";
const ioc = new IOC();
ioc.registerValue("foo", 123);
console.log(ioc.resolve("foo")); // prints 123
```

## Register factory
The best to register loggers, to factory as parameters are passed: class, class name, and property name
```
import { IOC } from "adv-ioc";

class Foo {
    constructor(public logger: Logger) {
    }
    
    foo() {
        this.logger.log("abc");
    }
}

class Logger {
    constructor(public name: string) {
    }
    
    log(...args: unknown[]) {
        console.log(`[${this.name}]`, ...args);
    }
}

const ioc = new IOC();
ioc.register(Foo);
ioc.registerFactory("logger", (parent: unknown, parentName: string|null, propertyName: string) => {
    return new Logger(parentName || "<unknown>");
});
ioc.resolve<Foo>("foo").foo(); // prints "[foo] abc"
```

## Create object
If you want to create new instance of registered class (not to create singleton), use the `create` method instead of `resolve` method.
```
import { IOC } from "adv-ioc";

class Foo {
}

const ioc = new IOC();
ioc.register(Foo);
console.log(ioc.create("foo")); // prints Foo {}
```

## Create object of not registered class
```
import { IOC } from "adv-ioc";

class A {
}

const ioc = new IOC();
console.log(ioc.createEx(A)); // prints A {}
```

## Create object with one-time dependency map
```
import { IOC } from "adv-ioc";

class A {
    constructor(public foo: string, public abc: number) {
    }
}

const ioc = new IOC();
console.log(ioc.createEx(A, {foo: "bar", abc: 123})); // prints A { foo: "bar", abc: 123}
```

## Inject dependency into property
Use `@Inject` decorator. To supress typescript no-initializer error, add exclamation and the end of the variable name
```
import { IOC, Inject } from "adv-ioc";

class A {
    
    @Inject foo!: string;
    
}

const ioc = new IOC();
ioc.registerValue("foo", "bar");
console.log(ioc.createEx(A)); // prints A { foo: "bar" }
```

## Inject dependency into renamed property
Use `@InjectNamed` decorator.
```
import { IOC, InjectNamed } from "adv-ioc";

class A {
    
    @InjectNamed("foo") myVariable!: string;
    
}

const ioc = new IOC();
ioc.registerValue("foo", "bar");
console.log(ioc.createEx(A)); // prints A { myVariable: "bar" }
```

## Usage injected property in constructor
Injected property in constructor will be undefined
```
import { IOC, Inject } from "adv-ioc";

class A {
    
    @Inject foo!: string;
    
    constructor() {
        console.log(this.foo);
    }
}

const ioc = new IOC();
ioc.registerValue("foo", "bar");
console.log(ioc.createEx(A)); // prints undefined and then A { foo: "bar" }
```

To fix it extends `Injectable` class

```
import { IOC, Inject, Injectable } from "adv-ioc";

class A extends Injectable {
    
    @Inject foo!: string;
    
    constructor() {
        super();
        console.log(this.foo);
    }
}

const ioc = new IOC();
ioc.registerValue("foo", "bar");
console.log(ioc.createEx(A)); // prints "bar" and then A { foo: "bar" }
```

## Register multiple entries from directory
You can also use scanner to add all your servies to ioc. It works only in node context.
```
import { IOC } from "adv-ioc";
import { Scanner } from "adv-ioc/out/Scanner";

const ioc = new IOC();
Scanner.registerToIoc(ioc, "/path/to/services");
```
You can pass filter to take only valid files
```
Scanner.registerToIoc(ioc, "/path/to/services", /.*Service\.js$/);
```
You can also turn on debug mode to see which classes from which files are added
```
Scanner.DEBUG = true;
```
