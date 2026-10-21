import { describe, expect, it } from 'vitest';
import {
  fillPlaceholders, firstLine, mentionAt, mentionIds, nextPriority, splitRedraft, withDraftText, wordDiff,
} from '../../src/model/text-tools.js';

describe('fillPlaceholders', () => {
  it('fills the known placeholders, with fallbacks, and leaves the rest', () => {
    const ctx = { contact: { name: 'Ana Lima', email: 'ana@x' }, ticket: { number: 'TK-1' }, agent: { name: 'Bo Tran' } };
    expect(fillPlaceholders('Hi {{ contact.first_name }}, re {{ ticket.number }}. {{ agent.name }} {{ other }}', ctx))
      .toBe('Hi Ana, re TK-1. Bo Tran {{ other }}');
    expect(fillPlaceholders('Hi {{ contact.first_name }}', { ...ctx, contact: { name: null, email: 'x' } })).toBe('Hi there');
  });

  it('greets a Vietnamese-speaking contact by the last word of their name, anyone else by the first', () => {
    const ctx = { ticket: { number: 'TK-1' }, agent: { name: 'Bo Tran' } };
    const hi = (name: string, locale: string | null) =>
      fillPlaceholders('Hi {{ contact.first_name }}', { ...ctx, contact: { name, email: 'x', locale } });
    expect(hi('Trần Minh Khoa', 'vi')).toBe('Hi Khoa');
    expect(hi('Trần Minh Khoa', 'vi-VN')).toBe('Hi Khoa');
    expect(hi('Mai', 'vi')).toBe('Hi Mai');
    expect(hi('Ana Lima', 'en')).toBe('Hi Ana');
    expect(hi('Trần Minh Khoa', null)).toBe('Hi Trần');
    expect(hi('Trần Minh Khoa', 'vietnamese')).toBe('Hi Trần');
  });
});

describe('mentions', () => {
  const people = [{ id: 'u1', displayName: 'Bo Tran', email: null }, { id: 'u2', displayName: 'Hà Nguyễn', email: null }];
  it('finds the @word being typed at the caret', () => {
    expect(mentionAt('thanks @H', 9)).toEqual({ query: 'H', start: 7 });
    expect(mentionAt('mail me at bo@x.test', 20)).toBeNull();
  });
  it('collects the people a note names', () => {
    expect(mentionIds('@Bo Tran and @Hà Nguyễn, please', people)).toEqual(['u1', 'u2']);
    expect(mentionIds('no one', people)).toEqual([]);
  });
  it('does not take a longer name for a shorter one that begins it', () => {
    const bo = [{ id: 'u3', displayName: 'Bo', email: null }, { id: 'u1', displayName: 'Bo Tran', email: null }];
    expect(mentionIds('@Bo Tran, please', bo)).toEqual(['u1']);
    expect(mentionIds('@Bo, @Bo Tran and @Bo again', bo)).toEqual(['u3', 'u1']);
    expect(mentionIds('@Bob is not Bo', bo)).toEqual([]);
    expect(mentionIds('@Bo\nTran', bo)).toEqual(['u3']);
    expect(mentionIds('@Bo.', bo)).toEqual(['u3']);
    expect(mentionIds('@Bo', bo)).toEqual(['u3']);
    expect(mentionIds('@Bo Transport', bo)).toEqual(['u3']);
  });
});

describe('wordDiff', () => {
  it('marks words inserted and removed', () => {
    expect(wordDiff('ships by Wednesday.', 'ships (tracking LB-1) by Wednesday.')).toEqual([
      { kind: 'same', text: 'ships ' }, { kind: 'ins', text: '(tracking LB-1) ' }, { kind: 'same', text: 'by Wednesday.' },
    ]);
  });
});

describe('small helpers', () => {
  it('raises priority one step, staying at urgent', () => {
    expect(nextPriority('low')).toBe('normal');
    expect(nextPriority('urgent')).toBe('urgent');
  });
  it('cuts the first line', () => {
    expect(firstLine('Hello there\nsecond')).toBe('Hello there');
    expect(firstLine('x'.repeat(200), 10)).toBe('xxxxxxxxx…');
  });
});

describe('the text a redraft carries', () => {
  it('puts the current text after the instruction, and takes it apart again', () => {
    const wire = withDraftText('Make it shorter.', 'Hi Ana,\n\nIt ships today.');
    expect(wire).toBe('Make it shorter.\n\nThe draft to revise:\nHi Ana,\n\nIt ships today.');
    expect(splitRedraft(wire)).toEqual({ instruction: 'Make it shorter.', draft: 'Hi Ana,\n\nIt ships today.' });
  });

  it('sends the instruction alone when there is no text to revise', () => {
    expect(withDraftText('Make it shorter.', '  \n')).toBe('Make it shorter.');
    expect(splitRedraft('Make it shorter.')).toEqual({ instruction: 'Make it shorter.', draft: null });
  });

  it('splits at the first marker, so a draft that quotes the marker is kept whole', () => {
    const wire = withDraftText('Shorter.', 'A\n\nThe draft to revise:\nB');
    expect(splitRedraft(wire)).toEqual({ instruction: 'Shorter.', draft: 'A\n\nThe draft to revise:\nB' });
  });
});
