export default function toArrayBuffer(buf: Buffer): ArrayBuffer {
    const backing = buf.buffer
    if (!(backing instanceof ArrayBuffer)) {
        throw new Error('Expected Buffer backed by ArrayBuffer')
    }

    const start = buf.byteOffset
    const end = start + buf.byteLength

    if (start === 0 && buf.byteLength === backing.byteLength) {
        return backing
    }

    return backing.slice(start, end)
}
