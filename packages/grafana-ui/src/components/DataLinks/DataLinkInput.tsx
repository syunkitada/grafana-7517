import React, { useState, useMemo, useCallback, useContext } from 'react';
import { VariableSuggestion, VariableOrigin, DataLinkSuggestions } from './DataLinkSuggestions';
import { makeValue, ThemeContext, DataLinkBuiltInVars, SCHEMA } from '../../index';
import { SelectionReference } from './SelectionReference';
import { Portal } from '../index';
import { Editor } from '@grafana/slate-react';
import { Value, Editor as CoreEditor } from 'slate';
import Plain from 'slate-plain-serializer';
import { Popper as ReactPopper } from 'react-popper';
import useDebounce from 'react-use/lib/useDebounce';
import { css, cx } from 'emotion';

import { SlatePrism } from '../../slate-plugins';

interface DataLinkInputProps {
  value: string;
  onChange: (url: string) => void;
  suggestions: VariableSuggestion[];
}

const plugins = [
  SlatePrism({
    onlyIn: (node: any) => node.type === 'code_block',
    getSyntax: () => 'links',
  }),
];

export const DataLinkInput: React.FC<DataLinkInputProps> = ({ value, onChange, suggestions }) => {
  const theme = useContext(ThemeContext);
  const [showingSuggestions, setShowingSuggestions] = useState(false);
  const [suggestionsIndex, setSuggestionsIndex] = useState(0);
  const [usedSuggestions, setUsedSuggestions] = useState(
    suggestions.filter(suggestion => {
      return value.indexOf(suggestion.value) > -1;
    })
  );
  // Using any here as TS has problem pickung up `change` method existance on Value
  // According to code and documentation `change` is an instance method on Value in slate 0.33.8 that we use
  // https://github.com/ianstormtaylor/slate/blob/slate%400.33.8/docs/reference/slate/value.md#change
  const [linkUrl, setLinkUrl] = useState<any>(makeValue(value));

  const getStyles = useCallback(() => {
    return {
      editor: css`
        .token.builtInVariable {
          color: ${theme.colors.queryGreen};
        }
        .token.variable {
          color: ${theme.colors.queryKeyword};
        }
      `,
    };
  }, [theme]);

  const currentSuggestions = useMemo(
    () =>
      suggestions.filter(suggestion => {
        return usedSuggestions.map(s => s.value).indexOf(suggestion.value) === -1;
      }),
    [usedSuggestions, suggestions]
  );

  // SelectionReference is used to position the variables suggestion relatively to current DOM selection
  const selectionRef = useMemo(() => new SelectionReference(), [setShowingSuggestions]);

  // Keep track of variables that has been used already
  const updateUsedSuggestions = () => {
    const currentLink = Plain.serialize(linkUrl);
    const next = usedSuggestions.filter(suggestion => {
      return currentLink.indexOf(suggestion.value) > -1;
    });
    if (next.length !== usedSuggestions.length) {
      setUsedSuggestions(next);
    }
  };

  useDebounce(updateUsedSuggestions, 250, [linkUrl]);

  const onKeyDown = (event: Event, editor: CoreEditor, next: Function) => {
    const keyboardEvent = event as KeyboardEvent;
    if (keyboardEvent.key === 'Backspace') {
      setShowingSuggestions(false);
      setSuggestionsIndex(0);
    }

    if (keyboardEvent.key === 'Enter') {
      if (showingSuggestions) {
        onVariableSelect(currentSuggestions[suggestionsIndex]);
      }
    }

    if (showingSuggestions) {
      if (keyboardEvent.key === 'ArrowDown') {
        keyboardEvent.preventDefault();
        setSuggestionsIndex(index => {
          return (index + 1) % currentSuggestions.length;
        });
      }
      if (keyboardEvent.key === 'ArrowUp') {
        keyboardEvent.preventDefault();
        setSuggestionsIndex(index => {
          const nextIndex = index - 1 < 0 ? currentSuggestions.length - 1 : (index - 1) % currentSuggestions.length;
          return nextIndex;
        });
      }
    }

    if (
      keyboardEvent.key === '?' ||
      keyboardEvent.key === '&' ||
      keyboardEvent.key === '$' ||
      (keyboardEvent.keyCode === 32 && keyboardEvent.ctrlKey)
    ) {
      setShowingSuggestions(true);
    }

    if (keyboardEvent.key === 'Backspace') {
      return next();
    } else {
      // @ts-ignore
      return;
    }
  };

  const onUrlChange = ({ value }: { value: Value }) => {
    setLinkUrl(value);
  };

  const onUrlBlur = () => {
    onChange(Plain.serialize(linkUrl));
  };

  const onVariableSelect = (item: VariableSuggestion) => {
    const includeDollarSign = Plain.serialize(linkUrl).slice(-1) !== '$';

    const change = linkUrl.change();

    if (item.origin !== VariableOrigin.Template || item.value === DataLinkBuiltInVars.includeVars) {
      change.insertText(`${includeDollarSign ? '$' : ''}\{${item.value}}`);
    } else {
      change.insertText(`var-${item.value}=$\{${item.value}}`);
    }

    setLinkUrl(change.value);
    setShowingSuggestions(false);
    setUsedSuggestions((previous: VariableSuggestion[]) => {
      return [...previous, item];
    });
    setSuggestionsIndex(0);
    onChange(Plain.serialize(change.value));
  };
  return (
    <div
      className={cx(
        'gf-form-input',
        css`
          position: relative;
          height: auto;
        `
      )}
    >
      <div className="slate-query-field">
        {showingSuggestions && (
          <Portal>
            <ReactPopper
              referenceElement={selectionRef}
              placement="auto-end"
              modifiers={{
                preventOverflow: { enabled: true, boundariesElement: 'window' },
                arrow: { enabled: false },
                offset: { offset: 250 }, // width of the suggestions menu
              }}
            >
              {({ ref, style, placement }) => {
                return (
                  <div ref={ref} style={style} data-placement={placement}>
                    <DataLinkSuggestions
                      suggestions={currentSuggestions}
                      onSuggestionSelect={onVariableSelect}
                      onClose={() => setShowingSuggestions(false)}
                      activeIndex={suggestionsIndex}
                    />
                  </div>
                );
              }}
            </ReactPopper>
          </Portal>
        )}
        <Editor
          schema={SCHEMA}
          placeholder="http://your-grafana.com/d/000000010/annotations"
          value={linkUrl}
          onChange={onUrlChange}
          onBlur={onUrlBlur}
          onKeyDown={onKeyDown}
          plugins={plugins}
          className={getStyles().editor}
        />
      </div>
    </div>
  );
};

DataLinkInput.displayName = 'DataLinkInput';
