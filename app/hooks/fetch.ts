import {useEffect, useState} from 'react';

const useFetchData = <Payload>(url: string, method: string, headers: any) => {
  const [data, setData] = useState<Payload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>();

  useEffect(() => {
    setIsLoading(true);
    fetch(url, {
      method,
      headers,
    })
      .then(r => r.json())
      .then((d: Payload) => {
        setData(d);
        setIsLoading(false);
      })
      .catch(err => {
        err.json().then((e: any) => {
          setError(e);
          setIsLoading(false);
        });
      });
  }, [url]);

  return {
    data,
    isLoading,
    error,
  };
};

// VirtualizedList: You have a large list that is slow to update - make sure your renderItem function renders components that follow React performance best practices like PureComponent, shouldComponentUpdate, etc. {"contentLength": 6652.5, "dt": 624412, "prevDt": 2127}
export {useFetchData};
