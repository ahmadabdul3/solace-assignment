import { MouseEventHandler, useCallback, useRef } from 'react';
import styles from './styles.module.css';
import Image from 'next/image';

interface IOnChangeHandler {
    (e: React.ChangeEvent<HTMLInputElement>): void;
};

type inputPropTypes = {
    label?: string,
    value?: string,
    onChange?: IOnChangeHandler,
    onClear?: MouseEventHandler<HTMLButtonElement>,
    placeholder?: string,
}

export default function Input({
    label,
    value,
    onChange,
    onClear,
    placeholder = 'Start typing...'
}: inputPropTypes) {
    const inputRef = useRef<HTMLInputElement>(null);
    const _onClear = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
        onClear?.(e);
        setTimeout(() => {
            // - auto focus after 50ms
            // - without the timeout
            //   the events (blur/focus) might overlap and
            //   cause issues
            inputRef.current?.focus();
        }, 50);
    }, []);

    return (
        <div className={styles.inputField}>
            {
                label && (
                    <label className={styles.label}>
                        {label}
                    </label>
                )
            }
            <div className={styles.inputWrap}>
                <input
                    onChange={onChange}
                    value={value}
                    ref={inputRef}
                    className={styles.input}
                    placeholder={placeholder}
                />
                {
                    value && (
                        <button
                            onClick={_onClear}
                            className={styles.closeButton}
                        >
                            <Image
                                src={'/close-icon.webp'}
                                alt="close"
                                width={20}
                                height={20}
                            />
                        </button>
                    )
                }
            </div>
        </div>
    );
}
