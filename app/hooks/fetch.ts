import { useEffect, useState } from "react";

const useFetchData = <Payload>(url: string, method: string, headers: any) => {
    const [data, setData] = useState<Payload | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState();

    useEffect(() => {
        fetch(url, {
            method, headers
        })
            .then(r => {
                if (!r.ok) {
                    return Promise.reject(r);
                }
                return r.json();
            })
            .then((d: Payload) => {
                setData(d)
                setIsLoading(false)
            })
            .catch(e => {
                e.json().then((json: any) => {
                    console.log(json);
                  })
            })
    }, [url])

    return {
        data,
        isLoading,
        error
    }
}

// VirtualizedList: You have a large list that is slow to update - make sure your renderItem function renders components that follow React performance best practices like PureComponent, shouldComponentUpdate, etc. {"contentLength": 6652.5, "dt": 624412, "prevDt": 2127}
export { useFetchData }


