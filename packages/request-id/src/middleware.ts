import {v4 as uuidv4} from 'uuid'

// A Mixin for Lambda Context.
// Using Typescript Intersection types you can define a handler context as `Context & RequestIdentifierContextMixin`
export type RequestIdentifierContext = {
  requestIdentity: {
    correlationId: string
    parentId?: string
    requestId: string
    sessionId: string
    spanId: string
    traceId: string
  }
}

const byteToHex: string[] = []
for (var i = 0; i < 256; ++i) {
  byteToHex[i] = (i + 0x100).toString(16).substr(1)
}

export function bytesToUuid(bytes: Array<number>): string {
  const hexString = bytesToHexString(bytes)
  return formatHexAsUUID(hexString)
}

export function bytesToHexString(bytes: Array<number>): string {
  return bytes.map((byte) => byteToHex[byte]).join('')
}

export function formatHexAsUUID(hexString: string): string {
  return [
    hexString.slice(0, 8),
    '-',
    hexString.slice(8, 12),
    '-',
    hexString.slice(12, 16),
    '-',
    hexString.slice(16, 24),
    '-',
    hexString.slice(24, 36),
  ].join('')
}

export function convertMaybeUuidToHexString(uuid?: string): string | void {
  if (uuid === undefined || uuid === null || uuid === '') {
    return
  }

  // FIXME: handle case where it's not a UUID
  return uuid.replace('-', '')
}

export function convertMaybeHexStringToUuid(hexString?: string): string | void {
  if (hexString === undefined || hexString === null || hexString === '') {
    return
  }

  // FIXME: handle case where its not a Hex string suitable for a UUID
  return formatHexAsUUID(hexString)
}

// I hate this name too. Sorry.
const _DefaultAPIGatewayProxyRequestIdentifyingMiddleware = (
  next: any,
) => async (event: any) => {
  const trace = new Array<number>(16)
  uuidv4(null, trace)

  const span = new Array<number>(16)
  uuidv4(null, span)

  const correlationId: string | undefined =
    event.headers['correlation-id'] || event.headers['x-correlation-id']

  const parentId: string | undefined =
    event.headers['parent-id'] ||
    event.headers['x-parent-id'] ||
    event.headers['x-b3-parentspanid']

  const requestId: string | undefined =
    event.headers['request-id'] || event.headers['x-request-id']

  const sessionId: string | undefined =
    event.headers['session-id'] || event.headers['x-session-id']

  const spanId: string | undefined =
    event.headers['span-id'] ||
    event.headers['x-span-id'] ||
    event.headers['x-b3-spanid']

  const traceId: string | undefined =
    event.headers['trace-id'] ||
    event.headers['x-trace-id'] ||
    event.headers['x-b3-traceid']

  const requestIdentifierContext: RequestIdentifierContext = {
    requestIdentity: {
      correlationId:
        correlationId ||
        convertMaybeHexStringToUuid(traceId) ||
        bytesToUuid(trace),
      ...(parentId && {parentId}),
      requestId:
        requestId ||
        correlationId ||
        convertMaybeHexStringToUuid(traceId) ||
        bytesToUuid(trace),
      sessionId:
        sessionId ||
        correlationId ||
        convertMaybeHexStringToUuid(traceId) ||
        bytesToUuid(trace),
      spanId: spanId || bytesToHexString(span.slice(0, 8)),
      traceId:
        traceId ||
        convertMaybeUuidToHexString(correlationId) ||
        bytesToHexString(trace),
    },
  }
  const result = await next(event)
  const headers = {
    'correlation-id': requestIdentifierContext.requestIdentity.correlationId,
    'x-correlation-id': requestIdentifierContext.requestIdentity.correlationId,
    'parent-id': requestIdentifierContext.requestIdentity.parentId,
    'x-parent-id': requestIdentifierContext.requestIdentity.parentId,
    'x-b3-parentspanid': requestIdentifierContext.requestIdentity.parentId,
    'request-id': requestIdentifierContext.requestIdentity.requestId,
    'x-request-id': requestIdentifierContext.requestIdentity.requestId,
    'session-id': requestIdentifierContext.requestIdentity.sessionId,
    'x-session-id': requestIdentifierContext.requestIdentity.sessionId,
    'span-id': requestIdentifierContext.requestIdentity.spanId,
    'x-span-id': requestIdentifierContext.requestIdentity.spanId,
    'x-b3-spanid': requestIdentifierContext.requestIdentity.spanId,
    'trace-id': requestIdentifierContext.requestIdentity.traceId,
    'x-trace-id': requestIdentifierContext.requestIdentity.traceId,
    'x-b3-traceid': requestIdentifierContext.requestIdentity.traceId,
  }
  return {...result, headers: {...(result.headers || {}), ...headers}}
}
