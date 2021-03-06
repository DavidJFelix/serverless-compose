export type Func<TArgs extends any[], TReturn> = (...args: TArgs) => TReturn

/**
 * A Handler is a function which response transactionally (by `Promise`) to some event.
 * This is the base building block for FaaS -- All invoked functions must be `Handler`s.
 *
 * @typeParam TEvent - the event type passed as an input to the handler function
 * @typeParam TContext - the context type passed as an input to the handler function
 * @typeParam TResult - the result type promised to be returned by the handler function
 * @param event - the event for the handler function
 * @param context - the context of the event
 * @returns a `Promise<TResult>` which reflects the success of the handler transaction
 */
export type Handler<TEvent, TContext, TResult> = (
  event: TEvent,
  context: TContext,
) => Promise<TResult>

/**
 * A Middleware is a function which wraps a handler for the purpose of extracting shared functionality from any number of handlers.
 * The purpose of extracting functionality is to improve code reuse and attempt to keep `Handler`s focused on business logic.
 * A Middleware "wraps" a `Handler` by taking the `Handler` as a parameter and returning a new `Handler` with its logic surrounding the internal Handler logic.
 * This function typing is designed to be "chained", so that individual shared functionalities can be performed in whatever order desired so long as their types match.
 *
 * @typeParam TEvent - the event type to be passed as an input to the **resulting** handler function returned by the middleware
 * @typeParam TContext - the context type to be passed as an input to the **resulting** handler function returned by the middleware
 * @typeParam TResult - the result type to be promised returned by the **resulting** handler function returned by the middleware
 * @typeParam TNextEvent = `TEvent` - the event type expected by the `Handler` **to be wrapped** by the middleware.
 * This defaults to TEvent for the case that the middleware logic does not change the event type.
 * @typeParam TNextContext = `TContext` - the context type expected by the `Handler` **to be wrapped** by the middleware.
 * This defaults to TContext for the case that the middleware logic does not change the context type.
 * @typeParam TNextResult = `TResult` - the result type promised to be returned by the `Handler` **to be wrapped** by the middleware.
 * This defaults to TResult for the case that the middleware logic does not change the result type.
 * @param next - the `Handler` to be wrapped by the middleware.
 * The name `next` stems from an "onion style middleware" design, where middleware are thought of as a chain where the outer middleware invokes the inner middleware "next" in the chain.
 * @returns a `Handler<TEvent, TResult>` which is the new handler, created by wrapping the `next` parameter with some functionality.
 */
export type Middleware<
  TEvent,
  TContext,
  TResult,
  TNextEvent = TEvent,
  TNextContext = TContext,
  TNextResult = TResult
> = (
  next: Handler<TNextEvent, TNextContext, TNextResult>,
) => Handler<TEvent, TContext, TResult>
