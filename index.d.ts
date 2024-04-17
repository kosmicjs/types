
/// <reference types="node" />
import {EventEmitter} from 'node:events';
import {type ParsedUrlQuery} from 'node:querystring';
import type Stream from 'node:stream';
import type {Buffer} from 'node:buffer';
import util from 'node:util';
import {type TLSSocket} from 'node:tls';
import {
  type Server,
  type OutgoingHttpHeaders,
  type OutgoingMessage,
  type IncomingHttpHeaders,
  type IncomingMessage,
  type ServerResponse,
} from 'node:http';
import {type Socket} from 'node:net';
import {type AsyncLocalStorage} from 'node:async_hooks';
import type accepts from 'accepts';
import type httpAssert from 'http-assert';
import type * as Cookies from 'cookies';
import {type UnknownRecord, type Simplify, type SetOptional} from 'type-fest';
import {
  type HttpError,
  type HttpErrorConstructor,
  type UnknownError,
} from 'http-errors';
import {type Options as ContentDispositionOptions} from 'content-disposition';

declare namespace Koa {
  /**
   * The next function caller in a Koa Middleware chain.
   * Always returns a promise and allows for fine grained middleware control flow.
   */
  export type Next = () => Promise<unknown>;

  /**
   * Composeable middleware.
   *
   * @param context - The Koa extended context object
   * @param next - The next function to be call the next next middleware in the middleware chain.
   */
  export type Middleware<C = Context> = (
    /**
     * The Koa extended context object
     */
    context: C,
    /**
     * The next function to be call the next next middleware in the middleware chain.
     * Always returns a promise and allows for fine grained middleware control flow.
     *
     */
    next: Next,
  ) => Promise<unknown>;

  export interface Options {
    env?: string;
    keys?: string[];
    proxy?: boolean;
    subdomainOffset?: number;
    proxyIpHeader?: string;
    maxIpsCount?: number;
    compose?: (middleware: Middleware[]) => Middleware;
    asyncLocalStorage?: boolean;
  }

  interface RequestExtras extends UnknownRecord {
    req: IncomingMessage;
    res: ServerResponse;
    originalUrl: string | undefined;
    app: Koa;
    memoizedURL: URL | Record<string, unknown>;
    ctx: Context;
    response: KoaResponse;
    _accept: accepts.Accepts;
    _querycache: Record<string, ParsedUrlQuery>;
    [IP: symbol]: string;
  }

