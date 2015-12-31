// [The "BSD license"]
//  Copyright (c) 2013 Terence Parr
//  Copyright (c) 2013 Sam Harwell
//  Copyright (c) 2014 Eric Vergnaud
//  All rights reserved.
//
//  Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions
//  are met:
//
//  1. Redistributions of source code must retain the above copyright
//     notice, this list of conditions and the following disclaimer.
//  2. Redistributions in binary form must reproduce the above copyright
//     notice, this list of conditions and the following disclaimer in the
//     documentation and/or other materials provided with the distribution.
//  3. The name of the author may not be used to endorse or promote products
//     derived from this software without specific prior written permission.
//
//  THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR
//  IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
//  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
//  IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT,
//  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
//  NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
//  DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
//  THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
//  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
//  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

var LL1Analyzer = require('./../LL1Analyzer').LL1Analyzer;
var IntervalSet = require('./../IntervalSet').IntervalSet;

function ATN(grammarType , maxTokenType) {

    // Used for runtime deserialization of ATNs from strings///
    // The type of the ATN.
    this.grammarType = grammarType;
    // The maximum value for any symbol recognized by a transition in the ATN.
    this.maxTokenType = maxTokenType;
    this.states = [];
    // Each subrule/rule is a decision point and we must track them so we
    //  can go back later and build DFA predictors for them.  This includes
    //  all the rules, subrules, optional blocks, ()+, ()* etc...
    this.decisionToState = [];
    // Maps from rule index to starting state number.
    this.ruleToStartState = [];
    // Maps from rule index to stop state number.
    this.ruleToStopState = null;
    this.modeNameToStartState = {};
    // For lexer ATNs, this maps the rule index to the resulting token type.
    // For parser ATNs, this maps the rule index to the generated bypass token
    // type if the
    // {@link ATNDeserializationOptions//isGenerateRuleBypassTransitions}
    // deserialization option was specified; otherwise, this is {@code null}.
    this.ruleToTokenType = null;
    // For lexer ATNs, this is an array of {@link LexerAction} objects which may
    // be referenced by action transitions in the ATN.
    this.lexerActions = null;
    this.modeToStartState = [];

    return this;
}
	
// Compute the set of valid tokens that can occur starting in state {@code s}.
//  If {@code ctx} is null, the set of tokens will not include what can follow
//  the rule surrounding {@code s}. In other words, the set will be
//  restricted to tokens reachable staying within {@code s}'s rule.
ATN.prototype.nextTokensInContext = function(s, ctx) {
    var anal = new LL1Analyzer(this);
    return anal.LOOK(s, null, ctx);
};

// Compute the set of valid tokens that can occur starting in {@code s} and
// staying in same rule. {@link Token//EPSILON} is in set if we reach end of
// rule.
ATN.prototype.nextTokensNoContext = function(s) {
    if (s.nextTokenWithinRule !== null ) {
        if (PORT_DEBUG) {
            console.log("DEBUG 1")
        }
        return s.nextTokenWithinRule;
    }
    if (PORT_DEBUG) {
        console.log("DEBUG 2")
        console.log(this.nextTokensInContext(s, null).toString())
    }
    s.nextTokenWithinRule = this.nextTokensInContext(s, null);
    s.nextTokenWithinRule.readOnly = true;
    return s.nextTokenWithinRule;
};

ATN.prototype.nextTokens = function(s, ctx) {
    if ( ctx===undefined ) {
        return this.nextTokensNoContext(s);
    } else {
        return this.nextTokensInContext(s, ctx);
    }
};

ATN.prototype.addState = function( state) {
    if ( state !== null ) {
        state.atn = this;
        state.stateNumber = this.states.length;
    }
    this.states.push(state);
};

ATN.prototype.removeState = function( state) {
    this.states[state.stateNumber] = null; // just free mem, don't shift states in list
};

ATN.prototype.defineDecisionState = function( s) {
    this.decisionToState.push(s);
    s.decision = this.decisionToState.length-1;
    return s.decision;
};

ATN.prototype.getDecisionState = function( decision) {
    if (this.decisionToState.length===0) {
        return null;
    } else {
        return this.decisionToState[decision];
    }
};

// Computes the set of input symbols which could follow ATN state number
// {@code stateNumber} in the specified full {@code context}. This method
// considers the complete parser context, but does not evaluate semantic
// predicates (i.e. all predicates encountered during the calculation are
// assumed true). If a path in the ATN exists from the starting state to the
// {@link RuleStopState} of the outermost context without matching any
// symbols, {@link Token//EOF} is added to the returned set.
//
// <p>If {@code context} is {@code null}, it is treated as
// {@link ParserRuleContext//EMPTY}.</p>
//
// @param stateNumber the ATN state number
// @param context the full parse context
// @return The set of potentially valid input symbols which could follow the
// specified state in the specified context.
// @throws IllegalArgumentException if the ATN does not contain a state with
// number {@code stateNumber}
var Token = require('./../Token').Token;

ATN.prototype.getExpectedTokens = function( stateNumber, ctx ) {
    if ( stateNumber < 0 || stateNumber >= this.states.length ) {
        throw("Invalid state number.");
    }
    var s = this.states[stateNumber];
    var following = this.nextTokens(s);
    if (!following.contains(Token.EPSILON)) {
        return following;
    }
    var expected = new IntervalSet();
    expected.addSet(following);
    expected.removeOne(Token.EPSILON);
    while (ctx !== null && ctx.invokingState >= 0 && following.contains(Token.EPSILON)) {
        var invokingState = this.states[ctx.invokingState];
        var rt = invokingState.transitions[0];
        following = this.nextTokens(rt.followState);
        expected.addSet(following);
        expected.removeOne(Token.EPSILON);
        ctx = ctx.parentCtx;
    }
    if (following.contains(Token.EPSILON)) {
        expected.addOne(Token.EOF);
    }
    return expected;
};

ATN.INVALID_ALT_NUMBER = 0;

exports.ATN = ATN;