import { Readable } from 'stream'

export default async function stream2buffer(stream: Readable): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const chunks: Buffer[] = []

        function cleanup() {
            stream.off('data', onData)
            stream.off('end', onEnd)
            stream.off('error', onError)
            stream.off('close', onClose)
        }

        function onData(chunk: unknown) {
            if (Buffer.isBuffer(chunk)) {
                chunks.push(chunk)
                return
            }
            if (typeof chunk === 'string') {
                chunks.push(Buffer.from(chunk, 'utf8'))
                return
            }
            if (chunk instanceof Uint8Array) {
                chunks.push(Buffer.from(chunk))
                return
            }
            if (chunk instanceof ArrayBuffer) {
                chunks.push(Buffer.from(chunk))
                return
            }
            chunks.push(Buffer.from(String(chunk)))
        }

        function onEnd() {
            cleanup()
            resolve(Buffer.concat(chunks))
        }

        function onError(err: unknown) {
            cleanup()
            stream.destroy()
            reject(err instanceof Error ? err : new Error(String(err)))
        }

        function onClose() {
            cleanup()
            reject(new Error('stream closed before end'))
        }

        stream.on('data', onData)
        stream.once('end', onEnd)
        stream.once('error', onError)
        stream.once('close', onClose)
    })
}
