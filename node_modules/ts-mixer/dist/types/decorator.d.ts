import { Class } from './types';
declare type ObjectOfDecorators<T extends PropertyDecorator | MethodDecorator> = {
    [key: string]: T[];
};
export declare type PropertyAndMethodDecorators = {
    property?: ObjectOfDecorators<PropertyDecorator>;
    method?: ObjectOfDecorators<MethodDecorator>;
};
declare type Decorators = {
    class?: ClassDecorator[];
    static?: PropertyAndMethodDecorators;
    instance?: PropertyAndMethodDecorators;
};
export declare const deepDecoratorSearch: (...classes: Class[]) => Decorators;
export declare const directDecoratorSearch: (...classes: Class[]) => Decorators;
export declare const getDecoratorsForClass: (clazz: Class) => Decorators;
export declare const decorate: <T extends PropertyDecorator | MethodDecorator | ClassDecorator>(decorator: T) => T;
export {};
