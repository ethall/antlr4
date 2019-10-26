/* Copyright (c) The ANTLR Project. All rights reserved.
 * Use of this file is governed by the BSD 3-clause license that
 * can be found in the LICENSE.txt file in the project root.
 */
import { InputStream } from "./InputStream"

export declare namespace CharStreams {
    export function fromString(str: string): InputStream
    export function fromBlob(blob: any, encoding: string, onLoad: (inputStream: InputStream) => void, onError: (ev: any) => any): void
    export function fromBuffer(buffer: { toString: (encoding: string) => string}, encoding: string): InputStream
    export function fromPath(path: any, encoding: string, callback: (error: Error, inputStream: InputStream | null) => void): void
    export function fromPathSync(path: any, encoding: string): InputStream
}
