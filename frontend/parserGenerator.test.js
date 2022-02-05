import {
  text, regex, oneOf, go, sExpression,
} from './parserGenerator';

import { parse } from './parse';
import { eof, integer, operator } from './parser';
import { operatorMap, success } from './helpers';

describe('text', () => {
  it('returns text parser', () => {
    const parser = text('+');

    expect(parse(parser, '+ss')).toEqual(success('+', 'ss'));

    expect(() => { parse(parser, 'ss+'); }).toThrow();
  });
});

describe('regex', () => {
  it('returns regex parser', () => {
    const decimalParser = regex(/\d+(?:\.\d+)?/);

    expect(parse(decimalParser, '12.34ss')).toEqual(success('12.34', 'ss'));
    expect(() => { parse(decimalParser, 'ss12.34'); }).toThrow();
  });
});

describe('oneOf', () => {
  context('when at least one of parsers succeed', () => {
    it('succeed', () => {
      const parser = oneOf([
        text('+'),
        text('-'),
      ]);

      expect(parse(parser, '-3')).toEqual(success('-', '3'));
    });
  });

  context('none of parsers succeed', () => {
    it('fails', () => {
      const parser = oneOf([
        text('+'),
        text('-'),
      ]);

      expect(() => { parse(parser, '/3'); }).toThrow();
    });
  });
});

describe('go', () => {
  it('can replace apply', () => {
    const parser = go(function* generator() {
      const a = yield integer;
      const func = yield operator;
      const b = yield integer;

      yield eof;

      return operatorMap[func](a, b);
    });

    expect(parse(parser, '1-2')).toEqual(success(-1, ''));
  });

  it('can parse HTML which can not be done with apply', () => {
    const parser = go(function* generator() {
      yield text('<');
      const tagName = yield regex(/[^>]*/);
      yield text('>');

      const content = yield regex(/[^<]*/);

      yield text(`</${tagName}>`);

      return `${tagName}: ${content}`;
    });

    expect(parse(parser, '<h1>title</h1>')).toEqual(success('h1: title', ''));
  });

  describe('sExpression', () => {
    it('parses S Expression 1', () => {
      const parser = sExpression;

      expect(parse(parser, '(+ 1 2)')).toEqual(success(['+', 1, 2], ''));
    });

    it('parses S Expression 2', () => {
      const parser = sExpression;

      expect(parse(parser, '(+ 1 (* 2 3))')).toEqual(
        success([
          '+',
          1, [
            '*',
            2, 3,
          ],
        ],
        ''),
      );
    });
  });
});
