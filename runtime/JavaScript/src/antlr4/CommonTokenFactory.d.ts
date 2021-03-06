/* Copyright (c) The ANTLR Project. All rights reserved.
 * Use of this file is governed by the BSD 3-clause license that
 * can be found in the LICENSE.txt file in the project root.
 */
import { CommonToken, SourcePair } from "./Token"

export class TokenFactory {
    constructor()
}

export class CommonTokenFactory extends TokenFactory {
    static readonly DEFAULT: CommonTokenFactory

    public copyText: boolean

    constructor(copyText?: boolean)

    create(
        source: SourcePair,
        type: number,
        text: string | null,
        channel: number,
        start: undefined,
        stop: undefined,
        line: number,
        column: number
    ): CommonToken
    createThin(type: number, text: string | null): CommonToken
}
