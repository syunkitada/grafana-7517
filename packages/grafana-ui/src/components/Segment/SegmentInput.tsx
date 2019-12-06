import React, { useRef, useState } from 'react';
import { cx, css } from 'emotion';
import useClickAway from 'react-use/lib/useClickAway';
import { measureText } from '../../utils/measureText';
import { useExpandableLabel, SegmentProps } from '.';

export interface SegmentInputProps<T> extends SegmentProps<T> {
  value: string | number;
  onChange: (text: string | number) => void;
}

const FONT_SIZE = 14;

export function SegmentInput<T>({
  value,
  onChange,
  Component,
  className,
}: React.PropsWithChildren<SegmentInputProps<T>>) {
  const ref = useRef(null);
  const [inputWidth, setInputWidth] = useState<number>(measureText(value.toString(), FONT_SIZE).width);
  const [Label, , expanded, setExpanded] = useExpandableLabel(false);
  useClickAway(ref, () => setExpanded(false));

  if (!expanded) {
    return <Label Component={Component || <a className={cx('gf-form-label', 'query-part', className)}>{value}</a>} />;
  }

  const inputWidthStyle = css`
    width: ${Math.max(inputWidth + 20, 32)}px;
  `;

  return (
    <input
      ref={ref}
      autoFocus
      className={cx(`gf-form gf-form-input`, inputWidthStyle)}
      value={value}
      onChange={item => {
        const { width } = measureText(item.target.value, FONT_SIZE);
        setInputWidth(width);
        onChange(item.target.value);
      }}
      onBlur={() => setExpanded(false)}
      onKeyDown={e => [13, 27].includes(e.keyCode) && setExpanded(false)}
    />
  );
}
