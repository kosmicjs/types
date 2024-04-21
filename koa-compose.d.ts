import type Koa from 'koa';

declare function compose(middleware: Koa.Middleware[]): Koa.Middleware;

export = compose;
