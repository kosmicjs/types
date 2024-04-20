/* =================== USAGE ===================

    import session = require("koa-session");
    import Koa = require("koa");

    var app = new Koa();
    app.use(session(app));

 =============================================== */

import Cookies = require('cookies');
import Koa = require('./koa');

declare namespace session {
  /**
  * Session model.
  */
  interface Session {
    /**
    * JSON representation of the session.
    */
    toJSON(): object;

    /**
      * alias to `toJSON`
      */
    inspect(): object;

    /**
      * Return how many values there are in the session object.
      * Used to see if it"s "populated".
      */
    readonly length: number;

    /**
      * populated flag, which is just a boolean alias of .length.
      */
    readonly populated: boolean;

    /**
    * get/set session maxAge
    */
    maxAge: Config['maxAge'];

    /**
      * commit this session's headers if autoCommit is set to false.
      */
    manuallyCommit(): Promise<void>;

    /**
      * regenerate this session
      */
    regenerate(callback?: () => void): void;

    /**
      * save this session no matter whether it is populated
      */
    save(callback?: () => void): void;

    /**
      * allow to put any value on session object
      */
    [_: string]: any;
  }

  interface ContextSession {
    ctx: Koa.Context;

    app: Koa;

    opts: Config;

    store: Store;

    session: Session | false;

    /**
      * internal logic of `ctx.session`
      */
    get(): Session;

    /**
      * internal logic of `ctx.session=`
      */
    set(val: any): void;

    prevHash: string;

    /**
      * init session from external store
      * will be called in the front of session middleware
      */
    initFromExternal(): Promise<void>;

    /**
      * Commit the session changes or removal.
      */
    commit(): Promise<void>;
  }

  interface util {
    /**
      * Decode the base64 cookie value to an object.
      */
    decode(str: string): object;

    /**
      * Encode an object into a base64-encoded JSON string.
      */
    encode(obj: object): string;

    hash(sess: any): string;
  }

  interface Config
    extends Omit<Cookies.SetOption, 'maxAge'> {
    /**
      * cookie key (default is koa:sess)
      */
    key: string;

    /**
      * maxAge in ms (default is 1 days)
      * "session" will result in a cookie that expires when session/browser is closed
      * Warning: If a session cookie is stolen, this cookie will never expire
      */
    maxAge?: number | 'session' | undefined;

    /**
          * custom encode method
          */
    encode: util['encode'];

    /**
      * custom decode method
      */
    decode: util['decode'];

    /**
      * The way of generating external session id is controlled by the options.genid, which defaults to Date.now() + "-" + uid.sync(24).
      */
    genid: () => string;

    /**
      * Force a session identifier cookie to be set on every response. The expiration is reset to the original maxAge, resetting the expiration countdown. default is false
      */
    rolling?: boolean | undefined;

    /**
      * Renew session when session is nearly expired, so we can always keep user logged in. (default is false)
      */
    renew?: boolean | undefined;

    /**
      * You can store the session content in external Store(redis, mongodb or other DBs)
      */
    store?: Store | undefined;

    /**
      * External key is used the cookie by default,
      * but you can use options.externalKey to customize your own external key methods.
      */
    externalKey?: ExternalKeys | undefined;

    /**
      * If your session store requires data or utilities from context, opts.ContextStore is alse supported.
      * ContextStore must be a class which claims three instance methods demonstrated above.
      * new ContextStore(ctx) will be executed on every request.
      */
    ContextStore?: (new(ctx: Koa.ParameterizedContext) => Store) | undefined;

    /**
      * If you want to add prefix for all external session id, you can use options.prefix, it will not work if options.genid present.
      */
    prefix?: string | undefined;

    /**
      * Hook: valid session value before use it
      */
    valid?(ctx: Koa.Context, session: Partial<Session>): void;

    /**
      * Hook: before save session
      */
    beforeSave?(ctx: Koa.Context, session: Session): void;

    /**
      * (boolean) automatically commit headers (default true).
      */
    autoCommit?: boolean;
  }

  interface Store {
    /**
      * get session object by key
      */
    get(key: string, maxAge: Config['maxAge'], data: {rolling: Config['rolling']}): any;

    /**
      * set session object for key, with a maxAge (in ms)
      */
    set(
      key: string,
      sess: Partial<Session> & {_expire?: number | undefined; _maxAge?: number | undefined},
      maxAge: Config['maxAge'],
      data: {changed: boolean; rolling: Config['rolling']},
    ): any;

    /**
      * destroy session for key
      */
    destroy(key: string): any;
  }

  interface ExternalKeys {
    /**
      * get session object by key
      */
    get(ctx: Koa.Context): string | undefined;

    /**
      * set session object for key, with a maxAge (in ms)
      */
    set(ctx: Koa.Context, value: any): void;
  }
}

declare function session(
  CONFIG: Partial<session.Config>,
  app: Koa,
): Koa.Middleware;

declare function session(
  app: Koa,
): Koa.Middleware;

declare module 'koa' {
  interface Context {
    session: session.Session | null;
    readonly sessionOptions: session.Config | undefined;
  }
}

export = session;

