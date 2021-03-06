/* Copyright (c) The ANTLR Project. All rights reserved.
 * Use of this file is governed by the BSD 3-clause license that
 * can be found in the LICENSE.txt file in the project root.
 */
import { Interval } from "./IntervalSet"
import { Parser } from "./Parser"
import { ParserRuleContext } from "./ParserRuleContext"
import { ParseTreeVisitor, RuleNode } from "./tree"
import { ParseTree } from "./tree/Tree"

export class RuleContext extends RuleNode {
    public parentCtx: RuleContext | null
    public invokingState: number

    constructor()
    constructor(parent: RuleContext, invokingState: number)

    depth(): number
    isEmpty(): boolean
    getSourceInterval(): Interval
    getRuleContext(): RuleContext
    getPayload(): RuleContext
    getText(): string
    getAltNumber(): number
    setAltNumber(altNumber: number): void
    getChild(i: number): ParseTree | null
    getChildCount(): number
    accept<T>(visitor: ParseTreeVisitor<T>): T
    toStringTree(ruleNames?: Array<string>, recog?: Parser): string
    toString(ruleNames?: Array<string>, stop?: number): string
}
export namespace RuleContext {
    export const EMPTY: ParserRuleContext
    export type EMPTY = typeof ParserRuleContext.EMPTY
}