  interface BaseRequest {
    /**
     * Return request header.
     *
     * @return {Object},
     * @api public
     */
    header: IncomingHttpHeaders;
    /**
     * Return request header, alias as request.header
     *
     * @return {Object},
     * @api public
     */
    headers: IncomingHttpHeaders;
    /**
     * Get request URL.
     */
    url: string | undefined;
    /**
     * Get origin of URL.
     *
     */
    readonly origin: string;
    /**
     * Get full request URL.
     *
     * @return {String},
     * @api public
     */
    readonly href: string | undefined;
    /**
     * Return the request mime type void of
     * parameters such as "charset".
     *
     * @return {String},
     * @api public
     */
    readonly type: string;
    /**
     * Get request method.
     *
     * @return {String},
     * @api public
     */
    method: string | undefined;
    /**
     * Get request pathname.
     *
     * @return {String},
     * @api public
     */
    path: string | undefined;
    /**
     * Get parsed query string.
     *
     * @return {Object},
     * @api public
     */
    query: ParsedUrlQuery;
    /**
     * Get query string.
     *
     * @return {String},
     * @api public
     */
    querystring: string;
    /**
     * Get the search string. Same as the query string
     * except it includes the leading ?.
     *
     * @return {String},
     * @api public
     */
    search: string;
    /**
     * Parse the "Host" header field host
     * and support X-Forwarded-Host when a
     * proxy is enabled.
     *
     * @return {String}, hostname:port
     * @api public
     */
    readonly host: string;
    /**
     * Parse the "Host" header field hostname
     * and support X-Forwarded-Host when a
     * proxy is enabled.
     *
     * @return {String}, hostname
     * @api public
     */
    readonly hostname: string;
    /**
     * Get WHATWG parsed URL.
     * Lazily memoized.
     *
     * @return {URL},
     * @api public
     */
    readonly URL: URL | UnknownRecord;
    /**
     * Check if the request is fresh, aka
     * Last-Modified and/or the ETag
     * still match.
     *
     * @return {Boolean},
     * @api public
     */
    readonly fresh: boolean;
    /**
     * Check if the request is stale, aka
     * "Last-Modified" and / or the "ETag" for the
     * resource has changed.
     *
     * @return {Boolean},
     * @api public
     */
    readonly stale: boolean;
    /**
     * Check if the request is idempotent.
     *
     * @return {Boolean},
     * @api public
     */
    readonly idempotent: boolean;
    /**
     * Return the request socket.
     *
     * @return {Connection},
     * @api public
     */
    readonly socket: TLSSocket | Socket;
    /**
     * Get the charset when present or undefined.
     *
     * @return {String},
     * @api public
     */
    readonly charset: string;
    /**
     * Return parsed Content-Length when present.
     *
     * @return {Number},
     * @api public
     */
    readonly length?: number;
    /**
     * Return the protocol string "http" or "https"
     * when requested with TLS. When the proxy setting
     * is enabled the "X-Forwarded-Proto" header
     * field will be trusted. If you're running behind
     * a reverse proxy this supplies https for you (this as unknown as Application)
     * may be enabled.
     *
     * @return {String},
     * @api public
     */
    readonly protocol: string;
    /**
     * Shorthand for:
     *
     *    (this as unknown as Application).protocol == 'https'
     *
     * @return {Boolean},
     * @api public
     */
    readonly secure: boolean;
    /**
     * When `app.proxy` is `true`, parse
     * the "X-Forwarded-For" ip address list.
     *
     * For example if the value was "client, proxy1, proxy2"
     * you would receive the array `["client", "proxy1", "proxy2"]`
     * where "proxy2" is the furthest down-stream.
     *
     * @return {Array},
     * @api public
     */
    readonly ips: string[];
    /**
     * Return request's remote address
     * When `app.proxy` is `true`, parse
     * the "X-Forwarded-For" ip address list and return the first one
     *
     * @return {String},
     * @api public
     */
    ip: string;
    /**
     * Return subdomains as an array.
     *
     * Subdomains are the dot-separated parts of the host before the main domain
     * of the app. By default, the domain of the app is assumed to be the last two
     * parts of the host. (this as unknown as Application) can be changed by setting `app.subdomainOffset`.
     *
     * For example, if the domain is "tobi.ferrets.example.com":
     * If `app.subdomainOffset` is not set, (this as unknown as Application).subdomains is
     * `["ferrets", "tobi"]`.
     * If `app.subdomainOffset` is 3, (this as unknown as Application).subdomains is `["tobi"]`.
     *
     * @return {Array},
     * @api public
     */
    readonly subdomains: string[];
    /**
     * Get accept object.
     * Lazily memoized.
     *
     * @return {Object},
     * @api private
     */
    accept: accepts.Accepts;
    /**
     * Check if the given `type(s)` is acceptable, returning
     * the best match when true, otherwise `false`, in which
     * case you should respond with 406 "Not Acceptable".
     *
     * The `type` value may be a single mime type string
     * such as "application/json", the extension name
     * such as "json" or an array `["json", "html", "text/plain"]`. When a list
     * or array is given the _best_ match, if any is returned.
     *
     * @example
     * ```ts
     *     // Accept: text/html
     *     this.accepts('html');
     *     // => "html"
     *
     *     // Accept: text/*, application/json
     *     this.accepts('html');
     *     // => "html"
     *     this.accepts('text/html');
     *     // => "text/html"
     *     this.accepts('json', 'text');
     *     // => "json"
     *     this.accepts('application/json');
     *     // => "application/json"
     *
     *     // Accept: text/*, application/json
     *     this.accepts('image/png');
     *     this.accepts('png');
     *     // => false
     *
     *     // Accept: text/*;q=.5, application/json
     *     this.accepts(['html', 'json']);
     *     this.accepts('html', 'json');
     *     // => "json"
     * ```
     *
     * @param {String|Array} type(s)...
     * @return {String|Array|false}
     * @api public
     */
    accepts(...args: string[]): string | string[] | boolean;
    /**
     * Return accepted encodings or best fit based on `encodings`.
     *
     * Given `Accept-Encoding: gzip, deflate`
     * an array sorted by quality is returned:
     *
     *     ['gzip', 'deflate']
     *
     * @param {String|Array}, encoding(s)...
     * @return {String|Array},
     * @api public
     */
    acceptsEncodings(
      ...args: string[]
    ): ReturnType<accepts.Accepts['encodings']>;
    /**
     * Return accepted charsets or best fit based on `charsets`.
     *
     * Given `Accept-Charset: utf-8, iso-8859-1;q=0.2, utf-7;q=0.5`
     * an array sorted by quality is returned:
     *
     *     ['utf-8', 'utf-7', 'iso-8859-1']
     *
     * @param {String|Array}, charset(s)...
     * @return {String|Array},
     * @api public
     */
    acceptsCharsets(...args: string[]): ReturnType<accepts.Accepts['charset']>;
    /**
     * Return accepted languages or best fit based on `langs`.
     *
     * Given `Accept-Language: en;q=0.8, es, pt`
     * an array sorted by quality is returned:
     *
     *     ['es', 'pt', 'en']
     *
     * @param {String|Array}, lang(s)...
     * @return {Array|String},
     * @api public
     */
    acceptsLanguages(
      ...args: string[]
    ): ReturnType<accepts.Accepts['languages']>;
    /**
     * Check if the incoming request contains the "Content-Type"
     * header field and if it contains any of the given mime `type`s.
     * If there is no request body, `null` is returned.
     * If there is no content type, `false` is returned.
     * Otherwise, it returns the first `type` that matches.
     *
     * @example
     * ```ts
     *     // With Content-Type: text/html; charset=utf-8
     *     this.is('html'); // => 'html'
     *     this.is('text/html'); // => 'text/html'
     *     this.is('text/*', 'application/json'); // => 'text/html'
     *
     *     // When Content-Type is application/json
     *     this.is('json', 'urlencoded'); // => 'json'
     *     this.is('application/json'); // => 'application/json'
     *     this.is('html', 'application/*'); // => 'application/json'
     *
     *     this.is('html'); // => false
     * ```
     * @param {String|String[]} [type]
     * @param {String[]} [types]
     * @return {String|false|null}
     * @api public
     */
    is(type: string, ...types: string[]): string | boolean | undefined;
    /**
     * Return request header.
     *
     * The `Referrer` header field is special-cased,
     * both `Referrer` and `Referer` are interchangeable.
     *
     * Examples:
     *
     *     this.get('Content-Type');
     *     // => "text/plain"
     *
     *     this.get('content-type');
     *     // => "text/plain"
     *
     *     this.get('Something');
     *     // => ''
     *
     * @param {String} field
     * @return {String},
     * @api public
     */
    get(field: string): string;
    /**
     * Inspect implementation.
     *
     * @return {Object},
     * @api public
     */
    inspect(): UnknownRecord | undefined;
    /**
     * Return JSON representation.
     *
     * @return {Object},
     * @api public
     */
    toJSON(): UnknownRecord;
  }

