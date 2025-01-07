"use client";

import { useEffect, useState, useRef, useCallback } from "react";

// - this should move to a more shared location
// - keeping it here to make review easier
type advocate = {
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
    const [advocates, setAdvocates] = useState([]);
    const [filteredAdvocates, setFilteredAdvocates] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    useOnMount(() => {
        async function fetchAdvocates() {
            setMessage('Loading advocates...');
            try {
                const res = await Promise.all([
                    fetch("/api/advocates"),
                    // - loading is too quick, so the 'loading'
                    //   message is flashing and can be confusing
                    //   for the end user
                    // - this simulator will allow the page
                    //   to load for a minimum of 500ms (even
                    //   if data fetching finishes faster) so we
                    //   can show the loading message properly
                    //   instead of it flashing.
                    // - this should make the UI/MX more intuitive
                    // - and 500ms is just short enough to not
                    //   make the UI feel slow
                    minimalLoadingTimeSimulator()
                ]);

                const advocatesRes = res[0];

                if (!advocatesRes.ok) {
                    throw new Error(`Response status: ${advocatesRes.status}`);
                }

                const jsonRes = await advocatesRes.json();
                setAdvocates(jsonRes.data);
            } catch (e) {
                console.error('There was an error fetching advocates: ', e);
                setMessage("We couldn't fetch advocates. Please try again by refreshing the page")
            } finally {
                setLoading(false);
            }
        }

        fetchAdvocates();
    });

    const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    }, []);

    useDebounced(() => {
        let filteredAdvocates = advocates;

        if (searchTerm) {
            filteredAdvocates = advocates.filter((advocate: advocate) => {
                return (
                    advocate.firstName.includes(searchTerm) ||
                    advocate.lastName.includes(searchTerm) ||
                    advocate.city.includes(searchTerm) ||
                    advocate.degree.includes(searchTerm) ||
                    advocate.specialties.includes(searchTerm) ||
                    advocate.yearsOfExperience.toString().includes(searchTerm)
                );
            });
        }

        setFilteredAdvocates(filteredAdvocates);
    }, [searchTerm, advocates]);

    const onClick = useCallback(() => {
        setSearchTerm('');
    }, []);

    return (
        <main style={{ margin: "24px" }}>
            <h1>Solace Advocates</h1>
            <br />
            <br />
            <div>
                <p>Search</p>
                <p>
                    Searching for: <span>{searchTerm}</span>
                </p>
                <input
                    style={{ border: "1px solid black" }}
                    onChange={onChange}
                    value={searchTerm}
                />
                <button onClick={onClick}>Reset Search</button>
            </div>
            <br />
            <br />
            {
                loading && (
                    <div>
                        {message}
                    </div>
                )
            }
            {
                !loading && (
                    <table>
                        <thead>
                            <tr>
                                <th>First Name</th>
                                <th>Last Name</th>
                                <th>City</th>
                                <th>Degree</th>
                                <th>Specialties</th>
                                <th>Years of Experience</th>
                                <th>Phone Number</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAdvocates.map((advocate: advocate, i) => {
                                // - for the key, ideally we have an ID that's unique
                                // - for now (until I set up DB properly) I will just
                                //   use a combination of name + index
                                // - using plain index is not reliable, especially if order
                                //   can change, and can cause performance issues
                                return (
                                    <tr key={advocate.firstName + advocate.lastName + i}>
                                        <td>{advocate.firstName}</td>
                                        <td>{advocate.lastName}</td>
                                        <td>{advocate.city}</td>
                                        <td>{advocate.degree}</td>
                                        <td>
                                            {advocate.specialties.map((s, j) => (
                                                <div key={s + j}>{s}</div>
                                            ))}
                                        </td>
                                        <td>{advocate.yearsOfExperience}</td>
                                        <td>{advocate.phoneNumber}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )
            }
        </main>
    );
}
