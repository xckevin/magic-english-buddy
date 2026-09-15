/**
 * Pure word normalisation and conservative English lemma candidates.
 *
 * This is deliberately small.  A full inflection lexicon belongs in a
 * licensed source dataset; these rules cover the regular forms that occur in
 * the bundled stories and a checked set of common irregular forms.
 */

const IRREGULAR_BASE_FORMS: Record<string, string> = {
  am: 'be',
  are: 'be',
  is: 'be',
  was: 'be',
  were: 'be',
  been: 'be',
  has: 'have',
  had: 'have',
  does: 'do',
  did: 'do',
  went: 'go',
  gone: 'go',
  came: 'come',
  come: 'come',
  found: 'find',
  made: 'make',
  said: 'say',
  saw: 'see',
  seen: 'see',
  took: 'take',
  taken: 'take',
  gave: 'give',
  given: 'give',
  got: 'get',
  gotten: 'get',
  felt: 'feel',
  thought: 'think',
  told: 'tell',
  knew: 'know',
  known: 'know',
  began: 'begin',
  begun: 'begin',
  became: 'become',
  brought: 'bring',
  bought: 'buy',
  caught: 'catch',
  chose: 'choose',
  chosen: 'choose',
  drew: 'draw',
  drawn: 'draw',
  drank: 'drink',
  drunk: 'drink',
  drove: 'drive',
  driven: 'drive',
  ate: 'eat',
  eaten: 'eat',
  fell: 'fall',
  fallen: 'fall',
  fought: 'fight',
  flew: 'fly',
  flown: 'fly',
  forgot: 'forget',
  forgotten: 'forget',
  grew: 'grow',
  grown: 'grow',
  heard: 'hear',
  held: 'hold',
  kept: 'keep',
  left: 'leave',
  lost: 'lose',
  met: 'meet',
  paid: 'pay',
  ran: 'run',
  rode: 'ride',
  ridden: 'ride',
  sang: 'sing',
  sung: 'sing',
  sat: 'sit',
  slept: 'sleep',
  spoke: 'speak',
  spoken: 'speak',
  spent: 'spend',
  stood: 'stand',
  swam: 'swim',
  swum: 'swim',
  taught: 'teach',
  understood: 'understand',
  woke: 'wake',
  woken: 'wake',
  wore: 'wear',
  worn: 'wear',
  won: 'win',
  wrote: 'write',
  written: 'write',
  children: 'child',
  men: 'man',
  women: 'woman',
  mice: 'mouse',
  teeth: 'tooth',
  feet: 'foot',
  people: 'person',
};

/** Strip surrounding punctuation while retaining meaningful internal hyphens and apostrophes. */
export function normalizeDictionaryWord(value: string): string {
  return value
    .normalize('NFKC')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '')
    .toLocaleLowerCase('en-US')
    .trim();
}

function addRegularForms(word: string, forms: Set<string>): void {
  const add = (form: string) => {
    if (form.length > 1 && form !== word) forms.add(form);
  };

  if (word.endsWith("'s")) add(word.slice(0, -2));
  if (word.endsWith("s'")) add(word.slice(0, -1));

  if (word.endsWith('ied')) {
    add(`${word.slice(0, -3)}y`);
  } else if (word.endsWith('ed')) {
    const stem = word.slice(0, -2);
    add(stem);
    if (/([^aeiou])\1$/.test(stem)) add(stem.slice(0, -1));
    add(`${stem}e`);
  }

  if (word.endsWith('ying')) {
    add(`${word.slice(0, -4)}ie`);
  } else if (word.endsWith('ing')) {
    const stem = word.slice(0, -3);
    add(stem);
    if (/([^aeiou])\1$/.test(stem)) add(stem.slice(0, -1));
    add(`${stem}e`);
  }

  if (word.endsWith('ies')) {
    add(`${word.slice(0, -3)}y`);
  } else if (word.endsWith('ves')) {
    const stem = word.slice(0, -3);
    add(`${stem}f`);
    add(`${stem}fe`);
    add(word.slice(0, -1)); // lives -> live; leaves -> leave
  } else if (/(?:ches|shes|sses|xes|zes|oes)$/.test(word)) {
    add(word.slice(0, -2));
  } else if (word.endsWith('s') && !word.endsWith('ss')) {
    add(word.slice(0, -1));
  }

  if (word.endsWith('iest')) {
    add(`${word.slice(0, -4)}y`);
  } else if (word.endsWith('est')) {
    const stem = word.slice(0, -3);
    add(stem);
    if (/([^aeiou])\1$/.test(stem)) add(stem.slice(0, -1));
    add(`${stem}e`);
  } else if (word.endsWith('ier')) {
    add(`${word.slice(0, -3)}y`);
  } else if (word.endsWith('er')) {
    const stem = word.slice(0, -2);
    add(stem);
    if (/([^aeiou])\1$/.test(stem)) add(stem.slice(0, -1));
    add(`${stem}e`);
  }
}

/** Return direct form first, followed by possible dictionary lemmas. */
export function getDictionaryLookupForms(value: string): string[] {
  const word = normalizeDictionaryWord(value);
  if (!word) return [];

  const forms = new Set<string>([word]);
  const irregular = IRREGULAR_BASE_FORMS[word];
  if (irregular) forms.add(irregular);
  addRegularForms(word, forms);
  return [...forms];
}