  interface InternalKoaRequest
    extends Simplify<BaseRequest & Partial<RequestExtras>> {}

  /**
   * To help maintain type compatibility with current third party types we
   * can just use the names of the types instead of the types themselves for extending where we want
   */
  export interface Request {}

  export interface KoaRequest
    extends Simplify<BaseRequest & RequestExtras & Request> {}

  interface ResponseExtras extends UnknownRecord {
    app: Koa;
    res: ServerResponse;
    req: IncomingMessage;
    request: KoaRequest;
    _explicitNullBody: boolean;
    _explicitStatus: boolean;
    _body: Stream | Buffer | string | UnknownRecord | undefined;
    ctx: Context;
  }
  interface ResponseBody {}

  interface BaseResponse<Body = ResponseBody> {
    /**
     * Return the request socket.
     *
     * @return {Connection}
     * @api public
     */
    readonly socket: TLSSocket | Socket | undefined;
    /**
     * Return response header.
     *
     * @return {Object}
     * @api public
     */
    readonly header: OutgoingHttpHeaders | undefined;
    /**
     * Return response header, alias as response.header
     *
     * @return {Object}
     * @api public
     */
    readonly headers: OutgoingHttpHeaders | undefined;
    /**
     * Get response status code.
     *
     * @return {Number}
     * @api public
     */
    status: number;
    /**
     * Get response status message
     *
     * @return {String}
     * @api public
     */
    message: string;
    /**
     * Get response body.
     *
     * @return {Mixed}
     * @api public
     */
    body: unknown;
    /**
     * Return parsed response Content-Length when present.
     *
     * @return {Number}
     * @api public
     */
    length: number | undefined;
    /**
     * Get the Last-Modified date in Date form, if it exists.
     *
     * @return {Date}
     * @api public
     */
    lastModified?: Date | string;
    /**
     * Get the ETag of a response.
     *
     * @return {String}
     * @api public
     */
    etag: string;
    /**
     * Return the response mime type void of
     * parameters such as "charset".
     *
     * @return {String}
     * @api public
     */
    type: string;
    /**
     * Check if a header has been written to the socket.
     *
     * @return {Boolean}
     * @api public
     */
    readonly headerSent: boolean;
    /**
     * Checks if the request is writable.
     * Tests for the existence of the socket
     * as node sometimes does not set it.
     *
     * @return {Boolean}
     * @api private
     */
    readonly writable: boolean;
    /**
     * Vary on `field`.
     *
     * @param {String} field
     * @api public
     */
    vary(field: string): void;
    /**
     * Perform a 302 redirect to `url`.
     *
     * The string "back" is special-cased
     * to provide Referrer support, when Referrer
     * is not present `alt` or "/" is used.
     *
     * Examples:
     *
     *    that.redirect('back');
     *    that.redirect('back', '/index.html');
     *    that.redirect('/login');
     *    that.redirect('http://google.com');
     *
     * @param {String} url
     * @param {String} [alt]
     * @api public
     */
    redirect(url: string, alt?: string): void;
    /**
     * Set Content-Disposition header to "attachment" with optional `filename`.
     *
     * @param {String} filename
     * @api public
     */
    attachment(filename?: string, options?: ContentDispositionOptions): void;
    /**
     * Check whether the response is one of the listed types.
     * Pretty much the same as `that.request.is()`.
     *
     * @param {String|String[]} [type]
     * @param {String[]} [types]
     * @return {String|false}
     * @api public
     */
    is(type: string, ...types: string[]): string | boolean;
    /**
     * Return response header.
     *
     * Examples:
     *
     *     that.get('Content-Type');
     *     // => "text/plain"
     *
     *     that.get('content-type');
     *     // => "text/plain"
     *
     * @param {String} field
     * @api public
     */
    get(field: string): ReturnType<OutgoingMessage['getHeader']>;
    /**
     * Returns true if the header identified by name is currently set in the outgoing headers.
     * The header name matching is case-insensitive.
     *
     * Examples:
     *
     *     that.has('Content-Type');
     *     // => true
     *
     *     that.get('content-type');
     *     // => true
     *
     * @param {String} field
     * @return {boolean}
     * @api public
     */
    has(field: string): boolean;
    /**
     * Set header `field` to `val` or pass
     * an object of header fields.
     *
     * Examples:
     *
     *    that.set('Foo', ['bar', 'baz']);
     *    that.set('Accept', 'application/json');
     *    that.set({ Accept: 'text/plain', 'X-API-Key': 'tobi' });
     *
     * @param {String|Object|Array} field
     * @param {String} val
     * @api public
     */
    set(
      field: string | Record<string, string | string[]> | string[],
      value?: string | string[] | number,
    ): void;
    /**
     * Append additional header `field` with value `val`.
     *
     * Examples:
     *
     * ```
     * that.append('Link', ['<http://localhost/>', '<http://localhost:3000/>']);
     * that.append('Set-Cookie', 'foo=bar; Path=/; HttpOnly');
     * that.append('Warning', '199 Miscellaneous warning');
     * ```
     *
     * @param {String} field
     * @param {String|Array} val
     * @api public
     */
    append(field: string, value: string | string[]): void;
    /**
     * Remove header `field`.
     *
     * @param {String} name
     * @api public
     */
    remove(field: string): void;
    /**
     * Inspect implementation.
     *
     * @return {Object}
     * @api public
     */
    inspect(): UnknownRecord | undefined;
    /**
     * Return JSON representation.
     *
     * @return {Object}
     * @api public
     */
    toJSON(): UnknownRecord;
    /**
     * Flush any set headers and begin the body
     */
    flushHeaders(): void;
  }
  /**
   * This type is meant to be used internally by Kosmic.
   */
  export interface InternalKoaResponse
    extends BaseResponse,
    Partial<ResponseExtras> {}
  /**
   * To help maintain type compatibility with current third party types we
   * can just use the names of the types instead of the types themselves for extending where we want
   */
  interface Response {}
  /**
   * The extendable type for the response object.
   */
  interface KoaResponse<Body = unknown>
    extends Simplify<BaseResponse<Body> & ResponseExtras & Response> {}
  /**
   * The types for the base context object
   */
  interface ContextBase {
    /**
     * Context can be used to store data
     * and pass it between middleware. Context properties
     * can be added globally at anytime using `app.context` or
     * per request within middleware.
     *
     * To add typed properties to Context, declare them in
     * the module of your choosing:
     *
     * ```ts
     * declare module '@kosmic/koa' {
     *   interface Context {
     *     myProperty: string;
     *   }
     * }
     * ```
     */
    [key: string | symbol]: unknown;
    /**
     * Similar to .throw(), adds assertion.
     *
     *    this.assert(this.user, 401, 'Please login!');
     *
     * See: https://github.com/jshttp/http-assert
     */
    assert: typeof httpAssert;
    /**
     * get and set cookies
     */
    cookies: Cookies | undefined;
    /**
     * util.inspect() implementation, which
     * just returns the JSON output.
     */
    inspect(): any;
    /**
     * Return JSON representation.
     *
     * Here we explicitly invoke .toJSON() on each
     * object, as iteration will otherwise fail due
     * to the getters and cause utilities such as
     * clone() to fail.
     */
    toJSON(): {
      request: any;
      response: any;
      app: any;
      originalUrl: any;
      req: string;
      res: string;
      socket: string;
    };
    /**
     * Throw an error with `status` (default 500) and
     * `msg`. Note that these are user-level
     * errors, and the message may be exposed to the client.
     *
     *    this.throw(403)
     *    this.throw(400, 'name required')
     *    this.throw('something exploded')
     *    this.throw(new Error('invalid'))
     *    this.throw(400, new Error('invalid'))
     *
     * See: https://github.com/jshttp/http-errors
     *
     * Note: `status` should only be passed as the first parameter.
     */
    throw(n: number | UnknownError, ...args: UnknownError[]): never;
    /**
     * Default error handling.
     *
     * Not for public use, avoid using this function
     *
     * @private
     */
    onerror(
      error:
      | SetOptional<HttpError, 'status' | 'statusCode' | 'expose'>
      | undefined,
    ): void;
  }
  /**
   * The context object delgate for the response
   */
  interface ContextResponseDelegation<ResponseBody> {
    /**
     * Set Content-Disposition header to "attachment" with optional `filename`.
     *
     * @example
     *
     * ctx.attachment('path/to/logo.png');
     */
    attachment: KoaResponse['attachment'];
    /**
     * Perform a [302] redirect to url.
     *
     * The string "back" is special-cased to provide Referrer support, when Referrer is not present alt or "/" is used.
     *
     * @example
     * ```ts
     * ctx.redirect('back');
     * ctx.redirect('back', '/index.html');
     * ctx.redirect('/login');
     * ctx.redirect('http://google.com');
     * ```
     *
     * To alter the default status of 302, simply assign the status before or after this call. To alter the body, assign it after this call:
     *
     * @example
     * ```ts
     * ctx.status = 301;
     * ctx.redirect('/cart');
     * ctx.body = 'Redirecting to shopping cart';
     * ```
     *
     * @param url - the url to redirect to or 'back'
     * @param alt - the url to redirect to if 'back' is used
     */
    redirect: KoaResponse['redirect'];
    /**
     * Remove header `field`.
     *
     * @param field - the field name to remove
     */
    remove: KoaResponse['remove'];
    /**
     * Vary on `field`.
     *
     * @param field - the field name to vary on
     */
    vary: KoaResponse['vary'];
    /**
     * Returns true if the header identified by name is currently set in the outgoing headers.
     * The header name matching is case-insensitive.
     *
     * Examples:
     *
     *     this.has('Content-Type');
     *     // => true
     *
     *     this.get('content-type');
     *     // => true
     *
     * @param field
     */
    has: KoaResponse['has'];
    /**
     * Set header `field` to `val` or pass
     * an object of header fields.
     *
     * Examples:
     *
     *    this.set('Foo', ['bar', 'baz']);
     *    this.set('Accept', 'application/json');
     *    this.set({ Accept: 'text/plain', 'X-API-Key': 'tobi' });
     *
     * @param {String|Object|Array} field
     * @param {String} val
     */
    set: KoaResponse['set'];
    /**
     * Append additional header `field` with value `val`.
     *
     * Examples:
     *
     * ```
     * this.append('Link', ['<http://localhost/>', '<http://localhost:3000/>']);
     * this.append('Set-Cookie', 'foo=bar; Path=/; HttpOnly');
     * this.append('Warning', '199 Miscellaneous warning');
     * ```
     *
     * @param field
     * @param val
     */
    append: KoaResponse['append'];
    /**
     * Flush any set headers and begin the body
     */
    flushHeaders: KoaResponse['flushHeaders'];
    /**
     * ctx.status=
     *
     * Get/set response status code.
     */
    status: KoaResponse['status'];
    /**
     * ctx.message
     *
     * Get/Set response status message
     */
    message: KoaResponse['message'];
    /**
     * ctx.body
     *
     * Get/Set response body.
     *
     * Set response body to one of the following:
     *
     * - `string` written
     * - `Buffer` written
     * - `Stream` piped
     * - `Object || Array` json-stringified
     * - `null || undefined` no content response
     *
     * If response.status has not been set, Koa will automatically set the status to 200 or 204 depending on response.body. Specifically, if response.body has not been set or has been set as null or undefined, Koa will automatically set response.status to 204. If you really want to send no content response with other status, you should override the 204 status as the following way:
     *
     * @exmple
     * ```ts
     * // This must be always set first before status, since null | undefined
     * // body automatically sets the status to 204
     * ctx.body = null;
     *
     * // Now we override the 204 status with the desired one
     * ctx.status = 200;
     * ```
     *
     * Koa doesn't guard against everything that could be put as a response body -- a function doesn't serialise meaningfully, returning a boolean may make sense based on your application, and while an error works, it may not work as intended as some properties of an error are not enumerable. We recommend adding middleware in your app that asserts body types per app. A sample middleware might be:
     *
     * @example
     * ```ts
     * app.use(async (ctx, next) => {
     *   await next()
     *   ctx.assert.equal('object', typeof ctx.body, 500, 'some dev did something wrong')
     * })
     * ```
     */
    body: KoaResponse<ResponseBody>['body'];
    /**
     * ctx.length
     *
     * Get/Set response Content-Length
     *
     * @example
     * ```ts
     * console.log(ctx.length); // 512
     * ctx.length = 1024;
     * ```
     */
    length: KoaResponse['length'];
    /**
     * Return the response mime type void of
     * parameters such as "charset".
     */
    type: KoaResponse['type'];
    /**
     * Set the Last-Modified date using a string or a Date.
     * Get the Last-Modified date in Date form, if it exists.
     *
     * @exmaple
     * ```ts
     * this.response.lastModified // => Mon, 15 Jun 2020 20:51:45 GMT
     * this.response.lastModified = new Date();
     * this.response.lastModified = '2013-09-13';
     * ```
     */
    lastModified: KoaResponse['lastModified'];
    /**
     * Get/Set the ETag of a response.
     * This will normalize the quotes if necessary.
     *
     * @example
     * ```ts
     *     this.response.etag = 'md5hashsum';
     *     this.response.etag = '"md5hashsum"';
     *     this.response.etag = 'W/"123456789"';
     * ```
     */
    etag: KoaResponse['etag'];
    /**
     * Check if a header has been written to the socket.
     *
     * @return {Boolean}
     */
    readonly headerSent: KoaResponse['headerSent'];
    /**
     * Checks if the request is writable.
     * Tests for the existence of the socket
     * as node sometimes does not set it.
     *
     * @return {Boolean}
     * @private
     */
    readonly writable: KoaResponse['writable'];
  }
  /**
   * The context object delegate for the request
   */
  interface ContextRequestDelegation {
    /**
     * Return accepted languages or best fit based on `langs`.
     *
     * Given `Accept-Language: en;q=0.8, es, pt`
     * an array sorted by quality is returned:
     *
     *     ['es', 'pt', 'en']
     *
     * @param {String|Array} lang(s)...
     * @return {Array|String}
     * @api public
     */
    acceptsLanguages: KoaRequest['acceptsLanguages'];
    /**
     * Return accepted encodings or best fit based on `encodings`.
     *
     * Given `Accept-Encoding: gzip, deflate`
     * an array sorted by quality is returned:
     *
     *     ['gzip', 'deflate']
     *
     * @param {String|Array} encoding(s)...
     * @return {String|Array}
     * @api public
     */
    acceptsEncodings: KoaRequest['acceptsEncodings'];
    /**
     * Return accepted charsets or best fit based on `charsets`.
     *
     * Given `Accept-Charset: utf-8, iso-8859-1;q=0.2, utf-7;q=0.5`
     * an array sorted by quality is returned:
     *
     *     ['utf-8', 'utf-7', 'iso-8859-1']
     *
     * @param {String|Array} charset(s)...
     * @return {String|Array}
     * @api public
     */
    acceptsCharsets: KoaRequest['acceptsCharsets'];
    /**
     * Check if the given `type(s)` is acceptable, returning
     * the best match when true, otherwise `false`, in which
     * case you should respond with 406 "Not Acceptable".
     *
     * The `type` value may be a single mime type string
     * such as "application/json", the extension name
     * such as "json" or an array `["json", "html", "text/plain"]`. When a list
     * or array is given the _best_ match, if any is returned.
     *
     * @example
     * ```ts
     *     // Accept: text/html
     *     this.accepts('html');
     *     // => "html"
     *
     *     // Accept: text/*, application/json
     *     this.accepts('html');
     *     // => "html"
     *     this.accepts('text/html');
     *     // => "text/html"
     *     this.accepts('json', 'text');
     *     // => "json"
     *     this.accepts('application/json');
     *     // => "application/json"
     *
     *     // Accept: text/*, application/json
     *     this.accepts('image/png');
     *     this.accepts('png');
     *     // => false
     *
     *     // Accept: text/*;q=.5, application/json
     *     this.accepts(['html', 'json']);
     *     this.accepts('html', 'json');
     *     // => "json"
     * ```
     *
     * @param {String|Array} type(s)...
     * @return {String|Array|false}
     * @api public
     */
    accepts: KoaRequest['accepts'];
    /**
     * Return request header.
     *
     * The `Referrer` header field is special-cased,
     * both `Referrer` and `Referer` are interchangeable.
     *
     * Examples:
     *
     *     this.get('Content-Type');
     *     // => "text/plain"
     *
     *     this.get('content-type');
     *     // => "text/plain"
     *
     *     this.get('Something');
     *     // => ''
     *
     * @param {String} field
     * @return {String}
     * @api public
     */
    get: KoaRequest['get'];
    /**
     * Check if the incoming request contains the "Content-Type"
     * header field and if it contains any of the given mime `type`s.
     * If there is no request body, `null` is returned.
     * If there is no content type, `false` is returned.
     * Otherwise, it returns the first `type` that matches.
     *
     * @example
     * ```ts
     *     // With Content-Type: text/html; charset=utf-8
     *     this.is('html'); // => 'html'
     *     this.is('text/html'); // => 'text/html'
     *     this.is('text/*', 'application/json'); // => 'text/html'
     *
     *     // When Content-Type is application/json
     *     this.is('json', 'urlencoded'); // => 'json'
     *     this.is('application/json'); // => 'application/json'
     *     this.is('html', 'application/*'); // => 'application/json'
     *
     *     this.is('html'); // => false
     * ```
     * @param {String|String[]} [type]
     * @param {String[]} [types]
     * @return {String|false|null}
     * @api public
     */
    is: KoaRequest['is'];
    /**
     * Get/set query string.
     */
    querystring: KoaRequest['querystring'];
    /**
     * check if the request is idempotent
     */
    readonly idempotent: KoaRequest['idempotent'];
    /**
     * Return the request socket.
     */
    readonly socket: KoaRequest['socket'];
    /**
     * Get/set the search string. Same as
     * request.querystring= but included for ubiquity.
     */
    search: KoaRequest['search'];
    /**
     * Get/set the reqest method
     */
    method: KoaRequest['method'];
    /**
     * Get/set the parsed query-string
     */
    query: KoaRequest['query'];
    /**
     * Get/set the pathname, retaining the querystring when present
     */
    path: KoaRequest['path'];
    /**
     * Get/set the request URL.
     */
    url: KoaRequest['url'];
    /**
     * Get/set accept object.
     * Lazily memoized.
     */
    accept: KoaRequest['accept'];
    /**
     * Get origin of URL.
     */
    readonly origin: KoaRequest['origin'];
    /**
     * Get full request URL.
     */
    readonly href: KoaRequest['href'];
    /**
     * Return subdomains as an array.
     *
     * Subdomains are the dot-separated parts of the host before the main domain
     * of the app. By default, the domain of the app is assumed to be the last two
     * parts of the host. This can be changed by setting `app.subdomainOffset`.
     *
     * For example, if the domain is "tobi.ferrets.example.com":
     * If `app.subdomainOffset` is not set, this.subdomains is
     * `["ferrets", "tobi"]`.
     * If `app.subdomainOffset` is 3, this.subdomains is `["tobi"]`.
     */
    readonly subdomains: KoaRequest['subdomains'];
    /**
     * Return the protocol string "http" or "https"
     * when requested with TLS. When the proxy setting
     * is enabled the "X-Forwarded-Proto" header
     * field will be trusted. If you're running behind
     * a reverse proxy that supplies https for you this
     * may be enabled.
     */
    readonly protocol: KoaRequest['protocol'];
    /**
     * Parse the "Host" header field host
     * and support X-Forwarded-Host when a
     * proxy is enabled.
     */
    readonly host: KoaRequest['host'];
    /**
     * Parse the "Host" header field hostname
     * and support X-Forwarded-Host when a
     * proxy is enabled.
     */
    readonly hostname: KoaRequest['hostname'];
    /**
     * Get WHATWG parsed URL.
     * Lazily memoized.
     */
    readonly URL: KoaRequest['URL'];
    /**
     * Return request header.
     */
    readonly header: KoaRequest['header'];
    /**
     * Return request headers, same as request.header
     */
    readonly headers: KoaRequest['headers'];
    /**
     * Shorthand for:
     *
     *    this.protocol == 'https'
     */
    readonly secure: KoaRequest['secure'];
    /**
     * Check if the request is stale, aka
     * "Last-Modified" and / or the "ETag" for the
     * resource has changed.
     */
    readonly stale: KoaRequest['stale'];
    /**
     * Check if the request is fresh, aka
     * Last-Modified and/or the ETag
     * still match.
     */
    readonly fresh: KoaRequest['fresh'];
    /**
     * When `app.proxy` is `true`, parse
     * the "X-Forwarded-For" ip address list.
     *
     * For example if the value was "client, proxy1, proxy2"
     * you would receive the array `["client", "proxy1", "proxy2"]`
     * where "proxy2" is the furthest down-stream.
     */
    readonly ips: KoaRequest['ips'];
    /**
     * Return request's remote address
     * When `app.proxy` is `true`, parse
     * the "X-Forwarded-For" ip address list and return the first one
     */
    readonly ip: KoaRequest['ip'];
  }
  interface ContextExtras<UserState = State> {
    /**
     * A Koa Response object
     */
    response: KoaResponse;
    /**
     * A Koa Request object
     */
    request: KoaRequest;
    /**
     * The node js request object
     *
     * Avoid changing this object and prefer using the ctx.request object instead.
     */
    req: IncomingMessage;
    /**
     * The node js response object
     *
     * Bypassing Koa's response handling is not supported. Avoid using the following node properties:
     *  - res.statusCode
     *  - res.writeHead()
     *  - res.write()
     *  - res.end()
     */
    res: ServerResponse;
    /**
     * A reference to the current application instance
     */
    app: Koa;
    /**
     * Allow bypassing the Koa response handling when setting this property to true.
     *
     * You must end the response manually when using this option.
     */
    respond: boolean;
    /**
     * The original request URL
     */
    originalUrl?: string;
    /**
     * @private
     */
    [COOKIES: symbol]: Cookies;
    /**
     * State is the recommended namespace for passing information
     * through middleware and to your frontend views.
     *
     * State can be used to store data
     * and pass it between middleware. State properties
     * can be added globally at anytime using `app.context` or
     * per request within middleware.
     *
     * To add typed properties to State, declare them in
     * the module of your choosing:
     *
     * @example
     * ```ts
     * declare module '@kosmic/koa' {
     *   interface State {
     *     myProperty: string;
     *   }
     * }
     * ```
     */
    state: UserState;
  }
  /**
   * To help maintain type compatibility with current third party types we
   * can just use the names of the types instead of the types themselves for extending where we want
   */
  interface ExtendableContext {}
  /**
   * The internal context object meant for internal use only
   */
  export type InternalContext<
    State = UnknownRecord,
    ResponseBody = unknown,
  > = ContextBase &
  Partial<ContextExtras<State>> &
  Partial<ContextResponseDelegation<ResponseBody>> &
  Partial<ContextRequestDelegation>;
  /**
   * extendable ctx.state interface
   */
  interface State extends UnknownRecord {}
  export interface DefaultState extends State {}
  /**
   * The extendable context object
   */
  interface Context<CtxState = State, ResponseBody = unknown>
    extends Simplify<
    ContextBase &
    ContextExtras<CtxState> &
    ContextResponseDelegation<ResponseBody> &
    ContextRequestDelegation &
    ExtendableContext
    > {}

