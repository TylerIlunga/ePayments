const config = {
  networkRequest(url, reqOptions = {}, resType = 'json') {
    reqOptions = {
      ...reqOptions,
      credentials: 'include',
    };
    return fetch(url, reqOptions)
      .then((res) => {
        if (!res.ok) {
          return {
            error: `Invalid Request to ${res.url} with status code ${res.status}`,
          };
        }
        switch (resType) {
          case 'arrayBuffer':
            return res.arrayBuffer();
          case 'blob':
            return res.blob();
          case 'formData':
            return res.formData();
          case 'text':
            return res.text();
          default:
            return res.json();
        }
      })
      .then((resolvedRes) => {
        return { data: resolvedRes };
      })
      .catch((error) => {
        return { error };
      });
  },
};

export default config;
