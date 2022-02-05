import { failure, success } from './helpers';
import { integer, operator } from './parser';

export const text = (match) => {
  const newParser = (input) => {
    if (!input.startsWith(match)) {
      return failure(match, input);
    }

    return success(match, input.slice(match.length));
  };

  return newParser;
};

export const regex = ({ source }) => {
  const newParser = (input) => {
    const anchoredRegex = new RegExp(`^${source}`);

    const match = anchoredRegex.exec(input);

    if (match == null) {
      return failure(regex, input);
    }

    const matchedText = match[0];

    return success(matchedText, input.slice(matchedText.length));
  };

  return newParser;
};

export const oneOf = (parsers) => {
  const newParser = (input) => {
    for (let i = 0; i < parsers.length; i += 1) {
      const parser = parsers[i];

      const result = parser(input);

      if (!result.isFailure) {
        return result;
      }
    }

    return failure('one of parsers succeed', `every parsers failed at ${input}`);
  };

  return newParser;
};

export const go = (generatorFunction) => {
  const newParser = (input) => {
    const generator = generatorFunction();

    let currentInput = input;
    let generatorResult = generator.next();

    while (!generatorResult.done) {
      const parser = generatorResult.value;

      const result = parser(currentInput);

      if (result.isFailure) {
        return result;
      }

      const { data, rest } = result;

      currentInput = rest;
      generatorResult = generator.next(data);
    }

    return success(generatorResult.value, currentInput);
  };

  return newParser;
};

export const sExpression = go(function* generator() {
  yield regex(/\s*/);

  yield text('(');

  const op = yield operator;

  yield regex(/\s*/);

  const arg1 = yield oneOf([
    integer,
    sExpression,
  ]);

  yield regex(/\s*/);

  const arg2 = yield oneOf([
    integer,
    sExpression,
  ]);

  yield text(')');

  return [
    op,
    arg1,
    arg2,
  ];
});