  export interface DefaultContext<CtxState = State, ResponseBody = unknown> extends Context<CtxState, ResponseBody> {}
  export interface ParameterizedContext<CtxState = State, X = Record<string, unknown>, ResponseBody = unknown> extends Context<CtxState, ResponseBody> {}
}

declare class Koa extends EventEmitter {
  /**
   * Make HttpError available to consumers of the library so that consumers don't
   * have a direct dependency upon `http-errors`
   */
  static HttpError: HttpErrorConstructor;
  /**
   * app.proxy
   *
   * when true proxy header fields will be trusted
   */
  proxy: boolean;
  /**
   * app.subdomainOffset
   *
   * offset of .subdomains to ignore, default to 2
   */
  subdomainOffset: number;
  /**
   * app.proxyIpHeader
   *
   * proxy ip header, default to X-Forwarded-For
   */
  proxyIpHeader: string;
  /**
   * app.maxIpsCount
   * max ips read from proxy ip header, default to 0 (means infinity)
   */
  maxIpsCount: number;
  /**
   * app.env
   * Defaults to NODE_ENV or "development"
   */
  env: string;
  /**
   * exposes koa-compose
   */
  compose?: (middleware: Koa.Middleware[]) => Koa.Middleware;
  /**
   * The extendable koa context prototype object.
   */
  context: Koa.Context;
  /**
   * The koa request object.
   */
  request: Koa.KoaRequest;
  /**
   * The incoming node request object.
   */
  req?: IncomingMessage;
  /**
   * The node response object.
   */
  res?: ServerResponse;
  /**
   * The koa response object.
   */
  response: Response;
  /**
   * @prop app.keys
   * array of signed cookie keys
   */
  keys?: string[];
  /**
   * middleware
   * @private
   */
  private readonly middleware;
  /**
   * @name app.silent
   * By default outputs all errors to stderr unless app.silent is true.
   */
  silent?: boolean;
  /**
   * async local storage
   * @private
   */
  private readonly ctxStorage?;
  [util.inspect.custom]?: () => UnknownRecord;
  /**
   * Application constructor.
   *
   * create a new koa application.
   *
   * @example
   * ```ts
   * import App from '@kosmic/koa';
   * const app = new App();
   * ```
   * @param options
   */
  constructor(options?: Koa.Options);
  listen(...args: Parameters<Server['listen']>): Server;
  toJSON(): UnknownRecord;
  inspect(): UnknownRecord;
  /**
   * Use the given middleware `fn`.
   *
   * all function are async (or Promise returning) functions.
   *
   * @example
   *
   * app.use(async (ctx, next) => {
   *  await next();
   *  ctx.body = 'Hello World';
   * })
   */
  use(fn: Koa.Middleware): this;
  callback(): (
    req: IncomingMessage,
    res: ServerResponse,
  ) => Promise<void | ServerResponse | undefined>;
  /**
   * return current context from async local storage
   */
  get currentContext(): Koa.Context | undefined;
  /**
   * Handle request in callback.
   *
   * @api private
   */
  private readonly handleKoauest;
  /**
   * Initialize a new context.
   *
   * @api private
   */
  createContext(request_: IncomingMessage, res: ServerResponse): Koa.Context;
  /**
   * Default error handler.
   *
   * @param {Error} err
   * @api private
   */
  onerror(error: HttpError): void;
  /**
   * Help TS users comply to CommonJS, ESM, bundler mismatch.
   * @see https://github.com/koajs/koa/issues/1513
   */
  static get default(): typeof Koa;
  createAsyncCtxStorageMiddleware(): Koa.Middleware;
}

export = Koa;
