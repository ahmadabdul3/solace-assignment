"use client";

import {
    useEffect,
    useState,
    useRef,
    useCallback,
    ReactNode,
} from 'react';
import styles from './styles.module.css';
import Input from '@/components/input';
import Image from 'next/image';
// - using axios because it abstracts
//   away some of fetch's weirdnesses
// - for example, we have to manually
//   parse the .json
// - and we have to manually catch 500 errors
//   and handle 4xx errors separately
// - we could abstract ourselves,
//   but axios does it for us and gives us
//   other utility functionality for free
import axios from 'axios';

// - this should move to a more shared location
// - keeping it here to make review easier
type advocate = {
    id: string,
    firstName: string,
    lastName: string,
    city: string,
    degree: string,
    specialties: Array<string>,
    yearsOfExperience: string,
    phoneNumber: string,
}

// - again, more shared code that should be moved elsewhere
function useDebounced(cb: Function, deps: Array<any>, timeout: number = 200) {
    const timeoutId = useRef<number>();

    useEffect(() => {
        clearTimeout(timeoutId.current);
        timeoutId.current = window.setTimeout(() => {
            cb();
        }, timeout);
    }, deps || []);
}

// - we dont necessarily need this (which is why
//   it was removed) because useDebounced will
//   run on mount anyway
// - keeping it here for an example of how
//   I'd handle a single-fire mount hook
function useOnMount(cb: Function) {
    const mounted = useRef<boolean>(false);

    useEffect(() => {
        if (mounted.current) return;
        mounted.current = true;
        cb();
    }, []);
}

function minimalLoadingTimeSimulator(timeout: number = 500) {
    return new Promise((res) => {
        setTimeout(res, timeout);
    });
}

export default function Home() {
    const [searchTerm, setSearchTerm] = useState('');
    const {
        loading,
        message,
        advocates,
        loadAdvocates,
    } = useAdvocateLoader();

    useDebounced(() => {
        loadAdvocates({ searchTerm });
    }, [searchTerm]);

    const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    }, []);

    const clearSearch = useCallback(() => {
        setSearchTerm('');
    }, []);

    return (
        <main className={styles.page}>
            <h1 className={styles.pageTitle}>
                <Image
                    src="/solace.svg"
                    alt="Solace"
                    priority
                    width="0"
                    height="0"
                    className={styles.solaceLogo}
                />
                <span>Advocates</span>
            </h1>
            <div className={styles.searchBar}>
                <Input
                    label="Search"
                    onChange={onChange}
                    value={searchTerm}
                    onClear={clearSearch}
                    placeholder='John...'
                />
            </div>
            <section className={styles.tableContainer}>
                {
                    message && (
                        <div className={styles.loadMessage}>
                            {message}
                        </div>
                    )
                }
                {
                    !loading && (
                        <table className={styles.table}>
                            <thead className={styles.tableHeader}>
                                <tr>
                                    <Th>First Name</Th>
                                    <Th>Last Name</Th>
                                    <Th>City</Th>
                                    <Th>Degree</Th>
                                    <Th>Specialties</Th>
                                    <Th>Years of Experience</Th>
                                    <Th>Phone Number</Th>
                                </tr>
                            </thead>
                            <tbody>
                                {advocates.map((advocate: advocate, i) => {
                                    return (
                                        <tr key={advocate.id}>
                                            <Td>{advocate.firstName}</Td>
                                            <Td>{advocate.lastName}</Td>
                                            <Td>{advocate.city}</Td>
                                            <Td>{advocate.degree}</Td>
                                            <Td>
                                                {advocate.specialties.map((s, j) => (
                                                    <div key={s + j}>{s}</div>
                                                ))}
                                            </Td>
                                            <Td>{advocate.yearsOfExperience}</Td>
                                            <Td>{advocate.phoneNumber}</Td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )
                }
            </section>
        </main>
    );
}

function useAdvocateLoader() {
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [advocates, setAdvocates] = useState([]);

    const loadAdvocates = useCallback(async ({ searchTerm = '' } = {}) => {
        try {
            setLoading(true);
            setMessage('Loading advocates...');
            const url = '/api/advocates?searchTerm=' + searchTerm;

            const res = await Promise.all([
                axios(url),
                // - loading is too quick, so the 'loading'
                //   message is flashing and can be confusing
                //   for the end user
                // - this simulator will allow the page
                //   to load for a minimum of 500ms (even
                //   if data fetching finishes faster) so we
                //   can show the loading message properly
                //   instead of it flashing.
                // - this should make the UI/MX more intuitive
                // - if we were to use server-components, we can
                //   pre-load the data on initial render
                //   and avoid needing a spinner
                // - we could also use getInitialProps or
                //   a similar pattern to load the data on
                //   the server-side
                // - and 500ms is just short enough to not
                //   make the UI feel slow
                minimalLoadingTimeSimulator()
            ]);
            const jsonRes = res[0];

            setAdvocates(jsonRes.data.data);
            let message = '';
            if (jsonRes.data.length < 1) {
                message = 'No advocates found';
            }
            setMessage(message);
        } catch (e) {
            setMessage('Error loading advocates');
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        loading,
        message,
        advocates,
        loadAdvocates,
    };
}

type container = {
    children?: ReactNode,
}

function Th({ children }: container) {
    return (
        <th className={styles.tableCell}>
            {children}
        </th>
    );
}

function Td({ children }: container) {
    return (
        <td className={styles.tableCell}>
            {children}
        </td>
    );
}
